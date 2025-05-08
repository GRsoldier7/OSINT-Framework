/**
 * AI API Routes
 * 
 * This file defines the API routes for AI capabilities.
 * It follows the Vibe Coding guidelines for API organization.
 */

const express = require('express');
const { initLogger } = require('../../utils/logger');

// Initialize logger
const logger = initLogger({ level: 'info', console: { enabled: true } });

/**
 * Initialize AI routes
 * @param {Object} mcpServices MCP services
 * @returns {Object} Express router
 */
function initializeAIRoutes(mcpServices) {
  logger.info('Initializing AI routes');
  
  const router = express.Router();
  
  /**
   * @api {get} /api/ai/capabilities Get AI capabilities
   * @apiName GetAICapabilities
   * @apiGroup AI
   * @apiDescription Get available AI capabilities
   * 
   * @apiSuccess {Object[]} capabilities List of AI capabilities
   * @apiSuccess {String} capabilities.id Capability ID
   * @apiSuccess {String} capabilities.name Capability name
   * @apiSuccess {String} capabilities.description Capability description
   * @apiSuccess {Boolean} capabilities.available Whether the capability is available
   */
  router.get('/capabilities', async (req, res, next) => {
    try {
      logger.debug('Getting AI capabilities');
      
      // Check if OpenRouter is available
      const openRouterAvailable = !!mcpServices.openRouter;
      
      // Define capabilities
      const capabilities = [
        {
          id: 'entity-extraction',
          name: 'Entity Extraction',
          description: 'Extract entities from text (people, organizations, locations, etc.)',
          available: openRouterAvailable
        },
        {
          id: 'relationship-mapping',
          name: 'Relationship Mapping',
          description: 'Map relationships between entities',
          available: openRouterAvailable
        },
        {
          id: 'search-query-generation',
          name: 'Search Query Generation',
          description: 'Generate effective search queries for OSINT research',
          available: openRouterAvailable
        },
        {
          id: 'data-analysis',
          name: 'Data Analysis',
          description: 'Analyze OSINT data for patterns and insights',
          available: openRouterAvailable
        },
        {
          id: 'report-generation',
          name: 'Report Generation',
          description: 'Generate comprehensive OSINT reports',
          available: openRouterAvailable
        },
        {
          id: 'image-analysis',
          name: 'Image Analysis',
          description: 'Analyze images for OSINT purposes',
          available: openRouterAvailable
        },
        {
          id: 'social-media-analysis',
          name: 'Social Media Analysis',
          description: 'Analyze social media content for OSINT purposes',
          available: openRouterAvailable
        }
      ];
      
      res.json({
        capabilities,
        openRouterAvailable
      });
    } catch (error) {
      logger.error('Error getting AI capabilities', { error: error.message, stack: error.stack });
      next(error);
    }
  });
  
  /**
   * @api {post} /api/ai/extract-entities Extract entities
   * @apiName ExtractEntities
   * @apiGroup AI
   * @apiDescription Extract entities from text
   * 
   * @apiParam {String} text Text to analyze
   * 
   * @apiSuccess {Object} entities Extracted entities
   */
  router.post('/extract-entities', async (req, res, next) => {
    try {
      const { text } = req.body;
      
      // Validate request
      if (!text) {
        return res.status(400).json({
          error: {
            message: 'Text is required',
            status: 400,
            code: 'MISSING_TEXT'
          }
        });
      }
      
      // Check if OpenRouter is available
      if (!mcpServices.openRouter) {
        return res.status(503).json({
          error: {
            message: 'AI service is not available',
            status: 503,
            code: 'AI_SERVICE_UNAVAILABLE'
          }
        });
      }
      
      logger.debug('Extracting entities from text', { textLength: text.length });
      
      // Extract entities using OpenRouter
      const entities = await mcpServices.openRouter.extractEntities(text);
      
      res.json({
        entities
      });
      
      // Log entity extraction to Taskmaster if available
      if (mcpServices.taskmaster) {
        try {
          await mcpServices.taskmaster.createTask({
            type: 'entity-extraction',
            data: {
              textLength: text.length,
              entityCount: Object.values(entities).reduce((count, arr) => count + arr.length, 0),
              timestamp: new Date().toISOString()
            },
            status: 'completed'
          });
        } catch (error) {
          logger.warn('Failed to log entity extraction to Taskmaster', { error: error.message });
        }
      }
    } catch (error) {
      logger.error('Error extracting entities', { error: error.message, stack: error.stack });
      next(error);
    }
  });
  
  /**
   * @api {post} /api/ai/map-relationships Map relationships
   * @apiName MapRelationships
   * @apiGroup AI
   * @apiDescription Map relationships between entities
   * 
   * @apiParam {Object} entities Entities to map relationships for
   * 
   * @apiSuccess {Object} relationships Entity relationships
   */
  router.post('/map-relationships', async (req, res, next) => {
    try {
      const { entities } = req.body;
      
      // Validate request
      if (!entities || typeof entities !== 'object') {
        return res.status(400).json({
          error: {
            message: 'Entities object is required',
            status: 400,
            code: 'MISSING_ENTITIES'
          }
        });
      }
      
      // Check if OpenRouter is available
      if (!mcpServices.openRouter) {
        return res.status(503).json({
          error: {
            message: 'AI service is not available',
            status: 503,
            code: 'AI_SERVICE_UNAVAILABLE'
          }
        });
      }
      
      logger.debug('Mapping relationships between entities');
      
      // Map relationships using OpenRouter
      const relationships = await mcpServices.openRouter.mapRelationships(entities);
      
      res.json({
        relationships
      });
      
      // Log relationship mapping to Taskmaster if available
      if (mcpServices.taskmaster) {
        try {
          await mcpServices.taskmaster.createTask({
            type: 'relationship-mapping',
            data: {
              entityCount: Object.values(entities).reduce((count, arr) => count + arr.length, 0),
              relationshipCount: relationships.relationships ? relationships.relationships.length : 0,
              timestamp: new Date().toISOString()
            },
            status: 'completed'
          });
        } catch (error) {
          logger.warn('Failed to log relationship mapping to Taskmaster', { error: error.message });
        }
      }
    } catch (error) {
      logger.error('Error mapping relationships', { error: error.message, stack: error.stack });
      next(error);
    }
  });
  
  /**
   * @api {post} /api/ai/generate-search-queries Generate search queries
   * @apiName GenerateSearchQueries
   * @apiGroup AI
   * @apiDescription Generate search queries for OSINT research
   * 
   * @apiParam {String} topic Research topic
   * 
   * @apiSuccess {Object} queries Generated search queries
   */
  router.post('/generate-search-queries', async (req, res, next) => {
    try {
      const { topic } = req.body;
      
      // Validate request
      if (!topic) {
        return res.status(400).json({
          error: {
            message: 'Topic is required',
            status: 400,
            code: 'MISSING_TOPIC'
          }
        });
      }
      
      // Check if OpenRouter is available
      if (!mcpServices.openRouter) {
        return res.status(503).json({
          error: {
            message: 'AI service is not available',
            status: 503,
            code: 'AI_SERVICE_UNAVAILABLE'
          }
        });
      }
      
      logger.debug('Generating search queries', { topic });
      
      // Generate search queries using OpenRouter
      const queries = await mcpServices.openRouter.generateSearchQueries(topic);
      
      res.json({
        queries
      });
      
      // Log search query generation to Taskmaster if available
      if (mcpServices.taskmaster) {
        try {
          await mcpServices.taskmaster.createTask({
            type: 'search-query-generation',
            data: {
              topic,
              queryCount: Object.values(queries).reduce((count, arr) => count + arr.length, 0),
              timestamp: new Date().toISOString()
            },
            status: 'completed'
          });
        } catch (error) {
          logger.warn('Failed to log search query generation to Taskmaster', { error: error.message });
        }
      }
    } catch (error) {
      logger.error('Error generating search queries', { error: error.message, stack: error.stack });
      next(error);
    }
  });
  
  /**
   * @api {post} /api/ai/generate-report Generate report
   * @apiName GenerateReport
   * @apiGroup AI
   * @apiDescription Generate an OSINT report
   * 
   * @apiParam {Object} data OSINT data
   * @apiParam {String} format Report format ('text', 'markdown', 'html')
   * 
   * @apiSuccess {String} report Generated report
   */
  router.post('/generate-report', async (req, res, next) => {
    try {
      const { data, format = 'markdown' } = req.body;
      
      // Validate request
      if (!data || typeof data !== 'object') {
        return res.status(400).json({
          error: {
            message: 'Data object is required',
            status: 400,
            code: 'MISSING_DATA'
          }
        });
      }
      
      // Check if OpenRouter is available
      if (!mcpServices.openRouter) {
        return res.status(503).json({
          error: {
            message: 'AI service is not available',
            status: 503,
            code: 'AI_SERVICE_UNAVAILABLE'
          }
        });
      }
      
      logger.debug('Generating OSINT report', { format });
      
      // Generate report using OpenRouter
      const report = await mcpServices.openRouter.generateReport(data, { format });
      
      res.json({
        report,
        format
      });
      
      // Log report generation to Taskmaster if available
      if (mcpServices.taskmaster) {
        try {
          await mcpServices.taskmaster.createTask({
            type: 'report-generation',
            data: {
              format,
              reportLength: report.length,
              timestamp: new Date().toISOString()
            },
            status: 'completed'
          });
        } catch (error) {
          logger.warn('Failed to log report generation to Taskmaster', { error: error.message });
        }
      }
    } catch (error) {
      logger.error('Error generating report', { error: error.message, stack: error.stack });
      next(error);
    }
  });
  
  /**
   * @api {post} /api/ai/analyze-image Analyze image
   * @apiName AnalyzeImage
   * @apiGroup AI
   * @apiDescription Analyze an image for OSINT purposes
   * 
   * @apiParam {String} imageUrl URL of the image to analyze
   * 
   * @apiSuccess {Object} analysis Image analysis
   */
  router.post('/analyze-image', async (req, res, next) => {
    try {
      const { imageUrl } = req.body;
      
      // Validate request
      if (!imageUrl) {
        return res.status(400).json({
          error: {
            message: 'Image URL is required',
            status: 400,
            code: 'MISSING_IMAGE_URL'
          }
        });
      }
      
      // Check if OpenRouter is available
      if (!mcpServices.openRouter) {
        return res.status(503).json({
          error: {
            message: 'AI service is not available',
            status: 503,
            code: 'AI_SERVICE_UNAVAILABLE'
          }
        });
      }
      
      logger.debug('Analyzing image', { imageUrl });
      
      // Analyze image using OpenRouter
      const analysis = await mcpServices.openRouter.analyzeImage(imageUrl);
      
      res.json({
        analysis
      });
      
      // Log image analysis to Taskmaster if available
      if (mcpServices.taskmaster) {
        try {
          await mcpServices.taskmaster.createTask({
            type: 'image-analysis',
            data: {
              imageUrl,
              timestamp: new Date().toISOString()
            },
            status: 'completed'
          });
        } catch (error) {
          logger.warn('Failed to log image analysis to Taskmaster', { error: error.message });
        }
      }
    } catch (error) {
      logger.error('Error analyzing image', { error: error.message, stack: error.stack });
      next(error);
    }
  });
  
  logger.info('AI routes initialized');
  
  return router;
}

module.exports = initializeAIRoutes;
