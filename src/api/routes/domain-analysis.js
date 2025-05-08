/**
 * Domain Analysis API Routes
 * 
 * This file defines the API routes for domain analysis functionality.
 * It follows the Vibe Coding guidelines for API organization.
 */

const express = require('express');
const { initLogger } = require('../../utils/logger');
const { validateDomain } = require('../../utils/security');

// Initialize logger
const logger = initLogger({ level: 'info', console: { enabled: true } });

/**
 * Initialize domain analysis routes
 * @param {Object} mcpServices MCP services
 * @returns {Object} Express router
 */
function initializeDomainAnalysisRoutes(mcpServices) {
  logger.info('Initializing domain analysis routes');
  
  const router = express.Router();
  
  /**
   * @api {get} /api/domain-analysis/services Get services
   * @apiName GetDomainServices
   * @apiGroup DomainAnalysis
   * @apiDescription Get available services for domain analysis
   * 
   * @apiSuccess {Object[]} services List of services
   * @apiSuccess {String} services.id Service ID
   * @apiSuccess {String} services.name Service name
   * @apiSuccess {String} services.description Service description
   * @apiSuccess {Boolean} services.default Whether the service is enabled by default
   */
  router.get('/services', async (req, res, next) => {
    try {
      logger.debug('Getting domain analysis services');
      
      // Define services
      const services = [
        {
          id: 'whois',
          name: 'WHOIS',
          description: 'Get WHOIS information for the domain',
          default: true
        },
        {
          id: 'dns',
          name: 'DNS Records',
          description: 'Get DNS records for the domain',
          default: true
        },
        {
          id: 'ssl',
          name: 'SSL Certificate',
          description: 'Get SSL certificate information for the domain',
          default: true
        },
        {
          id: 'wayback',
          name: 'Wayback Machine',
          description: 'Get historical snapshots of the domain from the Wayback Machine',
          default: true
        },
        {
          id: 'technology',
          name: 'Technology Stack',
          description: 'Identify technologies used on the domain',
          default: true
        },
        {
          id: 'security',
          name: 'Security Headers',
          description: 'Check security headers for the domain',
          default: true
        },
        {
          id: 'reputation',
          name: 'Reputation',
          description: 'Check domain reputation and blacklists',
          default: true
        },
        {
          id: 'related',
          name: 'Related Domains',
          description: 'Find domains related to the target domain',
          default: true
        }
      ];
      
      res.json({
        services
      });
    } catch (error) {
      logger.error('Error getting domain analysis services', { error: error.message, stack: error.stack });
      next(error);
    }
  });
  
  /**
   * @api {post} /api/domain-analysis Analyze domain
   * @apiName AnalyzeDomain
   * @apiGroup DomainAnalysis
   * @apiDescription Analyze a domain
   * 
   * @apiParam {String} domain Domain to analyze
   * @apiParam {String[]} services Services to use for analysis
   * 
   * @apiSuccess {Object} results Analysis results
   */
  router.post('/', async (req, res, next) => {
    try {
      const { domain, services } = req.body;
      
      // Validate request
      if (!domain) {
        return res.status(400).json({
          error: {
            message: 'Domain is required',
            status: 400,
            code: 'MISSING_DOMAIN'
          }
        });
      }
      
      if (!validateDomain(domain)) {
        return res.status(400).json({
          error: {
            message: 'Invalid domain format',
            status: 400,
            code: 'INVALID_DOMAIN'
          }
        });
      }
      
      if (!services || !Array.isArray(services) || services.length === 0) {
        return res.status(400).json({
          error: {
            message: 'At least one service is required',
            status: 400,
            code: 'MISSING_SERVICES'
          }
        });
      }
      
      logger.debug('Analyzing domain', { domain, services });
      
      // Placeholder for domain analysis results
      // In a real implementation, this would call external APIs
      const results = {
        domain,
        services,
        timestamp: new Date().toISOString(),
        results: {
          whois: services.includes('whois') ? {
            status: 'pending'
          } : null,
          dns: services.includes('dns') ? {
            status: 'pending'
          } : null,
          ssl: services.includes('ssl') ? {
            status: 'pending'
          } : null,
          wayback: services.includes('wayback') ? {
            status: 'pending'
          } : null,
          technology: services.includes('technology') ? {
            status: 'pending'
          } : null,
          security: services.includes('security') ? {
            status: 'pending'
          } : null,
          reputation: services.includes('reputation') ? {
            status: 'pending'
          } : null,
          related: services.includes('related') ? {
            status: 'pending'
          } : null
        }
      };
      
      // Use AI to analyze domain if OpenRouter is available
      let aiAnalysis = null;
      
      if (mcpServices.openRouter) {
        try {
          // Generate a prompt for domain analysis
          const prompt = `
            Please analyze the domain "${domain}" and provide insights:
            1. What type of organization might own this domain?
            2. What are potential security concerns with this domain?
            3. What additional investigations would you recommend?
            
            Format the response as JSON with the following structure:
            {
              "organization": {
                "type": "Likely organization type",
                "confidence": "High/Medium/Low",
                "reasoning": "Reasoning for this assessment"
              },
              "security": [
                {"concern": "Security concern", "description": "Description of the concern"}
              ],
              "recommendations": [
                {"investigation": "Recommended investigation", "reason": "Reason for this investigation"}
              ]
            }
          `;
          
          const response = await mcpServices.openRouter.generateText(prompt, {
            temperature: 0.3
          });
          
          try {
            // Extract JSON from the response
            const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/{[\s\S]*?}/);
            const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
            aiAnalysis = JSON.parse(jsonStr);
          } catch (error) {
            logger.warn('Failed to parse AI domain analysis as JSON', { error: error.message });
          }
        } catch (error) {
          logger.warn('Failed to generate AI domain analysis', { error: error.message });
        }
      }
      
      if (aiAnalysis) {
        results.aiAnalysis = aiAnalysis;
      }
      
      res.json(results);
      
      // Log domain analysis to Taskmaster if available
      if (mcpServices.taskmaster) {
        try {
          await mcpServices.taskmaster.createTask({
            type: 'domain-analysis',
            data: {
              domain,
              services,
              timestamp: new Date().toISOString()
            },
            status: 'completed'
          });
        } catch (error) {
          logger.warn('Failed to log domain analysis to Taskmaster', { error: error.message });
        }
      }
    } catch (error) {
      logger.error('Error analyzing domain', { error: error.message, stack: error.stack });
      next(error);
    }
  });
  
  logger.info('Domain analysis routes initialized');
  
  return router;
}

module.exports = initializeDomainAnalysisRoutes;
