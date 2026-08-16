import { fetchJobs } from '../scrapers/internshalaScraper.js';
const jobs = await fetchJobs({ query: 'react developer', location: 'bangalore', pages: 1 });
console.log(`\nTotal normalized jobs: ${jobs.length}`);
jobs.slice(0, 3).forEach((j, i) => {
  console.log(`\n[${i+1}] ${j.title} @ ${j.company}`);
  console.log(`    Source: ${j.source} | externalId: ${j.externalId}`);
  console.log(`    Location: ${j.location}`);
  console.log(`    Salary: ${j.salary || 'N/A'} | Type: ${j.employmentType}`);
  console.log(`    URL: ${j.applyUrl}`);
  console.log(`    Summary: ${(j.summary||'').slice(0, 80)}...`);
});
