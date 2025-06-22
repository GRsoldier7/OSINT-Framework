const express = require('express');
const router = express.Router();
const searchService = require('../services/searchService');
const aiService = require('../services/aiService');
const { logger } = require('../utils/logger');

// Middleware to validate search queries
const validateSearchQuery = (req, res, next) => {
  const { query } = req.body;
  
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({
      error: 'Invalid search query',
      message: 'Search query is required and must be a non-empty string'
    });
  }
  
  if (query.length > 500) {
    return res.status(400).json({
      error: 'Query too long',
      message: 'Search query must be less than 500 characters'
    });
  }
  
  req.body.query = query.trim();
  next();
};

// POST /api/search/basic
// Basic search across multiple engines
router.post('/basic', validateSearchQuery, async (req, res) => {
  try {
    const { query, engines = ['google', 'bing', 'duckduckgo'], options = {} } = req.body;
    
    logger.search(`Starting basic search for query: ${query}`, { engines, options });
    
    const results = await searchService.searchMultipleEngines(query, engines, options);
    
    logger.search(`Basic search completed for query: ${query}`, {
      totalEngines: results.metadata.totalEngines,
      successful: results.metadata.successfulSearches,
      failed: results.metadata.failedSearches
    });
    
    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.errorWithContext(error, { route: '/api/search/basic', query: req.body.query });
    res.status(500).json({
      error: 'Search failed',
      message: error.message
    });
  }
});

// POST /api/search/advanced
// Advanced search with filters and AI analysis
router.post('/advanced', validateSearchQuery, async (req, res) => {
  try {
    const { query, engines, filters = {}, includeAI = true, options = {} } = req.body;
    
    logger.search(`Starting advanced search for query: ${query}`, { engines, filters, includeAI });
    
    // Perform search with filters
    const searchResults = await searchService.searchWithFilters(query, filters);
    
    let aiAnalysis = null;
    if (includeAI) {
      logger.ai(`Starting AI analysis for query: ${query}`);
      aiAnalysis = await aiService.analyzeSearchResults(searchResults);
    }
    
    const response = {
      success: true,
      data: {
        searchResults,
        aiAnalysis,
        filters,
        timestamp: new Date().toISOString()
      }
    };
    
    logger.search(`Advanced search completed for query: ${query}`, {
      hasAI: !!aiAnalysis,
      filterCount: Object.keys(filters).length
    });
    
    res.json(response);
  } catch (error) {
    logger.errorWithContext(error, { route: '/api/search/advanced', query: req.body.query });
    res.status(500).json({
      error: 'Advanced search failed',
      message: error.message
    });
  }
});

// POST /api/search/social
// Social media specific search
router.post('/social', validateSearchQuery, async (req, res) => {
  try {
    const { query, platforms = ['twitter', 'facebook', 'instagram', 'linkedin', 'reddit'], options = {} } = req.body;
    
    logger.search(`Starting social media search for query: ${query}`, { platforms });
    
    const results = await searchService.searchMultipleEngines(query, platforms, {
      ...options,
      usePuppeteer: true // Social media often requires JavaScript
    });
    
    logger.search(`Social media search completed for query: ${query}`, {
      platforms,
      successful: results.metadata.successfulSearches
    });
    
    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.errorWithContext(error, { route: '/api/search/social', query: req.body.query });
    res.status(500).json({
      error: 'Social media search failed',
      message: error.message
    });
  }
});

// POST /api/search/news
// News-specific search
router.post('/news', validateSearchQuery, async (req, res) => {
  try {
    const { query, engines = ['google-news', 'bing-news'], dateRange, options = {} } = req.body;
    
    logger.search(`Starting news search for query: ${query}`, { engines, dateRange });
    
    const filters = dateRange ? { dateRange } : {};
    const results = await searchService.searchWithFilters(query, filters);
    
    logger.search(`News search completed for query: ${query}`, {
      engines,
      dateRange,
      resultCount: Object.keys(results.results).length
    });
    
    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.errorWithContext(error, { route: '/api/search/news', query: req.body.query });
    res.status(500).json({
      error: 'News search failed',
      message: error.message
    });
  }
});

