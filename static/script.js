const inputField = document.getElementById("input_ids");
const questionList = document.getElementById("question_list");
const selectAllButton = document.getElementById("select_all");
const deselectAllButton = document.getElementById("deselect_all");

// Update the question list dynamically when input changes
inputField.addEventListener("input", () => {
    updateQuestionList();
    updateOutput();
});

// Event listener for Select All button
selectAllButton.addEventListener("click", () => {
    toggleSelection(true);
    updateOutput();
});

// Event listener for Deselect All button
deselectAllButton.addEventListener("click", () => {
    toggleSelection(false);
    updateOutput();
});

function updateQuestionList() {
    questionList.innerHTML = ""; // Clear previous list
    const inputIDs = inputField.value.trim();

    if (!inputIDs) {
        return; // Do nothing if input is empty
    }

    const ids = [];
    const regex = /"([^"]+)"|([^,]+)/g;
    let match;
    while ((match = regex.exec(inputIDs)) !== null) {
        const item = match[1] ? `"${match[1].trim()}"` : match[2].trim();
        if (item) ids.push(item);
    }
    
    ids.forEach((id, index) => {
        const label = document.createElement("label");
        label.innerHTML = `
            <input type="checkbox" value="${id}">
            <span class="number">${index + 1})</span>
            <span class="space"> </span> 
            <span class="id">${id}</span>`;
        questionList.appendChild(label);
        questionList.appendChild(document.createElement("br"));
    });
    updateOutput();
}

function toggleSelection(selectAll) {
    const checkboxes = questionList.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll;
        checkbox.dispatchEvent(new Event("change"));
    });
}

function updateOutput() {
    const selectedIDs = Array.from(document.querySelectorAll("#question_list input:checked"))
                             .map(input => input.value);

    const examType = document.getElementById("exam_type").value;
    const output = selectedIDs.map(id => {
        if (examType === "COMLEX") {
            return `tag:*COMLEX::${id}*`;
        } else if (examType === "STEP") {
            return `tag:*STEP::${id}*`;
        } else {
            return `tag:*${id}*`;
        }
    }).join(" OR ");
    document.getElementById("output_text").value = output;
}

function saveToHistory(output) {
    let history = JSON.parse(localStorage.getItem("conversionHistory")) || [];
    history.unshift(output); // Add to front
    history = history.slice(0, 10); // Keep only latest 10
    localStorage.setItem("conversionHistory", JSON.stringify(history));

    let session = JSON.parse(sessionStorage.getItem("sessionConversionHistory")) || [];
    session.unshift(output);
    session = session.slice(0, 10);
    sessionStorage.setItem("sessionConversionHistory", JSON.stringify(session));
}

questionList.addEventListener("change", updateOutput);
document.getElementById("copy_output").addEventListener("click", () => {
    const output = document.getElementById("output_text").value;
    navigator.clipboard.writeText(output).then(() => {
        alert("Output copied to clipboard!");
        saveToHistory(output);
        history.pushState({ output }, "", "");
    });
});

window.onpopstate = (event) => {
    if (event.state && event.state.output) {
        document.getElementById("output_text").value = event.state.output;
    }
};
