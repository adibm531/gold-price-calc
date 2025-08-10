const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

(async () => {
  try {
    const response = await fetch('https://www.bajus.org/gold-price');
    const body = await response.text();

    const $ = cheerio.load(body);

    // Extract prices from the page based on CSS selectors
    // Note: This depends on bajus.org HTML structure as of now and may need updates if site changes
    // From inspection, prices are in the first table with rows for karats

    const prices = {
      "22": 0,
      "21": 0,
      "18": 0,
      "traditional": 0
    };

    $('table.goldprice tr').each((i, el) => {
      const cells = $(el).find('td');
      if (cells.length >= 2) {
        const karat = $(cells[0]).text().trim().toLowerCase();
        const priceText = $(cells[1]).text().trim().replace(/[^\d.]/g, '');
        const price = parseFloat(priceText);

        if (!price) return;

        if (karat.includes('22')) prices['22'] = price;
        else if (karat.includes('21')) prices['21'] = price;
        else if (karat.includes('18')) prices['18'] = price;
        else if (karat.includes('traditional')) prices['traditional'] = price;
      }
    });

    // Write to prices.json
    fs.writeFileSync('prices.json', JSON.stringify(prices, null, 2));
    console.log('Prices updated:', prices);
  } catch (err) {
    console.error('Error scraping prices:', err);
    process.exit(1);
  }
})();
