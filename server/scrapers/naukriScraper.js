import puppeteer from 'puppeteer';
import { FetchError } from '../utils/fetchError.js';
import { truncateSummary } from '../services/jobNormalizer.js';

// ─── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = 'https://www.naukri.com';
const DELAY_MS = 2000;
const RESULTS_PER_PAGE = 20;
const PAGE_TIMEOUT = 30000;

// ─── Helpers ───────────────────────────────────────────────────────────────────

export const isNaukriEnabled = () =>
  process.env.NAUKRI_ENABLED === 'true';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Build Naukri job search URL.
 * Pattern: /keyword-jobs  or  /keyword-jobs-in-location  (page 2+ appended as -2, -3...)
 */
const buildUrl = (query, location, page) => {
  const slug = query.toLowerCase().replace(/\s+/g, '-');
  const locSlug = location
    ? `-in-${location.toLowerCase().replace(/\s+/g, '-')}`
    : '';
  const pagePart = page > 1 ? `-${page}` : '';
  return `${BASE_URL}/${slug}-jobs${locSlug}${pagePart}`;
};

const extractExternalId = (jobId, href = '') => {
  if (jobId) return String(jobId);
  const match = href.match(/-(\d{7,})$/);
  return match ? match[1] : href.replace(/[^a-z0-9]/gi, '-').slice(-40);
};

// ─── Normaliser ───────────────────────────────────────────────────────────────

const normalizeNaukriJob = (raw) => {
  const applyUrl = raw.href?.startsWith('http')
    ? raw.href
    : raw.href
      ? `${BASE_URL}${raw.href}`
      : '';

  const externalId = extractExternalId(raw.jobId, raw.href);

  const fullDescription = raw.skills?.length
    ? `${raw.summary}\n\nSkills: ${raw.skills.join(', ')}`
    : raw.summary || '';

  // Parse posted date strings like "2 days ago", "3 weeks ago", "Posted today"
  let postedAt;
  const p = (raw.postedRaw || '').toLowerCase();
  if (p.includes('today') || p.includes('just') || p.includes('hour')) {
    postedAt = new Date();
  } else {
    const numMatch = p.match(/(\d+)\s*(day|week|month)/);
    if (numMatch) {
      const n = parseInt(numMatch[1]);
      const unit = numMatch[2];
      const ms =
        unit === 'day' ? n * 86400000 :
        unit === 'week' ? n * 7 * 86400000 :
        n * 30 * 86400000;
      postedAt = new Date(Date.now() - ms);
    } else if (raw.postedRaw) {
      const parsed = Date.parse(raw.postedRaw);
      if (!isNaN(parsed)) postedAt = new Date(parsed);
    }
  }

  return {
    externalId,
    source: 'naukri',
    title: raw.title,
    company: raw.company || 'Unknown',
    location: raw.location || '',
    fullDescription,
    summary: truncateSummary(fullDescription, 300),
    applyUrl,
    postedAt,
    salary: raw.salary || '',
    employmentType: 'Full-time',
    isActive: true,
    scrapedAt: new Date(),
  };
};

// ─── Page Scraper with Puppeteer ──────────────────────────────────────────────

const scrapePage = async (page, url) => {
  console.log(`[naukri] Navigating to: ${url}`);

  await page.goto(url, { waitUntil: 'networkidle2', timeout: PAGE_TIMEOUT });

  // Wait for job cards — confirmed selector from real DOM analysis
  try {
    await page.waitForSelector('[data-job-id], .srp-jobtuple-wrapper', { timeout: 15000 });
  } catch {
    console.warn('[naukri] No job card selector found — page may be empty or blocked');
    return [];
  }

  // Dismiss cookie/login popups if present
  await page.evaluate(() => {
    document.querySelectorAll('[class*="overlay"], [class*="modal"], [class*="popup"]').forEach(el => el.remove());
  });

  // Extract jobs from DOM
  const jobs = await page.evaluate(() => {
    const results = [];

    // [data-job-id] confirmed to find 20 cards from real DOM inspection
    const cards = document.querySelectorAll('[data-job-id]');

    cards.forEach((card) => {
      try {
        // Job ID from data attribute
        const jobId = card.getAttribute('data-job-id') || '';

        // Title & URL — Naukri uses a.title inside the card
        const titleEl = card.querySelector('a.title');
        const title = titleEl?.getAttribute('title') || titleEl?.innerText?.trim() || '';
        const href = titleEl?.getAttribute('href') || '';

        if (!title || !href) return;

        // Company
        const company = card.querySelector('a.comp-name')?.innerText?.trim() ||
          card.querySelector('[class*="comp-name"]')?.innerText?.trim() || '';

        // Location — inside .location span or locWdth
        const location = card.querySelector('span.locWdth')?.innerText?.trim() ||
          card.querySelector('.location span')?.innerText?.trim() ||
          card.querySelector('[class*="location"]')?.innerText?.trim() || '';

        // Experience
        const experience = card.querySelector('span.expwdth')?.innerText?.trim() ||
          card.querySelector('[class*="experience"]')?.innerText?.trim() || '';

        // Salary
        const salary = card.querySelector('span.salWdth')?.innerText?.trim() ||
          card.querySelector('[class*="salary"]')?.innerText?.trim() || '';

        // Summary / Description
        const summary = card.querySelector('.job-desc, [class*="job-desc"]')?.innerText?.trim() || '';

        // Posted date
        const postedRaw = card.querySelector('[class*="posted"], time')?.innerText?.trim() || '';

        // Skills / Tags — ul.tags-gt > li
        const skills = [];
        card.querySelectorAll('ul.tags-gt li').forEach((sk) => {
          const text = sk.innerText?.trim();
          if (text && text.length < 50) skills.push(text);
        });

        results.push({ title, company, location, experience, salary, summary, postedRaw, skills, href, jobId });
      } catch {
        // skip individual card errors
      }
    });

    return results;
  });

  return jobs;
};

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Fetch Naukri job listings using a headless browser (Puppeteer).
 *
 * @param {object} options
 * @param {string} options.query      - Job keyword(s), e.g. "react developer"
 * @param {string} [options.location] - City/region, e.g. "bangalore"
 * @param {number} [options.pages=2]  - Number of result pages to scrape
 */
export async function fetchJobs({ query, location, pages = 2 }) {
  if (!isNaukriEnabled()) {
    console.warn('[naukri] Skipped: NAUKRI_ENABLED != true');
    return [];
  }

  const maxPages = parseInt(process.env.NAUKRI_PAGES || pages, 10);
  const results = [];

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });

    const page = await browser.newPage();

    // Set realistic browser headers
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });



    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url = buildUrl(query, location, pageNum);

      let rawJobs;
      try {
        rawJobs = await scrapePage(page, url);
      } catch (err) {
        console.error(`[naukri] Error on page ${pageNum}:`, err.message);
        break;
      }

      console.log(`[naukri] Page ${pageNum} → ${rawJobs.length} listings`);

      if (rawJobs.length === 0) break;

      for (const raw of rawJobs) {
        const normalized = normalizeNaukriJob(raw);
        if (normalized.externalId && normalized.title && normalized.applyUrl) {
          results.push(normalized);
        }
      }

      if (pageNum < maxPages) await sleep(DELAY_MS);
    }
  } catch (err) {
    throw new FetchError(`[naukri] Browser scrape failed: ${err.message}`, 500);
  } finally {
    if (browser) await browser.close();
  }

  console.log(`[naukri] Total fetched: ${results.length} jobs`);
  return results;
}
