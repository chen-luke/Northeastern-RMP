
// makeRatingCircle was never used, see https://codepen.io/chen-luke/pen/gOweWKE
// function makeRatingCircle(ratingCir, ratingTxt) {

//     var Gradient = '<defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#CF336B"/><stop offset="50%" stop-color="#CF336B"/><stop offset="100%" stop-color="#E15050"/></linearGradient></defs>';

//     var bar = new ProgressBar.Circle(pie, {
//         strokeWidth: 20,
//         easing: 'easeInOut',
//         duration: 1400,
//         color: 'url(#gradient)',
//         trailColor: '#27241D',
//         trailWidth: 19,
//         svgStyle: null,
//     });

//     bar.setText("4.5/5") // <- insert our scraped data here.
//     bar.svg.insertAdjacentHTML('afterbegin', Gradient);
//     bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
//     bar.animate(ratingCir);  // Number from 0.0 to 1.0
// }

/**
 * 
 * @param {JSON} p_info 
 * @param {string} p_td 
 */
function renderRating(p_info, p_td) {

    let info = '<p class="toolTips">Overall Rating: ' + p_info.rating + '<br>Difficulty: ' + p_info.diffRate + '/5' + '<br>Would Take Again: ' + p_info.wouldTakeAgain + '</p>'
    p_td.innerHTML = p_td.innerHTML + info

}

/**
 * 
 * @param {JSON} p_info 
 * @param {html} p_td 
 */
function checkInfo(p_info, p_td) {
    // Check if professor rating is {} 
    if (Object.keys(p_info).length === 0 && p_info.constructor === Object) {

        let info = '<p class="toolTips">Professor information not found.</p>'
        p_td.innerHTML = p_td.innerHTML + info
    }
    else {
        renderRating(p_info, p_td)
    }
}

/**
 * 
 * @param {string} fullName 
 * @param {html} p_td 
 */
function getProfessorInfo(fullName, p_td) {
    // get professor information from storage
    chrome.storage.local.get(fullName, (result) => checkInfo(result[fullName], p_td))
}

function getProfessorRatings() {
    var profs = [...document.querySelectorAll(`[data-content*="Instructor"]:not(.readonly)`)]

    chrome.storage.local.get(null, function (items) { 
        
        var allKeys = Object.keys(items) 
        console.log(allKeys)
        profs.map(p_td => {

            let pname = p_td.innerText.split(" ", 2);
            let fullName = pname[0] + " " + pname[1]
            //check if professor is already in storge.
            console.log("Is this the same name as the professor:", fullName)

            if (allKeys.includes(fullName)) {
                console.log("we found the professor in storage")
                //let info = '<p class="toolTips">Found professor in storage</p>'
                //p_td.innerHTML = p_td.innerHTML + info
                getProfessorInfo(fullName, p_td)
            } else {
                console.log("This should only run one time")
                chrome.runtime.sendMessage({ names: pname }, res => checkInfo(res, p_td))
            }

        });
    });

};

if (document.querySelector('.toolTips') == null) {
    getProfessorRatings();
} 