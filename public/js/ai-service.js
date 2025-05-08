/**
 * AI Service for OSINT Framework
 * Provides client-side integration with OpenRouter API
 */

const AI_SERVICE = {
    /**
     * Generate a response using the OpenRouter API
     * @param {string} prompt - User prompt
     * @param {string} systemPrompt - System prompt
     * @returns {Promise<string>} - AI response
     */
    async generateResponse(prompt, systemPrompt = '') {
        try {
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt,
                    systemPrompt,
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Unknown error');
            }

            return data.data;
        } catch (error) {
            console.error('Error generating AI response:', error);
            throw error;
        }
    },

    /**
     * Generate search suggestions based on a query
     * @param {string} query - Search query
     * @returns {Promise<string[]>} - Array of search suggestions
     */
    async generateSearchSuggestions(query) {
        try {
            const response = await fetch('/api/ai/search-suggestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Unknown error');
            }

            return data.data;
        } catch (error) {
            console.error('Error generating search suggestions:', error);
            throw error;
        }
    },

    /**
     * Extract entities from text
     * @param {string} text - Text to analyze
     * @returns {Promise<Object>} - Extracted entities
     */
    async extractEntities(text) {
        try {
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

            const response = await this.generateResponse(
                `Extract entities from the following text:\n\n${text}`,
                systemPrompt
            );

            // Try to parse the response as JSON
            try {
                return JSON.parse(response);
            } catch (jsonError) {
                console.error('Error parsing JSON response:', jsonError);
                return { error: 'Could not parse response', rawResponse: response };
            }
        } catch (error) {
            console.error('Error extracting entities:', error);
            throw error;
        }
    },

    /**
     * Generate search queries for a research topic
     * @param {string} topic - Research topic
     * @returns {Promise<string[]>} - Array of search queries
     */
    async generateSearchQueries(topic) {
        try {
            const systemPrompt = `
                You are an expert OSINT researcher helping to generate effective search queries.
                Given a research topic, suggest 10-15 search queries that would help find relevant information.
                Include variations with quotes, site-specific searches, filetype searches, and boolean operators.
                Respond with ONLY the list of search queries, one per line, with no explanations or other text.
            `;

            const response = await this.generateResponse(
                `Generate search queries for researching: "${topic}"`,
                systemPrompt
            );

            // Parse the response into an array of queries
            return response
                .split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('-'));
        } catch (error) {
            console.error('Error generating search queries:', error);
            throw error;
        }
    },

    /**
     * Generate an OSINT report based on findings
     * @param {string} findings - Investigation findings
     * @returns {Promise<string>} - Generated report
     */
    async generateReport(findings) {
        try {
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

            return await this.generateResponse(
                `Generate an OSINT report based on these findings:\n\n${findings}`,
                systemPrompt
            );
        } catch (error) {
            console.error('Error generating report:', error);
            throw error;
        }
    },

    /**
     * Analyze an image from a URL
     * @param {string} imageUrl - URL of the image to analyze
     * @returns {Promise<string>} - Analysis results
     */
    async analyzeImage(imageUrl) {
        try {
            const systemPrompt = `
                You are an expert OSINT analyst specializing in image analysis.
                Analyze the image at the provided URL and extract as much information as possible.
                Focus on:
                
                1. Visible text
                2. Locations
                3. People
                4. Objects
                5. Timestamps
                6. Any other relevant details
                
                Format your analysis in Markdown for readability.
                Note: You cannot actually see the image, so explain that this is what you would look for if you could see it.
            `;

            return await this.generateResponse(
                `Analyze this image for OSINT purposes: ${imageUrl}`,
                systemPrompt
            );
        } catch (error) {
            console.error('Error analyzing image:', error);
            throw error;
        }
    }
};

// Export the AI service
window.AI_SERVICE = AI_SERVICE;
