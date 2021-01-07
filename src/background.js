/**
 * Run the CSS code and the popup script when Tab becomes active.
 */

chrome.tabs.onActivated.addListener(tabs => {
    chrome.tabs.get(tabs.tabId, current_tab_info => {
        if (/^https:\/\/nubanner.neu.edu\/StudentRegistrationSsb\/ssb\/classSearch\/classSearch/.test(current_tab_info.url))
            chrome.tabs.insertCSS(null, { file: './mystyle.css' });
            chrome.tabs.executeScript(null, { file: './popup.js' }/*, () => console.log('injected popup.js I am done')*/)
    })
});

/**
 * convert HTML string back into doc model.
 * parse the professor's profile link and return it. If link is not found, return null.
 * @param {string} text 
 */

function parseProfUrl(text) {
    const domparser = new DOMParser()
    const doc = domparser.parseFromString(text, 'text/html');
    
    try {
        doc.querySelectorAll(".listings > li > a")[0].getAttribute('href')
    } catch (err) {
        console.log("caught error", err, " returned null")
        return null
    }

    var p_profile = "https://www.ratemyprofessors.com" + doc.querySelectorAll(".listings > li > a")[0].getAttribute('href')
    
    return p_profile
}

/**
 * Parse for the professor's rating information from the HTML page.
 * Store the professor information in the extension storage as JSON.
 * return the JSON information.
 * @param {string} fname 
 * @param {string} text 
 */
function parseProfInfo(fname, text) {

    // Parse HTML from text
    const domparser = new DOMParser()
    const doc = domparser.parseFromString(text, 'text/html');
    // CSS Selectors
    const wta = "div.FeedbackItem__StyledFeedbackItem-uof32n-0:nth-child(1) > div:nth-child(1)"
    const difficultyS = "div.FeedbackItem__StyledFeedbackItem-uof32n-0:nth-child(2) > div:nth-child(1)"
    const overallQualityS = "#root > div > div > div.PageWrapper__StyledPageWrapper-sc-3p8f0h-0.hswDmO > div.TeacherRatingsPage__TeacherBlock-a57owa-1.hkWQzD > div.TeacherInfo__StyledTeacher-ti1fio-1.kFNvIp > div:nth-child(1) > div.RatingValue__AvgRating-qw8sqy-1.gIgExh > div > div.RatingValue__Numerator-qw8sqy-2.liyUjw"
    const mostHelpfulCommentS = ".HelpfulRating__StyledRating-sc-4ngnti-0 > div:nth-child(3)"
    
    var ratingNum = doc.querySelector(overallQualityS).innerText;
    var wouldTakeAgainPercent = doc.querySelector(wta).innerText;
    var difficulty= doc.querySelector(difficultyS).innerText;
    var ratingNum = doc.querySelector(overallQualityS).innerText;
    var mostHelpfulComment = doc.querySelector(mostHelpfulCommentS).innerText;

    var p_info = {
        wouldTakeAgain: wouldTakeAgainPercent,
        diffRate: difficulty,
        comment: mostHelpfulComment,
        rating: ratingNum}

    chrome.storage.local.set({[fname]: p_info}, (r) => console.log(r));

    return p_info
}

/**
 * Fetch professor link if it is not null.
 * otherwise store professor as empty {} in local storage.
 * @param {string} profUrl 
 * @param {string} pname 
 */
async function validatePLink(profUrl, pname){
    if (profUrl != null) {
        console.log(profUrl)
        let result = await fetch(profUrl)
            .then(response => response.text())
            .then(body => parseProfInfo(pname, body))
        return result
    }
    else{
        chrome.storage.local.set({[pname] : profUrl}, (r) => console.log(r));
        return {[pname]:"Professor not found: stored in backend as {}"}
    }
}


/**
 * Add listener to listen for messages from the foreground script.
 * Look up the professor on RMP and scrap the professor data.
 * Finally, store the data inside the local storage, and send the JSON response back.
 */

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        //console.log(request.names)
        // TODO: Check if professor name is in local storage first before searching
        if (request.names.length > 1) {
            var searchURL = "https://www.ratemyprofessors.com/search.jsp?query=" 
            searchURL += request.names[1] + "+" + request.names[0] + "+northeastern"
            searchURL = searchURL.replace(",", "");

            var fullName = request.names[0] + " " + request.names[1]
            //sendResponse({names: "from backend response"});
             fetch(searchURL)
                .then(response => response.text())
                .then(body => parseProfUrl(body))
                .then(profUrl => validatePLink(profUrl, fullName))
                .then(p_info => sendResponse(p_info))
                .catch(error => console.log(error))
            
            return true;  // Will respond asynchronously
        }
    });
