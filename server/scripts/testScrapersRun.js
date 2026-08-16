import dotenv from 'dotenv';
dotenv.config();

process.env.NAUKRI_ENABLED = 'true';
process.env.NAUKRI_PAGES = '1';
process.env.FOUNDIT_ENABLED = 'true';
process.env.FOUNDIT_PAGES = '1';

import { fetchJobs as fetchNaukri } from '../scrapers/naukriScraper.js';
import { fetchJobs as fetchFoundit } from '../scrapers/founditScraper.js';

async function test() {
  console.log('\n🔍 Testing Naukri Scraper (Puppeteer)...');
  try {
    const jobs = await fetchNaukri({ query: 'React Developer', location: 'Bangalore', pages: 1 });
    console.log(`✅ Naukri: ${jobs.length} jobs fetched`);
    if (jobs.length > 0) {
      const j = jobs[0];
      console.log(`   Sample: "${j.title}" at ${j.company} | ${j.location}`);
      console.log(`   URL: ${j.applyUrl}`);
    }
  } catch (err) {
    console.error('❌ Naukri error:', err.message);
  }

  console.log('\n🔍 Testing Foundit Scraper (Puppeteer)...');
  try {
    const jobs = await fetchFoundit({ query: 'React Developer', location: 'Bangalore', pages: 1 });
    console.log(`✅ Foundit: ${jobs.length} jobs fetched`);
    if (jobs.length > 0) {
      const j = jobs[0];
      console.log(`   Sample: "${j.title}" at ${j.company} | ${j.location}`);
      console.log(`   URL: ${j.applyUrl}`);
    }
  } catch (err) {
    console.error('❌ Foundit error:', err.message);
  }
}

test();
