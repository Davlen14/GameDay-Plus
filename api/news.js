// Vercel API Function for News API
// This securely proxies news requests to avoid CORS and protect API keys

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

  const { query, category = 'sports', lang = 'en', country = 'us', max = 10 } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter required' });
  }

  try {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&category=${category}&lang=${lang}&country=${country}&max=${max}&apikey=${process.env.GNEWS_API_KEY}`;
    
    console.log(`📡 [News Proxy] Fetching news for: ${query}`);

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ News API Error: ${response.status}`);
      return res.status(response.status).json({ 
        error: `News API Error: ${response.status} ${response.statusText}` 
      });
    }

    const data = await response.json();
    console.log(`✅ News API request successful`);
    res.status(200).json(data);
  } catch (error) {
    console.error('❌ News API Proxy Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
