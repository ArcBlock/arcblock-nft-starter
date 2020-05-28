const axios = require('axios');

let exchangeRate = 196.550016;

async function fetchLatest() {
  try {
    const api =
      'https://openexchangerates.org/api/latest.json?app_id=14fe3170680d4cad96348d51f18c94a3&base=USD&symbols=LRD';
    const { data } = await axios.get(api);
    if (data.rates.LRD) {
      exchangeRate = data.rates.LRD;
    }
  } catch (err) {}
}

module.exports = {
  getExchangeRate: () => exchangeRate,
  fetchLatest,
};
