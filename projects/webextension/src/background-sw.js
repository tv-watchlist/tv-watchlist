// https://developer.chrome.com/docs/extensions/mv3/service_workers/#manifest
chrome.runtime.onMessage.addListener((message, callback) => {
    if (message === 'hello') {
      sendResponse({greeting: 'welcome!'})
    }
});
