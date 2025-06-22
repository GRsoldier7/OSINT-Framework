const express = require('express');
const router = express.Router();
const toolsService = require('../services/toolsService');
const { logger } = require('../utils/logger');
const rateLimit = require('express-rate-limit');

// Rate limiting for tools API
const toolsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to all tools routes
router.use(toolsLimiter);

/**
 * @route GET /api/tools/quick-access
 * @desc Get quick access tools (most popular/recent)
 * @access Public
 */
router.get('/quick-access', async (req, res) => {
    try {
        // Define quick access tools (most commonly used)
        const quickAccessTools = [
            { category: 'search', toolId: 'googleLens' },
            { category: 'geographic', toolId: 'googleEarthPro' },
            { category: 'socialMedia', toolId: 'whatsMyName' },
            { category: 'data', toolId: 'waybackMachine' },
            { category: 'analysis', toolId: 'aiAnalysis' },
            { category: 'network', toolId: 'domainAnalysis' },
            { category: 'search', toolId: 'advancedGoogleDorks' },
            { category: 'socialMedia', toolId: 'twitterAdvancedSearch' },
        ];

        const tools = [];
        for (const quickTool of quickAccessTools) {
            try {
                const tool = await toolsService.getToolDetails(quickTool.toolId, quickTool.category);
                if (tool) {
                    tools.push({
                        ...tool,
                        category: quickTool.category
                    });
                }
            } catch (error) {
                // Skip if tool not found
                continue;
            }
        }

        logger.info('Quick access tools retrieved', { count: tools.length });
        
        res.json({
            success: true,
            data: {
                tools,
                count: tools.length,
                description: 'Most popular and frequently used OSINT tools'
            },
            message: `Retrieved ${tools.length} quick access tools`
        });
    } catch (error) {
        logger.error('Error retrieving quick access tools', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve quick access tools',
            message: error.message
        });
    }
});

/**
 * @route GET /api/tools/favorites
 * @desc Get user's favorite tools
 * @access Public
 */
router.get('/favorites', async (req, res) => {
    try {
        const favorites = await toolsService.getFavoriteTools();
        logger.info('Favorite tools retrieved', { count: favorites.length });
        
        res.json({
            success: true,
            data: favorites,
            message: `Retrieved ${favorites.length} favorite tools`
        });
    } catch (error) {
        logger.error('Error retrieving favorite tools', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve favorite tools',
            message: error.message
        });
    }
});

/**
 * @route GET /api/tools/favorites/with-data
 * @desc Get favorite tools with full tool data
 * @access Public
 */
router.get('/favorites/with-data', async (req, res) => {
    try {
        const favorites = await toolsService.getFavoriteToolsWithData();
        logger.info('Favorite tools with data retrieved', { count: favorites.length });
        
        res.json({
            success: true,
            data: favorites,
            message: `Retrieved ${favorites.length} favorite tools with data`
        });
    } catch (error) {
        logger.error('Error retrieving favorite tools with data', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve favorite tools with data',
            message: error.message
        });
    }
});

/**
 * @route GET /api/tools/favorites/analytics
 * @desc Get favorites analytics
 * @access Public
 */
router.get('/favorites/analytics', async (req, res) => {
    try {
        const analytics = await toolsService.getFavoritesAnalytics();
        logger.info('Favorites analytics retrieved');
        
        res.json({
            success: true,
            data: analytics,
            message: 'Favorites analytics retrieved successfully'
        });
    } catch (error) {
        logger.error('Error retrieving favorites analytics', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve favorites analytics',
            message: error.message
        });
    }
});

/**
 * @route GET /api/tools/favorites/search
 * @desc Search favorites
 * @access Public
 */
router.get('/favorites/search', async (req, res) => {
    try {
        const { q: query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter is required',
                message: 'Please provide a search query'
            });
        }

        const results = await toolsService.searchFavorites(query);
        logger.info('Favorites search completed', { query, count: results.length });
        
        res.json({
            success: true,
            data: results,
            message: `Found ${results.length} favorites matching "${query}"`
        });
    } catch (error) {
        logger.error('Error searching favorites', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to search favorites',
            message: error.message
        });
    }
});

/**
 * @route POST /api/tools/favorites
 * @desc Add a tool to favorites
 * @access Public
 */
router.post('/favorites', async (req, res) => {
    try {
        const { category, toolId, metadata = {} } = req.body;
        
        if (!category || !toolId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'Category and toolId are required'
            });
        }

        const result = await toolsService.addToFavorites(category, toolId, metadata);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                message: result.error
            });
        }

        logger.info('Tool added to favorites', { category, toolId });
        
        res.json({
            success: true,
            data: result.favorite,
            message: 'Tool added to favorites successfully'
        });
    } catch (error) {
        logger.error('Error adding tool to favorites', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to add tool to favorites',
            message: error.message
        });
    }
});

/**
 * @route PUT /api/tools/favorites/:category/:toolId
 * @desc Update favorite metadata
 * @access Public
 */
