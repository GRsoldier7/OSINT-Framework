const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');

/**
 * @route GET /api/sections/username
 * @desc Get username OSINT section tools
 * @access Public
 */
router.get('/username', async (req, res) => {
    try {
        const usernameTools = [
            {
                id: 'whatsMyName',
                name: 'WhatsMyName',
                description: 'Search for usernames across multiple platforms',
                category: 'socialMedia',
                url: 'https://whatsmyname.app/',
                type: 'external'
            },
            {
                id: 'namechk',
                name: 'Namechk',
                description: 'Check username availability across social networks',
                category: 'socialMedia',
                url: 'https://namechk.com/',
                type: 'external'
            },
            {
                id: 'checkusernames',
                name: 'CheckUsernames',
                description: 'Search for usernames on social media platforms',
                category: 'socialMedia',
                url: 'https://checkusernames.com/',
                type: 'external'
            }
        ];

        logger.info('Username section tools retrieved', { count: usernameTools.length });
        
        res.json({
            success: true,
            data: usernameTools,
            message: `Retrieved ${usernameTools.length} username OSINT tools`
        });
    } catch (error) {
        logger.error('Error retrieving username section tools', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve username tools',
            message: error.message
        });
    }
});

/**
 * @route GET /api/sections/email
 * @desc Get email OSINT section tools
 * @access Public
 */
router.get('/email', async (req, res) => {
    try {
        const emailTools = [
            {
                id: 'emailValidation',
                name: 'Email Validation',
                description: 'Validate email addresses and check deliverability',
                category: 'people',
                type: 'internal'
            },
            {
                id: 'emailBreachCheck',
                name: 'Email Breach Check',
                description: 'Check if email has been compromised in data breaches',
                category: 'security',
                type: 'internal'
            },
            {
                id: 'emailFormat',
                name: 'Email Format Finder',
                description: 'Find email formats for companies',
                category: 'people',
                url: 'https://hunter.io/email-finder',
                type: 'external'
            }
        ];

        logger.info('Email section tools retrieved', { count: emailTools.length });
        
        res.json({
            success: true,
            data: emailTools,
            message: `Retrieved ${emailTools.length} email OSINT tools`
        });
    } catch (error) {
        logger.error('Error retrieving email section tools', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve email tools',
            message: error.message
        });
    }
});

/**
 * @route GET /api/sections/domain
 * @desc Get domain OSINT section tools
 * @access Public
 */
router.get('/domain', async (req, res) => {
    try {
        const domainTools = [
            {
                id: 'domainAnalysis',
                name: 'Domain Analysis',
                description: 'Comprehensive domain information and analysis',
                category: 'network',
                type: 'internal'
            },
            {
                id: 'whois',
                name: 'WHOIS Lookup',
                description: 'Get domain registration information',
                category: 'network',
                type: 'internal'
            },
            {
                id: 'dnsLookup',
                name: 'DNS Lookup',
                description: 'Query DNS records for domains',
                category: 'network',
                type: 'internal'
            },
            {
                id: 'sslAnalysis',
                name: 'SSL Certificate Analysis',
                description: 'Analyze SSL certificates and security',
                category: 'network',
                type: 'internal'
            }
        ];

        logger.info('Domain section tools retrieved', { count: domainTools.length });
        
        res.json({
            success: true,
            data: domainTools,
            message: `Retrieved ${domainTools.length} domain OSINT tools`
        });
    } catch (error) {
        logger.error('Error retrieving domain section tools', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve domain tools',
            message: error.message
        });
    }
});

/**
 * @route GET /api/sections/ip
 * @desc Get IP OSINT section tools
 * @access Public
 */
router.get('/ip', async (req, res) => {
    try {
        const ipTools = [
            {
                id: 'ipAnalysis',
                name: 'IP Analysis',
                description: 'Comprehensive IP address information and geolocation',
                category: 'network',
                type: 'internal'
            },
            {
                id: 'ipGeolocation',
                name: 'IP Geolocation',
                description: 'Get detailed location information for IP addresses',
                category: 'geographic',
                type: 'internal'
            },
            {
                id: 'ipReputation',
                name: 'IP Reputation Check',
                description: 'Check IP reputation and threat intelligence',
                category: 'security',
                type: 'internal'
            },
            {
                id: 'ipHistory',
                name: 'IP History',
                description: 'View historical IP address information',
                category: 'network',
                type: 'internal'
            }
        ];

        logger.info('IP section tools retrieved', { count: ipTools.length });
        
        res.json({
            success: true,
            data: ipTools,
            message: `Retrieved ${ipTools.length} IP OSINT tools`
        });
    } catch (error) {
        logger.error('Error retrieving IP section tools', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve IP tools',
            message: error.message
        });
    }
});

