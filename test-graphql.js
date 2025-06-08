// Test GraphQL service functionality
// Import the GraphQL service
const graphqlService = require('./src/services/graphqlService.js');

async function testGraphQLService() {
  console.log('🚀 Testing GraphQL Service...\n');

  try {
    // Test 1: Get current teams
    console.log('📊 Test 1: Getting current teams...');
    const teams = await graphqlService.default.getTeams();
    console.log(`✅ Found ${teams.length} FBS teams`);
    if (teams.length > 0) {
      console.log('Sample team:', teams[0]);
    }
    console.log('');

    // Test 2: Get team by school
    console.log('🏫 Test 2: Getting team by school (Georgia)...');
    const georgia = await graphqlService.default.getTeamBySchool('Georgia');
    console.log('✅ Georgia team:', georgia);
    console.log('');

    // Test 3: Get games by team
    console.log('🏈 Test 3: Getting recent games for Georgia...');
    const georgiaGames = await graphqlService.default.getGamesByTeam('Georgia', 2024, 'regular');
    console.log(`✅ Found ${georgiaGames.length} Georgia games in 2024`);
    if (georgiaGames.length > 0) {
      console.log('Sample game:', georgiaGames[0]);
    }
    console.log('');
    console.log('🎉 All GraphQL tests passed!');
    
  } catch (error) {
    console.error('❌ GraphQL test failed:', error);
    console.error('Error details:', error.message);
    
    // Fallback test with REST
    console.log('\n🔄 Testing REST fallback...');
    try {
      const response = await fetch('https://api.collegefootballdata.com/teams');
      const restTeams = await response.json();
      console.log(`✅ REST fallback works: ${restTeams.length} teams found`);
    } catch (restError) {
      console.error('❌ REST fallback also failed:', restError);
    }
  }
}

// Run the test
testGraphQLService();