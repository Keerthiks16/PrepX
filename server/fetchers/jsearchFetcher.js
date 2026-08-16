import { normalizeJSearchJob } from '../services/jobNormalizer.js';
import { FetchError } from '../utils/fetchError.js';

const JSEARCH_HOST = 'jsearch.p.rapidapi.com';
const JSEARCH_URL = `https://${JSEARCH_HOST}/search`;

export const isJSearchEnabled = () =>
  process.env.JSEARCH_ENABLED === 'true' && Boolean(process.env.RAPIDAPI_KEY);

export async function fetchJobs({ query, location, page = 1 }) {
  if (!isJSearchEnabled()) {
    console.warn('[jsearch] Skipped: JSEARCH_ENABLED or RAPIDAPI_KEY not configured');
    return [];
  }

  const searchQuery = location ? `${query} in ${location}` : query;
  const params = new URLSearchParams({
    query: searchQuery,
    page: String(page),
    num_pages: '1',
    country: process.env.JSEARCH_COUNTRY || 'in',
  });

  const response = await fetch(`${JSEARCH_URL}?${params}`, {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': JSEARCH_HOST,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new FetchError(`JSearch API error ${response.status}: ${body}`, response.status);
  }

  const data = await response.json();
  const jobs = (data.data || [])
    .map(normalizeJSearchJob)
    .filter(Boolean);

  return jobs;
}
