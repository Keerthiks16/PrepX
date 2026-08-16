import axios from 'axios';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'appid': '109',
  'systemid': 'Starter',
  'Referer': 'https://www.naukri.com/',
  'Origin': 'https://www.naukri.com',
};

async function testNaukriApi() {
  console.log('=== Test 1: Naukri jobapi/v3/search (JSON API) ===');
  try {
    const url = 'https://www.naukri.com/jobapi/v3/search';
    const params = {
      noOfResults: 5,
      urlType: 'search_by_keyword',
      searchType: 'adv',
      keyword: 'react developer',
      location: 'bangalore',
      pageNo: 1,
    };
    const { data, status } = await axios.get(url, { headers: HEADERS, params, timeout: 10000 });
    console.log('Status:', status);
    console.log('Type of data:', typeof data);
    if (typeof data === 'object') {
      console.log('Keys:', Object.keys(data));
      if (data.jobDetails) {
        console.log('jobDetails count:', data.jobDetails.length);
        const j = data.jobDetails[0];
        console.log('\nFirst job keys:', Object.keys(j));
        console.log('Title:', j.title);
        console.log('Company:', j.companyName);
        console.log('Location:', j.placeholders && j.placeholders[0]?.value);
        console.log('Salary:', j.placeholders && j.placeholders[1]?.value);
        console.log('Experience:', j.placeholders && j.placeholders[2]?.value);
        console.log('jobId:', j.jobId);
        console.log('jdURL:', j.jdURL);
      } else {
        console.log('Data sample:', JSON.stringify(data).slice(0, 500));
      }
    } else {
      console.log('Response (first 500 chars):', String(data).slice(0, 500));
    }
  } catch (err) {
    console.error('API Error:', err.response?.status, err.message);
    if (err.response?.data) {
      console.log('Response body:', JSON.stringify(err.response.data).slice(0, 300));
    }
  }
}

async function testNaukriHtml() {
  console.log('\n=== Test 2: Naukri HTML page (cheerio fallback) ===');
  try {
    const url = 'https://www.naukri.com/react-developer-jobs-in-bangalore';
    const { data, status } = await axios.get(url, {
      headers: { ...HEADERS, Accept: 'text/html,application/xhtml+xml' },
      timeout: 10000,
    });
    console.log('Status:', status);
    console.log('HTML length:', data.length);
    // Check for __NEXT_DATA__ or server-rendered JSON blob
    const nextDataMatch = data.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nextDataMatch) {
      console.log('Found __NEXT_DATA__! Length:', nextDataMatch[1].length);
      const parsed = JSON.parse(nextDataMatch[1]);
      const jobs = parsed?.props?.pageProps?.initialState?.jobDetails || parsed?.props?.pageProps?.jobDetails;
      if (jobs) {
        console.log('Jobs found in __NEXT_DATA__:', Array.isArray(jobs) ? jobs.length : typeof jobs);
      } else {
        console.log('Top keys:', Object.keys(parsed?.props?.pageProps || {}));
      }
    } else {
      console.log('No __NEXT_DATA__ found. Checking for serp data...');
      const serpMatch = data.match(/window\.__STARTER_DATA__\s*=\s*({[\s\S]*?});/);
      if (serpMatch) {
        console.log('Found __STARTER_DATA__! Length:', serpMatch[1].length);
      }
      const ldJsonMatches = data.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
      if (ldJsonMatches) {
        console.log('Found ld+json blocks:', ldJsonMatches.length);
        console.log('Sample ld+json:', ldJsonMatches[0].slice(0, 300));
      }
    }
  } catch (err) {
    console.error('HTML Error:', err.response?.status, err.message);
  }
}

await testNaukriApi();
await testNaukriHtml();
