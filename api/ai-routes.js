/**
 * AI API Routes for OSINT Framework
 * Provides endpoints for AI capabilities
 */

const express = require('express');
const router = express.Router();
const aiService = require('../services/ai-service');

/**
 * @route   POST /api/ai/search-suggestions
 * @desc    Generate search suggestions based on a query
 * @access  Public
 */
router.post('/search-suggestions', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Query is required and must be a string' 
      });
    }

    const suggestions = await aiService.generateSearchSuggestions(query);
    
    return res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error in search suggestions endpoint:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate search suggestions',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/ai/analyze-email
 * @desc    Analyze an email address for OSINT insights
 * @access  Public
 */
router.post('/analyze-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required and must be a string' 
      });
    }

    const analysis = await aiService.analyzeEmail(email);
    
    return res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error in email analysis endpoint:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze email',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/ai/analyze-domain
 * @desc    Analyze a domain for OSINT insights
 * @access  Public
 */
router.post('/analyze-domain', async (req, res) => {
  try {
    const { domain } = req.body;
    
    if (!domain || typeof domain !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Domain is required and must be a string' 
      });
    }

    const analysis = await aiService.analyzeDomain(domain);
    
    return res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error in domain analysis endpoint:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze domain',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/ai/investigation-plan
 * @desc    Generate an OSINT investigation plan
 * @access  Public
 */
router.post('/investigation-plan', async (req, res) => {
  try {
    const { target, context } = req.body;
    
    if (!target || typeof target !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Target is required and must be a string' 
      });
    }

    const plan = await aiService.generateInvestigationPlan(target, context || '');
    
    return res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error in investigation plan endpoint:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate investigation plan',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/ai/generate
 * @desc    Generate a response to a prompt
 * @access  Public
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, systemPrompt, temperature, max_tokens } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Prompt is required and must be a string' 
      });
    }

    const options = {
      systemPrompt: systemPrompt || undefined,
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 1000
    };

    const response = await aiService.generateResponse(prompt, options);
    
    return res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error in generate endpoint:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate response',
      message: error.message
    });
  }
});

module.exports = router;
