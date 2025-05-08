/**
 * Ultimate OSINT Framework - Main JavaScript
 * 
 * This file contains the main JavaScript code for the OSINT Framework application.
 * It follows the Vibe Coding guidelines for JavaScript organization and naming.
 */

// Use strict mode to catch common coding mistakes
'use strict';

// OSINT Framework namespace
const OSINT = {
  // Configuration
  config: {
    debug: false,
    theme: 'light',
    apiBaseUrl: '/api',
    defaultTimeout: 30000,
    maxConcurrentRequests: 5
  },
  
  // State
  state: {
    initialized: false,
    loading: true,
    user: null,
    currentTool: null,
    searchHistory: [],
    activeRequests: 0
  },
  
  // DOM elements
  elements: {},
  
  // Event handlers
  handlers: {},
  
  // Utilities
  utils: {
    /**
     * Log a message to the console (only in debug mode)
     * @param {string} message Message to log
     * @param {*} data Additional data to log
     * @param {string} level Log level ('log', 'info', 'warn', 'error')
     */
    log(message, data = null, level = 'log') {
      if (OSINT.config.debug) {
        const timestamp = new Date().toISOString();
        const prefix = `[OSINT ${timestamp}]`;
        
        if (data) {
          console[level](prefix, message, data);
        } else {
          console[level](prefix, message);
        }
      }
    },
    
    /**
     * Show an error message
     * @param {string} message Error message
     * @param {Error} error Error object
     */
    showError(message, error = null) {
      OSINT.utils.log(message, error, 'error');
      
      // Create error notification
      const notification = document.createElement('div');
      notification.className = 'notification notification-error';
      notification.innerHTML = `
        <div class="notification-icon">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <div class="notification-content">
          <h4>Error</h4>
          <p>${message}</p>
          ${error ? `<p class="notification-details">${error.message}</p>` : ''}
        </div>
        <button class="notification-close">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      // Add close button handler
      notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
      });
      
      // Add to notifications container
      const notificationsContainer = document.querySelector('.notifications-container') || document.body;
      notificationsContainer.appendChild(notification);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        notification.remove();
      }, 5000);
    },
    
    /**
     * Show a success message
     * @param {string} message Success message
     */
    showSuccess(message) {
      OSINT.utils.log(message, null, 'info');
      
      // Create success notification
      const notification = document.createElement('div');
      notification.className = 'notification notification-success';
      notification.innerHTML = `
        <div class="notification-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="notification-content">
          <h4>Success</h4>
          <p>${message}</p>
        </div>
        <button class="notification-close">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      // Add close button handler
      notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
      });
      
      // Add to notifications container
      const notificationsContainer = document.querySelector('.notifications-container') || document.body;
      notificationsContainer.appendChild(notification);
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        notification.remove();
      }, 3000);
    },
    
    /**
     * Make an API request
     * @param {string} endpoint API endpoint
     * @param {Object} options Request options
     * @returns {Promise} Promise that resolves with the response data
     */
    async apiRequest(endpoint, options = {}) {
      const url = `${OSINT.config.apiBaseUrl}${endpoint}`;
      const method = options.method || 'GET';
      
      const requestOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        credentials: 'same-origin'
      };
      
      // Add request body if provided
      if (options.body) {
        requestOptions.body = JSON.stringify(options.body);
      }
      
      // Add request timeout
      const timeout = options.timeout || OSINT.config.defaultTimeout;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      requestOptions.signal = controller.signal;
      
      try {
        // Track active requests
        OSINT.state.activeRequests++;
        
        // Make the request
        const response = await fetch(url, requestOptions);
        
        // Clear timeout
        clearTimeout(timeoutId);
        
        // Check if response is OK
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `API request failed with status ${response.status}`);
        }
        
        // Parse response
        const data = await response.json();
        
        return data;
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error(`API request timed out after ${timeout}ms`);
        }
        
        throw error;
      } finally {
        // Decrement active requests
        OSINT.state.activeRequests--;
      }
    },
    
    /**
     * Load a tool module
     * @param {string} toolId Tool ID
     * @returns {Promise} Promise that resolves when the tool is loaded
     */
    async loadTool(toolId) {
      OSINT.utils.log(`Loading tool: ${toolId}`);
      
      try {
        // Set loading state
        OSINT.state.loading = true;
        
        // Load tool module
        const toolModule = await import(`/js/tools/${toolId}.js`);
        
        // Initialize tool
        OSINT.state.currentTool = toolModule.default;
        
        // Render tool
        const appElement = document.getElementById('app');
        appElement.innerHTML = OSINT.state.currentTool.render();
        
        // Initialize tool
        OSINT.state.currentTool.init();
        
        // Update loading state
        OSINT.state.loading = false;
        
        // Update URL
        history.pushState({ toolId }, `OSINT - ${toolId}`, `/${toolId}`);
        
        return toolModule.default;
      } catch (error) {
        OSINT.utils.showError(`Failed to load tool: ${toolId}`, error);
        OSINT.state.loading = false;
        throw error;
      }
    },
    
    /**
     * Save data to local storage
     * @param {string} key Storage key
     * @param {*} data Data to save
     */
    saveToStorage(key, data) {
      try {
        localStorage.setItem(`osint_${key}`, JSON.stringify(data));
      } catch (error) {
        OSINT.utils.log(`Failed to save to storage: ${key}`, error, 'error');
      }
    },
    
    /**
     * Load data from local storage
     * @param {string} key Storage key
     * @param {*} defaultValue Default value if key doesn't exist
     * @returns {*} Loaded data or default value
     */
    loadFromStorage(key, defaultValue = null) {
      try {
        const data = localStorage.getItem(`osint_${key}`);
        return data ? JSON.parse(data) : defaultValue;
      } catch (error) {
        OSINT.utils.log(`Failed to load from storage: ${key}`, error, 'error');
        return defaultValue;
      }
    },
    
    /**
     * Format a date
     * @param {string|Date} date Date to format
     * @param {string} format Format string
     * @returns {string} Formatted date
     */
    formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
      const d = new Date(date);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      
      return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
    }
  },
  
  // API methods
  api: {
    /**
     * Get search engines
     * @returns {Promise} Promise that resolves with search engines data
     */
    async getSearchEngines() {
      return OSINT.utils.apiRequest('/search-engines');
    },
    
    /**
     * Perform a search
     * @param {string} query Search query
     * @param {Array} engines Search engines to use
     * @returns {Promise} Promise that resolves with search results
     */
    async search(query, engines) {
      return OSINT.utils.apiRequest('/search', {
        method: 'POST',
        body: { query, engines }
      });
    },
    
    /**
     * Search for a username
     * @param {string} username Username to search for
     * @param {Array} platforms Platforms to search on
     * @returns {Promise} Promise that resolves with username search results
     */
    async searchUsername(username, platforms) {
      return OSINT.utils.apiRequest('/username-search', {
        method: 'POST',
        body: { username, platforms }
      });
    },
    
    /**
     * Analyze an email address
     * @param {string} email Email address to analyze
     * @param {Array} services Services to use for analysis
     * @returns {Promise} Promise that resolves with email analysis results
     */
    async analyzeEmail(email, services) {
      return OSINT.utils.apiRequest('/email-analysis', {
        method: 'POST',
        body: { email, services }
      });
    },
    
    /**
     * Analyze a domain
     * @param {string} domain Domain to analyze
     * @param {Array} services Services to use for analysis
     * @returns {Promise} Promise that resolves with domain analysis results
     */
    async analyzeDomain(domain, services) {
      return OSINT.utils.apiRequest('/domain-analysis', {
        method: 'POST',
        body: { domain, services }
      });
    },
    
    /**
     * Analyze an IP address
     * @param {string} ip IP address to analyze
     * @param {Array} services Services to use for analysis
     * @returns {Promise} Promise that resolves with IP analysis results
     */
    async analyzeIP(ip, services) {
      return OSINT.utils.apiRequest('/ip-analysis', {
        method: 'POST',
        body: { ip, services }
      });
    }
  },
  
  // Initialization
  init() {
    OSINT.utils.log('Initializing OSINT Framework');
    
    try {
      // Load configuration from storage
      const storedConfig = OSINT.utils.loadFromStorage('config');
      if (storedConfig) {
        OSINT.config = { ...OSINT.config, ...storedConfig };
      }
      
      // Load state from storage
      const storedState = OSINT.utils.loadFromStorage('state');
      if (storedState) {
        OSINT.state = { ...OSINT.state, ...storedState };
      }
      
      // Cache DOM elements
      OSINT.elements.app = document.getElementById('app');
      
      // Set up event handlers
      window.addEventListener('popstate', OSINT.handlers.handlePopState);
      
      // Set theme
      document.documentElement.setAttribute('data-theme', OSINT.config.theme);
      
      // Load initial tool based on URL
      const path = window.location.pathname.substring(1);
      const toolId = path || 'dashboard';
      
      OSINT.utils.loadTool(toolId).catch(() => {
        // Fallback to dashboard if tool loading fails
        OSINT.utils.loadTool('dashboard');
      });
      
      // Mark as initialized
      OSINT.state.initialized = true;
      OSINT.state.loading = false;
      
      OSINT.utils.log('OSINT Framework initialized');
    } catch (error) {
      OSINT.utils.log('Failed to initialize OSINT Framework', error, 'error');
      OSINT.utils.showError('Failed to initialize application', error);
    }
  }
};

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  OSINT.init();
});
