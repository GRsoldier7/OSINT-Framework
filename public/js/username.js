// Username Analysis Module
class UsernameAnalysis {
    constructor() {
        this.platforms = [
            { id: 'twitter', name: 'Twitter/X', checked: true },
            { id: 'instagram', name: 'Instagram', checked: true },
            { id: 'facebook', name: 'Facebook', checked: true },
            { id: 'linkedin', name: 'LinkedIn', checked: true },
            { id: 'github', name: 'GitHub', checked: true },
            { id: 'reddit', name: 'Reddit', checked: true },
            { id: 'youtube', name: 'YouTube', checked: true },
            { id: 'tiktok', name: 'TikTok', checked: true },
            { id: 'snapchat', name: 'Snapchat', checked: false },
            { id: 'telegram', name: 'Telegram', checked: false }
        ];
        
        this.init();
    }

    init() {
        this.renderPlatforms();
        this.bindEvents();
    }

    renderPlatforms() {
        const container = document.getElementById('username-platforms');
        if (!container) return;

        container.innerHTML = this.platforms.map(platform => `
            <label class="checkbox-item">
                <input type="checkbox" value="${platform.id}" ${platform.checked ? 'checked' : ''}>
                <span class="checkmark"></span>
                ${platform.name}
            </label>
        `).join('');
    }

