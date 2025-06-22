const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = ` ${JSON.stringify(meta)}`;
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { 
    service: 'osint-framework',
    version: '3.0.0'
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // OSINT specific log file
    new winston.transports.File({
      filename: path.join(logsDir, 'osint.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Custom logging methods for OSINT operations
logger.osint = (message, data = {}) => {
  logger.info(message, { ...data, category: 'osint' });
};

logger.search = (message, data = {}) => {
  logger.info(message, { ...data, category: 'search' });
};

logger.analysis = (message, data = {}) => {
  logger.info(message, { ...data, category: 'analysis' });
};

logger.security = (message, data = {}) => {
  logger.warn(message, { ...data, category: 'security' });
};

logger.threat = (message, data = {}) => {
  logger.error(message, { ...data, category: 'threat' });
};

logger.api = (message, data = {}) => {
  logger.info(message, { ...data, category: 'api' });
};

logger.ai = (message, data = {}) => {
  logger.info(message, { ...data, category: 'ai' });
};

// Performance logging
logger.performance = (operation, duration, data = {}) => {
  logger.info(`Performance: ${operation}`, {
    ...data,
    category: 'performance',
    duration: `${duration}ms`
  });
};

// Audit logging
logger.audit = (action, user, target, data = {}) => {
  logger.info(`Audit: ${action}`, {
    ...data,
    category: 'audit',
    user,
    target,
    timestamp: new Date().toISOString()
  });
};

// Error logging with context
logger.errorWithContext = (error, context = {}) => {
  logger.error(error.message, {
    ...context,
    category: 'error',
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
};

// Request logging middleware
logger.logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.api(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
};

// Export logger and create a simple interface
module.exports = { logger }; 