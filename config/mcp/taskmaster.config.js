/**
 * Taskmaster MCP Configuration
 * 
 * This file configures the Taskmaster MCP server integration for the OSINT Framework.
 * Taskmaster provides task management, workflow automation, and progress tracking.
 */

const TaskmasterConfig = {
  // Core configuration
  enabled: true,
  serverUrl: process.env.TASKMASTER_SERVER_URL || 'https://taskmaster.mcp.example.com',
  apiKey: process.env.TASKMASTER_API_KEY,
  
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
  
  // Task configuration
  tasks: {
    defaultPriority: 'medium', // 'low', 'medium', 'high', 'critical'
    defaultStatus: 'pending', // 'pending', 'in-progress', 'completed', 'failed'
    autoAssign: true,
    notifyOnCompletion: true,
    retainHistory: true,
    historyLimit: 100
  },
  
  // Workflow configuration
  workflows: {
    enabled: true,
    definitions: [
      {
        id: 'osint-person-investigation',
        name: 'Person Investigation',
        description: 'Complete workflow for investigating a person',
        steps: [
          { id: 'search-engines', name: 'Search Engines', required: true },
          { id: 'social-media', name: 'Social Media Profiles', required: true },
          { id: 'email-analysis', name: 'Email Analysis', required: false },
          { id: 'username-search', name: 'Username Search', required: true },
          { id: 'image-analysis', name: 'Image Analysis', required: false },
          { id: 'report-generation', name: 'Report Generation', required: true }
        ]
      },
      {
        id: 'osint-domain-investigation',
        name: 'Domain Investigation',
        description: 'Complete workflow for investigating a domain',
        steps: [
          { id: 'whois-lookup', name: 'WHOIS Lookup', required: true },
          { id: 'dns-analysis', name: 'DNS Analysis', required: true },
          { id: 'ssl-certificate', name: 'SSL Certificate Analysis', required: true },
          { id: 'website-technology', name: 'Website Technology Analysis', required: true },
          { id: 'historical-data', name: 'Historical Data Analysis', required: false },
          { id: 'related-domains', name: 'Related Domains Analysis', required: true },
          { id: 'report-generation', name: 'Report Generation', required: true }
        ]
      },
      {
        id: 'osint-ip-investigation',
        name: 'IP Investigation',
        description: 'Complete workflow for investigating an IP address',
        steps: [
          { id: 'geolocation', name: 'Geolocation', required: true },
          { id: 'reputation-check', name: 'Reputation Check', required: true },
          { id: 'open-ports', name: 'Open Ports Scan', required: false },
          { id: 'hosted-domains', name: 'Hosted Domains', required: true },
          { id: 'report-generation', name: 'Report Generation', required: true }
        ]
      }
    ]
  },
  
  // Integration with other MCP servers
  integrations: {
    context7: {
      enabled: true,
      shareContext: true
    },
    magicUI: {
      enabled: true,
      syncTaskStatus: true
    }
  },
  
  // Logging and monitoring
  logging: {
    level: 'info', // 'debug', 'info', 'warn', 'error'
    includeDetails: true,
    logToConsole: true,
    logToFile: false,
    logFilePath: './logs/taskmaster.log'
  },
  
  // Performance settings
  performance: {
    maxConcurrentTasks: 10,
    taskQueueSize: 100,
    enableBatching: true,
    batchSize: 5,
    batchInterval: 1000 // 1 second
  }
};

module.exports = TaskmasterConfig;
