const API_KEY = "eb5ec517f8b14d9c8d93ed30dfff9cf3";
const keyword = "inflation";

// Log when background starts
console.log("✅ JARVIS background script is running...");

// Set side panel behavior ONCE when installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  console.log("📌 Side panel behavior set.");
});

// Test notification on startup
chrome.runtime.onStartup.addListener(() => {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "JARVIS.webp",
    title: "JARVIS Booted",
    message: "JARVIS is now monitoring the markets!"
  });
});

// Run news check every 1 minute
chrome.alarms.create("fetchNews", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "fetchNews") {
    fetch(`https://newsapi.org/v2/everything?q=${keyword}&sortBy=publishedAt&apiKey=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        const articles = data.articles;

        if (articles && articles.length > 0) {
          const topHeadline = articles[0].title;
          const newsUrl = articles[0].url;

          console.log(" Top economic news:", topHeadline);

          // Show desktop notification
          chrome.notifications.create({
            type: "basic",
            iconUrl: "JARVIS.webp",
            title: "Market News Update",
            message: topHeadline
          });

          // Send message to panel/content
          chrome.runtime.sendMessage({
            type: "speak-news",
            text: topHeadline,
            url: newsUrl
          });
        } else {
          console.log("⚠️ No articles found.");
        }
      })
      .catch(err => console.error("❌ Fetch error:", err));
  }
});
