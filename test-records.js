const { gameService } = require('./src/services/gameService');

async function testRecordsAPI() {
  try {
    console.log('Testing Records API to verify data structure...');
    
    // Test with a known team like Alabama
    const records = await gameService.getRecords(2023, 'Alabama');
    
    console.log('Records API response for Alabama 2023:');
    console.log(JSON.stringify(records, null, 2));
    
    if (records && records.length > 0) {
      const record = records[0];
      console.log('\nKey fields from first record:');
      console.log('team:', record.team);
      console.log('total:', record.total);
      console.log('postseason:', record.postseason);
      console.log('conferenceGames:', record.conferenceGames);
      
      // Test the Swift calculation logic
      if (record.total) {
        console.log('\nSwift-style calculations:');
        console.log('total.wins:', record.total.wins);
        console.log('total.games:', record.total.games);
        console.log('winPercentage:', record.total.games > 0 ? (record.total.wins / record.total.games * 100).toFixed(1) + '%' : '0%');
      }
      
      if (record.postseason) {
        console.log('postseason.games:', record.postseason.games);
        console.log('postseason.wins:', record.postseason.wins);
      }
    }
    
  } catch (error) {
    console.error('Error testing records API:', error);
  }
}

testRecordsAPI();
