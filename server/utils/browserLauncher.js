/**
 * browserLauncher.js
 *
 * Unified Puppeteer launcher that works both locally and on cloud platforms
 * (Render, Railway, Lambda, etc.) by using the correct Chromium binary.
 *
 * - Local / dev:       Uses puppeteer's bundled Chromium (full, downloaded by postinstall)
 * - Production/cloud:  Uses @sparticuz/chromium (pre-compiled, stripped, cloud-optimized)
 */

const isProduction = process.env.NODE_ENV === 'production';

export async function launchBrowser() {
  if (isProduction) {
    // Cloud deployment — use sparticuz chromium
    const chromium = (await import('@sparticuz/chromium')).default;
    const puppeteerCore = (await import('puppeteer-core')).default;

    return puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    // Local development — use bundled puppeteer + its Chromium
    const puppeteer = (await import('puppeteer')).default;

    return puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  }
}
