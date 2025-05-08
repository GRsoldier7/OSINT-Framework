/**
 * Username Search API Routes
 * 
 * This file defines the API routes for username search functionality.
 * It follows the Vibe Coding guidelines for API organization.
 */

const express = require('express');
const { initLogger } = require('../../utils/logger');
const { validateUsername } = require('../../utils/security');

// Initialize logger
const logger = initLogger({ level: 'info', console: { enabled: true } });

/**
 * Initialize username search routes
 * @param {Object} mcpServices MCP services
 * @returns {Object} Express router
 */
function initializeUsernameSearchRoutes(mcpServices) {
  logger.info('Initializing username search routes');
  
  const router = express.Router();
  
  /**
   * @api {get} /api/username-search/platforms Get platforms
   * @apiName GetPlatforms
   * @apiGroup UsernameSearch
   * @apiDescription Get available platforms for username search
   * 
   * @apiSuccess {Object[]} platforms List of platforms
   * @apiSuccess {String} platforms.id Platform ID
   * @apiSuccess {String} platforms.name Platform name
   * @apiSuccess {String} platforms.url Platform URL pattern
   * @apiSuccess {String} platforms.category Platform category
   * @apiSuccess {Boolean} platforms.default Whether the platform is enabled by default
   */
  router.get('/platforms', async (req, res, next) => {
    try {
      logger.debug('Getting username search platforms');
      
      // Get platforms from Context7 if available
      if (mcpServices.context7) {
        const platforms = await mcpServices.context7.getOsintResources('username-platforms');
        
        return res.json({
          platforms
        });
      }
      
      // Fallback to static list if Context7 is not available
      const platforms = [
        {
          id: 'twitter',
          name: 'Twitter',
          url: 'https://twitter.com/{username}',
          category: 'social',
          default: true
        },
        {
          id: 'facebook',
          name: 'Facebook',
          url: 'https://facebook.com/{username}',
          category: 'social',
          default: true
        },
        {
          id: 'instagram',
          name: 'Instagram',
          url: 'https://instagram.com/{username}',
          category: 'social',
          default: true
        },
        {
          id: 'linkedin',
          name: 'LinkedIn',
          url: 'https://linkedin.com/in/{username}',
          category: 'professional',
          default: true
        },
        {
          id: 'github',
          name: 'GitHub',
          url: 'https://github.com/{username}',
          category: 'development',
          default: true
        },
        {
          id: 'reddit',
          name: 'Reddit',
          url: 'https://reddit.com/user/{username}',
          category: 'social',
          default: true
        },
        {
          id: 'youtube',
          name: 'YouTube',
          url: 'https://youtube.com/@{username}',
          category: 'social',
          default: true
        },
        {
          id: 'tiktok',
          name: 'TikTok',
          url: 'https://tiktok.com/@{username}',
          category: 'social',
          default: true
        },
        {
          id: 'pinterest',
          name: 'Pinterest',
          url: 'https://pinterest.com/{username}',
          category: 'social',
          default: true
        },
        {
          id: 'medium',
          name: 'Medium',
          url: 'https://medium.com/@{username}',
          category: 'blogging',
          default: true
        },
        {
          id: 'steam',
          name: 'Steam',
          url: 'https://steamcommunity.com/id/{username}',
          category: 'gaming',
          default: true
        },
        {
          id: 'xbox',
          name: 'Xbox',
          url: 'https://xboxgamertag.com/search/{username}',
          category: 'gaming',
          default: true
        },
        {
          id: 'playstation',
          name: 'PlayStation',
          url: 'https://psnprofiles.com/{username}',
          category: 'gaming',
          default: true
        },
        {
          id: 'twitch',
          name: 'Twitch',
          url: 'https://twitch.tv/{username}',
          category: 'gaming',
          default: true
        },
        {
          id: 'patreon',
          name: 'Patreon',
          url: 'https://patreon.com/{username}',
          category: 'crowdfunding',
          default: true
        }
      ];
      
      res.json({
        platforms
      });
    } catch (error) {
      logger.error('Error getting username search platforms', { error: error.message, stack: error.stack });
      next(error);
    }
  });
  
  /**
   * @api {post} /api/username-search Search for username
   * @apiName SearchUsername
   * @apiGroup UsernameSearch
   * @apiDescription Search for a username across platforms
   * 
   * @apiParam {String} username Username to search for
   * @apiParam {String[]} platforms Platforms to search on
   * 
   * @apiSuccess {Object[]} results Search results
   * @apiSuccess {String} results.platform Platform ID
   * @apiSuccess {String} results.url Result URL
   */
  router.post('/', async (req, res, next) => {
    try {
      const { username, platforms } = req.body;
      
      // Validate request
      if (!username) {
        return res.status(400).json({
          error: {
            message: 'Username is required',
            status: 400,
            code: 'MISSING_USERNAME'
          }
        });
      }
      
      if (!validateUsername(username)) {
        return res.status(400).json({
          error: {
            message: 'Invalid username format',
            status: 400,
            code: 'INVALID_USERNAME'
          }
        });
      }
      
      if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
        return res.status(400).json({
          error: {
            message: 'At least one platform is required',
            status: 400,
            code: 'MISSING_PLATFORMS'
          }
        });
      }
      
      logger.debug('Searching for username', { username, platforms });
      
      // Generate platform URLs
      const results = platforms.map(platformId => {
        // Get platform from Context7 if available
        if (mcpServices.context7) {
          const allPlatforms = mcpServices.context7.getOsintResources('username-platforms');
          const platform = allPlatforms.find(p => p.id === platformId);
          
          if (platform) {
            return {
              platform: platformId,
              url: platform.url.replace('{username}', encodeURIComponent(username))
            };
          }
        }
        
        // Fallback to static mapping if Context7 is not available
        const platformUrls = {
          'twitter': 'https://twitter.com/{username}',
          'facebook': 'https://facebook.com/{username}',
          'instagram': 'https://instagram.com/{username}',
          'linkedin': 'https://linkedin.com/in/{username}',
          'github': 'https://github.com/{username}',
          'reddit': 'https://reddit.com/user/{username}',
          'youtube': 'https://youtube.com/@{username}',
          'tiktok': 'https://tiktok.com/@{username}',
          'pinterest': 'https://pinterest.com/{username}',
          'medium': 'https://medium.com/@{username}',
          'steam': 'https://steamcommunity.com/id/{username}',
          'xbox': 'https://xboxgamertag.com/search/{username}',
          'playstation': 'https://psnprofiles.com/{username}',
          'twitch': 'https://twitch.tv/{username}',
          'patreon': 'https://patreon.com/{username}'
        };
        
        const url = platformUrls[platformId];
        
        if (!url) {
          return null;
        }
        
        return {
          platform: platformId,
          url: url.replace('{username}', encodeURIComponent(username))
        };
      }).filter(Boolean);
      
      // Use AI to analyze username if OpenRouter is available
      let aiAnalysis = null;
      
      if (mcpServices.openRouter) {
        try {
          // Generate a prompt for username analysis
          const prompt = `
            Please analyze the username "${username}" and provide insights:
            1. What might this username reveal about the person?
            2. Are there any patterns or common variations of this username?
            3. What other platforms should be checked for this username?
            
            Format the response as JSON with the following structure:
            {
              "insights": [
                {"category": "identity", "insight": "This username might reveal..."},
                {"category": "patterns", "insight": "Common variations include..."}
              ],
              "recommendations": [
                {"platform": "Platform name", "reason": "Reason to check this platform"}
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
            logger.warn('Failed to parse AI username analysis as JSON', { error: error.message });
          }
        } catch (error) {
          logger.warn('Failed to generate AI username analysis', { error: error.message });
        }
      }
      
      res.json({
        username,
        platforms,
        results,
        aiAnalysis
      });
      
      // Log username search to Taskmaster if available
      if (mcpServices.taskmaster) {
        try {
          await mcpServices.taskmaster.createTask({
            type: 'username-search',
            data: {
              username,
              platforms,
              timestamp: new Date().toISOString()
            },
            status: 'completed'
          });
        } catch (error) {
          logger.warn('Failed to log username search to Taskmaster', { error: error.message });
        }
      }
    } catch (error) {
      logger.error('Error searching for username', { error: error.message, stack: error.stack });
      next(error);
    }
  });
  
  logger.info('Username search routes initialized');
  
  return router;
}

module.exports = initializeUsernameSearchRoutes;
