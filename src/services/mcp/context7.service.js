/**
 * Context7 MCP Service
 * 
 * This file provides integration with the Context7 MCP server for contextual intelligence.
 * It follows the Vibe Coding guidelines for MCP integration.
 */

const axios = require('axios');
const { initLogger } = require('../../utils/logger');

// Initialize logger
const logger = initLogger({ level: 'info', console: { enabled: true } });

// Context7 client instance
let context7Client = null;

/**
 * Initialize the Context7 MCP service
 * @param {Object} config Context7 configuration
 * @returns {Object} Context7 client
 */
async function initContext7(config) {
  logger.info('Initializing Context7 MCP service...');
  
  try {
    if (!config.enabled) {
      logger.warn('Context7 MCP service is disabled');
      return null;
    }
    
    if (!config.apiKey) {
      logger.error('Context7 API key is missing');
      throw new Error('Context7 API key is required');
    }
    
    // Create Axios instance for Context7
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
        logger.debug(`Context7 request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Context7 request error', { error: error.message });
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for logging
    client.interceptors.response.use(
      (response) => {
        logger.debug(`Context7 response: ${response.status}`);
        return response;
      },
      (error) => {
        if (error.response) {
          logger.error('Context7 response error', {
            status: error.response.status,
            data: error.response.data
          });
        } else {
          logger.error('Context7 network error', { error: error.message });
        }
        return Promise.reject(error);
      }
    );
    
    // Test connection
    const response = await client.get('/health');
    
    if (response.status !== 200) {
      throw new Error(`Failed to connect to Context7: ${response.status} ${response.statusText}`);
    }
    
    logger.info('Context7 MCP service initialized successfully');
    
    // Create Context7 client
    context7Client = {
      // Core context management
      
      /**
       * Create a new context
       * @param {string} namespace Context namespace
       * @param {Object} context Context data
       * @returns {Object} Created context
       */
      async createContext(namespace, context) {
        logger.debug('Creating context', { namespace, context });
        
        const response = await client.post(`/contexts/${namespace}`, context);
        return response.data;
      },
      
      /**
       * Get a context by ID
       * @param {string} namespace Context namespace
       * @param {string} contextId Context ID
       * @returns {Object} Context data
       */
      async getContext(namespace, contextId) {
        logger.debug('Getting context', { namespace, contextId });
        
        const response = await client.get(`/contexts/${namespace}/${contextId}`);
        return response.data;
      },
      
      /**
       * Update a context
       * @param {string} namespace Context namespace
       * @param {string} contextId Context ID
       * @param {Object} updates Context updates
       * @returns {Object} Updated context
       */
      async updateContext(namespace, contextId, updates) {
        logger.debug('Updating context', { namespace, contextId, updates });
        
        const response = await client.put(`/contexts/${namespace}/${contextId}`, updates);
        return response.data;
      },
      
      /**
       * Delete a context
       * @param {string} namespace Context namespace
       * @param {string} contextId Context ID
       * @returns {boolean} Success status
       */
      async deleteContext(namespace, contextId) {
        logger.debug('Deleting context', { namespace, contextId });
        
        const response = await client.delete(`/contexts/${namespace}/${contextId}`);
        return response.status === 204;
      },
      
      // Knowledge base management
      
      /**
       * Search the knowledge base
       * @param {string} namespace Knowledge base namespace
       * @param {string} query Search query
       * @param {Object} options Search options
       * @returns {Object} Search results
       */
      async search(namespace, query, options = {}) {
        logger.debug('Searching knowledge base', { namespace, query, options });
        
        const response = await client.post(`/search/${namespace}`, {
          query,
          ...options
        });
        
        return response.data;
      },
      
      /**
       * Add a document to the knowledge base
       * @param {string} namespace Knowledge base namespace
       * @param {Object} document Document data
       * @returns {Object} Added document
       */
      async addDocument(namespace, document) {
        logger.debug('Adding document to knowledge base', { namespace, document });
        
        const response = await client.post(`/documents/${namespace}`, document);
        return response.data;
      },
      
      /**
       * Get a document from the knowledge base
       * @param {string} namespace Knowledge base namespace
       * @param {string} documentId Document ID
       * @returns {Object} Document data
       */
      async getDocument(namespace, documentId) {
        logger.debug('Getting document from knowledge base', { namespace, documentId });
        
        const response = await client.get(`/documents/${namespace}/${documentId}`);
        return response.data;
      },
      
      /**
       * Delete a document from the knowledge base
       * @param {string} namespace Knowledge base namespace
       * @param {string} documentId Document ID
       * @returns {boolean} Success status
       */
      async deleteDocument(namespace, documentId) {
        logger.debug('Deleting document from knowledge base', { namespace, documentId });
        
        const response = await client.delete(`/documents/${namespace}/${documentId}`);
        return response.status === 204;
      },
      
      // OSINT-specific methods
      
      /**
       * Get OSINT techniques
       * @param {string} category Technique category
       * @param {Object} options Query options
       * @returns {Array} OSINT techniques
       */
      async getOsintTechniques(category, options = {}) {
        logger.debug('Getting OSINT techniques', { category, options });
        
        const response = await client.get(`/osint/techniques/${category}`, {
          params: options
        });
        
        return response.data;
      },
      
      /**
       * Get search engine operators
       * @param {string} engine Search engine name
       * @returns {Array} Search engine operators
       */
      async getSearchEngineOperators(engine) {
        logger.debug('Getting search engine operators', { engine });
        
        const response = await client.get(`/osint/search-engines/${engine}/operators`);
        return response.data;
      },
      
      /**
       * Get social media investigation techniques
       * @param {string} platform Social media platform
       * @returns {Array} Social media investigation techniques
       */
      async getSocialMediaTechniques(platform) {
        logger.debug('Getting social media investigation techniques', { platform });
        
        const response = await client.get(`/osint/social-media/${platform}/techniques`);
        return response.data;
      },
      
      /**
       * Get domain investigation techniques
       * @returns {Array} Domain investigation techniques
       */
      async getDomainInvestigationTechniques() {
        logger.debug('Getting domain investigation techniques');
        
        const response = await client.get('/osint/domain-analysis/techniques');
        return response.data;
      },
      
      /**
       * Get email investigation techniques
       * @returns {Array} Email investigation techniques
       */
      async getEmailInvestigationTechniques() {
        logger.debug('Getting email investigation techniques');
        
        const response = await client.get('/osint/email-analysis/techniques');
        return response.data;
      },
      
      /**
       * Get OSINT resources
       * @param {string} category Resource category
       * @returns {Array} OSINT resources
       */
      async getOsintResources(category) {
        logger.debug('Getting OSINT resources', { category });
        
        const response = await client.get(`/osint/resources/${category}`);
        return response.data;
      }
    };
    
    return context7Client;
  } catch (error) {
    logger.error('Failed to initialize Context7 MCP service', { error: error.message, stack: error.stack });
    throw error;
  }
}

/**
 * Get the Context7 client instance
 * @returns {Object} Context7 client
 */
function getContext7Client() {
  if (!context7Client) {
    logger.warn('Context7 client not initialized');
    return null;
  }
  
  return context7Client;
}

module.exports = {
  initContext7,
  getContext7Client
};
