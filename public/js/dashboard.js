// Dashboard functionality for OSINT Framework
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // Initialize dashboard components
    loadDashboardStats();
    loadRecentActivity();
    loadQuickActions();
    loadRecentTools();
    
    // Initialize real-time updates
    initializeRealTimeUpdates();
    
    // Initialize search functionality
    initializeDashboardSearch();
}

function loadDashboardStats() {
    const statsContainer = document.getElementById('dashboard-stats');
    if (!statsContainer) return;

    // Simulate loading stats
    const stats = [
        { title: 'Total Tools', value: '150+', change: '+12', changeType: 'positive', icon: '🔧', color: 'blue' },
        { title: 'Searches Today', value: '1,247', change: '+23%', changeType: 'positive', icon: '🔍', color: 'green' },
        { title: 'Reports Generated', value: '89', change: '+5', changeType: 'positive', icon: '📊', color: 'yellow' },
        { title: 'Active Users', value: '342', change: '-2%', changeType: 'negative', icon: '👥', color: 'red' }
    ];

    statsContainer.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <div class="stat-header">
                <span class="stat-title">${stat.title}</span>
                <div class="stat-icon ${stat.color}">${stat.icon}</div>
            </div>
            <div class="stat-value">${stat.value}</div>
            <div class="stat-change ${stat.changeType}">
                ${stat.changeType === 'positive' ? '↗' : '↘'} ${stat.change}
            </div>
        </div>
    `).join('');
}

function loadRecentActivity() {
    const activityContainer = document.getElementById('recent-activity');
    if (!activityContainer) return;

    // Simulate recent activity
    const activities = [
        { text: 'Domain analysis completed for example.com', time: '2 minutes ago', icon: '🌐' },
        { text: 'AI threat assessment generated', time: '5 minutes ago', icon: '🤖' },
        { text: 'Social media search executed', time: '12 minutes ago', icon: '📱' },
        { text: 'Report exported to PDF', time: '18 minutes ago', icon: '📄' },
        { text: 'New tool added: Advanced Image Analysis', time: '1 hour ago', icon: '🆕' }
    ];

    activityContainer.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

function loadQuickActions() {
    const actionsContainer = document.getElementById('quick-actions');
    if (!actionsContainer) return;

    const actions = [
        { title: 'Domain Search', desc: 'Analyze domains and websites', icon: '🌐', url: '/tools?category=network' },
        { title: 'Social Media', desc: 'Search across social platforms', icon: '📱', url: '/tools?category=socialMedia' },
        { title: 'AI Analysis', desc: 'Get AI-powered insights', icon: '🤖', url: '/analysis' },
        { title: 'Generate Report', desc: 'Create comprehensive reports', icon: '📊', url: '/reports' }
    ];

    actionsContainer.innerHTML = actions.map(action => `
        <a href="${action.url}" class="quick-action">
            <div class="quick-action-icon">${action.icon}</div>
            <div class="quick-action-title">${action.title}</div>
            <div class="quick-action-desc">${action.desc}</div>
        </a>
    `).join('');
}

function loadRecentTools() {
    const toolsContainer = document.getElementById('recent-tools');
    if (!toolsContainer) return;

    // Simulate recent tools
    const tools = [
        { name: 'Domain Analysis', category: 'Network', icon: '🌐' },
        { name: 'Social Media Search', category: 'Social Media', icon: '📱' },
        { name: 'Image Analysis', category: 'Images', icon: '🖼️' },
        { name: 'Email Validation', category: 'People', icon: '📧' }
    ];

    toolsContainer.innerHTML = tools.map(tool => `
        <div class="tool-item">
            <div class="tool-icon">${tool.icon}</div>
            <div class="tool-info">
                <div class="tool-name">${tool.name}</div>
                <div class="tool-category">${tool.category}</div>
            </div>
            <div class="tool-actions">
                <button class="btn btn-sm btn-primary" onclick="openTool('${tool.name}')">Open</button>
            </div>
        </div>
    `).join('');
}

function initializeRealTimeUpdates() {
    // Simulate real-time updates every 30 seconds
    setInterval(() => {
        updateActivityFeed();
    }, 30000);
}

function updateActivityFeed() {
    const activityContainer = document.getElementById('recent-activity');
    if (!activityContainer) return;

    // Add a new activity item
    const newActivity = {
        text: 'Real-time update: System health check completed',
        time: 'Just now',
        icon: '✅'
    };

    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
        <div class="activity-icon">${newActivity.icon}</div>
        <div class="activity-content">
            <div class="activity-text">${newActivity.text}</div>
            <div class="activity-time">${newActivity.time}</div>
        </div>
    `;

    // Add to the top of the list
    activityContainer.insertBefore(activityItem, activityContainer.firstChild);

    // Remove oldest item if more than 5 items
    const items = activityContainer.querySelectorAll('.activity-item');
    if (items.length > 5) {
        items[items.length - 1].remove();
    }
}

function initializeDashboardSearch() {
    const searchInput = document.getElementById('dashboard-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', debounce((event) => {
        const query = event.target.value.toLowerCase();
        if (query.length < 2) return;

        // Simulate search results
        const results = [
            { name: 'Domain Analysis', category: 'Network', url: '/tools?category=network&tool=domainAnalysis' },
            { name: 'Social Media Search', category: 'Social Media', url: '/tools?category=socialMedia&tool=socialMediaSearch' },
            { name: 'AI Analysis', category: 'Analysis', url: '/analysis' }
        ].filter(item => 
            item.name.toLowerCase().includes(query) || 
            item.category.toLowerCase().includes(query)
        );

        displaySearchResults(results);
    }, 300));
}

function displaySearchResults(results) {
    let resultsContainer = document.getElementById('search-results');
    
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'search-results';
        resultsContainer.className = 'search-results';
        document.getElementById('dashboard-search').parentNode.appendChild(resultsContainer);
    }

    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
        return;
    }

    resultsContainer.innerHTML = results.map(result => `
        <div class="search-result-item" onclick="window.location.href='${result.url}'">
            <div class="result-name">${result.name}</div>
            <div class="result-category">${result.category}</div>
        </div>
    `).join('');

    // Add styles for search results
    if (!document.getElementById('search-results-styles')) {
        const style = document.createElement('style');
        style.id = 'search-results-styles';
        style.textContent = `
            .search-results {
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
            }
            .search-result-item {
                padding: 0.75rem 1rem;
                cursor: pointer;
                border-bottom: 1px solid #f3f4f6;
                transition: background-color 0.2s;
            }
            .search-result-item:hover {
                background: #f9fafb;
            }
            .search-result-item:last-child {
                border-bottom: none;
            }
            .result-name {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 0.25rem;
            }
            .result-category {
                font-size: 0.875rem;
                color: #6b7280;
            }
            .no-results {
                padding: 1rem;
                text-align: center;
                color: #6b7280;
            }
        `;
        document.head.appendChild(style);
    }
}

function openTool(toolName) {
    // Navigate to the tools page with the specific tool
    window.location.href = `/tools?search=${encodeURIComponent(toolName)}`;
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

// Export functions for global use
window.Dashboard = {
    loadDashboardStats,
    loadRecentActivity,
    loadQuickActions,
    loadRecentTools,
    openTool
}; 