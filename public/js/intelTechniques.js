/**
 * IntelTechniques Tools Integration Module
 * Provides exponentially optimized functionality for IntelTechniques tools
 */

class IntelTechniquesManager {
    constructor() {
        this.tools = {};
        this.categories = {};
        this.currentTool = null;
        this.searchHistory = [];
        this.favorites = this.loadFavorites();
        this.quickActions = this.initializeQuickActions();
        
        this.init();
    }

    async init() {
        await this.loadIntelTechniquesTools();
        this.setupEventListeners();
        this.renderInterface();
        this.initializeKeyboardShortcuts();
    }

    async loadIntelTechniquesTools() {
        try {
            const response = await fetch('/api/tools');
            const data = await response.json();
            
            if (data.success) {
                this.tools = data.data.tools;
                this.categories = data.data.categories;
                console.log(`Loaded ${data.data.totalTools} IntelTechniques tools`);
            }
        } catch (error) {
            console.error('Failed to load IntelTechniques tools:', error);
        }
    }

    initializeQuickActions() {
        return {
            'email-search': {
                name: 'Email Search',
                icon: 'fas fa-envelope',
                action: () => this.quickEmailSearch(),
                shortcut: 'Ctrl+E'
            },
            'username-search': {
                name: 'Username Search',
                icon: 'fas fa-user',
                action: () => this.quickUsernameSearch(),
                shortcut: 'Ctrl+U'
            },
            'domain-analysis': {
                name: 'Domain Analysis',
                icon: 'fas fa-globe',
                action: () => this.quickDomainAnalysis(),
                shortcut: 'Ctrl+D'
            },
            'ip-lookup': {
                name: 'IP Lookup',
                icon: 'fas fa-network-wired',
                action: () => this.quickIPLookup(),
                shortcut: 'Ctrl+I'
            },
            'social-media': {
                name: 'Social Media Search',
                icon: 'fas fa-share-alt',
                action: () => this.quickSocialMediaSearch(),
                shortcut: 'Ctrl+S'
            },
            'image-search': {
                name: 'Image Search',
                icon: 'fas fa-image',
                action: () => this.quickImageSearch(),
                shortcut: 'Ctrl+M'
            }
        };
    }

