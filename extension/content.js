console.log("[JARVIS Vision] Content script loaded.");

// Check if we're on TradingView
if (window.location.hostname.includes("tradingview.com")) {
  console.log("[JARVIS Vision] TradingView detected.");

  // Try to extract symbol and interval
  function extractChartContext() {
    const symbol = document.querySelector('[data-symbol-name]')?.textContent || "Unknown Symbol";
    const interval = document.querySelector('[data-name="interval-select"]')?.textContent || "Unknown Interval";

    console.log(`[JARVIS Vision] Symbol: ${symbol}, Interval: ${interval}`);

    // Send this data to panel.js (via background if needed later)
    chrome.runtime.sendMessage({
      type: "chart-context",
      symbol,
      interval,
    });
  }

  // Wait a bit in case DOM isn’t ready
  setTimeout(extractChartContext, 2000);

  // Also update if chart changes
  const observer = new MutationObserver(extractChartContext);
  observer.observe(document.body, { childList: true, subtree: true });
}