// POST /api/search/images
// Image search
router.post('/images', validateSearchQuery, async (req, res) => {
  try {
    const { query, engines = ['google-images', 'bing-images'], options = {} } = req.body;
    
    logger.search(`Starting image search for query: ${query}`, { engines });
    
    const results = await searchService.searchMultipleEngines(query, engines, options);
    
    logger.search(`Image search completed for query: ${query}`, {
      engines,
      successful: results.metadata.successfulSearches
    });
    
    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.errorWithContext(error, { route: '/api/search/images', query: req.body.query });
    res.status(500).json({
      error: 'Image search failed',
      message: error.message
    });
  }
});

// GET /api/search/suggestions
// Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        error: 'Query parameter required',
        message: 'Please provide a query parameter'
      });
    }
    
    logger.search(`Getting search suggestions for: ${query}`);
    
    const suggestions = await searchService.getSearchSuggestions(query);
    
    res.json({
      success: true,
      data: {
        query,
        suggestions,
        count: suggestions.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.errorWithContext(error, { route: '/api/search/suggestions', query: req.query.query });
    res.status(500).json({
      error: 'Failed to get suggestions',
      message: error.message
    });
  }
});

// GET /api/search/trends
// Get search trends
router.get('/trends', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        error: 'Query parameter required',
        message: 'Please provide a query parameter'
      });
    }
    
    logger.search(`Getting search trends for: ${query}`);
    
    const trends = await searchService.searchTrends(query);
    
    res.json({
      success: true,
      data: {
        query,
        trends
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.errorWithContext(error, { route: '/api/search/trends', query: req.query.query });
    res.status(500).json({
      error: 'Failed to get trends',
      message: error.message
    });
  }
});

// GET /api/search/engines
// Get available search engines
router.get('/engines', (req, res) => {
  try {
    const engines = searchService.searchEngines;
    
    res.json({
      success: true,
      data: {
        engines,
        categories: Object.keys(engines),
        totalEngines: Object.values(engines).reduce((acc, category) => acc + Object.keys(category).length, 0)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.errorWithContext(error, { route: '/api/search/engines' });
    res.status(500).json({
      error: 'Failed to get engines',
      message: error.message
    });
  }
});

// POST /api/search/batch
// Batch search multiple queries
router.post('/batch', async (req, res) => {
  try {
    const { queries, engines = ['google', 'bing'], options = {} } = req.body;
    
    if (!Array.isArray(queries) || queries.length === 0) {
      return res.status(400).json({
        error: 'Invalid queries',
        message: 'Queries must be a non-empty array'
      });
    }
    
    if (queries.length > 10) {
      return res.status(400).json({
        error: 'Too many queries',
        message: 'Maximum 10 queries allowed per batch'
      });
    }
    
    logger.search(`Starting batch search for ${queries.length} queries`, { engines });
    
    const results = [];
    const startTime = Date.now();
    
    for (const query of queries) {
      try {
        const result = await searchService.searchMultipleEngines(query, engines, options);
        results.push({ query, success: true, data: result });
      } catch (error) {
        logger.error(`Batch search failed for query: ${query}`, error);
        results.push({ query, success: false, error: error.message });
      }
    }
    
    const duration = Date.now() - startTime;
    
    logger.search(`Batch search completed`, {
      totalQueries: queries.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      duration: `${duration}ms`
    });
    
    res.json({
      success: true,
      data: {
        results,
        summary: {
          total: queries.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          duration: `${duration}ms`
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.errorWithContext(error, { route: '/api/search/batch' });
    res.status(500).json({
      error: 'Batch search failed',
      message: error.message
    });
  }
});

// Health check for search service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'search',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 