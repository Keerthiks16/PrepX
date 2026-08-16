import axios from 'axios';
import * as cheerio from 'cheerio';

async function testInternshala() {
  try {
    const url = 'https://internshala.com/jobs/keywords-reactjs';
    console.log(`Fetching ${url}...`);
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    console.log('Page fetched successfully!');
    const $ = cheerio.load(data);

    // Internshala jobs have container: .individual_internship
    const containers = $('.individual_internship');
    console.log(`Found ${containers.length} containers with '.individual_internship'`);

    if (containers.length === 0) {
      // Let's find any div that contains job data or search for other classes
      console.log('Trying fallback selectors...');
      const divs = $('div');
      const classes = new Set();
      divs.each((i, el) => {
        const cls = $(el).attr('class');
        if (cls) cls.split(/\s+/).forEach(c => classes.add(c));
      });
      console.log('Some classes on page:', Array.from(classes).slice(0, 50));
    } else {
      containers.each((i, el) => {
        if (i < 3) {
          console.log(`\n--- Card ${i + 1} ---`);
          const title = $(el).find('a.job-title-href').text().trim();
          const company = $(el).find('p.company-name').text().trim();
          const location = $(el).find('.locations span').text().trim();
          const salary = $(el).find('span.stipend').text().trim();
          const relativeUrl = $(el).find('a.job-title-href').attr('href');
          const detailUrl = relativeUrl ? `https://internshala.com${relativeUrl}` : '';
          const summary = $(el).find('.about_job .text').text().trim();
          const postedAt = $(el).find('.color-labels div').text().trim();

          console.log('Title:', title);
          console.log('Company:', company);
          console.log('Location:', location);
          console.log('Salary/Stipend:', salary);
          console.log('Detail URL:', detailUrl);
          console.log('Summary (Snippet):', summary.slice(0, 100) + '...');
          console.log('Posted At:', postedAt);
        }
      });
    }

  } catch (error) {
    console.error('Error fetching Internshala:', error.message);
  }
}

testInternshala();
