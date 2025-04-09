const inputField = document.getElementById("input_ids");
const questionList = document.getElementById("question_list");
const selectAllButton = document.getElementById("select_all");
const deselectAllButton = document.getElementById("deselect_all");

let lastClickedLabel = null; // Move lastClickedLabel to global scope

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
        const examInput = document.getElementById('exam_type');
        const currentType = examInput.value;
        const newType = button.getAttribute('data-source');

        if (currentType === newType) {
            examInput.value = "";
            localStorage.removeItem("examType");
            button.classList.remove("active");
        } else {
            examInput.value = newType;
            localStorage.setItem("examType", newType);
            document.querySelectorAll('.source-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        }

        updateOutput();
    });
});

let isDragging = false;
let dragAdd = true;

questionList.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("question-label")) {
        isDragging = true;
        dragAdd = !e.target.classList.contains("selected");
        e.target.classList[dragAdd ? "add" : "remove"]("selected");
        updateOutput();
    }
});

questionList.addEventListener("mouseover", (e) => {
    if (isDragging && e.target.classList.contains("question-label")) {
        e.target.classList[dragAdd ? "add" : "remove"]("selected");
        updateOutput();
    }
});

document.addEventListener("mouseup", () => {
    isDragging = false;
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
        label.textContent = `${index + 1}) ${id}`;
        label.classList.add("question-label");
        label.dataset.id = id;
        label.addEventListener("click", (e) => {
            if (e.shiftKey && lastClickedLabel) {
                const allLabels = Array.from(document.querySelectorAll(".question-label"));
                const start = allLabels.indexOf(lastClickedLabel);
                const end = allLabels.indexOf(label);
                const [min, max] = [start, end].sort((a, b) => a - b);
                for (let i = min; i <= max; i++) {
                    allLabels[i].classList.add("selected");
                }
            } else {
                label.classList.toggle("selected");
                lastClickedLabel = label;
            }
            updateOutput();
        });
        questionList.appendChild(label);
        questionList.appendChild(document.createElement("br"));
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
    updateOutput();
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

function saveToHistory(output) {
    const now = new Date();
    const shortTimestamp = `${now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const timestampedOutput = `${shortTimestamp} → ${output}`;
    
    let history = JSON.parse(localStorage.getItem("conversionHistory")) || [];
    history.unshift(timestampedOutput); // Add to front
    history = history.slice(0, 10); // Keep only latest 10
    localStorage.setItem("conversionHistory", JSON.stringify(history));

    let session = JSON.parse(sessionStorage.getItem("sessionConversionHistory")) || [];
    session.unshift(timestampedOutput);
    session = session.slice(0, 10);
    sessionStorage.setItem("sessionConversionHistory", JSON.stringify(session));

    updateHistoryDropdown();
}

function updateHistoryDropdown() {
    const history = JSON.parse(localStorage.getItem("conversionHistory")) || [];
    const select = document.getElementById("history_select");
    select.innerHTML = '<option value="">-- Select a past output --</option>';
    history.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item;
        opt.textContent = item;
        select.appendChild(opt);
    });
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