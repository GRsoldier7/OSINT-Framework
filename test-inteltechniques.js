const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testIntelTechniquesIntegration() {
    console.log('🧪 Testing IntelTechniques Integration...\n');
    
    const tests = [
        {
            name: 'Health Check',
            test: async () => {
                const response = await axios.get(`${BASE_URL}/api/health`);
                return response.status === 200;
            }
        },
        {
            name: 'Get All Tools (including IntelTechniques)',
            test: async () => {
                const response = await axios.get(`${BASE_URL}/api/tools`);
                const data = response.data;
                
                // Check if IntelTechniques tools are included
                const intelTechniquesCategories = [
                    'searchEngines', 'facebook', 'xTwitter', 'instagram', 'linkedin',
                    'emailAddresses', 'usernames', 'names', 'addresses', 'telephoneNumbers',
                    'maps', 'documents', 'pastes', 'images', 'videos', 'domains',
                    'ipAddresses', 'businessGovernment', 'vehicles', 'virtualCurrencies',
                    'breachesLeaks', 'liveStreams', 'apis'
                ];
                
                const hasIntelTechniquesTools = intelTechniquesCategories.some(category => 
                    data.data.tools[category]
                );
                
                console.log(`   Total tools: ${data.data.totalTools}`);
                console.log(`   Categories: ${Object.keys(data.data.categories).length}`);
                console.log(`   Has IntelTechniques tools: ${hasIntelTechniquesTools}`);
                
                return data.success && hasIntelTechniquesTools;
            }
        },
        {
            name: 'IntelTechniques Categories',
            test: async () => {
                const response = await axios.get(`${BASE_URL}/api/tools/categories`);
                const categories = response.data.data;
                
                const intelTechniquesCategories = [
                    'searchEngines', 'facebook', 'xTwitter', 'instagram', 'linkedin',
                    'emailAddresses', 'usernames', 'names', 'addresses', 'telephoneNumbers',
                    'maps', 'documents', 'pastes', 'images', 'videos', 'domains',
                    'ipAddresses', 'businessGovernment', 'vehicles', 'virtualCurrencies',
                    'breachesLeaks', 'liveStreams', 'apis'
                ];
                
                const foundCategories = intelTechniquesCategories.filter(cat => categories[cat]);
                console.log(`   Found ${foundCategories.length}/${intelTechniquesCategories.length} IntelTechniques categories`);
                
                return foundCategories.length > 0;
            }
        },
        {
            name: 'Email Search Tool',
            test: async () => {
                const response = await axios.get(`${BASE_URL}/api/tools/emailAddresses/emailSearch`);
                return response.status === 200 && response.data.success;
            }
        },
        {
            name: 'Username Search Tool',
            test: async () => {
                const response = await axios.get(`${BASE_URL}/api/tools/usernames/usernameSearch`);
                return response.status === 200 && response.data.success;
            }
        },
        {
            name: 'Domain Analysis Tool',
            test: async () => {
                const response = await axios.get(`${BASE_URL}/api/tools/domains/domainAnalysis`);
                return response.status === 200 && response.data.success;
            }
        },
        {
            name: 'IP Analysis Tool',
            test: async () => {
                const response = await axios.get(`${BASE_URL}/api/tools/ipAddresses/ipAnalysis`);
                return response.status === 200 && response.data.success;
            }
        },
        {
            name: 'Google Advanced Search Tool',
            test: async () => {
                const response = await axios.get(`${BASE_URL}/api/tools/searchEngines/googleAdvanced`);
                return response.status === 200 && response.data.success;
            }
        },
        {
            name: 'Execute Email Search',
            test: async () => {
                const response = await axios.post(`${BASE_URL}/api/tools/emailAddresses/emailSearch/execute`, {
                    parameters: { email: 'test@example.com' }
                });
                return response.status === 200 && response.data.success;
            }
        },
        {
            name: 'Execute Username Search',
            test: async () => {
                const response = await axios.post(`${BASE_URL}/api/tools/usernames/usernameSearch/execute`, {
                    parameters: { username: 'testuser' }
                });
                return response.status === 200 && response.data.success;
            }
        },
        {
            name: 'Execute Domain Analysis',
            test: async () => {
                const response = await axios.post(`${BASE_URL}/api/tools/domains/domainAnalysis/execute`, {
                    parameters: { domain: 'example.com' }
                });
                return response.status === 200 && response.data.success;
            }
        },
        {
            name: 'Execute IP Analysis',
            test: async () => {
                const response = await axios.post(`${BASE_URL}/api/tools/ipAddresses/ipAnalysis/execute`, {
                    parameters: { ip: '8.8.8.8' }
                });
                return response.status === 200 && response.data.success;
            }
        },
        {
            name: 'Search Tools',
            test: async () => {
                const response = await axios.get(`${BASE_URL}/api/tools/search?q=email`);
                return response.status === 200 && response.data.success && response.data.data.results.length > 0;
            }
        },
        {
            name: 'IntelTechniques Page Access',
            test: async () => {
                const response = await axios.get(`${BASE_URL}/inteltechniques`);
                return response.status === 200;
            }
        },
        {
            name: 'AI Chat Integration',
            test: async () => {
                const response = await axios.post(`${BASE_URL}/api/chat`, {
                    message: 'How can I search for email addresses?',
                    context: { currentPage: 'IntelTechniques' }
                });
                return response.status === 200 && response.data.success;
            }
        }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            console.log(`📋 Testing: ${test.name}`);
            const result = await test.test();
            
            if (result) {
                console.log(`✅ PASS: ${test.name}\n`);
                passed++;
            } else {
                console.log(`❌ FAIL: ${test.name}\n`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ERROR: ${test.name} - ${error.message}\n`);
            failed++;
        }
    }

    console.log('📊 Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed === 0) {
        console.log('\n🎉 All IntelTechniques integration tests passed!');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the implementation.');
    }
}

// Run the tests
testIntelTechniquesIntegration().catch(console.error); 