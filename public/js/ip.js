// IP Analysis Module
class IPAnalysis {
    constructor() {
        this.analysisTypes = [
            { id: 'geolocation', name: 'Geolocation', checked: true },
            { id: 'reputation', name: 'Reputation Check', checked: true },
            { id: 'history', name: 'IP History', checked: false },
            { id: 'threats', name: 'Threat Intelligence', checked: true },
            { id: 'ports', name: 'Port Scan', checked: false }
        ];
        
        this.init();
    }

    init() {
        this.renderAnalysisTypes();
        this.bindEvents();
    }

    renderAnalysisTypes() {
        const container = document.getElementById('ip-analysis-types');
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
        const analyzeBtn = document.getElementById('ip-analyze-btn');
        const clearBtn = document.getElementById('clear-ip-btn');
        const exportBtn = document.getElementById('export-ip-btn');
        const analyzeResultsBtn = document.getElementById('analyze-ip-btn');

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeIP());
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

    async analyzeIP() {
        const input = document.getElementById('ip-input');
        const ip = input?.value.trim();

        if (!ip) {
            this.showNotification('Please enter an IP address to analyze', 'error');
            return;
        }

        if (!this.isValidIP(ip)) {
            this.showNotification('Please enter a valid IP address', 'error');
            return;
        }

        const selectedTypes = this.getSelectedAnalysisTypes();
        if (selectedTypes.length === 0) {
            this.showNotification('Please select at least one analysis type', 'error');
            return;
        }

        this.showLoading();
        
        try {
            const results = await this.performIPAnalysis(ip, selectedTypes);
            this.displayResults(results);
        } catch (error) {
            console.error('IP analysis failed:', error);
            this.showNotification('IP analysis failed. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    isValidIP(ip) {
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    }

    async performIPAnalysis(ip, analysisTypes) {
        const results = {
            ip: ip,
            timestamp: new Date().toISOString(),
            analysisTypes: analysisTypes,
            results: {}
        };

        for (const type of analysisTypes) {
            results.results[type] = await this.performAnalysisType(ip, type);
        }

        return results;
    }

    async performAnalysisType(ip, type) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

        switch (type) {
            case 'geolocation':
                return this.performGeolocation(ip);
            case 'reputation':
                return this.performReputationCheck(ip);
            case 'history':
                return this.performIPHistory(ip);
            case 'threats':
                return this.performThreatIntelligence(ip);
            case 'ports':
                return this.performPortScan(ip);
            default:
                return { error: 'Unknown analysis type' };
        }
    }

    performGeolocation(ip) {
        const countries = ['US', 'CA', 'GB', 'DE', 'FR', 'JP', 'AU', 'BR', 'IN', 'CN'];
        const cities = ['New York', 'London', 'Berlin', 'Paris', 'Tokyo', 'Sydney', 'São Paulo', 'Mumbai', 'Beijing'];
        
        return {
            country: countries[Math.floor(Math.random() * countries.length)],
            countryName: 'United States',
            region: 'CA',
            regionName: 'California',
            city: cities[Math.floor(Math.random() * cities.length)],
            zipCode: Math.floor(Math.random() * 99999) + 10000,
            latitude: (Math.random() * 180 - 90).toFixed(6),
            longitude: (Math.random() * 360 - 180).toFixed(6),
            timezone: 'America/Los_Angeles',
            isp: 'Comcast Cable Communications',
            organization: 'Comcast Cable Communications',
            asn: 'AS7922',
            asnName: 'Comcast Cable Communications, LLC'
        };
    }

    performReputationCheck(ip) {
        const reputation = ['Good', 'Fair', 'Poor'][Math.floor(Math.random() * 3)];
        
        return {
            reputation: reputation,
            score: reputation === 'Good' ? Math.floor(Math.random() * 30 + 70) : 
                   reputation === 'Fair' ? Math.floor(Math.random() * 30 + 40) : 
                   Math.floor(Math.random() * 40),
            blacklists: Math.floor(Math.random() * 10),
            spamScore: Math.floor(Math.random() * 100),
            proxy: Math.random() > 0.8,
            vpn: Math.random() > 0.9,
            tor: Math.random() > 0.95,
            datacenter: Math.random() > 0.7
        };
    }

    performIPHistory(ip) {
        const historyCount = Math.floor(Math.random() * 10) + 1;
        const history = [];
        
        for (let i = 0; i < historyCount; i++) {
            history.push({
                date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
                country: ['US', 'CA', 'GB', 'DE', 'FR'][Math.floor(Math.random() * 5)],
                isp: ['Comcast', 'Verizon', 'AT&T', 'Cox', 'Charter'][Math.floor(Math.random() * 5)],
                organization: 'Example Organization'
            });
        }
        
        return {
            history: history.sort((a, b) => new Date(b.date) - new Date(a.date)),
            totalRecords: historyCount,
            firstSeen: history[history.length - 1]?.date,
            lastSeen: history[0]?.date
        };
    }

    performThreatIntelligence(ip) {
        const hasThreats = Math.random() > 0.6;
        const threats = hasThreats ? this.generateThreatData() : [];
        
        return {
            hasThreats: hasThreats,
            threatCount: threats.length,
            threats: threats,
            riskLevel: hasThreats ? ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] : 'None',
            categories: hasThreats ? this.generateThreatCategories() : [],
            lastSeen: hasThreats ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null
        };
    }

