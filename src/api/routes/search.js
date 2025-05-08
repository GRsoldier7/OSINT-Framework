/**
 * Search API Routes
 * 
 * This file defines the API routes for search functionality.
 * It follows the Vibe Coding guidelines for API organization.
 */

const express = require('express');
const { initLogger } = require('../../utils/logger');

// Initialize logger
const logger = initLogger({ level: 'info', console: { enabled: true } });

/**
 * Initialize search routes
 * @param {Object} mcpServices MCP services
 * @returns {Object} Express router
 */
function initializeSearchRoutes(mcpServices) {
  logger.info('Initializing search routes');
  
  const router = express.Router();
  
  /**
   * @api {get} /api/search/engines Get search engines
   * @apiName GetSearchEngines
   * @apiGroup Search
   * @apiDescription Get available search engines
   * 
   * @apiSuccess {Object[]} engines List of search engines
   * @apiSuccess {String} engines.id Engine ID
   * @apiSuccess {String} engines.name Engine name
   * @apiSuccess {String} engines.url Engine URL
   * @apiSuccess {String} engines.category Engine category
   * @apiSuccess {Boolean} engines.default Whether the engine is enabled by default
   */
  router.get('/engines', async (req, res, next) => {
    try {
      logger.debug('Getting search engines');
      
      // Get search engines from Context7 if available
      if (mcpServices.context7) {
        const searchEngines = await mcpServices.context7.getOsintResources('search-engines');
        
        return res.json({
          engines: searchEngines
        });
      }
      
      // Fallback to static list if Context7 is not available
      const searchEngines = [
        {
          id: 'google',
          name: 'Google',
          url: 'https://www.google.com/search?q={query}',
          category: 'general',
          default: true
        },
        {
          id: 'bing',
          name: 'Bing',
          url: 'https://www.bing.com/search?q={query}',
          category: 'general',
          default: true
        },
        {
          id: 'duckduckgo',
          name: 'DuckDuckGo',
          url: 'https://duckduckgo.com/?q={query}',
          category: 'general',
          default: true
        },
        {
          id: 'yandex',
          name: 'Yandex',
          url: 'https://yandex.com/search/?text={query}',
          category: 'general',
          default: true
        },
        {
          id: 'google-news',
          name: 'Google News',
          url: 'https://news.google.com/search?q={query}',
          category: 'news',
          default: true
        },
        {
          id: 'google-images',
          name: 'Google Images',
          url: 'https://www.google.com/search?tbm=isch&q={query}',
          category: 'images',
          default: true
        },
        {
          id: 'twitter',
          name: 'Twitter',
          url: 'https://twitter.com/search?q={query}',
          category: 'social',
          default: true
        },
        {
          id: 'reddit',
          name: 'Reddit',
          url: 'https://www.reddit.com/search/?q={query}',
          category: 'social',
          default: true
        }
      ];
      
      res.json({
        engines: searchEngines
      });
    } catch (error) {
      logger.error('Error getting search engines', { error: error.message, stack: error.stack });
      next(error);
    }
  });
  
  /**
   * @api {post} /api/search Search
   * @apiName Search
   * @apiGroup Search
   * @apiDescription Perform a search
   * 
   * @apiParam {String} query Search query
   * @apiParam {String[]} engines Search engines to use
   * 
   * @apiSuccess {Object[]} results Search results
   * @apiSuccess {String} results.engine Engine ID
   * @apiSuccess {String} results.url Result URL
   */
  router.post('/', async (req, res, next) => {
    try {
      const { query, engines } = req.body;
      
      // Validate request
      if (!query) {
        return res.status(400).json({
          error: {
            message: 'Query is required',
            status: 400,
            code: 'MISSING_QUERY'
          }
        });
      }
      
      if (!engines || !Array.isArray(engines) || engines.length === 0) {
        return res.status(400).json({
          error: {
            message: 'At least one engine is required',
            status: 400,
            code: 'MISSING_ENGINES'
          }
        });
      }
      
      logger.debug('Performing search', { query, engines });
      
      // Generate search URLs
      const results = engines.map(engineId => {
        // Get search engine from Context7 if available
        if (mcpServices.context7) {
          const searchEngines = mcpServices.context7.getOsintResources('search-engines');
          const engine = searchEngines.find(e => e.id === engineId);
          
          if (engine) {
            return {
              engine: engineId,
              url: engine.url.replace('{query}', encodeURIComponent(query))
            };
          }
        }
        
        // Fallback to static mapping if Context7 is not available
        const engineUrls = {
          'google': 'https://www.google.com/search?q={query}',
          'bing': 'https://www.bing.com/search?q={query}',
          'duckduckgo': 'https://duckduckgo.com/?q={query}',
          'yandex': 'https://yandex.com/search/?text={query}',
          'google-news': 'https://news.google.com/search?q={query}',
          'google-images': 'https://www.google.com/search?tbm=isch&q={query}',
          'twitter': 'https://twitter.com/search?q={query}',
          'reddit': 'https://www.reddit.com/search/?q={query}'
        };
        
        const url = engineUrls[engineId];
        
        if (!url) {
          return null;
        }
        
        return {
          engine: engineId,
          url: url.replace('{query}', encodeURIComponent(query))
        };
      }).filter(Boolean);
      
      // Use AI to generate search queries if OpenRouter is available
      let aiSuggestions = null;
      
      if (mcpServices.openRouter) {
        try {
          aiSuggestions = await mcpServices.openRouter.generateSearchQueries(query);
        } catch (error) {
          logger.warn('Failed to generate AI search suggestions', { error: error.message });
        }
      }
      
      res.json({
        query,
        engines,
        results,
        aiSuggestions
      });
      
      // Log search to Taskmaster if available
      if (mcpServices.taskmaster) {
        try {
          await mcpServices.taskmaster.createTask({
            type: 'search',
            data: {
              query,
              engines,
              timestamp: new Date().toISOString()
            },
            status: 'completed'
          });
        } catch (error) {
          logger.warn('Failed to log search to Taskmaster', { error: error.message });
        }
      }
    } catch (error) {
      logger.error('Error performing search', { error: error.message, stack: error.stack });
      next(error);
    }
  });
  
  logger.info('Search routes initialized');
  
  return router;
}

module.exports = initializeSearchRoutes;
