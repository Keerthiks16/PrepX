import axios from 'axios';
import * as cheerio from 'cheerio';
import { FetchError } from '../utils/fetchError.js';
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
  let nextPayload = '';

  $('script:not([src])').each((_, el) => {
    const content = $(el).html() || '';
    if (content.includes('self.__next_f.push')) {
      nextPayload += content;
    }
  });

  if (!nextPayload) return null;

  // Unescape strings and search for srpState/searchResp JSON
  // Next.js serializes data by escaping quote marks. Let's do a regex search for the searchResp block.
  const searchRespRegex = /"searchResp"\s*:\s*(\{.+?\})(?=\s*,\s*"fatFooter")/s;
  
  // Also try a broader regex if the response is inline or formatted slightly differently
  const unescaped = nextPayload.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  const match = unescaped.match(searchRespRegex);
  
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.warn('[naukri] Failed to parse searchResp JSON regex match:', e.message);
    }
  }

  // Fallback: Regex for job details arrays or direct patterns if searchResp structure changed
  const jobDetailsRegex = /"jobDetails"\s*:\s*(\[.+?\])\s*,\s*"fatFooter"/s;
  const matchDetails = unescaped.match(jobDetailsRegex);
  if (matchDetails) {
    try {
      return { jobDetails: JSON.parse(matchDetails[1]) };
    } catch (e) {
      console.warn('[naukri] Failed to parse jobDetails JSON fallback match:', e.message);
    }
  }

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

  for (let page = 1; page <= pages; page++) {
    const url = buildUrl(query, location, page);
    console.log(`[naukri] Fetching page ${page}: ${url}`);

    try {
      const { data, status } = await axios.get(url, {
        headers: HEADERS,
        timeout: 15000,
      });

      if (status !== 200) {
        throw new FetchError(`HTTP ${status}`, status);
      }

      const searchResp = extractSearchResponse(data);
      if (!searchResp || !searchResp.jobDetails) {
        console.warn(`[naukri] Could not extract search response on page ${page}`);
        break;
      }

      const rawJobs = searchResp.jobDetails;
      console.log(`[naukri] Page ${page} → ${rawJobs.length} listings`);

      if (rawJobs.length === 0) break;

      for (const raw of rawJobs) {
        const normalized = normalizeNaukriJob(raw);
        if (normalized.externalId && normalized.title && normalized.company) {
          results.push(normalized);
        }
      }

    } catch (err) {
      if (err instanceof FetchError) throw err;
      throw new FetchError(
        `[naukri] Request failed on page ${page}: ${err.message}`,
        err.response?.status || 500
      );
    }

    if (page < pages) await sleep(DELAY_MS);
  }

  console.log(`[naukri] Total fetched: ${results.length} jobs`);
  return results;
}
