// Assuming this is part of your static/utils.js file

function toggleSelection(selectAll) {
    const labels = questionList.querySelectorAll(".question-label");
    labels.forEach(label => {
        if (selectAll) {
            label.classList.add("selected");
        } else {
            label.classList.remove("selected");
        }
    });
}
