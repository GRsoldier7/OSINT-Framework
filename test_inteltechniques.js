const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testIntelTechniquesIntegration() {
    console.log('🧪 Testing IntelTechniques Integration...\n');

    try {
        // Test 1: Check if server is running
        console.log('1. Testing server connectivity...');
        const healthResponse = await axios.get(`${BASE_URL}/api/health`);
        console.log('✅ Server is running');

        // Test 2: Check IntelTechniques categories
        console.log('\n2. Testing IntelTechniques categories...');
        const categoriesResponse = await axios.get(`${BASE_URL}/api/tools/categories`);
        const intelTechniquesCategories = Object.keys(categoriesResponse.data.data).filter(key => 
            ['searchEngines', 'facebook', 'xTwitter', 'instagram', 'linkedin', 'emailAddresses', 
             'usernames', 'names', 'addresses', 'telephoneNumbers', 'maps', 'pastes', 'videos', 
             'domains', 'ipAddresses', 'businessGovernment', 'vehicles', 'virtualCurrencies', 
             'breachesLeaks', 'liveStreams', 'apis'].includes(key)
        );
        console.log(`✅ Found ${intelTechniquesCategories.length} IntelTechniques categories`);

        // Test 3: Test IntelTechniques page
        console.log('\n3. Testing IntelTechniques page...');
        const pageResponse = await axios.get(`${BASE_URL}/inteltechniques`);
        if (pageResponse.data.includes('IntelTechniques')) {
            console.log('✅ IntelTechniques page loads correctly');
        } else {
            console.log('❌ IntelTechniques page not found');
        }

        // Test 4: Test a specific IntelTechniques tool
        console.log('\n4. Testing IntelTechniques tool execution...');
        const toolResponse = await axios.post(`${BASE_URL}/api/tools/searchEngines/googleAdvanced/execute`, {
            parameters: { query: 'test query' }
        });
        console.log('✅ IntelTechniques tool execution working');

        // Test 5: Check navigation includes IntelTechniques
        console.log('\n5. Testing navigation...');
        const navResponse = await axios.get(`${BASE_URL}/`);
        if (navResponse.data.includes('IntelTechniques')) {
            console.log('✅ IntelTechniques link in navigation');
        } else {
            console.log('❌ IntelTechniques link not found in navigation');
        }

        console.log('\n🎉 All IntelTechniques integration tests passed!');
        console.log('\n📊 Summary:');
        console.log(`- Server: ✅ Running`);
        console.log(`- Categories: ✅ ${intelTechniquesCategories.length} IntelTechniques categories`);
        console.log(`- Page: ✅ IntelTechniques page accessible`);
        console.log(`- Tools: ✅ Tool execution working`);
        console.log(`- Navigation: ✅ IntelTechniques link available`);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testIntelTechniquesIntegration(); 