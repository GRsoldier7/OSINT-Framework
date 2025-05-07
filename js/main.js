/**
 * OSINT Framework - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize any interactive elements
    initializeToolCards();
    
    // Check for dark mode preference
    checkDarkMode();
});

/**
 * Initialize tool cards with click events
 */
function initializeToolCards() {
    const toolCards = document.querySelectorAll('.tool-card a');
    
    toolCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // If the link is "Coming Soon", prevent navigation
            if (this.textContent.trim() === 'Coming Soon') {
                e.preventDefault();
                alert('This tool is coming soon! Check back later for updates.');
            }
        });
    });
}

/**
 * Check for dark mode preference
 */
function checkDarkMode() {
    // Check if user prefers dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // User prefers dark mode
        // This is just a placeholder for future dark mode implementation
        console.log('User prefers dark mode');
    }
}

/**
 * Track tool usage (for future analytics)
 */
function trackToolUsage(toolName) {
    // This is a placeholder for future analytics implementation
    console.log(`Tool used: ${toolName}`);
    
    // Store in local storage for history
    const history = JSON.parse(localStorage.getItem('osint_tool_history') || '[]');
    history.unshift({
        tool: toolName,
        timestamp: new Date().toISOString()
    });
    
    // Limit history to 20 items
    if (history.length > 20) {
        history.pop();
    }
    
    localStorage.setItem('osint_tool_history', JSON.stringify(history));
}

/**
 * Save search query to history
 */
function saveToHistory(query, tool) {
    const history = JSON.parse(localStorage.getItem('osint_search_history') || '[]');
    
    // Add to history
    history.unshift({
        query: query,
        tool: tool,
        timestamp: new Date().toISOString()
    });
    
    // Limit history to 20 items
    if (history.length > 20) {
        history.pop();
    }
    
    localStorage.setItem('osint_search_history', JSON.stringify(history));
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

/**
 * Clear all search history
 */
function clearHistory() {
    if (confirm('Are you sure you want to clear all search history?')) {
        localStorage.removeItem('osint_search_history');
        localStorage.removeItem('osint_tool_history');
        alert('History cleared successfully');
    }
}

/**
 * Helper function to open multiple URLs
 */
function openMultipleUrls(urls) {
    // Check if pop-up blocker might be active
    if (urls.length > 3) {
        alert(`You're about to open ${urls.length} tabs. Make sure your pop-up blocker allows this.`);
    }
    
    // Open URLs with a slight delay to avoid pop-up blockers
    urls.forEach((url, index) => {
        setTimeout(() => {
            window.open(url, '_blank');
        }, index * 100);
    });
}

/**
 * Helper function to validate input
 */
function validateInput(input, type) {
    switch (type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(input);
        
        case 'domain':
            const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
            return domainRegex.test(input);
            
        case 'ip':
            const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
            return ipv4Regex.test(input) || ipv6Regex.test(input);
            
        case 'username':
            // Basic username validation (alphanumeric, underscore, dot, dash)
            const usernameRegex = /^[a-zA-Z0-9._-]{3,30}$/;
            return usernameRegex.test(input);
            
        default:
            // For general search, just make sure it's not empty
            return input.trim().length > 0;
    }
}
