/**
 * Application Configuration
 * 
 * This file configures the main application settings for the OSINT Framework.
 */

const mcpConfig = require('./mcp.config');

const AppConfig = {
  // Core application settings
  app: {
    name: 'Ultimate OSINT Framework',
    version: '1.0.0',
    description: 'A comprehensive, browser-based Open Source Intelligence (OSINT) framework',
    environment: process.env.NODE_ENV || 'development',
    debug: process.env.DEBUG === 'true' || false,
    baseUrl: process.env.BASE_URL || 'http://localhost:3000'
  },
  
  // Server configuration (if using server-side components)
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    cors: {
      enabled: true,
      origins: ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowCredentials: true
    },
    compression: {
      enabled: true,
      level: 6 // 0-9, higher = more compression but slower
    },
    rateLimit: {
      enabled: true,
      windowMs: 60000, // 1 minute
      max: 100 // 100 requests per minute
    }
  },
  
  // Client configuration
  client: {
    pwa: {
      enabled: true,
      offlineSupport: true,
      installPrompt: true,
      cacheStrategy: 'network-first' // 'network-first', 'cache-first', 'stale-while-revalidate'
    },
    performance: {
      lazyLoading: true,
      codeSplitting: true,
      prefetching: true,
      imageOptimization: true,
      minification: true
    },
    storage: {
      localStorage: {
        enabled: true,
        prefix: 'osint_',
        maxSize: 5242880 // 5 MB
      },
      indexedDB: {
        enabled: true,
        name: 'osint_db',
        version: 1,
        stores: [
          { name: 'searches', keyPath: 'id', indices: ['timestamp', 'type'] },
          { name: 'results', keyPath: 'id', indices: ['searchId', 'timestamp'] },
          { name: 'settings', keyPath: 'id' }
        ]
      }
    }
  },
  
  // OSINT tools configuration
  osint: {
    tools: {
      searchEngine: {
        enabled: true,
        defaultEngines: ['google', 'bing', 'duckduckgo', 'yandex'],
        maxConcurrentSearches: 5,
        timeout: 30000 // 30 seconds
      },
      usernameSearch: {
        enabled: true,
        defaultPlatforms: ['twitter', 'facebook', 'instagram', 'linkedin', 'github', 'reddit'],
        maxConcurrentSearches: 10,
        timeout: 30000 // 30 seconds
      },
      emailAnalysis: {
        enabled: true,
        defaultServices: ['haveibeenpwned', 'hunter', 'emailrep'],
        maxConcurrentSearches: 5,
        timeout: 30000 // 30 seconds
      },
      domainAnalysis: {
        enabled: true,
        defaultServices: ['whois', 'dns', 'ssl', 'wayback'],
        maxConcurrentSearches: 5,
        timeout: 60000 // 60 seconds
      },
      ipAnalysis: {
        enabled: true,
        defaultServices: ['geolocation', 'reputation', 'shodan'],
        maxConcurrentSearches: 5,
        timeout: 30000 // 30 seconds
      },
      imageAnalysis: {
        enabled: true,
        defaultServices: ['reverse', 'metadata', 'ai'],
        maxConcurrentSearches: 3,
        timeout: 60000 // 60 seconds
      },
      documentAnalysis: {
        enabled: true,
        defaultServices: ['metadata', 'content', 'ai'],
        maxConcurrentSearches: 3,
        timeout: 60000 // 60 seconds
      },
      aiAssistant: {
        enabled: true,
        defaultModel: 'anthropic/claude-3-sonnet-20240229',
        maxTokens: 2000,
        temperature: 0.7,
        timeout: 60000 // 60 seconds
      }
    },
    
    // External API integrations
    apis: {
      haveibeenpwned: {
        enabled: true,
        apiKey: process.env.HAVEIBEENPWNED_API_KEY,
        baseUrl: 'https://haveibeenpwned.com/api/v3'
      },
      shodan: {
        enabled: true,
        apiKey: process.env.SHODAN_API_KEY,
        baseUrl: 'https://api.shodan.io'
      },
      virustotal: {
        enabled: true,
        apiKey: process.env.VIRUSTOTAL_API_KEY,
        baseUrl: 'https://www.virustotal.com/api/v3'
      },
      hunter: {
        enabled: true,
        apiKey: process.env.HUNTER_API_KEY,
        baseUrl: 'https://api.hunter.io/v2'
      },
      securitytrails: {
        enabled: true,
        apiKey: process.env.SECURITYTRAILS_API_KEY,
        baseUrl: 'https://api.securitytrails.com/v1'
      }
    }
  },
  
  // MCP integration
  mcp: mcpConfig,
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info', // 'debug', 'info', 'warn', 'error'
    format: 'json', // 'json', 'text'
    colorize: true,
    timestamp: true,
    console: {
      enabled: true
    },
    file: {
      enabled: process.env.LOG_TO_FILE === 'true',
      path: './logs/app.log',
      maxSize: 10485760, // 10 MB
      maxFiles: 5,
      compress: true
    }
  },
  
  // Security configuration
  security: {
    cors: {
      enabled: true,
      origins: ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowCredentials: true
    },
    contentSecurity: {
      enabled: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'],
        imgSrc: ["'self'", 'data:', '*'],
        connectSrc: ["'self'", 'api.openrouter.ai', '*.mcp.example.com', 'api.shodan.io', 'api.hunter.io', 'haveibeenpwned.com']
      }
    },
    xss: {
      enabled: true,
      mode: 'block'
    },
    frameOptions: {
      enabled: true,
      action: 'deny'
    },
    referrerPolicy: {
      enabled: true,
      policy: 'same-origin'
    }
  }
};

module.exports = AppConfig;
