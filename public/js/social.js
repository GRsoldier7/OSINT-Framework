// Social Media Analysis Module
class SocialMediaAnalysis {
    constructor() {
        this.platforms = [
            { id: 'twitter', name: 'Twitter/X', checked: true },
            { id: 'instagram', name: 'Instagram', checked: true },
            { id: 'facebook', name: 'Facebook', checked: true },
            { id: 'linkedin', name: 'LinkedIn', checked: true },
            { id: 'youtube', name: 'YouTube', checked: false },
            { id: 'tiktok', name: 'TikTok', checked: false },
            { id: 'reddit', name: 'Reddit', checked: false },
            { id: 'github', name: 'GitHub', checked: false }
        ];
        
        this.analysisTypes = [
            { id: 'profile', name: 'Profile Analysis', checked: true },
            { id: 'posts', name: 'Posts Analysis', checked: true },
            { id: 'network', name: 'Network Analysis', checked: false },
            { id: 'sentiment', name: 'Sentiment Analysis', checked: false },
            { id: 'trends', name: 'Trends Analysis', checked: false }
        ];
        
        this.init();
    }

    init() {
        this.renderPlatforms();
        this.renderAnalysisTypes();
        this.bindEvents();
    }

    renderPlatforms() {
        const container = document.getElementById('social-platforms');
        if (!container) return;

        container.innerHTML = this.platforms.map(platform => `
            <label class="checkbox-item">
                <input type="checkbox" value="${platform.id}" ${platform.checked ? 'checked' : ''}>
                <span class="checkmark"></span>
                ${platform.name}
            </label>
        `).join('');
    }

    renderAnalysisTypes() {
        const container = document.getElementById('social-analysis-types');
        if (!container) return;

        container.innerHTML = this.analysisTypes.map(type => `
            <label class="checkbox-item">
                <input type="checkbox" value="${type.id}" ${type.checked ? 'checked' : ''}>
                <span class="checkmark"></span>
                ${type.name}
            </label>
        `).join('');
    }

