/**
 * Enhanced Express server for the OSINT Framework
 * Includes API routes and static file serving
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const axios = require('axios');

// Create Express app
const app = express();

// Define the port
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // Logging

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_MODEL = process.env.OPENROUTER_API_MODEL || 'google/gemini-2.0-flash-lite-preview-02-05:free';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Generate AI response using OpenRouter API
 * @param {string} prompt - User prompt
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - AI response
 */
async function generateResponse(prompt, options = {}) {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is not configured');
    }

    const defaultOptions = {
      model: OPENROUTER_API_MODEL,
      temperature: 0.7,
      max_tokens: 1000,
    };

    const requestOptions = { ...defaultOptions, ...options };

    console.log(`Calling OpenRouter API with model: ${requestOptions.model}`);

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: requestOptions.model,
        messages: [
          { role: 'system', content: options.systemPrompt || 'You are an AI assistant for OSINT (Open Source Intelligence) research.' },
          { role: 'user', content: prompt }
        ],
        temperature: requestOptions.temperature,
        max_tokens: requestOptions.max_tokens,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://osint-framework.example.com',
          'X-Title': 'OSINT Framework'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error.message);
    if (error.response) {
      console.error('API response:', error.response.data);
    }
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
}

// AI API Routes
app.post('/api/ai/generate', async (req, res) => {
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

    const response = await generateResponse(prompt, options);

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

app.post('/api/ai/search-suggestions', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query is required and must be a string'
      });
    }

    const systemPrompt = `
      You are an expert OSINT researcher helping to generate effective search queries.
      Given a basic search query, suggest 5-7 improved search queries that would help find more relevant information.
      Include variations with quotes, site-specific searches, filetype searches, and boolean operators.
      Respond with ONLY the list of search queries, one per line, with no explanations or other text.
    `;

    const response = await generateResponse(
      `Generate improved search queries for: "${query}"`,
      { systemPrompt, temperature: 0.3 }
    );

    // Parse the response into an array of suggestions
    const suggestions = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('-'));

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

app.post('/api/ai/extract-entities', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required and must be a string'
      });
    }

    const systemPrompt = `
      You are an expert OSINT analyst specializing in entity extraction.
      Extract all entities from the provided text and categorize them.
      Return the results as JSON with the following structure:
      {
        "people": [{"name": "John Doe", "context": "CEO of Company X"}],
        "organizations": [{"name": "Company X", "context": "Tech company"}],
        "locations": [{"name": "New York", "context": "Company headquarters"}],
        "dates": [{"date": "2023-01-01", "context": "Company founding date"}],
        "emails": [{"email": "example@example.com", "context": "Contact email"}],
        "phones": [{"phone": "+1 123-456-7890", "context": "Contact phone"}],
        "urls": [{"url": "https://example.com", "context": "Company website"}],
        "miscellaneous": [{"entity": "Project Alpha", "context": "Company project"}]
      }
      Only include categories that have at least one entity.
    `;

    const response = await generateResponse(
      `Extract entities from the following text:\n\n${text}`,
      { systemPrompt, temperature: 0.2 }
    );

    // Try to parse the response as JSON
    try {
      const parsedResponse = JSON.parse(response);
      return res.json({
        success: true,
        data: parsedResponse
      });
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse entity extraction results',
        rawResponse: response
      });
    }
  } catch (error) {
    console.error('Error in entity extraction endpoint:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to extract entities',
      message: error.message
    });
  }
});

app.post('/api/ai/generate-report', async (req, res) => {
  try {
    const { findings } = req.body;

    if (!findings || typeof findings !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Findings are required and must be a string'
      });
    }

    const systemPrompt = `
      You are an expert OSINT analyst creating a comprehensive investigation report.
      Based on the provided findings, create a well-structured report that includes:

      1. Executive Summary
      2. Key Findings
      3. Analysis
      4. Conclusions
      5. Recommendations for Further Investigation

      Format the report in Markdown for readability.
    `;

    const response = await generateResponse(
      `Generate an OSINT report based on these findings:\n\n${findings}`,
      { systemPrompt, temperature: 0.4, max_tokens: 2000 }
    );

    return res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error in report generation endpoint:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate report',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'OSINT Framework API is running',
    openrouter: {
      configured: !!OPENROUTER_API_KEY,
      model: OPENROUTER_API_MODEL
    }
  });
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all route to serve index.html for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`
  ┌───────────────────────────────────────────────────┐
  │                                                   │
  │   OSINT Framework Enhanced Server Running         │
  │                                                   │
  │   - URL: http://localhost:${PORT}                   │
  │   - API: http://localhost:${PORT}/api               │
  │   - AI:  http://localhost:${PORT}/api/ai            │
  │                                                   │
  │   OpenRouter API: ${OPENROUTER_API_KEY ? 'Configured ✓' : 'Not Configured ✗'}   │
  │   OpenRouter Model: ${OPENROUTER_API_MODEL}   │
  │                                                   │
  │   Press Ctrl+C to stop                            │
  │                                                   │
  └───────────────────────────────────────────────────┘
  `);
});
