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

// Receive message from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "speak-news") {
    console.log("🧠 Incoming message from background:", message.text);
    const speech = new SpeechSynthesisUtterance(message.text);
    window.speechSynthesis.speak(speech);
  }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "speak-news") {
    const speech = new SpeechSynthesisUtterance(message.text);
    window.speechSynthesis.speak(speech);

    // Also update clickable headline
    const linkElement = document.getElementById('news-link');
    linkElement.textContent = message.text;
    linkElement.href = message.url || "#";
  }
});
 
