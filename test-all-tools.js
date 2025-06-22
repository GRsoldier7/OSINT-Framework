#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(endpoint, method = 'GET', data = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: { 'Content-Type': 'application/json' }
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        return { success: true, data: response.data };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data || error.message,
            status: error.response?.status 
        };
    }
}

async function runTests() {
    console.log('🔧 Testing OSINT Framework - All Tools and Functionality\n');
    
    const tests = [
        // Basic API Tests
        { name: 'Health Check', endpoint: '/api/health' },
        { name: 'API Documentation', endpoint: '/api' },
        
        // Tools API Tests
        { name: 'All Tools', endpoint: '/api/tools' },
        { name: 'Tool Categories', endpoint: '/api/tools/categories' },
        { name: 'Quick Access Tools', endpoint: '/api/tools/quick-access' },
        { name: 'Tools Statistics', endpoint: '/api/tools/statistics' },
        
        // Category-specific tests
        { name: 'Geographic Tools', endpoint: '/api/tools/category/geographic' },
        { name: 'Social Media Tools', endpoint: '/api/tools/category/socialMedia' },
        { name: 'Search Tools', endpoint: '/api/tools/category/search' },
        { name: 'Data Tools', endpoint: '/api/tools/category/data' },
        { name: 'Analysis Tools', endpoint: '/api/tools/category/analysis' },
        { name: 'Network Tools', endpoint: '/api/tools/category/network' },
        { name: 'Documents Tools', endpoint: '/api/tools/category/documents' },
        { name: 'Images Tools', endpoint: '/api/tools/category/images' },
        { name: 'People Tools', endpoint: '/api/tools/category/people' },
        { name: 'Financial Tools', endpoint: '/api/tools/category/financial' },
        { name: 'Security Tools', endpoint: '/api/tools/category/security' },
        { name: 'Visualization Tools', endpoint: '/api/tools/category/visualization' },
        
        // Sections API Tests
        { name: 'Username Section', endpoint: '/api/sections/username' },
        { name: 'Email Section', endpoint: '/api/sections/email' },
        { name: 'Domain Section', endpoint: '/api/sections/domain' },
        
        // AI Service Tests
        { name: 'AI Health Check', endpoint: '/api/ai/health' },
        { name: 'Chat Provider Info', endpoint: '/api/chat/provider' },
        
        // Frontend Pages
        { name: 'Home Page', endpoint: '/' },
        { name: 'Tools Hub Page', endpoint: '/tools' },
        { name: 'Analysis Page', endpoint: '/analysis' },
        { name: 'Reports Page', endpoint: '/reports' },
        { name: 'Search Page', endpoint: '/search' },
        
        // 404 Page
        { name: '404 Page', endpoint: '/404.html' }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        process.stdout.write(`Testing ${test.name}... `);
        const result = await testEndpoint(test.endpoint);
        
        if (result.success) {
            console.log('✅ PASSED');
            passed++;
        } else {
            console.log(`❌ FAILED (${result.status || 'Error'})`);
            failed++;
        }
    }
    
    console.log('\n🔧 Tool Execution Tests\n');
    
    // Test specific tool executions
    const toolTests = [
        {
            name: 'Image Analysis Tool',
            endpoint: '/api/tools/images/imageAnalysis/execute',
            method: 'POST',
            data: { imageUrl: 'test.jpg' }
        },
        {
            name: 'Reverse Image Search',
            endpoint: '/api/tools/images/reverseImageSearch/execute',
            method: 'POST',
            data: { imageUrl: 'test.jpg' }
        },
        {
            name: 'Face Detection',
            endpoint: '/api/tools/images/faceDetection/execute',
            method: 'POST',
            data: { imageUrl: 'test.jpg' }
        },
        {
            name: 'Domain Analysis',
            endpoint: '/api/tools/network/domainAnalysis/execute',
            method: 'POST',
            data: { domain: 'example.com' }
        },
        {
            name: 'IP Analysis',
            endpoint: '/api/tools/network/ipAnalysis/execute',
            method: 'POST',
            data: { ip: '8.8.8.8' }
        },
        {
            name: 'SSL Analysis',
            endpoint: '/api/tools/network/sslAnalysis/execute',
            method: 'POST',
            data: { domain: 'example.com' }
        },
        {
            name: 'Email Validation',
            endpoint: '/api/tools/people/emailValidation/execute',
            method: 'POST',
            data: { email: 'test@example.com' }
        },
        {
            name: 'AI Analysis',
            endpoint: '/api/tools/analysis/aiAnalysis/execute',
            method: 'POST',
            data: { data: 'Sample data for analysis' }
        },
        {
            name: 'Threat Assessment',
            endpoint: '/api/tools/analysis/threatAssessment/execute',
            method: 'POST',
            data: { indicators: 'Sample threat indicators' }
        },
        {
            name: 'Document Analysis',
            endpoint: '/api/tools/documents/documentAnalysis/execute',
            method: 'POST',
            data: { fileUrl: 'test.pdf' }
        }
    ];
    
    for (const test of toolTests) {
        process.stdout.write(`Testing ${test.name}... `);
        const result = await testEndpoint(test.endpoint, test.method, test.data);
        
        if (result.success) {
            console.log('✅ PASSED');
            passed++;
        } else {
            console.log(`❌ FAILED (${result.status || 'Error'})`);
            failed++;
        }
    }
    
    console.log('\n🤖 AI Chat Tests\n');
    
    // Test AI chat functionality
    const chatTests = [
        {
            name: 'Basic Chat',
            endpoint: '/api/chat',
            method: 'POST',
            data: { message: 'Hello, can you help me with OSINT tools?' }
        },
        {
            name: 'Tool Recommendation Chat',
            endpoint: '/api/chat',
            method: 'POST',
            data: { message: 'I need tools for social media analysis' }
        },
        {
            name: 'Data Analysis Chat',
            endpoint: '/api/chat/analyze',
            method: 'POST',
            data: { data: 'Sample data for analysis', type: 'general' }
        },
        {
            name: 'Report Generation Chat',
            endpoint: '/api/chat/report',
            method: 'POST',
            data: { data: 'Sample data for report', template: 'standard' }
        },
        {
            name: 'Threat Assessment Chat',
            endpoint: '/api/chat/threat',
            method: 'POST',
            data: { data: 'Sample threat data' }
        }
    ];
    
    for (const test of chatTests) {
        process.stdout.write(`Testing ${test.name}... `);
        const result = await testEndpoint(test.endpoint, test.method, test.data);
        
        if (result.success) {
            console.log('✅ PASSED');
            passed++;
        } else {
            console.log(`❌ FAILED (${result.status || 'Error'})`);
            failed++;
        }
    }
    
    console.log('\n📊 Test Summary\n');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed! The OSINT Framework is working perfectly.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }
}

// Run the tests
runTests().catch(console.error); 