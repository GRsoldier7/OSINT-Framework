// Reports page functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeReports();
});

function initializeReports() {
    const generateReportBtn = document.getElementById('generate-report-btn');
    const reportTitle = document.getElementById('report-title');
    const reportType = document.getElementById('report-type');
    const reportContent = document.getElementById('report-content');

    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', async () => {
            const title = reportTitle.value.trim();
            const type = reportType.value;
            const content = reportContent.value.trim();

            if (!title || !content) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            generateReportBtn.disabled = true;
            generateReportBtn.textContent = 'Generating...';

            try {
                const response = await fetch('/api/chat/report', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: content,
                        template: type,
                        title: title
                    })
                });

                const result = await response.json();

                if (result.success) {
                    showNotification('Report generated successfully', 'success');
                    addReportToRecent(title, result.data);
                    clearReportForm();
                } else {
                    showNotification('Report generation failed: ' + result.message, 'error');
                }
            } catch (error) {
                showNotification('Error generating report: ' + error.message, 'error');
            } finally {
                generateReportBtn.disabled = false;
                generateReportBtn.textContent = 'Generate Report';
            }
        });
    }

    // Template usage
    const templateButtons = document.querySelectorAll('.template-item .btn');
    templateButtons.forEach(button => {
        button.addEventListener('click', () => {
            const templateItem = button.closest('.template-item');
            const templateName = templateItem.querySelector('h4').textContent;
            
            // Set template type based on name
            if (templateName.includes('Standard')) {
                reportType.value = 'standard';
            } else if (templateName.includes('Threat')) {
                reportType.value = 'threat';
            } else if (templateName.includes('Executive')) {
                reportType.value = 'executive';
            }

            showNotification(`Template "${templateName}" selected`, 'success');
        });
    });

    // Recent reports actions
    initializeRecentReports();
}

function addReportToRecent(title, data) {
    const recentReports = document.getElementById('recent-reports');
    if (recentReports) {
        const reportItem = document.createElement('div');
        reportItem.className = 'report-item';
        reportItem.innerHTML = `
            <h4>${title}</h4>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <div class="report-actions">
                <button class="btn btn-sm btn-secondary" onclick="viewReport('${title}')">View</button>
                <button class="btn btn-sm btn-primary" onclick="exportReport('${title}')">Export</button>
                <button class="btn btn-sm btn-danger" onclick="deleteReport(this)">Delete</button>
            </div>
        `;
        recentReports.appendChild(reportItem);
    }
}

function clearReportForm() {
    const reportTitle = document.getElementById('report-title');
    const reportContent = document.getElementById('report-content');
    
    if (reportTitle) reportTitle.value = '';
    if (reportContent) reportContent.value = '';
}

function initializeRecentReports() {
    // Add event listeners to existing report items
    const reportItems = document.querySelectorAll('.report-item');
    reportItems.forEach(item => {
        const viewBtn = item.querySelector('.btn-secondary');
        const exportBtn = item.querySelector('.btn-primary');
        const deleteBtn = item.querySelector('.btn-danger');

        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                const title = item.querySelector('h4').textContent;
                viewReport(title);
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const title = item.querySelector('h4').textContent;
                exportReport(title);
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                deleteReport(deleteBtn);
            });
        }
    });
}

function viewReport(title) {
    // Simulate viewing a report
    showNotification(`Opening report: ${title}`, 'info');
    
    // Create a modal to display the report
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p>This is a sample report content for ${title}.</p>
                <p>In a real implementation, this would display the actual report content.</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="exportReport('${title}')">Export</button>
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .modal-content {
            background: white;
            border-radius: 8px;
            max-width: 600px;
            width: 90%;
            max-height: 80%;
            overflow-y: auto;
        }
        .modal-header {
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .modal-body {
            padding: 1rem;
        }
        .modal-footer {
            padding: 1rem;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 0.5rem;
            justify-content: flex-end;
        }
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
        }
        .modal-close:hover {
            color: #374151;
        }
    `;
    document.head.appendChild(style);
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

function exportReport(title) {
    // Simulate report export
    showNotification(`Exporting report: ${title}`, 'success');
    
    // Create a download link
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(`OSINT Report: ${title}\n\nGenerated on: ${new Date().toLocaleDateString()}\n\nThis is a sample report export.`);
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.txt`;
    link.click();
}

function deleteReport(button) {
    const reportItem = button.closest('.report-item');
    if (reportItem) {
        const title = reportItem.querySelector('h4').textContent;
        if (confirm(`Are you sure you want to delete the report "${title}"?`)) {
            reportItem.remove();
            showNotification(`Report "${title}" deleted`, 'success');
        }
    }
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