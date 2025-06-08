// Test GraphQL utility functions
const graphqlService = require('./src/services/graphqlService.js');

async function testUtils() {
  console.log('🔧 Testing GraphQL Utility Functions...\n');

  try {
    // Test isAvailable
    console.log('🔍 Testing GraphQL availability check...');
    const isAvailable = await graphqlService.default.utils.isAvailable();
    console.log(`✅ GraphQL Available: ${isAvailable}`);
    
    // Test direct query
    console.log('\n🎯 Testing direct query execution...');
    const query = `
      query TestDirectQuery {
        currentTeams(limit: 3, where: {classification: {_eq: "fbs"}}) {
          school
          conference
        }
      }
    `;
    
    const result = await graphqlService.default.query(query);
    console.log(`✅ Direct query successful: ${result.currentTeams.length} teams`);
    console.log('Sample result:', result.currentTeams[0]);
    
    console.log('\n🎉 All utility tests passed!');
    
  } catch (error) {
    console.error('❌ Utility test failed:', error.message);
  }
}

testUtils();
