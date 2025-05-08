/**
 * Logger Utility
 * 
 * This file provides a centralized logging system for the OSINT Framework.
 * It follows the Vibe Coding guidelines for comprehensive logging.
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

/**
 * Initialize the logger with the specified configuration
 * @param {Object} config Logger configuration
 * @returns {Object} Configured Winston logger
 */
function initLogger(config) {
  // Create logs directory if it doesn't exist
  if (config.file && config.file.enabled) {
    const logDir = path.dirname(config.file.path);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }
  
  // Define log format
  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    config.format === 'json'
      ? winston.format.json()
      : winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : '';
          return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
        })
  );
  
  // Define transports
  const transports = [];
  
  // Console transport
  if (config.console && config.console.enabled) {
    transports.push(
      new winston.transports.Console({
        format: config.colorize
          ? winston.format.combine(winston.format.colorize(), logFormat)
          : logFormat
      })
    );
  }
  
  // File transport
  if (config.file && config.file.enabled) {
    transports.push(
      new winston.transports.File({
        filename: config.file.path,
        maxsize: config.file.maxSize,
        maxFiles: config.file.maxFiles,
        tailable: true,
        zippedArchive: config.file.compress
      })
    );
  }
  
  // Create logger
  const logger = winston.createLogger({
    level: config.level,
    format: logFormat,
    defaultMeta: { service: 'osint-framework' },
    transports,
    exitOnError: false
  });
  
  // Add custom logging methods
  
  /**
   * Log a debug message with context
   * @param {string} message Log message
   * @param {Object} context Additional context
   */
  logger.debugWithContext = (message, context = {}) => {
    logger.debug(message, { context });
  };
  
  /**
   * Log an info message with context
   * @param {string} message Log message
   * @param {Object} context Additional context
   */
  logger.infoWithContext = (message, context = {}) => {
    logger.info(message, { context });
  };
  
  /**
   * Log a warning message with context
   * @param {string} message Log message
   * @param {Object} context Additional context
   */
  logger.warnWithContext = (message, context = {}) => {
    logger.warn(message, { context });
  };
  
  /**
   * Log an error message with context
   * @param {string} message Log message
   * @param {Object} context Additional context
   * @param {Error} error Error object
   */
  logger.errorWithContext = (message, context = {}, error = null) => {
    const logContext = { ...context };
    
    if (error) {
      logContext.error = {
        message: error.message,
        stack: error.stack,
        name: error.name
      };
    }
    
    logger.error(message, logContext);
  };
  
  /**
   * Log the start of an operation
   * @param {string} operation Operation name
   * @param {Object} params Operation parameters
   */
  logger.startOperation = (operation, params = {}) => {
    logger.info(`Starting operation: ${operation}`, {
      operation,
      params,
      phase: 'start',
      timestamp: new Date().toISOString()
    });
  };
  
  /**
   * Log the end of an operation
   * @param {string} operation Operation name
   * @param {Object} result Operation result
   * @param {number} duration Operation duration in milliseconds
   */
  logger.endOperation = (operation, result = {}, duration = null) => {
    logger.info(`Completed operation: ${operation}`, {
      operation,
      result,
      phase: 'end',
      duration,
      timestamp: new Date().toISOString()
    });
  };
  
  /**
   * Log an API request
   * @param {Object} req Express request object
   * @param {string} source Source of the request
   */
  logger.logRequest = (req, source = 'api') => {
    logger.info(`${req.method} ${req.originalUrl}`, {
      type: 'request',
      source,
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      body: req.body,
      headers: req.headers,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  };
  
  /**
   * Log an API response
   * @param {Object} res Express response object
   * @param {Object} data Response data
   * @param {number} duration Response time in milliseconds
   */
  logger.logResponse = (res, data = {}, duration = null) => {
    logger.info(`Response: ${res.statusCode}`, {
      type: 'response',
      statusCode: res.statusCode,
      data,
      duration,
      timestamp: new Date().toISOString()
    });
  };
  
  return logger;
}

module.exports = {
  initLogger
};
