import puppeteer from 'puppeteer';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const ARTIFACT_DIR = 'C:\\Users\\Keerthik Shetty\\.gemini\\antigravity-ide\\brain\\d16dab55-8745-46d3-b8e6-5993525740b0';

async function debugSite(name, url, waitSelector) {
  console.log(`\n📸 Debugging ${name}...`);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  );

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000)); // extra settle time

    // Screenshot
    await page.screenshot({ path: `${ARTIFACT_DIR}\\${name}_screenshot.png`, fullPage: false });
    console.log(`  ✅ Screenshot saved`);

    // Get all class names from elements that might be job cards
    const analysis = await page.evaluate(() => {
      // Get all unique classes on div/article/li elements
      const allClasses = new Set();
      document.querySelectorAll('div, article, li, section').forEach(el => {
        (el.className || '').split(' ').forEach(c => {
          if (c.trim()) allClasses.add(c.trim());
        });
      });

      // Find likely job-related classes
      const jobClasses = Array.from(allClasses).filter(c =>
        c.toLowerCase().match(/job|card|tuple|listing|result|srp|vacancy/)
      ).slice(0, 30);

      // Get page title and h1
      const title = document.title;
      const h1 = document.querySelector('h1')?.innerText?.slice(0, 100) || '';

      // Try common selectors and report count
      const selectors = [
        'article', '[class*="jobTuple"]', '[class*="job-card"]',
        '[class*="jobCard"]', '[class*="card"]', '[class*="result"]',
        '[class*="listing"]', '[class*="vacancy"]', '[class*="srp"]',
        '.nI-gNb-Jobs', '[data-job-id]', '[data-jobid]',
      ];
      const counts = {};
      selectors.forEach(s => {
        try { counts[s] = document.querySelectorAll(s).length; } catch {}
      });

      // Get first 2000 chars of body text
      const bodyText = document.body?.innerText?.slice(0, 500) || '';

      return { title, h1, jobClasses, counts, bodyText };
    });

    console.log(`  Title: ${analysis.title}`);
    console.log(`  H1: ${analysis.h1}`);
    console.log(`  Body preview: ${analysis.bodyText.replace(/\n/g, ' ').slice(0, 200)}`);
    console.log(`  Job-related classes:`, analysis.jobClasses);
    console.log(`  Selector counts:`, analysis.counts);

    // Also dump raw HTML of the main content area
    const mainHtml = await page.evaluate(() => {
      const main = document.querySelector('main, #root, #app, body');
      return (main?.innerHTML || document.body?.innerHTML || '').slice(0, 5000);
    });
    fs.writeFileSync(`${ARTIFACT_DIR}\\${name}_dom.html`, mainHtml);
    console.log(`  ✅ DOM dump saved`);

  } catch (err) {
    console.error(`  ❌ Error:`, err.message);
  } finally {
    await browser.close();
  }
}

async function run() {
  await debugSite('naukri', 'https://www.naukri.com/react-developer-jobs-in-bangalore');
  await debugSite('foundit', 'https://www.foundit.in/srp/results?query=React+Developer&sort=1&limit=20&locationPreferences=Bangalore');
}

run();
