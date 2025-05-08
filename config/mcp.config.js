/**
 * Master MCP Configuration
 * 
 * This file integrates all MCP server configurations for the OSINT Framework.
 * It provides a unified interface for accessing MCP services.
 */

const taskmasterConfig = require('./mcp/taskmaster.config');
const context7Config = require('./mcp/context7.config');
const magicUIConfig = require('./mcp/magicui.config');
const openRouterConfig = require('./mcp/openrouter.config');

const MCPConfig = {
  // Core configuration
  enabled: true,
  environment: process.env.NODE_ENV || 'development',
  
  // MCP Servers
  servers: {
    taskmaster: {
      ...taskmasterConfig,
      priority: 1 // Lower number = higher priority
    },
    context7: {
      ...context7Config,
      priority: 2
    },
    magicUI: {
      ...magicUIConfig,
      priority: 3
    },
    openRouter: {
      ...openRouterConfig,
      priority: 4
    }
  },
  
  // Global MCP settings
  global: {
    // Connection settings
    connection: {
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: 1000, // 1 second
      keepAlive: true
    },
    
    // Authentication settings
    auth: {
      method: 'bearer', // 'bearer', 'basic', or 'api-key'
      refreshToken: true,
      tokenRefreshInterval: 3600000 // 1 hour
    },
    
    // Logging and monitoring
    logging: {
      level: process.env.LOG_LEVEL || 'info', // 'debug', 'info', 'warn', 'error'
      includeDetails: true,
      logToConsole: true,
      logToFile: process.env.LOG_TO_FILE === 'true',
      logFilePath: './logs/mcp.log'
    }
  },
  
  // OSINT-specific MCP integration
  osint: {
    // Task workflows
    workflows: {
      enabled: true,
      defaultWorkflow: 'osint-general-investigation',
      workflows: [
        {
          id: 'osint-general-investigation',
          name: 'General OSINT Investigation',
          description: 'General workflow for OSINT investigations',
          steps: [
            { id: 'define-objectives', name: 'Define Objectives', server: 'taskmaster' },
            { id: 'gather-information', name: 'Gather Information', server: 'context7' },
            { id: 'analyze-data', name: 'Analyze Data', server: 'openRouter' },
            { id: 'visualize-results', name: 'Visualize Results', server: 'magicUI' },
            { id: 'generate-report', name: 'Generate Report', server: 'openRouter' }
          ]
        }
      ]
    },
    
    // Knowledge integration
    knowledge: {
      enabled: true,
      sources: [
        { id: 'osint-techniques', name: 'OSINT Techniques', server: 'context7' },
        { id: 'search-engines', name: 'Search Engines', server: 'context7' },
        { id: 'social-media', name: 'Social Media', server: 'context7' }
      ],
      autoSync: true,
      syncInterval: 86400000 // 24 hours
    },
    
    // UI components
    components: {
      enabled: true,
      components: [
        { id: 'osint-search-bar', name: 'OSINT Search Bar', server: 'magicUI' },
        { id: 'osint-results-grid', name: 'OSINT Results Grid', server: 'magicUI' },
        { id: 'osint-data-visualization', name: 'OSINT Data Visualization', server: 'magicUI' }
      ]
    },
    
    // AI capabilities
    ai: {
      enabled: true,
      capabilities: [
        { id: 'entity-extraction', name: 'Entity Extraction', server: 'openRouter' },
        { id: 'relationship-mapping', name: 'Relationship Mapping', server: 'openRouter' },
        { id: 'search-query-generation', name: 'Search Query Generation', server: 'openRouter' },
        { id: 'data-analysis', name: 'Data Analysis', server: 'openRouter' },
        { id: 'report-generation', name: 'Report Generation', server: 'openRouter' }
      ]
    }
  },
  
  // MCP service discovery and orchestration
  orchestration: {
    enabled: true,
    discoveryMode: 'auto', // 'auto', 'manual', 'registry'
    healthCheckInterval: 60000, // 1 minute
    failoverEnabled: true,
    loadBalancingStrategy: 'priority', // 'priority', 'round-robin', 'least-connections'
    circuitBreakerEnabled: true,
    circuitBreakerThreshold: 5, // Number of failures before circuit opens
    circuitBreakerResetTimeout: 30000 // 30 seconds
  },
  
  // Performance and optimization
  performance: {
    enableCaching: true,
    cacheTTL: 3600, // 1 hour
    enableBatching: true,
    batchSize: 10,
    batchInterval: 500, // 0.5 seconds
    enableCompression: true,
    compressionLevel: 6 // 0-9, higher = more compression but slower
  },
  
  // Security
  security: {
    enableTLS: true,
    validateCertificates: true,
    enableCSRF: true,
    csrfTokenExpiration: 3600, // 1 hour
    rateLimiting: {
      enabled: true,
      maxRequests: 100,
      timeWindow: 60000 // 1 minute
    },
    sanitizeInputs: true,
    sanitizeOutputs: true
  }
};

module.exports = MCPConfig;
