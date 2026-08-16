import puppeteer from 'puppeteer';
import { FetchError } from '../utils/fetchError.js';
import { truncateSummary } from '../services/jobNormalizer.js';

// ─── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = 'https://www.foundit.in';
const DELAY_MS = 2000;
const PAGE_TIMEOUT = 30000;

// Foundit uses /srp/results with query params for search
// Pattern: /srp/results?query=react+developer&locationPreferences=Bangalore&sort=1&limit=20&start=0

// ─── Helpers ───────────────────────────────────────────────────────────────────

export const isFounditEnabled = () =>
  process.env.FOUNDIT_ENABLED === 'true';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const buildUrl = (query, location, page) => {
  const start = (page - 1) * 20;
  let url = `${BASE_URL}/srp/results?query=${encodeURIComponent(query)}&sort=1&limit=20`;
  if (location) url += `&locationPreferences=${encodeURIComponent(location)}`;
  if (start > 0) url += `&start=${start}`;
  return url;
};

const extractExternalId = (href = '') => {
  // URL format: /job/react-developer-company-name-city-JOBID
  const match = href.match(/-(\d{6,})(?:$|\/|\?)/);
  if (match) return match[1];
  return href.replace(/[^a-z0-9]/gi, '-').slice(-40);
};

// ─── Normaliser ───────────────────────────────────────────────────────────────

const normalizeFounditJob = (raw) => {
  const applyUrl = raw.href?.startsWith('http')
    ? raw.href
    : raw.href
      ? `${BASE_URL}${raw.href}`
      : '';

  const externalId = extractExternalId(raw.href);

  const fullDescription = [
    raw.summary,
    raw.experience ? `Experience: ${raw.experience}` : '',
    raw.skills?.length ? `Skills: ${raw.skills.join(', ')}` : '',
  ].filter(Boolean).join('\n\n');

  let postedAt;
  const p = (raw.postedRaw || '').toLowerCase();
  if (p.includes('today') || p.includes('just now') || p.includes('hour')) {
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
    source: 'foundit',
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
  console.log(`[foundit] Navigating to: ${url}`);

  await page.goto(url, { waitUntil: 'networkidle2', timeout: PAGE_TIMEOUT });

  // Wait for job cards — .cardContainer confirmed from real DOM inspection
  try {
    await page.waitForSelector('.cardContainer, .srpResultCard', { timeout: 15000 });
  } catch {
    console.warn('[foundit] No job card selector found — page may be empty or blocked');
    return [];
  }

  const jobs = await page.evaluate(() => {
    const results = [];

    // .cardContainer confirmed with 92 matches from real DOM inspection
    const cards = document.querySelectorAll('.cardContainer');

    cards.forEach((card) => {
      try {
        // Title & URL — .jobTitle contains the link
        const titleEl = card.querySelector('.jobTitle a, .jobTitle');
        const title = titleEl?.innerText?.trim() || '';
        const href = titleEl?.getAttribute('href') ||
          card.querySelector('a[href*="/job/"]')?.getAttribute('href') || '';

        if (!title || !href) return;

        // Company — .companyName
        const company = card.querySelector('.companyName')?.innerText?.trim() || '';

        // Card body rows contain location, experience, salary icons with text
        // Structure: .cardBody > .jobTags > spans
        const location = card.querySelector('[class*="location"], .jobTags span:nth-child(2)')?.innerText?.trim() ||
          card.querySelectorAll('.cardBody span')[1]?.innerText?.trim() || '';

        const experience = card.querySelector('[class*="experience"], .jobTags span:first-child')?.innerText?.trim() ||
          card.querySelectorAll('.cardBody span')[0]?.innerText?.trim() || '';

        const salary = card.querySelectorAll('.cardBody span')[2]?.innerText?.trim() || '';

        // Posted date — .jobAddedTime
        const postedRaw = card.querySelector('.jobAddedTime, [class*="jobAddedTime"], [class*="addedTime"]')?.innerText?.trim() || '';

        // Job description snippet
        const summary = card.querySelector('.jobDesc, [class*="jobDesc"], .snippet')?.innerText?.trim() || '';

        // Skills/tags
        const skills = [];
        card.querySelectorAll('[class*="skill"], [class*="tag"]').forEach((sk) => {
          const t = sk.innerText?.trim();
          if (t && t.length < 40 && !t.includes(' ')) skills.push(t);
        });

        results.push({ title, company, location, experience, salary, summary, skills, href, postedRaw });
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
 * Fetch Foundit job listings using a headless browser (Puppeteer).
 *
 * @param {object} options
 * @param {string} options.query      - Job keyword(s), e.g. "react developer"
 * @param {string} [options.location] - City/region, e.g. "bangalore"
 * @param {number} [options.pages=2]  - Number of result pages to scrape
 */
export async function fetchJobs({ query, location, pages = 2 }) {
  if (!isFounditEnabled()) {
    console.warn('[foundit] Skipped: FOUNDIT_ENABLED != true');
    return [];
  }

  const maxPages = parseInt(process.env.FOUNDIT_PAGES || pages, 10);
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
        console.error(`[foundit] Error on page ${pageNum}:`, err.message);
        break;
      }

      console.log(`[foundit] Page ${pageNum} → ${rawJobs.length} listings`);

      if (rawJobs.length === 0) break;

      for (const raw of rawJobs) {
        const normalized = normalizeFounditJob(raw);
        if (normalized.externalId && normalized.title && normalized.applyUrl) {
          results.push(normalized);
        }
      }

      if (pageNum < maxPages) await sleep(DELAY_MS);
    }
  } catch (err) {
    throw new FetchError(`[foundit] Browser scrape failed: ${err.message}`, 500);
  } finally {
    if (browser) await browser.close();
  }

  console.log(`[foundit] Total fetched: ${results.length} jobs`);
  return results;
}
