const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const priceElement = document.getElementById('btc-price');

let lastBTCPrice = null;
const PRICE_ALERT_THRESHOLD = 2;  // % change to trigger alert



// Append message to chat box
function appendMessage(sender, text) {
    const msg = document.createElement('p');
    msg.className = sender === "You" ? "user-msg" : "jarvis-msg";
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
                    const alertMsg = `BTC price moved ${percentChange.toFixed(2)}%! Now at $${currentPrice}`;
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
sendBtn.addEventListener('click', async () => {
    const message = userInput.value.trim();
    if (!message) return;
  
    appendMessage("You", message);
  
    try {
      const aiReply = await queryAI(message);
      appendMessage("JARVIS", aiReply);
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(aiReply));
      saveMessageToMemory("You", message);
      saveMessageToMemory("JARVIS", aiReply);
    } catch (err) {
      console.error("AI fetch failed:", err);
      appendMessage("JARVIS", "Something went wrong while contacting my brain.");
    }
  
    userInput.value = "";
  });
  


chrome.storage.local.get(['chatHistory'], (result) => {
    const history = result.chatHistory || [];
    if (history.length > 0) {
        appendMessage("JARVIS", "Welcome back! Here's where we left off:");
        history.forEach(item => {
            appendMessage(item.sender, item.text);
        });
    } else {
        appendMessage("JARVIS", "Hello! I am JARVIS, ready to assist with trading.");
    }
});
document.getElementById('new-chat-btn').addEventListener('click', () => {
    // Clear chat box
    chatBox.innerHTML = "";
  
    // Clear local storage memory
    chrome.storage.local.remove('chatHistory', () => {
      appendMessage("JARVIS", "Ready for a new conversation!");
    });
  
    // Reset BTC alert tracker if needed
    lastAlert = "";
  });

  async function queryAI(prompt) {
    const apiKey = "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";  //key
  
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://jarvis-trader-extension", // change if needed
        "X-Title": "JARVIS Trading Assistant"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are JARVIS, a smart trading assistant. Be concise and provide helpful responses for traders." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000
      })
    });
  
    const data = await response.json();
    return data.choices?.[0]?.message?.content || " No response from JARVIS.";
  }
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "chart-context") {
      const { symbol, interval } = message;
      console.log(`[JARVIS Panel] Detected ${symbol} on ${interval} chart`);
      
      appendMessage("JARVIS", `You're currently viewing ${symbol} on a ${interval} chart. Would you like an analysis?`);
    }
  });
  
  
  

