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

function updateHistoryDropdown() {
    const history = JSON.parse(localStorage.getItem("conversionHistory")) || [];
    const select = document.getElementById("history_select");
    select.innerHTML = '<option value="">-- Select a past output --</option>';
    history.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.value;
        opt.textContent = item.label;
        select.appendChild(opt);
    });
}

function saveToHistory(output) {
    const now = new Date();
    const shortTimestamp = `${now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const timestampedOutput = {
        label: `${shortTimestamp} → ${output}`,
        value: output
    };

    let history = JSON.parse(localStorage.getItem("conversionHistory")) || [];
    history.unshift(timestampedOutput);
    history = history.slice(0, 10);
    localStorage.setItem("conversionHistory", JSON.stringify(history));

    let session = JSON.parse(sessionStorage.getItem("sessionConversionHistory")) || [];
    session.unshift(timestampedOutput);
    session = session.slice(0, 10);
    sessionStorage.setItem("sessionConversionHistory", JSON.stringify(session));

    updateHistoryDropdown();
}
