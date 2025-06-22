const axios = require('axios');
const { logger } = require('../utils/logger');

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'openai';
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.openrouterApiKey = process.env.OPENROUTER_API_KEY;
    this.openrouterModel = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';
    this.openrouterBaseUrl = 'https://openrouter.ai/api/v1';
    this.openaiBaseUrl = 'https://api.openai.com/v1';
    
    // Log configuration for debugging
    logger.info('AI Service initialized', {
      provider: this.provider,
      openaiConfigured: !!this.openaiApiKey,
      openrouterConfigured: !!this.openrouterApiKey,
      openrouterModel: this.openrouterModel,
      version: '3.0.0'
    });
    
    // Tool knowledge base for intelligent recommendations
    this.toolKnowledge = {
      'geographic': {
        keywords: ['location', 'map', 'geographic', 'coordinates', 'satellite', 'flight', 'shadow', 'building', 'urban', 'city', 'country', 'region'],
        description: 'Tools for location analysis, mapping, and geographic intelligence'
      },
      'socialMedia': {
        keywords: ['social', 'twitter', 'facebook', 'instagram', 'telegram', 'reddit', 'username', 'profile', 'network', 'trending', 'hashtag'],
        description: 'Social media analysis, network mapping, and platform research'
      },
      'search': {
        keywords: ['search', 'find', 'discover', 'face', 'image', 'reverse', 'google', 'lens', 'dorks', 'advanced'],
        description: 'Advanced search tools, reverse image search, and discovery platforms'
      },
      'data': {
        keywords: ['data', 'archive', 'historical', 'wayback', 'metadata', 'exif', 'pixel', 'extract'],
        description: 'Data extraction, archival tools, and historical information'
      },
      'analysis': {
        keywords: ['analysis', 'ai', 'intelligence', 'threat', 'pattern', 'assessment', 'risk', 'insight'],
        description: 'AI-powered analysis, threat assessment, and pattern recognition'
      },
      'network': {
        keywords: ['network', 'domain', 'ip', 'ssl', 'infrastructure', 'whois', 'dns', 'certificate'],
        description: 'Domain analysis, IP investigation, and network security'
      },
      'documents': {
        keywords: ['document', 'file', 'pdf', 'ocr', 'text', 'extract', 'parse', 'forensics'],
        description: 'Document analysis, metadata extraction, and file forensics'
      },
      'images': {
        keywords: ['image', 'photo', 'picture', 'visual', 'face', 'detection', 'ocr', 'reverse'],
        description: 'Image analysis, reverse search, and visual intelligence'
      }
    };
  }

  async chat(message, context = {}) {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const response = await this.generateResponse(message, systemPrompt);
      
      // Extract tool recommendations from the response
      const toolRecommendations = this.extractToolRecommendations(message, response);
      
      return {
        success: true,
        response: response,
        toolRecommendations: toolRecommendations,
        provider: this.provider
      };
    } catch (error) {
      logger.error('AI chat error', { error: error.message, provider: this.provider });
      return {
        success: false,
        error: 'Failed to generate response',
        message: error.message
      };
    }
  }

  buildSystemPrompt(context = {}) {
    const basePrompt = `You are an expert OSINT (Open Source Intelligence) assistant with deep knowledge of intelligence gathering, investigation techniques, and security analysis. You help users find the right tools and provide guidance on OSINT investigations.

Available tool categories:
${Object.entries(this.toolKnowledge).map(([category, info]) => 
    `- ${category}: ${info.description}`
).join('\n')}

Your capabilities:
1. Answer general OSINT questions and provide investigation guidance
2. Recommend specific tools based on user needs
3. Explain OSINT methodologies and best practices
4. Provide step-by-step investigation workflows
5. Suggest alternative approaches and tools

Guidelines:
- Be helpful, accurate, and professional
- When recommending tools, explain why they're relevant
- Provide context and methodology, not just tool names
- Consider the user's skill level and investigation goals
- Always emphasize ethical and legal compliance
- Suggest multiple tools when appropriate for comprehensive analysis

Current context: ${context.currentPage || 'Tools Hub'}`;

    return basePrompt;
  }

  async generateResponse(message, systemPrompt) {
    if (this.provider === 'openrouter') {
      return await this.openrouterChat(message, systemPrompt);
    } else {
      return await this.openaiChat(message, systemPrompt);
    }
  }

  async openrouterChat(message, systemPrompt) {
    if (!this.openrouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await axios.post(`${this.openrouterBaseUrl}/chat/completions`, {
      model: this.openrouterModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${this.openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://osint-framework.com',
        'X-Title': 'OSINT Framework'
      }
    });

    return response.data.choices[0].message.content;
  }

  async openaiChat(message, systemPrompt) {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await axios.post(`${this.openaiBaseUrl}/chat/completions`, {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  }

  extractToolRecommendations(userMessage, aiResponse) {
    const recommendations = [];
    const userMessageLower = userMessage.toLowerCase();
    
    // Analyze user message for tool category matches
    for (const [category, info] of Object.entries(this.toolKnowledge)) {
      const matchScore = this.calculateMatchScore(userMessageLower, info.keywords);
      if (matchScore > 0.3) { // Threshold for relevance
        recommendations.push({
          category: category,
          name: this.getCategoryDisplayName(category),
          description: info.description,
          relevance: matchScore,
          icon: this.getCategoryIcon(category),
          color: this.getCategoryColor(category)
        });
      }
    }

    // Sort by relevance score
    recommendations.sort((a, b) => b.relevance - a.relevance);
    
    return recommendations.slice(0, 3); // Return top 3 recommendations
  }

  calculateMatchScore(message, keywords) {
    let score = 0;
    const words = message.split(/\s+/);
    
    for (const keyword of keywords) {
      if (message.includes(keyword)) {
        score += 1;
      }
    }
    
    // Normalize score
    return Math.min(score / keywords.length, 1);
  }

  getCategoryDisplayName(category) {
    const names = {
      'geographic': 'Geographic & Location',
      'socialMedia': 'Social Media & Networks',
      'search': 'Search & Discovery',
      'data': 'Data & Archives',
      'analysis': 'AI & Analysis',
      'network': 'Network & Infrastructure',
      'documents': 'Documents & Files',
      'images': 'Images & Visual'
    };
    return names[category] || category;
  }

  getCategoryIcon(category) {
    const icons = {
      'geographic': 'fas fa-map-marker-alt',
      'socialMedia': 'fas fa-share-alt',
      'search': 'fas fa-search',
      'data': 'fas fa-database',
      'analysis': 'fas fa-robot',
      'network': 'fas fa-network-wired',
      'documents': 'fas fa-file-alt',
      'images': 'fas fa-image'
    };
    return icons[category] || 'fas fa-tools';
  }

  getCategoryColor(category) {
    const colors = {
      'geographic': '#3B82F6',
      'socialMedia': '#10B981',
      'search': '#F59E0B',
      'data': '#8B5CF6',
      'analysis': '#EF4444',
      'network': '#06B6D4',
      'documents': '#84CC16',
      'images': '#EC4899'
    };
    return colors[category] || '#6B7280';
  }

  async analyzeData(data, type = 'general') {
    try {
      const prompt = `Analyze the following ${type} data and provide insights, patterns, and recommendations for further investigation:

Data: ${JSON.stringify(data, null, 2)}

Please provide:
1. Key findings and insights
2. Potential patterns or anomalies
3. Recommended next steps
4. Relevant OSINT tools for further analysis
5. Risk assessment (if applicable)`;

      const response = await this.generateResponse(prompt, this.buildSystemPrompt());
      
      return {
        success: true,
        analysis: response,
        type: type,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Data analysis error', { error: error.message, type });
      return {
        success: false,
        error: 'Failed to analyze data',
        message: error.message
      };
    }
  }

  async generateReport(data, template = 'standard') {
    try {
      const prompt = `Generate a comprehensive OSINT investigation report based on the following data:

Data: ${JSON.stringify(data, null, 2)}

Template: ${template}

Please structure the report with:
1. Executive Summary
2. Methodology
3. Key Findings
4. Analysis and Insights
5. Recommendations
6. Appendices (tools used, sources, etc.)`;

      const report = await this.generateResponse(prompt, this.buildSystemPrompt());
      
      return {
        success: true,
        report: report,
        template: template,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Report generation error', { error: error.message, template });
      return {
        success: false,
        error: 'Failed to generate report',
        message: error.message
      };
    }
  }

  async assessThreat(data) {
    try {
      const prompt = `Assess the threat level and security implications of the following data:

Data: ${JSON.stringify(data, null, 2)}

Please provide:
1. Threat level assessment (Low/Medium/High/Critical)
2. Risk factors identified
3. Potential security implications
4. Recommended mitigation strategies
5. Relevant threat intelligence tools`;

      const assessment = await this.generateResponse(prompt, this.buildSystemPrompt());
      
      return {
        success: true,
        assessment: assessment,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Threat assessment error', { error: error.message });
      return {
        success: false,
        error: 'Failed to assess threat',
        message: error.message
      };
    }
  }

  getProviderInfo() {
    return {
      provider: this.provider,
      openaiConfigured: !!this.openaiApiKey,
      openrouterConfigured: !!this.openrouterApiKey,
      openrouterModel: this.openrouterModel,
      status: 'operational'
    };
  }

  async checkHealth() {
    try {
      // Test the AI service with a simple query
      const testMessage = 'Hello, this is a health check.';
      const systemPrompt = 'You are a helpful assistant. Respond with "OK" for health checks.';
      
      const response = await this.generateResponse(testMessage, systemPrompt);
      
      return {
        status: 'healthy',
        provider: this.provider,
        response: response,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      };
    } catch (error) {
      logger.error('AI health check failed', { error: error.message });
      return {
        status: 'unhealthy',
        provider: this.provider,
        error: error.message,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      };
    }
  }
}

module.exports = new AIService(); 