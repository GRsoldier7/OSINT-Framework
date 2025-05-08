/**
 * MagicUI MCP Service
 * 
 * This file provides integration with the MagicUI MCP server for UI components.
 * It follows the Vibe Coding guidelines for MCP integration.
 */

const axios = require('axios');
const { initLogger } = require('../../utils/logger');

// Initialize logger
const logger = initLogger({ level: 'info', console: { enabled: true } });

// MagicUI client instance
let magicUIClient = null;

/**
 * Initialize the MagicUI MCP service
 * @param {Object} config MagicUI configuration
 * @returns {Object} MagicUI client
 */
async function initMagicUI(config) {
  logger.info('Initializing MagicUI MCP service...');
  
  try {
    if (!config.enabled) {
      logger.warn('MagicUI MCP service is disabled');
      return null;
    }
    
    if (!config.apiKey) {
      logger.error('MagicUI API key is missing');
      throw new Error('MagicUI API key is required');
    }
    
    // Create Axios instance for MagicUI
    const client = axios.create({
      baseURL: config.serverUrl,
      timeout: config.connection.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      }
    });
    
    // Add request interceptor for logging
    client.interceptors.request.use(
      (config) => {
        logger.debug(`MagicUI request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('MagicUI request error', { error: error.message });
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for logging
    client.interceptors.response.use(
      (response) => {
        logger.debug(`MagicUI response: ${response.status}`);
        return response;
      },
      (error) => {
        if (error.response) {
          logger.error('MagicUI response error', {
            status: error.response.status,
            data: error.response.data
          });
        } else {
          logger.error('MagicUI network error', { error: error.message });
        }
        return Promise.reject(error);
      }
    );
    
    // Test connection
    const response = await client.get('/health');
    
    if (response.status !== 200) {
      throw new Error(`Failed to connect to MagicUI: ${response.status} ${response.statusText}`);
    }
    
    logger.info('MagicUI MCP service initialized successfully');
    
    // Create MagicUI client
    magicUIClient = {
      // Theme management
      
      /**
       * Get available themes
       * @returns {Array} Available themes
       */
      async getThemes() {
        logger.debug('Getting available themes');
        
        const response = await client.get('/themes');
        return response.data;
      },
      
      /**
       * Get a theme by ID
       * @param {string} themeId Theme ID
       * @returns {Object} Theme data
       */
      async getTheme(themeId) {
        logger.debug('Getting theme', { themeId });
        
        const response = await client.get(`/themes/${themeId}`);
        return response.data;
      },
      
      /**
       * Create a custom theme
       * @param {Object} theme Theme data
       * @returns {Object} Created theme
       */
      async createTheme(theme) {
        logger.debug('Creating custom theme', { theme });
        
        const response = await client.post('/themes', theme);
        return response.data;
      },
      
      // Component management
      
      /**
       * Get available components
       * @param {string} category Component category
       * @returns {Array} Available components
       */
      async getComponents(category) {
        logger.debug('Getting available components', { category });
        
        const url = category ? `/components?category=${category}` : '/components';
        const response = await client.get(url);
        
        return response.data;
      },
      
      /**
       * Get a component by ID
       * @param {string} componentId Component ID
       * @returns {Object} Component data
       */
      async getComponent(componentId) {
        logger.debug('Getting component', { componentId });
        
        const response = await client.get(`/components/${componentId}`);
        return response.data;
      },
      
      /**
       * Get component props
       * @param {string} componentId Component ID
       * @returns {Object} Component props
       */
      async getComponentProps(componentId) {
        logger.debug('Getting component props', { componentId });
        
        const response = await client.get(`/components/${componentId}/props`);
        return response.data;
      },
      
      // Layout management
      
      /**
       * Get available layouts
       * @returns {Array} Available layouts
       */
      async getLayouts() {
        logger.debug('Getting available layouts');
        
        const response = await client.get('/layouts');
        return response.data;
      },
      
      /**
       * Get a layout by ID
       * @param {string} layoutId Layout ID
       * @returns {Object} Layout data
       */
      async getLayout(layoutId) {
        logger.debug('Getting layout', { layoutId });
        
        const response = await client.get(`/layouts/${layoutId}`);
        return response.data;
      },
      
      /**
       * Create a custom layout
       * @param {Object} layout Layout data
       * @returns {Object} Created layout
       */
      async createLayout(layout) {
        logger.debug('Creating custom layout', { layout });
        
        const response = await client.post('/layouts', layout);
        return response.data;
      },
      
      // Visualization management
      
      /**
       * Get available visualizations
       * @param {string} category Visualization category
       * @returns {Array} Available visualizations
       */
      async getVisualizations(category) {
        logger.debug('Getting available visualizations', { category });
        
        const url = category ? `/visualizations?category=${category}` : '/visualizations';
        const response = await client.get(url);
        
        return response.data;
      },
      
      /**
       * Get a visualization by ID
       * @param {string} visualizationId Visualization ID
       * @returns {Object} Visualization data
       */
      async getVisualization(visualizationId) {
        logger.debug('Getting visualization', { visualizationId });
        
        const response = await client.get(`/visualizations/${visualizationId}`);
        return response.data;
      },
      
      /**
       * Create a visualization
       * @param {string} type Visualization type
       * @param {Object} data Visualization data
       * @param {Object} options Visualization options
       * @returns {Object} Visualization result
       */
      async createVisualization(type, data, options = {}) {
        logger.debug('Creating visualization', { type, data, options });
        
        const response = await client.post(`/visualizations/${type}`, {
          data,
          options
        });
        
        return response.data;
      },
      
      // OSINT-specific UI components
      
      /**
       * Get OSINT search bar component
       * @param {Object} props Component props
       * @returns {Object} Component data
       */
      async getOsintSearchBar(props = {}) {
        logger.debug('Getting OSINT search bar component', { props });
        
        const response = await client.get('/osint/components/search-bar', {
          params: props
        });
        
        return response.data;
      },
      
      /**
       * Get OSINT results grid component
       * @param {Object} props Component props
       * @returns {Object} Component data
       */
      async getOsintResultsGrid(props = {}) {
        logger.debug('Getting OSINT results grid component', { props });
        
        const response = await client.get('/osint/components/results-grid', {
          params: props
        });
        
        return response.data;
      },
      
      /**
       * Get OSINT data visualization component
       * @param {string} type Visualization type
       * @param {Object} props Component props
       * @returns {Object} Component data
       */
      async getOsintDataVisualization(type, props = {}) {
        logger.debug('Getting OSINT data visualization component', { type, props });
        
        const response = await client.get(`/osint/components/visualization/${type}`, {
          params: props
        });
        
        return response.data;
      },
      
      /**
       * Create an OSINT dashboard
       * @param {Object} config Dashboard configuration
       * @returns {Object} Dashboard data
       */
      async createOsintDashboard(config) {
        logger.debug('Creating OSINT dashboard', { config });
        
        const response = await client.post('/osint/dashboards', config);
        return response.data;
      }
    };
    
    return magicUIClient;
  } catch (error) {
    logger.error('Failed to initialize MagicUI MCP service', { error: error.message, stack: error.stack });
    throw error;
  }
}

/**
 * Get the MagicUI client instance
 * @returns {Object} MagicUI client
 */
function getMagicUIClient() {
  if (!magicUIClient) {
    logger.warn('MagicUI client not initialized');
    return null;
  }
  
  return magicUIClient;
}

module.exports = {
  initMagicUI,
  getMagicUIClient
};