router.put('/favorites/:category/:toolId', async (req, res) => {
    try {
        const { category, toolId } = req.params;
        const updates = req.body;
        
        const result = await toolsService.updateFavorite(category, toolId, updates);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                message: result.error
            });
        }

        logger.info('Favorite updated', { category, toolId });
        
        res.json({
            success: true,
            data: result.favorite,
            message: 'Favorite updated successfully'
        });
    } catch (error) {
        logger.error('Error updating favorite', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to update favorite',
            message: error.message
        });
    }
});

/**
 * @route DELETE /api/tools/favorites/:category/:toolId
 * @desc Remove a tool from favorites
 * @access Public
 */
router.delete('/favorites/:category/:toolId', async (req, res) => {
    try {
        const { category, toolId } = req.params;
        const result = await toolsService.removeFromFavorites(category, toolId);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                message: result.error
            });
        }

        logger.info('Tool removed from favorites', { category, toolId });
        
        res.json({
            success: true,
            data: result.removed,
            message: 'Tool removed from favorites successfully'
        });
    } catch (error) {
        logger.error('Error removing tool from favorites', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to remove tool from favorites',
            message: error.message
        });
    }
});

/**
 * @route POST /api/tools/favorites/:category/:toolId/usage
 * @desc Increment favorite usage count
 * @access Public
 */
router.post('/favorites/:category/:toolId/usage', async (req, res) => {
    try {
        const { category, toolId } = req.params;
        const result = await toolsService.incrementFavoriteUsage(category, toolId);
        
        logger.info('Favorite usage incremented', { category, toolId });
        
        res.json({
            success: true,
            message: 'Usage count updated successfully'
        });
    } catch (error) {
        logger.error('Error incrementing favorite usage', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to update usage count',
            message: error.message
        });
    }
});

/**
 * @route GET /api/tools/favorites/export
 * @desc Export favorites
 * @access Public
 */
router.get('/favorites/export', async (req, res) => {
    try {
        const result = await toolsService.exportFavorites();
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                message: result.error
            });
        }

        logger.info('Favorites exported');
        
        res.json({
            success: true,
            data: result.data,
            message: 'Favorites exported successfully'
        });
    } catch (error) {
        logger.error('Error exporting favorites', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to export favorites',
            message: error.message
        });
    }
});

/**
 * @route POST /api/tools/favorites/import
 * @desc Import favorites
 * @access Public
 */
router.post('/favorites/import', async (req, res) => {
    try {
        const importData = req.body;
        const result = await toolsService.importFavorites(importData);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                message: result.error
            });
        }

        logger.info('Favorites imported', { imported: result.imported });
        
        res.json({
            success: true,
            data: result,
            message: `Imported ${result.imported} new favorites`
        });
    } catch (error) {
        logger.error('Error importing favorites', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to import favorites',
            message: error.message
        });
    }
});

/**
 * @route DELETE /api/tools/favorites
 * @desc Clear all favorites
 * @access Public
 */
router.delete('/favorites', async (req, res) => {
    try {
        const result = await toolsService.clearFavorites();
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                message: result.error
            });
        }

        logger.info('All favorites cleared', { cleared: result.cleared });
        
        res.json({
            success: true,
            data: result,
            message: `Cleared ${result.cleared} favorites`
        });
    } catch (error) {
        logger.error('Error clearing favorites', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to clear favorites',
            message: error.message
        });
    }
});

/**
 * @route GET /api/tools/favorites/check/:category/:toolId
 * @desc Check if tool is favorited
 * @access Public
 */
router.get('/favorites/check/:category/:toolId', async (req, res) => {
    try {
        const { category, toolId } = req.params;
        const isFavorited = await toolsService.isFavorited(category, toolId);
        
        res.json({
            success: true,
            data: { isFavorited },
            message: isFavorited ? 'Tool is favorited' : 'Tool is not favorited'
        });
    } catch (error) {
        logger.error('Error checking favorite status', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to check favorite status',
            message: error.message
        });
    }
});

/**
 * @route GET /api/tools/statistics
 * @desc Get tool usage statistics
 * @access Public
 */
router.get('/statistics', async (req, res) => {
    try {
        const stats = await toolsService.getToolStatistics();
        logger.info('Tool statistics retrieved');
        
        res.json({
            success: true,
            data: stats,
            message: 'Tool statistics retrieved successfully'
        });
    } catch (error) {
        logger.error('Error retrieving tool statistics', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve tool statistics',
            message: error.message
        });
    }
});

/**
 * @route GET /api/tools/recommended
 * @desc Get recommended tools based on query
 * @access Public
 */
router.get('/recommended', async (req, res) => {
    try {
        const { q: query, limit = 5 } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter is required',
                message: 'Please provide a search query'
            });
        }

        const recommendations = await toolsService.getRecommendedTools(query, parseInt(limit));
        logger.info('Tool recommendations retrieved', { query, count: recommendations.length });
        
        res.json({
            success: true,
            data: recommendations,
            message: `Found ${recommendations.length} recommended tools for "${query}"`
        });
    } catch (error) {
        logger.error('Error retrieving tool recommendations', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve tool recommendations',
            message: error.message
        });
    }
});

