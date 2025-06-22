// API Service for OSINT Framework
class APIService {
    constructor() {
        this.baseURL = '/api';
        this.timeout = 30000; // 30 seconds
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: this.timeout,
        };

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeout);

            const response = await fetch(url, {
                ...config,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            return await response.text();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    // Search API methods
    async searchBasic(query, engines = ['google', 'bing', 'duckduckgo'], options = {}) {
        return this.request('/search/basic', {
            method: 'POST',
            body: JSON.stringify({ query, engines, options }),
        });
    }

    async searchAdvanced(query, engines, filters = {}, includeAI = true, options = {}) {
        return this.request('/search/advanced', {
            method: 'POST',
            body: JSON.stringify({ query, engines, filters, includeAI, options }),
        });
    }

    async searchSocial(query, platforms = ['twitter', 'facebook', 'instagram', 'linkedin', 'reddit'], options = {}) {
        return this.request('/search/social', {
            method: 'POST',
            body: JSON.stringify({ query, platforms, options }),
        });
    }

    async searchNews(query, engines = ['google-news', 'bing-news'], dateRange, options = {}) {
        return this.request('/search/news', {
            method: 'POST',
            body: JSON.stringify({ query, engines, dateRange, options }),
        });
    }

    async searchImages(query, engines = ['google-images', 'bing-images'], options = {}) {
        return this.request('/search/images', {
            method: 'POST',
            body: JSON.stringify({ query, engines, options }),
        });
    }

    async getSearchSuggestions(query) {
        return this.request(`/search/suggestions?query=${encodeURIComponent(query)}`);
    }

    async getSearchTrends(query) {
        return this.request(`/search/trends?query=${encodeURIComponent(query)}`);
    }

    async getSearchEngines() {
        return this.request('/search/engines');
    }

    async batchSearch(queries, engines = ['google', 'bing'], options = {}) {
        return this.request('/search/batch', {
            method: 'POST',
            body: JSON.stringify({ queries, engines, options }),
        });
    }

    // Username API methods
    async searchUsername(username, platforms = []) {
        return this.request('/username/search', {
            method: 'POST',
            body: JSON.stringify({ username, platforms }),
        });
    }

    async analyzeUsername(username, platforms) {
        return this.request('/username/analyze', {
            method: 'POST',
            body: JSON.stringify({ username, platforms }),
        });
    }

    // Email API methods
    async analyzeEmail(email) {
        return this.request('/email/analyze', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    async checkBreaches(email) {
        return this.request('/email/breaches', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    async verifyEmail(email) {
        return this.request('/email/verify', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    // Domain API methods
    async analyzeDomain(domain) {
        return this.request('/domain/analyze', {
            method: 'POST',
            body: JSON.stringify({ domain }),
        });
    }

    async getWHOIS(domain) {
        return this.request('/domain/whois', {
            method: 'POST',
            body: JSON.stringify({ domain }),
        });
    }

    async getDNSRecords(domain) {
        return this.request('/domain/dns', {
            method: 'POST',
            body: JSON.stringify({ domain }),
        });
    }

    async checkSSL(domain) {
        return this.request('/domain/ssl', {
            method: 'POST',
            body: JSON.stringify({ domain }),
        });
    }

    // IP API methods
    async analyzeIP(ip) {
        return this.request('/ip/analyze', {
            method: 'POST',
            body: JSON.stringify({ ip }),
        });
    }

    async getGeoLocation(ip) {
        return this.request('/ip/geolocation', {
            method: 'POST',
            body: JSON.stringify({ ip }),
        });
    }

    async checkReputation(ip) {
        return this.request('/ip/reputation', {
            method: 'POST',
            body: JSON.stringify({ ip }),
        });
    }

    // Social Media API methods
    async searchSocialProfiles(query, platforms = []) {
        return this.request('/social/search', {
            method: 'POST',
            body: JSON.stringify({ query, platforms }),
        });
    }

    async analyzeSocialProfile(platform, username) {
        return this.request('/social/analyze', {
            method: 'POST',
            body: JSON.stringify({ platform, username }),
        });
    }

    // Image Analysis API methods
    async analyzeImage(imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        return this.request('/image/analyze', {
            method: 'POST',
            body: formData,
            headers: {}, // Let browser set content-type for FormData
        });
    }

    async reverseImageSearch(imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        return this.request('/image/reverse-search', {
            method: 'POST',
            body: formData,
            headers: {},
        });
    }

    async extractMetadata(imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        return this.request('/image/metadata', {
            method: 'POST',
            body: formData,
            headers: {},
        });
    }

    // Document Analysis API methods
    async analyzeDocument(documentFile) {
        const formData = new FormData();
        formData.append('document', documentFile);

        return this.request('/document/analyze', {
            method: 'POST',
            body: formData,
            headers: {},
        });
    }

    async extractText(documentFile) {
        const formData = new FormData();
        formData.append('document', documentFile);

        return this.request('/document/extract-text', {
            method: 'POST',
            body: formData,
            headers: {},
        });
    }

    // AI Analysis API methods
    async analyzeWithAI(data, type = 'general') {
        return this.request('/ai/analyze', {
            method: 'POST',
            body: JSON.stringify({ data, type }),
        });
    }

    async generateReport(investigationData) {
        return this.request('/ai/report', {
            method: 'POST',
            body: JSON.stringify({ investigationData }),
        });
    }

    async classifyThreat(data) {
        return this.request('/ai/classify-threat', {
            method: 'POST',
            body: JSON.stringify({ data }),
        });
    }

    async generateIOC(data) {
        return this.request('/ai/generate-ioc', {
            method: 'POST',
            body: JSON.stringify({ data }),
        });
    }

    // Analytics API methods
    async getAnalytics(timeRange = '7d') {
        return this.request(`/analytics?range=${timeRange}`);
    }

    async getSearchAnalytics(query) {
        return this.request('/analytics/search', {
            method: 'POST',
            body: JSON.stringify({ query }),
        });
    }

    async getThreatAnalytics() {
        return this.request('/analytics/threats');
    }

    // Reports API methods
    async generateReport(investigationId, format = 'pdf') {
        return this.request('/reports/generate', {
            method: 'POST',
            body: JSON.stringify({ investigationId, format }),
        });
    }

    async getReport(reportId) {
        return this.request(`/reports/${reportId}`);
    }

    async listReports() {
        return this.request('/reports');
    }

    async exportReport(reportId, format = 'pdf') {
        return this.request(`/reports/${reportId}/export?format=${format}`, {
            method: 'GET',
            headers: {
                'Accept': format === 'pdf' ? 'application/pdf' : 'application/json',
            },
        });
    }

    // Authentication API methods
    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST',
        });
    }

    async getProfile() {
        return this.request('/auth/profile');
    }

    async updateProfile(profileData) {
        return this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }

    // File upload helper
    async uploadFile(file, endpoint) {
        const formData = new FormData();
        formData.append('file', file);

        return this.request(endpoint, {
            method: 'POST',
            body: formData,
            headers: {}, // Let browser set content-type for FormData
        });
    }

    // WebSocket event handlers
    handleSocketEvent(event, data) {
        switch (event) {
            case 'search-progress':
                this.handleSearchProgress(data);
                break;
            case 'ai-analysis-complete':
                this.handleAIAnalysisComplete(data);
                break;
            case 'investigation-update':
                this.handleInvestigationUpdate(data);
                break;
            default:
                console.log('Unknown socket event:', event, data);
        }
    }

    handleSearchProgress(data) {
        // Emit custom event for search progress
        window.dispatchEvent(new CustomEvent('search-progress', { detail: data }));
    }

    handleAIAnalysisComplete(data) {
        // Emit custom event for AI analysis completion
        window.dispatchEvent(new CustomEvent('ai-analysis-complete', { detail: data }));
    }

    handleInvestigationUpdate(data) {
        // Emit custom event for investigation updates
        window.dispatchEvent(new CustomEvent('investigation-update', { detail: data }));
    }

    // Error handling
    handleError(error, context = '') {
        console.error(`API Error${context ? ` (${context})` : ''}:`, error);
        
        let message = 'An error occurred';
        
        if (error.message) {
            if (error.message.includes('timeout')) {
                message = 'Request timed out. Please try again.';
            } else if (error.message.includes('404')) {
                message = 'Resource not found.';
            } else if (error.message.includes('500')) {
                message = 'Server error. Please try again later.';
            } else if (error.message.includes('403')) {
                message = 'Access denied.';
            } else if (error.message.includes('401')) {
                message = 'Authentication required.';
            } else {
                message = error.message;
            }
        }
        
        // Show notification
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, 'error');
        }
        
        return { error: true, message };
    }

    // Utility methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidIP(ip) {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    }

    isValidDomain(domain) {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
        return domainRegex.test(domain);
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.trim().replace(/[<>]/g, '');
    }

    // Rate limiting helper
    async withRetry(fn, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                
                if (error.message.includes('429')) {
                    // Rate limited, wait longer
                    await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
                } else {
                    throw error;
                }
            }
        }
    }
}

// Create global API instance
window.api = new APIService(); 