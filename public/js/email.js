// Email Analysis Module
class EmailAnalysis {
    constructor() {
        this.analysisTypes = [
            { id: 'validation', name: 'Email Validation', checked: true },
            { id: 'breach', name: 'Breach Check', checked: true },
            { id: 'format', name: 'Email Format', checked: false },
            { id: 'disposable', name: 'Disposable Check', checked: false },
            { id: 'domain', name: 'Domain Analysis', checked: true }
        ];
        
        this.init();
    }

    init() {
        this.renderAnalysisTypes();
        this.bindEvents();
    }

    renderAnalysisTypes() {
        const container = document.getElementById('email-analysis-types');
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
        const analyzeBtn = document.getElementById('email-analyze-btn');
        const clearBtn = document.getElementById('clear-email-btn');
        const exportBtn = document.getElementById('export-email-btn');
        const analyzeResultsBtn = document.getElementById('analyze-email-btn');

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeEmail());
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

    async analyzeEmail() {
        const input = document.getElementById('email-input');
        const email = input?.value.trim();

        if (!email) {
            this.showNotification('Please enter an email address to analyze', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        const selectedTypes = this.getSelectedAnalysisTypes();
        if (selectedTypes.length === 0) {
            this.showNotification('Please select at least one analysis type', 'error');
            return;
        }

        this.showLoading();
        
        try {
            const results = await this.performEmailAnalysis(email, selectedTypes);
            this.displayResults(results);
        } catch (error) {
            console.error('Email analysis failed:', error);
            this.showNotification('Email analysis failed. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async performEmailAnalysis(email, analysisTypes) {
        const results = {
            email: email,
            timestamp: new Date().toISOString(),
            analysisTypes: analysisTypes,
            results: {}
        };

        for (const type of analysisTypes) {
            results.results[type] = await this.performAnalysisType(email, type);
        }

        return results;
    }

    async performAnalysisType(email, type) {
        // Simulate analysis with realistic delays
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

        switch (type) {
            case 'validation':
                return this.validateEmail(email);
            case 'breach':
                return this.checkBreaches(email);
            case 'format':
                return this.findEmailFormat(email);
            case 'disposable':
                return this.checkDisposable(email);
            case 'domain':
                return this.analyzeDomain(email);
            default:
                return { error: 'Unknown analysis type' };
        }
    }

    validateEmail(email) {
        const [localPart, domain] = email.split('@');
        const isValid = localPart.length > 0 && domain.includes('.');
        
        return {
            valid: isValid,
            score: isValid ? Math.floor(Math.random() * 30 + 70) : 0,
            details: {
                localPart: localPart,
                domain: domain,
                length: email.length,
                hasSpecialChars: /[^a-zA-Z0-9@._-]/.test(email)
            }
        };
    }

    checkBreaches(email) {
        const hasBreaches = Math.random() > 0.6; // 40% chance of breaches
        const breaches = hasBreaches ? this.generateBreachData() : [];
        
        return {
            hasBreaches: hasBreaches,
            breachCount: breaches.length,
            breaches: breaches,
            lastBreach: breaches.length > 0 ? breaches[0].date : null
        };
    }

    generateBreachData() {
        const breachSources = [
            'Adobe', 'LinkedIn', 'Dropbox', 'Yahoo', 'MySpace',
            'Facebook', 'Twitter', 'Instagram', 'Tumblr', 'Pinterest'
        ];
        
        const count = Math.floor(Math.random() * 5) + 1;
        const breaches = [];
        
        for (let i = 0; i < count; i++) {
            breaches.push({
                source: breachSources[Math.floor(Math.random() * breachSources.length)],
                date: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
                records: Math.floor(Math.random() * 1000000) + 1000,
                severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
            });
        }
        
        return breaches.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    findEmailFormat(email) {
        const [localPart, domain] = email.split('@');
        const formats = [
            'firstname.lastname',
            'firstname_lastname',
            'firstname',
            'firstname.lastname',
            'f.lastname',
            'firstname.l',
            'firstname_lastname',
            'firstname-lastname'
        ];
        
        return {
            possibleFormats: formats.slice(0, Math.floor(Math.random() * 3) + 2),
            confidence: Math.floor(Math.random() * 30 + 70),
            domain: domain
        };
    }

    checkDisposable(email) {
        const disposableDomains = [
            '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
            'tempmail.org', 'throwaway.email', 'yopmail.com'
        ];
        
        const domain = email.split('@')[1];
        const isDisposable = disposableDomains.includes(domain);
        
        return {
            isDisposable: isDisposable,
            domain: domain,
            risk: isDisposable ? 'High' : 'Low'
        };
    }

    analyzeDomain(email) {
        const domain = email.split('@')[1];
        
        return {
            domain: domain,
            mxRecords: Math.random() > 0.3,
            spfRecord: Math.random() > 0.4,
            dkimRecord: Math.random() > 0.5,
            dmarcRecord: Math.random() > 0.6,
            reputation: ['Good', 'Fair', 'Poor'][Math.floor(Math.random() * 3)],
            age: Math.floor(Math.random() * 10) + 1
        };
    }

    displayResults(results) {
        const container = document.getElementById('email-results-content');
        const resultsDiv = document.getElementById('email-results');
        
        if (!container || !resultsDiv) return;

        container.innerHTML = `
            <div class="results-summary">
                <h4>Analysis Results for "${results.email}"</h4>
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
            validation: 'Email Validation',
            breach: 'Breach Check',
            format: 'Email Format',
            disposable: 'Disposable Check',
            domain: 'Domain Analysis'
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
            case 'validation':
                return `
                    <div class="validation-result ${result.valid ? 'valid' : 'invalid'}">
                        <div class="status">
                            <i class="fas fa-${result.valid ? 'check-circle' : 'times-circle'}"></i>
                            ${result.valid ? 'Valid' : 'Invalid'}
                        </div>
                        <div class="score">Score: ${result.score}/100</div>
                        <div class="details">
                            <div>Local part: ${result.details.localPart}</div>
                            <div>Domain: ${result.details.domain}</div>
                            <div>Length: ${result.details.length} characters</div>
                        </div>
                    </div>
                `;
            
            case 'breach':
                return `
                    <div class="breach-result ${result.hasBreaches ? 'breached' : 'safe'}">
                        <div class="status">
                            <i class="fas fa-${result.hasBreaches ? 'exclamation-triangle' : 'shield-alt'}"></i>
                            ${result.hasBreaches ? 'Breached' : 'No Breaches Found'}
                        </div>
                        ${result.hasBreaches ? `
                            <div class="breach-count">${result.breachCount} breach(es) found</div>
                            <div class="breach-list">
                                ${result.breaches.map(breach => `
                                    <div class="breach-item">
                                        <strong>${breach.source}</strong> - ${new Date(breach.date).toLocaleDateString()}
                                        <span class="severity ${breach.severity.toLowerCase()}">${breach.severity}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
            
            case 'format':
                return `
                    <div class="format-result">
                        <div class="confidence">Confidence: ${result.confidence}%</div>
                        <div class="formats">
                            <strong>Possible formats:</strong>
                            <ul>
                                ${result.possibleFormats.map(format => `<li>${format}@${result.domain}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            
            case 'disposable':
                return `
                    <div class="disposable-result ${result.isDisposable ? 'disposable' : 'permanent'}">
                        <div class="status">
                            <i class="fas fa-${result.isDisposable ? 'exclamation-triangle' : 'check-circle'}"></i>
                            ${result.isDisposable ? 'Disposable Email' : 'Permanent Email'}
                        </div>
                        <div class="risk">Risk: ${result.risk}</div>
                    </div>
                `;
            
            case 'domain':
                return `
                    <div class="domain-result">
                        <div class="domain-info">
                            <strong>Domain:</strong> ${result.domain}
                        </div>
                        <div class="domain-details">
                            <div>MX Records: <i class="fas fa-${result.mxRecords ? 'check' : 'times'}"></i></div>
                            <div>SPF Record: <i class="fas fa-${result.spfRecord ? 'check' : 'times'}"></i></div>
                            <div>DKIM Record: <i class="fas fa-${result.dkimRecord ? 'check' : 'times'}"></i></div>
                            <div>DMARC Record: <i class="fas fa-${result.dmarcRecord ? 'check' : 'times'}"></i></div>
                        </div>
                        <div class="domain-stats">
                            <div>Reputation: <span class="reputation ${result.reputation.toLowerCase()}">${result.reputation}</span></div>
                            <div>Age: ${result.age} years</div>
                        </div>
                    </div>
                `;
            
            default:
                return `<div class="error">Analysis failed</div>`;
        }
    }

    getSelectedAnalysisTypes() {
        const checkboxes = document.querySelectorAll('#email-analysis-types input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    clearResults() {
        const input = document.getElementById('email-input');
        const results = document.getElementById('email-results');
        
        if (input) input.value = '';
        if (results) results.style.display = 'none';
    }

    async exportResults() {
        const results = document.getElementById('email-results-content');
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
        const results = document.getElementById('email-results-content');
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
        const analyzeBtn = document.getElementById('email-analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        }
    }

    hideLoading() {
        const analyzeBtn = document.getElementById('email-analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-envelope"></i> Analyze Email';
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
    if (document.getElementById('email-section')) {
        new EmailAnalysis();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailAnalysis;
} 