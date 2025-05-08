/**
 * IP Analysis API Routes
 * 
 * This file defines the API routes for IP analysis functionality.
 * It follows the Vibe Coding guidelines for API organization.
 */

const express = require('express');
const { initLogger } = require('../../utils/logger');
const { validateIP } = require('../../utils/security');

// Initialize logger
const logger = initLogger({ level: 'info', console: { enabled: true } });

/**
 * Initialize IP analysis routes
 * @param {Object} mcpServices MCP services
 * @returns {Object} Express router
 */
function initializeIPAnalysisRoutes(mcpServices) {
  logger.info('Initializing IP analysis routes');
  
  const router = express.Router();
  
  /**
   * @api {get} /api/ip-analysis/services Get services
   * @apiName GetIPServices
   * @apiGroup IPAnalysis
   * @apiDescription Get available services for IP analysis
   * 
   * @apiSuccess {Object[]} services List of services
   * @apiSuccess {String} services.id Service ID
   * @apiSuccess {String} services.name Service name
   * @apiSuccess {String} services.description Service description
   * @apiSuccess {Boolean} services.default Whether the service is enabled by default
   */
  router.get('/services', async (req, res, next) => {
    try {
      logger.debug('Getting IP analysis services');
      
      // Define services
      const services = [
        {
          id: 'geolocation',
          name: 'Geolocation',
          description: 'Get geolocation information for the IP address',
          default: true
        },
        {
          id: 'reputation',
          name: 'Reputation',
          description: 'Check IP reputation and blacklists',
          default: true
        },
        {
          id: 'shodan',
          name: 'Shodan',
          description: 'Get Shodan information for the IP address',
          default: true
        },
        {
          id: 'whois',
          name: 'WHOIS',
          description: 'Get WHOIS information for the IP address',
          default: true
        },
        {
          id: 'ports',
          name: 'Open Ports',
          description: 'Check for open ports on the IP address',
          default: true
        },
        {
          id: 'domains',
          name: 'Hosted Domains',
          description: 'Find domains hosted on the IP address',
          default: true
        },
        {
          id: 'asn',
          name: 'ASN Information',
          description: 'Get ASN information for the IP address',
          default: true
        },
        {
          id: 'tor',
          name: 'Tor Exit Node',
          description: 'Check if the IP address is a Tor exit node',
          default: true
        }
      ];
      
      res.json({
        services
      });
    } catch (error) {
      logger.error('Error getting IP analysis services', { error: error.message, stack: error.stack });
      next(error);
    }
  });
  
  /**
   * @api {post} /api/ip-analysis Analyze IP
   * @apiName AnalyzeIP
   * @apiGroup IPAnalysis
   * @apiDescription Analyze an IP address
   * 
   * @apiParam {String} ip IP address to analyze
   * @apiParam {String[]} services Services to use for analysis
   * 
   * @apiSuccess {Object} results Analysis results
   */
  router.post('/', async (req, res, next) => {
    try {
      const { ip, services } = req.body;
      
      // Validate request
      if (!ip) {
        return res.status(400).json({
          error: {
            message: 'IP address is required',
            status: 400,
            code: 'MISSING_IP'
          }
        });
      }
      
      if (!validateIP(ip)) {
        return res.status(400).json({
          error: {
            message: 'Invalid IP address format',
            status: 400,
            code: 'INVALID_IP'
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
      
      logger.debug('Analyzing IP address', { ip, services });
      
      // Placeholder for IP analysis results
      // In a real implementation, this would call external APIs
      const results = {
        ip,
        services,
        timestamp: new Date().toISOString(),
        results: {
          geolocation: services.includes('geolocation') ? {
            status: 'pending'
          } : null,
          reputation: services.includes('reputation') ? {
            status: 'pending'
          } : null,
          shodan: services.includes('shodan') ? {
            status: 'pending'
          } : null,
          whois: services.includes('whois') ? {
            status: 'pending'
          } : null,
          ports: services.includes('ports') ? {
            status: 'pending'
          } : null,
          domains: services.includes('domains') ? {
            status: 'pending'
          } : null,
          asn: services.includes('asn') ? {
            status: 'pending'
          } : null,
          tor: services.includes('tor') ? {
            status: 'pending'
          } : null
        }
      };
      
      // Use AI to analyze IP if OpenRouter is available
      let aiAnalysis = null;
      
      if (mcpServices.openRouter) {
        try {
          // Generate a prompt for IP analysis
          const prompt = `
            Please analyze the IP address "${ip}" and provide insights:
            1. What type of entity might be using this IP?
            2. What are potential security concerns with this IP?
            3. What additional investigations would you recommend?
            
            Format the response as JSON with the following structure:
            {
              "entity": {
                "type": "Likely entity type",
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
            logger.warn('Failed to parse AI IP analysis as JSON', { error: error.message });
          }
        } catch (error) {
          logger.warn('Failed to generate AI IP analysis', { error: error.message });
        }
      }
      
      if (aiAnalysis) {
        results.aiAnalysis = aiAnalysis;
      }
      
      res.json(results);
      
      // Log IP analysis to Taskmaster if available
      if (mcpServices.taskmaster) {
        try {
          await mcpServices.taskmaster.createTask({
            type: 'ip-analysis',
            data: {
              ip,
              services,
              timestamp: new Date().toISOString()
            },
            status: 'completed'
          });
        } catch (error) {
          logger.warn('Failed to log IP analysis to Taskmaster', { error: error.message });
        }
      }
    } catch (error) {
      logger.error('Error analyzing IP address', { error: error.message, stack: error.stack });
      next(error);
    }
  });
  
  logger.info('IP analysis routes initialized');
  
  return router;
}

module.exports = initializeIPAnalysisRoutes;
