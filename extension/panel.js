const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const priceElement = document.getElementById('btc-price');

let lastBTCPrice = null;
const PRICE_ALERT_THRESHOLD = 2;  // % change to trigger alert

// Load Memory on Panel Open
chrome.storage.local.get(['chatHistory'], (result) => {
    const history = result.chatHistory || [];
    if (history.length > 0) {
        appendMessage("JARVIS", "👋 Welcome back! Here's where we left off:");
        history.forEach(item => {
            appendMessage(item.sender, item.text);
        });
    } else {
        appendMessage("JARVIS", "Hello! I'm JARVIS, ready to assist with trading.");
    }
});

// Handle Sending Message
sendBtn.addEventListener('click', () => {
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage("You", message);

    const response = jarvisBrain(message, priceElement.textContent);
    appendMessage("JARVIS", response);
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(response));

    saveMessageToMemory("You", message);
    saveMessageToMemory("JARVIS", response);

    userInput.value = "";
});
chrome.storage.local.get(['chatHistory'], (result) => {
    const history = result.chatHistory || [];
    if (history.length > 0) {
        appendMessage("JARVIS", "👋 Welcome back! Here's where we left off:");
        history.forEach(item => {
            appendMessage(item.sender, item.text);
        });
    } else {
        appendMessage("JARVIS", "Hello! I'm JARVIS, ready to assist with trading.");
    }
});


// Append message to chat box
function appendMessage(sender, text) {
    const msg = document.createElement('p');
    msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Save chat messages to chrome storage
function saveMessageToMemory(sender, text) {
    chrome.storage.local.get(['chatHistory'], (result) => {
        let history = result.chatHistory || [];
        history.push({ sender, text });

        if (history.length > 10) {
            history = history.slice(history.length - 10);
        }

        chrome.storage.local.set({ chatHistory: history });
    });
}

// Fetch BTC Price
function fetchBTCPrice() {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
        .then(response => response.json())
        .then(data => {
            const currentPrice = data.bitcoin.usd;
            priceElement.textContent = `$${currentPrice}`;

            if (lastBTCPrice) {
                const percentChange = ((currentPrice - lastBTCPrice) / lastBTCPrice) * 100;
                if (Math.abs(percentChange) >= PRICE_ALERT_THRESHOLD) {
                    const alertMsg = `⚡ BTC price moved ${percentChange.toFixed(2)}%! Now at $${currentPrice}`;
                    appendMessage("JARVIS", alertMsg);
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance(alertMsg));
                    updateContext({ btcChange: percentChange.toFixed(2) });
                }
            }
            lastBTCPrice = currentPrice;
        })
        .catch(err => {
            console.error("Failed to fetch BTC price:", err);
            priceElement.textContent = "Error fetching price";
        });
}

// Initial fetch + Auto-refresh
fetchBTCPrice();
setInterval(fetchBTCPrice, 60000);

// Listen to background news
let lastAlert = "";
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "speak-news") {
        if (message.text !== lastAlert) {
            lastAlert = message.text;
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(message.text));
            const alertsList = document.getElementById('alerts-list');
            const listItem = document.createElement('li');
            listItem.innerHTML = `<a href="${message.url}" target="_blank">${message.text}</a>`;
            alertsList.prepend(listItem);
            updateContext({ latestNews: message.text });
        }
    }
});