    bindEvents() {
        const searchBtn = document.getElementById('username-search-btn');
        const clearBtn = document.getElementById('clear-username-btn');
        const exportBtn = document.getElementById('export-username-btn');
        const analyzeBtn = document.getElementById('analyze-username-btn');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchUsername());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearResults());
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportResults());
        }

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.runAIAnalysis());
        }
    }

    async searchUsername() {
        const input = document.getElementById('username-input');
        const username = input?.value.trim();

        if (!username) {
            this.showNotification('Please enter a username to search', 'error');
            return;
        }

        const selectedPlatforms = this.getSelectedPlatforms();
        if (selectedPlatforms.length === 0) {
            this.showNotification('Please select at least one platform', 'error');
            return;
        }

        this.showLoading();
        
        try {
            const results = await this.performUsernameSearch(username, selectedPlatforms);
            this.displayResults(results);
        } catch (error) {
            console.error('Username search failed:', error);
            this.showNotification('Username search failed. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async performUsernameSearch(username, platforms) {
        // Simulate API call with realistic results
        const results = {
            username: username,
            timestamp: new Date().toISOString(),
            platforms: platforms,
            results: []
        };

        for (const platform of platforms) {
            const result = await this.searchPlatform(username, platform);
            results.results.push(result);
        }

        return results;
    }

    async searchPlatform(username, platform) {
        // Simulate platform-specific search
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

        const found = Math.random() > 0.3; // 70% chance of finding the username
        
        return {
            platform: platform,
            found: found,
            url: found ? `https://${platform}.com/${username}` : null,
            profile: found ? this.generateProfileData(username, platform) : null,
            lastSeen: found ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null
        };
    }

    generateProfileData(username, platform) {
        const profiles = {
            twitter: {
                followers: Math.floor(Math.random() * 10000),
                following: Math.floor(Math.random() * 1000),
                tweets: Math.floor(Math.random() * 5000),
                verified: Math.random() > 0.8
            },
            instagram: {
                followers: Math.floor(Math.random() * 50000),
                following: Math.floor(Math.random() * 2000),
                posts: Math.floor(Math.random() * 1000),
                private: Math.random() > 0.7
            },
            facebook: {
                friends: Math.floor(Math.random() * 1000),
                public: Math.random() > 0.5
            },
            linkedin: {
                connections: Math.floor(Math.random() * 500),
                company: Math.random() > 0.6 ? 'Sample Company' : null
            },
            github: {
                followers: Math.floor(Math.random() * 500),
                repositories: Math.floor(Math.random() * 50),
                stars: Math.floor(Math.random() * 1000)
            }
        };

        return profiles[platform] || {};
    }

    displayResults(results) {
        const container = document.getElementById('username-results-content');
        const resultsDiv = document.getElementById('username-results');
        
        if (!container || !resultsDiv) return;

        const foundCount = results.results.filter(r => r.found).length;
        
        container.innerHTML = `
            <div class="results-summary">
                <h4>Search Results for "${results.username}"</h4>
                <p>Found on ${foundCount} out of ${results.platforms.length} platforms</p>
                <p class="timestamp">Searched on ${new Date(results.timestamp).toLocaleString()}</p>
            </div>
            
            <div class="platform-results">
                ${results.results.map(result => this.renderPlatformResult(result)).join('')}
            </div>
        `;

        resultsDiv.style.display = 'block';
    }

    renderPlatformResult(result) {
        const statusClass = result.found ? 'found' : 'not-found';
        const statusIcon = result.found ? 'fa-check-circle' : 'fa-times-circle';
        const statusText = result.found ? 'Found' : 'Not Found';

        return `
            <div class="platform-result ${statusClass}">
                <div class="platform-header">
                    <i class="fas ${statusIcon}"></i>
                    <span class="platform-name">${result.platform}</span>
                    <span class="platform-status">${statusText}</span>
                </div>
                
                ${result.found ? `
                    <div class="platform-details">
                        <a href="${result.url}" target="_blank" class="profile-link">
                            <i class="fas fa-external-link-alt"></i>
                            View Profile
                        </a>
                        ${result.profile ? this.renderProfileDetails(result.profile) : ''}
                        ${result.lastSeen ? `
                            <div class="last-seen">
                                <i class="fas fa-clock"></i>
                                Last seen: ${new Date(result.lastSeen).toLocaleDateString()}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderProfileDetails(profile) {
        const details = [];
        
        if (profile.followers !== undefined) {
            details.push(`<span class="detail-item"><i class="fas fa-users"></i> ${profile.followers.toLocaleString()} followers</span>`);
        }
        if (profile.following !== undefined) {
            details.push(`<span class="detail-item"><i class="fas fa-user-plus"></i> ${profile.following.toLocaleString()} following</span>`);
        }
        if (profile.tweets !== undefined) {
            details.push(`<span class="detail-item"><i class="fas fa-comment"></i> ${profile.tweets.toLocaleString()} tweets</span>`);
        }
        if (profile.posts !== undefined) {
            details.push(`<span class="detail-item"><i class="fas fa-image"></i> ${profile.posts.toLocaleString()} posts</span>`);
        }
        if (profile.friends !== undefined) {
            details.push(`<span class="detail-item"><i class="fas fa-user-friends"></i> ${profile.friends.toLocaleString()} friends</span>`);
        }
        if (profile.connections !== undefined) {
            details.push(`<span class="detail-item"><i class="fas fa-network-wired"></i> ${profile.connections.toLocaleString()} connections</span>`);
        }
        if (profile.repositories !== undefined) {
            details.push(`<span class="detail-item"><i class="fas fa-code-branch"></i> ${profile.repositories} repositories</span>`);
        }
        if (profile.verified) {
            details.push(`<span class="detail-item verified"><i class="fas fa-check-circle"></i> Verified</span>`);
        }
        if (profile.private) {
            details.push(`<span class="detail-item private"><i class="fas fa-lock"></i> Private</span>`);
        }
        if (profile.company) {
            details.push(`<span class="detail-item"><i class="fas fa-building"></i> ${profile.company}</span>`);
        }

        return details.length > 0 ? `<div class="profile-details">${details.join('')}</div>` : '';
    }

    getSelectedPlatforms() {
        const checkboxes = document.querySelectorAll('#username-platforms input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    clearResults() {
        const input = document.getElementById('username-input');
        const results = document.getElementById('username-results');
        
        if (input) input.value = '';
        if (results) results.style.display = 'none';
    }

    async exportResults() {
        const results = document.getElementById('username-results-content');
        if (!results || results.children.length === 0) {
            this.showNotification('No results to export', 'warning');
            return;
        }

        // Simulate export functionality
        this.showNotification('Exporting results...', 'info');
        
        setTimeout(() => {
            this.showNotification('Results exported successfully', 'success');
        }, 2000);
    }

    async runAIAnalysis() {
        const results = document.getElementById('username-results-content');
        if (!results || results.children.length === 0) {
            this.showNotification('No results to analyze', 'warning');
            return;
        }

        this.showNotification('Running AI analysis...', 'info');
        
        try {
            // Simulate AI analysis
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            this.showNotification('AI analysis completed', 'success');
        } catch (error) {
            this.showNotification('AI analysis failed', 'error');
        }
    }

    showLoading() {
        const searchBtn = document.getElementById('username-search-btn');
        if (searchBtn) {
            searchBtn.disabled = true;
            searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
        }
    }

    hideLoading() {
        const searchBtn = document.getElementById('username-search-btn');
        if (searchBtn) {
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="fas fa-search"></i> Search Username';
        }
    }

    showNotification(message, type = 'info') {
        // Use the global notification system if available
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('username-section')) {
        new UsernameAnalysis();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UsernameAnalysis;
} 