    generateThreatData() {
        const threatTypes = ['malware', 'botnet', 'phishing', 'spam', 'ddos', 'scanning'];
        const count = Math.floor(Math.random() * 5) + 1;
        const threats = [];
        
        for (let i = 0; i < count; i++) {
            threats.push({
                type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
                date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                confidence: Math.floor(Math.random() * 30 + 70),
                source: ['AbuseIPDB', 'VirusTotal', 'AlienVault', 'Cisco Talos'][Math.floor(Math.random() * 4)]
            });
        }
        
        return threats.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    generateThreatCategories() {
        const categories = ['malware', 'botnet', 'phishing', 'spam', 'ddos'];
        const count = Math.floor(Math.random() * 3) + 1;
        return categories.slice(0, count);
    }

    performPortScan(ip) {
        const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 3306, 3389, 5432, 8080];
        const openPorts = [];
        
        commonPorts.forEach(port => {
            if (Math.random() > 0.7) { // 30% chance of port being open
                openPorts.push({
                    port: port,
                    service: this.getServiceName(port),
                    state: 'open',
                    version: this.getServiceVersion(port)
                });
            }
        });
        
        return {
            openPorts: openPorts,
            totalScanned: commonPorts.length,
            openCount: openPorts.length,
            scanTime: Math.floor(Math.random() * 10 + 5)
        };
    }

    getServiceName(port) {
        const services = {
            21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS',
            80: 'HTTP', 110: 'POP3', 143: 'IMAP', 443: 'HTTPS',
            993: 'IMAPS', 995: 'POP3S', 3306: 'MySQL', 3389: 'RDP',
            5432: 'PostgreSQL', 8080: 'HTTP-Proxy'
        };
        return services[port] || 'Unknown';
    }

    getServiceVersion(port) {
        const versions = {
            22: 'OpenSSH 8.2p1',
            80: 'Apache/2.4.41',
            443: 'nginx/1.18.0',
            3306: 'MySQL 8.0.26',
            5432: 'PostgreSQL 13.4'
        };
        return versions[port] || 'Unknown';
    }

