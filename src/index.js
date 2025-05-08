/**
 * Ultimate OSINT Framework - Main Entry Point
 * 
 * This file serves as the main entry point for the OSINT Framework application.
 * It initializes the application, sets up MCP servers, and starts the server.
 */

// Load environment variables
require('dotenv').config();

// Import configuration
const appConfig = require('../config/app.config');
const mcpConfig = require('../config/mcp.config');

// Import core modules
const express = require('express');
const path = require('path');
const winston = require('winston');

// Import MCP service initializers
const { initTaskmaster } = require('./services/mcp/taskmaster.service');
const { initContext7 } = require('./services/mcp/context7.service');
const { initMagicUI } = require('./services/mcp/magicui.service');
const { initOpenRouter } = require('./services/mcp/openrouter.service');

// Import core services
const { initLogger } = require('./utils/logger');
const { initSecurity } = require('./utils/security');

// Initialize logger
const logger = initLogger(appConfig.logging);

/**
 * Initialize MCP servers
 * @returns {Promise<Object>} Initialized MCP services
 */
async function initializeMCPServers() {
  logger.info('Initializing MCP servers...');
  
  try {
    // Initialize MCP servers in order of priority
    const taskmaster = mcpConfig.servers.taskmaster.enabled 
      ? await initTaskmaster(mcpConfig.servers.taskmaster)
      : null;
    
    const context7 = mcpConfig.servers.context7.enabled 
      ? await initContext7(mcpConfig.servers.context7)
      : null;
    
    const magicUI = mcpConfig.servers.magicUI.enabled 
      ? await initMagicUI(mcpConfig.servers.magicUI)
      : null;
    
    const openRouter = mcpConfig.servers.openRouter.enabled 
      ? await initOpenRouter(mcpConfig.servers.openRouter)
      : null;
    
    logger.info('MCP servers initialized successfully');
    
    return {
      taskmaster,
      context7,
      magicUI,
      openRouter
    };
  } catch (error) {
    logger.error('Failed to initialize MCP servers', { error: error.message, stack: error.stack });
    throw error;
  }
}

/**
 * Initialize Express server
 * @param {Object} mcpServices Initialized MCP services
 * @returns {Object} Express app
 */
function initializeServer(mcpServices) {
  logger.info('Initializing server...');
  
  try {
    const app = express();
    
    // Apply security middleware
    initSecurity(app, appConfig.security);
    
    // Serve static files
    app.use(express.static(path.join(__dirname, '../public')));
    
    // Parse JSON and URL-encoded bodies
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Set up API routes
    app.use('/api', require('./api')(mcpServices));
    
    // Serve index.html for all other routes (SPA support)
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });
    
    logger.info('Server initialized successfully');
    
    return app;
  } catch (error) {
    logger.error('Failed to initialize server', { error: error.message, stack: error.stack });
    throw error;
  }
}

/**
 * Start the application
 */
async function startApplication() {
  logger.info('Starting Ultimate OSINT Framework...');
  logger.info(`Environment: ${appConfig.app.environment}`);
  logger.info(`Version: ${appConfig.app.version}`);
  
  try {
    // Initialize MCP servers
    const mcpServices = await initializeMCPServers();
    
    // Initialize server
    const app = initializeServer(mcpServices);
    
    // Start server
    const port = appConfig.server.port;
    const host = appConfig.server.host;
    
    app.listen(port, host, () => {
      logger.info(`Server running at http://${host}:${port}`);
    });
  } catch (error) {
    logger.error('Failed to start application', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Start the application
if (require.main === module) {
  startApplication();
}

// Export for testing
module.exports = {
  initializeMCPServers,
  initializeServer,
  startApplication
};
