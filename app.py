from flask import Flask, render_template, request, jsonify, send_file
from gtts import gTTS
import os
import json
import tempfile
import uuid

app = Flask(__name__)


# Load JSON data
def load_data(filename):
    with open(f'static/data/{filename}', 'r', encoding='utf-8') as file:
        return json.load(file)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/hiragana')
def hiragana():
    return render_template('hiragana.html')


@app.route('/katakana')
def katakana():
    return render_template('katakana.html')


@app.route('/vocabulary')
def vocabulary():
    return render_template('vocabulary.html')


@app.route('/quiz')
def quiz():
    return render_template('quiz.html')


@app.route('/flashcards')
def flashcards():
    return render_template('flashcards.html')


@app.route('/api/data/<data_type>')
def get_data(data_type):
    valid_types = ['hiragana', 'katakana', 'beginner_vocab', 'intermediate_vocab', 'advanced_vocab']
    if data_type in valid_types:
        try:
            return jsonify(load_data(f'{data_type}.json'))
        except FileNotFoundError:
            return jsonify({"error": f"Data file for {data_type} not found"}), 404
    return jsonify({"error": "Invalid data type"}), 400


@app.route('/api/speech', methods=['POST'])
def text_to_speech():
    data = request.json
    text = data.get('text', '')
    if not text:
        return jsonify({"error": "No text provided"}), 400

    # Create temporary file for audio
    temp_dir = tempfile.gettempdir()
    filename = f"{uuid.uuid4()}.mp3"
    filepath = os.path.join(temp_dir, filename)

    # Generate speech
    tts = gTTS(text=text, lang='ja')
    tts.save(filepath)

    # Send file and remove after sending
    return send_file(filepath, mimetype='audio/mp3', as_attachment=True, download_name=filename)


if __name__ == '__main__':
    # Ensure data directory exists
    os.makedirs('static/data', exist_ok=True)
    app.run(debug=True)