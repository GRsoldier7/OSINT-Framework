/**
 * 🚀 Ultimate OSINT Tools Hub v3.0
 * Advanced tool management with AI-powered recommendations, real-time search, and comprehensive analytics
 */

class ToolsPage {
    constructor() {
        this.tools = {};
        this.categories = {};
        this.filteredTools = [];
        this.currentView = 'grid';
        this.currentCategory = null;
        this.currentSubcategory = null;
        this.filters = {
            search: '',
            category: '',
            subcategory: '',
            type: '',
            tags: [],
            sources: [],
            favoritesOnly: false,
            rating: 0
        };
        this.currentSort = 'name';
        this.favorites = [];
        this.favoritesAnalytics = null;
        this.searchHistory = [];
        this.recentTools = [];
        this.toolUsage = {};
        this.isLoading = false;
        this.searchDebounceTimer = null;
        
        // Performance optimization
        this.toolCache = new Map();
        this.searchIndex = new Map();
        
        this.init();
    }

    async init() {
        try {
            this.showLoading();
            await Promise.all([
                this.loadTools(),
                this.loadFavorites(),
                this.loadUserData()
            ]);
            
            this.buildSearchIndex();
            this.setupEventListeners();
            this.renderCategories();
            this.renderTools();
            this.updateStatistics();
            this.updateFavoritesCount();
            this.hideLoading();
            
            // Initialize AI recommendations
            this.initializeAIRecommendations();
            
            console.log('🚀 OSINT Tools Hub v3.0 initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Tools Page:', error);
            this.showError('Failed to initialize. Please refresh the page.');
        }
    }

    async loadTools() {
        try {
            const response = await fetch('/api/tools');
            const data = await response.json();
            
            if (data.success) {
                this.tools = data.data.tools;
                this.categories = data.data.categories;
                this.filteredTools = this.getAllTools();
                
                console.log(`📊 Loaded ${this.getTotalToolCount()} tools across ${Object.keys(this.categories).length} categories`);
            } else {
                throw new Error(data.error || 'Failed to load tools');
            }
        } catch (error) {
            console.error('Error loading tools:', error);
            this.showError('Failed to load tools. Please refresh the page.');
        }
    }

