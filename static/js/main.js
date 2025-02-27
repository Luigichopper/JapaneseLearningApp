// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components based on current page
    const currentPage = getCurrentPage();

    // Common initialization for all pages
    initializeCommon();

    // Page-specific initialization
    switch(currentPage) {
        case 'hiragana':
            // Hiragana initialization handled by hiragana.js
            break;
        case 'katakana':
            // Katakana initialization handled by katakana.js
            break;
        case 'vocabulary':
            // Vocabulary initialization handled by vocabulary.js
            break;
        case 'flashcards':
            // Flashcards initialization handled by flashcards.js
            break;
        case 'quiz':
            // Quiz initialization handled by quiz.js
            break;
        default:
            // Home page or other pages
            break;
    }
});

/**
 * Determine current page based on URL
 * @returns {string} The current page name
 */
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('/hiragana')) return 'hiragana';
    if (path.includes('/katakana')) return 'katakana';
    if (path.includes('/vocabulary')) return 'vocabulary';
    if (path.includes('/flashcards')) return 'flashcards';
    if (path.includes('/quiz')) return 'quiz';
    return 'home';
}

/**
 * Initialize common elements and event handlers
 */
function initializeCommon() {
    // Add any common functionality here

    // Example: Add active class to current nav item
    const currentPath = window.location.pathname;
    document.querySelectorAll('nav a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

/**
 * Fetch data from API
 * @param {string} dataType - Type of data to fetch (hiragana, katakana, etc.)
 * @returns {Promise} Promise resolving to the fetched data
 */
async function fetchData(dataType) {
    try {
        const response = await fetch(`/api/data/${dataType}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${dataType} data`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

/**
 * Play audio for a given text
 * @param {string} text - Japanese text to speak
 */
async function playAudio(text) {
    try {
        const response = await fetch('/api/speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        });

        if (!response.ok) {
            throw new Error('Failed to generate speech');
        }

        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
    } catch (error) {
        console.error('Error playing audio:', error);
    }
}

/**
 * Show a notification to the user
 * @param {string} message - Message to display
 * @param {string} type - Notification type (success, error, warning)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add to DOM
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Export utility functions for use in other scripts
window.japaneseApp = {
    fetchData,
    playAudio,
    showNotification
};