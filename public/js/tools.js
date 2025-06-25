/**
 * OSINT Framework Tools Hub - Ultimate World Class JavaScript v7.0
 * Phenomenal functionality with advanced sorting, filtering, and UX
 */

class UltimateOSINTToolsHub {
    constructor() {
        this.tools = [];
        this.filteredTools = [];
        this.favorites = [];
        this.currentCategory = null;
        this.currentSubcategory = null;
        this.searchQuery = '';
        this.viewMode = 'grid';
        this.isLoading = false;
        this.sidebarCollapsed = false;
        this.theme = localStorage.getItem('theme') || 'light';
        this.sortBy = 'name';
        this.sortOrder = 'asc';
        this.filters = {
            category: '',
            subcategory: '',
            type: '',
            sourceRepo: '',
            tags: []
        };
        this.analytics = {
            totalTools: 0,
            categories: {},
            favorites: 0,
            recentSearches: []
        };
        
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            this.setupTheme();
            this.setupAnimations();
            this.loadFavorites();
            await this.loadTools();
            this.setupAdvancedFeatures();
            this.showWelcomeMessage();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize tools hub');
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
            searchInput.addEventListener('keydown', this.handleSearchKeydown.bind(this));
        }

        // Filter functionality
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', this.handleFilterChange.bind(this));
        });

        // View mode toggle
        const viewToggles = document.querySelectorAll('.view-toggle-btn');
        viewToggles.forEach(btn => {
            btn.addEventListener('click', this.handleViewToggle.bind(this));
        });

        // Sidebar toggle
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', this.toggleSidebar.bind(this));
        }

        // Theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }

        // Clear filters
        const clearFilters = document.querySelector('.clear-filters');
        if (clearFilters) {
            clearFilters.addEventListener('click', this.clearAllFilters.bind(this));
        }

        // Sort functionality
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', this.handleSortChange.bind(this));
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));

        // Infinite scroll
        this.setupInfiniteScroll();

        // Drag and drop for favorites
        this.setupDragAndDrop();
    }

    setupAdvancedFeatures() {
        // Advanced search suggestions
        this.setupSearchSuggestions();
        
        // Tool analytics
        this.setupToolAnalytics();
        
        // Quick actions
        this.setupQuickActions();
        
        // Export functionality
        this.setupExportFeatures();
        
        // Performance monitoring
        this.setupPerformanceMonitoring();
    }

    async loadTools() {
        try {
            this.setLoading(true);
            const response = await fetch('/api/tools');
            const data = await response.json();
            
            if (data.success && data.tools) {
                this.tools = data.tools;
                this.filteredTools = [...this.tools];
                this.analytics.totalTools = this.tools.length;
                this.updateAnalytics();
                this.renderTools();
                this.updateResultsCount();
                this.setupCategoryNavigation();
                this.showSuccess(`Loaded ${this.tools.length} tools successfully`);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error loading tools:', error);
            this.showError('Failed to load tools');
        } finally {
            this.setLoading(false);
        }
    }

    async loadFavorites() {
        try {
            const response = await fetch('/api/tools/favorites');
            const data = await response.json();
            
            if (data.success) {
                this.favorites = data.favorites || [];
                this.analytics.favorites = this.favorites.length;
                this.updateFavoritesDisplay();
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    }

    handleSearch(event) {
        this.searchQuery = event.target.value.toLowerCase();
        this.applyFilters();
        this.updateSearchAnalytics();
    }

    handleSearchKeydown(event) {
        if (event.key === 'Enter') {
            this.performAdvancedSearch();
        } else if (event.key === 'Escape') {
            event.target.value = '';
            this.searchQuery = '';
            this.applyFilters();
        }
    }

    handleFilterChange(event) {
        const { name, value } = event.target;
        this.filters[name] = value;
        this.applyFilters();
        this.updateFilterAnalytics();
    }

    handleViewToggle(event) {
        const viewMode = event.target.dataset.view;
        this.setViewMode(viewMode);
    }

    handleSortChange(event) {
        const [sortBy, sortOrder] = event.target.value.split('-');
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.applySorting();
    }

    toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (this.sidebarCollapsed) {
            sidebar.classList.add('collapsed');
            mainContent.style.marginLeft = '80px';
        } else {
            sidebar.classList.remove('collapsed');
            mainContent.style.marginLeft = '0';
        }
        
        localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed);
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
        
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = this.theme === 'light' ? '🌙' : '☀️';
        }
    }

    clearAllFilters() {
        this.filters = {
            category: '',
            subcategory: '',
            type: '',
            sourceRepo: '',
            tags: []
        };
        
        this.searchQuery = '';
        this.currentCategory = null;
        this.currentSubcategory = null;
        
        // Reset form inputs
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.value = '';
        });
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.applyFilters();
        this.showSuccess('All filters cleared');
    }

    applyFilters() {
        let filtered = [...this.tools];

        // Search filter
        if (this.searchQuery) {
            filtered = filtered.filter(tool => 
                tool.name.toLowerCase().includes(this.searchQuery) ||
                tool.description.toLowerCase().includes(this.searchQuery) ||
                tool.category.toLowerCase().includes(this.searchQuery) ||
                tool.subcategory.toLowerCase().includes(this.searchQuery) ||
                tool.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
            );
        }

        // Category filter
        if (this.filters.category) {
            filtered = filtered.filter(tool => tool.category === this.filters.category);
        }

        // Subcategory filter
        if (this.filters.subcategory) {
            filtered = filtered.filter(tool => tool.subcategory === this.filters.subcategory);
        }

        // Type filter
        if (this.filters.type) {
            filtered = filtered.filter(tool => tool.type === this.filters.type);
        }

        // Source repository filter
        if (this.filters.sourceRepo) {
            filtered = filtered.filter(tool => tool.sourceRepo === this.filters.sourceRepo);
        }

        // Tags filter
        if (this.filters.tags.length > 0) {
            filtered = filtered.filter(tool => 
                this.filters.tags.some(tag => tool.tags.includes(tag))
            );
        }

        this.filteredTools = filtered;
        this.applySorting();
        this.renderTools();
        this.updateResultsCount();
    }

    applySorting() {
        this.filteredTools.sort((a, b) => {
            let aValue = a[this.sortBy];
            let bValue = b[this.sortBy];

            // Handle different data types
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (this.sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }

    setViewMode(mode) {
        this.viewMode = mode;
        const container = document.querySelector('.tools-container');
        const viewToggles = document.querySelectorAll('.view-toggle-btn');
        
        // Update toggle buttons
        viewToggles.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === mode);
        });
        
        // Update container class
        container.className = `tools-container ${mode}-view`;
        
        // Re-render tools
        this.renderTools();
        localStorage.setItem('viewMode', mode);
    }

    renderTools() {
        const container = document.querySelector('.tools-container');
        if (!container) return;

        if (this.filteredTools.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        const toolsHTML = this.filteredTools.map(tool => this.renderToolCard(tool)).join('');
        container.innerHTML = toolsHTML;

        // Add event listeners to tool cards
        this.setupToolCardListeners();
    }

    renderToolCard(tool) {
        const isFavorite = this.favorites.some(fav => 
            fav.category === tool.category && fav.toolId === tool.id
        );

        return `
            <div class="tool-card fade-in" data-tool-id="${tool.id}" data-category="${tool.category}">
                <div class="tool-card-header">
                    <div class="tool-icon">${tool.icon}</div>
                    <div class="tool-info">
                        <h3 class="tool-name">${this.escapeHtml(tool.name)}</h3>
                        <div class="tool-category">
                            <span class="badge badge-primary">${this.escapeHtml(tool.category)}</span>
                            <span class="badge badge-secondary">${this.escapeHtml(tool.subcategory)}</span>
                        </div>
                        <p class="tool-description">${this.escapeHtml(tool.description)}</p>
                        <div class="tool-tags">
                            ${tool.tags.slice(0, 3).map(tag => 
                                `<span class="badge badge-info">${this.escapeHtml(tag)}</span>`
                            ).join('')}
                            ${tool.tags.length > 3 ? 
                                `<span class="badge badge-secondary">+${tool.tags.length - 3}</span>` : ''
                            }
                        </div>
                    </div>
                    <div class="tool-actions">
                        <button class="tool-action-btn favorite ${isFavorite ? 'active' : ''}" 
                                data-action="favorite" data-tool-id="${tool.id}" data-category="${tool.category}">
                            ${isFavorite ? '❤️' : '🤍'}
                        </button>
                        <button class="tool-action-btn" data-action="open" data-url="${tool.url}">
                            🔗
                        </button>
                        <button class="tool-action-btn" data-action="details" data-tool-id="${tool.id}">
                            ℹ️
                        </button>
                    </div>
                </div>
                <div class="tool-card-footer">
                    <div class="tool-meta">
                        <span class="tool-type">${this.escapeHtml(tool.type)}</span>
                        <span class="tool-source">${this.escapeHtml(tool.sourceRepo)}</span>
                    </div>
                    <div class="tool-quick-actions">
                        <button class="btn btn-sm btn-primary" data-action="analyze" data-tool-id="${tool.id}">
                            Analyze
                        </button>
                        <button class="btn btn-sm btn-secondary" data-action="compare" data-tool-id="${tool.id}">
                            Compare
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state fade-in">
                <div class="empty-state-icon">🔍</div>
                <h3>No tools found</h3>
                <p>Try adjusting your search criteria or filters</p>
                <button class="btn btn-primary" onclick="toolsHub.clearAllFilters()">
                    Clear Filters
                </button>
            </div>
        `;
    }

    setupToolCardListeners() {
        const toolCards = document.querySelectorAll('.tool-card');
        
        toolCards.forEach(card => {
            // Favorite toggle
            const favoriteBtn = card.querySelector('[data-action="favorite"]');
            if (favoriteBtn) {
                favoriteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleFavorite(favoriteBtn.dataset.toolId, favoriteBtn.dataset.category);
                });
            }

            // Open tool
            const openBtn = card.querySelector('[data-action="open"]');
            if (openBtn) {
                openBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openTool(openBtn.dataset.url);
                });
            }

            // Tool details
            const detailsBtn = card.querySelector('[data-action="details"]');
            if (detailsBtn) {
                detailsBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showToolDetails(detailsBtn.dataset.toolId);
                });
            }

            // Quick actions
            const analyzeBtn = card.querySelector('[data-action="analyze"]');
            if (analyzeBtn) {
                analyzeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.analyzeTool(analyzeBtn.dataset.toolId);
                });
            }

            const compareBtn = card.querySelector('[data-action="compare"]');
            if (compareBtn) {
                compareBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.compareTool(compareBtn.dataset.toolId);
                });
            }

            // Card click for quick preview
            card.addEventListener('click', () => {
                this.showToolPreview(card.dataset.toolId);
            });
        });
    }

    async toggleFavorite(toolId, category) {
        try {
            const isFavorite = this.favorites.some(fav => 
                fav.category === category && fav.toolId === toolId
            );

            if (isFavorite) {
                // Remove from favorites
                const response = await fetch(`/api/tools/favorites/${encodeURIComponent(category)}/${toolId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    this.favorites = this.favorites.filter(fav => 
                        !(fav.category === category && fav.toolId === toolId)
                    );
                    this.showSuccess('Tool removed from favorites');
                }
            } else {
                // Add to favorites
                const response = await fetch('/api/tools/favorites', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ category, toolId })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.favorites.push(data.favorite);
                    this.showSuccess('Tool added to favorites');
                }
            }

            this.analytics.favorites = this.favorites.length;
            this.updateFavoritesDisplay();
            this.renderTools(); // Re-render to update favorite buttons
        } catch (error) {
            console.error('Error toggling favorite:', error);
            this.showError('Failed to update favorites');
        }
    }

    openTool(url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        this.trackToolUsage('open', url);
    }

    showToolDetails(toolId) {
        const tool = this.tools.find(t => t.id === toolId);
        if (!tool) return;

        const modal = this.createModal(`
            <div class="tool-details-modal">
                <div class="tool-details-header">
                    <div class="tool-icon-large">${tool.icon}</div>
                    <div class="tool-info-large">
                        <h2>${this.escapeHtml(tool.name)}</h2>
                        <p class="tool-description-large">${this.escapeHtml(tool.description)}</p>
                        <div class="tool-meta-large">
                            <span class="badge badge-primary">${this.escapeHtml(tool.category)}</span>
                            <span class="badge badge-secondary">${this.escapeHtml(tool.subcategory)}</span>
                            <span class="badge badge-info">${this.escapeHtml(tool.type)}</span>
                        </div>
                    </div>
                </div>
                <div class="tool-details-content">
                    <div class="tool-tags-large">
                        <h4>Tags</h4>
                        <div class="tags-container">
                            ${tool.tags.map(tag => `<span class="badge badge-info">${this.escapeHtml(tag)}</span>`).join('')}
                        </div>
                    </div>
                    <div class="tool-actions-large">
                        <a href="${tool.url}" target="_blank" class="btn btn-primary">
                            Open Tool
                        </a>
                        <button class="btn btn-secondary" onclick="toolsHub.analyzeTool('${tool.id}')">
                            Analyze
                        </button>
                        <button class="btn btn-secondary" onclick="toolsHub.compareTool('${tool.id}')">
                            Compare
                        </button>
                    </div>
                </div>
            </div>
        `);

        document.body.appendChild(modal);
    }

    showToolPreview(toolId) {
        const tool = this.tools.find(t => t.id === toolId);
        if (!tool) return;

        // Create a quick preview tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tool-preview-tooltip';
        tooltip.innerHTML = `
            <div class="tool-preview-content">
                <h4>${this.escapeHtml(tool.name)}</h4>
                <p>${this.escapeHtml(tool.description)}</p>
                <div class="tool-preview-actions">
                    <a href="${tool.url}" target="_blank" class="btn btn-sm btn-primary">Open</a>
                    <button class="btn btn-sm btn-secondary" onclick="toolsHub.showToolDetails('${tool.id}')">Details</button>
                </div>
            </div>
        `;

        document.body.appendChild(tooltip);
        
        // Position tooltip near the clicked card
        const card = document.querySelector(`[data-tool-id="${toolId}"]`);
        if (card) {
            const rect = card.getBoundingClientRect();
            tooltip.style.left = `${rect.right + 10}px`;
            tooltip.style.top = `${rect.top}px`;
        }

        // Remove tooltip after 3 seconds
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 3000);
    }

    async analyzeTool(toolId) {
        const tool = this.tools.find(t => t.id === toolId);
        if (!tool) return;

        try {
            this.showLoading('Analyzing tool...');
            
            const response = await fetch(`/api/tools/${encodeURIComponent(tool.category)}/${toolId}/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'analyze',
                    parameters: {
                        tool: tool.name,
                        url: tool.url,
                        category: tool.category
                    }
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showAnalysisResults(tool, data.result);
            } else {
                throw new Error(data.message || 'Analysis failed');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            this.showError('Failed to analyze tool');
        } finally {
            this.hideLoading();
        }
    }

    showAnalysisResults(tool, results) {
        const modal = this.createModal(`
            <div class="analysis-results-modal">
                <div class="analysis-header">
                    <h2>Analysis Results: ${this.escapeHtml(tool.name)}</h2>
                </div>
                <div class="analysis-content">
                    <div class="analysis-summary">
                        <h4>Summary</h4>
                        <p>${this.escapeHtml(results.message || 'Analysis completed successfully')}</p>
                    </div>
                    <div class="analysis-details">
                        <h4>Details</h4>
                        <pre>${JSON.stringify(results.data, null, 2)}</pre>
                    </div>
                </div>
            </div>
        `);

        document.body.appendChild(modal);
    }

    compareTool(toolId) {
        // Add to comparison list
        if (!this.comparisonList) {
            this.comparisonList = [];
        }
        
        const tool = this.tools.find(t => t.id === toolId);
        if (tool && !this.comparisonList.find(t => t.id === toolId)) {
            this.comparisonList.push(tool);
            this.showSuccess(`Added ${tool.name} to comparison`);
            this.updateComparisonDisplay();
        }
    }

    updateComparisonDisplay() {
        // Create or update comparison panel
        let comparisonPanel = document.querySelector('.comparison-panel');
        
        if (!comparisonPanel) {
            comparisonPanel = document.createElement('div');
            comparisonPanel.className = 'comparison-panel';
            document.body.appendChild(comparisonPanel);
        }

        if (this.comparisonList && this.comparisonList.length > 0) {
            comparisonPanel.innerHTML = `
                <div class="comparison-header">
                    <h4>Comparison (${this.comparisonList.length})</h4>
                    <button class="btn btn-sm btn-primary" onclick="toolsHub.showComparison()">
                        Compare
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="toolsHub.clearComparison()">
                        Clear
                    </button>
                </div>
                <div class="comparison-tools">
                    ${this.comparisonList.map(tool => `
                        <div class="comparison-tool">
                            <span>${tool.icon} ${this.escapeHtml(tool.name)}</span>
                            <button onclick="toolsHub.removeFromComparison('${tool.id}')">×</button>
                        </div>
                    `).join('')}
                </div>
            `;
            comparisonPanel.style.display = 'block';
        } else {
            comparisonPanel.style.display = 'none';
        }
    }

    showComparison() {
        if (!this.comparisonList || this.comparisonList.length < 2) {
            this.showError('Please select at least 2 tools to compare');
            return;
        }

        const comparisonHTML = `
            <div class="comparison-modal">
                <div class="comparison-header">
                    <h2>Tool Comparison</h2>
                </div>
                <div class="comparison-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Feature</th>
                                ${this.comparisonList.map(tool => `<th>${this.escapeHtml(tool.name)}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Category</td>
                                ${this.comparisonList.map(tool => `<td>${this.escapeHtml(tool.category)}</td>`).join('')}
                            </tr>
                            <tr>
                                <td>Type</td>
                                ${this.comparisonList.map(tool => `<td>${this.escapeHtml(tool.type)}</td>`).join('')}
                            </tr>
                            <tr>
                                <td>Tags</td>
                                ${this.comparisonList.map(tool => `<td>${tool.tags.join(', ')}</td>`).join('')}
                            </tr>
                            <tr>
                                <td>Actions</td>
                                ${this.comparisonList.map(tool => `
                                    <td>
                                        <a href="${tool.url}" target="_blank" class="btn btn-sm btn-primary">Open</a>
                                    </td>
                                `).join('')}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const modal = this.createModal(comparisonHTML);
        document.body.appendChild(modal);
    }

    clearComparison() {
        this.comparisonList = [];
        this.updateComparisonDisplay();
        this.showSuccess('Comparison cleared');
    }

    removeFromComparison(toolId) {
        this.comparisonList = this.comparisonList.filter(tool => tool.id !== toolId);
        this.updateComparisonDisplay();
    }

    updateResultsCount() {
        const countElement = document.querySelector('.results-count');
        if (countElement) {
            countElement.textContent = `Showing ${this.filteredTools.length} of ${this.tools.length} tools`;
        }
    }

    updateFavoritesDisplay() {
        const favoritesCount = document.querySelector('.favorites-count');
        if (favoritesCount) {
            favoritesCount.textContent = this.favorites.length;
        }
    }

    updateAnalytics() {
        // Update category analytics
        this.analytics.categories = {};
        this.tools.forEach(tool => {
            if (!this.analytics.categories[tool.category]) {
                this.analytics.categories[tool.category] = 0;
            }
            this.analytics.categories[tool.category]++;
        });
    }

    updateSearchAnalytics() {
        if (this.searchQuery) {
            this.analytics.recentSearches.unshift(this.searchQuery);
            this.analytics.recentSearches = this.analytics.recentSearches.slice(0, 10);
        }
    }

    updateFilterAnalytics() {
        // Track filter usage for analytics
        const activeFilters = Object.entries(this.filters)
            .filter(([key, value]) => value && value.length > 0)
            .map(([key, value]) => `${key}:${value}`);
        
        if (activeFilters.length > 0) {
            console.log('Active filters:', activeFilters);
        }
    }

    setupSearchSuggestions() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        // Create suggestions container
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'search-suggestions';
        searchInput.parentNode.appendChild(suggestionsContainer);

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            if (query.length < 2) {
                suggestionsContainer.style.display = 'none';
                return;
            }

            const suggestions = this.getSearchSuggestions(query);
            if (suggestions.length > 0) {
                suggestionsContainer.innerHTML = suggestions.map(suggestion => `
                    <div class="suggestion-item" onclick="toolsHub.selectSuggestion('${suggestion}')">
                        ${suggestion}
                    </div>
                `).join('');
                suggestionsContainer.style.display = 'block';
            } else {
                suggestionsContainer.style.display = 'none';
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.style.display = 'none';
            }
        });
    }

    getSearchSuggestions(query) {
        const suggestions = new Set();
        
        this.tools.forEach(tool => {
            if (tool.name.toLowerCase().includes(query)) {
                suggestions.add(tool.name);
            }
            if (tool.category.toLowerCase().includes(query)) {
                suggestions.add(tool.category);
            }
            tool.tags.forEach(tag => {
                if (tag.toLowerCase().includes(query)) {
                    suggestions.add(tag);
                }
            });
        });

        return Array.from(suggestions).slice(0, 5);
    }

    selectSuggestion(suggestion) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = suggestion;
            this.searchQuery = suggestion.toLowerCase();
            this.applyFilters();
        }
        
        const suggestionsContainer = document.querySelector('.search-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }

    setupToolAnalytics() {
        // Track tool interactions
        document.addEventListener('click', (e) => {
            const toolCard = e.target.closest('.tool-card');
            if (toolCard) {
                const toolId = toolCard.dataset.toolId;
                this.trackToolUsage('view', toolId);
            }
        });
    }

    trackToolUsage(action, identifier) {
        // Send analytics data
        const analyticsData = {
            action,
            identifier,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        // In a real implementation, you'd send this to your analytics service
        console.log('Tool usage tracked:', analyticsData);
    }

    setupQuickActions() {
        // Add quick action buttons to the header
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            const quickActions = document.createElement('div');
            quickActions.className = 'quick-actions';
            quickActions.innerHTML = `
                <button class="btn btn-sm btn-secondary" onclick="toolsHub.exportTools()">
                    📤 Export
                </button>
                <button class="btn btn-sm btn-secondary" onclick="toolsHub.importTools()">
                    📥 Import
                </button>
                <button class="btn btn-sm btn-secondary" onclick="toolsHub.showAnalytics()">
                    📊 Analytics
                </button>
            `;
            headerActions.appendChild(quickActions);
        }
    }

    setupExportFeatures() {
        // Export functionality
        window.exportTools = this.exportTools.bind(this);
        window.importTools = this.importTools.bind(this);
    }

    exportTools() {
        const exportData = {
            tools: this.filteredTools,
            filters: this.filters,
            searchQuery: this.searchQuery,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `osint-tools-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccess('Tools exported successfully');
    }

    importTools() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (data.tools) {
                            this.filteredTools = data.tools;
                            this.renderTools();
                            this.showSuccess('Tools imported successfully');
                        }
                    } catch (error) {
                        this.showError('Invalid import file');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    showAnalytics() {
        const analyticsHTML = `
            <div class="analytics-modal">
                <div class="analytics-header">
                    <h2>Tools Analytics</h2>
                </div>
                <div class="analytics-content">
                    <div class="analytics-section">
                        <h4>Overview</h4>
                        <div class="analytics-stats">
                            <div class="stat">
                                <span class="stat-number">${this.analytics.totalTools}</span>
                                <span class="stat-label">Total Tools</span>
                            </div>
                            <div class="stat">
                                <span class="stat-number">${this.analytics.favorites}</span>
                                <span class="stat-label">Favorites</span>
                            </div>
                            <div class="stat">
                                <span class="stat-number">${Object.keys(this.analytics.categories).length}</span>
                                <span class="stat-label">Categories</span>
                            </div>
                        </div>
                    </div>
                    <div class="analytics-section">
                        <h4>Top Categories</h4>
                        <div class="category-stats">
                            ${Object.entries(this.analytics.categories)
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 5)
                                .map(([category, count]) => `
                                    <div class="category-stat">
                                        <span class="category-name">${this.escapeHtml(category)}</span>
                                        <span class="category-count">${count}</span>
                                    </div>
                                `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modal = this.createModal(analyticsHTML);
        document.body.appendChild(modal);
    }

    setupPerformanceMonitoring() {
        // Monitor performance metrics
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`Page load time: ${loadTime}ms`);
            });
        }
    }

    setupInfiniteScroll() {
        let isLoading = false;
        let page = 1;
        const itemsPerPage = 20;

        const loadMoreTools = () => {
            if (isLoading) return;
            
            isLoading = true;
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const toolsToShow = this.filteredTools.slice(start, end);
            
            // Simulate loading delay
            setTimeout(() => {
                // Add new tools to the grid
                const container = document.querySelector('.tools-container');
                if (container && toolsToShow.length > 0) {
                    const newToolsHTML = toolsToShow.map(tool => this.renderToolCard(tool)).join('');
                    container.insertAdjacentHTML('beforeend', newToolsHTML);
                    this.setupToolCardListeners();
                }
                
                page++;
                isLoading = false;
            }, 500);
        };

        // Intersection Observer for infinite scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isLoading) {
                    loadMoreTools();
                }
            });
        });

        // Observe the last tool card
        const observeLastCard = () => {
            const cards = document.querySelectorAll('.tool-card');
            if (cards.length > 0) {
                observer.observe(cards[cards.length - 1]);
            }
        };

        // Initial observation
        setTimeout(observeLastCard, 1000);
    }

    setupDragAndDrop() {
        // Drag and drop for favorites
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('tool-card')) {
                e.dataTransfer.setData('text/plain', e.target.dataset.toolId);
                e.target.style.opacity = '0.5';
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('tool-card')) {
                e.target.style.opacity = '1';
            }
        });

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            const toolId = e.dataTransfer.getData('text/plain');
            const favoritesZone = e.target.closest('.favorites-zone');
            
            if (favoritesZone && toolId) {
                const tool = this.tools.find(t => t.id === toolId);
                if (tool) {
                    this.toggleFavorite(toolId, tool.category);
                }
            }
        });
    }

    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + K for search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
            }
        }

        // Ctrl/Cmd + F for filters
        if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
            event.preventDefault();
            const filterSelect = document.querySelector('.filter-select');
            if (filterSelect) {
                filterSelect.focus();
            }
        }

        // Escape to clear search
        if (event.key === 'Escape') {
            const searchInput = document.getElementById('searchInput');
            if (searchInput && document.activeElement === searchInput) {
                searchInput.value = '';
                this.searchQuery = '';
                this.applyFilters();
            }
        }
    }

    setupAnimations() {
        // Add intersection observer for animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1
        });

        // Observe all tool cards
        document.addEventListener('DOMContentLoaded', () => {
            const cards = document.querySelectorAll('.tool-card');
            cards.forEach(card => observer.observe(card));
        });
    }

    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = this.theme === 'light' ? '🌙' : '☀️';
        }

        // Restore sidebar state
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarCollapsed) {
            this.sidebarCollapsed = true;
            this.toggleSidebar();
        }

        // Restore view mode
        const viewMode = localStorage.getItem('viewMode');
        if (viewMode) {
            this.setViewMode(viewMode);
        }
    }

    showWelcomeMessage() {
        if (!localStorage.getItem('welcomeShown')) {
            this.showSuccess('Welcome to the Ultimate OSINT Tools Hub! 🚀');
            localStorage.setItem('welcomeShown', 'true');
        }
    }

    // Utility methods
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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setLoading(loading) {
        this.isLoading = loading;
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) {
            loadingElement.style.display = loading ? 'flex' : 'none';
        }
    }

    showLoading(message = 'Loading...') {
        this.setLoading(true);
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) {
            loadingElement.innerHTML = `
                <div class="loading-spinner"></div>
                <span>${message}</span>
            `;
        }
    }

    hideLoading() {
        this.setLoading(false);
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} fade-in`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
                </span>
                <span class="notification-message">${this.escapeHtml(message)}</span>
                <button class="notification-close" onclick="this.parentNode.parentNode.remove()">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    createModal(content) {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-content scale-in">
                <div class="modal-header">
                    <button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        // Close modal on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        return modal;
    }

    performAdvancedSearch() {
        // Implement advanced search with multiple criteria
        console.log('Performing advanced search:', this.searchQuery);
        this.showSuccess('Advanced search completed');
    }

    setupCategoryNavigation() {
        // Setup category navigation in sidebar
        const categories = [...new Set(this.tools.map(tool => tool.category))];
        const navContainer = document.querySelector('.nav-section[data-section="categories"]');
        
        if (navContainer) {
            const categoryList = navContainer.querySelector('.nav-list');
            if (categoryList) {
                categoryList.innerHTML = categories.map(category => `
                    <div class="nav-item" data-category="${category}">
                        <span class="nav-item-icon">📁</span>
                        <span class="nav-item-text">${this.escapeHtml(category)}</span>
                        <span class="nav-item-count">${this.analytics.categories[category] || 0}</span>
                    </div>
                `).join('');

                // Add click handlers
                categoryList.querySelectorAll('.nav-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const category = item.dataset.category;
                        this.filters.category = category;
                        this.applyFilters();
                        this.showSuccess(`Filtered by ${category}`);
                    });
                });
            }
        }
    }
}

// Initialize the tools hub
const toolsHub = new UltimateOSINTToolsHub();

// Global functions for HTML onclick handlers
window.toolsHub = toolsHub;
