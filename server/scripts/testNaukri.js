import axios from 'axios';
import * as cheerio from 'cheerio';

async function testNaukri() {
  try {
    const url = 'https://www.naukri.com/react-developer-jobs-in-bangalore';
    console.log(`Fetching ${url}...`);
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    const $ = cheerio.load(data);
    let fullPayload = '';

    $('script:not([src])').each((i, el) => {
      const content = $(el).html() || '';
      if (content.includes('self.__next_f.push')) {
        fullPayload += content;
      }
    });

    console.log(`Found self.__next_f.push payload. Length: ${fullPayload.length}`);

    // Let's search for keywords inside the payload
    const jobIdMatches = [...fullPayload.matchAll(/"jobId":"?(\d+)"?/g)];
    console.log(`Found ${jobIdMatches.length} jobId matches in the payload.`);

    if (jobIdMatches.length > 0) {
      console.log('Sample matching job IDs:', jobIdMatches.slice(0, 10).map(m => m[1]));
    }

    // Let's try to extract all matches of a JSON-like job structure or string snippets
    // In RSC payload, strings are escaped. Let's unescape and find text.
    const unescaped = fullPayload.replace(/\\"/g, '"').replace(/\\/g, '');
    
    // Search for company names and titles
    const companyMatches = [...unescaped.matchAll(/"companyName":"([^"]+)"/g)];
    const titleMatches = [...unescaped.matchAll(/"title":"([^"]+)"/g)];

    console.log(`Found ${companyMatches.length} companyName matches.`);
    console.log(`Found ${titleMatches.length} title matches.`);

    companyMatches.slice(0, 5).forEach((m, idx) => {
      console.log(`Company ${idx+1}: ${m[1]}`);
    });
    titleMatches.slice(0, 5).forEach((m, idx) => {
      console.log(`Title ${idx+1}: ${m[1]}`);
    });

  } catch (error) {
    console.error('Error fetching Naukri:', error.message);
  }
}

testNaukri();
