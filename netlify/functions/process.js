// netlify/functions/process.js

exports.handler = async function(event, context) {
    const data = JSON.parse(event.body);
    const idsRaw = data.ids || '';
    const mode = data.mode || 'All';
    const selectedNumbers = data.selected_numbers || [];

    // Simple logic to handle the mode and generate output
    const ids = idsRaw.split(',').map(id => id.trim());
    const output = {
        ids,
        mode,
        selectedNumbers
    };

    return {
        statusCode: 200,
        body: JSON.stringify({ output })
    };
};
