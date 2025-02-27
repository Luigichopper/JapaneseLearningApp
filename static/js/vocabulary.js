// Vocabulary page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the vocabulary page
    if (window.location.pathname.includes('/vocabulary')) {
        initializeVocabularyPage();
    }
});

// Store vocabulary data and state
let allVocabulary = [];
let filteredVocabulary = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentDifficulty = 'beginner';
let currentCategory = 'all';
let currentSearch = '';

/**
 * Initialize the vocabulary page
 */
async function initializeVocabularyPage() {
    // Set up event listeners for controls
    initializeControls();

    // Load initial vocabulary data
    await loadVocabularyData('beginner');
}

/**
 * Initialize control elements and event listeners
 */
function initializeControls() {
    // Difficulty selector
    const difficultySelector = document.getElementById('difficultySelector');
    difficultySelector.addEventListener('change', async function() {
        currentDifficulty = this.value;
        currentPage = 1;
        await loadVocabularyData(currentDifficulty);
        filterAndDisplayVocabulary();
    });

    // Category selector
    const categorySelector = document.getElementById('categorySelector');
    categorySelector.addEventListener('change', function() {
        currentCategory = this.value;
        currentPage = 1;
        filterAndDisplayVocabulary();
    });

    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        currentSearch = this.value.toLowerCase();
        currentPage = 1;
        filterAndDisplayVocabulary();
    });

    // Pagination controls
    document.getElementById('prevPage').addEventListener('click', showPreviousPage);
    document.getElementById('nextPage').addEventListener('click', showNextPage);
}

/**
 * Load vocabulary data based on difficulty level
 * @param {string} difficulty - Difficulty level (beginner, intermediate, advanced)
 */
async function loadVocabularyData(difficulty) {
    try {
        // Show loading state
        document.getElementById('vocabularyList').innerHTML = '<div class="loading">Loading vocabulary...</div>';

        // Fetch data
        const data = await window.japaneseApp.fetchData(`${difficulty}_vocab`);

        if (data && data.vocabulary) {
            allVocabulary = data.vocabulary;
            return data.vocabulary;
        } else {
            throw new Error('Invalid vocabulary data');
        }
    } catch (error) {
        console.error('Error loading vocabulary data:', error);
        document.getElementById('vocabularyList').innerHTML = '<p class="error">Failed to load vocabulary data. Please try refreshing the page.</p>';
        return [];
    }
}

/**
 * Filter vocabulary by category and search term, then display results
 */
function filterAndDisplayVocabulary() {
    // Apply category filter
    if (currentCategory === 'all') {
        filteredVocabulary = [...allVocabulary];
    } else {
        filteredVocabulary = allVocabulary.filter(item => item.category === currentCategory);
    }

    // Apply search filter
    if (currentSearch.trim() !== '') {
        filteredVocabulary = filteredVocabulary.filter(item =>
            item.japanese.toLowerCase().includes(currentSearch) ||
            item.romaji.toLowerCase().includes(currentSearch) ||
            item.english.toLowerCase().includes(currentSearch)
        );
    }

    // Display filtered results
    displayVocabulary();
}

/**
 * Display vocabulary items with pagination
 */
function displayVocabulary() {
    const listEl = document.getElementById('vocabularyList');

    // Clear existing content
    listEl.innerHTML = '';

    // Calculate pagination
    const totalPages = Math.ceil(filteredVocabulary.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredVocabulary.length);

    // Show message if no results
    if (filteredVocabulary.length === 0) {
        listEl.innerHTML = '<p class="no-results">No vocabulary items match your criteria.</p>';
        document.getElementById('prevPage').disabled = true;
        document.getElementById('nextPage').disabled = true;
        document.getElementById('currentPage').textContent = '0';
        document.getElementById('totalPages').textContent = '0';
        return;
    }

    // Get items for current page
    const pageItems = filteredVocabulary.slice(startIndex, endIndex);

    // Create vocabulary items
    pageItems.forEach(item => {
        const vocabItem = document.createElement('div');
        vocabItem.className = 'vocabulary-item';

        vocabItem.innerHTML = `
            <div class="vocabulary-main">
                <span class="vocabulary-japanese">${item.japanese}</span>
                <span class="vocabulary-english">${item.english}</span>
            </div>
            <div class="vocabulary-meta">
                <span class="vocabulary-romaji">Reading: ${item.romaji}</span>
                <span class="vocabulary-category">Category: ${item.category}</span>
                ${item.notes ? `<span class="vocabulary-notes">Note: ${item.notes}</span>` : ''}
            </div>
            <div class="vocabulary-controls">
                <button class="btn small play-audio">Play Sound</button>
                <button class="btn small show-example">Show Example</button>
            </div>
            ${item.example ? `<div class="vocabulary-example hidden"><p>${item.example}</p></div>` : ''}
        `;

        // Add click handler for audio button
        vocabItem.querySelector('.play-audio').addEventListener('click', function() {
            window.japaneseApp.playAudio(item.japanese);
        });

        // Add click handler for example button
        const exampleBtn = vocabItem.querySelector('.show-example');
        const exampleDiv = vocabItem.querySelector('.vocabulary-example');

        if (exampleDiv) {
            exampleBtn.addEventListener('click', function() {
                exampleDiv.classList.toggle('hidden');
                this.textContent = exampleDiv.classList.contains('hidden') ? 'Show Example' : 'Hide Example';
            });
        } else {
            exampleBtn.disabled = true;
        }

        listEl.appendChild(vocabItem);
    });

    // Update pagination information
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;

    // Update pagination button states
    document.getElementById('prevPage').disabled = currentPage <= 1;
    document.getElementById('nextPage').disabled = currentPage >= totalPages;
}

/**
 * Show the previous page of vocabulary items
 */
function showPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayVocabulary();
        // Scroll to top of list
        document.querySelector('.vocabulary-container').scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Show the next page of vocabulary items
 */
function showNextPage() {
    const totalPages = Math.ceil(filteredVocabulary.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayVocabulary();
        // Scroll to top of list
        document.querySelector('.vocabulary-container').scrollIntoView({ behavior: 'smooth' });
    }
}

// Make functions available globally
window.showPreviousPage = showPreviousPage;
window.showNextPage = showNextPage;