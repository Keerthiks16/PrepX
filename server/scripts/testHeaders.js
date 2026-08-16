import axios from 'axios';
import * as cheerio from 'cheerio';

const URLS = {
  naukri: 'https://www.naukri.com/react-developer-jobs-in-bangalore',
  foundit: 'https://www.foundit.in/search/react-developer-jobs'
};

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

async function testSite(site, headers) {
  const url = URLS[site];
  console.log(`[${site}] Fetching with headers:`, JSON.stringify(headers));
  try {
    const { data, status } = await axios.get(url, { headers, timeout: 10000 });
    console.log(`[${site}] Success! Status: ${status}, Length: ${data.length}`);
    if (site === 'naukri') {
      const match = data.match(/__NEXT_DATA__/);
      console.log(`[${site}] __NEXT_DATA__ present:`, !!match);
      if (match) {
        const nextData = data.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        if (nextData) {
          try {
            const parsed = JSON.parse(nextData[1]);
            const jobs = parsed?.props?.pageProps?.dehydratedState?.queries?.[0]?.state?.data?.jobDetails || [];
            console.log(`[${site}] Jobs count in next data:`, jobs.length);
          } catch (e) {
            console.log(`[${site}] Parse error:`, e.message);
          }
        }
      }
    } else if (site === 'foundit') {
      const $ = cheerio.load(data);
      const ldScripts = $('script[type="application/ld+json"]');
      console.log(`[${site}] LD+JSON scripts count:`, ldScripts.length);
      const cards = $('.cardContainer');
      console.log(`[${site}] Cards count:`, cards.length);
    }
  } catch (err) {
    console.error(`[${site}] Failed! Status: ${err.response?.status}, Error: ${err.message}`);
  }
}

async function run() {
  for (const ua of USER_AGENTS) {
    const headers = {
      'User-Agent': ua,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0'
    };
    await testSite('foundit', headers);
    await testSite('naukri', headers);
    console.log('----------------------------------------------------');
  }
}

run();
