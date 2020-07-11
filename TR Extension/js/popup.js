chrome.storage.sync.get(['incrementEnabled'], function(items){
    if (items.hasOwnProperty('incrementEnabled')){
        const incrementCheckbox = document.getElementById('increment-check');
        incrementCheckbox.checked = items.incrementEnabled;
    }
});

document.addEventListener("DOMContentLoaded", function(){
    const incrementCheckbox = document.getElementById('increment-check');
    incrementCheckbox.addEventListener('change', onIncrementCheckChanged);  
});

function onIncrementCheckChanged(event){
    chrome.storage.sync.set({"incrementEnabled": event.target.checked}, function(){
        activeTabCallback(sendUpdateCopyState)
    });
}

function activeTabCallback(callback){
    chrome.tabs.query({active: true, currentWindow: true}, callback);
}
    
function sendUpdateCopyState(tabs){
    chrome.tabs.sendMessage(tabs[0].id, { action: 'updateCopyState'});
}