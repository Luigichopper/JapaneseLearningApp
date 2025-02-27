# Japanese Learning App

A comprehensive web application for learning Japanese, built with Python Flask.

## Features

* **Complete Japanese syllabary coverage**:
  * Hiragana (including dakuon and combinations)
  * Katakana (including dakuon, combinations, and extended characters)

* **Vocabulary learning**:
  * Organized by difficulty levels (beginner, intermediate, advanced)
  * Categorized by themes (greetings, numbers, food, etc.)
  * Each word includes Japanese, romaji, English, and example usage

* **Interactive learning tools**:
  * Flashcards with spaced repetition
  * Multiple-choice quizzes
  * Character stroke order demonstrations
  * Text-to-speech pronunciation

* **User-friendly interface**:
  * Clean, responsive design
  * Progress tracking
  * Intuitive navigation

## Technical Implementation

* **Backend**: Python Flask
* **Frontend**: HTML, CSS, JavaScript
* **Data Storage**: JSON files for character and vocabulary data
* **Text-to-Speech**: gTTS (Google Text-to-Speech)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   pip install flask gtts
   ```
3. Run the application:
   ```
   python app.py
   ```
4. Access the application at `http://localhost:5000`

## Project Structure

```
japanese-learning-app/
├── app.py                 # Main Flask application
├── static/
│   ├── css/
│   │   └── style.css      # Main stylesheet
│   ├── js/
│   │   ├── main.js        # Common JavaScript functions
│   │   ├── hiragana.js    # Hiragana page functionality
│   │   ├── katakana.js    # Katakana page functionality
│   │   ├── vocabulary.js  # Vocabulary page functionality
│   │   ├── flashcards.js  # Flashcards functionality
│   │   └── quiz.js        # Quiz functionality
│   ├── data/
│   │   ├── hiragana.json          # Hiragana character data
│   │   ├── katakana.json          # Katakana character data
│   │   ├── beginner_vocab.json    # Beginner vocabulary
│   │   ├── intermediate_vocab.json # Intermediate vocabulary
│   │   └── advanced_vocab.json    # Advanced vocabulary
│   └── images/            # Stroke order images and assets
└── templates/
    ├── index.html         # Home page
    ├── hiragana.html      # Hiragana learning page
    ├── katakana.html      # Katakana learning page
    ├── vocabulary.html    # Vocabulary learning page
    ├── flashcards.html    # Flashcards page
    └── quiz.html          # Quiz page
```

## Future Enhancements

* User accounts and progress tracking
* Kanji learning module
* Grammar lessons
* Sentence construction practice
* Speaking practice with voice recognition
* Community features (forums, shared notes)
* Mobile app version

## License

This project is open source, free to use and modify for educational purposes.