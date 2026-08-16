import JobListing from '../models/JobListing.js';
import * as jsearchFetcher from '../fetchers/jsearchFetcher.js';
import * as adzunaFetcher from '../fetchers/adzunaFetcher.js';
import * as internshalaScraper from '../scrapers/internshalaScraper.js';
import * as naukriScraper from '../scrapers/naukriScraper.js';
import * as founditScraper from '../scrapers/founditScraper.js';
import { isFatalFetcherError } from '../utils/fetchError.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getSyncQueries = (overrideQuery) => {
  if (overrideQuery) return [overrideQuery.trim()];
  const raw = process.env.JOB_SYNC_QUERIES || 'software engineer';
  return raw.split(',').map((q) => q.trim()).filter(Boolean);
};

const getFetchers = (sourceFilter = 'all') => {
  const fetchers = [];

  if (
    (sourceFilter === 'all' || sourceFilter === 'jsearch') &&
    jsearchFetcher.isJSearchEnabled()
  ) {
    fetchers.push({ name: 'jsearch', fetch: jsearchFetcher.fetchJobs });
  }

  if (
    (sourceFilter === 'all' || sourceFilter === 'adzuna') &&
    adzunaFetcher.isAdzunaEnabled()
  ) {
    fetchers.push({ name: 'adzuna', fetch: adzunaFetcher.fetchJobs });
  }

  if (
    (sourceFilter === 'all' || sourceFilter === 'internshala') &&
    internshalaScraper.isInternshalaEnabled()
  ) {
    fetchers.push({ name: 'internshala', fetch: internshalaScraper.fetchJobs });
  }

  if (
    (sourceFilter === 'all' || sourceFilter === 'naukri') &&
    naukriScraper.isNaukriEnabled()
  ) {
    fetchers.push({ name: 'naukri', fetch: naukriScraper.fetchJobs });
  }

  if (
    (sourceFilter === 'all' || sourceFilter === 'foundit') &&
    founditScraper.isFounditEnabled()
  ) {
    fetchers.push({ name: 'foundit', fetch: founditScraper.fetchJobs });
  }

  return fetchers;
};

const upsertJob = async (job) => {
  const existing = await JobListing.findOne({
    source: job.source,
    externalId: job.externalId,
  });

  const payload = {
    ...job,
    scrapedAt: new Date(),
  };

  if (existing && existing.isActive === false) {
    delete payload.isActive;
  }

  const result = await JobListing.findOneAndUpdate(
    { source: job.source, externalId: job.externalId },
    { $set: payload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return existing ? 'updated' : 'inserted';
};

export async function syncAll(options = {}) {
  const {
    query: overrideQuery,
    location = process.env.JOB_SYNC_LOCATION || 'India',
    source = 'all',
  } = options;

  const queries = getSyncQueries(overrideQuery);
  const fetchers = getFetchers(source);

  const stats = {
    inserted: 0,
    updated: 0,
    errors: 0,
    sources: {},
  };

  if (fetchers.length === 0) {
    console.warn('[jobIngestion] No fetchers enabled. Check env configuration.');
    return stats;
  }

  for (const fetcher of fetchers) {
    stats.sources[fetcher.name] = { inserted: 0, updated: 0, errors: 0 };

    for (const query of queries) {
      try {
        const jobs = await fetcher.fetch({ query, location, page: 1 });

        for (const job of jobs) {
          try {
            const outcome = await upsertJob(job);
            stats[outcome]++;
            stats.sources[fetcher.name][outcome]++;
          } catch (err) {
            stats.errors++;
            stats.sources[fetcher.name].errors++;
            console.warn(
              `[jobIngestion] Upsert failed for ${fetcher.name}:${job.externalId}:`,
              err.message
            );
          }
        }
      } catch (err) {
        stats.errors++;
        stats.sources[fetcher.name].errors++;
        console.error(
          `[jobIngestion] Fetch failed for ${fetcher.name} query "${query}":`,
          err.message
        );

        if (isFatalFetcherError(err)) {
          const hint =
            err.status === 403
              ? 'Subscribe to JSearch on RapidAPI or set JSEARCH_ENABLED=false'
              : 'Rate limit hit — skipping remaining queries for this source';
          console.warn(`[jobIngestion] Stopping ${fetcher.name}: ${hint}`);
          break;
        }
      }

      await sleep(500);
    }
  }

  return stats;
}
