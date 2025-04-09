export function extractIDsFromInput(inputText) {
    const ids = [];
    const regex = /"([^"]+)"|([^,\n\r]+)/g;
    let match;
    while ((match = regex.exec(inputText)) !== null) {
        const item = match[1] ? `"${match[1].trim()}"` : match[2]?.trim();
        if (item && item !== "") ids.push(item);
    }
    return ids;
}
