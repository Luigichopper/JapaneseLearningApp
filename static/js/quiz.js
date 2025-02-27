// Quiz functionality
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the quiz page
    if (window.location.pathname.includes('/quiz')) {
        initializeQuiz();
    }
});

// Store quiz data globally
let quizData = [];
let currentQuestion = 0;
let quizType = 'hiragana'; // Default quiz type
let userScore = 0;
let quizInProgress = false;

/**
 * Initialize the quiz page
 */
async function initializeQuiz() {
    // Get quiz type from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('type')) {
        quizType = urlParams.get('type');
    }
    
    // Set up quiz UI
    createQuizUI();
    
    // Set up type selector
    initializeTypeSelector();
    
    // Set up start quiz button
    document.getElementById('startQuiz').addEventListener('click', startQuiz);
}

/**
 * Initialize quiz type selector
 */
function initializeTypeSelector() {
    const typeSelector = document.getElementById('quizTypeSelector');
    
    if (typeSelector) {
        typeSelector.value = quizType;
        
        typeSelector.addEventListener('change', function() {
            quizType = this.value;
            // Reset state when changing quiz type
            resetQuiz();
        });
    }
}

/**
 * Create the quiz UI
 */
function createQuizUI() {
    const container = document.querySelector('.quiz-container');
    if (!container) return;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create quiz setup
    const quizSetup = document.createElement('div');
    quizSetup.className = 'quiz-setup';
    quizSetup.innerHTML = `
        <h3>Quiz Settings</h3>
        <div class="form-group">
            <label for="quizTypeSelector">Quiz Type:</label>
            <select id="quizTypeSelector" class="selector">
                <option value="hiragana">Hiragana</option>
                <option value="katakana">Katakana</option>
                <option value="vocabulary">Vocabulary</option>
            </select>
        </div>
        <div class="form-group">
            <label for="questionCount">Number of Questions:</label>
            <select id="questionCount" class="selector">
                <option value="5">5</option>
                <option value="10" selected>10</option>
                <option value="15">15</option>
                <option value="20">20</option>
            </select>
        </div>
        <button id="startQuiz" class="btn">Start Quiz</button>
    `;
    
    // Create quiz content (initially hidden)
    const quizContent = document.createElement('div');
    quizContent.className = 'quiz-content hidden';
    quizContent.innerHTML = `
        <div class="quiz-progress">
            <div class="progress-bar" style="width: 0%"></div>
        </div>
        <div class="quiz-score">Score: <span id="score">0</span> / <span id="totalQuestions">0</span></div>
        <div class="quiz-card">
            <div class="quiz-question"></div>
            <div class="quiz-options"></div>
        </div>
        <div class="quiz-controls">
            <button id="nextQuestion" class="btn">Next Question</button>
            <button id="finishQuiz" class="btn">Finish Quiz</button>
        </div>
    `;
    
    // Create results section (initially hidden)
    const quizResults = document.createElement('div');
    quizResults.className = 'quiz-results hidden';
    quizResults.innerHTML = `
        <h3>Quiz Results</h3>
        <div class="results-summary">
            <p>You scored <span id="finalScore">0</span> out of <span id="finalTotal">0</span></p>
            <div class="results-percentage">
                <span id="scorePercentage">0</span>%
            </div>
        </div>
        <div class="results-feedback"></div>
        <button id="retakeQuiz" class="btn">Take Another Quiz</button>
    `;
    
    // Add elements to container
    container.appendChild(quizSetup);
    container.appendChild(quizContent);
    container.appendChild(quizResults);
    
    // Add button event handlers
    document.getElementById('nextQuestion').addEventListener('click', showNextQuestion);
    document.getElementById('finishQuiz').addEventListener('click', finishQuiz);
    document.getElementById('retakeQuiz').addEventListener('click', resetQuiz);
}

/**
 * Start the quiz
 */
async function startQuiz() {
    try {
        // Get question count
        const questionCount = parseInt(document.getElementById('questionCount').value);
        
        // Load quiz data
        await loadQuizData(quizType, questionCount);
        
        // Hide setup, show quiz content
        document.querySelector('.quiz-setup').classList.add('hidden');
        document.querySelector('.quiz-content').classList.remove('hidden');
        document.querySelector('.quiz-results').classList.add('hidden');
        
        // Reset score and question index
        currentQuestion = 0;
        userScore = 0;
        quizInProgress = true;
        
        // Update score display
        document.getElementById('score').textContent = userScore;
        document.getElementById('totalQuestions').textContent = quizData.length;
        
        // Show first question
        showQuestion(currentQuestion);
    } catch (error) {
        console.error('Error starting quiz:', error);
        window.japaneseApp.showNotification('Failed to start quiz. Please try again.', 'error');
    }
}

/**
 * Load quiz data based on type
 * @param {string} type - Quiz type (hiragana, katakana, vocabulary)
 * @param {number} count - Number of questions to generate
 */
