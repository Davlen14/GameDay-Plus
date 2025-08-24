#!/usr/bin/env node

/**
 * College Football API Proxy Diagnostic Tool
 * This tool tests your /api/college-football Vercel proxy function
 */

console.log('🔧 College Football API Proxy Diagnostic Tool');
console.log('==============================================\n');

// Test 1: Check environment variables
console.log('📋 1. Checking Environment Variables:');
console.log('COLLEGE_FOOTBALL_API_KEY:', process.env.COLLEGE_FOOTBALL_API_KEY ? 
    `✅ Set (${process.env.COLLEGE_FOOTBALL_API_KEY.substring(0, 10)}...)` : 
    '❌ Not Set'
);
console.log('REACT_APP_COLLEGE_FOOTBALL_API_KEY:', process.env.REACT_APP_COLLEGE_FOOTBALL_API_KEY ? 
    `✅ Set (${process.env.REACT_APP_COLLEGE_FOOTBALL_API_KEY.substring(0, 10)}...)` : 
    '❌ Not Set'
);
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('');

// Test 2: Test direct API access
console.log('📡 2. Testing Direct API Access:');
const testDirectAPI = async () => {
    try {
        const apiKey = process.env.COLLEGE_FOOTBALL_API_KEY || process.env.REACT_APP_COLLEGE_FOOTBALL_API_KEY;
        if (!apiKey) {
            console.log('❌ No API key available for direct test');
            return;
        }

        const response = await fetch('https://api.collegefootballdata.com/games?year=2024&week=1', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Direct API works - Got ${data.length} games`);
        } else {
            console.log(`❌ Direct API failed - ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.log('Error details:', errorText.substring(0, 200));
        }
    } catch (error) {
        console.log('❌ Direct API error:', error.message);
    }
};

// Test 3: Test proxy function locally
console.log('🔧 3. Testing Proxy Function Logic:');
const testProxyLogic = async () => {
    try {
        // Import the proxy function
        const handler = require('./api/college-football.js').default;
        
        // Mock request and response objects
        const mockReq = {
            method: 'GET',
            query: {
                endpoint: '/games',
                year: '2024',
                week: '1'
            }
        };

        const mockRes = {
            statusValue: 200,
            headersSet: {},
            responseData: null,
            setHeader: function(key, value) {
                this.headersSet[key] = value;
            },
            status: function(code) {
                this.statusValue = code;
                return this;
            },
            json: function(data) {
                this.responseData = data;
                return this;
            },
            end: function() {
                return this;
            }
        };

        console.log('Running proxy function with mock data...');
        await handler(mockReq, mockRes);
        
        if (mockRes.statusValue === 200 && mockRes.responseData) {
            console.log(`✅ Proxy function works - Status: ${mockRes.statusValue}`);
            if (Array.isArray(mockRes.responseData)) {
                console.log(`   Got ${mockRes.responseData.length} items`);
            } else {
                console.log('   Got response data');
            }
        } else {
            console.log(`❌ Proxy function failed - Status: ${mockRes.statusValue}`);
            console.log('   Response:', mockRes.responseData);
        }
    } catch (error) {
        console.log('❌ Proxy function error:', error.message);
        console.log('   Stack:', error.stack.split('\n')[1]);
    }
};

// Test 4: Check Vercel configuration
console.log('📋 4. Checking Vercel Configuration:');
const fs = require('fs');
const path = require('path');

try {
    const vercelConfig = JSON.parse(fs.readFileSync('./vercel.json', 'utf8'));
    console.log('✅ vercel.json exists');
    
    if (vercelConfig.functions && vercelConfig.functions['api/college-football.js']) {
        console.log('✅ College Football API function configured');
        console.log('   Max Duration:', vercelConfig.functions['api/college-football.js'].maxDuration || 'default');
    } else {
        console.log('⚠️  College Football API function not specifically configured');
    }
} catch (error) {
    console.log('❌ Error reading vercel.json:', error.message);
}

// Test 5: Recommendations
console.log('\n💡 5. Recommendations:');
console.log('');

const recommendations = [
    '1. Ensure COLLEGE_FOOTBALL_API_KEY is set in Vercel environment variables',
    '2. Redeploy your Vercel application after setting environment variables',
    '3. Check Vercel function logs for detailed error information',
    '4. Verify API key has proper permissions on collegefootballdata.com',
    '5. Test the deployed /api/college-football endpoint directly'
];

recommendations.forEach(rec => console.log(`   ${rec}`));

console.log('\n🚀 6. Next Steps:');
console.log('   • Run this test locally: node test-college-football-proxy.js');
console.log('   • Check Vercel dashboard > Functions > Logs');
console.log('   • Test deployed endpoint: https://your-app.vercel.app/api/college-football?endpoint=/games&year=2024&week=1');

// Run tests
(async () => {
    await testDirectAPI();
    console.log('');
    await testProxyLogic();
    console.log('');
    console.log('🔍 Diagnostic Complete!');
})();
