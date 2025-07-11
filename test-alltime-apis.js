const { gameService } = require('./src/services/gameService.js');
const { teamService } = require('./src/services/teamService.js');

// Test AllTime API endpoints to debug the issue
async function testAllTimeAPIs() {
  try {
    console.log('🔍 Testing AllTime API endpoints...\n');

    // Test teams
    const team1Name = 'Ohio State';
    const team2Name = 'Michigan';
    
    console.log(`📋 Testing for teams: ${team1Name} vs ${team2Name}\n`);

    // Test Records API
    console.log('=== TESTING RECORDS API ===');
    try {
      const records2023 = await gameService.getRecords(2023, team1Name);
      console.log(`✅ ${team1Name} 2023 records:`, records2023?.length || 0, 'records');
      if (records2023?.length > 0) {
        console.log('Sample record structure:', JSON.stringify(records2023[0], null, 2));
      }
    } catch (err) {
      console.error(`❌ Failed to get records for ${team1Name}:`, err.message);
    }

    // Test Bowl Games API
    console.log('\n=== TESTING BOWL GAMES API ===');
    try {
      const bowlGames2023 = await gameService.getGames(2023, null, 'postseason', team1Name);
      console.log(`✅ ${team1Name} 2023 bowl games:`, bowlGames2023?.length || 0, 'games');
      if (bowlGames2023?.length > 0) {
        console.log('Sample bowl game structure:', JSON.stringify(bowlGames2023[0], null, 2));
      }
    } catch (err) {
      console.error(`❌ Failed to get bowl games for ${team1Name}:`, err.message);
    }

    // Test Teams API
    console.log('\n=== TESTING TEAMS API ===');
    try {
      const allTeams = await teamService.getFBSTeams();
      const ohioState = allTeams?.find(team => team.school === team1Name);
      const michigan = allTeams?.find(team => team.school === team2Name);
      
      console.log(`✅ Found ${team1Name}:`, !!ohioState);
      console.log(`✅ Found ${team2Name}:`, !!michigan);
      
      if (ohioState) {
        console.log(`${team1Name} info:`, {
          school: ohioState.school,
          color: ohioState.color,
          logo: ohioState.logos?.[0] ? 'has logo' : 'no logo'
        });
      }
    } catch (err) {
      console.error('❌ Failed to get teams:', err.message);
    }

    // Test multiple years for one team
    console.log('\n=== TESTING MULTI-YEAR DATA ===');
    const years = [2020, 2021, 2022, 2023, 2024];
    
    for (const year of years) {
      try {
        const records = await gameService.getRecords(year, team1Name);
        const bowlGames = await gameService.getGames(year, null, 'postseason', team1Name);
        
        console.log(`${year}: Records=${records?.length || 0}, Bowls=${bowlGames?.length || 0}`);
        
        if (records?.length > 0) {
          const record = records[0];
          console.log(`  - Total record: ${record.total?.wins || 0}-${record.total?.losses || 0}-${record.total?.ties || 0}`);
          console.log(`  - Conference: ${record.conferenceGames?.wins || 0}-${record.conferenceGames?.losses || 0}`);
        }
      } catch (err) {
        console.log(`${year}: Error - ${err.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAllTimeAPIs().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
