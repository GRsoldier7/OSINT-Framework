// Search functionality for OSINT Framework
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
});

function initializeSearch() {
    // Initialize search components
    initializeSearchForm();
    initializeSearchFilters();
    initializeSearchHistory();
    initializeSearchSuggestions();
    
    // Load initial search results if query parameter exists
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
        document.getElementById('search-input').value = query;
        performSearch(query);
    }
}

function initializeSearchForm() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
                addToSearchHistory(query);
            }
        });
    }
    
    if (searchInput) {
        // Real-time search suggestions
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                showSearchSuggestions(query);
            } else {
                hideSearchSuggestions();
            }
        }, 300));
        
        // Handle keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                navigateSuggestions(e.key === 'ArrowDown' ? 1 : -1);
            } else if (e.key === 'Enter') {
                const selectedSuggestion = document.querySelector('.suggestion-item.selected');
                if (selectedSuggestion) {
                    e.preventDefault();
                    searchInput.value = selectedSuggestion.textContent;
                    hideSearchSuggestions();
                    performSearch(searchInput.value);
                }
            } else if (e.key === 'Escape') {
                hideSearchSuggestions();
            }
        });
    }
}

function initializeSearchFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            // Apply filter
            const filter = button.getAttribute('data-filter');
            applySearchFilter(filter);
        });
    });
}

function initializeSearchHistory() {
    loadSearchHistory();
}

function initializeSearchSuggestions() {
    // Create suggestions container
    const searchContainer = document.getElementById('search-input')?.parentNode;
    if (searchContainer) {
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'search-suggestions';
        suggestionsContainer.className = 'search-suggestions';
        searchContainer.appendChild(suggestionsContainer);
    }
}

function performSearch(query) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;
    
    // Show loading state
    resultsContainer.innerHTML = '<div class="loading">Searching...</div>';
    
    // Simulate API call
    setTimeout(() => {
        const results = generateSearchResults(query);
        displaySearchResults(results);
    }, 1000);
}

function generateSearchResults(query) {
    // Simulate search results based on query
    const allResults = [
        { title: 'Domain Analysis Tool', category: 'Network', description: 'Comprehensive domain information and analysis', url: '/tools?category=network&tool=domainAnalysis' },
        { title: 'Social Media Search', category: 'Social Media', description: 'Search across multiple social media platforms', url: '/tools?category=socialMedia&tool=socialMediaSearch' },
        { title: 'Email Validation', category: 'People', description: 'Validate email addresses and check deliverability', url: '/tools?category=people&tool=emailValidation' },
        { title: 'Image Analysis', category: 'Images', description: 'Analyze images for metadata and content', url: '/tools?category=images&tool=imageAnalysis' },
        { title: 'AI Analysis', category: 'Analysis', description: 'AI-powered data analysis and insights', url: '/analysis' },
        { title: 'Report Generation', category: 'Reports', description: 'Generate comprehensive OSINT reports', url: '/reports' }
    ];
    
    return allResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.category.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase())
    );
}

function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <h3>No results found</h3>
                <p>Try adjusting your search terms or browse our tools by category.</p>
                <div class="suggested-categories">
                    <a href="/tools?category=network" class="category-link">Network Tools</a>
                    <a href="/tools?category=socialMedia" class="category-link">Social Media</a>
                    <a href="/tools?category=people" class="category-link">People Search</a>
                    <a href="/tools?category=images" class="category-link">Image Analysis</a>
                </div>
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = `
        <div class="search-results-header">
            <h3>Found ${results.length} result${results.length !== 1 ? 's' : ''}</h3>
        </div>
        <div class="search-results-list">
            ${results.map(result => `
                <div class="search-result-item" onclick="window.location.href='${result.url}'">
                    <div class="result-header">
                        <h4 class="result-title">${result.title}</h4>
                        <span class="result-category">${result.category}</span>
                    </div>
                    <p class="result-description">${result.description}</p>
                    <div class="result-actions">
                        <button class="btn btn-sm btn-primary">Open Tool</button>
                        <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); addToFavorites('${result.title}')">Add to Favorites</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function showSearchSuggestions(query) {
    const suggestionsContainer = document.getElementById('search-suggestions');
    if (!suggestionsContainer) return;
    
    // Generate suggestions based on query
    const suggestions = [
        `${query} domain analysis`,
        `${query} social media`,
        `${query} email search`,
        `${query} image analysis`,
        `${query} threat assessment`
    ].filter(suggestion => suggestion.toLowerCase().includes(query.toLowerCase()));
    
    if (suggestions.length === 0) {
        hideSearchSuggestions();
        return;
    }
    
    suggestionsContainer.innerHTML = suggestions.map((suggestion, index) => `
        <div class="suggestion-item ${index === 0 ? 'selected' : ''}" data-index="${index}">
            ${suggestion}
        </div>
    `).join('');
    
    suggestionsContainer.style.display = 'block';
    
    // Add click handlers
    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            document.getElementById('search-input').value = item.textContent;
            hideSearchSuggestions();
            performSearch(item.textContent);
        });
        
        item.addEventListener('mouseenter', () => {
            suggestionsContainer.querySelectorAll('.suggestion-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
        });
    });
}