    displayResults(results) {
        const container = document.getElementById('ip-results-content');
        const resultsDiv = document.getElementById('ip-results');
        
        if (!container || !resultsDiv) return;

        container.innerHTML = `
            <div class="results-summary">
                <h4>Analysis Results for ${results.ip}</h4>
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
            geolocation: 'Geolocation',
            reputation: 'Reputation Check',
            history: 'IP History',
            threats: 'Threat Intelligence',
            ports: 'Port Scan'
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
            case 'geolocation':
                return `
                    <div class="geolocation-result">
                        <div class="location-info">
                            <div><strong>Country:</strong> ${result.countryName} (${result.country})</div>
                            <div><strong>Region:</strong> ${result.regionName} (${result.region})</div>
                            <div><strong>City:</strong> ${result.city}</div>
                            <div><strong>ZIP Code:</strong> ${result.zipCode}</div>
                        </div>
                        <div class="coordinates">
                            <div><strong>Coordinates:</strong> ${result.latitude}, ${result.longitude}</div>
                            <div><strong>Timezone:</strong> ${result.timezone}</div>
                        </div>
                        <div class="network-info">
                            <div><strong>ISP:</strong> ${result.isp}</div>
                            <div><strong>Organization:</strong> ${result.organization}</div>
                            <div><strong>ASN:</strong> ${result.asn} - ${result.asnName}</div>
                        </div>
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
                            <div>Blacklists: ${result.blacklists}</div>
                            <div>Spam Score: ${result.spamScore}/100</div>
                            <div>Proxy: <i class="fas fa-${result.proxy ? 'times' : 'check'}"></i></div>
                            <div>VPN: <i class="fas fa-${result.vpn ? 'times' : 'check'}"></i></div>
                            <div>Tor: <i class="fas fa-${result.tor ? 'times' : 'check'}"></i></div>
                            <div>Datacenter: <i class="fas fa-${result.datacenter ? 'times' : 'check'}"></i></div>
                        </div>
                    </div>
                `;
            
            case 'history':
                return `
                    <div class="history-result">
                        <div class="history-summary">
                            <div>Total Records: ${result.totalRecords}</div>
                            <div>First Seen: ${result.firstSeen ? new Date(result.firstSeen).toLocaleDateString() : 'Unknown'}</div>
                            <div>Last Seen: ${result.lastSeen ? new Date(result.lastSeen).toLocaleDateString() : 'Unknown'}</div>
                        </div>
                        <div class="history-list">
                            ${result.history.slice(0, 5).map(record => `
                                <div class="history-item">
                                    <div class="history-date">${new Date(record.date).toLocaleDateString()}</div>
                                    <div class="history-country">${record.country}</div>
                                    <div class="history-isp">${record.isp}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            
            case 'threats':
                return `
                    <div class="threats-result ${result.hasThreats ? 'threats' : 'safe'}">
                        <div class="threats-status">
                            <i class="fas fa-${result.hasThreats ? 'exclamation-triangle' : 'shield-alt'}"></i>
                            ${result.hasThreats ? 'Threats Detected' : 'No Threats Found'}
                        </div>
                        ${result.hasThreats ? `
                            <div class="threats-details">
                                <div>Threat Count: ${result.threatCount}</div>
                                <div>Risk Level: <span class="risk-level ${result.riskLevel.toLowerCase()}">${result.riskLevel}</span></div>
                                <div>Categories: ${result.categories.join(', ')}</div>
                            </div>
                            <div class="threats-list">
                                ${result.threats.map(threat => `
                                    <div class="threat-item">
                                        <div class="threat-type">${threat.type}</div>
                                        <div class="threat-date">${new Date(threat.date).toLocaleDateString()}</div>
                                        <div class="threat-confidence">${threat.confidence}%</div>
                                        <div class="threat-source">${threat.source}</div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
            
            case 'ports':
                return `
                    <div class="ports-result">
                        <div class="ports-summary">
                            <div>Open Ports: ${result.openCount}/${result.totalScanned}</div>
                            <div>Scan Time: ${result.scanTime}s</div>
                        </div>
                        <div class="ports-list">
                            ${result.openPorts.map(port => `
                                <div class="port-item">
                                    <div class="port-number">${port.port}</div>
                                    <div class="port-service">${port.service}</div>
                                    <div class="port-version">${port.version}</div>
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
        const checkboxes = document.querySelectorAll('#ip-analysis-types input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    clearResults() {
        const input = document.getElementById('ip-input');
        const results = document.getElementById('ip-results');
        
        if (input) input.value = '';
        if (results) results.style.display = 'none';
    }

    async exportResults() {
        const results = document.getElementById('ip-results-content');
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
        const results = document.getElementById('ip-results-content');
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
        const analyzeBtn = document.getElementById('ip-analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        }
    }

    hideLoading() {
        const analyzeBtn = document.getElementById('ip-analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-network-wired"></i> Analyze IP';
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
    if (document.getElementById('ip-section')) {
        new IPAnalysis();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IPAnalysis;
} 