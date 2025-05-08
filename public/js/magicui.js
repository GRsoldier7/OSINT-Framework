/**
 * MagicUI JavaScript Library
 * Enhanced UI components and interactions for the OSINT Framework
 */

// Initialize MagicUI when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('MagicUI initialized');
  initThemeToggle();
  initAnimations();
  initTooltips();
  initDropdowns();
  initModals();
  initTabs();
  initCollapsibles();
  initSearchSuggestions();
  initNotifications();
});

/**
 * Theme Toggle Functionality
 */
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  // Check for saved theme preference or use device preference
  const savedTheme = localStorage.getItem('osint-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Set initial theme
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeToggle.checked = false;
  } else if (savedTheme === 'dark' || prefersDark) {
    document.body.classList.remove('light-theme');
    themeToggle.checked = true;
  }
  
  // Handle theme toggle
  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      document.body.classList.remove('light-theme');
      localStorage.setItem('osint-theme', 'dark');
    } else {
      document.body.classList.add('light-theme');
      localStorage.setItem('osint-theme', 'light');
    }
  });
}

/**
 * Initialize animations for elements with data-animate attribute
 */
function initAnimations() {
  const animatedElements = document.querySelectorAll('[data-animate]');
  
  if (animatedElements.length === 0) return;
  
  // Create an intersection observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const animation = element.getAttribute('data-animate');
        element.classList.add(`animate-${animation}`);
        observer.unobserve(element);
      }
    });
  }, { threshold: 0.1 });
  
  // Observe each animated element
  animatedElements.forEach(element => {
    observer.observe(element);
  });
}

/**
 * Initialize tooltips for elements with data-tooltip attribute
 */
function initTooltips() {
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  
  if (tooltipElements.length === 0) return;
  
  tooltipElements.forEach(element => {
    const tooltipText = element.getAttribute('data-tooltip');
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = tooltipText;
    
    // Add tooltip to element
    element.appendChild(tooltip);
    
    // Show/hide tooltip on hover
    element.addEventListener('mouseenter', () => {
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
    });
    
    element.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
    });
  });
}

/**
 * Initialize dropdown menus
 */
function initDropdowns() {
  const dropdownToggles = document.querySelectorAll('[data-dropdown-toggle]');
  
  if (dropdownToggles.length === 0) return;
  
  dropdownToggles.forEach(toggle => {
    const targetId = toggle.getAttribute('data-dropdown-toggle');
    const target = document.getElementById(targetId);
    
    if (!target) return;
    
    // Toggle dropdown on click
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isVisible = target.classList.contains('show');
      
      // Hide all other dropdowns
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        if (menu !== target) {
          menu.classList.remove('show');
        }
      });
      
      // Toggle current dropdown
      target.classList.toggle('show', !isVisible);
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
      menu.classList.remove('show');
    });
  });
}

/**
 * Initialize modal dialogs
 */
function initModals() {
  const modalTriggers = document.querySelectorAll('[data-modal-toggle]');
  
  if (modalTriggers.length === 0) return;
  
  modalTriggers.forEach(trigger => {
    const targetId = trigger.getAttribute('data-modal-toggle');
    const target = document.getElementById(targetId);
    
    if (!target) return;
    
    // Open modal on trigger click
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(target);
    });
    
    // Close modal on close button click
    const closeButtons = target.querySelectorAll('[data-modal-close]');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        closeModal(target);
      });
    });
    
    // Close modal on backdrop click
    target.addEventListener('click', (e) => {
      if (e.target === target) {
        closeModal(target);
      }
    });
    
    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && target.classList.contains('show')) {
        closeModal(target);
      }
    });
  });
}

/**
 * Open a modal dialog
 * @param {HTMLElement} modal Modal element to open
 */
function openModal(modal) {
  document.body.classList.add('modal-open');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  
  // Add animation
  setTimeout(() => {
    modal.querySelector('.modal-content').classList.add('animate-slide-in');
  }, 10);
}

/**
 * Close a modal dialog
 * @param {HTMLElement} modal Modal element to close
 */
function closeModal(modal) {
  modal.querySelector('.modal-content').classList.remove('animate-slide-in');
  
  setTimeout(() => {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }, 300);
}

/**
 * Initialize tabs
 */
function initTabs() {
  const tabGroups = document.querySelectorAll('[data-tabs]');
  
  if (tabGroups.length === 0) return;
  
  tabGroups.forEach(tabGroup => {
    const tabs = tabGroup.querySelectorAll('[data-tab]');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-tab');
        const target = document.getElementById(targetId);
        
        if (!target) return;
        
        // Deactivate all tabs and panels
        tabs.forEach(t => t.classList.remove('active'));
        tabGroup.querySelectorAll('.tab-panel').forEach(panel => {
          panel.classList.remove('active');
        });
        
        // Activate current tab and panel
        tab.classList.add('active');
        target.classList.add('active');
      });
    });
  });
}

/**
 * Initialize collapsible elements
 */
