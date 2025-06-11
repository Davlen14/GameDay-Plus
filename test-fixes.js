// Quick test script to verify our fixes
const path = require('path');

// Test if we can import the services
async function testImports() {
  console.log('🧪 Testing service imports...');
  
  try {
    // Test basic imports
    console.log('✓ Testing imports...');
    
    // Test if files exist
    const fs = require('fs');
    
    const matchupPredictorPath = path.join(__dirname, 'src/utils/MatchupPredictor.js');
    const graphqlServicePath = path.join(__dirname, 'src/services/graphqlService.js');
    const teamServicePath = path.join(__dirname, 'src/services/teamService.js');
    
    if (fs.existsSync(matchupPredictorPath)) {
      console.log('✓ MatchupPredictor.js exists');
    } else {
      console.log('❌ MatchupPredictor.js missing');
    }
    
    if (fs.existsSync(graphqlServicePath)) {
      console.log('✓ graphqlService.js exists');
    } else {
      console.log('❌ graphqlService.js missing');
    }
    
    if (fs.existsSync(teamServicePath)) {
      console.log('✓ teamService.js exists');
    } else {
      console.log('❌ teamService.js missing');
    }
    
    // Test GraphQL endpoint
    console.log('\n🔗 Testing GraphQL endpoint...');
    const https = require('https');
    
    const data = JSON.stringify({
      query: 'query { currentTeams(limit: 1) { school } }'
    });
    
    const options = {
      hostname: 'graphql.collegefootballdata.com',
      port: 443,
      path: '/v1/graphql',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer p5M3+9PK7Kt1CIMox0hgi7zgyWKCeO86buPF+tEH/zPCExymKp+v+IBrl7rKucSq',
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      console.log(`GraphQL Status: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (parsed.data && parsed.data.currentTeams) {
            console.log('✓ GraphQL endpoint working');
            console.log(`✓ Sample team: ${parsed.data.currentTeams[0]?.school}`);
          } else {
            console.log('❌ GraphQL endpoint returned unexpected data');
          }
        } catch (e) {
          console.log('❌ GraphQL endpoint returned invalid JSON');
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ GraphQL endpoint error: ${error.message}`);
    });
    
    req.write(data);
    req.end();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testImports();
