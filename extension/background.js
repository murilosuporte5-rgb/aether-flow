const APP_URL = "https://aether-flow-production-0798.up.railway.app/capturar";

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: APP_URL });
});
