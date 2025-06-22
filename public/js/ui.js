// UI Components and Utilities for OSINT Framework

// Modal Component
class Modal {
    constructor(id, title, content) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.element = null;
    }

    create() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = this.id;
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h3>${this.title}</h3>
                    <button class="modal-close" onclick="closeModal('${this.id}')">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.content}
                </div>
            </div>
        `;
        
        this.element = modal;
        document.body.appendChild(modal);
        
        // Add modal styles if not already present
        this.addStyles();
        
        return modal;
    }

    show() {
        if (!this.element) {
            this.create();
        }
        this.element.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hide() {
        if (this.element) {
            this.element.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    addStyles() {
        if (!document.getElementById('modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                }
                .modal-container {
                    background: white;
                    border-radius: 12px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    position: relative;
                    z-index: 1001;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                }
                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-header h3 {
                    margin: 0;
                    color: #1f2937;
                    font-size: 1.25rem;
                    font-weight: 600;
                }
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #6b7280;
                    padding: 0;
                    width: 2rem;
                    height: 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 0.25rem;
                    transition: all 0.2s;
                }
                .modal-close:hover {
                    background: #f3f4f6;
                    color: #374151;
                }
                .modal-body {
                    padding: 1.5rem;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Toast Notification Component
class Toast {
    constructor(message, type = 'info', duration = 3000) {
        this.message = message;
        this.type = type;
        this.duration = duration;
        this.element = null;
    }

    show() {
        const toast = document.createElement('div');
        toast.className = `toast toast-${this.type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${this.message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        this.element = toast;
        document.body.appendChild(toast);
        
        // Add toast styles if not already present
        this.addStyles();
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Auto remove
        if (this.duration > 0) {
            setTimeout(() => {
                this.hide();
            }, this.duration);
        }
        
        return toast;
    }

    hide() {
        if (this.element) {
            this.element.classList.remove('show');
            setTimeout(() => {
                if (this.element && this.element.parentNode) {
                    this.element.remove();
                }
            }, 300);
        }
    }

    addStyles() {
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e5e7eb;
                    z-index: 1000;
                    transform: translateX(100%);
                    transition: transform 0.3s ease-out;
                    max-width: 400px;
                }
                .toast.show {
                    transform: translateX(0);
                }
                .toast-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem;
                }
                .toast-message {
                    color: #374151;
                    font-size: 0.875rem;
                    line-height: 1.4;
                }
                .toast-close {
                    background: none;
                    border: none;
                    color: #6b7280;
                    cursor: pointer;
                    font-size: 1.25rem;
                    padding: 0;
                    margin-left: 0.75rem;
                    width: 1.5rem;
                    height: 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 0.25rem;
                    transition: all 0.2s;
                }
                .toast-close:hover {
                    background: #f3f4f6;
                    color: #374151;
                }
                .toast-info {
                    border-left: 4px solid #3b82f6;
                }
                .toast-success {
                    border-left: 4px solid #10b981;
                }
                .toast-warning {
                    border-left: 4px solid #f59e0b;
                }
                .toast-error {
                    border-left: 4px solid #ef4444;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Loading Spinner Component
class LoadingSpinner {
    constructor(container, size = 'medium') {
        this.container = container;
        this.size = size;
        this.element = null;
    }

    show() {
        const spinner = document.createElement('div');
        spinner.className = `loading-spinner loading-spinner-${this.size}`;
        spinner.innerHTML = `
            <div class="spinner-ring"></div>
            <div class="spinner-text">Loading...</div>
        `;
        
        this.element = spinner;
        this.container.appendChild(spinner);
        
        // Add spinner styles if not already present
        this.addStyles();
        
        return spinner;
    }

    hide() {
        if (this.element && this.element.parentNode) {
            this.element.remove();
            this.element = null;
        }
    }

    addStyles() {
        if (!document.getElementById('spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'spinner-styles';
            style.textContent = `
                .loading-spinner {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }
                .spinner-ring {
                    border: 3px solid #f3f4f6;
                    border-top: 3px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                .loading-spinner-small .spinner-ring {
                    width: 20px;
                    height: 20px;
                }
                .loading-spinner-medium .spinner-ring {
                    width: 32px;
                    height: 32px;
                }
                .loading-spinner-large .spinner-ring {
                    width: 48px;
                    height: 48px;
                }
                .spinner-text {
                    margin-top: 0.75rem;
                    color: #6b7280;
                    font-size: 0.875rem;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Tooltip Component
class Tooltip {
    constructor(element, text, position = 'top') {
        this.element = element;
        this.text = text;
        this.position = position;
        this.tooltip = null;
        this.init();
    }

    init() {
        this.element.addEventListener('mouseenter', () => this.show());
        this.element.addEventListener('mouseleave', () => this.hide());
    }

    show() {
        const tooltip = document.createElement('div');
        tooltip.className = `tooltip tooltip-${this.position}`;
        tooltip.textContent = this.text;
        
        this.tooltip = tooltip;
        document.body.appendChild(tooltip);
        
        // Add tooltip styles if not already present
        this.addStyles();
        
        // Position tooltip
        this.positionTooltip();
    }

    hide() {
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.remove();
            this.tooltip = null;
        }
    }

    positionTooltip() {
        const rect = this.element.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (this.position) {
            case 'top':
                top = rect.top - tooltipRect.height - 8;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = rect.bottom + 8;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.left - tooltipRect.width - 8;
                break;
            case 'right':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.right + 8;
                break;
        }
        
        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
    }

    addStyles() {
        if (!document.getElementById('tooltip-styles')) {
            const style = document.createElement('style');
            style.id = 'tooltip-styles';
            style.textContent = `
                .tooltip {
                    position: absolute;
                    background: #1f2937;
                    color: white;
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.375rem;
                    font-size: 0.75rem;
                    line-height: 1.4;
                    z-index: 1000;
                    pointer-events: none;
                    white-space: nowrap;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .tooltip::after {
                    content: '';
                    position: absolute;
                    border: 4px solid transparent;
                }
                .tooltip-top::after {
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border-top-color: #1f2937;
                }
                .tooltip-bottom::after {
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border-bottom-color: #1f2937;
                }
                .tooltip-left::after {
                    left: 100%;
                    top: 50%;
                    transform: translateY(-50%);
                    border-left-color: #1f2937;
                }
                .tooltip-right::after {
                    right: 100%;
                    top: 50%;
                    transform: translateY(-50%);
                    border-right-color: #1f2937;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Global utility functions
function showModal(id, title, content) {
    const modal = new Modal(id, title, content);
    modal.show();
    return modal;
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function showToast(message, type = 'info', duration = 3000) {
    const toast = new Toast(message, type, duration);
    return toast.show();
}

function showLoading(container, size = 'medium') {
    const spinner = new LoadingSpinner(container, size);
    return spinner.show();
}

function hideLoading(container) {
    const spinner = container.querySelector('.loading-spinner');
    if (spinner) {
        spinner.remove();
    }
}

function addTooltip(element, text, position = 'top') {
    return new Tooltip(element, text, position);
}

// Export for use in other modules
window.UI = {
    Modal,
    Toast,
    LoadingSpinner,
    Tooltip,
    showModal,
    closeModal,
    showToast,
    showLoading,
    hideLoading,
    addTooltip
};

// UI Utilities for OSINT Framework

class UI {
    constructor() {
        this.initializeComponents();
    }

    initializeComponents() {
        this.initializeTooltips();
        this.initializeModals();
        this.initializeDropdowns();
        this.initializeTabs();
        this.initializeAccordions();
        this.initializeSearch();
    }

    // Tooltip functionality
    initializeTooltips() {
        const tooltips = document.querySelectorAll('[data-tooltip]');
        
        tooltips.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.dataset.tooltip);
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-popup';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: #1f2937;
            color: white;
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            font-size: 0.75rem;
            z-index: 1000;
            pointer-events: none;
            white-space: nowrap;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;

        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';

        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    // Modal functionality
    initializeModals() {
        const modalTriggers = document.querySelectorAll('[data-modal]');
        
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.dataset.modal;
                this.openModal(modalId);
            });
        });

        // Close modal on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.active');
                if (openModal) {
                    this.closeModal(openModal);
                }
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Dropdown functionality
    initializeDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (trigger && menu) {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleDropdown(dropdown);
                });
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                this.closeAllDropdowns();
            }
        });
    }

    toggleDropdown(dropdown) {
        const isOpen = dropdown.classList.contains('active');
        
        this.closeAllDropdowns();
        
        if (!isOpen) {
            dropdown.classList.add('active');
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown.active').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }

    // Tab functionality
    initializeTabs() {
        const tabContainers = document.querySelectorAll('.tabs');
        
        tabContainers.forEach(container => {
            const tabs = container.querySelectorAll('.tab');
            const contents = container.querySelectorAll('.tab-content');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = tab.dataset.target;
                    this.switchTab(container, target);
                });
            });
        });
    }

    switchTab(container, targetId) {
        const tabs = container.querySelectorAll('.tab');
        const contents = container.querySelectorAll('.tab-content');
        
        // Remove active class from all tabs and contents
        tabs.forEach(tab => tab.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        const activeTab = container.querySelector(`[data-target="${targetId}"]`);
        const activeContent = document.getElementById(targetId);
        
        if (activeTab && activeContent) {
            activeTab.classList.add('active');
            activeContent.classList.add('active');
        }
    }

    // Accordion functionality
    initializeAccordions() {
        const accordions = document.querySelectorAll('.accordion');
        
        accordions.forEach(accordion => {
            const triggers = accordion.querySelectorAll('.accordion-trigger');
            
            triggers.forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleAccordion(trigger);
                });
            });
        });
    }

    toggleAccordion(trigger) {
        const item = trigger.closest('.accordion-item');
        const content = item.querySelector('.accordion-content');
        const isOpen = item.classList.contains('active');
        
        if (isOpen) {
            item.classList.remove('active');
            content.style.maxHeight = '0';
        } else {
            item.classList.add('active');
            content.style.maxHeight = content.scrollHeight + 'px';
        }
    }

    // Search functionality
    initializeSearch() {
        const searchInputs = document.querySelectorAll('.search-input');
        
        searchInputs.forEach(input => {
            let debounceTimer;
            
            input.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.performSearch(e.target.value, e.target.dataset.searchTarget);
                }, 300);
            });
        });
    }

    performSearch(query, target) {
        if (!query.trim()) {
            this.clearSearchResults(target);
            return;
        }

        // This would typically make an API call
        console.log(`Searching for "${query}" in ${target}`);
        
        // Simulate search results
        this.showSearchResults(target, [
            { title: 'Search Result 1', description: 'Description for result 1' },
            { title: 'Search Result 2', description: 'Description for result 2' }
        ]);
    }

    showSearchResults(target, results) {
        const container = document.querySelector(target);
        if (!container) return;

        const resultsHtml = results.map(result => `
            <div class="search-result">
                <h4>${result.title}</h4>
                <p>${result.description}</p>
            </div>
        `).join('');

        container.innerHTML = resultsHtml;
    }

    clearSearchResults(target) {
        const container = document.querySelector(target);
        if (container) {
            container.innerHTML = '';
        }
    }

    // Loading states
    showLoading(element) {
        if (element) {
            element.classList.add('loading');
            element.disabled = true;
        }
    }

    hideLoading(element) {
        if (element) {
            element.classList.remove('loading');
            element.disabled = false;
        }
    }

    // Notifications
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }

    // Form validation
    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showFieldError(input, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(input);
            }
        });
        
        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const error = document.createElement('div');
        error.className = 'field-error';
        error.textContent = message;
        error.style.cssText = `
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        `;
        
        field.parentNode.appendChild(error);
        field.style.borderColor = '#ef4444';
    }

    clearFieldError(field) {
        const error = field.parentNode.querySelector('.field-error');
        if (error) {
            error.remove();
        }
        field.style.borderColor = '';
    }

    // Utility functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ui = new UI();
});

// Export for use in other modules
window.UI = UI; 