async function loadQuizData(type, count) {
    // Show loading state
    document.querySelector('.quiz-question').innerHTML = '<p class="loading">Loading quiz...</p>';
    
    try {
        let sourceData;
        
        // Fetch appropriate data
        switch (type) {
            case 'hiragana':
                sourceData = await window.japaneseApp.fetchData('hiragana');
                // Flatten the data structure
                sourceData = [
                    ...sourceData.basic,
                    ...sourceData.dakuon,
                    ...sourceData.combinations
                ];
                break;
            case 'katakana':
                sourceData = await window.japaneseApp.fetchData('katakana');
                // Flatten the data structure
                sourceData = [
                    ...sourceData.basic,
                    ...sourceData.dakuon,
                    ...sourceData.combinations,
                    ...sourceData.extended
                ];
                break;
            case 'vocabulary':
                const vocabData = await window.japaneseApp.fetchData('beginner_vocab');
                sourceData = vocabData.vocabulary;
                break;
            default:
                throw new Error('Invalid quiz type');
        }
        
        // Shuffle and select the specified number of items
        shuffleArray(sourceData);
        const selectedItems = sourceData.slice(0, count);
        
        // Generate questions from the selected items
        quizData = selectedItems.map(item => {
            return generateQuestion(item, sourceData, type);
        });
        
    } catch (error) {
        console.error('Error loading quiz data:', error);
        throw error;
    }
}

/**
 * Generate a quiz question from an item
 * @param {Object} item - The item to create a question for
 * @param {Array} allItems - All available items for generating options
 * @param {string} type - Quiz type (hiragana, katakana, vocabulary)
 * @returns {Object} A quiz question object
 */
function generateQuestion(item, allItems, type) {
    // Create a question object based on quiz type
    let question = {
        questionItem: item,
        options: [],
        correctAnswer: null
    };
    
    // Generate different question types based on quiz type
    switch (type) {
        case 'hiragana':
        case 'katakana':
            // Random choice of question type:
            // 1. Show character, ask for romaji
            // 2. Show romaji, ask for character
            const isCharacterToRomaji = Math.random() > 0.5;
            
            if (isCharacterToRomaji) {
                question.prompt = `What is the reading of this character?`;
                question.display = item.character;
                question.correctAnswer = item.romaji;
                
                // Generate incorrect options from other items
                const otherRomaji = allItems
                    .filter(other => other.romaji !== item.romaji)
                    .map(other => other.romaji);
                
                // Select 3 random incorrect options
                shuffleArray(otherRomaji);
                question.options = [item.romaji, ...otherRomaji.slice(0, 3)];
            } else {
                question.prompt = `Which character represents "${item.romaji}"?`;
                question.display = item.romaji;
                question.correctAnswer = item.character;
                
                // Generate incorrect options from other items
                const otherChars = allItems
                    .filter(other => other.character !== item.character)
                    .map(other => other.character);
                
                // Select 3 random incorrect options
                shuffleArray(otherChars);
                question.options = [item.character, ...otherChars.slice(0, 3)];
            }
            break;
            
        case 'vocabulary':
            // Random choice of question type:
            // 1. Show Japanese, ask for English
            // 2. Show English, ask for Japanese
            const isJapaneseToEnglish = Math.random() > 0.5;
            
            if (isJapaneseToEnglish) {
                question.prompt = `What does this word mean?`;
                question.display = item.japanese;
                question.correctAnswer = item.english;
                
                // Generate incorrect options from other items
                const otherEnglish = allItems
                    .filter(other => other.english !== item.english)
                    .map(other => other.english);
                
                // Select 3 random incorrect options
                shuffleArray(otherEnglish);
                question.options = [item.english, ...otherEnglish.slice(0, 3)];
            } else {
                question.prompt = `Which is the Japanese word for "${item.english}"?`;
                question.display = item.english;
                question.correctAnswer = item.japanese;
                
                // Generate incorrect options from other items
                const otherJapanese = allItems
                    .filter(other => other.japanese !== item.japanese)
                    .map(other => other.japanese);
                
                // Select 3 random incorrect options
                shuffleArray(otherJapanese);
                question.options = [item.japanese, ...otherJapanese.slice(0, 3)];
            }
            break;
    }
    
    // Shuffle options
    shuffleArray(question.options);
    
    return question;
}

/**
 * Show a question
 * @param {number} index - Question index
 */
