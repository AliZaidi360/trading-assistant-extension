// ✅ Confirm content script is alive
console.log("👋 content.js is running");

// ✅ Single listener for all messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📥 Content script received message:", message);

  if (message.type === "speak-news") {
    const speech = new SpeechSynthesisUtterance(message.text);
    window.speechSynthesis.speak(speech);
    console.log("🔊 Spoke:", message.text);
  }
});
