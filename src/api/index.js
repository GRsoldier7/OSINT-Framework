/**
 * API Routes
 * 
 * This file defines the API routes for the OSINT Framework.
 * It follows the Vibe Coding guidelines for API organization.
 */

const express = require('express');
const { initLogger } = require('../utils/logger');

// Initialize logger
const logger = initLogger({ level: 'info', console: { enabled: true } });

/**
 * Initialize API routes
 * @param {Object} mcpServices MCP services
 * @returns {Object} Express router
 */
function initializeAPI(mcpServices) {
  logger.info('Initializing API routes');
  
  const router = express.Router();
  
  // Middleware to log API requests
  router.use((req, res, next) => {
    logger.info(`API Request: ${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // Record start time
    req.startTime = Date.now();
    
    // Capture original send method
    const originalSend = res.send;
    
    // Override send method to log response
    res.send = function(body) {
      // Calculate request duration
      const duration = Date.now() - req.startTime;
      
      // Log response
      logger.info(`API Response: ${res.statusCode}`, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`
      });
      
      // Call original send method
      return originalSend.call(this, body);
    };
    
    next();
  });
  
  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        taskmaster: mcpServices.taskmaster ? 'available' : 'unavailable',
        context7: mcpServices.context7 ? 'available' : 'unavailable',
        magicUI: mcpServices.magicUI ? 'available' : 'unavailable',
        openRouter: mcpServices.openRouter ? 'available' : 'unavailable'
      }
    });
  });
  
  // Mount sub-routers
  router.use('/search', require('./routes/search')(mcpServices));
  router.use('/username-search', require('./routes/username-search')(mcpServices));
  router.use('/email-analysis', require('./routes/email-analysis')(mcpServices));
  router.use('/domain-analysis', require('./routes/domain-analysis')(mcpServices));
  router.use('/ip-analysis', require('./routes/ip-analysis')(mcpServices));
  router.use('/ai', require('./routes/ai')(mcpServices));
  
  // Error handling middleware
  router.use((err, req, res, next) => {
    logger.error('API Error', { error: err.message, stack: err.stack });
    
    res.status(err.status || 500).json({
      error: {
        message: err.message || 'Internal Server Error',
        status: err.status || 500,
        code: err.code || 'INTERNAL_ERROR'
      }
    });
  });
  
  logger.info('API routes initialized');
  
  return router;
}

module.exports = initializeAPI;
