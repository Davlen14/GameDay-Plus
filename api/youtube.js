// Vercel API Function for YouTube API
// This securely proxies YouTube requests to avoid CORS and protect API keys

export default async function handler(req, res) {
  // Enable CORS for your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, maxResults = 25 } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter required' });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${process.env.YOUTUBE_API_KEY}`;
    
    console.log(`📡 [YouTube Proxy] Searching for: ${query}`);

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ YouTube API Error: ${response.status}`);
      return res.status(response.status).json({ 
        error: `YouTube API Error: ${response.status} ${response.statusText}` 
      });
    }

    const data = await response.json();
    console.log(`✅ YouTube API request successful`);
    res.status(200).json(data);
  } catch (error) {
    console.error('❌ YouTube API Proxy Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
