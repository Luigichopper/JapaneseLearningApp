   // Flashcards functionality
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the flashcards page
    if (window.location.pathname.includes('/flashcards')) {
        initializeFlashcards();
    }
});

// Store flashcard data globally
let flashcardData = [];
let currentIndex = 0;
let studyMode = 'hiragana'; // Default study mode

/**
 * Initialize the flashcards page
 */
async function initializeFlashcards() {
    // Get study mode from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('type')) {
        studyMode = urlParams.get('type');
    }

    // Set up mode selector
    initializeModeSelector();

    // Load data based on selected mode
    await loadFlashcardData(studyMode);

    // Set up flashcard controls
    initializeControls();
}

/**
 * Initialize study mode selector
 */
function initializeModeSelector() {
    const modeSelector = document.getElementById('studyModeSelector');

    if (modeSelector) {
        modeSelector.value = studyMode;

        modeSelector.addEventListener('change', async function() {
            studyMode = this.value;
            await loadFlashcardData(studyMode);
            updateFlashcard();
        });
    }
}

/**
 * Load flashcard data based on selected mode
 * @param {string} mode - Study mode (hiragana, katakana, vocabulary)
 */
async function loadFlashcardData(mode) {
    try {
        // Show loading state
        const flashcardEl = document.querySelector('.flashcard-container');
        if (flashcardEl) {
            flashcardEl.innerHTML = '<p class="loading">Loading flashcards...</p>';
        }

        // Fetch appropriate data
        let data;
        switch (mode) {
            case 'hiragana':
                data = await window.japaneseApp.fetchData('hiragana');
                // Flatten the data structure
                flashcardData = [
                    ...data.basic,
                    ...data.dakuon,
                    ...data.combinations
                ];
                break;
            case 'katakana':
                data = await window.japaneseApp.fetchData('katakana');
                // Flatten the data structure
                flashcardData = [
                    ...data.basic,
                    ...data.dakuon,
                    ...data.combinations,
                    ...data.extended
                ];
                break;
            case 'vocabulary':
                data = await window.japaneseApp.fetchData('beginner_vocab');
                flashcardData = data.vocabulary;
                break;
            default:
                console.error('Invalid study mode:', mode);
                return;
        }

        // Shuffle the data
        shuffleArray(flashcardData);

        // Reset index
        currentIndex = 0;

        // Show first flashcard
        createFlashcardUI();
        updateFlashcard();

    } catch (error) {
        console.error('Error loading flashcard data:', error);
        const flashcardEl = document.querySelector('.flashcard-container');
        if (flashcardEl) {
            flashcardEl.innerHTML = '<p class="error">Failed to load flashcards. Please try refreshing the page.</p>';
        }
    }
}

/**
 * Create the flashcard UI
 */
function createFlashcardUI() {
    const container = document.querySelector('.flashcard-container');
    if (!container) return;

    // Clear previous content
    container.innerHTML = '';

    // Create flashcard element
    const flashcard = document.createElement('div');
    flashcard.className = 'flashcard';
    flashcard.innerHTML = `
        <div class="flashcard-inner">
            <div class="flashcard-front">
                <div class="flashcard-character"></div>
            </div>
            <div class="flashcard-back">
                <div class="flashcard-answer"></div>
                <div class="flashcard-details"></div>
            </div>
        </div>
    `;

    // Add click handler to flip card
    flashcard.addEventListener('click', function() {
        this.classList.toggle('flipped');
    });

    // Create controls
    const controls = document.createElement('div');
    controls.className = 'flashcard-controls';
    controls.innerHTML = `
        <button id="prevCard" class="btn">Previous</button>
        <div class="flashcard-progress">
            <span id="currentIndex">1</span> / <span id="totalCards">${flashcardData.length}</span>
        </div>
        <button id="nextCard" class="btn">Next</button>
    `;

    // Add elements to container
    container.appendChild(flashcard);
    container.appendChild(controls);

    // Add button event handlers
    document.getElementById('prevCard').addEventListener('click', showPreviousCard);
    document.getElementById('nextCard').addEventListener('click', showNextCard);
}

/**
 * Initialize control buttons
 */
function initializeControls() {
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'ArrowLeft':
                showPreviousCard();
                break;
            case 'ArrowRight':
                showNextCard();
                break;
            case ' ':
                // Space bar toggles the card flip
                document.querySelector('.flashcard').classList.toggle('flipped');
                event.preventDefault();
                break;
        }
    });
}

/**
 * Update the flashcard with current data
 */
function updateFlashcard() {
    if (flashcardData.length === 0) return;

    const card = flashcardData[currentIndex];
    const flashcard = document.querySelector('.flashcard');

    // Reset flip state
    flashcard.classList.remove('flipped');

    // Update the content based on study mode
    if (studyMode === 'hiragana' || studyMode === 'katakana') {
        // For hiragana/katakana, show character on front, romaji on back
        document.querySelector('.flashcard-character').textContent = card.character;
        document.querySelector('.flashcard-answer').textContent = card.romaji;

        let details = `Type: ${formatCharType(card.type)}`;
        if (card.base) {
            details += `<br>Base: ${card.base}`;
        }
        document.querySelector('.flashcard-details').innerHTML = details;
    } else {
        // For vocabulary, show Japanese on front, English on back
        document.querySelector('.flashcard-character').textContent = card.japanese;
        document.querySelector('.flashcard-answer').textContent = card.english;

        let details = `Reading: ${card.romaji}<br>Category: ${card.category}`;
        if (card.notes) {
            details += `<br>Note: ${card.notes}`;
        }
        document.querySelector('.flashcard-details').innerHTML = details;
    }

    // Update progress indicators
    document.getElementById('currentIndex').textContent = currentIndex + 1;
    document.getElementById('totalCards').textContent = flashcardData.length;

    // Update button states
    document.getElementById('prevCard').disabled = currentIndex === 0;
    document.getElementById('nextCard').disabled = currentIndex >= flashcardData.length - 1;
}

/**
 * Show the previous flashcard
 */
function showPreviousCard() {
    if (currentIndex > 0) {
        currentIndex--;
        updateFlashcard();
    }
}

/**
 * Show the next flashcard
 */
function showNextCard() {
    if (currentIndex < flashcardData.length - 1) {
        currentIndex++;
        updateFlashcard();
    }
}

/**
 * Format character type for display
 * @param {string} type - Character type
 * @returns {string} Formatted type string
 */
function formatCharType(type) {
    switch (type) {
        case 'vowel': return 'Vowel';
        case 'consonant': return 'Consonant';
        case 'dakuon': return 'Dakuon (Voiced)';
        case 'handakuon': return 'Handakuon (Semi-voiced)';
        case 'combo': return 'Combination';
        case 'extended': return 'Extended';
        default: return type;
    }
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
window.showPreviousCard = showPreviousCard;
window.showNextCard = showNextCard;