/**
 * Email Analysis API Routes
 * 
 * This file defines the API routes for email analysis functionality.
 * It follows the Vibe Coding guidelines for API organization.
 */

const express = require('express');
const { initLogger } = require('../../utils/logger');
const { validateEmail } = require('../../utils/security');

// Initialize logger
const logger = initLogger({ level: 'info', console: { enabled: true } });

/**
 * Initialize email analysis routes
 * @param {Object} mcpServices MCP services
 * @returns {Object} Express router
 */
function initializeEmailAnalysisRoutes(mcpServices) {
  logger.info('Initializing email analysis routes');
  
  const router = express.Router();
  
  /**
   * @api {get} /api/email-analysis/services Get services
   * @apiName GetEmailServices
   * @apiGroup EmailAnalysis
   * @apiDescription Get available services for email analysis
   * 
   * @apiSuccess {Object[]} services List of services
   * @apiSuccess {String} services.id Service ID
   * @apiSuccess {String} services.name Service name
   * @apiSuccess {String} services.description Service description
   * @apiSuccess {Boolean} services.default Whether the service is enabled by default
   */
  router.get('/services', async (req, res, next) => {
    try {
      logger.debug('Getting email analysis services');
      
      // Define services
      const services = [
        {
          id: 'haveibeenpwned',
          name: 'Have I Been Pwned',
          description: 'Check if email has been compromised in data breaches',
          default: true
        },
        {
          id: 'hunter',
          name: 'Hunter',
          description: 'Find email verification status and related information',
          default: true
        },
        {
          id: 'emailrep',
          name: 'EmailRep',
          description: 'Check email reputation and risk score',
          default: true
        },
        {
          id: 'domain',
          name: 'Domain Analysis',
          description: 'Analyze the email domain',
          default: true
        },
        {
          id: 'social',
          name: 'Social Media',
          description: 'Find social media profiles associated with the email',
          default: true
        }
      ];
      
      res.json({
        services
      });
    } catch (error) {
      logger.error('Error getting email analysis services', { error: error.message, stack: error.stack });
      next(error);
    }
  });
  
  /**
   * @api {post} /api/email-analysis Analyze email
   * @apiName AnalyzeEmail
   * @apiGroup EmailAnalysis
   * @apiDescription Analyze an email address
   * 
   * @apiParam {String} email Email address to analyze
   * @apiParam {String[]} services Services to use for analysis
   * 
   * @apiSuccess {Object} results Analysis results
   */
  router.post('/', async (req, res, next) => {
    try {
      const { email, services } = req.body;
      
      // Validate request
      if (!email) {
        return res.status(400).json({
          error: {
            message: 'Email is required',
            status: 400,
            code: 'MISSING_EMAIL'
          }
        });
      }
      
      if (!validateEmail(email)) {
        return res.status(400).json({
          error: {
            message: 'Invalid email format',
            status: 400,
            code: 'INVALID_EMAIL'
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
      
      logger.debug('Analyzing email', { email, services });
      
      // Placeholder for email analysis results
      // In a real implementation, this would call external APIs
      const results = {
        email,
        services,
        timestamp: new Date().toISOString(),
        results: {
          haveibeenpwned: services.includes('haveibeenpwned') ? {
            breaches: [],
            status: 'pending'
          } : null,
          hunter: services.includes('hunter') ? {
            status: 'pending'
          } : null,
          emailrep: services.includes('emailrep') ? {
            status: 'pending'
          } : null,
          domain: services.includes('domain') ? {
            status: 'pending'
          } : null,
          social: services.includes('social') ? {
            status: 'pending'
          } : null
        }
      };
      
      // Use AI to analyze email if OpenRouter is available
      let aiAnalysis = null;
      
      if (mcpServices.openRouter) {
        try {
          // Generate a prompt for email analysis
          const prompt = `
            Please analyze the email address "${email}" and provide insights:
            1. What can we determine from the email structure?
            2. What does the domain tell us?
            3. What are potential security concerns with this email?
            
            Format the response as JSON with the following structure:
            {
              "structure": {
                "username": "Analysis of the username part",
                "domain": "Analysis of the domain part"
              },
              "security": [
                {"concern": "Security concern", "description": "Description of the concern"}
              ],
              "recommendations": [
                {"action": "Recommended action", "reason": "Reason for this action"}
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
            logger.warn('Failed to parse AI email analysis as JSON', { error: error.message });
          }
        } catch (error) {
          logger.warn('Failed to generate AI email analysis', { error: error.message });
        }
      }
      
      if (aiAnalysis) {
        results.aiAnalysis = aiAnalysis;
      }
      
      res.json(results);
      
      // Log email analysis to Taskmaster if available
      if (mcpServices.taskmaster) {
        try {
          await mcpServices.taskmaster.createTask({
            type: 'email-analysis',
            data: {
              email,
              services,
              timestamp: new Date().toISOString()
            },
            status: 'completed'
          });
        } catch (error) {
          logger.warn('Failed to log email analysis to Taskmaster', { error: error.message });
        }
      }
    } catch (error) {
      logger.error('Error analyzing email', { error: error.message, stack: error.stack });
      next(error);
    }
  });
  
  logger.info('Email analysis routes initialized');
  
  return router;
}

module.exports = initializeEmailAnalysisRoutes;
