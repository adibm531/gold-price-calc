const PRICE_JSON = 'prices.json';

// Constants for conversions
const GRAMS_PER_BHORI = 11.664;
const GRAMS_PER_ANA = 0.729;

let prices = {};
let currentSort = { index: null, asc: true };

async function loadPrices() {
  try {
    const res = await fetch(PRICE_JSON + '?cache=' + Date.now());
    prices = await res.json();
    displayPrices();
    makeHeadersSortable();
  } catch (err) {
    console.error('Failed to load prices:', err);
    document.getElementById('price-table-body').innerHTML = '<tr><td colspan="4">Failed to load prices</td></tr>';
  }
}

function displayPrices(sortedArray) {
  const tbody = document.getElementById('price-table-body');
  tbody.innerHTML = '';

  // Prepare data array
  let data = [];
  for (const key of ['22', '21', '18', 'traditional']) {
    const priceGram = prices[key];
    if (!priceGram) continue;

    data.push({
      karat: key === 'traditional' ? 'Traditional' : key + 'K',
      gram: priceGram,
      ana: priceGram * GRAMS_PER_ANA,
      bhori: priceGram * GRAMS_PER_BHORI,
    });
  }

  if (sortedArray) data = sortedArray;

  for (const row of data) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.karat}</td>
      <td>${row.gram.toFixed(2)}</td>
      <td>${row.ana.toFixed(2)}</td>
      <td>${row.bhori.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  }
}

function makeHeadersSortable() {
  const headers = document.querySelectorAll('thead th');
  headers.forEach((th, idx) => {
    th.style.cursor = 'pointer';
    th.onclick = () => {
      sortTableByColumn(idx);
    };
  });
}

function sortTableByColumn(index) {
  // Toggle sorting direction if same column clicked
  if (currentSort.index === index) {
    currentSort.asc = !currentSort.asc;
  } else {
    currentSort.index = index;
    currentSort.asc = true;
  }

  // Prepare data array same as displayPrices
  let data = [];
  for (const key of ['22', '21', '18', 'traditional']) {
    const priceGram = prices[key];
    if (!priceGram) continue;

    data.push({
      karat: key === 'traditional' ? 'Traditional' : key + 'K',
      gram: priceGram,
      ana: priceGram * GRAMS_PER_ANA,
      bhori: priceGram * GRAMS_PER_BHORI,
    });
  }

  // Sort data by clicked column
  data.sort((a, b) => {
    let valA, valB;

    switch (index) {
      case 0: // Karat column (string)
        valA = a.karat.toLowerCase();
        valB = b.karat.toLowerCase();
        return currentSort.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      case 1: // Gram column (number)
        valA = a.gram;
        valB = b.gram;
        break;
      case 2: // Ana column (number)
        valA = a.ana;
        valB = b.ana;
        break;
      case 3: // Bhori column (number)
        valA = a.bhori;
        valB = b.bhori;
        break;
      default:
        return 0;
    }

    return currentSort.asc ? valA - valB : valB - valA;
  });

  displayPrices(data);
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