    async loadFavorites() {
        try {
            const response = await fetch('/api/tools/favorites');
            const data = await response.json();
            
            if (data.success) {
                this.favorites = data.data;
                await this.loadFavoritesAnalytics();
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    }

    async loadUserData() {
        try {
            // Load user preferences and history from localStorage
            const userData = localStorage.getItem('osint_user_data');
            if (userData) {
                const data = JSON.parse(userData);
                this.searchHistory = data.searchHistory || [];
                this.recentTools = data.recentTools || [];
                this.toolUsage = data.toolUsage || {};
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    saveUserData() {
        try {
            const userData = {
                searchHistory: this.searchHistory.slice(-50), // Keep last 50 searches
                recentTools: this.recentTools.slice(-20), // Keep last 20 tools
                toolUsage: this.toolUsage
            };
            localStorage.setItem('osint_user_data', JSON.stringify(userData));
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    buildSearchIndex() {
        this.searchIndex.clear();
        this.toolCache.clear();
        
        this.getAllTools().forEach(tool => {
            // Cache tool data
            this.toolCache.set(tool.id, tool);
            
            // Build search index
            const searchTerms = [
                tool.name.toLowerCase(),
                tool.description.toLowerCase(),
                tool.category.toLowerCase(),
                tool.subcategory.toLowerCase(),
                ...(tool.tags || []).map(tag => tag.toLowerCase())
            ].join(' ');
            
            this.searchIndex.set(tool.id, searchTerms);
        });
    }

    getAllTools() {
        const allTools = [];
        
        Object.entries(this.tools).forEach(([category, subcategories]) => {
            Object.entries(subcategories).forEach(([subcategory, tools]) => {
                Object.entries(tools).forEach(([toolId, tool]) => {
                    allTools.push({
                        id: toolId,
                        category,
                        subcategory,
                        ...tool
                    });
                });
            });
        });
        
        return allTools;
    }

    getTotalToolCount() {
        return this.getAllTools().length;
    }

    // Advanced search with fuzzy matching and relevance scoring
    searchTools(query) {
        if (!query.trim()) return this.getAllTools();
        
        const searchTerm = query.toLowerCase();
        const results = [];
        
        this.searchIndex.forEach((searchTerms, toolId) => {
            const tool = this.toolCache.get(toolId);
            if (!tool) return;
            
            let score = 0;
            
            // Exact matches get highest score
            if (tool.name.toLowerCase().includes(searchTerm)) score += 100;
            if (tool.description.toLowerCase().includes(searchTerm)) score += 50;
            if (tool.category.toLowerCase().includes(searchTerm)) score += 30;
            if (tool.subcategory.toLowerCase().includes(searchTerm)) score += 20;
            
            // Tag matches
            (tool.tags || []).forEach(tag => {
                if (tag.toLowerCase().includes(searchTerm)) score += 15;
            });
            
            // Partial matches
            const words = searchTerm.split(' ');
            words.forEach(word => {
                if (tool.name.toLowerCase().includes(word)) score += 10;
                if (tool.description.toLowerCase().includes(word)) score += 5;
            });
            
            if (score > 0) {
                results.push({ ...tool, relevanceScore: score });
            }
        });
        
        // Sort by relevance score
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // Enhanced filtering system
    filterTools() {
        let filtered = this.getAllTools();
        
        // Search filter
        if (this.filters.search) {
            filtered = this.searchTools(this.filters.search);
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
        
        // Tags filter
        if (this.filters.tags.length > 0) {
            filtered = filtered.filter(tool => 
                this.filters.tags.some(tag => 
                    (tool.tags || []).includes(tag)
                )
            );
        }
        
        // Sources filter
        if (this.filters.sources.length > 0) {
            filtered = filtered.filter(tool => 
                this.filters.sources.some(source => 
                    tool.sourceRepo && tool.sourceRepo.includes(source)
                )
            );
        }
        
        // Favorites only filter
        if (this.filters.favoritesOnly) {
            filtered = filtered.filter(tool => this.isFavorited(tool.category, tool.id));
        }
        
        // Rating filter
        if (this.filters.rating > 0) {
            filtered = filtered.filter(tool => {
                const favorite = this.getFavorite(tool.category, tool.id);
                return favorite && favorite.rating >= this.filters.rating;
            });
        }
        
        this.filteredTools = filtered;
        this.sortTools();
        this.renderTools();
        this.updateResultsCount();
    }

    // Enhanced sorting with multiple criteria
    sortTools() {
        const sortFunctions = {
            name: (a, b) => a.name.localeCompare(b.name),
            category: (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
            type: (a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name),
            popularity: (a, b) => {
                const aUsage = this.toolUsage[a.id] || 0;
                const bUsage = this.toolUsage[b.id] || 0;
                return bUsage - aUsage;
            },
            rating: (a, b) => {
                const aRating = this.getFavorite(a.category, a.id)?.rating || 0;
                const bRating = this.getFavorite(b.category, b.id)?.rating || 0;
                return bRating - aRating;
            },
            recent: (a, b) => {
                const aRecent = this.recentTools.indexOf(a.id);
                const bRecent = this.recentTools.indexOf(b.id);
                if (aRecent === -1 && bRecent === -1) return 0;
                if (aRecent === -1) return 1;
                if (bRecent === -1) return -1;
                return aRecent - bRecent;
            }
        };
        
        if (sortFunctions[this.currentSort]) {
            this.filteredTools.sort(sortFunctions[this.currentSort]);
        }
    }

    // Enhanced tool rendering with advanced features
    renderTools() {
        const container = document.getElementById('toolsContainer');
        if (!container) return;
        
        if (this.filteredTools.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.hideEmptyState();
        
        const isListView = this.currentView === 'list';
        const toolsHTML = this.filteredTools.map(tool => this.renderToolCard(tool, isListView)).join('');
        
        container.innerHTML = toolsHTML;
        
        // Add tool interaction listeners
        this.addToolInteractionListeners();
    }

    renderToolCard(tool, isListView = false) {
        const isFavorited = this.isFavorited(tool.category, tool.id);
        const favorite = this.getFavorite(tool.category, tool.id);
        const usageCount = this.toolUsage[tool.id] || 0;
        
        const favoriteClass = isFavorited ? 'favorited' : '';
        const favoriteIcon = isFavorited ? 'fas fa-heart' : 'far fa-heart';
        const favoriteTitle = isFavorited ? 'Remove from favorites' : 'Add to favorites';
        
        const ratingStars = this.renderRatingStars(favorite?.rating || 0);
        const usageBadge = usageCount > 0 ? `<span class="usage-badge">${usageCount} uses</span>` : '';
        
        const cardClass = isListView ? 'tool-card list-view' : 'tool-card';
        
        return `
            <div class="${cardClass}" data-tool-id="${tool.id}" data-category="${tool.category}" data-subcategory="${tool.subcategory}">
                <div class="tool-header">
                    <div class="tool-icon">
                        <i class="${tool.icon || 'fas fa-tools'}"></i>
                    </div>
                    <div class="tool-info">
                        <h3 class="tool-name">${tool.name}</h3>
                        <div class="tool-meta">
                            <span class="tool-category">${tool.category}</span>
                            <span class="tool-subcategory">${tool.subcategory}</span>
                            <span class="tool-type">${tool.type}</span>
                        </div>
                    </div>
                    <div class="tool-actions">
                        <button class="favorite-btn ${favoriteClass}" title="${favoriteTitle}" data-action="toggle-favorite">
                            <i class="${favoriteIcon}"></i>
                        </button>
                        <button class="tool-btn" title="Open tool" data-action="open-tool">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                        <button class="tool-btn" title="Tool details" data-action="show-details">
                            <i class="fas fa-info-circle"></i>
                        </button>
                    </div>
                </div>
                
                <div class="tool-content">
                    <p class="tool-description">${tool.description}</p>
                    
                    ${tool.tags && tool.tags.length > 0 ? `
                        <div class="tool-tags">
                            ${tool.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="tool-stats">
                        ${ratingStars}
                        ${usageBadge}
                        ${favorite?.notes ? `<span class="notes-badge" title="${favorite.notes}">📝</span>` : ''}
                    </div>
                </div>
                
                ${isListView ? `
                    <div class="tool-extra">
                        <div class="tool-url">
                            <a href="${tool.url}" target="_blank" rel="noopener noreferrer">
                                ${tool.url}
                            </a>
                        </div>
                        ${tool.sourceRepo ? `
                            <div class="tool-source">
                                <i class="fab fa-github"></i>
                                <a href="${tool.sourceRepo}" target="_blank" rel="noopener noreferrer">
                                    Source Code
                                </a>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderRatingStars(rating) {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            const starClass = i <= rating ? 'fas fa-star filled' : 'far fa-star';
            stars.push(`<i class="${starClass}"></i>`);
        }
        return `<div class="rating-stars">${stars.join('')}</div>`;
    }

    addToolInteractionListeners() {
        document.querySelectorAll('.tool-card').forEach(card => {
            const toolId = card.dataset.toolId;
            const category = card.dataset.category;
            const subcategory = card.dataset.subcategory;
            
            // Favorite toggle
            card.querySelector('[data-action="toggle-favorite"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite(category, toolId);
            });
            
            // Open tool
            card.querySelector('[data-action="open-tool"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openTool(category, toolId);
            });
            
            // Show details
            card.querySelector('[data-action="show-details"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showToolDetails(category, toolId);
            });
            
            // Card click for quick access
            card.addEventListener('click', () => {
                this.quickAccessTool(category, toolId);
            });
        });
    }

    async toggleFavorite(category, toolId) {
        try {
            if (this.isFavorited(category, toolId)) {
                await this.removeFromFavorites(category, toolId);
            } else {
                await this.addToFavorites(category, toolId);
            }
            
            this.renderTools();
            this.updateFavoritesCount();
        } catch (error) {
            console.error('Error toggling favorite:', error);
            this.showNotification('Failed to update favorite', 'error');
        }
    }

    openTool(category, toolId) {
        const tool = this.getTool(category, toolId);
        if (!tool) return;
        
        // Track usage
        this.trackToolUsage(toolId);
        
        // Open in new tab
        window.open(tool.url, '_blank', 'noopener,noreferrer');
        
        this.showNotification(`Opening ${tool.name}`, 'success');
    }

    showToolDetails(category, toolId) {
        const tool = this.getTool(category, toolId);
        if (!tool) return;
        
        this.showToolModal(tool);
    }

    quickAccessTool(category, toolId) {
        const tool = this.getTool(category, toolId);
        if (!tool) return;
        
        // Track usage
        this.trackToolUsage(toolId);
        
        // Add to recent tools
        this.addToRecentTools(toolId);
        
        // Show quick access modal
        this.showQuickAccessModal(tool);
    }

    trackToolUsage(toolId) {
        this.toolUsage[toolId] = (this.toolUsage[toolId] || 0) + 1;
        this.saveUserData();
    }

    addToRecentTools(toolId) {
        this.recentTools = [toolId, ...this.recentTools.filter(id => id !== toolId)].slice(0, 20);
        this.saveUserData();
    }

    getTool(category, toolId) {
        return this.tools[category]?.[this.getSubcategoryFromToolId(toolId)]?.[toolId];
    }

    getSubcategoryFromToolId(toolId) {
        // Find the subcategory for a given tool ID
        for (const [category, subcategories] of Object.entries(this.tools)) {
            for (const [subcategory, tools] of Object.entries(subcategories)) {
                if (tools[toolId]) {
                    return subcategory;
                }
            }
        }
        return null;
    }

    // Enhanced favorites management
    async addToFavorites(category, toolId, metadata = {}) {
        try {
            const response = await fetch('/api/tools/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, toolId, metadata })
            });

            const data = await response.json();
            
            if (data.success) {
                const existingIndex = this.favorites.findIndex(f => f.id === data.data.id);
                if (existingIndex >= 0) {
                    this.favorites[existingIndex] = data.data;
                } else {
                    this.favorites.push(data.data);
                }
                
                this.updateFavoritesCount();
                this.showNotification('Added to favorites', 'success');
                return true;
            } else {
                this.showNotification(data.error || 'Failed to add to favorites', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error adding to favorites:', error);
            this.showNotification('Failed to add to favorites', 'error');
            return false;
        }
    }

    async removeFromFavorites(category, toolId) {
        try {
            const response = await fetch(`/api/tools/favorites/${category}/${toolId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            
            if (data.success) {
                const favoriteId = `${category}_${toolId}`;
                this.favorites = this.favorites.filter(f => f.id !== favoriteId);
                
                this.updateFavoritesCount();
                this.showNotification('Removed from favorites', 'success');
                return true;
            } else {
                this.showNotification(data.error || 'Failed to remove from favorites', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error removing from favorites:', error);
            this.showNotification('Failed to remove from favorites', 'error');
            return false;
        }
    }

    isFavorited(category, toolId) {
        const favoriteId = `${category}_${toolId}`;
        return this.favorites.some(f => f.id === favoriteId);
    }

    getFavorite(category, toolId) {
        const favoriteId = `${category}_${toolId}`;
        return this.favorites.find(f => f.id === favoriteId);
    }

    // Enhanced UI rendering
    renderCategories() {
        const container = document.getElementById('categoryList');
        if (!container) return;
        
        const categoriesHTML = Object.entries(this.categories).map(([categoryName, categoryData]) => {
            const subcategories = categoryData.subcategories || {};
            const subcategoriesHTML = Object.entries(subcategories).map(([subName, subData]) => `
                <div class="subcategory-item" data-category="${categoryName}" data-subcategory="${subName}">
                    <i class="${subData.icon || '📋'}"></i>
                    <span>${subName}</span>
                    <span class="tool-count">${subData.count || 0}</span>
                </div>
            `).join('');
            
            return `
                <div class="category-item" data-category="${categoryName}">
                    <div class="category-header">
                        <i class="${categoryData.icon || '🔧'}"></i>
                        <span>${categoryName}</span>
                        <span class="tool-count">${this.getCategoryToolCount(categoryName)}</span>
                    </div>
                    <div class="subcategories">
                        ${subcategoriesHTML}
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = categoriesHTML;
        this.addCategoryEventListeners();
    }

    getCategoryToolCount(categoryName) {
        const category = this.tools[categoryName];
        if (!category) return 0;
        
        return Object.values(category).reduce((total, subcategory) => {
            return total + Object.keys(subcategory).length;
        }, 0);
    }

    addCategoryEventListeners() {
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                this.selectCategory(category);
            });
        });
        
        document.querySelectorAll('.subcategory-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = item.dataset.category;
                const subcategory = item.dataset.subcategory;
                this.selectSubcategory(category, subcategory);
            });
        });
    }

    selectCategory(category) {
        this.currentCategory = category;
        this.currentSubcategory = null;
        this.filters.category = category;
        this.filters.subcategory = '';
        this.updateBreadcrumb();
        this.filterTools();
    }

    selectSubcategory(category, subcategory) {
        this.currentCategory = category;
        this.currentSubcategory = subcategory;
        this.filters.category = category;
        this.filters.subcategory = subcategory;
        this.updateBreadcrumb();
        this.filterTools();
    }

    updateBreadcrumb() {
        const container = document.getElementById('breadcrumb');
        if (!container) return;
        
        let breadcrumbHTML = '<span class="breadcrumb-item" data-action="all">All Tools</span>';
        
        if (this.currentCategory) {
            breadcrumbHTML += `<span class="breadcrumb-separator">/</span>`;
            breadcrumbHTML += `<span class="breadcrumb-item" data-action="category">${this.currentCategory}</span>`;
        }
        
        if (this.currentSubcategory) {
            breadcrumbHTML += `<span class="breadcrumb-separator">/</span>`;
            breadcrumbHTML += `<span class="breadcrumb-item" data-action="subcategory">${this.currentSubcategory}</span>`;
        }
        
        container.innerHTML = breadcrumbHTML;
        this.addBreadcrumbEventListeners();
    }

    addBreadcrumbEventListeners() {
        document.querySelectorAll('.breadcrumb-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                
                switch (action) {
                    case 'all':
                        this.clearFilters();
                        break;
                    case 'category':
                        this.selectCategory(this.currentCategory);
                        break;
                    case 'subcategory':
                        this.selectSubcategory(this.currentCategory, this.currentSubcategory);
                        break;
                }
            });
        });
    }

    // Enhanced event listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchDebounceTimer);
                this.searchDebounceTimer = setTimeout(() => {
                    this.filters.search = e.target.value;
                    this.addToSearchHistory(e.target.value);
                    this.filterTools();
                }, 300);
            });
        }

