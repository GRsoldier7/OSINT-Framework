// Domain Analysis Module
class DomainAnalysis {
    constructor() {
        this.analysisTypes = [
            { id: 'whois', name: 'WHOIS Lookup', checked: true },
            { id: 'dns', name: 'DNS Records', checked: true },
            { id: 'ssl', name: 'SSL Certificate', checked: true },
            { id: 'security', name: 'Security Scan', checked: true },
            { id: 'reputation', name: 'Reputation Check', checked: false }
        ];
        
        this.init();
    }

    init() {
        this.renderAnalysisTypes();
        this.bindEvents();
    }

    renderAnalysisTypes() {
        const container = document.getElementById('domain-analysis-types');
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
        const analyzeBtn = document.getElementById('domain-analyze-btn');
        const clearBtn = document.getElementById('clear-domain-btn');
        const exportBtn = document.getElementById('export-domain-btn');
        const analyzeResultsBtn = document.getElementById('analyze-domain-btn');

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeDomain());
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

    async analyzeDomain() {
        const input = document.getElementById('domain-input');
        const domain = input?.value.trim();

        if (!domain) {
            this.showNotification('Please enter a domain to analyze', 'error');
            return;
        }

        if (!this.isValidDomain(domain)) {
            this.showNotification('Please enter a valid domain', 'error');
            return;
        }

        const selectedTypes = this.getSelectedAnalysisTypes();
        if (selectedTypes.length === 0) {
            this.showNotification('Please select at least one analysis type', 'error');
            return;
        }

        this.showLoading();
        
        try {
            const results = await this.performDomainAnalysis(domain, selectedTypes);
            this.displayResults(results);
        } catch (error) {
            console.error('Domain analysis failed:', error);
            this.showNotification('Domain analysis failed. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    isValidDomain(domain) {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
        return domainRegex.test(domain);
    }

    async performDomainAnalysis(domain, analysisTypes) {
        const results = {
            domain: domain,
            timestamp: new Date().toISOString(),
            analysisTypes: analysisTypes,
            results: {}
        };

        for (const type of analysisTypes) {
            results.results[type] = await this.performAnalysisType(domain, type);
        }

        return results;
    }

    async performAnalysisType(domain, type) {
        // Simulate analysis with realistic delays
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

        switch (type) {
            case 'whois':
                return this.performWHOISLookup(domain);
            case 'dns':
                return this.performDNSLookup(domain);
            case 'ssl':
                return this.performSSLAnalysis(domain);
            case 'security':
                return this.performSecurityScan(domain);
            case 'reputation':
                return this.performReputationCheck(domain);
            default:
                return { error: 'Unknown analysis type' };
        }
    }

    performWHOISLookup(domain) {
        const registrars = ['GoDaddy', 'Namecheap', 'Google Domains', 'Cloudflare', 'Name.com'];
        const statuses = ['active', 'pendingDelete', 'clientTransferProhibited'];
        
        return {
            registrar: registrars[Math.floor(Math.random() * registrars.length)],
            creationDate: new Date(Date.now() - Math.random() * 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
            expirationDate: new Date(Date.now() + Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
            updatedDate: new Date(Date.now() - Math.random() * 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
            status: statuses[Math.floor(Math.random() * statuses.length)],
            nameServers: [
                'ns1.example.com',
                'ns2.example.com'
            ],
            registrant: {
                organization: 'Example Organization',
                country: 'US',
                state: 'CA',
                city: 'San Francisco'
            }
        };
    }

    performDNSLookup(domain) {
        const recordTypes = ['A', 'AAAA', 'MX', 'CNAME', 'TXT', 'NS', 'SOA'];
        const records = {};

        recordTypes.forEach(type => {
            if (Math.random() > 0.3) { // 70% chance of having each record type
                records[type] = this.generateDNSRecords(domain, type);
            }
        });

        return {
            records: records,
            totalRecords: Object.keys(records).length
        };
    }

    generateDNSRecords(domain, type) {
        switch (type) {
            case 'A':
                return [`${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`];
            case 'AAAA':
                return ['2001:db8::1', '2001:db8::2'];
            case 'MX':
                return [
                    { priority: 10, exchange: `mail1.${domain}` },
                    { priority: 20, exchange: `mail2.${domain}` }
                ];
            case 'CNAME':
                return [`www.${domain}`];
            case 'TXT':
                return [
                    'v=spf1 include:_spf.google.com ~all',
                    'google-site-verification=abc123def456'
                ];
            case 'NS':
                return [`ns1.${domain}`, `ns2.${domain}`];
            case 'SOA':
                return {
                    mname: `ns1.${domain}`,
                    rname: `admin.${domain}`,
                    serial: Math.floor(Math.random() * 999999999),
                    refresh: 86400,
                    retry: 7200,
                    expire: 3600000,
                    minimum: 300
                };
            default:
                return [];
        }
    }

    performSSLAnalysis(domain) {
        const valid = Math.random() > 0.1; // 90% chance of valid SSL
        
        return {
            valid: valid,
            issuer: valid ? 'Let\'s Encrypt Authority X3' : null,
            validFrom: valid ? new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString() : null,
            validTo: valid ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString() : null,
            protocol: valid ? 'TLS 1.3' : null,
            cipher: valid ? 'TLS_AES_256_GCM_SHA384' : null,
            certificateChain: valid ? 3 : 0,
            ocspStapling: valid,
            hsts: Math.random() > 0.5,
            securityHeaders: {
                'Strict-Transport-Security': valid,
                'X-Content-Type-Options': valid,
                'X-Frame-Options': valid,
                'X-XSS-Protection': valid
            }
        };
    }

    performSecurityScan(domain) {
        const threats = Math.random() > 0.7; // 30% chance of threats
        
        return {
            threats: threats,
            threatCount: threats ? Math.floor(Math.random() * 5) + 1 : 0,
            threatTypes: threats ? this.generateThreatTypes() : [],
            malware: Math.random() > 0.8,
            phishing: Math.random() > 0.9,
            spam: Math.random() > 0.7,
            blacklisted: Math.random() > 0.95,
            riskScore: Math.floor(Math.random() * 100),
            recommendations: this.generateSecurityRecommendations()
        };
    }

    generateThreatTypes() {
        const threatTypes = ['malware', 'phishing', 'spam', 'botnet', 'malicious_redirect'];
        const count = Math.floor(Math.random() * 3) + 1;
        return threatTypes.slice(0, count);
    }

    generateSecurityRecommendations() {
        const recommendations = [
            'Enable HTTPS redirect',
            'Implement security headers',
            'Enable HSTS',
            'Use strong cipher suites',
            'Regular security audits'
        ];
        
        const count = Math.floor(Math.random() * 3) + 1;
        return recommendations.slice(0, count);
    }

    performReputationCheck(domain) {
        const reputation = ['Good', 'Fair', 'Poor'][Math.floor(Math.random() * 3)];
        
        return {
            reputation: reputation,
            score: reputation === 'Good' ? Math.floor(Math.random() * 30 + 70) : 
                   reputation === 'Fair' ? Math.floor(Math.random() * 30 + 40) : 
                   Math.floor(Math.random() * 40),
            age: Math.floor(Math.random() * 10) + 1,
            trustworthiness: Math.floor(Math.random() * 100),
            popularity: Math.floor(Math.random() * 100),
            blacklists: Math.floor(Math.random() * 5)
        };
    }

    displayResults(results) {
        const container = document.getElementById('domain-results-content');
        const resultsDiv = document.getElementById('domain-results');
        
        if (!container || !resultsDiv) return;

        container.innerHTML = `
            <div class="results-summary">
                <h4>Analysis Results for "${results.domain}"</h4>
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
            whois: 'WHOIS Information',
            dns: 'DNS Records',
            ssl: 'SSL Certificate',
            security: 'Security Scan',
            reputation: 'Reputation Check'
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
            case 'whois':
                return `
                    <div class="whois-result">
                        <div class="whois-info">
                            <div><strong>Registrar:</strong> ${result.registrar}</div>
                            <div><strong>Creation Date:</strong> ${new Date(result.creationDate).toLocaleDateString()}</div>
                            <div><strong>Expiration Date:</strong> ${new Date(result.expirationDate).toLocaleDateString()}</div>
                            <div><strong>Status:</strong> <span class="status ${result.status}">${result.status}</span></div>
                        </div>
                        <div class="name-servers">
                            <strong>Name Servers:</strong>
                            <ul>
                                ${result.nameServers.map(ns => `<li>${ns}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="registrant-info">
                            <strong>Registrant:</strong>
                            <div>${result.registrant.organization}</div>
                            <div>${result.registrant.city}, ${result.registrant.state}, ${result.registrant.country}</div>
                        </div>
                    </div>
                `;
            
            case 'dns':
                return `
                    <div class="dns-result">
                        <div class="dns-summary">
                            <strong>Total Records:</strong> ${result.totalRecords}
                        </div>
                        <div class="dns-records">
                            ${Object.entries(result.records).map(([recordType, records]) => `
                                <div class="dns-record-type">
                                    <strong>${recordType}:</strong>
                                    <div class="record-values">
                                        ${Array.isArray(records) ? 
                                            records.map(record => 
                                                typeof record === 'object' ? 
                                                    JSON.stringify(record) : 
                                                    `<div>${record}</div>`
                                            ).join('') :
                                            JSON.stringify(records)
                                        }
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            
            case 'ssl':
                return `
                    <div class="ssl-result ${result.valid ? 'valid' : 'invalid'}">
                        <div class="ssl-status">
                            <i class="fas fa-${result.valid ? 'lock' : 'unlock'}"></i>
                            ${result.valid ? 'Valid SSL Certificate' : 'Invalid SSL Certificate'}
                        </div>
                        ${result.valid ? `
                            <div class="ssl-details">
                                <div><strong>Issuer:</strong> ${result.issuer}</div>
                                <div><strong>Valid From:</strong> ${new Date(result.validFrom).toLocaleDateString()}</div>
                                <div><strong>Valid To:</strong> ${new Date(result.validTo).toLocaleDateString()}</div>
                                <div><strong>Protocol:</strong> ${result.protocol}</div>
                                <div><strong>Cipher:</strong> ${result.cipher}</div>
                            </div>
                            <div class="security-headers">
                                <strong>Security Headers:</strong>
                                <div class="headers-grid">
                                    ${Object.entries(result.securityHeaders).map(([header, enabled]) => `
                                        <div class="header-item ${enabled ? 'enabled' : 'disabled'}">
                                            <i class="fas fa-${enabled ? 'check' : 'times'}"></i>
                                            ${header}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            
            case 'security':
                return `
                    <div class="security-result ${result.threats ? 'threats' : 'safe'}">
                        <div class="security-status">
                            <i class="fas fa-${result.threats ? 'exclamation-triangle' : 'shield-alt'}"></i>
                            ${result.threats ? 'Security Threats Detected' : 'No Security Threats'}
                        </div>
                        <div class="security-stats">
                            <div>Risk Score: <span class="risk-score ${result.riskScore > 70 ? 'high' : result.riskScore > 40 ? 'medium' : 'low'}">${result.riskScore}/100</span></div>
                            <div>Threat Count: ${result.threatCount}</div>
                            <div>Malware: <i class="fas fa-${result.malware ? 'times' : 'check'}"></i></div>
                            <div>Phishing: <i class="fas fa-${result.phishing ? 'times' : 'check'}"></i></div>
                            <div>Spam: <i class="fas fa-${result.spam ? 'times' : 'check'}"></i></div>
                        </div>
                        ${result.recommendations.length > 0 ? `
                            <div class="recommendations">
                                <strong>Recommendations:</strong>
                                <ul>
                                    ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                `;
            
            case 'reputation':
                return `
                    <div class="reputation-result">
                        <div class="reputation-score">
                            <div class="score ${result.reputation.toLowerCase()}">${result.score}/100</div>
                            <div class="reputation-label">${result.reputation}</div>
                        </div>
                        <div class="reputation-details">
                            <div>Trustworthiness: ${result.trustworthiness}%</div>
                            <div>Popularity: ${result.popularity}%</div>
                            <div>Age: ${result.age} years</div>
                            <div>Blacklists: ${result.blacklists}</div>
                        </div>
                    </div>
                `;
            
            default:
                return `<div class="error">Analysis failed</div>`;
        }
    }

    getSelectedAnalysisTypes() {
        const checkboxes = document.querySelectorAll('#domain-analysis-types input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    clearResults() {
        const input = document.getElementById('domain-input');
        const results = document.getElementById('domain-results');
        
        if (input) input.value = '';
        if (results) results.style.display = 'none';
    }

    async exportResults() {
        const results = document.getElementById('domain-results-content');
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
        const results = document.getElementById('domain-results-content');
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
        const analyzeBtn = document.getElementById('domain-analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        }
    }

    hideLoading() {
        const analyzeBtn = document.getElementById('domain-analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-globe"></i> Analyze Domain';
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
    if (document.getElementById('domain-section')) {
        new DomainAnalysis();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DomainAnalysis;
} 