function showQuestion(index) {
    if (index >= quizData.length) {
        finishQuiz();
        return;
    }
    
    const question = quizData[index];
    
    // Update question display
    document.querySelector('.quiz-question').innerHTML = `
        <p>${question.prompt}</p>
        <div class="question-display">${question.display}</div>
    `;
    
    // Create options
    const optionsContainer = document.querySelector('.quiz-options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach(option => {
        const optionEl = document.createElement('div');
        optionEl.className = 'quiz-option';
        optionEl.textContent = option;
        
        // Add click handler
        optionEl.addEventListener('click', function() {
            if (!quizInProgress) return;
            
            // Check answer
            checkAnswer(this, option, question.correctAnswer);
        });
        
        optionsContainer.appendChild(optionEl);
    });
    
    // Update progress display
    const progressPercentage = (index / quizData.length) * 100;
    document.querySelector('.progress-bar').style.width = `${progressPercentage}%`;
    
    // Update button visibility
    document.getElementById('nextQuestion').classList.add('hidden');
    document.getElementById('finishQuiz').classList.add('hidden');
    
    // Add audio button for pronunciation if it's a Japanese character or word
    if (quizType === 'hiragana' || quizType === 'katakana' || 
        (quizType === 'vocabulary' && question.prompt.includes('mean'))) {
        
        const audioBtn = document.createElement('button');
        audioBtn.className = 'btn audio-btn';
        audioBtn.innerHTML = 'Play Sound';
        audioBtn.addEventListener('click', function() {
            window.japaneseApp.playAudio(question.display);
        });
        
        document.querySelector('.quiz-question').appendChild(audioBtn);
    }
}

/**
 * Check the user's answer
 * @param {Element} optionEl - The selected option element
 * @param {string} selectedAnswer - The selected answer
 * @param {string} correctAnswer - The correct answer
 */
function checkAnswer(optionEl, selectedAnswer, correctAnswer) {
    // Disable further answers
    quizInProgress = false;
    
    // Highlight correct and incorrect answers
    document.querySelectorAll('.quiz-option').forEach(el => {
        if (el.textContent === correctAnswer) {
            el.classList.add('correct');
        } else {
            el.classList.add('disabled');
        }
    });
    
    // Check if answer is correct
    if (selectedAnswer === correctAnswer) {
        optionEl.classList.add('correct');
        userScore++;
        
        // Update score display
        document.getElementById('score').textContent = userScore;
        
        // Play success sound (simplified)
        // In a real app, you'd play an actual success sound
        setTimeout(() => {
            window.japaneseApp.showNotification('Correct!', 'success');
        }, 500);
    } else {
        optionEl.classList.add('incorrect');
        
        // Play error sound (simplified)
        // In a real app, you'd play an actual error sound
        setTimeout(() => {
            window.japaneseApp.showNotification('Incorrect!', 'error');
        }, 500);
    }
    
    // Show next button if there are more questions
    if (currentQuestion < quizData.length - 1) {
        document.getElementById('nextQuestion').classList.remove('hidden');
    } else {
        document.getElementById('finishQuiz').classList.remove('hidden');
    }
}

/**
 * Show the next question
 */
function showNextQuestion() {
    if (currentQuestion < quizData.length - 1) {
        currentQuestion++;
        quizInProgress = true;
        showQuestion(currentQuestion);
    }
}

/**
 * Finish the quiz and show results
 */
function finishQuiz() {
    // Hide quiz content, show results
    document.querySelector('.quiz-content').classList.add('hidden');
    document.querySelector('.quiz-results').classList.remove('hidden');
    
    // Calculate and display score
    const percentage = Math.round((userScore / quizData.length) * 100);
    
    document.getElementById('finalScore').textContent = userScore;
    document.getElementById('finalTotal').textContent = quizData.length;
    document.getElementById('scorePercentage').textContent = percentage;
    
    // Generate feedback based on score
    const feedbackEl = document.querySelector('.results-feedback');
    
    if (percentage >= 90) {
        feedbackEl.innerHTML = '<p>Outstanding! You have excellent knowledge of Japanese!</p>';
    } else if (percentage >= 70) {
        feedbackEl.innerHTML = '<p>Great job! You\'re making good progress in your studies.</p>';
    } else if (percentage >= 50) {
        feedbackEl.innerHTML = '<p>Good effort! Keep practicing to improve your score.</p>';
    } else {
        feedbackEl.innerHTML = '<p>Keep studying! Regular practice will help you improve.</p>';
    }
    
    // Add recommendations
    feedbackEl.innerHTML += `
        <h4>Next Steps:</h4>
        <ul>
            <li>Review the ${quizType} characters or vocabulary you missed</li>
            <li>Practice with flashcards to reinforce your learning</li>
            <li>Try another quiz to test different aspects of your knowledge</li>
        </ul>
    `;
}

/**
 * Reset the quiz state
 */
function resetQuiz() {
    // Reset variables
    quizData = [];
    currentQuestion = 0;
    userScore = 0;
    
    // Show setup, hide content and results
    document.querySelector('.quiz-setup').classList.remove('hidden');
    document.querySelector('.quiz-content').classList.add('hidden');
    document.querySelector('.quiz-results').classList.add('hidden');
}

/**
 * Shuffle array randomly
 * @param {Array} array - Array to shuffle
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Make functions available globally
window.startQuiz = startQuiz;
window.showNextQuestion = showNextQuestion;
window.finishQuiz = finishQuiz;
window.resetQuiz = resetQuiz;