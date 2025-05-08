/**
 * Taskmaster MCP Service
 * 
 * This file provides integration with the Taskmaster MCP server for task management.
 * It follows the Vibe Coding guidelines for MCP integration.
 */

const axios = require('axios');
const { initLogger } = require('../../utils/logger');

// Initialize logger
const logger = initLogger({ level: 'info', console: { enabled: true } });

// Taskmaster client instance
let taskmasterClient = null;

/**
 * Initialize the Taskmaster MCP service
 * @param {Object} config Taskmaster configuration
 * @returns {Object} Taskmaster client
 */
async function initTaskmaster(config) {
  logger.info('Initializing Taskmaster MCP service...');
  
  try {
    if (!config.enabled) {
      logger.warn('Taskmaster MCP service is disabled');
      return null;
    }
    
    if (!config.apiKey) {
      logger.error('Taskmaster API key is missing');
      throw new Error('Taskmaster API key is required');
    }
    
    // Create Axios instance for Taskmaster
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
        logger.debug(`Taskmaster request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Taskmaster request error', { error: error.message });
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for logging
    client.interceptors.response.use(
      (response) => {
        logger.debug(`Taskmaster response: ${response.status}`);
        return response;
      },
      (error) => {
        if (error.response) {
          logger.error('Taskmaster response error', {
            status: error.response.status,
            data: error.response.data
          });
        } else {
          logger.error('Taskmaster network error', { error: error.message });
        }
        return Promise.reject(error);
      }
    );
    
    // Test connection
    const response = await client.get('/health');
    
    if (response.status !== 200) {
      throw new Error(`Failed to connect to Taskmaster: ${response.status} ${response.statusText}`);
    }
    
    logger.info('Taskmaster MCP service initialized successfully');
    
    // Create Taskmaster client
    taskmasterClient = {
      // Core task management
      
      /**
       * Create a new task
       * @param {Object} task Task data
       * @returns {Object} Created task
       */
      async createTask(task) {
        logger.debug('Creating task', { task });
        
        const response = await client.post('/tasks', task);
        return response.data;
      },
      
      /**
       * Get a task by ID
       * @param {string} taskId Task ID
       * @returns {Object} Task data
       */
      async getTask(taskId) {
        logger.debug('Getting task', { taskId });
        
        const response = await client.get(`/tasks/${taskId}`);
        return response.data;
      },
      
      /**
       * Update a task
       * @param {string} taskId Task ID
       * @param {Object} updates Task updates
       * @returns {Object} Updated task
       */
      async updateTask(taskId, updates) {
        logger.debug('Updating task', { taskId, updates });
        
        const response = await client.put(`/tasks/${taskId}`, updates);
        return response.data;
      },
      
      /**
       * Delete a task
       * @param {string} taskId Task ID
       * @returns {boolean} Success status
       */
      async deleteTask(taskId) {
        logger.debug('Deleting task', { taskId });
        
        const response = await client.delete(`/tasks/${taskId}`);
        return response.status === 204;
      },
      
      /**
       * List tasks with optional filters
       * @param {Object} filters Task filters
       * @returns {Array} List of tasks
       */
      async listTasks(filters = {}) {
        logger.debug('Listing tasks', { filters });
        
        const response = await client.get('/tasks', { params: filters });
        return response.data;
      },
      
      // Workflow management
      
      /**
       * Create a new workflow
       * @param {Object} workflow Workflow data
       * @returns {Object} Created workflow
       */
      async createWorkflow(workflow) {
        logger.debug('Creating workflow', { workflow });
        
        const response = await client.post('/workflows', workflow);
        return response.data;
      },
      
      /**
       * Get a workflow by ID
       * @param {string} workflowId Workflow ID
       * @returns {Object} Workflow data
       */
      async getWorkflow(workflowId) {
        logger.debug('Getting workflow', { workflowId });
        
        const response = await client.get(`/workflows/${workflowId}`);
        return response.data;
      },
      
      /**
       * Start a workflow
       * @param {string} workflowId Workflow ID
       * @param {Object} params Workflow parameters
       * @returns {Object} Workflow instance
       */
      async startWorkflow(workflowId, params = {}) {
        logger.debug('Starting workflow', { workflowId, params });
        
        const response = await client.post(`/workflows/${workflowId}/start`, params);
        return response.data;
      },
      
      /**
       * Get workflow instance status
       * @param {string} instanceId Workflow instance ID
       * @returns {Object} Workflow instance status
       */
      async getWorkflowStatus(instanceId) {
        logger.debug('Getting workflow status', { instanceId });
        
        const response = await client.get(`/workflow-instances/${instanceId}`);
        return response.data;
      },
      
      // OSINT-specific methods
      
      /**
       * Create an OSINT investigation
       * @param {Object} investigation Investigation data
       * @returns {Object} Created investigation
       */
      async createInvestigation(investigation) {
        logger.debug('Creating OSINT investigation', { investigation });
        
        const response = await client.post('/osint/investigations', investigation);
        return response.data;
      },
      
      /**
       * Get an OSINT investigation by ID
       * @param {string} investigationId Investigation ID
       * @returns {Object} Investigation data
       */
      async getInvestigation(investigationId) {
        logger.debug('Getting OSINT investigation', { investigationId });
        
        const response = await client.get(`/osint/investigations/${investigationId}`);
        return response.data;
      },
      
      /**
       * Add a finding to an investigation
       * @param {string} investigationId Investigation ID
       * @param {Object} finding Finding data
       * @returns {Object} Created finding
       */
      async addFinding(investigationId, finding) {
        logger.debug('Adding finding to investigation', { investigationId, finding });
        
        const response = await client.post(`/osint/investigations/${investigationId}/findings`, finding);
        return response.data;
      },
      
      /**
       * Generate an investigation report
       * @param {string} investigationId Investigation ID
       * @param {Object} options Report options
       * @returns {Object} Generated report
       */
      async generateReport(investigationId, options = {}) {
        logger.debug('Generating investigation report', { investigationId, options });
        
        const response = await client.post(`/osint/investigations/${investigationId}/report`, options);
        return response.data;
      }
    };
    
    return taskmasterClient;
  } catch (error) {
    logger.error('Failed to initialize Taskmaster MCP service', { error: error.message, stack: error.stack });
    throw error;
  }
}

/**
 * Get the Taskmaster client instance
 * @returns {Object} Taskmaster client
 */
function getTaskmasterClient() {
  if (!taskmasterClient) {
    logger.warn('Taskmaster client not initialized');
    return null;
  }
  
  return taskmasterClient;
}

module.exports = {
  initTaskmaster,
  getTaskmasterClient
};
