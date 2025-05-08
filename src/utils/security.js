/**
 * Security Utility
 * 
 * This file provides security-related utilities for the OSINT Framework.
 * It follows the Vibe Coding guidelines for robust security.
 */

const { initLogger } = require('./logger');
const logger = initLogger({ level: 'info', console: { enabled: true } });

/**
 * Initialize security middleware for Express
 * @param {Object} app Express app
 * @param {Object} config Security configuration
 */
function initSecurity(app, config) {
  logger.info('Initializing security middleware...');
  
  try {
    // CORS middleware
    if (config.cors && config.cors.enabled) {
      const cors = require('cors');
      
      const corsOptions = {
        origin: config.cors.origins,
        methods: config.cors.methods,
        credentials: config.cors.allowCredentials,
        maxAge: 86400 // 24 hours
      };
      
      app.use(cors(corsOptions));
      logger.info('CORS middleware initialized');
    }
    
    // Content Security Policy
    if (config.contentSecurity && config.contentSecurity.enabled) {
      const helmet = require('helmet');
      
      app.use(
        helmet.contentSecurityPolicy({
          directives: config.contentSecurity.directives
        })
      );
      
      logger.info('Content Security Policy initialized');
    }
    
    // XSS Protection
    if (config.xss && config.xss.enabled) {
      const helmet = require('helmet');
      
      app.use(helmet.xssFilter());
      
      logger.info('XSS Protection initialized');
    }
    
    // Frame Options
    if (config.frameOptions && config.frameOptions.enabled) {
      const helmet = require('helmet');
      
      app.use(
        helmet.frameguard({
          action: config.frameOptions.action
        })
      );
      
      logger.info('Frame Options initialized');
    }
    
    // Referrer Policy
    if (config.referrerPolicy && config.referrerPolicy.enabled) {
      const helmet = require('helmet');
      
      app.use(
        helmet.referrerPolicy({
          policy: config.referrerPolicy.policy
        })
      );
      
      logger.info('Referrer Policy initialized');
    }
    
    // Add request validation middleware
    app.use(validateRequest);
    
    logger.info('Security middleware initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize security middleware', { error: error.message, stack: error.stack });
    throw error;
  }
}

/**
 * Validate and sanitize request data
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Next middleware function
 */
function validateRequest(req, res, next) {
  try {
    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizeString(req.query[key]);
        }
      });
    }
    
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }
    
    // Sanitize URL parameters
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = sanitizeString(req.params[key]);
        }
      });
    }
    
    next();
  } catch (error) {
    logger.error('Request validation failed', { error: error.message, stack: error.stack });
    res.status(400).json({ error: 'Invalid request data' });
  }
}

/**
 * Sanitize a string to prevent XSS and injection attacks
 * @param {string} str String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
  if (typeof str !== 'string') {
    return str;
  }
  
  // Replace potentially dangerous characters
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/`/g, '&#96;');
}

/**
 * Recursively sanitize an object
 * @param {Object} obj Object to sanitize
 */
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') {
    return;
  }
  
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  });
}

/**
 * Validate an email address
 * @param {string} email Email address to validate
 * @returns {boolean} Whether the email is valid
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate a domain name
 * @param {string} domain Domain name to validate
 * @returns {boolean} Whether the domain is valid
 */
function validateDomain(domain) {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
}

/**
 * Validate an IP address (IPv4 or IPv6)
 * @param {string} ip IP address to validate
 * @returns {boolean} Whether the IP address is valid
 */
function validateIP(ip) {
  // IPv4 regex
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6 regex (simplified)
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Validate a username
 * @param {string} username Username to validate
 * @returns {boolean} Whether the username is valid
 */
function validateUsername(username) {
  // Basic username validation (alphanumeric, underscore, dot, dash)
  const usernameRegex = /^[a-zA-Z0-9._-]{3,30}$/;
  return usernameRegex.test(username);
}

module.exports = {
  initSecurity,
  validateRequest,
  sanitizeString,
  sanitizeObject,
  validateEmail,
  validateDomain,
  validateIP,
  validateUsername
};
