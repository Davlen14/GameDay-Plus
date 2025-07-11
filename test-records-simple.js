// Test the records API independently
async function testRecords() {
  try {
    const API_BASE = 'https://api.collegefootballdata.com';
    
    const response = await fetch(`${API_BASE}/records?year=2023&team=Alabama`, {
      headers: {
        'Authorization': 'Bearer QCWjdN6RBGbDlY1G6PEwqX3HQGYuVf+TFa9zHwTYdFQ54EcuJKKLMnbFVK9aMnJY'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const records = await response.json();
    console.log('Alabama 2023 Records:', JSON.stringify(records, null, 2));
    
    if (records && records.length > 0) {
      const record = records[0];
      console.log('\nKey calculations:');
      console.log('Total wins:', record.total?.wins);
      console.log('Total games:', record.total?.games);
      console.log('Bowl games:', record.postseason?.games);
      console.log('Bowl wins:', record.postseason?.wins);
      console.log('Conference wins:', record.conferenceGames?.wins);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testRecords();
