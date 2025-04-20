// Grab the price container
const priceElement = document.getElementById('price');

// Fetch BTC price from CoinGecko
fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
  .then(response => response.json())
  .then(data => {
    // Access BTC price
    const btcPrice = data.bitcoin.usd;

    // Update popup
    priceElement.textContent = `BTC Price: $${btcPrice}`;
    const speakBtn = document.getElementById('speak-btn');

speakBtn.addEventListener('click', () => {
  const textToSpeak = priceElement.textContent;
  const speech = new SpeechSynthesisUtterance(textToSpeak);
  window.speechSynthesis.speak(speech);
});

  })
  .catch(error => {
    priceElement.textContent = 'Error fetching price';
    console.error(error);
  });
