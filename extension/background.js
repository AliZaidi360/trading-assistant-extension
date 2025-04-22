const API_KEY = "eb5ec517f8b14d9c8d93ed30dfff9cf3";
const keyword = "inflation";

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
          console.log("📰 Top economic news:", topHeadline);

          chrome.notifications.create({
            type: "basic",
            iconUrl: "JARVIS.webp",
            title: "Market News Update",
            message: topHeadline
          });
          chrome.runtime.onInstalled.addListener(() => {
            chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
          });
          
          chrome.runtime.onStartup.addListener(() => {
            chrome.notifications.create({
              type: "basic",
              iconUrl: "JARVIS.webp",
              title: "Test Icon",
              message: "Is JARVIS.webp showing?"
            });
          });
          
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || tabs.length === 0 || !tabs[0].id) {
              console.warn("❌ No valid tab found to send message to.");
              return;
            }

            chrome.tabs.sendMessage(tabs[0].id, {
              type: "speak-news",
              text: topHeadline,
              url: articles[0].url
            }, () => {
              if (chrome.runtime.lastError) {
                console.error("❌ Failed to send message:", chrome.runtime.lastError.message);
              } else {
                console.log("✅ Message sent to content.js");
              }
            });
            
          });
          
        }
      })
      .catch(console.error);
  }
});
