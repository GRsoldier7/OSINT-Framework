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
      // Check if we have valid API keys (not just present, but actually valid)
      const hasValidKeys = this.openrouterApiKey && this.openrouterApiKey !== 'your-openrouter-api-key-here' ||
                          this.openaiApiKey && this.openaiApiKey !== 'your-openai-api-key-here';
      
      if (!hasValidKeys) {
        return this.getFallbackResponse(message, context);
      }

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
      
      // Return fallback response on error
      return this.getFallbackResponse(message, context);
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

  getFallbackResponse(message, context = {}) {
    const userMessage = message.toLowerCase();
    
    // Enhanced fallback responses based on user input
    if (userMessage.includes('tool') || userMessage.includes('find') || userMessage.includes('search')) {
      return {
        success: true,
        response: `I can help you find OSINT tools! Here are some popular categories to explore:

🔍 **Search Tools**: Google Dorks, Shodan, Censys
🌐 **Web Intelligence**: Wayback Machine, Archive.org
👥 **People Search**: Social media platforms, public records
📱 **Social Media**: Twitter, Facebook, Instagram analysis tools
🗺️ **Geographic**: Satellite imagery, mapping tools
🔒 **Security**: Vulnerability scanners, threat intelligence

You can browse these categories in the sidebar or use the search bar to find specific tools. What type of investigation are you working on?`,
        toolRecommendations: [
          {
            category: 'search',
            name: 'Search Tools',
            description: 'Advanced search engines and discovery platforms',
            relevance: 0.9,
            icon: '🔍',
            color: '#3b82f6'
          },
          {
            category: 'socialMedia',
            name: 'Social Media',
            description: 'Social media analysis and monitoring tools',
            relevance: 0.8,
            icon: '📱',
            color: '#10b981'
          }
        ],
        provider: 'fallback'
      };
    }
    
    if (userMessage.includes('social') || userMessage.includes('twitter') || userMessage.includes('facebook')) {
      return {
        success: true,
        response: `For social media OSINT, here are some excellent tools and techniques:

**Twitter/X Analysis:**
- Advanced search operators
- User profile analysis
- Hashtag tracking
- Network mapping

**Facebook Investigation:**
- Graph search techniques
- Public profile analysis
- Group and page monitoring

**General Social Media:**
- Cross-platform username search
- Image reverse search
- Geolocation analysis

Would you like me to show you specific tools for any of these platforms?`,
        toolRecommendations: [
          {
            category: 'socialMedia',
            name: 'Social Media Tools',
            description: 'Platform-specific analysis and monitoring',
            relevance: 0.95,
            icon: '📱',
            color: '#10b981'
          }
        ],
        provider: 'fallback'
      };
    }
    
    if (userMessage.includes('domain') || userMessage.includes('website') || userMessage.includes('ip')) {
      return {
        success: true,
        response: `For domain and website investigation, here are key areas to explore:

**Domain Analysis:**
- WHOIS information
- DNS records
- SSL certificate details
- Subdomain enumeration

**IP Investigation:**
- Geolocation
- Reverse DNS lookup
- Port scanning
- Network mapping

**Website Intelligence:**
- Wayback Machine archives
- Technology detection
- Security headers
- Content analysis

Check out the "Network" and "Domains" categories for specific tools!`,
        toolRecommendations: [
          {
            category: 'network',
            name: 'Network Tools',
            description: 'Domain analysis and network investigation',
            relevance: 0.9,
            icon: '🌐',
            color: '#8b5cf6'
          }
        ],
        provider: 'fallback'
      };
    }
    
    if (userMessage.includes('image') || userMessage.includes('photo') || userMessage.includes('picture')) {
      return {
        success: true,
        response: `For image and visual OSINT, here are powerful techniques:

**Reverse Image Search:**
- Google Lens
- TinEye
- Yandex Images
- Bing Visual Search

**Image Analysis:**
- EXIF data extraction
- Metadata analysis
- Geolocation from photos
- Object recognition

**Video Analysis:**
- Frame extraction
- Audio analysis
- Background investigation

Look in the "Images" category for specialized tools!`,
        toolRecommendations: [
          {
            category: 'images',
            name: 'Image Analysis',
            description: 'Reverse search and visual intelligence tools',
            relevance: 0.9,
            icon: '🖼️',
            color: '#f59e0b'
          }
        ],
        provider: 'fallback'
      };
    }
    
    if (userMessage.includes('person') || userMessage.includes('people') || userMessage.includes('name')) {
      return {
        success: true,
        response: `For people and identity investigation, here are effective approaches:

**People Search:**
- Public records databases
- Social media profiles
- Professional networks
- Court records

**Username Enumeration:**
- Cross-platform username search
- Email address discovery
- Handle correlation

**Background Research:**
- Employment history
- Education records
- Business affiliations
- Online presence

Explore the "People Search" category for comprehensive tools!`,
        toolRecommendations: [
          {
            category: 'geographic',
            name: 'People Search',
            description: 'Identity and background investigation tools',
            relevance: 0.85,
            icon: '👥',
            color: '#ef4444'
          }
        ],
        provider: 'fallback'
      };
    }
    
    if (userMessage.includes('help') || userMessage.includes('how') || userMessage.includes('guide')) {
      return {
        success: true,
        response: `I'm here to help with your OSINT investigations! Here's how I can assist:

**What I can do:**
- Recommend tools for specific tasks
- Explain OSINT methodologies
- Guide you through investigation workflows
- Suggest alternative approaches

**Getting started:**
1. Browse tools by category in the sidebar
2. Use the search bar to find specific tools
3. Ask me about any investigation type
4. Save your favorite tools for quick access

**Popular investigation types:**
- Social media analysis
- Domain and website research
- People and identity investigation
- Image and visual intelligence
- Network and infrastructure analysis

What type of investigation are you working on?`,
        toolRecommendations: [
          {
            category: 'search',
            name: 'Getting Started',
            description: 'Essential tools for OSINT beginners',
            relevance: 0.8,
            icon: '🚀',
            color: '#3b82f6'
          }
        ],
        provider: 'fallback'
      };
    }
    
    // Default helpful response
    return {
      success: true,
      response: `I'm your OSINT assistant! I can help you with:

🔍 **Tool Recommendations**: Find the right tools for your investigation
📚 **Methodology Guidance**: Learn OSINT techniques and workflows
🎯 **Investigation Support**: Get help with specific research tasks
💡 **Best Practices**: Understand ethical and legal considerations

**Quick Start:**
- Browse categories in the sidebar
- Use the search bar to find specific tools
- Ask me about any investigation type
- Save your favorite tools

What would you like to investigate today?`,
      toolRecommendations: [
        {
          category: 'search',
          name: 'Search Tools',
          description: 'Start with basic search and discovery tools',
          relevance: 0.7,
          icon: '🔍',
          color: '#3b82f6'
        },
        {
          category: 'socialMedia',
          name: 'Social Media',
          description: 'Analyze social media platforms and networks',
          relevance: 0.6,
          icon: '📱',
          color: '#10b981'
        }
      ],
      provider: 'fallback'
    };
  }
}

module.exports = new AIService(); 