function hideSearchSuggestions() {
    const suggestionsContainer = document.getElementById('search-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
}

function navigateSuggestions(direction) {
    const suggestions = document.querySelectorAll('.suggestion-item');
    const currentSelected = document.querySelector('.suggestion-item.selected');
    
    if (suggestions.length === 0) return;
    
    let currentIndex = 0;
    if (currentSelected) {
        currentIndex = parseInt(currentSelected.getAttribute('data-index'));
    }
    
    const newIndex = (currentIndex + direction + suggestions.length) % suggestions.length;
    
    suggestions.forEach(s => s.classList.remove('selected'));
    suggestions[newIndex].classList.add('selected');
}

function applySearchFilter(filter) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;
    
    const resultItems = resultsContainer.querySelectorAll('.search-result-item');
    
    resultItems.forEach(item => {
        const category = item.querySelector('.result-category').textContent;
        
        if (filter === 'all' || category.toLowerCase() === filter.toLowerCase()) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function loadSearchHistory() {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const historyContainer = document.getElementById('search-history');
    
    if (!historyContainer || history.length === 0) return;
    
    historyContainer.innerHTML = `
        <h4>Recent Searches</h4>
        <div class="history-list">
            ${history.slice(0, 5).map(query => `
                <div class="history-item" onclick="document.getElementById('search-input').value = '${query}'; performSearch('${query}')">
                    <span class="history-query">${query}</span>
                    <button class="history-remove" onclick="event.stopPropagation(); removeFromHistory('${query}')">&times;</button>
                </div>
            `).join('')}
        </div>
    `;
}

function addToSearchHistory(query) {
    let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    
    // Remove if already exists
    history = history.filter(item => item !== query);
    
    // Add to beginning
    history.unshift(query);
    
    // Keep only last 10 searches
    history = history.slice(0, 10);
    
    localStorage.setItem('searchHistory', JSON.stringify(history));
    loadSearchHistory();
}

function removeFromHistory(query) {
    let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    history = history.filter(item => item !== query);
    localStorage.setItem('searchHistory', JSON.stringify(history));
    loadSearchHistory();
}

function addToFavorites(toolName) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (!favorites.includes(toolName)) {
        favorites.push(toolName);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        showNotification(`${toolName} added to favorites`, 'success');
    } else {
        showNotification(`${toolName} is already in favorites`, 'info');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '1rem';
    notification.style.borderRadius = '0.5rem';
    notification.style.color = 'white';
    notification.style.zIndex = '1000';
    notification.style.animation = 'slideIn 0.3s ease-out';
    
    if (type === 'success') {
        notification.style.backgroundColor = '#10b981';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
    } else {
        notification.style.backgroundColor = '#3b82f6';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add CSS for search components
const searchStyles = document.createElement('style');
searchStyles.textContent = `
    .search-suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 100;
        max-height: 300px;
        overflow-y: auto;
        display: none;
    }
    .suggestion-item {
        padding: 0.75rem 1rem;
        cursor: pointer;
        border-bottom: 1px solid #f3f4f6;
        transition: background-color 0.2s;
    }
    .suggestion-item:hover,
    .suggestion-item.selected {
        background: #f3f4f6;
    }
    .suggestion-item:last-child {
        border-bottom: none;
    }
    .search-results-header {
        margin-bottom: 1.5rem;
    }
    .search-results-header h3 {
        color: #1f2937;
        margin: 0;
    }
    .search-result-item {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
        cursor: pointer;
        transition: all 0.2s;
    }
    .search-result-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }
    .result-title {
        color: #1f2937;
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
    }
    .result-category {
        background: #f3f4f6;
        color: #374151;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 500;
    }
    .result-description {
        color: #6b7280;
        margin-bottom: 1rem;
        line-height: 1.5;
    }
    .result-actions {
        display: flex;
        gap: 0.5rem;
    }
    .no-results {
        text-align: center;
        padding: 3rem 1rem;
    }
    .no-results h3 {
        color: #1f2937;
        margin-bottom: 0.5rem;
    }
    .no-results p {
        color: #6b7280;
        margin-bottom: 2rem;
    }
    .suggested-categories {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }
    .category-link {
        background: #3b82f6;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        text-decoration: none;
        font-size: 0.875rem;
        transition: background-color 0.2s;
    }
    .category-link:hover {
        background: #2563eb;
    }
    .history-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .history-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        background: #f9fafb;
        border-radius: 0.25rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    .history-item:hover {
        background: #f3f4f6;
    }
    .history-remove {
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        font-size: 1.25rem;
        padding: 0;
        width: 1.5rem;
        height: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.25rem;
        transition: all 0.2s;
    }
    .history-remove:hover {
        background: #e5e7eb;
        color: #374151;
    }
    .loading {
        text-align: center;
        padding: 2rem;
        color: #6b7280;
    }
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(searchStyles);

// Export functions for global use
window.Search = {
    performSearch,
    showSearchSuggestions,
    hideSearchSuggestions,
    addToSearchHistory,
    removeFromHistory,
    addToFavorites
}; 