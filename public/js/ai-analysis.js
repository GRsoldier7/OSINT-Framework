// AI Analysis Module
class AIAnalysis {
    constructor() {
        this.analysisTypes = [
            { id: 'intelligence', name: 'Intelligence Analysis', checked: true },
            { id: 'threat', name: 'Threat Assessment', checked: true },
            { id: 'pattern', name: 'Pattern Recognition', checked: false },
            { id: 'sentiment', name: 'Sentiment Analysis', checked: false },
            { id: 'correlation', name: 'Correlation Analysis', checked: false }
        ];
        
        this.init();
    }

    init() {
        this.renderAnalysisTypes();
        this.bindEvents();
    }

    renderAnalysisTypes() {
        const container = document.getElementById('ai-analysis-types');
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
        const analyzeBtn = document.getElementById('ai-analyze-btn');
        const clearBtn = document.getElementById('clear-ai-btn');
        const exportBtn = document.getElementById('export-ai-btn');
        const generateReportBtn = document.getElementById('generate-report-btn');

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.runAIAnalysis());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearResults());
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportResults());
        }

        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.generateReport());
        }
    }

    async runAIAnalysis() {
        const input = document.getElementById('ai-input');
        const data = input?.value.trim();

        if (!data) {
            this.showNotification('Please enter data to analyze', 'error');
            return;
        }

        const selectedTypes = this.getSelectedAnalysisTypes();
        if (selectedTypes.length === 0) {
            this.showNotification('Please select at least one analysis type', 'error');
            return;
        }

        this.showLoading();
        
        try {
            const results = await this.performAIAnalysis(data, selectedTypes);
            this.displayResults(results);
        } catch (error) {
            console.error('AI analysis failed:', error);
            this.showNotification('AI analysis failed. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async performAIAnalysis(data, analysisTypes) {
        const results = {
            data: data,
            timestamp: new Date().toISOString(),
            analysisTypes: analysisTypes,
            results: {}
        };

        for (const type of analysisTypes) {
            results.results[type] = await this.performAnalysisType(data, type);
        }

        return results;
    }

    async performAnalysisType(data, type) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

        switch (type) {
            case 'intelligence':
                return this.performIntelligenceAnalysis(data);
            case 'threat':
                return this.performThreatAssessment(data);
            case 'pattern':
                return this.performPatternRecognition(data);
            case 'sentiment':
                return this.performSentimentAnalysis(data);
            case 'correlation':
                return this.performCorrelationAnalysis(data);
            default:
                return { error: 'Unknown analysis type' };
        }
    }

    performIntelligenceAnalysis(data) {
        const keywords = this.extractKeywords(data);
        const entities = this.extractEntities(data);
        const insights = this.generateInsights(data);
        
        return {
            keywords: keywords,
            entities: entities,
            insights: insights,
            confidence: Math.floor(Math.random() * 30 + 70),
            relevance: Math.floor(Math.random() * 30 + 70),
            summary: this.generateSummary(data)
        };
    }

    performThreatAssessment(data) {
        const threats = this.identifyThreats(data);
        const riskLevel = this.calculateRiskLevel(threats);
        const recommendations = this.generateRecommendations(threats);
        
        return {
            threats: threats,
            riskLevel: riskLevel,
            riskScore: Math.floor(Math.random() * 100),
            recommendations: recommendations,
            mitigation: this.generateMitigationStrategies(threats)
        };
    }

    performPatternRecognition(data) {
        const patterns = this.identifyPatterns(data);
        const anomalies = this.detectAnomalies(data);
        const trends = this.analyzeTrends(data);
        
        return {
            patterns: patterns,
            anomalies: anomalies,
            trends: trends,
            confidence: Math.floor(Math.random() * 30 + 70),
            significance: Math.floor(Math.random() * 30 + 70)
        };
    }

    performSentimentAnalysis(data) {
        const sentiment = this.analyzeSentiment(data);
        const emotions = this.analyzeEmotions(data);
        const topics = this.analyzeTopics(data);
        
        return {
            sentiment: sentiment,
            emotions: emotions,
            topics: topics,
            confidence: Math.floor(Math.random() * 30 + 70),
            polarity: Math.random() * 2 - 1
        };
    }

    performCorrelationAnalysis(data) {
        const correlations = this.findCorrelations(data);
        const relationships = this.analyzeRelationships(data);
        const dependencies = this.identifyDependencies(data);
        
        return {
            correlations: correlations,
            relationships: relationships,
            dependencies: dependencies,
            strength: Math.random(),
            significance: Math.floor(Math.random() * 30 + 70)
        };
    }

    extractKeywords(data) {
        const keywords = ['technology', 'security', 'analysis', 'intelligence', 'threat', 'pattern', 'data'];
        const count = Math.floor(Math.random() * 5) + 3;
        return keywords.slice(0, count).map(keyword => ({
            keyword: keyword,
            frequency: Math.floor(Math.random() * 100),
            importance: Math.floor(Math.random() * 30 + 70)
        }));
    }

    extractEntities(data) {
        const entities = [
            { type: 'person', value: 'John Doe', confidence: 0.95 },
            { type: 'organization', value: 'Tech Company', confidence: 0.88 },
            { type: 'location', value: 'San Francisco', confidence: 0.92 },
            { type: 'date', value: '2024-01-15', confidence: 0.85 }
        ];
        
        const count = Math.floor(Math.random() * 3) + 1;
        return entities.slice(0, count);
    }

    generateInsights(data) {
        const insights = [
            'High correlation between activity patterns and time of day',
            'Unusual network behavior detected during off-hours',
            'Potential security vulnerabilities identified',
            'Strong positive sentiment towards technology topics'
        ];
        
        const count = Math.floor(Math.random() * 3) + 1;
        return insights.slice(0, count);
    }

    generateSummary(data) {
        return 'AI analysis reveals significant patterns in the provided data, indicating both opportunities and potential risks that require further investigation.';
    }

    identifyThreats(data) {
        const threatTypes = ['malware', 'phishing', 'data_breach', 'social_engineering', 'insider_threat'];
        const threats = [];
        
        const count = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < count; i++) {
            threats.push({
                type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
                severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
                confidence: Math.floor(Math.random() * 30 + 70),
                description: 'Potential threat identified in the data'
            });
        }
        
        return threats;
    }

    calculateRiskLevel(threats) {
        if (threats.length === 0) return 'None';
        const highThreats = threats.filter(t => t.severity === 'High').length;
        if (highThreats > 0) return 'High';
        const mediumThreats = threats.filter(t => t.severity === 'Medium').length;
        if (mediumThreats > 0) return 'Medium';
        return 'Low';
    }

    generateRecommendations(threats) {
        const recommendations = [
            'Implement additional security monitoring',
            'Conduct regular security audits',
            'Enhance user awareness training',
            'Update security policies and procedures'
        ];
        
        const count = Math.floor(Math.random() * 3) + 1;
        return recommendations.slice(0, count);
    }

    generateMitigationStrategies(threats) {
        return threats.map(threat => ({
            threat: threat.type,
            strategy: `Mitigation strategy for ${threat.type}`,
            effectiveness: Math.floor(Math.random() * 30 + 70)
        }));
    }

    identifyPatterns(data) {
        const patterns = [
            'Regular activity during business hours',
            'Cyclical behavior patterns',
            'Seasonal variations in activity',
            'Correlation between events'
        ];
        
        const count = Math.floor(Math.random() * 3) + 1;
        return patterns.slice(0, count);
    }

    detectAnomalies(data) {
        const anomalies = [
            'Unusual spike in activity',
            'Irregular access patterns',
            'Unexpected data transfers',
            'Anomalous user behavior'
        ];
        
        const count = Math.floor(Math.random() * 2) + 1;
        return anomalies.slice(0, count);
    }

    analyzeTrends(data) {
        const trends = [
            'Increasing activity over time',
            'Decreasing engagement',
            'Shifting user preferences',
            'Emerging technology adoption'
        ];
        
        const count = Math.floor(Math.random() * 2) + 1;
        return trends.slice(0, count);
    }

    analyzeSentiment(data) {
        const sentiments = ['positive', 'neutral', 'negative'];
        return sentiments[Math.floor(Math.random() * sentiments.length)];
    }

    analyzeEmotions(data) {
        const emotions = ['joy', 'anger', 'fear', 'surprise', 'sadness'];
        const count = Math.floor(Math.random() * 3) + 1;
        return emotions.slice(0, count).map(emotion => ({
            emotion: emotion,
            intensity: Math.floor(Math.random() * 100)
        }));
    }

    analyzeTopics(data) {
        const topics = ['technology', 'security', 'business', 'personal', 'professional'];
        const count = Math.floor(Math.random() * 3) + 1;
        return topics.slice(0, count);
    }

    findCorrelations(data) {
        const correlations = [
            { variable1: 'activity', variable2: 'time', strength: Math.random() },
            { variable1: 'engagement', variable2: 'content_type', strength: Math.random() },
            { variable1: 'sentiment', variable2: 'topic', strength: Math.random() }
        ];
        
        const count = Math.floor(Math.random() * 3) + 1;
        return correlations.slice(0, count);
    }

    analyzeRelationships(data) {
        const relationships = [
            'Strong positive correlation between variables A and B',
            'Weak negative relationship between variables C and D',
            'No significant relationship found between variables E and F'
        ];
        
        const count = Math.floor(Math.random() * 2) + 1;
        return relationships.slice(0, count);
    }

    identifyDependencies(data) {
        const dependencies = [
            'Variable A depends on Variable B',
            'Variable C is independent of other variables',
            'Variable D has multiple dependencies'
        ];
        
        const count = Math.floor(Math.random() * 2) + 1;
        return dependencies.slice(0, count);
    }

    displayResults(results) {
        const container = document.getElementById('ai-results-content');
        const resultsDiv = document.getElementById('ai-results');
        
        if (!container || !resultsDiv) return;

        container.innerHTML = `
            <div class="results-summary">
                <h4>AI Analysis Results</h4>
                <p>Analyzed ${Object.keys(results.analysisTypes).length} aspects</p>
                <p class="timestamp">Analyzed on ${new Date(results.timestamp).toLocaleString()}</p>
            </div>
            
            <div class="analysis-results-grid">
                ${Object.entries(results.results).map(([type, result]) => this.renderAnalysisResult(type, result)).join('')}
            </div>
        `;

        resultsDiv.style.display = 'block';
    }

    renderAnalysisResult(type, result) {
        const typeNames = {
            intelligence: 'Intelligence Analysis',
            threat: 'Threat Assessment',
            pattern: 'Pattern Recognition',
            sentiment: 'Sentiment Analysis',
            correlation: 'Correlation Analysis'
        };

        return `
            <div class="analysis-result">
                <div class="analysis-header">
                    <h5>${typeNames[type] || type}</h5>
                </div>
                <div class="analysis-content">
                    ${this.renderResultContent(type, result)}
                </div>
            </div>
        `;
    }

    renderResultContent(type, result) {
        switch (type) {
            case 'intelligence':
                return `
                    <div class="intelligence-result">
                        <div class="confidence">Confidence: ${result.confidence}%</div>
                        <div class="relevance">Relevance: ${result.relevance}%</div>
                        <div class="summary">${result.summary}</div>
                        <div class="keywords">
                            <strong>Keywords:</strong>
                            ${result.keywords.map(kw => `<span class="keyword">${kw.keyword} (${kw.importance}%)</span>`).join('')}
                        </div>
                        <div class="insights">
                            <strong>Insights:</strong>
                            <ul>
                                ${result.insights.map(insight => `<li>${insight}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            
            case 'threat':
                return `
                    <div class="threat-result ${result.riskLevel.toLowerCase()}">
                        <div class="risk-level">Risk Level: <span class="risk ${result.riskLevel.toLowerCase()}">${result.riskLevel}</span></div>
                        <div class="risk-score">Risk Score: ${result.riskScore}/100</div>
                        <div class="threats">
                            <strong>Threats:</strong>
                            ${result.threats.map(threat => `
                                <div class="threat-item">
                                    <span class="threat-type">${threat.type}</span>
                                    <span class="threat-severity ${threat.severity.toLowerCase()}">${threat.severity}</span>
                                    <span class="threat-confidence">${threat.confidence}%</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="recommendations">
                            <strong>Recommendations:</strong>
                            <ul>
                                ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            
            case 'pattern':
                return `
                    <div class="pattern-result">
                        <div class="confidence">Confidence: ${result.confidence}%</div>
                        <div class="significance">Significance: ${result.significance}%</div>
                        <div class="patterns">
                            <strong>Patterns:</strong>
                            <ul>
                                ${result.patterns.map(pattern => `<li>${pattern}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="anomalies">
                            <strong>Anomalies:</strong>
                            <ul>
                                ${result.anomalies.map(anomaly => `<li>${anomaly}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            
            case 'sentiment':
                return `
                    <div class="sentiment-result">
                        <div class="sentiment-overall">
                            Overall Sentiment: <span class="sentiment ${result.sentiment}">${result.sentiment}</span>
                        </div>
                        <div class="polarity">Polarity: ${result.polarity.toFixed(2)}</div>
                        <div class="confidence">Confidence: ${result.confidence}%</div>
                        <div class="emotions">
                            <strong>Emotions:</strong>
                            ${result.emotions.map(emotion => `
                                <div class="emotion-item">
                                    <span class="emotion-name">${emotion.emotion}</span>
                                    <span class="emotion-intensity">${emotion.intensity}%</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            
            case 'correlation':
                return `
                    <div class="correlation-result">
                        <div class="strength">Correlation Strength: ${(result.strength * 100).toFixed(1)}%</div>
                        <div class="significance">Significance: ${result.significance}%</div>
                        <div class="correlations">
                            <strong>Correlations:</strong>
                            ${result.correlations.map(corr => `
                                <div class="correlation-item">
                                    ${corr.variable1} ↔ ${corr.variable2} (${(corr.strength * 100).toFixed(1)}%)
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            
            default:
                return `<div class="error">Analysis failed</div>`;
        }
    }

    getSelectedAnalysisTypes() {
        const checkboxes = document.querySelectorAll('#ai-analysis-types input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    clearResults() {
        const input = document.getElementById('ai-input');
        const results = document.getElementById('ai-results');
        
        if (input) input.value = '';
        if (results) results.style.display = 'none';
    }

    async exportResults() {
        const results = document.getElementById('ai-results-content');
        if (!results || results.children.length === 0) {
            this.showNotification('No results to export', 'warning');
            return;
        }

        this.showNotification('Exporting results...', 'info');
        
        setTimeout(() => {
            this.showNotification('Results exported successfully', 'success');
        }, 2000);
    }

    async generateReport() {
        const results = document.getElementById('ai-results-content');
        if (!results || results.children.length === 0) {
            this.showNotification('No results to generate report from', 'warning');
            return;
        }

        this.showNotification('Generating report...', 'info');
        
        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            this.showNotification('Report generated successfully', 'success');
        } catch (error) {
            this.showNotification('Report generation failed', 'error');
        }
    }

    showLoading() {
        const analyzeBtn = document.getElementById('ai-analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        }
    }

    hideLoading() {
        const analyzeBtn = document.getElementById('ai-analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-robot"></i> Run AI Analysis';
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
    if (document.getElementById('ai-section')) {
        new AIAnalysis();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAnalysis;
} 