
const corsProxy = "https://cors-anywhere.herokuapp.com"

export default function getProf() {
    fetch(corsProxy + "/https://www.ratemyprofessors.com/ShowRatings.jsp?tid=2034405")
        .then(res => res.text())
        .then(body => console.log(body));
}