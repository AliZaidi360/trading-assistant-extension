const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');


let lastBTCPrice = null;
const priceElement = document.getElementById('btc-price');  // Make sure you have this in HTML
const PRICE_ALERT_THRESHOLD = 2;  // % change to trigger alert

sendBtn.addEventListener('click', () => {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("You", message);

  const response = jarvisBrain(message, priceElement.textContent);
  appendMessage("JARVIS", response);
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(response));

  userInput.value = "";
});


// Function to append messages to chat
function appendMessage(sender, text) {
    const msg = document.createElement('p');
    msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function saveMessageToMemory(sender, text) {
    chrome.storage.local.get(['chatHistory'], (result) => {
        let history = result.chatHistory || [];
        history.push({ sender, text });

        // Limit memory to last 10 messages
        if (history.length > 10) {
            history = history.slice(history.length - 10);
        }

        chrome.storage.local.set({ chatHistory: history });
    });
}

// Placeholder AI logic
function generateJarvisResponse(userMsg) {
    let response = "Analyzing your request...";

    if (userMsg.toLowerCase().includes("btc")) {
        response = "Bitcoin is showing strong resistance near $85,000.";
    } else if (userMsg.toLowerCase().includes("market")) {
        response = "The market is volatile today. Stay cautious!";
    } else {
        response = "I will improve with more data. For now, I suggest checking BTC trends.";
    }

    appendMessage("JARVIS", response);
    const speech = new SpeechSynthesisUtterance(response);
    window.speechSynthesis.speak(speech);
}


function fetchBTCPrice() {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
        .then(response => response.json())
        .then(data => {
            const currentPrice = data.bitcoin.usd;
            priceElement.textContent = `$${currentPrice}`;

            if (lastBTCPrice) {
                const percentChange = ((currentPrice - lastBTCPrice) / lastBTCPrice) * 100;
                if (Math.abs(percentChange) >= PRICE_ALERT_THRESHOLD) {
                    const alertMsg = `⚡ BTC price moved ${percentChange.toFixed(2)}%! Current price is $${currentPrice}`;
                    appendMessage("JARVIS", alertMsg);
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance(alertMsg));
                }
            }
            lastBTCPrice = currentPrice;
        })
        .catch(err => {
            console.error("Failed to fetch BTC price:", err);
            priceElement.textContent = "Error fetching price";
        });
}


let lastAlert = "";  // Track last news headline

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "speak-news") {
        // Check if the news is different
        if (message.text !== lastAlert) {
            lastAlert = message.text;

            // 1. Speak it
            const speech = new SpeechSynthesisUtterance(message.text);
            window.speechSynthesis.speak(speech);

            // 2. Display in Market Alerts, NOT chat
            const alertsList = document.getElementById('alerts-list');
            const listItem = document.createElement('li');
            listItem.innerHTML = `<a href="${message.url}" target="_blank">${message.text}</a>`;
            alertsList.prepend(listItem);  // Latest on top
        } else {
            console.log("⚠️ Duplicate alert ignored.");
        }
    }
});

// Initial fetch when panel opens
fetchBTCPrice();

// Refresh every 60 seconds
setInterval(fetchBTCPrice, 60000);




