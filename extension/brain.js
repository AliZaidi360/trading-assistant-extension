let context = {
    btcChange: 0,
    latestNews: "",
    lastUserQuery: ""
};

// Main Brain Function
function jarvisBrain(message, priceElementText) {
    message = message.toLowerCase().trim();
    context.lastUserQuery = message;

    if (message.includes("btc") && context.btcChange >= 2) {
        return `BTC has moved ${context.btcChange}% today. Stay alert for volatility!`;
    }

    if (message.includes("btc") || message.includes("bitcoin")) {
        return `The current BTC price is ${priceElementText || "unavailable right now"}. Stay sharp!`;
    }

    if (message.includes("eth") || message.includes("ethereum")) {
        return "ETH is showing interesting movement today!";
    }

    if (message.includes("news") && context.latestNews) {
        return `Here's the latest headline: "${context.latestNews}"`;
    }

    if (message.includes("trend")) {
        return "The market trend is currently sideways with potential breakout zones.";
    }

    if (message.includes("market")) {
        return "The market is volatile today. Stay cautious!";
    }

    if (message.includes("hello") || message.includes("hi")) {
        return "Hello! I am JARVIS, ready to help you with trading!";
    }

    if (message.includes("help")) {
        return "You can ask me about BTC prices, market news, or current trends.";
    }

    return "I'm monitoring the markets. Feel free to ask me about anything trading-related!";
}

// Update Context Dynamically
function updateContext(newData) {
    context = { ...context, ...newData };
}

// Expose to panel.js
window.jarvisBrain = jarvisBrain;
window.updateContext = updateContext;