function initCollapsibles() {
  const collapsibleToggles = document.querySelectorAll('[data-collapse-toggle]');
  
  if (collapsibleToggles.length === 0) return;
  
  collapsibleToggles.forEach(toggle => {
    const targetId = toggle.getAttribute('data-collapse-toggle');
    const target = document.getElementById(targetId);
    
    if (!target) return;
    
    toggle.addEventListener('click', () => {
      const isVisible = target.classList.contains('show');
      
      if (isVisible) {
        target.style.height = `${target.scrollHeight}px`;
        
        // Force reflow
        target.offsetHeight;
        
        target.style.height = '0';
        target.classList.remove('show');
        
        setTimeout(() => {
          target.style.height = '';
        }, 300);
      } else {
        target.style.height = '0';
        target.classList.add('show');
        
        // Force reflow
        target.offsetHeight;
        
        target.style.height = `${target.scrollHeight}px`;
        
        setTimeout(() => {
          target.style.height = '';
        }, 300);
      }
      
      // Toggle aria-expanded
      toggle.setAttribute('aria-expanded', !isVisible);
    });
  });
}

/**
 * Initialize search suggestions
 */
function initSearchSuggestions() {
  const searchInputs = document.querySelectorAll('[data-search-input]');
  
  if (searchInputs.length === 0) return;
  
  searchInputs.forEach(input => {
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'search-suggestions';
    input.parentNode.appendChild(suggestionsContainer);
    
    input.addEventListener('input', debounce(async () => {
      const query = input.value.trim();
      
      if (query.length < 2) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.classList.remove('show');
        return;
      }
      
      // In a real implementation, this would call an API
      // For now, we'll use some mock suggestions
      const suggestions = getMockSuggestions(query);
      
      if (suggestions.length > 0) {
        suggestionsContainer.innerHTML = '';
        
        suggestions.forEach(suggestion => {
          const item = document.createElement('div');
          item.className = 'suggestion-item';
          item.textContent = suggestion;
          
          item.addEventListener('click', () => {
            input.value = suggestion;
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.remove('show');
          });
          
          suggestionsContainer.appendChild(item);
        });
        
        suggestionsContainer.classList.add('show');
      } else {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.classList.remove('show');
      }
    }, 300));
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.classList.remove('show');
      }
    });
  });
}

/**
 * Get mock search suggestions
 * @param {string} query Search query
 * @returns {string[]} Array of suggestions
 */
function getMockSuggestions(query) {
  const allSuggestions = [
    'OSINT techniques for social media',
    'How to find someone\'s email address',
    'Domain analysis tools',
    'IP geolocation lookup',
    'Username search across platforms',
    'Email breach check',
    'Reverse image search techniques',
    'WHOIS lookup tools',
    'Social media profile finder',
    'Phone number lookup tools'
  ];
  
  return allSuggestions.filter(suggestion => 
    suggestion.toLowerCase().includes(query.toLowerCase())
  );
}

/**
 * Initialize notification system
 */
function initNotifications() {
  // Create notifications container if it doesn't exist
  let notificationsContainer = document.querySelector('.notifications-container');
  
  if (!notificationsContainer) {
    notificationsContainer = document.createElement('div');
    notificationsContainer.className = 'notifications-container';
    document.body.appendChild(notificationsContainer);
  }
  
  // Expose notification methods globally
  window.MagicUI = window.MagicUI || {};
  window.MagicUI.notify = {
    success: (message, duration = 3000) => showNotification(message, 'success', duration),
    error: (message, duration = 5000) => showNotification(message, 'error', duration),
    info: (message, duration = 4000) => showNotification(message, 'info', duration),
    warning: (message, duration = 4000) => showNotification(message, 'warning', duration)
  };
}

/**
 * Show a notification
 * @param {string} message Notification message
 * @param {string} type Notification type (success, error, info, warning)
 * @param {number} duration Duration in milliseconds
 */
function showNotification(message, type, duration) {
  const container = document.querySelector('.notifications-container');
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type} animate-slide-in`;
  
  const icon = document.createElement('div');
  icon.className = 'notification-icon';
  
  // Set icon based on type
  switch (type) {
    case 'success':
      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>';
      break;
    case 'error':
      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"/></svg>';
      break;
    case 'info':
      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-.001 5.75c.69 0 1.251.56 1.251 1.25s-.561 1.25-1.251 1.25-1.249-.56-1.249-1.25.559-1.25 1.249-1.25zm2.001 12.25h-4v-1c.484-.179 1-.201 1-.735v-4.467c0-.534-.516-.618-1-.797v-1h3v6.265c0 .535.517.558 1 .735v.999z"/></svg>';
      break;
    case 'warning':
      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 5.177l8.631 15.823h-17.262l8.631-15.823zm0-4.177l-12 22h24l-12-22zm-1 9h2v6h-2v-6zm1 9.75c-.689 0-1.25-.56-1.25-1.25s.561-1.25 1.25-1.25 1.25.56 1.25 1.25-.561 1.25-1.25 1.25z"/></svg>';
      break;
  }
  
  const content = document.createElement('div');
  content.className = 'notification-content';
  content.textContent = message;
  
  const closeButton = document.createElement('button');
  closeButton.className = 'notification-close';
  closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"/></svg>';
  
  notification.appendChild(icon);
  notification.appendChild(content);
  notification.appendChild(closeButton);
  
  container.appendChild(notification);
  
  // Remove notification after duration
  const timeout = setTimeout(() => {
    removeNotification(notification);
  }, duration);
  
  // Remove notification on close button click
  closeButton.addEventListener('click', () => {
    clearTimeout(timeout);
    removeNotification(notification);
  });
}

/**
 * Remove a notification with animation
 * @param {HTMLElement} notification Notification element to remove
 */
function removeNotification(notification) {
  notification.classList.add('fade-out');
  
  setTimeout(() => {
    notification.remove();
  }, 300);
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func Function to debounce
 * @param {number} wait Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
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
