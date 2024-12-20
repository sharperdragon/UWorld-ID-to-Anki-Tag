from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process():
    data = request.json
    ids_raw = data.get('ids', '')
    selected_numbers = data.get('selected_numbers', [])
    mode = data.get('mode', 'All')

    # Split and clean IDs
    ids = [id_.strip() for id_ in ids_raw.split(",") if id_.strip()]
    selected_numbers = set(map(int, selected_numbers))  # Convert to integers for comparison

    if mode == "All":
        output_ids = ids
    elif mode == "Exclude Questions":
        output_ids = [qid for idx, qid in enumerate(ids, start=1) if idx not in selected_numbers]
    else:  # Selected Questions
        output_ids = [qid for idx, qid in enumerate(ids, start=1) if idx in selected_numbers]

    # Group IDs into columns of 10
    columns = [ids[i:i + 10] for i in range(0, len(ids), 10)]

    return jsonify({"columns": columns})

if __name__ == "__main__":
    app.run(debug=True)
