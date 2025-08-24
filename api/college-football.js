// Vercel API Function for College Football Data API
// This securely proxies requests to avoid CORS and protect API keys

export default async function handler(req, res) {
  // Enable CORS for your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpoint, ...params } = req.query;
  
  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint parameter required' });
  }

  try {
    const url = new URL(`https://api.collegefootballdata.com${endpoint}`);
    
    // Add query parameters
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });

    console.log(`📡 [API Proxy] College Football request: ${url.toString()}`);

    // Try multiple environment variable names for flexibility
    const apiKey = process.env.COLLEGE_FOOTBALL_API_KEY || process.env.REACT_APP_COLLEGE_FOOTBALL_API_KEY || 'T0iV2bfp8UKCf8rTV12qsS26USzyDYiVNA7x6WbaV3NOvewuDQnJlv3NfPzr3f/p';
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ College Football API Error: ${response.status}`, errorText);
      return res.status(response.status).json({ 
        error: `API Error: ${response.status} ${response.statusText}`,
        details: errorText 
      });
    }

    const data = await response.json();
    console.log(`✅ College Football API request successful for: ${endpoint}`);
    res.status(200).json(data);
  } catch (error) {
    console.error('❌ College Football API Proxy Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
