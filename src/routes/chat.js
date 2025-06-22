const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { logger } = require('../utils/logger');
const rateLimit = require('express-rate-limit');

// Rate limiting for chat API
const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per minute
    message: {
        error: 'Too many chat requests from this IP, please try again later.',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to all chat routes
router.use(chatLimiter);

/**
 * @route POST /api/chat
 * @desc Send a message to the AI assistant
 * @access Public
 */
router.post('/', async (req, res) => {
    try {
        const { message, context = {} } = req.body;
        
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Message is required and must be a string',
                message: 'Please provide a valid message'
            });
        }

        // Add current page context
        context.currentPage = 'Tools Hub';
        
        logger.info('Chat request received', { 
            messageLength: message.length,
            context: context
        });

        const result = await aiService.chat(message, context);
        
        if (result.success) {
            logger.info('Chat response generated successfully', { 
                provider: result.provider,
                hasRecommendations: result.toolRecommendations.length > 0
            });
            
            res.json({
                success: true,
                data: {
                    response: result.response,
                    toolRecommendations: result.toolRecommendations,
                    provider: result.provider,
                    timestamp: new Date().toISOString()
                },
                message: 'Chat response generated successfully'
            });
        } else {
            logger.error('Chat response failed', { error: result.error });
            res.status(500).json({
                success: false,
                error: 'Failed to generate chat response',
                message: result.message
            });
        }
    } catch (error) {
        logger.error('Chat route error', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

/**
 * @route GET /api/ai/health
 * @desc Check AI service health
 * @access Public
 */
router.get('/health', async (req, res) => {
    try {
        const health = await aiService.checkHealth();
        
        res.json({
            success: true,
            data: health,
            message: 'AI service health check completed'
        });
    } catch (error) {
        logger.error('AI health check error', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'AI service health check failed',
            message: error.message
        });
    }
});

/**
 * @route GET /api/chat/provider
 * @desc Get AI provider information
 * @access Public
 */
router.get('/provider', async (req, res) => {
    try {
        const providerInfo = aiService.getProviderInfo();
        
        res.json({
            success: true,
            data: providerInfo,
            message: 'Provider information retrieved successfully'
        });
    } catch (error) {
        logger.error('Provider info error', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to get provider information',
            message: error.message
        });
    }
});

/**
 * @route POST /api/chat/analyze
 * @desc Analyze data with AI
 * @access Public
 */
router.post('/analyze', async (req, res) => {
    try {
        const { data, type = 'general' } = req.body;
        
        if (!data) {
            return res.status(400).json({
                success: false,
                error: 'Data is required',
                message: 'Please provide data to analyze'
            });
        }

        logger.info('Data analysis request received', { type });

        const result = await aiService.analyzeData(data, type);
        
        if (result.success) {
            res.json({
                success: true,
                data: result,
                message: 'Data analysis completed successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to analyze data',
                message: result.message
            });
        }
    } catch (error) {
        logger.error('Data analysis error', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

/**
 * @route POST /api/chat/report
 * @desc Generate AI report
 * @access Public
 */
router.post('/report', async (req, res) => {
    try {
        const { data, template = 'standard' } = req.body;
        
        if (!data) {
            return res.status(400).json({
                success: false,
                error: 'Data is required',
                message: 'Please provide data for report generation'
            });
        }

        logger.info('Report generation request received', { template });

        const result = await aiService.generateReport(data, template);
        
        if (result.success) {
            res.json({
                success: true,
                data: result,
                message: 'Report generated successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to generate report',
                message: result.message
            });
        }
    } catch (error) {
        logger.error('Report generation error', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

/**
 * @route POST /api/chat/threat
 * @desc Assess threat level
 * @access Public
 */
router.post('/threat', async (req, res) => {
    try {
        const { data } = req.body;
        
        if (!data) {
            return res.status(400).json({
                success: false,
                error: 'Data is required',
                message: 'Please provide data for threat assessment'
            });
        }

        logger.info('Threat assessment request received');

        const result = await aiService.assessThreat(data);
        
        if (result.success) {
            res.json({
                success: true,
                data: result,
                message: 'Threat assessment completed successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to assess threat',
                message: result.message
            });
        }
    } catch (error) {
        logger.error('Threat assessment error', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

module.exports = router; 