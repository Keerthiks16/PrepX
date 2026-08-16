import { normalizeAdzunaJob } from '../services/jobNormalizer.js';
import { FetchError } from '../utils/fetchError.js';

export const isAdzunaEnabled = () =>
  process.env.ADZUNA_ENABLED === 'true' &&
  Boolean(process.env.ADZUNA_APP_ID) &&
  Boolean(process.env.ADZUNA_APP_KEY);

export async function fetchJobs({ query, location, page = 1 }) {
  if (!isAdzunaEnabled()) {
    console.warn('[adzuna] Skipped: ADZUNA_ENABLED or credentials not configured');
    return [];
  }

  const country = process.env.ADZUNA_COUNTRY || 'in';
  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID,
    app_key: process.env.ADZUNA_APP_KEY,
    what: query,
    results_per_page: '20',
  });

  if (location) {
    params.set('where', location);
  }

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();
    throw new FetchError(`Adzuna API error ${response.status}: ${body}`, response.status);
  }

  const data = await response.json();
  const jobs = (data.results || [])
    .map(normalizeAdzunaJob)
    .filter(Boolean);

  return jobs;
}
