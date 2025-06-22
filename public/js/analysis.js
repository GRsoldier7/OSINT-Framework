// Analysis page functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeAnalysis();
});

function initializeAnalysis() {
    // Data Analysis
    const analyzeBtn = document.getElementById('analyze-btn');
    const analysisData = document.getElementById('analysis-data');
    const analysisResults = document.getElementById('analysis-results');
    const fileInput = document.getElementById('file-input');

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', async () => {
            const data = analysisData.value.trim();
            if (!data) {
                showNotification('Please enter data to analyze', 'error');
                return;
            }

            analyzeBtn.disabled = true;
            analyzeBtn.textContent = 'Analyzing...';

            try {
                const response = await fetch('/api/chat/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: data,
                        type: 'general'
                    })
                });

                const result = await response.json();

                if (result.success) {
                    displayAnalysisResults(analysisResults, result.data);
                    showNotification('Analysis completed successfully', 'success');
                } else {
                    showNotification('Analysis failed: ' + result.message, 'error');
                }
            } catch (error) {
                showNotification('Error during analysis: ' + error.message, 'error');
            } finally {
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = 'Analyze Data';
            }
        });
    }

    // File upload handling
    if (fileInput) {
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    analysisData.value = e.target.result;
                };
                reader.readAsText(file);
            }
        });
    }

    // Threat Assessment
    const threatBtn = document.getElementById('threat-btn');
    const threatData = document.getElementById('threat-data');
    const threatResults = document.getElementById('threat-results');

    if (threatBtn) {
        threatBtn.addEventListener('click', async () => {
            const data = threatData.value.trim();
            if (!data) {
                showNotification('Please enter threat data to assess', 'error');
                return;
            }

            threatBtn.disabled = true;
            threatBtn.textContent = 'Assessing...';

            try {
                const response = await fetch('/api/chat/threat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: data
                    })
                });

                const result = await response.json();

                if (result.success) {
                    displayThreatResults(threatResults, result.data);
                    showNotification('Threat assessment completed', 'success');
                } else {
                    showNotification('Threat assessment failed: ' + result.message, 'error');
                }
            } catch (error) {
                showNotification('Error during threat assessment: ' + error.message, 'error');
            } finally {
                threatBtn.disabled = false;
                threatBtn.textContent = 'Assess Threat';
            }
        });
    }

    // Report Generation
    const reportBtn = document.getElementById('report-btn');
    const reportData = document.getElementById('report-data');
    const reportTemplate = document.getElementById('report-template');
    const reportResults = document.getElementById('report-results');

    if (reportBtn) {
        reportBtn.addEventListener('click', async () => {
            const data = reportData.value.trim();
            const template = reportTemplate.value;

            if (!data) {
                showNotification('Please enter data for report generation', 'error');
                return;
            }

            reportBtn.disabled = true;
            reportBtn.textContent = 'Generating...';

            try {
                const response = await fetch('/api/chat/report', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: data,
                        template: template
                    })
                });

                const result = await response.json();

                if (result.success) {
                    displayReportResults(reportResults, result.data);
                    showNotification('Report generated successfully', 'success');
                } else {
                    showNotification('Report generation failed: ' + result.message, 'error');
                }
            } catch (error) {
                showNotification('Error during report generation: ' + error.message, 'error');
            } finally {
                reportBtn.disabled = false;
                reportBtn.textContent = 'Generate Report';
            }
        });
    }
}

function displayAnalysisResults(container, data) {
    container.style.display = 'block';
    container.innerHTML = `
        <div class="result-section">
            <h4>Analysis Results</h4>
            <div class="result-content">
                <p><strong>Summary:</strong> ${data.summary || 'No summary available'}</p>
                <p><strong>Key Insights:</strong></p>
                <ul>
                    ${(data.insights || []).map(insight => `<li>${insight}</li>`).join('')}
                </ul>
                <p><strong>Recommendations:</strong></p>
                <ul>
                    ${(data.recommendations || []).map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function displayThreatResults(container, data) {
    container.style.display = 'block';
    container.innerHTML = `
        <div class="result-section">
            <h4>Threat Assessment Results</h4>
            <div class="result-content">
                <p><strong>Threat Level:</strong> <span class="threat-level ${data.threatLevel?.toLowerCase()}">${data.threatLevel || 'Unknown'}</span></p>
                <p><strong>Risk Score:</strong> ${data.riskScore || 'N/A'}/10</p>
                <p><strong>Threat Indicators:</strong></p>
                <ul>
                    ${(data.indicators || []).map(indicator => `<li>${indicator}</li>`).join('')}
                </ul>
                <p><strong>Mitigation Strategies:</strong></p>
                <ul>
                    ${(data.mitigation || []).map(strategy => `<li>${strategy}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function displayReportResults(container, data) {
    container.style.display = 'block';
    container.innerHTML = `
        <div class="result-section">
            <h4>Generated Report</h4>
            <div class="result-content">
                <div class="report-header">
                    <h5>${data.title || 'OSINT Report'}</h5>
                    <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Template:</strong> ${data.template || 'Standard'}</p>
                </div>
                <div class="report-body">
                    ${data.content || 'No report content available'}
                </div>
                <div class="report-actions">
                    <button class="btn btn-sm btn-primary" onclick="downloadReport('${data.title || 'report'}')">Download PDF</button>
                    <button class="btn btn-sm btn-secondary" onclick="copyReport()">Copy to Clipboard</button>
                </div>
            </div>
        </div>
    `;
}

function downloadReport(title) {
    // Simulate PDF download
    showNotification('PDF download started', 'success');
}

function copyReport() {
    const reportContent = document.querySelector('.report-body').innerText;
    navigator.clipboard.writeText(reportContent).then(() => {
        showNotification('Report copied to clipboard', 'success');
    }).catch(() => {
        showNotification('Failed to copy report', 'error');
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '1rem';
    notification.style.borderRadius = '0.5rem';
    notification.style.color = 'white';
    notification.style.zIndex = '1000';
    notification.style.animation = 'slideIn 0.3s ease-out';
    
    if (type === 'success') {
        notification.style.backgroundColor = '#10b981';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
    } else {
        notification.style.backgroundColor = '#3b82f6';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
} 