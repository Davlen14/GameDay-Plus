#!/usr/bin/env node

/**
 * Quick test for fixed College Football API proxy
 */

console.log('🧪 Testing Fixed College Football API Proxy...\n');

const testLocalProxy = async () => {
    try {
        // Test the proxy function directly
        const handler = require('./api/college-football.js').default;
        
        const mockReq = {
            method: 'GET',
            query: {
                endpoint: '/games',
                year: '2024',
                week: '1'
            }
        };

        let responseData = null;
        let statusCode = 200;

        const mockRes = {
            setHeader: () => {},
            status: (code) => {
                statusCode = code;
                return { json: (data) => { responseData = data; } };
            },
            json: (data) => { responseData = data; },
            end: () => {}
        };

        await handler(mockReq, mockRes);
        
        if (statusCode === 200 && responseData && Array.isArray(responseData)) {
            console.log(`✅ Proxy test PASSED! Got ${responseData.length} games`);
            console.log(`✅ First game: ${responseData[0]?.homeTeam} vs ${responseData[0]?.awayTeam}`);
        } else {
            console.log(`❌ Proxy test FAILED! Status: ${statusCode}`);
            console.log('Response:', responseData);
        }
    } catch (error) {
        console.log('❌ Test error:', error.message);
    }
};

testLocalProxy();
