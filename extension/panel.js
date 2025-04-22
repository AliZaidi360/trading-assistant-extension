// panel.js

const priceElement = document.getElementById('price');
const speakBtn = document.getElementById('speak-btn');

// Fetch BTC price
fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
  .then(res => res.json())
  .then(data => {
    const btcPrice = data.bitcoin.usd;
    priceElement.textContent = `BTC Price: $${btcPrice}`;
  })
  .catch(err => {
    priceElement.textContent = 'Error fetching price';
    console.error(err);
  });

// Speak button logic
speakBtn.addEventListener('click', () => {
  const speech = new SpeechSynthesisUtterance(priceElement.textContent);
  window.speechSynthesis.speak(speech);
});

// Single listener for background news
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "speak-news") {
    // 1) Speak it aloud
    const speech = new SpeechSynthesisUtterance(message.text);
    window.speechSynthesis.speak(speech);

    // 2) Update your clickable link
    const linkEl = document.getElementById('news-link');
    if (linkEl) {
      linkEl.textContent = message.text;
      linkEl.href         = message.url || '#';
      linkEl.target       = '_blank';
    }
  }
});

