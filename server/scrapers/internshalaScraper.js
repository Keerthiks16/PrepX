import axios from 'axios';
import * as cheerio from 'cheerio';
import { FetchError } from '../utils/fetchError.js';
import { truncateSummary } from '../services/jobNormalizer.js';

// ─── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = 'https://internshala.com';
const DELAY_MS = 1200; // polite crawl delay between pages

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  Connection: 'keep-alive',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

export const isInternshalaEnabled = () =>
  process.env.INTERNSHALA_ENABLED === 'true';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Build the search URL for Internshala jobs.
 * Internshala uses slug-based URLs:
 *   /jobs/keywords-<query>/<page>
 *   /jobs/keywords-<query>-in-<location>/<page>
 */
const buildUrl = (query, location, page) => {
  const q = encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'));
  const loc = location
    ? `-in-${encodeURIComponent(location.toLowerCase().replace(/\s+/g, '-'))}`
    : '';
  const pageSegment = page > 1 ? `/${page}` : '';
  return `${BASE_URL}/jobs/keywords-${q}${loc}${pageSegment}`;
};

/** Extract a unique external ID from the detail URL slug. */
const extractExternalId = (href = '') => {
  // e.g. /job/detail/fresher-reactjs-developer-job-in-bangalore-at-appscrip1774398609
  const match = href.match(/(\d{8,})$/);
  return match ? match[1] : href.replace(/\//g, '-').slice(-40);
};

/** Determine employment type from the detail URL path. */
const extractEmploymentType = (href = '') => {
  if (href.includes('/internship/')) return 'Internship';
  if (href.includes('/job/')) return 'Full-time';
  return '';
};

// ─── Page Parser ──────────────────────────────────────────────────────────────

/**
 * Parse a single search-results page HTML and return an array of raw job objects.
 */
const parsePage = (html) => {
  const $ = cheerio.load(html);
  const jobs = [];

  $('.individual_internship').each((_, el) => {
    try {
      const titleEl = $(el).find('a.job-title-href');
      const title = titleEl.text().trim();
      const href = titleEl.attr('href') || '';

      const company = $(el).find('p.company-name').text().trim();
      const location = $(el).find('.locations span').text().trim();
      const salary = $(el).find('span.stipend').text().trim();
      const summary = $(el).find('.about_job .text').text().trim();
      const postedRaw = $(el).find('.color-labels div').first().text().trim();

      const skills = [];
      $(el)
        .find('.job_skill')
        .each((_, sk) => skills.push($(sk).text().trim()));

      if (!title || !company || !href) return; // skip malformed cards

      jobs.push({
        title,
        company,
        location,
        salary,
        summary,
        postedRaw,
        skills,
        href,
      });
    } catch {
      // skip individual card parse errors silently
    }
  });

  return jobs;
};

// ─── Normaliser ───────────────────────────────────────────────────────────────

const normalizeInternshalaJob = (raw) => {
  const applyUrl = `${BASE_URL}${raw.href}`;
  const externalId = extractExternalId(raw.href);

  // Parse "2 weeks ago", "3 days ago", "today" → approximate Date
  let postedAt;
  const p = raw.postedRaw?.toLowerCase() || '';
  if (p.includes('today') || p.includes('just')) {
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

  const fullDescription = raw.skills.length
    ? `${raw.summary}\n\nSkills: ${raw.skills.join(', ')}`
    : raw.summary;

  return {
    externalId,
    source: 'internshala',
    title: raw.title,
    company: raw.company,
    location: raw.location,
    fullDescription,
    summary: truncateSummary(fullDescription, 300),
    applyUrl,
    postedAt,
    salary: raw.salary,
    employmentType: extractEmploymentType(raw.href),
    isActive: true,
    scrapedAt: new Date(),
  };
};

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Fetch Internshala job listings for a given query/location.
 *
 * @param {object} options
 * @param {string} options.query    - Job keyword(s), e.g. "react developer"
 * @param {string} [options.location] - City/region, e.g. "bangalore"
 * @param {number} [options.pages=2]  - Number of result pages to scrape (20 results/page)
 */
export async function fetchJobs({ query, location, pages = 2 }) {
  if (!isInternshalaEnabled()) {
    console.warn(
      '[internshala] Skipped: INTERNSHALA_ENABLED != true'
    );
    return [];
  }

  const results = [];

  for (let page = 1; page <= pages; page++) {
    const url = buildUrl(query, location, page);
    console.log(`[internshala] Fetching page ${page}: ${url}`);

    let html;
    try {
      const { data, status } = await axios.get(url, {
        headers: HEADERS,
        timeout: 15000,
      });

      if (status !== 200) {
        throw new FetchError(`HTTP ${status}`, status);
      }
      html = data;
    } catch (err) {
      if (err instanceof FetchError) throw err;
      throw new FetchError(
        `[internshala] Request failed on page ${page}: ${err.message}`,
        err.response?.status || 500
      );
    }

    const rawJobs = parsePage(html);
    console.log(`[internshala] Page ${page} → ${rawJobs.length} listings`);

    if (rawJobs.length === 0) break; // no more results

    for (const raw of rawJobs) {
      const normalized = normalizeInternshalaJob(raw);
      if (
        normalized.externalId &&
        normalized.title &&
        normalized.company &&
        normalized.applyUrl
      ) {
        results.push(normalized);
      }
    }

    if (page < pages) await sleep(DELAY_MS);
  }

  console.log(`[internshala] Total fetched: ${results.length} jobs`);
  return results;
}
