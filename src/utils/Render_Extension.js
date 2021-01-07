// Takes professor information and renders a GUI to the tab.

export default function renderRating(p_info){

        console.log("This is from render_extension")
        console.log("Reiceved from backend:", p_info)
        console.log("Professor: ", p_info.fname + " " + p_info.lname);
        console.log("rating is: ", p_info.rating);
        console.log("would take again: ", p_info.wouldTakeAgain);
        console.log("Difficulty Rating: ", p_info.diffRate);
        console.log("Helpful Comment: ", p_info.comment);

}