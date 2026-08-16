import axios from 'axios';
import fs from 'fs';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Referer': 'https://www.naukri.com/',
  'Cache-Control': 'max-age=0',
};

async function dump() {
  const url = 'https://www.naukri.com/react-developer-jobs-in-bangalore';
  try {
    const { data } = await axios.get(url, { headers: HEADERS });
    fs.writeFileSync('C:\\Users\\Keerthik Shetty\\.gemini\\antigravity-ide\\brain\\d16dab55-8745-46d3-b8e6-5993525740b0\\naukri_response.html', data);
    console.log('Dumped. Length:', data.length);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
dump();