/**
 * @route GET /api/tools
 * @desc Get all tools organized by categories
 * @access Public
 */
router.get('/', async (req, res) => {
    try {
        const result = toolsService.getAllTools();
        
        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: result.error,
                message: result.message
            });
        }
        
        logger.info('Tools retrieved successfully', { count: result.totalTools });
        
        res.json({
            success: true,
            tools: result.tools,
            categories: result.categories,
            totalTools: result.totalTools,
            categoryCount: result.categoryCount,
            message: `Retrieved ${result.totalTools} tools across ${result.categoryCount} categories`
        });
    } catch (error) {
        logger.error('Error retrieving tools', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve tools',
            message: error.message
        });
    }
});

/**
 * @route GET /api/tools/categories
 * @desc Get all tool categories
 * @access Public
 */
router.get('/categories', async (req, res) => {
    try {
        const categories = toolsService.getCategories();
        logger.info('Tool categories retrieved successfully');
        
        res.json({
            success: true,
            data: categories,
            message: `Retrieved ${Object.keys(categories).length} categories`
        });
    } catch (error) {
        logger.error('Error retrieving tool categories', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve tool categories',
            message: error.message
        });
    }
});

/**
 * @route GET /api/tools/category/:category
 * @desc Get tools by specific category
 * @access Public
 */
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const tools = await toolsService.getToolsByCategory(category);
        
        logger.info('Tools retrieved by category', { category, count: tools.count });
        
        res.json({
            success: true,
            data: tools,
            message: `Retrieved ${tools.count} tools from ${tools.category.name} category`
        });
    } catch (error) {
        logger.error('Error retrieving tools by category', { 
            category: req.params.category, 
            error: error.message 
        });
        res.status(404).json({
            success: false,
            error: 'Category not found',
            message: error.message
        });
    }
});

/**
 * @route GET /api/tools/search
 * @desc Search tools by query and filters
 * @access Public
 */
router.get('/search', async (req, res) => {
    try {
        const { q: query, type, api, internal, limit = 50 } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter is required',
                message: 'Please provide a search query'
            });
        }

        const filters = {};
        if (type) filters.type = type;
        if (api !== undefined) filters.api = api === 'true';
        if (internal !== undefined) filters.internal = internal === 'true';

        const results = await toolsService.searchTools(query, filters);
        
        // Apply limit
        if (limit) {
            results.results = results.results.slice(0, parseInt(limit));
        }

        logger.info('Tools search completed', { 
            query, 
            filters, 
            results: results.count 
        });
        
        res.json({
            success: true,
            data: results,
            message: `Found ${results.count} tools matching "${query}"`
        });
    } catch (error) {
        logger.error('Error searching tools', { 
            query: req.query.q, 
            error: error.message 
        });
        res.status(500).json({
            success: false,
            error: 'Failed to search tools',
            message: error.message
        });
    }
});

/**
 * @route GET /api/tools/:category
 * @desc Get tools by category (alternative route)
 * @access Public
 */
router.get('/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const tools = await toolsService.getToolsByCategory(category);
        
        logger.info('Tools retrieved by category', { category, count: tools.count });
        
        res.json({
            success: true,
            data: tools,
            message: `Retrieved ${tools.count} tools from ${tools.category.name} category`
        });
    } catch (error) {
        logger.error('Error retrieving tools by category', { 
            category: req.params.category, 
            error: error.message 
        });
        res.status(404).json({
            success: false,
            error: 'Category not found',
            message: error.message
        });
    }
});

/**
 * @route GET /api/tools/:category/:toolId
 * @desc Get specific tool details
 * @access Public
 */
router.get('/:category/:toolId', async (req, res) => {
    try {
        const { category, toolId } = req.params;
        const tool = await toolsService.getToolDetails(toolId, category);
        
        logger.info('Tool details retrieved', { category, toolId });
        
        res.json({
            success: true,
            data: tool,
            message: `Retrieved details for ${tool.name}`
        });
    } catch (error) {
        logger.error('Error retrieving tool details', { 
            category: req.params.category, 
            toolId: req.params.toolId, 
            error: error.message 
        });
        res.status(404).json({
            success: false,
            error: 'Tool not found',
            message: error.message
        });
    }
});

/**
 * @route POST /api/tools/:category/:toolId/execute
 * @desc Execute a specific tool
 * @access Public
 */
router.post('/:category/:toolId/execute', async (req, res) => {
    try {
        const { category, toolId } = req.params;
        const parameters = req.body || {};
        
        const result = await toolsService.executeTool(toolId, category, parameters);
        
        logger.info('Tool executed successfully', { 
            category, 
            toolId, 
            type: result.type 
        });
        
        res.json({
            success: true,
            data: result,
            message: `${result.tool} execution completed`
        });
    } catch (error) {
        logger.error('Error executing tool', { 
            category: req.params.category, 
            toolId: req.params.toolId, 
            error: error.message 
        });
        res.status(500).json({
            success: false,
            error: 'Failed to execute tool',
            message: error.message
        });
    }
});

module.exports = router; 