/**
 * MagicUI MCP Configuration
 * 
 * This file configures the MagicUI MCP server integration for the OSINT Framework.
 * MagicUI provides advanced UI components, theming, and interactive visualizations.
 */

const MagicUIConfig = {
  // Core configuration
  enabled: true,
  serverUrl: process.env.MAGICUI_SERVER_URL || 'https://magicui.mcp.example.com',
  apiKey: process.env.MAGICUI_API_KEY,
  
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
  
  // Theme configuration
  theme: {
    defaultTheme: 'light', // 'light', 'dark', 'system'
    customThemes: [
      {
        id: 'osint-dark',
        name: 'OSINT Dark',
        colors: {
          primary: '#3498db',
          secondary: '#2ecc71',
          accent: '#e74c3c',
          background: '#1a1a1a',
          surface: '#2c2c2c',
          text: '#f5f5f5',
          textSecondary: '#aaaaaa',
          border: '#444444',
          error: '#e74c3c',
          warning: '#f39c12',
          info: '#3498db',
          success: '#2ecc71'
        },
        typography: {
          fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          fontSize: 16,
          fontWeightLight: 300,
          fontWeightRegular: 400,
          fontWeightMedium: 500,
          fontWeightBold: 700
        },
        spacing: {
          unit: 8,
          small: 4,
          medium: 8,
          large: 16,
          xlarge: 24
        },
        borderRadius: {
          small: 4,
          medium: 8,
          large: 12,
          pill: 9999
        }
      },
      {
        id: 'osint-light',
        name: 'OSINT Light',
        colors: {
          primary: '#2980b9',
          secondary: '#27ae60',
          accent: '#c0392b',
          background: '#f5f5f5',
          surface: '#ffffff',
          text: '#333333',
          textSecondary: '#666666',
          border: '#dddddd',
          error: '#e74c3c',
          warning: '#f39c12',
          info: '#3498db',
          success: '#2ecc71'
        },
        typography: {
          fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          fontSize: 16,
          fontWeightLight: 300,
          fontWeightRegular: 400,
          fontWeightMedium: 500,
          fontWeightBold: 700
        },
        spacing: {
          unit: 8,
          small: 4,
          medium: 8,
          large: 16,
          xlarge: 24
        },
        borderRadius: {
          small: 4,
          medium: 8,
          large: 12,
          pill: 9999
        }
      }
    ],
    allowUserCustomization: true,
    persistThemePreference: true
  },
  
  // Component configuration
  components: {
    enableAll: true,
    customComponents: [
      {
        id: 'osint-search-bar',
        name: 'OSINT Search Bar',
        description: 'Advanced search bar with OSINT-specific features',
        category: 'search',
        defaultProps: {
          placeholder: 'Enter search query...',
          showAdvancedOptions: true,
          enableHistory: true,
          enableAutocomplete: true
        }
      },
      {
        id: 'osint-results-grid',
        name: 'OSINT Results Grid',
        description: 'Grid view for displaying OSINT search results',
        category: 'results',
        defaultProps: {
          columns: 3,
          showFilters: true,
          enableSorting: true,
          enablePagination: true,
          itemsPerPage: 20
        }
      },
      {
        id: 'osint-data-visualization',
        name: 'OSINT Data Visualization',
        description: 'Interactive visualization for OSINT data',
        category: 'visualization',
        defaultProps: {
          type: 'network', // 'network', 'timeline', 'map', 'table'
          enableZoom: true,
          enablePan: true,
          enableSelection: true,
          enableExport: true
        }
      }
    ]
  },
  
  // Layout configuration
  layouts: {
    defaultLayout: 'dashboard',
    layouts: [
      {
        id: 'dashboard',
        name: 'Dashboard',
        description: 'Main dashboard layout',
        areas: ['header', 'sidebar', 'main', 'footer'],
        grid: {
          columns: 12,
          rows: 'auto'
        }
      },
      {
        id: 'search',
        name: 'Search',
        description: 'Search-focused layout',
        areas: ['header', 'search', 'results', 'footer'],
        grid: {
          columns: 12,
          rows: 'auto'
        }
      },
      {
        id: 'analysis',
        name: 'Analysis',
        description: 'Analysis-focused layout',
        areas: ['header', 'sidebar', 'main', 'details', 'footer'],
        grid: {
          columns: 12,
          rows: 'auto'
        }
      }
    ],
    allowUserCustomization: true,
    persistLayoutPreference: true
  },
  
  // Visualization configuration
  visualizations: {
    enableAll: true,
    defaultVisualization: 'network',
    visualizations: [
      {
        id: 'network',
        name: 'Network Graph',
        description: 'Network graph visualization',
        category: 'relationships',
        defaultProps: {
          nodeSize: 10,
          edgeWidth: 2,
          enablePhysics: true,
          enableClustering: true,
          enableFiltering: true
        }
      },
      {
        id: 'timeline',
        name: 'Timeline',
        description: 'Timeline visualization',
        category: 'temporal',
        defaultProps: {
          showAxis: true,
          enableZoom: true,
          enableGrouping: true,
          enableFiltering: true
        }
      },
      {
        id: 'map',
        name: 'Map',
        description: 'Geographic map visualization',
        category: 'spatial',
        defaultProps: {
          defaultZoom: 3,
          enableClustering: true,
          enableHeatmap: true,
          enableFiltering: true
        }
      }
    ]
  },
  
  // Integration with other MCP servers
  integrations: {
    taskmaster: {
      enabled: true,
      syncUIState: true
    },
    context7: {
      enabled: true,
      enhanceUIWithContext: true
    }
  },
  
  // Logging and monitoring
  logging: {
    level: 'info', // 'debug', 'info', 'warn', 'error'
    includeDetails: true,
    logToConsole: true,
    logToFile: false,
    logFilePath: './logs/magicui.log'
  },
  
  // Performance settings
  performance: {
    enableCodeSplitting: true,
    enableLazyLoading: true,
    enableCaching: true,
    cacheSize: 52428800, // 50 MB
    cacheTTL: 3600, // 1 hour
    enablePrefetching: true,
    prefetchThreshold: 0.7
  }
};

module.exports = MagicUIConfig;
