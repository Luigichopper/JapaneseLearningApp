// Hiragana learning page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the hiragana page
    if (window.location.pathname.includes('/hiragana')) {
        initializeHiraganaPage();
    }
});

/**
 * Initialize the hiragana learning page
 */
async function initializeHiraganaPage() {
    // Fetch hiragana data
    const hiraganaData = await window.japaneseApp.fetchData('hiragana');
    if (!hiraganaData) {
        document.getElementById('hiraganaGrid').innerHTML = '<p class="error">Failed to load hiragana data. Please try refreshing the page.</p>';
        return;
    }

    // Initialize tabs
    initializeTabs(hiraganaData);

    // Load basic hiragana by default
    loadCharacterGrid('basic', hiraganaData);

    // Initialize stroke order controls
    initializeStrokeControls();
}

/**
 * Initialize tab switching functionality
 * @param {Object} data - Hiragana data object
 */
function initializeTabs(data) {
    const tabs = document.querySelectorAll('.selector-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Load corresponding character grid
            const type = this.getAttribute('data-type');
            loadCharacterGrid(type, data);
        });
    });
}

/**
 * Load character grid for the selected type
 * @param {string} type - Character type (basic, dakuon, combinations)
 * @param {Object} data - Hiragana data object
 */
function loadCharacterGrid(type, data) {
    const grid = document.getElementById('hiraganaGrid');

    // Clear existing content
    grid.innerHTML = '';

    // Check if data type exists
    if (!data[type] || !Array.isArray(data[type])) {
        grid.innerHTML = '<p class="error">No data available for this character type.</p>';
        return;
    }

    // Create character cards
    data[type].forEach(char => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.character = char.character;
        card.dataset.romaji = char.romaji;
        card.dataset.type = char.type;

        // Add extra data if available
        if (char.base) card.dataset.base = char.base;
        if (char.components) card.dataset.components = JSON.stringify(char.components);

        // Create card content
        card.innerHTML = `
            <div class="character">${char.character}</div>
            <div class="romaji">${char.romaji}</div>
        `;

        // Add click event
        card.addEventListener('click', function() {
            // Remove active class from all cards
            document.querySelectorAll('.character-card').forEach(c => c.classList.remove('active'));

            // Add active class to clicked card
            this.classList.add('active');

            // Show character details
            showCharacterDetails(this.dataset);
        });

        grid.appendChild(card);
    });
}

/**
 * Show detailed information for selected character
 * @param {Object} charData - Character data from dataset
 */
function showCharacterDetails(charData) {
    const detailEl = document.getElementById('characterDetail');

    // Create detail content
    let content = `
        <div class="character-info">
            <div class="character-large">${charData.character}</div>
            <div class="character-meta">
                <h3>${charData.romaji}</h3>
                <p>Type: ${formatCharType(charData.type)}</p>
    `;

    // Add additional info based on character type
    if (charData.type === 'dakuon' || charData.type === 'handakuon') {
        content += `<p>Base character: ${charData.base}</p>`;
    } else if (charData.type === 'combo') {
        const components = JSON.parse(charData.components);
        content += `<p>Components: ${components.join(' + ')}</p>`;
    }

    // Close meta div and add controls
    content += `
            </div>
            <div class="character-controls">
                <button class="btn" onclick="window.japaneseApp.playAudio('${charData.character}')">
                    Play Sound
                </button>
                <button class="btn" onclick="loadStrokeOrder('${charData.character}')">
                    Show Stroke Order
                </button>
            </div>
        </div>
    `;

    detailEl.innerHTML = content;

    // Scroll to details if on mobile
    if (window.innerWidth < 768) {
        detailEl.scrollIntoView({ behavior: 'smooth' });
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
 * Initialize stroke order practice controls
 */
function initializeStrokeControls() {
    const prevBtn = document.getElementById('prevStroke');
    const nextBtn = document.getElementById('nextStroke');
    const playBtn = document.getElementById('playAnimation');

    prevBtn.addEventListener('click', showPreviousStroke);
    nextBtn.addEventListener('click', showNextStroke);
    playBtn.addEventListener('click', playStrokeAnimation);
}

/**
 * Load stroke order for a character
 * @param {string} character - The character to show stroke order for
 */
function loadStrokeOrder(character) {
    // In a real application, this would load stroke order images
    // For this example, we'll simulate with a placeholder
    const strokeImage = document.getElementById('strokeOrderImage');

    // Show a placeholder image (in a real app, you'd load actual stroke order diagrams)
    strokeImage.src = `/static/images/stroke_order_placeholder.png`;
    strokeImage.alt = `Stroke order for ${character}`;
    strokeImage.classList.remove('hidden');

    // Enable controls
    document.getElementById('prevStroke').disabled = false;
    document.getElementById('nextStroke').disabled = false;
    document.getElementById('playAnimation').disabled = false;

    // Reset stroke state
    window.currentStroke = 1;
    window.totalStrokes = getEstimatedStrokeCount(character);

    // Scroll to writing section
    document.querySelector('.writing-example').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Show previous stroke in the sequence
 */
function showPreviousStroke() {
    if (window.currentStroke > 1) {
        window.currentStroke--;
        updateStrokeDisplay();
    }
}

/**
 * Show next stroke in the sequence
 */
function showNextStroke() {
    if (window.currentStroke < window.totalStrokes) {
        window.currentStroke++;
        updateStrokeDisplay();
    }
}

/**
 * Update the stroke display
 */
function updateStrokeDisplay() {
    // In a real application, this would update the stroke order image
    // For this example, we'll just update a text indicator
    const strokeImage = document.getElementById('strokeOrderImage');
    strokeImage.alt = `Stroke ${window.currentStroke} of ${window.totalStrokes}`;

    // Update button states
    document.getElementById('prevStroke').disabled = window.currentStroke <= 1;
    document.getElementById('nextStroke').disabled = window.currentStroke >= window.totalStrokes;
}

/**
 * Play animation of stroke order
 */
function playStrokeAnimation() {
    // Reset to first stroke
    window.currentStroke = 1;
    updateStrokeDisplay();

    // Disable controls during animation
    document.getElementById('prevStroke').disabled = true;
    document.getElementById('nextStroke').disabled = true;
    document.getElementById('playAnimation').disabled = true;

    // Animate through strokes
    const animateStrokes = () => {
        if (window.currentStroke < window.totalStrokes) {
            window.currentStroke++;
            updateStrokeDisplay();
            setTimeout(animateStrokes, 1000);
        } else {
            // Re-enable controls after animation
            document.getElementById('prevStroke').disabled = false;
            document.getElementById('nextStroke').disabled = window.currentStroke >= window.totalStrokes;
            document.getElementById('playAnimation').disabled = false;
        }
    };

    // Start animation
    setTimeout(animateStrokes, 1000);
}

/**
 * Estimate stroke count for a character
 * @param {string} character - The character
 * @returns {number} Estimated stroke count
 */
function getEstimatedStrokeCount(character) {
    // In a real application, this would come from a database
    // For this example, we'll return a random number between 1 and 6
    return Math.floor(Math.random() * 6) + 1;
}

// Make functions available globally
window.loadStrokeOrder = loadStrokeOrder;
window.showPreviousStroke = showPreviousStroke;
window.showNextStroke = showNextStroke;
window.playStrokeAnimation = playStrokeAnimation;