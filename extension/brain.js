let context = {
    btcChange: 0,
    latestNews: "",
    lastUserQuery: ""
};

function jarvisBrain(message, priceElementText) {
    message = message.toLowerCase().trim();
    context.lastUserQuery = message;

    if (message.includes("btc") && context.btcChange >= 2) {
        return `⚡ BTC has moved ${context.btcChange}% today. Stay alert for volatility!`;
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

    if (message.includes("help")) {
        return "You can ask about BTC price movements, latest news, or market trends.";
    }

    if (message.includes("market")) {
        return "The market is volatile today. Stay cautious!";
    }

    return "I'm monitoring the markets. Ask me about BTC, news, or trends!";
}

function updateContext(newData) {
    context = { ...context, ...newData };
}

window.jarvisBrain = jarvisBrain;
window.updateContext = updateContext;
