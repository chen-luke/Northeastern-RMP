
function scrapNames() {

    chrome.tabs.executeScript(null, { file: './foreground.js' }, () => console.log('injected foreground.js'))
    
    console.log('I send the message from popup.js');
}

document.getElementById("search-ratings").onclick = scrapNames;