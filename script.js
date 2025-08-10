// Constants for conversions
const GRAMS_PER_BHORI = 11.664;
const GRAMS_PER_ANA = 0.729;

// Keys for localStorage
const STORAGE_KEY = 'goldPrices';

let prices = {
  "22": 0,
  "21": 0,
  "18": 0,
  "traditional": 0
};

// Load prices from localStorage or use defaults
function loadPricesFromStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      prices = JSON.parse(stored);
    } catch {
      // ignore parse errors and keep defaults
    }
  }
}

// Save prices to localStorage
function savePricesToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prices));
}

// Update the table display
function displayPrices() {
  const tbody = document.getElementById('price-table-body');
  tbody.innerHTML = '';

  for (const key of ['22', '21', '18', 'traditional']) {
    const priceGram = prices[key] || 0;

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

// Calculator logic
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

// Handle calculator form submit
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

// Handle price update form submit
document.getElementById('price-update-form').addEventListener('submit', e => {
  e.preventDefault();

  // Read inputs
  prices['22'] = parseFloat(document.getElementById('price-22').value) || 0;
  prices['21'] = parseFloat(document.getElementById('price-21').value) || 0;
  prices['18'] = parseFloat(document.getElementById('price-18').value) || 0;
  prices['traditional'] = parseFloat(document.getElementById('price-traditional').value) || 0;

  savePricesToStorage();
  displayPrices();

  document.getElementById('update-msg').textContent = 'Prices updated successfully!';
  setTimeout(() => { document.getElementById('update-msg').textContent = ''; }, 3000);
});

// On page load
window.onload = () => {
  loadPricesFromStorage();
  displayPrices();

  // Pre-fill the update form inputs with current prices
  document.getElementById('price-22').value = prices['22'];
  document.getElementById('price-21').value = prices['21'];
  document.getElementById('price-18').value = prices['18'];
  document.getElementById('price-traditional').value = prices['traditional'];
};
