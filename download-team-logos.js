const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Fetch teams data from College Football Data API
async function fetchTeams() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.collegefootballdata.com',
      port: 443,
      path: '/teams',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer p5M3+9PK7Kt1CIMox0hgi7zgyWKCeO86buPF+tEH/zPCExymKp+v+IBrl7rKucSq',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const teams = JSON.parse(data);
          resolve(teams);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Download a single logo
async function downloadLogo(logoUrl, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    const parsedUrl = url.parse(logoUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    client.get(logoUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${logoUrl}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (error) => {
        fs.unlink(filePath, () => {}); // Delete the file on error
        reject(error);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  try {
    console.log('Fetching teams data...');
    const teams = await fetchTeams();
    
    const logoDir = '/Users/davlenswain/Development/davlens-final-gameday-website/gameday-website-react/public/team logos';
    
    // Ensure directory exists
    if (!fs.existsSync(logoDir)) {
      fs.mkdirSync(logoDir, { recursive: true });
    }
    
    console.log(`Found ${teams.length} teams`);
    
    let downloadCount = 0;
    let skippedCount = 0;
    
    for (const team of teams) {
      if (team.logos && Array.isArray(team.logos) && team.logos.length > 0) {
        for (let i = 0; i < team.logos.length; i++) {
          const logoUrl = team.logos[i];
          if (logoUrl && logoUrl.startsWith('http')) {
            try {
              // Extract filename from URL
              const urlParts = logoUrl.split('/');
              const filename = urlParts[urlParts.length - 1];
              
              // Create a more descriptive filename
              const isDark = logoUrl.includes('-dark');
              const teamName = team.school.replace(/[^a-zA-Z0-9]/g, '_');
              const logoFilename = `${teamName}_${team.id}_${isDark ? 'dark' : 'light'}_${filename}`;
              
              const filePath = path.join(logoDir, logoFilename);
              
              // Skip if file already exists
              if (fs.existsSync(filePath)) {
                console.log(`⏭️  Skipping ${logoFilename} (already exists)`);
                skippedCount++;
                continue;
              }
              
              console.log(`⬇️  Downloading ${logoFilename}...`);
              await downloadLogo(logoUrl, filePath);
              downloadCount++;
              
              // Small delay to be nice to the server
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
              console.error(`❌ Failed to download logo for ${team.school}:`, error.message);
            }
          }
        }
      } else {
        skippedCount++;
      }
    }
    
    console.log(`\n✅ Download complete!`);
    console.log(`📥 Downloaded: ${downloadCount} logos`);
    console.log(`⏭️  Skipped: ${skippedCount} teams (no logos or already exist)`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
