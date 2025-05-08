/**
 * OpenRouter AI Service
 * 
 * This file provides integration with the OpenRouter AI service for AI capabilities.
 * It follows the Vibe Coding guidelines for AI integration.
 */

const axios = require('axios');
const { initLogger } = require('../../utils/logger');

// Initialize logger
const logger = initLogger({ level: 'info', console: { enabled: true } });

// OpenRouter client instance
let openRouterClient = null;

/**
 * Initialize the OpenRouter AI service
 * @param {Object} config OpenRouter configuration
 * @returns {Object} OpenRouter client
 */
async function initOpenRouter(config) {
  logger.info('Initializing OpenRouter AI service...');
  
  try {
    if (!config.enabled) {
      logger.warn('OpenRouter AI service is disabled');
      return null;
    }
    
    if (!config.apiKey) {
      logger.error('OpenRouter API key is missing');
      throw new Error('OpenRouter API key is required');
    }
    
    // Create Axios instance for OpenRouter
    const client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.connection.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'HTTP-Referer': 'https://osint-framework.example.com',
        'X-Title': 'Ultimate OSINT Framework'
      }
    });
    
    // Add request interceptor for logging
    client.interceptors.request.use(
      (config) => {
        // Don't log the full request body to avoid logging sensitive data
        const { data, ...configWithoutData } = config;
        logger.debug(`OpenRouter request: ${config.method.toUpperCase()} ${config.url}`, {
          config: configWithoutData,
          dataLength: data ? JSON.stringify(data).length : 0
        });
        return config;
      },
      (error) => {
        logger.error('OpenRouter request error', { error: error.message });
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for logging
    client.interceptors.response.use(
      (response) => {
        // Don't log the full response to avoid logging sensitive data
        logger.debug(`OpenRouter response: ${response.status}`, {
          status: response.status,
          dataLength: response.data ? JSON.stringify(response.data).length : 0
        });
        return response;
      },
      (error) => {
        if (error.response) {
          logger.error('OpenRouter response error', {
            status: error.response.status,
            data: error.response.data
          });
        } else {
          logger.error('OpenRouter network error', { error: error.message });
        }
        return Promise.reject(error);
      }
    );
    
    // Test connection with a simple request
    try {
      const response = await client.post('/chat/completions', {
        model: config.models.default,
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant for OSINT purposes.'
          },
          {
            role: 'user',
            content: 'Hello, are you working?'
          }
        ],
        max_tokens: 10
      });
      
      if (response.status !== 200) {
        throw new Error(`Failed to connect to OpenRouter: ${response.status} ${response.statusText}`);
      }
      
      logger.info('OpenRouter AI service initialized successfully');
    } catch (error) {
      logger.warn('OpenRouter test request failed, but continuing initialization', { 
        error: error.message 
      });
      // Continue initialization despite test failure
    }
    
    // Create OpenRouter client
    openRouterClient = {
      // Core AI capabilities
      
      /**
       * Generate text using the specified model
       * @param {string} prompt User prompt
       * @param {Object} options Generation options
       * @returns {Object} Generated text response
       */
      async generateText(prompt, options = {}) {
        const model = options.model || config.models.default;
        const temperature = options.temperature !== undefined ? options.temperature : config.requests.defaultTemperature;
        const maxTokens = options.maxTokens || config.requests.defaultMaxTokens;
        const systemPrompt = options.systemPrompt || config.requests.defaultSystemPrompt;
        
        logger.debug('Generating text', { model, temperature, maxTokens });
        
        try {
          const response = await client.post('/chat/completions', {
            model: model,
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: temperature,
            max_tokens: maxTokens,
            top_p: options.topP || config.requests.defaultTopP,
            frequency_penalty: options.frequencyPenalty || config.requests.defaultFrequencyPenalty,
            presence_penalty: options.presencePenalty || config.requests.defaultPresencePenalty
          });
          
          // Log token usage
          if (response.data.usage) {
            logger.debug('Token usage', {
              promptTokens: response.data.usage.prompt_tokens,
              completionTokens: response.data.usage.completion_tokens,
              totalTokens: response.data.usage.total_tokens
            });
          }
          
          return response.data.choices[0].message.content;
        } catch (error) {
          // Try fallback model if specified
          if (options.useFallback !== false && model !== config.models.fallback) {
            logger.warn(`Primary model failed, trying fallback model: ${config.models.fallback}`, {
              error: error.message
            });
            
            return this.generateText(prompt, {
              ...options,
              model: config.models.fallback,
              useFallback: false
            });
          }
          
          throw error;
        }
      },
      
      /**
       * Generate a chat completion with multiple messages
       * @param {Array} messages Chat messages
       * @param {Object} options Generation options
       * @returns {Object} Generated chat completion
       */
      async generateChatCompletion(messages, options = {}) {
        const model = options.model || config.models.default;
        const temperature = options.temperature !== undefined ? options.temperature : config.requests.defaultTemperature;
        const maxTokens = options.maxTokens || config.requests.defaultMaxTokens;
        
        logger.debug('Generating chat completion', { model, temperature, maxTokens, messageCount: messages.length });
        
        try {
          const response = await client.post('/chat/completions', {
            model: model,
            messages: messages,
            temperature: temperature,
            max_tokens: maxTokens,
            top_p: options.topP || config.requests.defaultTopP,
            frequency_penalty: options.frequencyPenalty || config.requests.defaultFrequencyPenalty,
            presence_penalty: options.presencePenalty || config.requests.defaultPresencePenalty
          });
          
          // Log token usage
          if (response.data.usage) {
            logger.debug('Token usage', {
              promptTokens: response.data.usage.prompt_tokens,
              completionTokens: response.data.usage.completion_tokens,
              totalTokens: response.data.usage.total_tokens
            });
          }
          
          return response.data.choices[0].message;
        } catch (error) {
          // Try fallback model if specified
          if (options.useFallback !== false && model !== config.models.fallback) {
            logger.warn(`Primary model failed, trying fallback model: ${config.models.fallback}`, {
              error: error.message
            });
            
            return this.generateChatCompletion(messages, {
              ...options,
              model: config.models.fallback,
              useFallback: false
            });
          }
          
          throw error;
        }
      },
      
      // OSINT-specific AI capabilities
      
      /**
       * Extract entities from text
       * @param {string} text Text to analyze
       * @param {Object} options Extraction options
       * @returns {Object} Extracted entities
       */
      async extractEntities(text, options = {}) {
        logger.debug('Extracting entities from text', { textLength: text.length });
        
        const capability = config.osintCapabilities.capabilities.find(c => c.id === 'entity-extraction');
        const model = options.model || capability.defaultModel;
        const systemPrompt = options.systemPrompt || capability.systemPrompt;
        
        const prompt = `
          Please extract all entities from the following text. Include people, organizations, locations, dates, email addresses, phone numbers, URLs, and any other relevant entities.
          
          Format the output as JSON with the following structure:
          {
            "people": [{"name": "John Doe", "context": "CEO of Example Corp"}],
            "organizations": [{"name": "Example Corp", "context": "Tech company"}],
            "locations": [{"name": "New York", "context": "Company headquarters"}],
            "dates": [{"date": "2023-01-15", "context": "Company founding date"}],
            "emails": [{"email": "john@example.com", "context": "CEO's email"}],
            "phones": [{"phone": "+1-555-123-4567", "context": "Company phone"}],
            "urls": [{"url": "https://example.com", "context": "Company website"}],
            "other": [{"entity": "Project X", "type": "Project", "context": "Secret initiative"}]
          }
          
          Text to analyze:
          ${text}
        `;
        
        const response = await this.generateText(prompt, {
          model,
          systemPrompt,
          temperature: 0.2, // Lower temperature for more deterministic results
          ...options
        });
        
        try {
          // Extract JSON from the response
          const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/{[\s\S]*?}/);
          const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
          return JSON.parse(jsonStr);
        } catch (error) {
          logger.error('Failed to parse entity extraction response as JSON', { error: error.message });
          return { error: 'Failed to parse response', rawResponse: response };
        }
      },
      
      /**
       * Map relationships between entities
       * @param {Object} entities Entities to map relationships for
       * @param {Object} options Mapping options
       * @returns {Object} Entity relationships
       */
      async mapRelationships(entities, options = {}) {
        logger.debug('Mapping relationships between entities');
        
        const capability = config.osintCapabilities.capabilities.find(c => c.id === 'relationship-mapping');
        const model = options.model || capability.defaultModel;
        const systemPrompt = options.systemPrompt || capability.systemPrompt;
        
        const prompt = `
          Please analyze the following entities and map the relationships between them. Identify direct connections, potential connections, and hierarchical relationships.
          
          Format the output as JSON with the following structure:
          {
            "relationships": [
              {
                "source": "Entity A",
                "target": "Entity B",
                "type": "works_for|owns|related_to|located_in|etc",
                "confidence": 0.8,
                "evidence": "Evidence for this relationship"
              }
            ],
            "clusters": [
              {
                "name": "Cluster name",
                "entities": ["Entity A", "Entity B"],
                "description": "Why these entities are clustered"
              }
            ]
          }
          
          Entities:
          ${JSON.stringify(entities, null, 2)}
        `;
        
        const response = await this.generateText(prompt, {
          model,
          systemPrompt,
          temperature: 0.3,
          ...options
        });
        
        try {
          // Extract JSON from the response
          const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/{[\s\S]*?}/);
          const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
          return JSON.parse(jsonStr);
        } catch (error) {
          logger.error('Failed to parse relationship mapping response as JSON', { error: error.message });
          return { error: 'Failed to parse response', rawResponse: response };
        }
      },
      
      /**
       * Generate search queries for OSINT research
       * @param {string} topic Research topic
       * @param {Object} options Generation options
       * @returns {Object} Generated search queries
       */
      async generateSearchQueries(topic, options = {}) {
        logger.debug('Generating search queries', { topic });
        
        const capability = config.osintCapabilities.capabilities.find(c => c.id === 'search-query-generation');
        const model = options.model || capability.defaultModel;
        const systemPrompt = options.systemPrompt || capability.systemPrompt;
        
        const prompt = `
          Please generate effective search queries for OSINT research on the topic: "${topic}"
          
          Include the following types of queries:
          1. General search engine queries (Google, Bing, etc.)
          2. Social media search queries (Twitter, Facebook, LinkedIn, etc.)
          3. Specialized search queries (for documents, images, etc.)
          4. Advanced operator queries (using site:, filetype:, etc.)
          
          Format the output as JSON with the following structure:
          {
            "general": [
              {"query": "search query here", "purpose": "what this query is intended to find"}
            ],
            "social_media": [
              {"platform": "Twitter", "query": "search query here", "purpose": "what this query is intended to find"}
            ],
            "specialized": [
              {"type": "Documents", "query": "search query here", "purpose": "what this query is intended to find"}
            ],
            "advanced": [
              {"query": "site:example.com search query", "purpose": "what this query is intended to find"}
            ]
          }
        `;
        
        const response = await this.generateText(prompt, {
          model,
          systemPrompt,
          temperature: 0.4,
          ...options
        });
        
        try {
          // Extract JSON from the response
          const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/{[\s\S]*?}/);
          const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
          return JSON.parse(jsonStr);
        } catch (error) {
          logger.error('Failed to parse search query generation response as JSON', { error: error.message });
          return { error: 'Failed to parse response', rawResponse: response };
        }
      },
      
      /**
       * Generate an OSINT report
       * @param {Object} data OSINT data
       * @param {Object} options Report options
       * @returns {string} Generated report
       */
      async generateReport(data, options = {}) {
        logger.debug('Generating OSINT report');
        
        const capability = config.osintCapabilities.capabilities.find(c => c.id === 'report-generation');
        const model = options.model || capability.defaultModel;
        const systemPrompt = options.systemPrompt || capability.systemPrompt;
        
        const prompt = `
          Please generate a comprehensive OSINT report based on the following data. The report should include an executive summary, key findings, analysis, and recommendations.
          
          ${options.format === 'markdown' ? 'Format the report in Markdown.' : ''}
          ${options.format === 'html' ? 'Format the report in HTML.' : ''}
          
          OSINT Data:
          ${JSON.stringify(data, null, 2)}
        `;
        
        return this.generateText(prompt, {
          model,
          systemPrompt,
          temperature: 0.2,
          maxTokens: 4000, // Longer output for reports
          ...options
        });
      },
      
      /**
       * Analyze an image for OSINT purposes
       * @param {string} imageUrl URL of the image to analyze
       * @param {Object} options Analysis options
       * @returns {Object} Image analysis
       */
      async analyzeImage(imageUrl, options = {}) {
        logger.debug('Analyzing image', { imageUrl });
        
        const capability = config.osintCapabilities.capabilities.find(c => c.id === 'image-analysis');
        const model = options.model || capability.defaultModel;
        const systemPrompt = options.systemPrompt || capability.systemPrompt;
        
        const prompt = `
          Please analyze this image from an OSINT perspective: ${imageUrl}
          
          Provide a detailed analysis including:
          1. Description of the image content
          2. Identifiable elements (people, locations, objects, text, etc.)
          3. Potential metadata that might be available
          4. Recommendations for further investigation
          
          Format the output as JSON with the following structure:
          {
            "description": "Overall description of the image",
            "elements": [
              {"type": "person|location|object|text", "description": "Description of the element"}
            ],
            "potential_metadata": [
              {"type": "geolocation|timestamp|device", "relevance": "Why this metadata would be relevant"}
            ],
            "recommendations": [
              {"action": "Recommended action", "purpose": "Purpose of this action"}
            ]
          }
        `;
        
        const response = await this.generateText(prompt, {
          model,
          systemPrompt,
          temperature: 0.3,
          ...options
        });
        
        try {
          // Extract JSON from the response
          const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/{[\s\S]*?}/);
          const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
          return JSON.parse(jsonStr);
        } catch (error) {
          logger.error('Failed to parse image analysis response as JSON', { error: error.message });
          return { error: 'Failed to parse response', rawResponse: response };
        }
      }
    };
    
    return openRouterClient;
  } catch (error) {
    logger.error('Failed to initialize OpenRouter AI service', { error: error.message, stack: error.stack });
    throw error;
  }
}

/**
 * Get the OpenRouter client instance
 * @returns {Object} OpenRouter client
 */
function getOpenRouterClient() {
  if (!openRouterClient) {
    logger.warn('OpenRouter client not initialized');
    return null;
  }
  
  return openRouterClient;
}

module.exports = {
  initOpenRouter,
  getOpenRouterClient
};
