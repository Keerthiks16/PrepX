import axios from 'axios';
import * as cheerio from 'cheerio';
import { FetchError } from '../utils/fetchError.js';
import { launchBrowser } from '../utils/browserLauncher.js';
import { truncateSummary } from '../services/jobNormalizer.js';

const BASE_URL = 'https://www.naukri.com';
const DELAY_MS = 1500;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Cache-Control': 'max-age=0'
};

export const isNaukriEnabled = () => process.env.NAUKRI_ENABLED === 'true';

// Debug helper – prints env and launch info
const logEnvAndLaunch = async () => {
  console.info('[naukri-debug] NAUKRI_ENABLED =', process.env.NAUKRI_ENABLED);
  console.info('[naukri-debug] NODE_ENV =', process.env.NODE_ENV);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Format the query and location into a Naukri slug URL.
 * e.g. /react-developer-jobs-in-bangalore or /react-developer-jobs
 */
const buildUrl = (query, location, page) => {
  const q = encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'));
  const loc = location ? `-in-${encodeURIComponent(location.toLowerCase().replace(/\s+/g, '-'))}` : '';
  const pageSuffix = page > 1 ? `-${page}` : '';
  return `${BASE_URL}/${q}-jobs${loc}${pageSuffix}`;
};

/**
 * Parses Next.js RSC payload stream fragments from script blocks and extracts the srpState search response.
 */
const extractSearchResponse = (html) => {
  const $ = cheerio.load(html);

  // 1️⃣ Try original self.__next_f.push payload (used locally)
  let nextPayload = '';
  $('script:not([src])').each((_, el) => {
    const content = $(el).html() || '';
    if (content.includes('self.__next_f.push')) {
      nextPayload += content;
    }
  });
  if (nextPayload) {
    const unescaped = nextPayload.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    const searchRespRegex = /"searchResp"\s*:\s*(\{.+?\})(?=\s*,\s*"fatFooter")/s;
    const match = unescaped.match(searchRespRegex);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch (e) {
        console.warn('[naukri] Failed to parse searchResp JSON (self payload):', e.message);
      }
    }
  }

  // 2️⃣ Fallback: look for Next.js __NEXT_DATA__ script tag
  const nextDataScript = $('#__NEXT_DATA__').html();
  if (nextDataScript) {
    try {
      const parsed = JSON.parse(nextDataScript);
      // The shape may vary; common path is props.pageProps.searchResp
      const resp = parsed?.props?.pageProps?.searchResp;
      if (resp) return resp;
    } catch (e) {
      console.warn('[naukri] Failed to parse __NEXT_DATA__ JSON:', e.message);
    }
  }

  // 3️⃣ Last resort: directly scrape job cards using the selector we wait for
  const cards = $('[data-job-id]');
  if (cards.length) {
    // Build a minimal structure compatible with the rest of the pipeline
    const jobDetails = cards.map((_, el) => $(el).data()).get();
    return { jobDetails };
  }

  // If none of the above worked, return null so the caller can log a warning
  return null;
};

const normalizeNaukriJob = (raw) => {
  const externalId = String(raw.jobId);
  const applyUrl = raw.jdURL?.startsWith('http') ? raw.jdURL : `${BASE_URL}${raw.jdURL || ''}`;
  const fullDescription = raw.jobDescription || '';

  const location = raw.placeholders?.find(p => p.type === 'location')?.label || '';
  const salary = raw.placeholders?.find(p => p.type === 'salary')?.label || '';
  const experience = raw.placeholders?.find(p => p.type === 'experience')?.label || '';

  // Determine posted date
  let postedAt;
  const p = raw.footerPlaceholderLabel?.toLowerCase() || ''; // e.g. "Just now", "2 days ago", "15 days ago"
  if (p.includes('today') || p.includes('just') || p.includes('now')) {
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
    }
  }

  const descWithSkills = raw.tagsAndSkills
    ? `${fullDescription}\n\nSkills: ${raw.tagsAndSkills}`
    : fullDescription;

  return {
    externalId,
    source: 'naukri',
    title: raw.title?.trim() || '',
    company: raw.companyName?.trim() || 'Unknown',
    location: location.trim(),
    fullDescription: descWithSkills.trim(),
    summary: truncateSummary(descWithSkills, 300),
    applyUrl,
    postedAt,
    salary: salary.trim(),
    employmentType: experience ? `${experience} Exp` : '',
    isActive: true,
    scrapedAt: new Date(),
  };
};

/**
 * Fetch Naukri jobs for query/location.
 */
export async function fetchJobs({ query, location, pages = 1 }) {
  if (!isNaukriEnabled()) {
    console.warn('[naukri] Skipped: NAUKRI_ENABLED != true');
    return [];
  }

  const results = [];

  // Iterate over pages
  for (let page = 1; page <= pages; page++) {
    const url = buildUrl(query, location, page);
    console.info('[naukri-debug] Fetching page', page, 'URL:', url);

    try {
      // Launch browser (production uses sparticuz chromium)
      const browser = await launchBrowser();
      const puppeteerPage = await browser.newPage();
      console.info('[naukri-debug] Browser launched, navigating...');
      await puppeteerPage.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait for job cards to appear – use the selector we discovered
      await puppeteerPage.waitForSelector('[data-job-id]', { timeout: 15000 }).catch(() => {
        console.warn('[naukri-debug] Selector [data-job-id] not found within timeout');
      });

      const html = await puppeteerPage.content();
      console.info('[naukri-debug] HTML snippet (first 300 chars):', html.slice(0, 300).replace(/\n/g, ''));

      // Save a screenshot for remote debugging (Render keeps /tmp for the life of the process)
      const screenshotPath = `/tmp/naukri_page_${page}.png`;
      await puppeteerPage.screenshot({ path: screenshotPath, fullPage: true });
      console.info('[naukri-debug] Screenshot saved to', screenshotPath);

      // Extract jobs from the page content using the existing extractSearchResponse function
      const searchResp = extractSearchResponse(html);
      if (!searchResp || !searchResp.jobDetails) {
        console.warn(`[naukri-debug] No jobDetails extracted on page ${page}`);
        await browser.close();
        break;
      }

      const rawJobs = searchResp.jobDetails;
      console.info(`[naukri-debug] Page ${page} → ${rawJobs.length} raw job entries`);

      for (const raw of rawJobs) {
        const normalized = normalizeNaukriJob(raw);
        if (normalized.externalId && normalized.title && normalized.company) {
          results.push(normalized);
        }
      }

      await browser.close();
    } catch (err) {
      console.error(`[naukri-debug] Error on page ${page}:`, err);
      throw err;
    }

    if (page < pages) await sleep(DELAY_MS);
  }

  console.log(`[naukri] Total fetched: ${results.length} jobs`);
  return results;
}
