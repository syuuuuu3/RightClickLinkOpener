chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openLinks' && Array.isArray(message.urls)) {
    message.urls.forEach(url => {
      chrome.tabs.create({ url: url, active: false });
    });
  }
});
