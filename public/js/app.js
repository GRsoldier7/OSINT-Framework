// Ultimate OSINT Framework v3.0 - Main Application
class OSINTApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.socket = null;
        this.notifications = [];
        this.investigations = [];
        this.settings = this.loadSettings();
        
        this.init();
    }

    async init() {
        try {
            // Initialize Socket.IO connection
            this.initSocket();
            
            // Initialize UI components
            this.initUI();
            
            // Initialize event listeners
            this.initEventListeners();
            
            // Load dashboard data
            await this.loadDashboard();
            
            // Check system status
            await this.checkSystemStatus();
            
            // Hide loading screen and show app
            this.showApp();
            
            console.log('OSINT Framework v3.0 initialized successfully');
        } catch (error) {
            console.error('Failed to initialize OSINT Framework:', error);
            this.showError('Failed to initialize application');
        }
    }

    initSocket() {
        try {
            this.socket = io();
            
            this.socket.on('connect', () => {
                console.log('Connected to server');
                this.updateStatus('api-status', 'Connected', 'success');
            });
            
            this.socket.on('disconnect', () => {
                console.log('Disconnected from server');
                this.updateStatus('api-status', 'Disconnected', 'error');
            });
            
            this.socket.on('search-progress', (data) => {
                this.updateSearchProgress(data);
            });
            
            this.socket.on('ai-analysis-complete', (data) => {
                this.handleAIAnalysisComplete(data);
            });
            
            this.socket.on('investigation-update', (data) => {
                this.handleInvestigationUpdate(data);
            });
            
        } catch (error) {
            console.error('Socket initialization failed:', error);
        }
    }

    initUI() {
        // Initialize navigation
        this.initNavigation();
        
        // Initialize sidebar
        this.initSidebar();
        
        // Initialize modals
        this.initModals();
        
        // Initialize notifications
        this.initNotifications();
    }

    initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigateToSection(section);
            });
        });

        // Quick action buttons
        const quickActionBtns = document.querySelectorAll('.quick-action-btn');
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });

        // New investigation button
        const newInvestigationBtn = document.getElementById('new-investigation-btn');
        if (newInvestigationBtn) {
            newInvestigationBtn.addEventListener('click', () => {
                this.showNewInvestigationModal();
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettingsModal();
            });
        }
    }

    initSidebar() {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                
                const icon = sidebarToggle.querySelector('i');
                if (sidebar.classList.contains('open')) {
                    icon.className = 'fas fa-chevron-right';
                } else {
                    icon.className = 'fas fa-chevron-left';
                }
            });
        }

        // Tool links in sidebar
        const toolLinks = document.querySelectorAll('.tool-list a');
        toolLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tool = link.getAttribute('data-tool');
                this.openTool(tool);
            });
        });
    }

    initModals() {
        // Modal container for dynamic modals
        this.modalContainer = document.getElementById('modal-container');
    }

    initNotifications() {
        this.notificationsContainer = document.getElementById('notifications-container');
    }

    initEventListeners() {
        // Global event listeners
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        this.focusSearch();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.showNewInvestigationModal();
                        break;
                    case 's':
                        e.preventDefault();
                        this.showSettingsModal();
                        break;
                }
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    async loadDashboard() {
        try {
            // Load recent investigations
            await this.loadRecentInvestigations();
            
            // Load statistics
            await this.loadStatistics();
            
            // Load system status
            await this.checkSystemStatus();
            
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        }
    }

    async loadRecentInvestigations() {
        try {
            // This would typically fetch from API
            const investigations = this.getStoredInvestigations();
            this.renderRecentInvestigations(investigations);
        } catch (error) {
            console.error('Failed to load recent investigations:', error);
        }
    }

    async loadStatistics() {
        try {
            // This would typically fetch from API
            const stats = {
                totalSearches: localStorage.getItem('totalSearches') || 0,
                aiAnalyses: localStorage.getItem('aiAnalyses') || 0,
                reportsGenerated: localStorage.getItem('reportsGenerated') || 0,
                threatsDetected: localStorage.getItem('threatsDetected') || 0
            };
            
            this.updateStatistics(stats);
        } catch (error) {
            console.error('Failed to load statistics:', error);
        }
    }

    async checkSystemStatus() {
        try {
            // Check API status
            const apiStatus = await this.checkAPIHealth();
            this.updateStatus('api-status', apiStatus ? 'Healthy' : 'Unhealthy', apiStatus ? 'success' : 'error');
            
            // Check AI service
            const aiStatus = await this.checkAIService();
            this.updateStatus('ai-status', aiStatus ? 'Available' : 'Unavailable', aiStatus ? 'success' : 'error');
            
            // Check database
            const dbStatus = await this.checkDatabase();
            this.updateStatus('db-status', dbStatus ? 'Connected' : 'Disconnected', dbStatus ? 'success' : 'error');
            
        } catch (error) {
            console.error('Failed to check system status:', error);
            this.updateStatus('api-status', 'Error', 'error');
        }
    }

    async checkAPIHealth() {
        try {
            const response = await fetch('/api/health');
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async checkAIService() {
        try {
            const response = await fetch('/api/ai/health');
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async checkDatabase() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            return data.database === 'connected';
        } catch (error) {
            return false;
        }
    }

    navigateToSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-section="${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(sectionEl => {
            sectionEl.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        } else {
            // Load dynamic content
            this.loadDynamicSection(section);
        }
        
        this.currentSection = section;
        
        // Update URL
        window.history.pushState({ section }, '', `#${section}`);
    }

    async loadDynamicSection(section) {
        try {
            const dynamicContent = document.getElementById('dynamic-content');
            
            // Show loading state
            dynamicContent.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading ${section}...</p>
                </div>
            `;
            
            // Load section content
            const response = await fetch(`/api/sections/${section}`);
            if (response.ok) {
                const content = await response.text();
                dynamicContent.innerHTML = content;
            } else {
                dynamicContent.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to load ${section}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error(`Failed to load section ${section}:`, error);
        }
    }

    handleQuickAction(action) {
        switch (action) {
            case 'search':
                this.navigateToSection('search');
                this.focusSearch();
                break;
            case 'username':
                this.navigateToSection('username');
                break;
            case 'email':
                this.navigateToSection('email');
                break;
            case 'domain':
                this.navigateToSection('domain');
                break;
            default:
                console.log('Unknown quick action:', action);
        }
    }

    openTool(tool) {
        switch (tool) {
            case 'search-engines':
                this.navigateToSection('search');
                break;
            case 'social-search':
                this.navigateToSection('social');
                break;
            case 'username-analysis':
                this.navigateToSection('username');
                break;
            case 'email-analysis':
                this.navigateToSection('email');
                break;
            case 'domain-analysis':
                this.navigateToSection('domain');
                break;
            case 'ip-analysis':
                this.navigateToSection('ip');
                break;
            case 'ai-analysis':
                this.navigateToSection('ai');
                break;
            default:
                console.log('Unknown tool:', tool);
        }
    }

    focusSearch() {
        const searchInput = document.getElementById('search-query');
        if (searchInput) {
            searchInput.focus();
        }
    }

    showNewInvestigationModal() {
        const modal = this.createModal({
            title: 'New Investigation',
            content: this.getNewInvestigationForm(),
            actions: [
                { text: 'Cancel', type: 'secondary', action: 'close' },
                { text: 'Create', type: 'primary', action: 'create' }
            ]
        });
        
        this.showModal(modal);
    }

    showSettingsModal() {
        const modal = this.createModal({
            title: 'Settings',
            content: this.getSettingsForm(),
            actions: [
                { text: 'Cancel', type: 'secondary', action: 'close' },
                { text: 'Save', type: 'primary', action: 'save' }
            ]
        });
        
        this.showModal(modal);
    }

    createModal(config) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${config.title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${config.content}
                </div>
                <div class="modal-footer">
                    ${config.actions.map(action => `
                        <button class="btn btn-${action.type}" data-action="${action.action}">
                            ${action.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        return modal;
    }

    showModal(modal) {
        this.modalContainer.appendChild(modal);
        
        // Add event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const backdrop = modal.querySelector('.modal-backdrop');
        const actionBtns = modal.querySelectorAll('[data-action]');
        
        const closeModal = () => {
            modal.remove();
        };
        
        closeBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);
        
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.getAttribute('data-action');
                this.handleModalAction(action, modal);
            });
        });
        
        // Show modal
        setTimeout(() => modal.classList.add('show'), 10);
    }

    handleModalAction(action, modal) {
        switch (action) {
            case 'close':
                modal.remove();
                break;
            case 'create':
                this.createInvestigation(modal);
                break;
            case 'save':
                this.saveSettings(modal);
                break;
            default:
                console.log('Unknown modal action:', action);
        }
    }

    getNewInvestigationForm() {
        return `
            <div class="form-group">
                <label for="investigation-name">Investigation Name</label>
                <input type="text" id="investigation-name" class="form-input" placeholder="Enter investigation name">
            </div>
            <div class="form-group">
                <label for="investigation-type">Type</label>
                <select id="investigation-type" class="form-select">
                    <option value="search">Search Investigation</option>
                    <option value="username">Username Investigation</option>
                    <option value="email">Email Investigation</option>
                    <option value="domain">Domain Investigation</option>
                    <option value="ip">IP Investigation</option>
                    <option value="social">Social Media Investigation</option>
                </select>
            </div>
            <div class="form-group">
                <label for="investigation-description">Description</label>
                <textarea id="investigation-description" class="form-textarea" placeholder="Enter investigation description"></textarea>
            </div>
        `;
    }

    getSettingsForm() {
        return `
            <div class="form-group">
                <label for="api-key">OpenAI API Key</label>
                <input type="password" id="api-key" class="form-input" value="${this.settings.apiKey || ''}" placeholder="Enter your OpenAI API key">
            </div>
            <div class="form-group">
                <label for="theme">Theme</label>
                <select id="theme" class="form-select">
                    <option value="light" ${this.settings.theme === 'light' ? 'selected' : ''}>Light</option>
                    <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                    <option value="auto" ${this.settings.theme === 'auto' ? 'selected' : ''}>Auto</option>
                </select>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="notifications" ${this.settings.notifications ? 'checked' : ''}>
                    Enable Notifications
                </label>
            </div>
        `;
    }

    async createInvestigation(modal) {
        const name = modal.querySelector('#investigation-name').value;
        const type = modal.querySelector('#investigation-type').value;
        const description = modal.querySelector('#investigation-description').value;
        
        if (!name.trim()) {
            this.showNotification('Please enter an investigation name', 'error');
            return;
        }
        
        try {
            const investigation = {
                id: this.generateId(),
                name,
                type,
                description,
                createdAt: new Date().toISOString(),
                status: 'active'
            };
            
            this.investigations.push(investigation);
            this.saveInvestigations();
            
            modal.remove();
            this.showNotification('Investigation created successfully', 'success');
            
            // Navigate to the appropriate section
            this.navigateToSection(type);
            
        } catch (error) {
            console.error('Failed to create investigation:', error);
            this.showNotification('Failed to create investigation', 'error');
        }
    }

    async saveSettings(modal) {
        const apiKey = modal.querySelector('#api-key').value;
        const theme = modal.querySelector('#theme').value;
        const notifications = modal.querySelector('#notifications').checked;
        
        this.settings = {
            ...this.settings,
            apiKey,
            theme,
            notifications
        };
        
        this.saveSettings();
        this.applyTheme(theme);
        
        modal.remove();
        this.showNotification('Settings saved successfully', 'success');
    }

    updateStatus(elementId, status, type) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = status;
            element.className = `status-value status-${type}`;
        }
    }

    updateStatistics(stats) {
        document.getElementById('total-searches').textContent = stats.totalSearches;
        document.getElementById('ai-analyses').textContent = stats.aiAnalyses;
        document.getElementById('reports-generated').textContent = stats.reportsGenerated;
        document.getElementById('threats-detected').textContent = stats.threatsDetected;
    }

    renderRecentInvestigations(investigations) {
        const container = document.getElementById('recent-investigations');
        if (!container) return;
        
        if (investigations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>No recent investigations</p>
                </div>
            `;
            return;
        }
        
        const recentInvestigations = investigations.slice(0, 5);
        container.innerHTML = recentInvestigations.map(inv => `
            <div class="investigation-item">
                <div class="investigation-info">
                    <h4>${inv.name}</h4>
                    <p>${inv.type} • ${this.formatDate(inv.createdAt)}</p>
                </div>
                <button class="btn btn-sm btn-secondary" onclick="app.openInvestigation('${inv.id}')">
                    Open
                </button>
            </div>
        `).join('');
    }

    showApp() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        this.notificationsContainer.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => notification.remove());
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    handleResize() {
        // Handle responsive behavior
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('open');
        }
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    loadSettings() {
        try {
            return JSON.parse(localStorage.getItem('osint-settings')) || {};
        } catch (error) {
            return {};
        }
    }

    saveSettings() {
        localStorage.setItem('osint-settings', JSON.stringify(this.settings));
    }

    getStoredInvestigations() {
        try {
            return JSON.parse(localStorage.getItem('osint-investigations')) || [];
        } catch (error) {
            return [];
        }
    }

    saveInvestigations() {
        localStorage.setItem('osint-investigations', JSON.stringify(this.investigations));
    }

    applyTheme(theme) {
        document.body.className = `theme-${theme}`;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new OSINTApp();
}); 