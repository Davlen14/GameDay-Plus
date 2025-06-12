#!/usr/bin/env node

// College Football Data API Usage Checker
const https = require('https');

const API_KEY = 'p5M3+9PK7Kt1CIMox0hgi7zgyWKCeO86buPF+tEH/zPCExymKp+v+IBrl7rKucSq';

console.log('📊 College Football Data API Usage Check\n');
console.log('🔑 API Key:', API_KEY.substring(0, 20) + '...\n');

// Function to check API rate limits and usage
const checkAPIUsage = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.collegefootballdata.com',
      port: 443,
      path: '/teams?limit=1', // Small request to check headers
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      }
    };

    console.log('🔍 Checking API rate limits and usage...\n');

    const req = https.request(options, (res) => {
      let responseData = '';
      
      console.log(`📡 Response Status: ${res.statusCode} ${res.statusMessage}`);
      
      // Check rate limit headers
      const headers = res.headers;
      console.log('\n📈 Rate Limit Information:');
      
      // Common rate limit header names
      const rateLimitHeaders = [
        'x-ratelimit-limit',
        'x-ratelimit-remaining', 
        'x-ratelimit-reset',
        'x-rate-limit-limit',
        'x-rate-limit-remaining',
        'x-rate-limit-reset',
        'ratelimit-limit',
        'ratelimit-remaining',
        'ratelimit-reset',
        'x-quota-limit',
        'x-quota-remaining',
        'x-quota-reset'
      ];

      let foundRateLimitInfo = false;
      
      rateLimitHeaders.forEach(headerName => {
        if (headers[headerName]) {
          foundRateLimitInfo = true;
          let value = headers[headerName];
          
          // Format different header types
          if (headerName.includes('limit') && !headerName.includes('remaining')) {
            console.log(`   📊 Requests Limit: ${value}`);
          } else if (headerName.includes('remaining')) {
            console.log(`   🔄 Requests Remaining: ${value}`);
          } else if (headerName.includes('reset')) {
            // Convert timestamp if it's a number
            if (!isNaN(value)) {
              const resetDate = new Date(parseInt(value) * 1000);
              console.log(`   ⏰ Reset Time: ${resetDate.toLocaleString()} (${value})`);
            } else {
              console.log(`   ⏰ Reset Info: ${value}`);
            }
          }
        }
      });

      if (!foundRateLimitInfo) {
        console.log('   ⚠️  No rate limit headers found in response');
        console.log('\n🔍 Available Headers:');
        Object.keys(headers).forEach(header => {
          if (header.toLowerCase().includes('limit') || 
              header.toLowerCase().includes('quota') || 
              header.toLowerCase().includes('rate')) {
            console.log(`   ${header}: ${headers[header]}`);
          }
        });
      }

      // Check if API key is valid
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log('\n🔐 API Key Status:');
        
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(responseData);
            if (Array.isArray(data) && data.length > 0) {
              console.log('   ✅ API Key Valid - Successfully retrieved data');
              console.log(`   📦 Sample Response: ${data.length} team(s) returned`);
            } else {
              console.log('   ⚠️  API Key Valid but no data returned');
            }
          } catch (e) {
            console.log('   ⚠️  API Key Valid but response parsing failed');
          }
        } else if (res.statusCode === 401) {
          console.log('   ❌ API Key Invalid or Expired');
        } else if (res.statusCode === 429) {
          console.log('   🔥 API Key Valid but Rate Limit Exceeded');
        } else if (res.statusCode === 403) {
          console.log('   🚫 API Key Valid but Access Forbidden');
        } else {
          console.log(`   ⚠️  Unexpected status: ${res.statusCode}`);
        }

        resolve({
          statusCode: res.statusCode,
          headers: headers,
          hasRateLimitInfo: foundRateLimitInfo
        });
      });
    });

    req.on('error', (e) => {
      console.log(`❌ API Request Error: ${e.message}`);
      resolve({ error: e.message });
    });

    req.setTimeout(10000, () => {
      console.log('❌ API Request Timeout');
      req.destroy();
      resolve({ error: 'timeout' });
    });

    req.end();
  });
};