    setupEventListeners() {
        // Quick action buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.quick-action-btn')) {
                e.preventDefault();
                const action = e.target.dataset.action;
                if (this.quickActions[action]) {
                    this.quickActions[action].action();
                }
            }
        });

        // Tool execution
        document.addEventListener('click', (e) => {
            if (e.target.matches('.execute-intel-tool')) {
                e.preventDefault();
                const toolId = e.target.dataset.toolId;
                const category = e.target.dataset.category;
                this.executeIntelTechniquesTool(toolId, category);
            }
        });

        // Search functionality
        const searchInput = document.getElementById('intel-search');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.searchIntelTechniquesTools();
            }, 300));
        }

        // Batch operations
        document.addEventListener('click', (e) => {
            if (e.target.matches('.batch-search')) {
                e.preventDefault();
                this.performBatchSearch();
            }
        });
    }

    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Quick actions
            if (e.ctrlKey) {
                switch (e.key.toLowerCase()) {
                    case 'e':
                        e.preventDefault();
                        this.quickEmailSearch();
                        break;
                    case 'u':
                        e.preventDefault();
                        this.quickUsernameSearch();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.quickDomainAnalysis();
                        break;
                    case 'i':
                        e.preventDefault();
                        this.quickIPLookup();
                        break;
                    case 's':
                        e.preventDefault();
                        this.quickSocialMediaSearch();
                        break;
                    case 'm':
                        e.preventDefault();
                        this.quickImageSearch();
                        break;
                }
            }
        });
    }

    renderInterface() {
        const container = document.getElementById('intel-techniques-container');
        if (!container) return;

        container.innerHTML = `
            <div class="intel-header">
                <h1>IntelTechniques Integration</h1>
                <p>Exponentially optimized OSINT tools powered by IntelTechniques methodology</p>
            </div>

            <div class="quick-actions-panel">
                <h3>Quick Actions</h3>
                <div class="quick-actions-grid">
                    ${Object.entries(this.quickActions).map(([key, action]) => `
                        <button class="quick-action-btn" data-action="${key}">
                            <i class="${action.icon}"></i>
                            <span>${action.name}</span>
                            <small>${action.shortcut}</small>
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="intel-search-section">
                <div class="search-container">
                    <input type="text" id="intel-search" placeholder="Search IntelTechniques tools..." class="search-input">
                    <button class="search-btn" onclick="intelTechniquesManager.searchIntelTechniquesTools()">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
                <div class="search-filters">
                    <select id="category-filter">
                        <option value="">All Categories</option>
                    </select>
                    <select id="type-filter">
                        <option value="">All Types</option>
                        <option value="internal">Internal Tools</option>
                        <option value="external">External Tools</option>
                    </select>
                </div>
            </div>

            <div class="intel-tools-grid" id="intel-tools-grid"></div>

            <div class="batch-operations">
                <h3>Batch Operations</h3>
                <div class="batch-inputs">
                    <textarea id="batch-input" placeholder="Enter multiple items (one per line) for batch search"></textarea>
                    <button class="batch-search">Execute Batch Search</button>
                </div>
            </div>

            <div class="results-panel" id="results-panel"></div>
        `;

        this.renderToolsGrid();
    }

    renderToolsGrid() {
        const grid = document.getElementById('intel-tools-grid');
        if (!grid) return;

        let html = '';
        
        for (const [category, tools] of Object.entries(this.tools)) {
            const categoryInfo = this.categories[category];
            if (!categoryInfo) continue;

            html += `
                <div class="intel-category-section">
                    <h3 class="category-title">
                        <i class="${categoryInfo.icon}" style="color: ${categoryInfo.color}"></i>
                        ${categoryInfo.name}
                    </h3>
                    <p class="category-description">${categoryInfo.description}</p>
                    <div class="tools-row">
                        ${Object.entries(tools).map(([toolId, tool]) => `
                            <div class="intel-tool-card" data-tool-id="${toolId}" data-category="${category}">
                                <div class="tool-header">
                                    <h4>${tool.name}</h4>
                                    <div class="tool-badges">
                                        ${tool.api ? '<span class="badge api">API</span>' : ''}
                                        ${tool.internal ? '<span class="badge internal">Internal</span>' : ''}
                                    </div>
                                </div>
                                <p class="tool-description">${tool.description}</p>
                                <div class="tool-features">
                                    ${(tool.features || []).map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                                </div>
                                <div class="tool-actions">
                                    <button class="execute-intel-tool" data-tool-id="${toolId}" data-category="${category}">
                                        Execute
                                    </button>
                                    <button class="tool-info" onclick="intelTechniquesManager.showToolInfo('${toolId}', '${category}')">
                                        Info
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        grid.innerHTML = html;
    }

    async executeIntelTechniquesTool(toolId, category) {
        try {
            this.showLoading(`Executing ${toolId}...`);
            
            const response = await fetch(`/api/tools/${category}/${toolId}/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    parameters: this.getToolParameters(toolId, category)
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.displayResults(result.data, toolId, category);
                this.addToSearchHistory(toolId, category, result.data);
            } else {
                this.showError(`Failed to execute ${toolId}: ${result.message}`);
            }
        } catch (error) {
            console.error('Error executing IntelTechniques tool:', error);
            this.showError(`Error executing ${toolId}: ${error.message}`);
        }
    }

    getToolParameters(toolId, category) {
        // Get parameters based on tool type
        const tool = this.tools[category]?.[toolId];
        if (!tool) return {};

        const parameters = {};
        
        // Prompt user for parameters based on tool type
        switch (toolId) {
            case 'emailSearch':
                parameters.email = prompt('Enter email address:');
                break;
            case 'usernameSearch':
                parameters.username = prompt('Enter username:');
                break;
            case 'domainAnalysis':
                parameters.domain = prompt('Enter domain:');
                break;
            case 'ipAnalysis':
                parameters.ip = prompt('Enter IP address:');
                break;
            case 'googleAdvanced':
                parameters.query = prompt('Enter search query:');
                parameters.site = prompt('Enter site restriction (optional):');
                break;
            default:
                parameters.query = prompt('Enter search query:');
        }

        return parameters;
    }

    displayResults(data, toolId, category) {
        const resultsPanel = document.getElementById('results-panel');
        if (!resultsPanel) return;

        const tool = this.tools[category]?.[toolId];
        const toolName = tool ? tool.name : toolId;

        let resultsHtml = `
            <div class="results-header">
                <h3>Results: ${toolName}</h3>
                <span class="timestamp">${new Date().toLocaleString()}</span>
            </div>
        `;

        if (data.external) {
            resultsHtml += `
                <div class="external-tool-result">
                    <p>This tool redirects to an external service:</p>
                    <a href="${data.url}" target="_blank" class="external-link">
                        <i class="fas fa-external-link-alt"></i>
                        Open ${toolName}
                    </a>
                </div>
            `;
        } else {
            resultsHtml += this.formatResults(data, toolId);
        }

        resultsHtml += `
            <div class="results-actions">
                <button onclick="intelTechniquesManager.exportResults()">Export Results</button>
                <button onclick="intelTechniquesManager.saveToFavorites('${toolId}', '${category}')">Save to Favorites</button>
                <button onclick="intelTechniquesManager.shareResults()">Share Results</button>
            </div>
        `;

        resultsPanel.innerHTML = resultsHtml;
        resultsPanel.scrollIntoView({ behavior: 'smooth' });
    }

    formatResults(data, toolId) {
        let html = '<div class="results-content">';

        switch (toolId) {
            case 'emailSearch':
                html += this.formatEmailResults(data);
                break;
            case 'usernameSearch':
                html += this.formatUsernameResults(data);
                break;
            case 'domainAnalysis':
                html += this.formatDomainResults(data);
                break;
            case 'ipAnalysis':
                html += this.formatIPResults(data);
                break;
            default:
                html += this.formatGenericResults(data);
        }

        html += '</div>';
        return html;
    }

    formatEmailResults(data) {
        return `
            <div class="email-results">
                <div class="result-section">
                    <h4>Email Information</h4>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Verified:</strong> <span class="${data.verified ? 'success' : 'error'}">${data.verified ? 'Yes' : 'No'}</span></p>
                </div>
                
                ${data.socialMediaAccounts?.length ? `
                    <div class="result-section">
                        <h4>Social Media Accounts</h4>
                        <div class="social-accounts">
                            ${data.socialMediaAccounts.map(account => `
                                <div class="social-account">
                                    <i class="fab fa-${account.platform.toLowerCase()}"></i>
                                    <a href="${account.url}" target="_blank">${account.username}</a>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${data.breaches?.length ? `
                    <div class="result-section">
                        <h4>Data Breaches</h4>
                        <div class="breach-list">
                            ${data.breaches.map(breach => `<span class="breach-tag">${breach}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    formatUsernameResults(data) {
        return `
            <div class="username-results">
                <div class="result-section">
                    <h4>Username: ${data.username}</h4>
                    <p><strong>Total Platforms Found:</strong> ${data.totalFound}</p>
                </div>
                
                <div class="result-section">
                    <h4>Platform Analysis</h4>
                    <div class="platform-grid">
                        ${Object.entries(data.platforms).map(([platform, info]) => `
                            <div class="platform-item ${info.found ? 'found' : 'not-found'}">
                                <i class="fab fa-${platform.toLowerCase()}"></i>
                                <span>${platform}</span>
                                ${info.found ? `<a href="${info.url}" target="_blank">View Profile</a>` : '<span>Not Found</span>'}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    formatDomainResults(data) {
        return `
            <div class="domain-results">
                <div class="result-section">
                    <h4>Domain: ${data.domain}</h4>
                </div>
                
                <div class="result-section">
                    <h4>WHOIS Information</h4>
                    <div class="whois-info">
                        <p><strong>Registrar:</strong> ${data.whois.registrar}</p>
                        <p><strong>Creation Date:</strong> ${data.whois.creationDate}</p>
                        <p><strong>Expiration Date:</strong> ${data.whois.expirationDate}</p>
                        <p><strong>Status:</strong> <span class="status-${data.whois.status}">${data.whois.status}</span></p>
                    </div>
                </div>
                
                <div class="result-section">
                    <h4>DNS Records</h4>
                    <div class="dns-records">
                        <p><strong>A Records:</strong> ${data.dns.a.join(', ')}</p>
                        <p><strong>MX Records:</strong> ${data.dns.mx.join(', ')}</p>
                        <p><strong>NS Records:</strong> ${data.dns.ns.join(', ')}</p>
                    </div>
                </div>
                
                <div class="result-section">
                    <h4>Security Assessment</h4>
                    <div class="security-info">
                        <p><strong>SSL Valid:</strong> <span class="${data.ssl.valid ? 'success' : 'error'}">${data.ssl.valid ? 'Yes' : 'No'}</span></p>
                        <p><strong>Malware:</strong> <span class="${data.security.hasMalware ? 'error' : 'success'}">${data.security.hasMalware ? 'Detected' : 'Clean'}</span></p>
                        <p><strong>Reputation:</strong> <span class="reputation-${data.security.reputation}">${data.security.reputation}</span></p>
                    </div>
                </div>
            </div>
        `;
    }

    formatIPResults(data) {
        return `
            <div class="ip-results">
                <div class="result-section">
                    <h4>IP Address: ${data.ip}</h4>
                </div>
                
                <div class="result-section">
                    <h4>Geolocation</h4>
                    <div class="geo-info">
                        <p><strong>Country:</strong> ${data.geolocation.country}</p>
                        <p><strong>Region:</strong> ${data.geolocation.region}</p>
                        <p><strong>City:</strong> ${data.geolocation.city}</p>
                        <p><strong>Coordinates:</strong> ${data.geolocation.lat}, ${data.geolocation.lon}</p>
                    </div>
                </div>
                
                <div class="result-section">
                    <h4>Network Information</h4>
                    <div class="network-info">
                        <p><strong>ISP:</strong> ${data.isp}</p>
                        <p><strong>Organization:</strong> ${data.organization}</p>
                    </div>
                </div>
                
                <div class="result-section">
                    <h4>Threat Intelligence</h4>
                    <div class="threat-info">
                        <p><strong>Malicious:</strong> <span class="${data.threatIntelligence.isMalicious ? 'error' : 'success'}">${data.threatIntelligence.isMalicious ? 'Yes' : 'No'}</span></p>
                        <p><strong>Reputation:</strong> <span class="reputation-${data.threatIntelligence.reputation}">${data.threatIntelligence.reputation}</span></p>
                    </div>
                </div>
            </div>
        `;
    }

    formatGenericResults(data) {
        return `
            <div class="generic-results">
                <pre>${JSON.stringify(data, null, 2)}</pre>
            </div>
        `;
    }

    // Quick Action Methods
    quickEmailSearch() {
        const email = prompt('Enter email address for comprehensive search:');
        if (email) {
            this.executeIntelTechniquesTool('emailSearch', 'emailAddresses');
        }
    }

    quickUsernameSearch() {
        const username = prompt('Enter username for cross-platform search:');
        if (username) {
            this.executeIntelTechniquesTool('usernameSearch', 'usernames');
        }
    }

    quickDomainAnalysis() {
        const domain = prompt('Enter domain for comprehensive analysis:');
        if (domain) {
            this.executeIntelTechniquesTool('domainAnalysis', 'domains');
        }
    }

    quickIPLookup() {
        const ip = prompt('Enter IP address for lookup:');
        if (ip) {
            this.executeIntelTechniquesTool('ipAnalysis', 'ipAddresses');
        }
    }

    quickSocialMediaSearch() {
        const query = prompt('Enter search query for social media:');
        if (query) {
            this.executeIntelTechniquesTool('googleAdvanced', 'searchEngines');
        }
    }

    quickImageSearch() {
        const imageUrl = prompt('Enter image URL for reverse search:');
        if (imageUrl) {
            this.executeIntelTechniquesTool('reverseImageSearch', 'images');
        }
    }

    // Utility Methods
    debounce(func, wait) {
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

    showLoading(message) {
        const resultsPanel = document.getElementById('results-panel');
        if (resultsPanel) {
            resultsPanel.innerHTML = `
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    showError(message) {
        const resultsPanel = document.getElementById('results-panel');
        if (resultsPanel) {
            resultsPanel.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    addToSearchHistory(toolId, category, data) {
        this.searchHistory.unshift({
            toolId,
            category,
            data,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 searches
        if (this.searchHistory.length > 50) {
            this.searchHistory = this.searchHistory.slice(0, 50);
        }
        
        localStorage.setItem('intelTechniquesHistory', JSON.stringify(this.searchHistory));
    }

    loadFavorites() {
        try {
            return JSON.parse(localStorage.getItem('intelTechniquesFavorites')) || [];
        } catch {
            return [];
        }
    }

    saveToFavorites(toolId, category) {
        const tool = this.tools[category]?.[toolId];
        if (tool) {
            const favorite = {
                toolId,
                category,
                name: tool.name,
                timestamp: new Date().toISOString()
            };
            
            this.favorites.push(favorite);
            localStorage.setItem('intelTechniquesFavorites', JSON.stringify(this.favorites));
            
            this.showNotification('Added to favorites', 'success');
        }
    }

    exportResults() {
        const resultsPanel = document.getElementById('results-panel');
        if (resultsPanel) {
            const content = resultsPanel.innerText;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inteltechniques-results-${Date.now()}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    shareResults() {
        const resultsPanel = document.getElementById('results-panel');
        if (resultsPanel && navigator.share) {
            navigator.share({
                title: 'IntelTechniques Results',
                text: resultsPanel.innerText,
                url: window.location.href
            });
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    performBatchSearch() {
        const batchInput = document.getElementById('batch-input');
        const items = batchInput.value.split('\n').filter(item => item.trim());
        
        if (items.length === 0) {
            this.showError('Please enter items for batch search');
            return;
        }
        
        // For now, just show the items
        this.showNotification(`Batch search ready for ${items.length} items`, 'info');
    }

    searchIntelTechniquesTools() {
        const query = document.getElementById('intel-search').value;
        if (!query.trim()) return;
        
        // Implement search functionality
        this.showNotification(`Searching for: ${query}`, 'info');
    }

    showToolInfo(toolId, category) {
        const tool = this.tools[category]?.[toolId];
        if (tool) {
            alert(`${tool.name}\n\n${tool.description}\n\nFeatures: ${(tool.features || []).join(', ')}`);
        }
    }
}

// Initialize IntelTechniques Manager
const intelTechniquesManager = new IntelTechniquesManager(); 