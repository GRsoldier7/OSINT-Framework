/**
 * OpenRouter AI Configuration
 * 
 * This file configures the OpenRouter AI integration for the OSINT Framework.
 * OpenRouter provides access to various AI models for enhanced OSINT capabilities.
 */

const OpenRouterConfig = {
  // Core configuration
  enabled: true,
  apiKey: process.env.OPENROUTER_API_KEY,
  baseUrl: 'https://openrouter.ai/api/v1',
  
  // Connection settings
  connection: {
    timeout: 60000, // 60 seconds for AI operations
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
    keepAlive: true
  },
  
  // Model configuration
  models: {
    default: 'anthropic/claude-3-opus-20240229',
    fallback: 'openai/gpt-4-turbo',
    available: [
      {
        id: 'anthropic/claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        description: 'Most capable Claude model for complex OSINT analysis',
        contextWindow: 200000,
        costPer1kTokens: 0.015,
        category: 'premium'
      },
      {
        id: 'anthropic/claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        description: 'Balanced Claude model for general OSINT tasks',
        contextWindow: 200000,
        costPer1kTokens: 0.003,
        category: 'standard'
      },
      {
        id: 'anthropic/claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        description: 'Fast Claude model for quick OSINT analysis',
        contextWindow: 200000,
        costPer1kTokens: 0.00025,
        category: 'economy'
      },
      {
        id: 'openai/gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'OpenAI\'s advanced model for complex OSINT tasks',
        contextWindow: 128000,
        costPer1kTokens: 0.01,
        category: 'premium'
      },
      {
        id: 'openai/gpt-4o',
        name: 'GPT-4o',
        description: 'OpenAI\'s optimized model for OSINT analysis',
        contextWindow: 128000,
        costPer1kTokens: 0.005,
        category: 'standard'
      },
      {
        id: 'google/gemini-1.5-pro-latest',
        name: 'Gemini 1.5 Pro',
        description: 'Google\'s advanced model for OSINT tasks',
        contextWindow: 1000000,
        costPer1kTokens: 0.0035,
        category: 'standard'
      },
      {
        id: 'meta-llama/llama-3-70b-instruct',
        name: 'Llama 3 70B',
        description: 'Meta\'s open model for OSINT analysis',
        contextWindow: 8192,
        costPer1kTokens: 0.0009,
        category: 'economy'
      }
    ],
    modelSelectionStrategy: 'auto', // 'auto', 'manual', 'cost-optimized', 'performance-optimized'
    autoSwitchThreshold: 0.8 // Switch to fallback if confidence below 80%
  },
  
  // OSINT-specific AI capabilities
  osintCapabilities: {
    enableAll: true,
    capabilities: [
      {
        id: 'entity-extraction',
        name: 'Entity Extraction',
        description: 'Extract entities from text (people, organizations, locations, etc.)',
        defaultModel: 'anthropic/claude-3-sonnet-20240229',
        systemPrompt: 'You are an AI assistant specialized in extracting entities from text for OSINT purposes. Extract all people, organizations, locations, dates, and other relevant entities from the provided text.'
      },
      {
        id: 'relationship-mapping',
        name: 'Relationship Mapping',
        description: 'Map relationships between entities',
        defaultModel: 'anthropic/claude-3-opus-20240229',
        systemPrompt: 'You are an AI assistant specialized in mapping relationships between entities for OSINT purposes. Identify and describe all relationships between the entities in the provided text.'
      },
      {
        id: 'search-query-generation',
        name: 'Search Query Generation',
        description: 'Generate effective search queries for OSINT research',
        defaultModel: 'anthropic/claude-3-sonnet-20240229',
        systemPrompt: 'You are an AI assistant specialized in generating effective search queries for OSINT research. Generate a set of search queries that would be most effective for finding information about the provided topic.'
      },
      {
        id: 'data-analysis',
        name: 'Data Analysis',
        description: 'Analyze OSINT data for patterns and insights',
        defaultModel: 'anthropic/claude-3-opus-20240229',
        systemPrompt: 'You are an AI assistant specialized in analyzing OSINT data. Identify patterns, anomalies, and insights in the provided data that would be relevant for an investigation.'
      },
      {
        id: 'report-generation',
        name: 'Report Generation',
        description: 'Generate comprehensive OSINT reports',
        defaultModel: 'anthropic/claude-3-opus-20240229',
        systemPrompt: 'You are an AI assistant specialized in generating comprehensive OSINT reports. Create a detailed, well-structured report based on the provided information, following standard intelligence report formats.'
      },
      {
        id: 'image-analysis',
        name: 'Image Analysis',
        description: 'Analyze images for OSINT purposes',
        defaultModel: 'anthropic/claude-3-opus-20240229',
        systemPrompt: 'You are an AI assistant specialized in analyzing images for OSINT purposes. Describe the image in detail, identifying any elements that could be useful for an investigation (location indicators, text, logos, people, etc.).'
      },
      {
        id: 'social-media-analysis',
        name: 'Social Media Analysis',
        description: 'Analyze social media content for OSINT purposes',
        defaultModel: 'anthropic/claude-3-sonnet-20240229',
        systemPrompt: 'You are an AI assistant specialized in analyzing social media content for OSINT purposes. Identify relevant information, patterns, and insights from the provided social media data.'
      }
    ]
  },
  
  // Request configuration
  requests: {
    defaultTemperature: 0.7,
    defaultMaxTokens: 2000,
    defaultTopP: 0.9,
    defaultFrequencyPenalty: 0.0,
    defaultPresencePenalty: 0.0,
    defaultSystemPrompt: 'You are an AI assistant specialized in OSINT (Open Source Intelligence). Your purpose is to help with intelligence gathering, analysis, and providing actionable insights from publicly available information. Always prioritize accuracy, ethical considerations, and privacy concerns in your responses.'
  },
  
  // Integration with other MCP servers
  integrations: {
    context7: {
      enabled: true,
      enhancePrompts: true
    },
    taskmaster: {
      enabled: true,
      aiAssistedTaskCompletion: true
    },
    magicUI: {
      enabled: true,
      aiGeneratedUIComponents: true
    }
  },
  
  // Logging and monitoring
  logging: {
    level: 'info', // 'debug', 'info', 'warn', 'error'
    includeDetails: true,
    logToConsole: true,
    logToFile: false,
    logFilePath: './logs/openrouter.log',
    logPrompts: true,
    logResponses: true,
    logTokenUsage: true
  },
  
  // Performance and cost optimization
  optimization: {
    enableCaching: true,
    cacheTTL: 3600, // 1 hour
    deduplicateRequests: true,
    batchSimilarRequests: true,
    tokenBudgetPerDay: 1000000, // 1M tokens per day
    alertOnBudgetThreshold: 0.8, // Alert at 80% of budget
    costOptimizationStrategy: 'balanced' // 'balanced', 'cost-focused', 'performance-focused'
  },
  
  // Security and privacy
  security: {
    sanitizeInputs: true,
    filterSensitiveData: true,
    sensitiveDataPatterns: [
      '\\b\\d{3}-\\d{2}-\\d{4}\\b', // SSN
      '\\b\\d{16}\\b', // Credit card
      '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b' // Email
    ],
    enableContentFiltering: true,
    contentFilteringLevel: 'medium' // 'low', 'medium', 'high'
  }
};

module.exports = OpenRouterConfig;