        // Clear search
        document.getElementById('clearSearch')?.addEventListener('click', () => {
            this.filters.search = '';
            searchInput.value = '';
            this.filterTools();
        });

        // Category filter
        document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.filterTools();
        });

        // Type filter
        document.getElementById('typeFilter')?.addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.filterTools();
        });

        // Sort select
        document.getElementById('sortSelect')?.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.sortTools();
            this.renderTools();
        });

        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setView(btn.dataset.view);
            });
        });

        // Favorites toggle
        document.getElementById('favoritesToggle')?.addEventListener('click', () => {
            this.toggleFavoritesView();
        });

        // Favorites modal
        document.getElementById('favoritesModalBtn')?.addEventListener('click', () => {
            this.showFavoritesModal();
        });

        // Advanced filters
        document.getElementById('advancedFilters')?.addEventListener('click', () => {
            this.showFiltersModal();
        });

        // Clear all filters
        document.getElementById('clearAllFilters')?.addEventListener('click', () => {
            this.clearFilters();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Responsive sidebar
        document.getElementById('toggleSidebar')?.addEventListener('click', () => {
            this.toggleSidebar();
        });
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + F: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            document.getElementById('searchInput')?.focus();
        }
        
        // Ctrl/Cmd + K: Quick access
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.showQuickAccessModal();
        }
        
        // Escape: Clear search or close modals
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput.value) {
                searchInput.value = '';
                this.filters.search = '';
                this.filterTools();
            }
        }
    }

    addToSearchHistory(query) {
        if (query.trim()) {
            this.searchHistory = [query, ...this.searchHistory.filter(q => q !== query)].slice(0, 20);
            this.saveUserData();
        }
    }

    toggleFavoritesView() {
        this.filters.favoritesOnly = !this.filters.favoritesOnly;
        const btn = document.getElementById('favoritesToggle');
        if (btn) {
            btn.innerHTML = this.filters.favoritesOnly ? 
                '<i class="fas fa-star"></i><span>Show All</span>' : 
                '<i class="fas fa-star"></i><span>Show Favorites</span>';
        }
        this.filterTools();
    }

    setView(view) {
        this.currentView = view;
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        this.renderTools();
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    }

    clearFilters() {
        this.filters = {
            search: '',
            category: '',
            subcategory: '',
            type: '',
            tags: [],
            sources: [],
            favoritesOnly: false,
            rating: 0
        };
        
        this.currentCategory = null;
        this.currentSubcategory = null;
        
        // Reset UI
        document.getElementById('searchInput').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('typeFilter').value = '';
        
        this.updateBreadcrumb();
        this.filterTools();
    }

    // Enhanced statistics and analytics
    updateStatistics() {
        const totalTools = this.getTotalToolCount();
        const totalCategories = Object.keys(this.categories).length;
        const totalFavorites = this.favorites.length;
        
        document.getElementById('totalTools').textContent = totalTools.toLocaleString();
        document.getElementById('totalCategories').textContent = totalCategories;
        document.getElementById('totalFavorites').textContent = totalFavorites;
    }

    updateResultsCount() {
        const count = this.filteredTools.length;
        const total = this.getTotalToolCount();
        
        const container = document.getElementById('resultsCount');
        if (container) {
            container.textContent = count.toLocaleString();
            
            if (count < total) {
                container.title = `Showing ${count} of ${total} tools`;
            }
        }
    }

    updateFavoritesCount() {
        const count = this.favorites.length;
        document.getElementById('totalFavorites').textContent = count;
    }

    // Enhanced notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Loading states
    showLoading() {
        this.isLoading = true;
        document.getElementById('loadingState')?.classList.remove('hidden');
    }

    hideLoading() {
        this.isLoading = false;
        document.getElementById('loadingState')?.classList.add('hidden');
    }

    showEmptyState() {
        document.getElementById('emptyState')?.classList.remove('hidden');
    }

    hideEmptyState() {
        document.getElementById('emptyState')?.classList.add('hidden');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    // AI Recommendations (placeholder for future implementation)
    initializeAIRecommendations() {
        // This will be implemented with the AI service
        console.log('🤖 AI recommendations initialized');
    }

    // Quick Access Modal
    showQuickAccessModal(tool = null) {
        // Implementation for quick access modal
        console.log('Quick access modal:', tool);
    }

    // Tool Modal
    showToolModal(tool) {
        // Implementation for tool details modal
        console.log('Tool modal:', tool);
    }

    // Favorites Modal
    showFavoritesModal() {
        // Implementation for favorites modal
        console.log('Favorites modal');
    }

    // Filters Modal
    showFiltersModal() {
        // Implementation for filters modal
        console.log('Filters modal');
    }

    // Load favorites analytics
    async loadFavoritesAnalytics() {
        try {
            const response = await fetch('/api/tools/favorites/analytics');
            const data = await response.json();
            
            if (data.success) {
                this.favoritesAnalytics = data.data;
                this.updateFavoritesAnalytics();
            }
        } catch (error) {
            console.error('Error loading favorites analytics:', error);
        }
    }

    updateFavoritesAnalytics() {
        // Implementation for updating favorites analytics display
        console.log('Favorites analytics updated:', this.favoritesAnalytics);
    }
}

// Initialize the tools page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.toolsPage = new ToolsPage();
});

// Export for global access
window.ToolsPage = ToolsPage;