/**
 * @route GET /api/sections/social
 * @desc Get social media OSINT section tools
 * @access Public
 */
router.get('/social', async (req, res) => {
    try {
        const socialTools = [
            {
                id: 'socialMediaSearch',
                name: 'Social Media Search',
                description: 'Search across multiple social media platforms',
                category: 'socialMedia',
                type: 'internal'
            },
            {
                id: 'twitterAnalysis',
                name: 'Twitter/X Analysis',
                description: 'Analyze Twitter accounts, tweets, and trends',
                category: 'socialMedia',
                type: 'internal'
            },
            {
                id: 'instagramAnalysis',
                name: 'Instagram Analysis',
                description: 'Analyze Instagram profiles and posts',
                category: 'socialMedia',
                type: 'internal'
            },
            {
                id: 'facebookAnalysis',
                name: 'Facebook Analysis',
                description: 'Analyze Facebook pages and public posts',
                category: 'socialMedia',
                type: 'internal'
            },
            {
                id: 'linkedinAnalysis',
                name: 'LinkedIn Analysis',
                description: 'Analyze LinkedIn profiles and company information',
                category: 'socialMedia',
                type: 'internal'
            }
        ];

        logger.info('Social media section tools retrieved', { count: socialTools.length });
        
        res.json({
            success: true,
            data: socialTools,
            message: `Retrieved ${socialTools.length} social media OSINT tools`
        });
    } catch (error) {
        logger.error('Error retrieving social media section tools', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve social media tools',
            message: error.message
        });
    }
});

/**
 * @route GET /api/sections/ai
 * @desc Get AI analysis section tools
 * @access Public
 */
router.get('/ai', async (req, res) => {
    try {
        const aiTools = [
            {
                id: 'aiAnalysis',
                name: 'AI Analysis',
                description: 'AI-powered intelligence analysis and insights',
                category: 'ai',
                type: 'internal'
            },
            {
                id: 'threatAssessment',
                name: 'Threat Assessment',
                description: 'AI-powered threat intelligence and risk assessment',
                category: 'security',
                type: 'internal'
            },
            {
                id: 'patternRecognition',
                name: 'Pattern Recognition',
                description: 'Identify patterns and correlations in data',
                category: 'ai',
                type: 'internal'
            },
            {
                id: 'sentimentAnalysis',
                name: 'Sentiment Analysis',
                description: 'Analyze sentiment in text and social media content',
                category: 'ai',
                type: 'internal'
            },
            {
                id: 'imageAnalysis',
                name: 'Image Analysis',
                description: 'AI-powered image analysis and object detection',
                category: 'images',
                type: 'internal'
            }
        ];

        logger.info('AI analysis section tools retrieved', { count: aiTools.length });
        
        res.json({
            success: true,
            data: aiTools,
            message: `Retrieved ${aiTools.length} AI analysis tools`
        });
    } catch (error) {
        logger.error('Error retrieving AI analysis section tools', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve AI analysis tools',
            message: error.message
        });
    }
});

/**
 * @route GET /api/sections/reports
 * @desc Get reports section tools
 * @access Public
 */
router.get('/reports', async (req, res) => {
    try {
        const reportTools = [
            {
                id: 'reportGeneration',
                name: 'Report Generation',
                description: 'Generate comprehensive OSINT reports',
                category: 'documents',
                type: 'internal'
            },
            {
                id: 'investigationHistory',
                name: 'Investigation History',
                description: 'View and manage investigation history',
                category: 'documents',
                type: 'internal'
            },
            {
                id: 'exportData',
                name: 'Export Data',
                description: 'Export investigation data in various formats',
                category: 'documents',
                type: 'internal'
            },
            {
                id: 'reportTemplates',
                name: 'Report Templates',
                description: 'Use predefined report templates',
                category: 'documents',
                type: 'internal'
            }
        ];

        logger.info('Reports section tools retrieved', { count: reportTools.length });
        
        res.json({
            success: true,
            data: reportTools,
            message: `Retrieved ${reportTools.length} report tools`
        });
    } catch (error) {
        logger.error('Error retrieving reports section tools', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve report tools',
            message: error.message
        });
    }
});

module.exports = router; 