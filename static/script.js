// Assumes utils.js is loaded before this file
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

// Event listener for exam type buttons
document.querySelectorAll('.source-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.getElementById('exam_type').value = button.getAttribute('data-source');
        localStorage.setItem("examType", button.getAttribute('data-source'));
    });
});

function updateQuestionList() {
    questionList.innerHTML = ""; // Clear previous list
    const inputIDs = inputField.value.trim();

    if (!inputIDs) {
        return; // Do nothing if input is empty
    }

    const ids = [];
    const regex = /"([^"]+)"|([^,\n\r]+)/g;
    let match;
    while ((match = regex.exec(inputIDs)) !== null) {
        const item = match[1] ? `"${match[1].trim()}"` : match[2]?.trim();
        if (item && item !== "") ids.push(item);
    }
    
    ids.forEach((id, index) => {
        const label = document.createElement("label");
        label.classList.add("question-label");
        label.textContent = `${index + 1}) ${id}`;
        label.dataset.id = id;
        label.addEventListener("click", () => {
            label.classList.toggle("selected");
            updateOutput();
        });
        questionList.appendChild(label);
    });
    updateOutput();
}

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

function updateOutput() {
    const selectedIDs = Array.from(document.querySelectorAll("#question_list .question-label.selected"))
                            .map(label => label.dataset.id);

    const examType = document.getElementById("exam_type").value;
    let output = "";
    if (selectedIDs.length > 0) {
        output = "(" + selectedIDs.map(id => {
            if (examType === "COMLEX") {
                return `tag:*COMLEX::${id}*`;
            } else if (examType === "STEP") {
                return `tag:*STEP::${id}*`;
            } else {
                return `tag:*${id}*`;
            }
        }).join(" OR ") + ")";
    }
    const outputField = document.getElementById("output_text");
    outputField.value = output;

    if (examType === "COMLEX") {
        outputField.placeholder = "tag:*COMLEX::23456*";
    } else if (examType === "STEP") {
        outputField.placeholder = "tag:*STEP::23456*";
    } else {
        outputField.placeholder = "tag:*23456*";
    }
}

questionList.addEventListener("change", updateOutput);
document.getElementById("copy_output").addEventListener("click", () => {
    const output = document.getElementById("output_text").value;
    navigator.clipboard.writeText(output).then(() => {
        const button = document.getElementById("copy_output");
        const originalText = button.textContent;
        button.textContent = "Copied!";
        saveToHistory(output);
        history.pushState({ output }, "", "");
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    });
});

document.querySelectorAll('.source-btn').forEach(button => {
    button.addEventListener('click', () => {
        const examTypeInput = document.getElementById('exam_type');
        const currentValue = examTypeInput.value;
        const newValue = button.getAttribute('data-source');

        const wasActive = button.classList.contains('active');

        // Clear all buttons' active state
        document.querySelectorAll('.source-btn').forEach(btn => btn.classList.remove('active'));

        if (wasActive) {
            // Deselect if already selected
            examTypeInput.value = "";
            localStorage.removeItem("examType");
        } else {
            // Select new value
            examTypeInput.value = newValue;
            localStorage.setItem("examType", newValue);
            button.classList.add('active');
        }

        updateOutput();
    });
});

window.onpopstate = (event) => {
    if (event.state && event.state.output) {
        document.getElementById("output_text").value = event.state.output;
    }
};

const savedExamType = localStorage.getItem("examType");
if (savedExamType) {
    document.getElementById('exam_type').value = savedExamType;
    const btn = document.querySelector(`.source-btn[data-source="${savedExamType}"]`);
    if (btn) btn.classList.add("active");
}

document.getElementById("history_select").addEventListener("change", (e) => {
    const value = e.target.value;
    if (value) {
        document.getElementById("output_text").value = value;
    }
});

updateHistoryDropdown();
updateOutput();