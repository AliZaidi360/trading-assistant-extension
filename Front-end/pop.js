const priceElement = document.getElementById('price');

fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
  .then(response => response.json())
  .then(data => {
    const btcPrice = data.bitcoin.usd;
    priceElement.textContent = `$${btcPrice}`;
  })
  .catch(error => {
    priceElement.textContent = 'Error fetching price';
    console.error(error);
  });
