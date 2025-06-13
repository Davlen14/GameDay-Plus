// Vercel API Function for GraphQL queries
// This securely proxies GraphQL requests to avoid CORS and protect API keys

export default async function handler(req, res) {
  // Enable CORS for your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, variables = {} } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'GraphQL query required' });
  }

  try {
    console.log('🚀 [GraphQL Proxy] Attempting request to GraphQL endpoint...');

    const response = await fetch('https://graphql.collegefootballdata.com/v1/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.COLLEGE_FOOTBALL_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      console.log('❌ [GraphQL Proxy] Request failed with status:', response.status);
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `GraphQL API Error: ${response.status} ${response.statusText}`,
        details: errorText 
      });
    }

    const result = await response.json();
    
    if (result.errors) {
      console.log('❌ [GraphQL Proxy] GraphQL returned errors:', result.errors);
      return res.status(400).json({ 
        error: 'GraphQL query errors',
        errors: result.errors 
      });
    }
    
    console.log('✅ [GraphQL Proxy] Request successful');
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ [GraphQL Proxy] Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
