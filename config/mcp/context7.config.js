/**
 * Context7 MCP Configuration
 * 
 * This file configures the Context7 MCP server integration for the OSINT Framework.
 * Context7 provides contextual intelligence, knowledge management, and information retrieval.
 */

const Context7Config = {
  // Core configuration
  enabled: true,
  serverUrl: process.env.CONTEXT7_SERVER_URL || 'https://context7.mcp.example.com',
  apiKey: process.env.CONTEXT7_API_KEY,
  
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
  
  // Knowledge base configuration
  knowledgeBase: {
    defaultNamespace: 'osint-framework',
    namespaces: [
      {
        id: 'osint-techniques',
        name: 'OSINT Techniques',
        description: 'Knowledge base for OSINT techniques and methodologies'
      },
      {
        id: 'search-engines',
        name: 'Search Engines',
        description: 'Knowledge base for search engine operators and techniques'
      },
      {
        id: 'social-media',
        name: 'Social Media',
        description: 'Knowledge base for social media investigation techniques'
      },
      {
        id: 'domain-analysis',
        name: 'Domain Analysis',
        description: 'Knowledge base for domain investigation techniques'
      },
      {
        id: 'email-analysis',
        name: 'Email Analysis',
        description: 'Knowledge base for email investigation techniques'
      }
    ],
    autoSync: true,
    syncInterval: 3600000 // 1 hour
  },
  
  // Context management
  contextManagement: {
    persistUserContext: true,
    contextExpirationTime: 86400000, // 24 hours
    maxContextSize: 10485760, // 10 MB
    prioritizeRecentContext: true
  },
  
  // Search and retrieval
  search: {
    defaultSearchMode: 'semantic', // 'semantic', 'keyword', 'hybrid'
    maxResults: 50,
    minRelevanceScore: 0.7,
    includeSources: true,
    highlightMatches: true,
    enableFacets: true,
    enableFilters: true
  },
  
  // Document processing
  documentProcessing: {
    extractMetadata: true,
    generateSummaries: true,
    detectEntities: true,
    classifyContent: true,
    maxDocumentSize: 10485760 // 10 MB
  },
  
  // Integration with other MCP servers
  integrations: {
    taskmaster: {
      enabled: true,
      shareContext: true
    },
    magicUI: {
      enabled: true,
      syncContextState: true
    },
    openRouter: {
      enabled: true,
      enhanceWithAI: true
    }
  },
  
  // OSINT-specific context providers
  osintProviders: [
    {
      id: 'awesome-osint',
      name: 'Awesome OSINT',
      description: 'Context provider for awesome-osint resources',
      url: 'https://github.com/jivoi/awesome-osint',
      updateInterval: 86400000 // 24 hours
    },
    {
      id: 'osint-techniques',
      name: 'OSINT Techniques',
      description: 'Context provider for OSINT techniques',
      url: 'https://www.osintframework.com/',
      updateInterval: 86400000 // 24 hours
    },
    {
      id: 'bellingcat',
      name: 'Bellingcat',
      description: 'Context provider for Bellingcat OSINT guides',
      url: 'https://www.bellingcat.com/category/resources/how-tos/',
      updateInterval: 86400000 // 24 hours
    }
  ],
  
  // Logging and monitoring
  logging: {
    level: 'info', // 'debug', 'info', 'warn', 'error'
    includeDetails: true,
    logToConsole: true,
    logToFile: false,
    logFilePath: './logs/context7.log'
  },
  
  // Performance settings
  performance: {
    enableCaching: true,
    cacheSize: 104857600, // 100 MB
    cacheTTL: 3600, // 1 hour
    maxConcurrentRequests: 20,
    requestQueueSize: 100,
    enableBatching: true,
    batchSize: 10,
    batchInterval: 500 // 0.5 seconds
  }
};

module.exports = Context7Config;
