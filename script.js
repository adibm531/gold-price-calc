const PRICE_JSON = 'prices.json';

// Constants for conversions
const GRAMS_PER_BHORI = 11.664;
const GRAMS_PER_ANA = 0.729;

let prices = {};

async function loadPrices() {
  try {
    const res = await fetch(PRICE_JSON + '?cache=' + Date.now());
    prices = await res.json();
    displayPrices();
  } catch (err) {
    console.error('Failed to load prices:', err);
    document.getElementById('price-table-body').innerHTML = '<tr><td colspan="4">Failed to load prices</td></tr>';
  }
}

function displayPrices() {
  const tbody = document.getElementById('price-table-body');
  tbody.innerHTML = '';

  for (const key of ['22', '21', '18', 'traditional']) {
    const priceGram = prices[key];
    if (!priceGram) continue;

    const priceAna = priceGram * GRAMS_PER_ANA;
    const priceBhori = priceGram * GRAMS_PER_BHORI;

    const karatName = key === 'traditional' ? 'Traditional' : key + 'K';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${karatName}</td>
      <td>${priceGram.toFixed(2)}</td>
      <td>${priceAna.toFixed(2)}</td>
      <td>${priceBhori.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  }
}

function calculatePrice(amount, unit, karat) {
  let priceGram = prices[karat];
  if (!priceGram) return null;

  let grams = 0;
  switch (unit) {
    case 'gram':
      grams = amount;
      break;
    case 'ana':
      grams = amount * GRAMS_PER_ANA;
      break;
    case 'bhori':
      grams = amount * GRAMS_PER_BHORI;
      break;
  }

  return grams * priceGram;
}

document.getElementById('calc-form').addEventListener('submit', e => {
  e.preventDefault();

  const karat = document.getElementById('karat').value;
  const unit = document.getElementById('unit').value;
  const amount = parseFloat(document.getElementById('amount').value);

  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount');
    return;
  }

  const price = calculatePrice(amount, unit, karat);
  if (price === null) {
    alert('Price data not available for selected karat');
    return;
  }

  document.getElementById('result').textContent = `Price: BDT ${price.toFixed(2)}`;
});

window.onload = loadPrices;
