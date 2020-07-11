chrome.runtime.sendMessage({action: "showPageAction"});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (window.location.href.startsWith('https://www.tinops.com/employees/') && request.action){
        switch (request.action){
            case 'updateCopyState':
                updateCopyState();
                break;
            case 'manipulateTimesheet':
                onPageLoaded();
                break;
        }
    }
});

const COPY_CLASS = 'ant-btn-primary';
const DTP_CLASS = 'ant-calendar-picker-input';
const HEADER_CLASS = 'rt-resizable-header-content';
const ROW_CLASS = 'rt-tr-group';
const TABLE_CLASS = 'table-wrap';
let onEditPage, copyIndex, dates = [], incrementEnabled = false;
let observer;

function onPageLoaded(){
    if (observer){
        return;
    }
    
    const body = document.getElementsByTagName('body')[0];
    const mutationConfig = { childList: true, subtree: true };
    
    observer = new MutationObserver(mutationCallback);
    observer.observe(body, mutationConfig);
}

function mutationCallback(mutationsList, observer){
    for (let mutation of mutationsList){
        updateCopyState();
        
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0){
            const addedNode = mutation.addedNodes[0];
            
            if (addedNode.classList && addedNode.classList.contains(ROW_CLASS)){
                const copyButton = getCopyButton(addedNode);
                copyButton.addEventListener('click', copyClick);
                updateCopyState();
                
                if (dates.length && (copyIndex || copyIndex === 0)){
                    const rows = document.querySelectorAll('.' + ROW_CLASS);
                    let dateIndex = -1;
                    
                    for (let i = 0; i < rows.length; i++){
                        const row = rows[i];
                        const datePicker = row.querySelector('.' + DTP_CLASS);
                        
                        setTimeout(function(){
                            datePicker.click();
                            
                            let addDays = 1;
                            if (copyIndex !== i - 1 ){
                                ++dateIndex;
                                addDays = 0;
                            }

                            const dateValue = getFutureDate(dates[dateIndex], addDays);
                            var dateValueDay = dateValue.getDate();

                            const weekDates = document.querySelectorAll('.ant-calendar-current-week.ant-calendar-active-week .ant-calendar-date');

                            for (let date of weekDates){
                                if (date.innerText == dateValueDay){
                                    date.click();
                                    break;
                                }
                            }
                        }, i * 500);
                    }
                }
            }
            else if (onEditPage && addedNode.classList && addedNode.classList.contains(COPY_CLASS)) {
                addedNode.addEventListener('click', copyClick);
            }
        }
    }
}

function copyClick(event){
    dates = [];
    copyIndex = null;
    
    if (!(incrementEnabled && onEditPage)){
        return;
    }
   
    const rows = document.querySelectorAll('.' + ROW_CLASS);
    
    for (let i = 0; i < rows.length; i++){
        const row = rows[i];
        const copyButton = getCopyButton(row);
        
        dates.push(row.querySelector('.' + DTP_CLASS).value);
        
        if (!copyIndex && copyButton === event.target){
            copyIndex = i;
        }
    }
}

function updateCopyState(){
    const headers = document.querySelectorAll('.' + HEADER_CLASS);
    
    if (headers.length){
        onEditPage = headers[headers.length - 1].innerText.toUpperCase() === 'DELETE';
    }
    else{
        onEditPage = false;
    }
    
    if (onEditPage){
        const incrementPropertyName = 'incrementEnabled';
        chrome.storage.sync.get([incrementPropertyName], function(items){
            const copyButtons = getCopyButton(document.querySelector('.' + TABLE_CLASS), true);
            
            if (!copyButtons){
                return;
            }
            
            let copyText;

            if (items.hasOwnProperty(incrementPropertyName)){
                incrementEnabled = items.incrementEnabled;
                copyText = incrementEnabled && onEditPage ? "Copy++" : "Copy";
            }
            else {
                incrementEnabled = false;
                copyText = "Copy";
            }

            for (let copyButton of copyButtons){
                copyButton.querySelector('span').textContent = copyText;
            }
        });
    }
};

function getCopyButton(root, all){
    if (!root){
        return null;
    }
    
    if (all){
        return root.querySelectorAll('.' + COPY_CLASS);
    }
    else {
        return root.querySelector('.' + COPY_CLASS);
    }
}

function getFutureDate(dateStr, days){
    const dateMatch = dateStr.match(/(?<month>\d+)\/(?<day>\d+)\/(?<year>\d+)/);    
    const newDate = new Date(`${dateMatch.groups.year}/${dateMatch.groups.month}/${dateMatch.groups.day}`);
    
    if (days === 0){
        return newDate;
    }
    
    newDate.setDate(newDate.getDate() + days);
    
    return newDate;
}