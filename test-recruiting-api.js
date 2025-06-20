#!/usr/bin/env node

// Test script to check the recruiting players API endpoint
const url = 'https://api.collegefootballdata.com/recruiting/players?year=2026&classification=HighSchool';

async function testRecruitingAPI() {
  try {
    console.log('🔍 Testing recruiting players API endpoint...');
    console.log('URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Bearer p5M3+9PK7Kt1CIMox0hgi7zgyWKCeO86buPF+tEH/zPCExymKp+v+IBrl7rKucSq',
        'Accept': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (!response.ok) {
      console.error('❌ API request failed');
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API request successful');
    console.log('Response length:', data.length);
    
    if (data.length > 0) {
      console.log('\n📊 Sample data structure:');
      console.log(JSON.stringify(data[0], null, 2));
      
      console.log('\n🔍 First 5 recruits:');
      data.slice(0, 5).forEach((recruit, index) => {
        console.log(`${index + 1}. ${recruit.name} - ${recruit.position} - ${recruit.stars || 'N/A'} stars - ${recruit.school || 'Unknown school'}`);
      });
    } else {
      console.log('⚠️ No data returned');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testRecruitingAPI();
