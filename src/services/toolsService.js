const fs = require('fs');
const path = require('path');
const EnhancedTools = require('./enhancedTools');
const IntelTechniquesService = require('./intelTechniquesService');

class ToolsService {
    constructor() {
        this.enhancedTools = new EnhancedTools();
        this.intelTechniquesService = new IntelTechniquesService();
        this.tools = {};
        this.categories = {};
        this.favoritesFile = path.join(__dirname, '../../data/favorites.json');
        this.favorites = this.loadFavorites();
        this.loadTools();
    }

    // Load tools from the comprehensive JSON file
    loadTools() {
        try {
            const toolsDataPath = path.join(__dirname, '../../tools-master.json');
            if (fs.existsSync(toolsDataPath)) {
                const data = JSON.parse(fs.readFileSync(toolsDataPath, 'utf8'));
                
                // Ensure we have the expected structure
                if (data.tools && Array.isArray(data.tools)) {
                    this.tools = this.organizeToolsByCategory(data.tools);
                    this.categories = data.categories || this.generateCategoriesFromTools(data.tools);
                    console.log(`Loaded ${data.tools.length} tools from master database`, {
                        service: 'osint-framework',
                        version: '3.0.0',
                        totalTools: data.tools.length,
                        categories: Object.keys(this.categories).length
                    });
                } else {
                    console.warn('Invalid tools data structure, using fallback tools', {
                        service: 'osint-framework',
                        version: '3.0.0'
                    });
                    this.loadFallbackTools();
                }
            } else {
                console.warn('Master tools file not found, using fallback tools', {
                    service: 'osint-framework',
                    version: '3.0.0'
                });
                this.loadFallbackTools();
            }
        } catch (error) {
            console.error('Error loading tools from master file', {
                service: 'osint-framework',
                version: '3.0.0',
                error: error.message
            });
            this.loadFallbackTools();
        }
    }

    // Organize tools by category and subcategory
    organizeToolsByCategory(tools) {
        const organized = {};
        
        tools.forEach(tool => {
            if (!organized[tool.category]) {
                organized[tool.category] = {};
            }
            
            if (!organized[tool.category][tool.subcategory]) {
                organized[tool.category][tool.subcategory] = {};
            }
            
            // Create a unique ID for the tool
            const toolId = this.generateToolId(tool.name, tool.url);
            
            // Ensure URL has protocol
            let fullUrl = tool.url;
            if (!tool.url.startsWith('http://') && !tool.url.startsWith('https://')) {
                fullUrl = 'https://' + tool.url;
            }
            
            organized[tool.category][tool.subcategory][toolId] = {
                name: tool.name,
                url: fullUrl,
                description: tool.description,
                icon: tool.icon,
                subcategoryIcon: tool.subcategoryIcon,
                sourceRepo: tool.sourceRepo,
                tags: tool.tags,
                type: tool.type,
                category: tool.category,
                subcategory: tool.subcategory
            };
        });
        
        return organized;
    }

