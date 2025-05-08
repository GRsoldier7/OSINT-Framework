/**
 * AI Service for OSINT Framework
 * Provides AI capabilities using OpenRouter API
 */

require('dotenv').config();
const axios = require('axios');

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

/**
 * Generate search suggestions based on a query
 * @param {string} query - Search query
 * @returns {Promise<string[]>} - Array of search suggestions
 */
async function generateSearchSuggestions(query) {
  try {
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
    return response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('-'))
      .map(line => line.replace(/^["']|["']$/g, '').trim());
  } catch (error) {
    console.error('Error generating search suggestions:', error.message);
    // Return some basic suggestions as fallback
    return [
      `"${query}"`,
      `${query} site:linkedin.com`,
      `${query} filetype:pdf`,
      `${query} -scam`,
      `${query} recent`
    ];
  }
}

/**
 * Analyze an email address for OSINT insights
 * @param {string} email - Email address to analyze
 * @returns {Promise<Object>} - Analysis results
 */
async function analyzeEmail(email) {
  try {
    const systemPrompt = `
      You are an expert OSINT analyst specializing in email analysis.
      Given an email address, provide a structured analysis including:
      1. Domain information
      2. Possible platforms to check for accounts
      3. Search strategies
      Format the response as JSON with the following structure:
      {
        "domain": { "name": "", "type": "", "notes": "" },
        "platforms": ["platform1", "platform2"],
        "searchStrategies": ["strategy1", "strategy2"],
        "riskLevel": "low|medium|high",
        "recommendations": ["rec1", "rec2"]
      }
    `;

    const response = await generateResponse(
      `Analyze this email address for OSINT investigation: ${email}`,
      { systemPrompt, temperature: 0.2 }
    );

    // Parse the JSON response
    try {
      return JSON.parse(response);
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError.message);
      // Extract what we can from the text response
      return {
        error: 'Could not parse structured response',
        rawResponse: response
      };
    }
  } catch (error) {
    console.error('Error analyzing email:', error.message);
    throw new Error(`Failed to analyze email: ${error.message}`);
  }
}

/**
 * Analyze a domain for OSINT insights
 * @param {string} domain - Domain to analyze
 * @returns {Promise<Object>} - Analysis results
 */
async function analyzeDomain(domain) {
  try {
    const systemPrompt = `
      You are an expert OSINT analyst specializing in domain analysis.
      Given a domain name, provide a structured analysis including:
      1. Registration information to look for
      2. Technical data points to investigate
      3. Search strategies
      Format the response as JSON with the following structure:
      {
        "registrationInfo": ["info1", "info2"],
        "technicalData": ["data1", "data2"],
        "searchStrategies": ["strategy1", "strategy2"],
        "relatedDomains": ["domain1", "domain2"],
        "recommendations": ["rec1", "rec2"]
      }
    `;

    const response = await generateResponse(
      `Analyze this domain for OSINT investigation: ${domain}`,
      { systemPrompt, temperature: 0.2 }
    );

    // Parse the JSON response
    try {
      return JSON.parse(response);
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError.message);
      return {
        error: 'Could not parse structured response',
        rawResponse: response
      };
    }
  } catch (error) {
    console.error('Error analyzing domain:', error.message);
    throw new Error(`Failed to analyze domain: ${error.message}`);
  }
}

/**
 * Generate an OSINT investigation plan
 * @param {string} target - Investigation target
 * @param {string} context - Additional context
 * @returns {Promise<Object>} - Investigation plan
 */
async function generateInvestigationPlan(target, context = '') {
  try {
    const systemPrompt = `
      You are an expert OSINT investigator creating investigation plans.
      Given a target and context, create a structured investigation plan including:
      1. Initial data collection steps
      2. Tools to use
      3. Search strategies
      4. Analysis techniques
      5. Verification methods
      Format the response as JSON with the following structure:
      {
        "initialSteps": ["step1", "step2"],
        "tools": ["tool1", "tool2"],
        "searchStrategies": ["strategy1", "strategy2"],
        "analysisTechniques": ["technique1", "technique2"],
        "verificationMethods": ["method1", "method2"],
        "cautionPoints": ["caution1", "caution2"]
      }
    `;

    const prompt = `Generate an OSINT investigation plan for: ${target}${context ? `\nAdditional context: ${context}` : ''}`;
    
    const response = await generateResponse(prompt, { 
      systemPrompt, 
      temperature: 0.4,
      max_tokens: 1500
    });

    // Parse the JSON response
    try {
      return JSON.parse(response);
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError.message);
      return {
        error: 'Could not parse structured response',
        rawResponse: response
      };
    }
  } catch (error) {
    console.error('Error generating investigation plan:', error.message);
    throw new Error(`Failed to generate investigation plan: ${error.message}`);
  }
}

module.exports = {
  generateResponse,
  generateSearchSuggestions,
  analyzeEmail,
  analyzeDomain,
  generateInvestigationPlan
};
