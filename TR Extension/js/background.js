chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.action === "showPageAction"){
        activeTabCallback(showPageAction);
    }
});

chrome.webRequest.onCompleted.addListener(function(details) {
    if (new URL(details.url).pathname.startsWith('/employees/') ||
        details.url === 'https://tinops.com/graphql'){
        activeTabCallback(sendManipulate);
    }
}, { urls: ['*://*.tinops.com/*'] });

function activeTabCallback(callback){
    chrome.tabs.query({active: true, currentWindow: true}, callback);
}

function showPageAction(tabs){
    if (tabs && tabs.length){
        chrome.pageAction.show(tabs[0].id);
    }
}

function sendManipulate(tabs){
    if (tabs && tabs.length){
        chrome.tabs.sendMessage(tabs[0].id, { action: 'manipulateTimesheet' });
    }
}