    // Generate a unique tool ID
    generateToolId(name, url) {
        const cleanName = name.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .replace(/\s+/g, '');
        
        try {
            // Ensure URL has protocol
            let fullUrl = url;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                fullUrl = 'https://' + url;
            }
            
            const urlObj = new URL(fullUrl);
            const domain = urlObj.hostname.replace(/\./g, '');
            return `${cleanName}_${domain}`;
        } catch (error) {
            // Fallback if URL parsing fails
            const cleanUrl = url.replace(/[^a-z0-9]/gi, '');
            return `${cleanName}_${cleanUrl}`;
        }
    }

    // Generate categories from tools if not provided
    generateCategoriesFromTools(tools) {
        const categories = {};
        
        tools.forEach(tool => {
            if (!categories[tool.category]) {
                categories[tool.category] = {
                    icon: tool.icon || '🔧',
                    subcategories: {}
                };
            }
            
            if (!categories[tool.category].subcategories[tool.subcategory]) {
                categories[tool.category].subcategories[tool.subcategory] = {
                    icon: tool.subcategoryIcon || '📋',
                    count: 0
                };
            }
            
            categories[tool.category].subcategories[tool.subcategory].count++;
        });
        
        return categories;
    }

    // Fallback tools (original implementation)
    loadFallbackTools() {
        // ... existing code ...
        this.tools = {
            // Search & Discovery
            search: {
                googleDorks: {
                    name: 'Google Dorks',
                    url: 'https://www.google.com/advanced_search',
                    description: 'Advanced Google search operators for OSINT',
                    icon: '🔍',
                    subcategoryIcon: '⚡',
                    type: 'web',
                    tags: ['search', 'google', 'dorks', 'advanced']
                },
                // ... other existing tools ...
            }
        };
        
        this.categories = {
            'Search & Discovery': {
                icon: '🔍',
                subcategories: {
                    'General': { icon: '📋', count: 1 }
                }
            }
        };
    }

    // Get all tools
    getAllTools() {
        try {
            const allTools = [];
            // Flatten the nested structure
            Object.entries(this.tools).forEach(([category, subcategories]) => {
                Object.entries(subcategories).forEach(([subcategory, tools]) => {
                    Object.entries(tools).forEach(([toolId, tool]) => {
                        allTools.push({
                            id: toolId,
                            category,
                            subcategory,
                            ...tool
                        });
                    });
                });
            });
            // Debug log
            require('../utils/logger').logger.info('DEBUG getAllTools', {
                allToolsLength: allTools.length,
                sample: allTools[0],
                toolsKeys: Object.keys(this.tools)
            });
            const totalTools = allTools.length;
            const categoryCount = Object.keys(this.categories).length;
            require('../utils/logger').logger.info('Tools retrieved successfully', {
                service: 'osint-framework',
                version: '3.0.0',
                count: totalTools
            });
            return {
                success: true,
                data: {
                    tools: this.tools,
                    categories: this.categories,
                    allTools: allTools,
                    totalTools: totalTools,
                    categoryCount: categoryCount
                },
                message: `Retrieved ${totalTools} tools across ${categoryCount} categories`
            };
        } catch (error) {
            require('../utils/logger').logger.error('Error getting all tools', {
                service: 'osint-framework',
                version: '3.0.0',
                error: error.message
            });
            return {
                success: false,
                error: 'Failed to retrieve tools',
                message: error.message
            };
        }
    }

    // Get tools by category
    getToolsByCategory(category) {
        if (!this.tools[category]) {
            throw new Error('Category not found');
        }

        const categoryTools = this.tools[category];
        const allTools = [];
        let totalCount = 0;

        // Flatten the tools from all subcategories
        Object.entries(categoryTools).forEach(([subcategory, tools]) => {
            Object.entries(tools).forEach(([toolId, tool]) => {
                allTools.push({
                    id: toolId,
                    category,
                    subcategory,
                    ...tool
                });
                totalCount++;
            });
        });

        return {
            category: {
                name: category,
                icon: this.categories[category]?.icon || '📁',
                description: this.categories[category]?.description || '',
                toolCount: totalCount
            },
            tools: allTools,
            count: totalCount,
            subcategories: Object.keys(categoryTools)
        };
    }

    // Get specific tool
    getTool(category, subcategory, toolId) {
        if (!this.tools[category] || !this.tools[category][subcategory] || !this.tools[category][subcategory][toolId]) {
            return {
                success: false,
                message: 'Tool not found'
            };
        }

        return {
            success: true,
            data: this.tools[category][subcategory][toolId]
        };
    }

    // Search tools
    searchTools(query, filters = {}) {
        const results = [];
        const searchTerm = query.toLowerCase();

        for (const [category, subcategories] of Object.entries(this.tools)) {
            for (const [subcategory, tools] of Object.entries(subcategories)) {
                for (const [toolId, tool] of Object.entries(tools)) {
                    // Apply filters
                    if (filters.type && tool.type !== filters.type) continue;
                    if (filters.api !== undefined && tool.api !== filters.api) continue;
                    if (filters.internal !== undefined && tool.internal !== filters.internal) continue;

                    // Apply search
                    if (
                        tool.name.toLowerCase().includes(searchTerm) ||
                        tool.description.toLowerCase().includes(searchTerm) ||
                        (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
                    ) {
                        results.push({
                            ...tool,
                            id: toolId,
                            category,
                            subcategory
                        });
                    }
                }
            }
        }

        return {
            query: query,
            filters: filters,
            results: results,
            count: results.length
        };
    }

    // Get tool recommendations
    getToolRecommendations(query) {
        const searchResults = this.searchTools(query);
        const recommendations = searchResults.data.results.slice(0, 10);

        return {
            success: true,
            data: {
                query: query,
                recommendations: recommendations,
                count: recommendations.length
            }
        };
    }

    // Execute a tool
    async executeTool(category, subcategory, toolId, parameters = {}) {
        try {
            const tool = this.getTool(category, subcategory, toolId);
            
            if (!tool.success) {
                return {
                    success: false,
                    message: 'Tool not found'
                };
            }

            const toolData = tool.data;

            // Handle different tool types
            switch (toolData.type) {
                case 'cli':
                    return await this.executeCLITool(toolData, parameters);
                case 'web':
                    return await this.executeWebTool(toolData, parameters);
                case 'internal':
                    return await this.executeInternalTool(toolId, parameters);
                default:
                    return {
                        success: true,
                        data: {
                            tool: toolData.name,
                            type: toolData.type,
                            url: toolData.url,
                            message: 'Tool is available for external use',
                            external: true
                        }
                    };
            }
        } catch (error) {
            console.error('Error executing tool', {
                service: 'osint-framework',
                version: '3.0.0',
                category,
                subcategory,
                toolId,
                error: error.message
            });

            return {
                success: false,
                message: 'Error executing tool',
                error: error.message
            };
        }
    }

    // Execute CLI tools
    async executeCLITool(toolData, parameters) {
        // For CLI tools, provide information about how to use them
        return {
            success: true,
            data: {
                tool: toolData.name,
                type: 'cli',
                message: 'CLI tool - see documentation for usage',
                url: toolData.url,
                description: toolData.description,
                installation: this.getCLIInstallationInfo(toolData.name),
                usage: this.getCLIUsageInfo(toolData.name, parameters)
            }
        };
    }

    // Execute web tools
    async executeWebTool(toolData, parameters) {
        return {
            success: true,
            data: {
                tool: toolData.name,
                type: 'web',
                url: toolData.url,
                message: 'Web tool available for external use',
                description: toolData.description,
                external: true
            }
        };
    }

    // Get CLI installation information
    getCLIInstallationInfo(toolName) {
        const installations = {
            'theHarvester': 'pip install theHarvester',
            'Sherlock': 'pip install sherlock-project',
            'Maigret': 'pip install maigret',
            'Holehe': 'pip install holehe',
            'Socialscan': 'pip install socialscan',
            'Crosslinked': 'pip install crosslinked',
            'Spiderfoot': 'pip install spiderfoot',
            'Sublist3r': 'git clone https://github.com/aboul3la/Sublist3r.git',
            'Photon': 'pip install photon',
            'Metagoofil': 'pip install metagoofil'
        };
        
        return installations[toolName] || 'Check the tool\'s GitHub repository for installation instructions';
    }

    // Get CLI usage information
    getCLIUsageInfo(toolName, parameters) {
        const usages = {
            'theHarvester': `theHarvester -d ${parameters.domain || 'example.com'} -b all`,
            'Sherlock': `sherlock ${parameters.username || 'username'}`,
            'Maigret': `maigret ${parameters.username || 'username'}`,
            'Holehe': `holehe ${parameters.email || 'email@example.com'}`,
            'Socialscan': `socialscan ${parameters.email || 'email@example.com'}`,
            'Crosslinked': `crosslinked ${parameters.company || 'company'}`,
            'Spiderfoot': `sf.py -s ${parameters.target || 'example.com'}`,
            'Sublist3r': `python sublist3r.py -d ${parameters.domain || 'example.com'}`,
            'Photon': `photon -u ${parameters.url || 'https://example.com'}`,
            'Metagoofil': `metagoofil -d ${parameters.domain || 'example.com'} -t pdf,doc,docx`
        };
        
        return usages[toolName] || 'Check the tool\'s documentation for usage instructions';
    }

    // Execute internal tools (existing implementation)
    async executeInternalTool(toolId, parameters) {
        // ... existing internal tool implementations ...
        switch (toolId) {
            case 'aiAnalysis':
                return await this.performAIAnalysis(parameters);
            case 'threatAssessment':
                return await this.performThreatAssessment(parameters);
            case 'patternRecognition':
                return await this.performPatternRecognition(parameters);
            case 'domainAnalysis':
                return await this.performDomainAnalysis(parameters);
            case 'ipAnalysis':
                return await this.performIPAnalysis(parameters);
            case 'sslAnalysis':
                return await this.performSslAnalysis(parameters);
            default:
                return {
                    success: false,
                    message: 'Internal tool not implemented'
                };
        }
    }

    // AI Analysis implementation
    async performAIAnalysis(parameters) {
        try {
            const { data, analysisType, context } = parameters;
            
            // Use the enhanced tools service for AI analysis
            const result = await this.enhancedTools.performContentSummarization({
                content: data,
                length: 'medium'
            });

            return {
                success: true,
                tool: 'AI Analysis',
                type: 'internal',
                status: 'success',
                message: 'AI analysis completed successfully',
                data: {
                    analysisType,
                    context,
                    result: result.data,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            logger.error('AI Analysis error', { error: error.message });
            return {
                success: false,
                tool: 'AI Analysis',
                type: 'internal',
                status: 'error',
                message: 'AI analysis failed',
                error: error.message
            };
        }
    }

    // Threat Assessment implementation
    async performThreatAssessment(parameters) {
        try {
            const { target, assessmentType } = parameters;
            
            // Use the enhanced tools service for threat assessment
            const result = await this.enhancedTools.performVulnerabilityAssessment({
                target,
                assessment: assessmentType
            });

            return {
                success: true,
                tool: 'Threat Assessment',
                type: 'internal',
                status: 'success',
                message: 'Threat assessment completed successfully',
                data: {
                    target,
                    assessmentType,
                    result: result.data,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            logger.error('Threat Assessment error', { error: error.message });
            return {
                success: false,
                tool: 'Threat Assessment',
                type: 'internal',
                status: 'error',
                message: 'Threat assessment failed',
                error: error.message
            };
        }
    }

    // Pattern Recognition implementation
    async performPatternRecognition(parameters) {
        try {
            const { data, patternType } = parameters;
            
            // Use the enhanced tools service for pattern recognition
            const result = await this.enhancedTools.performEntityExtraction({
                text: data,
                entities: patternType
            });

            return {
                success: true,
                tool: 'Pattern Recognition',
                type: 'internal',
                status: 'success',
                message: 'Pattern recognition completed successfully',
                data: {
                    patternType,
                    result: result.data,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            logger.error('Pattern Recognition error', { error: error.message });
            return {
                success: false,
                tool: 'Pattern Recognition',
                type: 'internal',
                status: 'error',
                message: 'Pattern recognition failed',
                error: error.message
            };
        }
    }

    // Domain Analysis implementation
    async performDomainAnalysis(parameters) {
        try {
            const { domain, analysisType } = parameters;
            
            // Use the enhanced tools service for domain analysis
            const result = await this.enhancedTools.performWhoisEnrichment({
                domain,
                enrichment: analysisType
            });

            return {
                success: true,
                tool: 'Domain Analysis',
                type: 'internal',
                status: 'success',
                message: 'Domain analysis completed successfully',
                data: {
                    domain,
                    analysisType,
                    result: result.data,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            logger.error('Domain Analysis error', { error: error.message });
            return {
                success: false,
                tool: 'Domain Analysis',
                type: 'internal',
                status: 'error',
                message: 'Domain analysis failed',
                error: error.message
            };
        }
    }

    // IP Analysis implementation
    async performIPAnalysis(parameters) {
        try {
            const { ip, analysisType } = parameters;
            
            // Use the enhanced tools service for IP analysis
            const result = await this.enhancedTools.performIpGeolocationMulti({
                ip,
                providers: analysisType
            });

            return {
                success: true,
                tool: 'IP Analysis',
                type: 'internal',
                status: 'success',
                message: 'IP analysis completed successfully',
                data: {
                    ip,
                    analysisType,
                    result: result.data,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            logger.error('IP Analysis error', { error: error.message });
            return {
                success: false,
                tool: 'IP Analysis',
                type: 'internal',
                status: 'error',
                message: 'IP analysis failed',
                error: error.message
            };
        }
    }

    // SSL Analysis implementation
    async performSslAnalysis(parameters) {
        try {
            const { domain, analysisType } = parameters;
            
            // Use the enhanced tools service for SSL analysis
            const result = await this.enhancedTools.performSslCertificateMonitoring({
                domain,
                monitoring: analysisType
            });

            return {
                success: true,
                tool: 'SSL Analysis',
                type: 'internal',
                status: 'success',
                message: 'SSL analysis completed successfully',
                data: {
                    domain,
                    analysisType,
                    result: result.data,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            logger.error('SSL Analysis error', { error: error.message });
            return {
                success: false,
                tool: 'SSL Analysis',
                type: 'internal',
                status: 'error',
                message: 'SSL analysis failed',
                error: error.message
            };
        }
    }

    // Get total tool count
    getTotalToolCount() {
        let count = 0;
        for (const category of Object.values(this.tools)) {
            for (const subcategory of Object.values(category)) {
                count += Object.keys(subcategory).length;
            }
        }
        return count;
    }

    // Get category statistics
    getCategoryStatistics() {
        const stats = {};
        for (const [category, subcategories] of Object.entries(this.tools)) {
            stats[category] = {
                icon: this.categories[category]?.icon || '🔧',
                totalTools: 0,
                subcategories: {}
            };
            
            for (const [subcategory, tools] of Object.entries(subcategories)) {
                const toolCount = Object.keys(tools).length;
                stats[category].totalTools += toolCount;
                stats[category].subcategories[subcategory] = {
                    icon: this.categories[category]?.subcategories[subcategory]?.icon || '📋',
                    count: toolCount
                };
            }
        }
        return stats;
    }

    // Load favorites from file
    loadFavorites() {
        try {
            if (fs.existsSync(this.favoritesFile)) {
                const data = JSON.parse(fs.readFileSync(this.favoritesFile, 'utf8'));
                return data.favorites || [];
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
        return [];
    }

    // Save favorites to file
    saveFavorites() {
        try {
            const dataDir = path.dirname(this.favoritesFile);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            
            fs.writeFileSync(this.favoritesFile, JSON.stringify({
                favorites: this.favorites,
                lastUpdated: new Date().toISOString()
            }, null, 2));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }

    // Add tool to favorites
    addToFavorites(category, toolId, metadata = {}) {
        try {
            const tool = this.getToolById(category, toolId);
            if (!tool) {
                throw new Error('Tool not found');
            }

            const favorite = {
                id: `${category}_${toolId}`,
                category,
                toolId,
                name: tool.name,
                url: tool.url,
                description: tool.description,
                icon: tool.icon,
                type: tool.type,
                tags: tool.tags,
                addedAt: new Date().toISOString(),
                notes: metadata.notes || '',
                rating: metadata.rating || 0,
                usageCount: 0,
                lastUsed: null
            };

            // Check if already in favorites
            const existingIndex = this.favorites.findIndex(f => f.id === favorite.id);
            if (existingIndex >= 0) {
                // Update existing favorite
                this.favorites[existingIndex] = { ...this.favorites[existingIndex], ...favorite };
            } else {
                // Add new favorite
                this.favorites.push(favorite);
            }

            this.saveFavorites();
            return { success: true, favorite };
        } catch (error) {
            console.error('Error adding to favorites:', error);
            return { success: false, error: error.message };
        }
    }

    // Remove tool from favorites
    removeFromFavorites(category, toolId) {
        try {
            const favoriteId = `${category}_${toolId}`;
            const index = this.favorites.findIndex(f => f.id === favoriteId);
            
            if (index >= 0) {
                const removed = this.favorites.splice(index, 1)[0];
                this.saveFavorites();
                return { success: true, removed };
            } else {
                return { success: false, error: 'Favorite not found' };
            }
        } catch (error) {
            console.error('Error removing from favorites:', error);
            return { success: false, error: error.message };
        }
    }

    // Get all favorite tools
    getFavoriteTools() {
        return this.favorites;
    }

    // Get favorite tools with full tool data
    getFavoriteToolsWithData() {
        return this.favorites.map(favorite => {
            const tool = this.getToolById(favorite.category, favorite.toolId);
            return {
                ...favorite,
                tool: tool || null
            };
        }).filter(favorite => favorite.tool !== null);
    }

    // Check if tool is favorited
    isFavorited(category, toolId) {
        const favoriteId = `${category}_${toolId}`;
        return this.favorites.some(f => f.id === favoriteId);
    }

    // Update favorite metadata
    updateFavorite(category, toolId, updates) {
        try {
            const favoriteId = `${category}_${toolId}`;
            const index = this.favorites.findIndex(f => f.id === favoriteId);
            
            if (index >= 0) {
                this.favorites[index] = { ...this.favorites[index], ...updates };
                this.saveFavorites();
                return { success: true, favorite: this.favorites[index] };
            } else {
                return { success: false, error: 'Favorite not found' };
            }
        } catch (error) {
            console.error('Error updating favorite:', error);
            return { success: false, error: error.message };
        }
    }

    // Increment usage count for favorite
    incrementFavoriteUsage(category, toolId) {
        try {
            const favoriteId = `${category}_${toolId}`;
            const index = this.favorites.findIndex(f => f.id === favoriteId);
            
            if (index >= 0) {
                this.favorites[index].usageCount = (this.favorites[index].usageCount || 0) + 1;
                this.favorites[index].lastUsed = new Date().toISOString();
                this.saveFavorites();
                return { success: true };
            }
        } catch (error) {
            console.error('Error incrementing favorite usage:', error);
        }
        return { success: false };
    }

    // Get favorites analytics
    getFavoritesAnalytics() {
        const totalFavorites = this.favorites.length;
        const categories = {};
        const types = {};
        const tags = {};
        let totalUsage = 0;
        let ratedFavorites = 0;
        let totalRating = 0;

        this.favorites.forEach(favorite => {
            // Category stats
            categories[favorite.category] = (categories[favorite.category] || 0) + 1;
            
            // Type stats
            types[favorite.type] = (types[favorite.type] || 0) + 1;
            
            // Usage stats
            totalUsage += favorite.usageCount || 0;
            
            // Rating stats
            if (favorite.rating > 0) {
                ratedFavorites++;
                totalRating += favorite.rating;
            }
            
            // Tag stats
            favorite.tags.forEach(tag => {
                tags[tag] = (tags[tag] || 0) + 1;
            });
        });

        return {
            totalFavorites,
            totalUsage,
            averageUsage: totalFavorites > 0 ? (totalUsage / totalFavorites).toFixed(2) : 0,
            averageRating: ratedFavorites > 0 ? (totalRating / ratedFavorites).toFixed(1) : 0,
            categories,
            types,
            topTags: Object.entries(tags)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([tag, count]) => ({ tag, count })),
            recentlyAdded: this.favorites
                .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
                .slice(0, 5),
            mostUsed: this.favorites
                .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
                .slice(0, 5)
        };
    }

    // Search favorites
    searchFavorites(query) {
        const searchTerm = query.toLowerCase();
        return this.favorites.filter(favorite => 
            favorite.name.toLowerCase().includes(searchTerm) ||
            favorite.description.toLowerCase().includes(searchTerm) ||
            favorite.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

    // Get tool details by category and toolId (search all subcategories, fallback to global search)
    async getToolDetails(toolId, category) {
        // Try normal lookup first
        if (this.tools[category]) {
            for (const subcategory in this.tools[category]) {
                if (this.tools[category][subcategory][toolId]) {
                    return {
                        success: true,
                        data: this.tools[category][subcategory][toolId],
                        category,
                        subcategory
                    };
                }
            }
        }
        // Fallback: search all categories/subcategories
        for (const cat in this.tools) {
            for (const subcat in this.tools[cat]) {
                if (this.tools[cat][subcat][toolId]) {
                    return {
                        success: true,
                        data: this.tools[cat][subcat][toolId],
                        category: cat,
                        subcategory: subcat
                    };
                }
            }
        }
        console.warn(`Tool not found: ${toolId} in category ${category}`);
        return { success: false, message: 'Tool not found' };
    }

    // Get tool by ID across all categories (robust)
    getToolById(category, toolId) {
        // Try normal lookup first
        if (this.tools[category]) {
            for (const subcategory in this.tools[category]) {
                if (this.tools[category][subcategory][toolId]) {
                    return this.tools[category][subcategory][toolId];
                }
            }
        }
        // Fallback: search all categories/subcategories
        for (const cat in this.tools) {
            for (const subcat in this.tools[cat]) {
                if (this.tools[cat][subcat][toolId]) {
                    return this.tools[cat][subcat][toolId];
                }
            }
        }
        console.warn(`Tool not found by ID: ${toolId} in category ${category}`);
        return null;
    }

    // Export favorites
    exportFavorites() {
        try {
            const exportData = {
                exportDate: new Date().toISOString(),
                version: '1.0',
                favorites: this.favorites,
                analytics: this.getFavoritesAnalytics()
            };
            return { success: true, data: exportData };
        } catch (error) {
            console.error('Error exporting favorites:', error);
            return { success: false, error: error.message };
        }
    }

    // Import favorites
    importFavorites(importData) {
        try {
            if (!importData.favorites || !Array.isArray(importData.favorites)) {
                throw new Error('Invalid import data format');
            }

            // Merge with existing favorites, avoiding duplicates
            const existingIds = new Set(this.favorites.map(f => f.id));
            const newFavorites = importData.favorites.filter(f => !existingIds.has(f.id));
            
            this.favorites = [...this.favorites, ...newFavorites];
            this.saveFavorites();
            
            return { 
                success: true, 
                imported: newFavorites.length,
                total: this.favorites.length
            };
        } catch (error) {
            console.error('Error importing favorites:', error);
            return { success: false, error: error.message };
        }
    }

    // Clear all favorites
    clearFavorites() {
        try {
            const count = this.favorites.length;
            this.favorites = [];
            this.saveFavorites();
            return { success: true, cleared: count };
        } catch (error) {
            console.error('Error clearing favorites:', error);
            return { success: false, error: error.message };
        }
    }

    // Get all categories
    getCategories() {
        return {
            success: true,
            data: this.categories,
            message: `Retrieved ${Object.keys(this.categories).length} categories`
        };
    }
}

module.exports = new ToolsService(); 