// Function to check GraphQL API limits
const checkGraphQLUsage = () => {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      query: 'query { currentTeams(limit: 1) { school } }'
    });

    const options = {
      hostname: 'graphql.collegefootballdata.com',
      port: 443,
      path: '/v1/graphql',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    console.log('\n🚀 Checking GraphQL API usage...\n');

    const req = https.request(options, (res) => {
      console.log(`📡 GraphQL Response Status: ${res.statusCode} ${res.statusMessage}`);
      
      const headers = res.headers;
      
      // Check for GraphQL-specific rate limit headers
      console.log('\n📈 GraphQL Rate Limit Information:');
      
      let foundRateLimitInfo = false;
      const rateLimitHeaders = [
        'x-ratelimit-limit',
        'x-ratelimit-remaining', 
        'x-ratelimit-reset',
        'x-rate-limit-limit',
        'x-rate-limit-remaining',
        'x-rate-limit-reset'
      ];

      rateLimitHeaders.forEach(headerName => {
        if (headers[headerName]) {
          foundRateLimitInfo = true;
          console.log(`   ${headerName}: ${headers[headerName]}`);
        }
      });

      if (!foundRateLimitInfo) {
        console.log('   ⚠️  No GraphQL rate limit headers found');
      }

      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log('\n🔐 GraphQL API Status:');
        
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(responseData);
            if (data.data) {
              console.log('   ✅ GraphQL API Working - Data retrieved successfully');
            } else if (data.errors) {
              console.log('   ⚠️  GraphQL API responding but has errors:');
              data.errors.forEach(error => {
                console.log(`      - ${error.message}`);
              });
            }
          } catch (e) {
            console.log('   ⚠️  GraphQL response parsing failed');
          }
        } else {
          console.log(`   ❌ GraphQL API Error: ${res.statusCode}`);
        }

        resolve({
          statusCode: res.statusCode,
          headers: headers,
          hasRateLimitInfo: foundRateLimitInfo
        });
      });
    });

    req.on('error', (e) => {
      console.log(`❌ GraphQL API Error: ${e.message}`);
      resolve({ error: e.message });
    });

    req.setTimeout(10000, () => {
      console.log('❌ GraphQL API Timeout');
      req.destroy();
      resolve({ error: 'timeout' });
    });

    req.write(data);
    req.end();
  });
};

// Run the checks
const runUsageCheck = async () => {
  console.log('Starting comprehensive API usage check...\n');
  
  const [restResult, graphqlResult] = await Promise.all([
    checkAPIUsage(),
    checkGraphQLUsage()
  ]);

  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY REPORT');
  console.log('='.repeat(60));

  // REST API Summary
  console.log('\n🔹 REST API (api.collegefootballdata.com):');
  if (restResult.error) {
    console.log(`   Status: ❌ Error - ${restResult.error}`);
  } else {
    console.log(`   Status: ${restResult.statusCode === 200 ? '✅ Working' : '⚠️  Issues detected'}`);
    console.log(`   Rate Limit Info: ${restResult.hasRateLimitInfo ? '✅ Available' : '❌ Not provided'}`);
  }

  // GraphQL API Summary  
  console.log('\n🔹 GraphQL API (graphql.collegefootballdata.com):');
  if (graphqlResult.error) {
    console.log(`   Status: ❌ Error - ${graphqlResult.error}`);
  } else {
    console.log(`   Status: ${graphqlResult.statusCode === 200 ? '✅ Working' : '⚠️  Issues detected'}`);
    console.log(`   Rate Limit Info: ${graphqlResult.hasRateLimitInfo ? '✅ Available' : '❌ Not provided'}`);
  }

  console.log('\n💡 Recommendations:');
  
  if (restResult.statusCode === 200 && graphqlResult.statusCode === 200) {
    console.log('   🎉 Both APIs working perfectly!');
    console.log('   🚀 Your app should have optimal performance');
  } else if (restResult.statusCode === 200) {
    console.log('   ⚠️  GraphQL having issues, but REST API working');
    console.log('   🔄 Your app will use REST API fallback');
  } else if (graphqlResult.statusCode === 200) {
    console.log('   ⚠️  REST API having issues, but GraphQL working');  
    console.log('   🚀 Your app will use GraphQL (preferred)');
  } else {
    console.log('   🔥 Both APIs having issues');
    console.log('   🛡️  Your app will use mock data fallbacks');
  }

  console.log('\n📊 Next Steps:');
  console.log('   1. Check your app: https://gameday-plus.vercel.app/#game-predictor');
  console.log('   2. Monitor browser console for [API DEBUG] messages');
  console.log('   3. Review API-MONITORING-GUIDE.md for detailed troubleshooting');
  
  if (!restResult.hasRateLimitInfo && !graphqlResult.hasRateLimitInfo) {
    console.log('\n⚠️  Note: Rate limit information not provided by API');
    console.log('   College Football Data API may not expose usage metrics in headers');
    console.log('   Monitor for 429 (Too Many Requests) status codes to detect limits');
  }
};

runUsageCheck().catch(console.error);
