const express = require('express');
const router = express.Router();
const toolsService = require('../services/toolsService');
const { logger } = require('../utils/logger');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const apicache = require('apicache');

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

// Apply CORS and security headers
router.use(cors());
router.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
});

// Apply rate limiting to all tools routes
router.use(toolsLimiter);

// Setup cache (5 min for heavy endpoints)
const cache = apicache.middleware;

/**
 * @route GET /api/tools
 * @desc Get all tools organized by categories
 * @access Public
 */
router.get('/', cache('5 minutes'), async (req, res) => {
    try {
        const result = toolsService.getAllTools();

        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: result.error,
                message: result.message
            });
        }

        logger.info('Tools retrieved successfully', { count: result.data.totalTools });

        res.json({
            success: true,
            data: {
                tools: result.data.allTools,
                toolsByCategory: result.data.tools,
                categories: result.data.categories,
                totalTools: result.data.totalTools,
                categoryCount: result.data.categoryCount
            },
            message: `Retrieved ${result.data.totalTools} tools across ${result.data.categoryCount} categories`
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
router.get('/categories', cache('5 minutes'), async (req, res) => {
    try {
        const result = await toolsService.getCategories();
        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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
        const result = await toolsService.getToolDetails(toolId, category);
        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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

        // For now, we'll use 'General' as the default subcategory
        // In a more sophisticated implementation, we could look up the tool to find its subcategory
        const subcategory = 'General';
        
        const result = await toolsService.executeTool(category, subcategory, toolId, parameters);

        logger.info('Tool executed successfully', {
            category,
            subcategory,
            toolId,
            type: result.type
        });

        res.json({
            success: true,
            data: result,
            message: `${result.tool || toolId} execution completed`
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