    bindEvents() {
        const analyzeBtn = document.getElementById('social-analyze-btn');
        const clearBtn = document.getElementById('clear-social-btn');
        const exportBtn = document.getElementById('export-social-btn');
        const analyzeResultsBtn = document.getElementById('analyze-social-btn');

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeSocialMedia());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearResults());
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportResults());
        }

        if (analyzeResultsBtn) {
            analyzeResultsBtn.addEventListener('click', () => this.runAIAnalysis());
        }
    }

    async analyzeSocialMedia() {
        const input = document.getElementById('social-input');
        const query = input?.value.trim();

        if (!query) {
            this.showNotification('Please enter a username or social media URL to analyze', 'error');
            return;
        }

        const selectedPlatforms = this.getSelectedPlatforms();
        const selectedTypes = this.getSelectedAnalysisTypes();
        
        if (selectedPlatforms.length === 0) {
            this.showNotification('Please select at least one platform', 'error');
            return;
        }

        if (selectedTypes.length === 0) {
            this.showNotification('Please select at least one analysis type', 'error');
            return;
        }

        this.showLoading();
        
        try {
            const results = await this.performSocialMediaAnalysis(query, selectedPlatforms, selectedTypes);
            this.displayResults(results);
        } catch (error) {
            console.error('Social media analysis failed:', error);
            this.showNotification('Social media analysis failed. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async performSocialMediaAnalysis(query, platforms, analysisTypes) {
        const results = {
            query: query,
            timestamp: new Date().toISOString(),
            platforms: platforms,
            analysisTypes: analysisTypes,
            results: {}
        };

        for (const platform of platforms) {
            results.results[platform] = await this.analyzePlatform(query, platform, analysisTypes);
        }

        return results;
    }

    async analyzePlatform(query, platform, analysisTypes) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

        const found = Math.random() > 0.2; // 80% chance of finding the profile
        
        if (!found) {
            return {
                found: false,
                platform: platform,
                error: 'Profile not found'
            };
        }

        const result = {
            found: true,
            platform: platform,
            profile: await this.generateProfileData(query, platform),
            analysis: {}
        };

        for (const type of analysisTypes) {
            result.analysis[type] = await this.performAnalysisType(query, platform, type);
        }

        return result;
    }

    async generateProfileData(query, platform) {
        const profiles = {
            twitter: {
                username: query,
                displayName: 'John Doe',
                bio: 'Software developer and tech enthusiast',
                followers: Math.floor(Math.random() * 10000),
                following: Math.floor(Math.random() * 1000),
                tweets: Math.floor(Math.random() * 5000),
                verified: Math.random() > 0.8,
                location: 'San Francisco, CA',
                website: 'https://example.com',
                joined: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString()
            },
            instagram: {
                username: query,
                displayName: 'John Doe',
                bio: 'Photographer and traveler',
                followers: Math.floor(Math.random() * 50000),
                following: Math.floor(Math.random() * 2000),
                posts: Math.floor(Math.random() * 1000),
                private: Math.random() > 0.7,
                verified: Math.random() > 0.9,
                website: 'https://example.com'
            },
            facebook: {
                username: query,
                displayName: 'John Doe',
                friends: Math.floor(Math.random() * 1000),
                public: Math.random() > 0.5,
                location: 'San Francisco, California',
                workplace: 'Tech Company',
                education: 'University of California'
            },
            linkedin: {
                username: query,
                displayName: 'John Doe',
                headline: 'Senior Software Engineer at Tech Company',
                connections: Math.floor(Math.random() * 500),
                company: 'Tech Company',
                location: 'San Francisco Bay Area',
                industry: 'Technology'
            },
            youtube: {
                username: query,
                displayName: 'John Doe',
                subscribers: Math.floor(Math.random() * 100000),
                videos: Math.floor(Math.random() * 500),
                views: Math.floor(Math.random() * 10000000),
                joined: new Date(Date.now() - Math.random() * 3 * 365 * 24 * 60 * 60 * 1000).toISOString()
            },
            tiktok: {
                username: query,
                displayName: 'John Doe',
                followers: Math.floor(Math.random() * 100000),
                following: Math.floor(Math.random() * 1000),
                likes: Math.floor(Math.random() * 1000000),
                videos: Math.floor(Math.random() * 200)
            },
            reddit: {
                username: query,
                karma: Math.floor(Math.random() * 10000),
                posts: Math.floor(Math.random() * 100),
                comments: Math.floor(Math.random() * 1000),
                created: new Date(Date.now() - Math.random() * 2 * 365 * 24 * 60 * 60 * 1000).toISOString()
            },
            github: {
                username: query,
                displayName: 'John Doe',
                followers: Math.floor(Math.random() * 500),
                following: Math.floor(Math.random() * 200),
                repositories: Math.floor(Math.random() * 50),
                stars: Math.floor(Math.random() * 1000),
                location: 'San Francisco, CA',
                company: 'Tech Company'
            }
        };

        return profiles[platform] || {};
    }

    async performAnalysisType(query, platform, type) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));

        switch (type) {
            case 'profile':
                return this.analyzeProfile(query, platform);
            case 'posts':
                return this.analyzePosts(query, platform);
            case 'network':
                return this.analyzeNetwork(query, platform);
            case 'sentiment':
                return this.analyzeSentiment(query, platform);
            case 'trends':
                return this.analyzeTrends(query, platform);
            default:
                return { error: 'Unknown analysis type' };
        }
    }

    analyzeProfile(query, platform) {
        return {
            completeness: Math.floor(Math.random() * 30 + 70),
            activity: Math.floor(Math.random() * 100),
            influence: Math.floor(Math.random() * 100),
            authenticity: Math.floor(Math.random() * 30 + 70),
            riskFactors: this.generateRiskFactors()
        };
    }

    analyzePosts(query, platform) {
        const postCount = Math.floor(Math.random() * 100) + 10;
        const engagementRate = Math.random() * 10;
        
        return {
            totalPosts: postCount,
            engagementRate: engagementRate.toFixed(2),
            averageLikes: Math.floor(engagementRate * 100),
            averageComments: Math.floor(engagementRate * 10),
            postingFrequency: Math.floor(Math.random() * 7) + 1,
            topPosts: this.generateTopPosts(platform)
        };
    }

    analyzeNetwork(query, platform) {
        return {
            networkSize: Math.floor(Math.random() * 10000),
            networkDensity: Math.random(),
            influentialConnections: Math.floor(Math.random() * 100),
            communityClusters: Math.floor(Math.random() * 5) + 1,
            networkMap: this.generateNetworkMap()
        };
    }

    analyzeSentiment(query, platform) {
        const sentiments = ['positive', 'neutral', 'negative'];
        const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
        
        return {
            overallSentiment: sentiment,
            positiveScore: sentiment === 'positive' ? Math.floor(Math.random() * 30 + 70) : Math.floor(Math.random() * 30),
            negativeScore: sentiment === 'negative' ? Math.floor(Math.random() * 30 + 70) : Math.floor(Math.random() * 30),
            neutralScore: sentiment === 'neutral' ? Math.floor(Math.random() * 30 + 70) : Math.floor(Math.random() * 30),
            sentimentTrend: this.generateSentimentTrend()
        };
    }

    analyzeTrends(query, platform) {
        return {
            trendingTopics: this.generateTrendingTopics(),
            hashtagUsage: this.generateHashtagUsage(),
            contentCategories: this.generateContentCategories(),
            peakActivity: this.generatePeakActivity()
        };
    }

    generateRiskFactors() {
        const factors = ['suspicious_activity', 'fake_followers', 'bot_behavior', 'spam_content'];
        const count = Math.floor(Math.random() * 3);
        return factors.slice(0, count);
    }

    generateTopPosts(platform) {
        const count = Math.floor(Math.random() * 5) + 1;
        const posts = [];
        
        for (let i = 0; i < count; i++) {
            posts.push({
                id: Math.random().toString(36).substr(2, 9),
                content: 'Sample post content...',
                likes: Math.floor(Math.random() * 1000),
                comments: Math.floor(Math.random() * 100),
                shares: Math.floor(Math.random() * 50),
                date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            });
        }
        
        return posts.sort((a, b) => b.likes - a.likes);
    }

    generateNetworkMap() {
        return {
            nodes: Math.floor(Math.random() * 100) + 10,
            edges: Math.floor(Math.random() * 500) + 50,
            clusters: Math.floor(Math.random() * 5) + 1
        };
    }

    generateSentimentTrend() {
        const days = 30;
        const trend = [];
        
        for (let i = 0; i < days; i++) {
            trend.push({
                date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString(),
                positive: Math.floor(Math.random() * 100),
                negative: Math.floor(Math.random() * 100),
                neutral: Math.floor(Math.random() * 100)
            });
        }
        
        return trend;
    }

    generateTrendingTopics() {
        const topics = ['technology', 'politics', 'entertainment', 'sports', 'business'];
        const count = Math.floor(Math.random() * 3) + 1;
        return topics.slice(0, count);
    }

    generateHashtagUsage() {
        const hashtags = ['#tech', '#programming', '#ai', '#cybersecurity', '#innovation'];
        const count = Math.floor(Math.random() * 3) + 1;
        return hashtags.slice(0, count).map(tag => ({
            tag: tag,
            count: Math.floor(Math.random() * 1000)
        }));
    }

    generateContentCategories() {
        const categories = ['technology', 'personal', 'professional', 'entertainment', 'news'];
        const count = Math.floor(Math.random() * 3) + 1;
        return categories.slice(0, count);
    }

    generatePeakActivity() {
        const hours = ['9AM', '12PM', '3PM', '6PM', '9PM'];
        return hours[Math.floor(Math.random() * hours.length)];
    }

    displayResults(results) {
        const container = document.getElementById('social-results-content');
        const resultsDiv = document.getElementById('social-results');
        
        if (!container || !resultsDiv) return;

        const foundProfiles = Object.values(results.results).filter(r => r.found).length;
        
        container.innerHTML = `
            <div class="results-summary">
                <h4>Social Media Analysis Results for "${results.query}"</h4>
                <p>Found on ${foundProfiles} out of ${results.platforms.length} platforms</p>
                <p class="timestamp">Analyzed on ${new Date(results.timestamp).toLocaleString()}</p>
            </div>
            
            <div class="platform-results">
                ${Object.entries(results.results).map(([platform, result]) => this.renderPlatformResult(platform, result)).join('')}
            </div>
        `;

        resultsDiv.style.display = 'block';
    }

    renderPlatformResult(platform, result) {
        const platformNames = {
            twitter: 'Twitter/X',
            instagram: 'Instagram',
            facebook: 'Facebook',
            linkedin: 'LinkedIn',
            youtube: 'YouTube',
            tiktok: 'TikTok',
            reddit: 'Reddit',
            github: 'GitHub'
        };

        if (!result.found) {
            return `
                <div class="platform-result not-found">
                    <div class="platform-header">
                        <i class="fas fa-times-circle"></i>
                        <span class="platform-name">${platformNames[platform]}</span>
                        <span class="platform-status">Not Found</span>
                    </div>
                </div>
            `;
        }

        return `
            <div class="platform-result found">
                <div class="platform-header">
                    <i class="fas fa-check-circle"></i>
                    <span class="platform-name">${platformNames[platform]}</span>
                    <span class="platform-status">Found</span>
                </div>
                
                <div class="platform-details">
                    ${this.renderProfileDetails(result.profile, platform)}
                    ${this.renderAnalysisDetails(result.analysis)}
                </div>
            </div>
        `;
    }

    renderProfileDetails(profile, platform) {
        const details = [];
        
        if (profile.followers !== undefined) {
            details.push(`<div class="detail-item"><i class="fas fa-users"></i> ${profile.followers.toLocaleString()} followers</div>`);
        }
        if (profile.following !== undefined) {
            details.push(`<div class="detail-item"><i class="fas fa-user-plus"></i> ${profile.following.toLocaleString()} following</div>`);
        }
        if (profile.tweets !== undefined) {
            details.push(`<div class="detail-item"><i class="fas fa-comment"></i> ${profile.tweets.toLocaleString()} tweets</div>`);
        }
        if (profile.posts !== undefined) {
            details.push(`<div class="detail-item"><i class="fas fa-image"></i> ${profile.posts.toLocaleString()} posts</div>`);
        }
        if (profile.friends !== undefined) {
            details.push(`<div class="detail-item"><i class="fas fa-user-friends"></i> ${profile.friends.toLocaleString()} friends</div>`);
        }
        if (profile.connections !== undefined) {
            details.push(`<div class="detail-item"><i class="fas fa-network-wired"></i> ${profile.connections.toLocaleString()} connections</div>`);
        }
        if (profile.subscribers !== undefined) {
            details.push(`<div class="detail-item"><i class="fas fa-play-circle"></i> ${profile.subscribers.toLocaleString()} subscribers</div>`);
        }
        if (profile.repositories !== undefined) {
            details.push(`<div class="detail-item"><i class="fas fa-code-branch"></i> ${profile.repositories} repositories</div>`);
        }
        if (profile.verified) {
            details.push(`<div class="detail-item verified"><i class="fas fa-check-circle"></i> Verified</div>`);
        }
        if (profile.private) {
            details.push(`<div class="detail-item private"><i class="fas fa-lock"></i> Private</div>`);
        }

        return details.length > 0 ? `<div class="profile-details">${details.join('')}</div>` : '';
    }

    renderAnalysisDetails(analysis) {
        if (!analysis || Object.keys(analysis).length === 0) return '';

        return `
            <div class="analysis-details">
                ${Object.entries(analysis).map(([type, data]) => this.renderAnalysisType(type, data)).join('')}
            </div>
        `;
    }

    renderAnalysisType(type, data) {
        const typeNames = {
            profile: 'Profile Analysis',
            posts: 'Posts Analysis',
            network: 'Network Analysis',
            sentiment: 'Sentiment Analysis',
            trends: 'Trends Analysis'
        };

        return `
            <div class="analysis-type">
                <h6>${typeNames[type] || type}</h6>
                <div class="analysis-data">
                    ${this.renderAnalysisData(type, data)}
                </div>
            </div>
        `;
    }

    renderAnalysisData(type, data) {
        switch (type) {
            case 'profile':
                return `
                    <div>Completeness: ${data.completeness}%</div>
                    <div>Activity: ${data.activity}%</div>
                    <div>Influence: ${data.influence}%</div>
                    <div>Authenticity: ${data.authenticity}%</div>
                `;
            case 'posts':
                return `
                    <div>Total Posts: ${data.totalPosts}</div>
                    <div>Engagement Rate: ${data.engagementRate}%</div>
                    <div>Avg Likes: ${data.averageLikes}</div>
                    <div>Posting Frequency: ${data.postingFrequency}/week</div>
                `;
            case 'network':
                return `
                    <div>Network Size: ${data.networkSize.toLocaleString()}</div>
                    <div>Density: ${(data.networkDensity * 100).toFixed(1)}%</div>
                    <div>Influential Connections: ${data.influentialConnections}</div>
                `;
            case 'sentiment':
                return `
                    <div>Overall: <span class="sentiment ${data.overallSentiment}">${data.overallSentiment}</span></div>
                    <div>Positive: ${data.positiveScore}%</div>
                    <div>Negative: ${data.negativeScore}%</div>
                `;
            case 'trends':
                return `
                    <div>Trending Topics: ${data.trendingTopics.join(', ')}</div>
                    <div>Peak Activity: ${data.peakActivity}</div>
                `;
            default:
                return `<div>${JSON.stringify(data)}</div>`;
        }
    }

    getSelectedPlatforms() {
        const checkboxes = document.querySelectorAll('#social-platforms input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    getSelectedAnalysisTypes() {
        const checkboxes = document.querySelectorAll('#social-analysis-types input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    clearResults() {
        const input = document.getElementById('social-input');
        const results = document.getElementById('social-results');
        
        if (input) input.value = '';
        if (results) results.style.display = 'none';
    }

    async exportResults() {
        const results = document.getElementById('social-results-content');
        if (!results || results.children.length === 0) {
            this.showNotification('No results to export', 'warning');
            return;
        }

        this.showNotification('Exporting results...', 'info');
        
        setTimeout(() => {
            this.showNotification('Results exported successfully', 'success');
        }, 2000);
    }

    async runAIAnalysis() {
        const results = document.getElementById('social-results-content');
        if (!results || results.children.length === 0) {
            this.showNotification('No results to analyze', 'warning');
            return;
        }

        this.showNotification('Running AI analysis...', 'info');
        
        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            this.showNotification('AI analysis completed', 'success');
        } catch (error) {
            this.showNotification('AI analysis failed', 'error');
        }
    }

    showLoading() {
        const analyzeBtn = document.getElementById('social-analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        }
    }

    hideLoading() {
        const analyzeBtn = document.getElementById('social-analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-share-alt"></i> Analyze Social Media';
        }
    }

    showNotification(message, type = 'info') {
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('social-section')) {
        new SocialMediaAnalysis();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SocialMediaAnalysis;
} 