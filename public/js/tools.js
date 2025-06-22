/**
 * OSINT Tools Management Module
 * Handles all tool-related functionality including display, search, and execution
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
            type: '',
            tags: [],
            sources: [],
            favoritesOnly: false
        };
        this.currentSort = 'name';
        this.favorites = [];
        this.favoritesAnalytics = null;
        
        this.init();
    }

    async init() {
        await this.loadTools();
        await this.loadFavorites();
        this.setupEventListeners();
        this.renderCategories();
        this.renderTools();
        this.updateStatistics();
        this.updateFavoritesCount();
        this.hideLoading();
    }

    async loadTools() {
        try {
            const response = await fetch('/api/tools');
            const data = await response.json();
            
            if (data.success) {
                this.tools = data.data.tools;
                this.categories = data.data.categories;
                this.filteredTools = this.getAllTools();
            } else {
                throw new Error('Failed to load tools');
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
            } else {
                console.error('Failed to load favorites:', data.error);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    }

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

    async addToFavorites(category, toolId, metadata = {}) {
        try {
            const response = await fetch('/api/tools/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ category, toolId, metadata })
            });

            const data = await response.json();
            
            if (data.success) {
                // Update local favorites
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
                // Remove from local favorites
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

    async updateFavorite(category, toolId, updates) {
        try {
            const response = await fetch(`/api/tools/favorites/${category}/${toolId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });

            const data = await response.json();
            
            if (data.success) {
                // Update local favorite
                const favoriteId = `${category}_${toolId}`;
                const index = this.favorites.findIndex(f => f.id === favoriteId);
                if (index >= 0) {
                    this.favorites[index] = data.data;
                }
                
                this.showNotification('Favorite updated', 'success');
                return true;
            } else {
                this.showNotification(data.error || 'Failed to update favorite', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error updating favorite:', error);
            this.showNotification('Failed to update favorite', 'error');
            return false;
        }
    }

    async incrementFavoriteUsage(category, toolId) {
        try {
            await fetch(`/api/tools/favorites/${category}/${toolId}/usage`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Error incrementing favorite usage:', error);
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

    showFavoritesModal() {
        const modal = document.getElementById('favoritesModal');
        if (!modal) return;

        this.renderFavoritesList();
        this.renderFavoritesAnalytics();
        modal.classList.add('show');
    }

    hideFavoritesModal() {
        const modal = document.getElementById('favoritesModal');
        modal?.classList.remove('show');
    }

    renderFavoritesList() {
        const favoritesList = document.getElementById('favoritesList');
        if (!favoritesList) return;

        if (this.favorites.length === 0) {
            favoritesList.innerHTML = `
                <div class="empty-favorites">
                    <i class="fas fa-heart-broken"></i>
                    <h3>No favorites yet</h3>
                    <p>Start adding tools to your favorites to see them here!</p>
                </div>
            `;
            return;
        }

        favoritesList.innerHTML = this.favorites.map(favorite => `
            <div class="favorite-item" data-id="${favorite.id}">
                <div class="favorite-header">
                    <div class="favorite-info">
                        <span class="favorite-icon">${favorite.icon}</span>
                        <div class="favorite-details">
                            <h4>${favorite.name}</h4>
                            <p>${favorite.description}</p>
                            <div class="favorite-meta">
                                <span class="favorite-category">${favorite.category}</span>
                                <span class="favorite-type">${favorite.type}</span>
                                <span class="favorite-usage">Used ${favorite.usageCount || 0} times</span>
                            </div>
                        </div>
                    </div>
                    <div class="favorite-actions">
                        <button class="btn btn-sm btn-primary" onclick="toolsPage.openFavorite('${favorite.category}', '${favorite.toolId}')">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="toolsPage.editFavorite('${favorite.category}', '${favorite.toolId}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="toolsPage.removeFromFavorites('${favorite.category}', '${favorite.toolId}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${favorite.notes ? `<div class="favorite-notes">${favorite.notes}</div>` : ''}
                <div class="favorite-tags">
                    ${favorite.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    renderFavoritesAnalytics() {
        const analyticsContainer = document.getElementById('favoritesAnalytics');
        if (!analyticsContainer || !this.favoritesAnalytics) return;

        const analytics = this.favoritesAnalytics;
        
        analyticsContainer.innerHTML = `
            <div class="analytics-grid">
                <div class="analytics-card">
                    <h4>Total Favorites</h4>
                    <div class="analytics-value">${analytics.totalFavorites}</div>
                </div>
                <div class="analytics-card">
                    <h4>Total Usage</h4>
                    <div class="analytics-value">${analytics.totalUsage}</div>
                </div>
                <div class="analytics-card">
                    <h4>Avg Usage</h4>
                    <div class="analytics-value">${analytics.averageUsage}</div>
                </div>
                <div class="analytics-card">
                    <h4>Avg Rating</h4>
                    <div class="analytics-value">${analytics.averageRating}</div>
                </div>
            </div>
            
            <div class="analytics-sections">
                <div class="analytics-section">
                    <h4>Top Categories</h4>
                    <div class="analytics-list">
                        ${Object.entries(analytics.categories)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 5)
                            .map(([category, count]) => `
                                <div class="analytics-item">
                                    <span>${category}</span>
                                    <span class="count">${count}</span>
                                </div>
                            `).join('')}
                    </div>
                </div>
                
                <div class="analytics-section">
                    <h4>Top Tags</h4>
                    <div class="analytics-list">
                        ${analytics.topTags.map(({ tag, count }) => `
                            <div class="analytics-item">
                                <span>${tag}</span>
                                <span class="count">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    updateFavoritesAnalytics() {
        const analyticsContainer = document.getElementById('favoritesAnalytics');
        if (analyticsContainer && this.favoritesAnalytics) {
            this.renderFavoritesAnalytics();
        }
    }

    async exportFavorites() {
        try {
            const response = await fetch('/api/tools/favorites/export');
            const data = await response.json();
            
            if (data.success) {
                const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `osint-favorites-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showNotification('Favorites exported successfully', 'success');
            } else {
                this.showNotification(data.error || 'Failed to export favorites', 'error');
            }
        } catch (error) {
            console.error('Error exporting favorites:', error);
            this.showNotification('Failed to export favorites', 'error');
        }
    }

    async importFavorites() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const importData = JSON.parse(text);
                
                const response = await fetch('/api/tools/favorites/import', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(importData)
                });

                const data = await response.json();
                
                if (data.success) {
                    await this.loadFavorites();
                    this.updateFavoritesCount();
                    this.showNotification(`Imported ${data.data.imported} new favorites`, 'success');
                } else {
                    this.showNotification(data.error || 'Failed to import favorites', 'error');
                }
            } catch (error) {
                console.error('Error importing favorites:', error);
                this.showNotification('Failed to import favorites', 'error');
            }
        };
        
        input.click();
    }

    async clearAllFavorites() {
        if (!confirm('Are you sure you want to clear all favorites? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch('/api/tools/favorites', {
                method: 'DELETE'
            });

            const data = await response.json();
            
            if (data.success) {
                this.favorites = [];
                this.updateFavoritesCount();
                this.showNotification(`Cleared ${data.data.cleared} favorites`, 'success');
                this.renderFavoritesList();
            } else {
                this.showNotification(data.error || 'Failed to clear favorites', 'error');
            }
        } catch (error) {
            console.error('Error clearing favorites:', error);
            this.showNotification('Failed to clear favorites', 'error');
        }
    }

    openFavorite(category, toolId) {
        const tool = this.getToolById(category, toolId);
        if (tool) {
            this.showToolModal(tool);
            this.incrementFavoriteUsage(category, toolId);
        }
    }

    editFavorite(category, toolId) {
        const favorite = this.getFavorite(category, toolId);
        if (!favorite) return;

        this.showEditFavoriteModal(favorite);
    }

    showEditFavoriteModal(favorite) {
        const modal = document.getElementById('editFavoriteModal');
        if (!modal) return;

        // Populate form
        document.getElementById('editFavoriteName').value = favorite.name;
        document.getElementById('editFavoriteNotes').value = favorite.notes || '';
        document.getElementById('editFavoriteRating').value = favorite.rating || 0;
        
        // Store current favorite for update
        modal.dataset.favoriteId = favorite.id;
        modal.dataset.category = favorite.category;
        modal.dataset.toolId = favorite.toolId;
        
        modal.classList.add('show');
    }

    hideEditFavoriteModal() {
        const modal = document.getElementById('editFavoriteModal');
        modal?.classList.remove('show');
    }

    async saveFavoriteEdit() {
        const modal = document.getElementById('editFavoriteModal');
        if (!modal) return;

        const category = modal.dataset.category;
        const toolId = modal.dataset.toolId;
        const notes = document.getElementById('editFavoriteNotes').value;
        const rating = parseInt(document.getElementById('editFavoriteRating').value) || 0;

        const success = await this.updateFavorite(category, toolId, { notes, rating });
        if (success) {
            this.hideEditFavoriteModal();
            this.renderFavoritesList();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    getAllTools() {
        const allTools = [];
        for (const [category, subcategories] of Object.entries(this.tools)) {
            for (const [subcategory, tools] of Object.entries(subcategories)) {
                for (const [toolId, tool] of Object.entries(tools)) {
                    allTools.push({
                        ...tool,
                        toolId,
                        category,
                        subcategory
                    });
                }
            }
        }
        return allTools;
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const clearSearch = document.getElementById('clearSearch');
        
        searchInput?.addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.updateClearSearchButton();
            this.filterTools();
        });

        clearSearch?.addEventListener('click', () => {
            searchInput.value = '';
            this.filters.search = '';
            this.updateClearSearchButton();
            this.filterTools();
        });

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter?.addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.filterTools();
        });

        // Type filter
        const typeFilter = document.getElementById('typeFilter');
        typeFilter?.addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.filterTools();
        });

        // Favorites toggle
        const favoritesToggle = document.getElementById('favoritesToggle');
        favoritesToggle?.addEventListener('click', () => {
            this.toggleFavoritesView();
        });

        // Favorites modal
        const favoritesModalBtn = document.getElementById('favoritesModalBtn');
        const favoritesModalClose = document.getElementById('favoritesModalClose');
        
        favoritesModalBtn?.addEventListener('click', () => {
            this.showFavoritesModal();
        });

        favoritesModalClose?.addEventListener('click', () => {
            this.hideFavoritesModal();
        });

        // Favorites export/import
        const exportFavoritesBtn = document.getElementById('exportFavoritesBtn');
        const importFavoritesBtn = document.getElementById('importFavoritesBtn');
        const clearFavoritesBtn = document.getElementById('clearFavoritesBtn');
        
        exportFavoritesBtn?.addEventListener('click', () => {
            this.exportFavorites();
        });

        importFavoritesBtn?.addEventListener('click', () => {
            this.importFavorites();
        });

        clearFavoritesBtn?.addEventListener('click', () => {
            this.clearAllFavorites();
        });

        // Edit favorite modal
        const editFavoriteModal = document.getElementById('editFavoriteModal');
        const editFavoriteModalClose = document.getElementById('editFavoriteModalClose');
        const saveFavoriteEditBtn = document.getElementById('saveFavoriteEditBtn');
        
        editFavoriteModalClose?.addEventListener('click', () => {
            this.hideEditFavoriteModal();
        });

        saveFavoriteEditBtn?.addEventListener('click', () => {
            this.saveFavoriteEdit();
        });

        // Advanced filters
        const advancedFilters = document.getElementById('advancedFilters');
        const filtersModal = document.getElementById('filtersModal');
        const filtersModalClose = document.getElementById('filtersModalClose');
        
        advancedFilters?.addEventListener('click', () => {
            this.showFiltersModal();
        });

        filtersModalClose?.addEventListener('click', () => {
            this.hideFiltersModal();
        });

        // View toggle
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setView(e.target.closest('.view-btn').dataset.view);
            });
        });

        // Sort functionality
        const sortSelect = document.getElementById('sortSelect');
        sortSelect?.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.sortTools();
        });

        // Sidebar toggle
        const toggleSidebar = document.getElementById('toggleSidebar');
        const categoryList = document.getElementById('categoryList');
        
        toggleSidebar?.addEventListener('click', () => {
            categoryList?.classList.toggle('show');
        });

        // Modal close
        const modalClose = document.getElementById('modalClose');
        const toolModal = document.getElementById('toolModal');
        
        modalClose?.addEventListener('click', () => {
            this.hideToolModal();
        });

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideToolModal();
                this.hideFiltersModal();
                this.hideFavoritesModal();
                this.hideEditFavoriteModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideToolModal();
                this.hideFiltersModal();
                this.hideFavoritesModal();
                this.hideEditFavoriteModal();
            }
            
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput?.focus();
            }

            // Ctrl/Cmd + F for favorites
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.showFavoritesModal();
            }
        });
    }

    renderCategories() {
        const categoryList = document.getElementById('categoryList');
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (!categoryList || !categoryFilter) return;

        let categoryListHTML = '';
        let categoryFilterHTML = '<option value="">All Categories</option>';

        for (const [categoryName, categoryInfo] of Object.entries(this.categories)) {
            const totalTools = Object.values(categoryInfo.subcategories)
                .reduce((sum, sub) => sum + sub.count, 0);

            // Category list item
            categoryListHTML += `
                <div class="category-item">
                    <div class="category-header" data-category="${categoryName}">
                        <div class="category-info">
                            <span class="category-icon">${categoryInfo.icon}</span>
                            <span class="category-name">${categoryName}</span>
                        </div>
                        <div class="category-count">${totalTools}</div>
                        <i class="fas fa-chevron-down category-arrow"></i>
                    </div>
                    <div class="subcategories">
                        ${this.renderSubcategories(categoryName, categoryInfo.subcategories)}
                    </div>
                </div>
            `;

            // Category filter option
            categoryFilterHTML += `<option value="${categoryName}">${categoryName} (${totalTools})</option>`;
        }

        categoryList.innerHTML = categoryListHTML;
        categoryFilter.innerHTML = categoryFilterHTML;

        // Add click handlers for category selection
        const categoryHeaders = categoryList.querySelectorAll('.category-header');
        categoryHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const category = header.dataset.category;
                this.selectCategory(category);
            });
        });
    }

    renderSubcategories(categoryName, subcategories) {
        return Object.entries(subcategories).map(([subcategoryName, subcategoryInfo]) => `
            <div class="subcategory-item" data-category="${categoryName}" data-subcategory="${subcategoryName}">
                <div class="subcategory-info">
                    <span class="subcategory-icon">${subcategoryInfo.icon}</span>
                    <span class="subcategory-name">${subcategoryName}</span>
                </div>
                <div class="subcategory-count">${subcategoryInfo.count}</div>
            </div>
        `).join('');
    }

    selectCategory(category) {
        this.currentCategory = category;
        this.currentSubcategory = null;
        this.updateBreadcrumb();
        this.filterTools();
    }

    selectSubcategory(category, subcategory) {
        this.currentCategory = category;
        this.currentSubcategory = subcategory;
        this.updateBreadcrumb();
        this.filterTools();
    }

    updateBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;

        let breadcrumbHTML = '<a href="#" onclick="toolsPage.clearFilters()">All Tools</a>';
        
        if (this.currentCategory) {
            breadcrumbHTML += ` > <span>${this.currentCategory}</span>`;
        }
        
        if (this.currentSubcategory) {
            breadcrumbHTML += ` > <span>${this.currentSubcategory}</span>`;
        }

        breadcrumb.innerHTML = breadcrumbHTML;
    }

    filterTools() {
        let filtered = this.getAllTools();

        // Apply category filter
        if (this.currentCategory) {
            filtered = filtered.filter(tool => tool.category === this.currentCategory);
        }

        // Apply subcategory filter
        if (this.currentSubcategory) {
            filtered = filtered.filter(tool => tool.subcategory === this.currentSubcategory);
        }

        // Apply search filter
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filtered = filtered.filter(tool => 
                tool.name.toLowerCase().includes(searchTerm) ||
                tool.description.toLowerCase().includes(searchTerm) ||
                tool.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // Apply category dropdown filter
        if (this.filters.category) {
            filtered = filtered.filter(tool => tool.category === this.filters.category);
        }

        // Apply type filter
        if (this.filters.type) {
            filtered = filtered.filter(tool => tool.type === this.filters.type);
        }

        // Apply tag filters
        if (this.filters.tags.length > 0) {
            filtered = filtered.filter(tool => 
                this.filters.tags.some(tag => tool.tags.includes(tag))
            );
        }

        // Apply source filters
        if (this.filters.sources.length > 0) {
            filtered = filtered.filter(tool => 
                this.filters.sources.includes(tool.sourceRepo)
            );
        }

        // Apply favorites filter
        if (this.filters.favoritesOnly) {
            filtered = filtered.filter(tool => this.isFavorited(tool.category, tool.toolId));
        }

        this.filteredTools = filtered;
        this.renderTools();
        this.updateResultsCount();
    }

    renderTools() {
        const container = document.getElementById('toolsContainer');
        if (!container) return;

        if (this.filteredTools.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();

        const isListView = this.currentView === 'list';
        const viewClass = isListView ? 'list-view' : '';
        
        let html = `<div class="tools-container ${viewClass}">`;
        
        this.filteredTools.forEach(tool => {
            html += this.renderToolCard(tool, isListView);
        });
        
        html += '</div>';
        
        container.innerHTML = html;

        // Add click handlers for tool cards
        const toolCards = container.querySelectorAll('.tool-card');
        toolCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const toolId = e.currentTarget.dataset.toolId;
                const tool = this.filteredTools.find(t => t.toolId === toolId);
                if (tool) {
                    this.showToolModal(tool);
                }
            });
        });
    }

    renderToolCard(tool, isListView) {
        const listClass = isListView ? 'list-view' : '';
        const isFavorited = this.isFavorited(tool.category, tool.toolId);
        const favorite = this.getFavorite(tool.category, tool.toolId);
        
        return `
            <div class="tool-card ${listClass}" data-tool-id="${tool.toolId}">
                <div class="tool-header ${listClass}">
                    <div class="tool-icon ${listClass}">
                        ${tool.icon}
                    </div>
                    <div class="tool-info">
                        <div class="tool-name ${listClass}">
                            ${tool.name}
                            <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" 
                                    onclick="event.stopPropagation(); toolsPage.toggleFavorite('${tool.category}', '${tool.toolId}')"
                                    title="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                        <div class="tool-description ${listClass}">${tool.description}</div>
                        ${favorite && favorite.notes ? `
                            <div class="tool-notes ${listClass}">
                                <i class="fas fa-sticky-note"></i>
                                ${favorite.notes}
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="tool-meta ${listClass}">
                    <span class="tool-type ${tool.type}">
                        <i class="fas fa-${this.getTypeIcon(tool.type)}"></i>
                        ${tool.type}
                    </span>
                    <span class="tool-source">${tool.sourceRepo}</span>
                    ${favorite ? `
                        <span class="tool-usage">
                            <i class="fas fa-chart-line"></i>
                            Used ${favorite.usageCount || 0} times
                        </span>
                    ` : ''}
                </div>
                
                <div class="tool-tags ${listClass}">
                    ${tool.tags.slice(0, 3).map(tag => 
                        `<span class="tool-tag">${tag}</span>`
                    ).join('')}
                    ${tool.tags.length > 3 ? `<span class="tool-tag">+${tool.tags.length - 3}</span>` : ''}
                </div>
                
                <div class="tool-actions ${listClass}">
                    <a href="${tool.url}" target="_blank" class="btn btn-primary btn-sm" onclick="event.stopPropagation()">
                        <i class="fas fa-external-link-alt"></i>
                        Visit
                    </a>
                    <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); toolsPage.showToolModal(${JSON.stringify(tool).replace(/"/g, '&quot;')})">
                        <i class="fas fa-info-circle"></i>
                        Details
                    </button>
                    ${isFavorited ? `
                        <button class="btn btn-warning btn-sm" onclick="event.stopPropagation(); toolsPage.editFavorite('${tool.category}', '${tool.toolId}')">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    getTypeIcon(type) {
        const icons = {
            'web': 'globe',
            'cli': 'terminal',
            'internal': 'cog'
        };
        return icons[type] || 'toolbox';
    }

    setView(view) {
        this.currentView = view;
        
        // Update view buttons
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        this.renderTools();
    }

    sortTools() {
        this.filteredTools.sort((a, b) => {
            switch (this.currentSort) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'category':
                    return a.category.localeCompare(b.category);
                case 'type':
                    return a.type.localeCompare(b.type);
                case 'popularity':
                    return (b.tags?.length || 0) - (a.tags?.length || 0);
                default:
                    return 0;
            }
        });
        
        this.renderTools();
    }

    showToolModal(tool) {
        const modal = document.getElementById('toolModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (!modal || !modalTitle || !modalBody) return;

        modalTitle.textContent = tool.name;
        
        modalBody.innerHTML = `
            <div class="tool-modal-content">
                <div class="tool-modal-header">
                    <div class="tool-modal-icon">
                        ${tool.icon}
                    </div>
                    <div class="tool-modal-info">
                        <h3>${tool.name}</h3>
                        <p class="tool-modal-description">${tool.description}</p>
                        <div class="tool-modal-meta">
                            <span class="tool-type ${tool.type}">
                                <i class="fas fa-${this.getTypeIcon(tool.type)}"></i>
                                ${tool.type}
                            </span>
                            <span class="tool-source">Source: ${tool.sourceRepo}</span>
                        </div>
                    </div>
                </div>
                
                <div class="tool-modal-details">
                    <div class="tool-modal-section">
                        <h4>Category</h4>
                        <p>${tool.category} > ${tool.subcategory}</p>
                    </div>
                    
                    <div class="tool-modal-section">
                        <h4>Tags</h4>
                        <div class="tool-modal-tags">
                            ${tool.tags.map(tag => `<span class="tool-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="tool-modal-section">
                        <h4>Actions</h4>
                        <div class="tool-modal-actions">
                            <a href="${tool.url}" target="_blank" class="btn btn-primary">
                                <i class="fas fa-external-link-alt"></i>
                                Visit Tool
                            </a>
                            ${tool.type === 'cli' ? `
                                <button class="btn btn-secondary" onclick="this.showCLIInfo('${tool.name}')">
                                    <i class="fas fa-terminal"></i>
                                    CLI Info
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('show');
    }

    hideToolModal() {
        const modal = document.getElementById('toolModal');
        modal?.classList.remove('show');
    }

    showFiltersModal() {
        const modal = document.getElementById('filtersModal');
        if (!modal) return;

        this.renderTagFilters();
        this.renderSourceFilters();
        modal.classList.add('show');
    }

    hideFiltersModal() {
        const modal = document.getElementById('filtersModal');
        modal?.classList.remove('show');
    }

    renderTagFilters() {
        const tagFilters = document.getElementById('tagFilters');
        if (!tagFilters) return;

        const allTags = new Set();
        this.getAllTools().forEach(tool => {
            tool.tags.forEach(tag => allTags.add(tag));
        });

        const tagArray = Array.from(allTags).sort();
        
        tagFilters.innerHTML = tagArray.map(tag => `
            <label class="filter-checkbox">
                <input type="checkbox" value="${tag}" ${this.filters.tags.includes(tag) ? 'checked' : ''}>
                <span>${tag}</span>
            </label>
        `).join('');

        // Add event listeners
        const checkboxes = tagFilters.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateTagFilters();
            });
        });
    }

    renderSourceFilters() {
        const sourceFilters = document.getElementById('sourceFilters');
        if (!sourceFilters) return;

        const allSources = new Set();
        this.getAllTools().forEach(tool => {
            allSources.add(tool.sourceRepo);
        });

        const sourceArray = Array.from(allSources).sort();
        
        sourceFilters.innerHTML = sourceArray.map(source => `
            <label class="filter-checkbox">
                <input type="checkbox" value="${source}" ${this.filters.sources.includes(source) ? 'checked' : ''}>
                <span>${source}</span>
            </label>
        `).join('');

        // Add event listeners
        const checkboxes = sourceFilters.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateSourceFilters();
            });
        });
    }

    updateTagFilters() {
        const checkboxes = document.querySelectorAll('#tagFilters input[type="checkbox"]:checked');
        this.filters.tags = Array.from(checkboxes).map(cb => cb.value);
        this.filterTools();
    }

    updateSourceFilters() {
        const checkboxes = document.querySelectorAll('#sourceFilters input[type="checkbox"]:checked');
        this.filters.sources = Array.from(checkboxes).map(cb => cb.value);
        this.filterTools();
    }

    clearFilters() {
        this.filters = {
            search: '',
            category: '',
            type: '',
            tags: [],
            sources: [],
            favoritesOnly: false
        };
        
        this.currentCategory = null;
        this.currentSubcategory = null;
        
        // Reset UI
        document.getElementById('searchInput').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('favoritesToggle').classList.remove('active');
        
        this.updateClearSearchButton();
        this.updateBreadcrumb();
        this.filterTools();
    }

    updateClearSearchButton() {
        const clearSearch = document.getElementById('clearSearch');
        if (clearSearch) {
            clearSearch.style.display = this.filters.search ? 'block' : 'none';
        }
    }

    updateResultsCount() {
        const totalTools = document.getElementById('totalTools');
        if (totalTools) {
            totalTools.textContent = this.filteredTools.length.toLocaleString();
        }
    }

    updateStatistics() {
        const allTools = this.getAllTools();
        const stats = {
            tools: allTools.length,
            categories: Object.keys(this.categories).length,
            tags: new Set(allTools.flatMap(t => t.tags)).size,
            cli: allTools.filter(t => t.type === 'cli').length
        };

        document.getElementById('statsTools').textContent = stats.tools.toLocaleString();
        document.getElementById('statsCategories').textContent = stats.categories;
        document.getElementById('statsTags').textContent = stats.tags;
        document.getElementById('statsCLI').textContent = stats.cli;
    }

    showEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const toolsContainer = document.getElementById('toolsContainer');
        
        if (emptyState && toolsContainer) {
            emptyState.style.display = 'flex';
            toolsContainer.style.display = 'none';
        }
    }

    hideEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const toolsContainer = document.getElementById('toolsContainer');
        
        if (emptyState && toolsContainer) {
            emptyState.style.display = 'none';
            toolsContainer.style.display = 'grid';
        }
    }

    hideLoading() {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.style.display = 'none';
        }
    }

    showError(message) {
        // Create and show error notification
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    toggleFavoritesView() {
        this.filters.favoritesOnly = !this.filters.favoritesOnly;
        this.filterTools();
    }

    updateFavoritesCount() {
        const countElement = document.getElementById('totalFavorites');
        if (countElement) {
            countElement.textContent = this.favorites.length;
        }
    }

    async toggleFavorite(category, toolId) {
        const isFavorited = this.isFavorited(category, toolId);
        
        if (isFavorited) {
            await this.removeFromFavorites(category, toolId);
        } else {
            await this.addToFavorites(category, toolId);
        }
        
        // Re-render tools to update favorite status
        this.renderTools();
    }
}

// Initialize the tools page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.toolsPage = new ToolsPage();
});

// Export for global access
window.ToolsPage = ToolsPage; 