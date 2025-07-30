// Core API utility functions
const COLLEGE_FOOTBALL_API_BASE = 'https://api.collegefootballdata.com';
const COLLEGE_FOOTBALL_GRAPHQL_BASE = 'https://graphql.collegefootballdata.com/v1/graphql';
const COLLEGE_FOOTBALL_API_KEY = process.env.REACT_APP_COLLEGE_FOOTBALL_API_KEY || 'p5M3+9PK7Kt1CIMox0hgi7zgyWKCeO86buPF+tEH/zPCExymKp+v+IBrl7rKucSq';
const GNEWS_API_KEY = process.env.REACT_APP_GNEWS_API_KEY;
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

// College Football Data API with smart routing to YOUR existing Vercel Functions
const fetchCollegeFootballData = async (endpoint, params = {}) => {
  console.log(`📡 [API DEBUG] Making REST API request to: ${endpoint}`, params);

  // Production: Use YOUR existing /api/college-football Vercel Function
  if (process.env.NODE_ENV === 'production') {
    try {
      const queryParams = new URLSearchParams({
        endpoint,
        ...params
      });

      const response = await fetch(`/api/college-football?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ [API DEBUG] Your Vercel Function successful for: ${endpoint}`);
        return data;
      } else {
        console.warn(`⚠️ [API DEBUG] Your Vercel Function failed, trying direct API...`);
        // Fall through to direct API call
      }
    } catch (error) {
      console.warn(`⚠️ [API DEBUG] Your Vercel Function error, trying direct API:`, error.message);
      // Fall through to direct API call
    }
  }

  // Development: Use direct API call (KEEPS your working setup)
  try {
    const url = new URL(`${COLLEGE_FOOTBALL_API_BASE}${endpoint}`);
    
    // Add parameters to URL
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${COLLEGE_FOOTBALL_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      mode: 'cors',
      credentials: 'omit'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [API DEBUG] REST API Error: ${response.status} ${response.statusText}`, errorText);
      const error = new Error(`College Football API Error: ${response.status} ${response.statusText} - ${errorText || 'No additional details'}`);
      error.status = response.status;
      error.statusText = response.statusText;
      error.endpoint = endpoint;
      error.params = params;
      throw error;
    }
    
    const data = await response.json();
    console.log(`✅ [API DEBUG] Direct API request successful for: ${endpoint}`);
    return data;
  } catch (error) {
    console.error(`❌ [API DEBUG] College Football API Error for ${endpoint}:`, error.message);
    
    // Check if it's a CORS or network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('❌ [API DEBUG] Network/CORS error detected - REST API may be blocked');
      const corsError = new Error(`CORS/Network error accessing ${endpoint}`);
      corsError.isCorsError = true;
      corsError.originalError = error;
      throw corsError;
    }
    
    throw error;
  }
};

// News API (GNews)
const fetchNewsData = async (query, category = 'sports', lang = 'en', country = 'us', max = 10) => {
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&category=${category}&lang=${lang}&country=${country}&max=${max}&apikey=${GNEWS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`News API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("News API Error:", error.message);
    throw error;
  }
};

// YouTube API
const fetchYouTubeData = async (query, maxResults = 25) => {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`YouTube API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("YouTube API Error:", error.message);
    throw error;
  }
};

// GraphQL fetch function for College Football Data API
const fetchCollegeFootballGraphQL = async (query, variables = {}) => {
  console.log(`🔮 [GraphQL DEBUG] Making GraphQL request:`, { query: query.slice(0, 100) + '...', variables });

  try {
    const response = await fetch(COLLEGE_FOOTBALL_GRAPHQL_BASE, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${COLLEGE_FOOTBALL_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [GraphQL DEBUG] Error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`GraphQL Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error(`❌ [GraphQL DEBUG] GraphQL Errors:`, result.errors);
      throw new Error(`GraphQL Query Error: ${result.errors.map(e => e.message).join(', ')}`);
    }

    console.log(`✅ [GraphQL DEBUG] GraphQL request successful`);
    return result.data;
  } catch (error) {
    console.error(`❌ [GraphQL DEBUG] GraphQL fetch error:`, error.message);
    throw error;
  }
};

// Enhanced betting lines fetch with GraphQL primary and REST fallback
const fetchBettingLines = async (params = {}) => {
  console.log(`🎯 [BETTING API] Fetching betting lines with params:`, params);

  // Try GraphQL first for better performance
  try {
    console.log(`🔮 [BETTING API] Attempting GraphQL first...`);
    
    // Build GraphQL query based on parameters
    let whereClause = '';
    const conditions = [];
    
    if (params.gameId) {
      conditions.push(`gameId: {_eq: ${params.gameId}}`);
    }
    
    // For team-based queries, we need to join with game data
    if (params.team) {
      // Note: This requires joining with game data in GraphQL
      const gameQuery = `
        query GetGamesByTeam($year: Int!, $team: String!, $seasonType: String) {
          game(where: {
            season: {_eq: $year}
            ${params.seasonType ? 'seasonType: {_eq: $seasonType}' : ''}
            _or: [
              {homeTeam: {_eq: $team}}
              {awayTeam: {_eq: $team}}
            ]
          }) {
            id
            season
            week
            seasonType
            homeTeam
            awayTeam
            homePoints
            awayPoints
            startDate
            gameLines {
              gameId
              spread
              overUnder
              moneylineHome
              moneylineAway
              spreadOpen
              overUnderOpen
              provider {
                name
              }
            }
          }
        }
      `;
      
      const variables = {
        year: params.year || new Date().getFullYear(),
        team: params.team,
        ...(params.seasonType && { seasonType: params.seasonType })
      };
      
      const result = await fetchCollegeFootballGraphQL(gameQuery, variables);
      
      if (result.game && result.game.length > 0) {
        // Transform GraphQL result to match REST API format
        const transformedData = result.game.map(game => ({
          id: game.id,
          season: game.season,
          seasonType: game.seasonType,
          week: game.week,
          startDate: game.startDate,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          homeScore: game.homePoints,
          awayScore: game.awayPoints,
          lines: game.gameLines.map(line => ({
            provider: line.provider?.name || 'Unknown',
            spread: parseFloat(line.spread),
            overUnder: parseFloat(line.overUnder),
            homeMoneyline: line.moneylineHome,
            awayMoneyline: line.moneylineAway,
            spreadOpen: parseFloat(line.spreadOpen),
            overUnderOpen: parseFloat(line.overUnderOpen),
            formattedSpread: line.spread ? `${game.homeTeam} ${line.spread > 0 ? '+' : ''}${line.spread}` : null
          }))
        }));
        
        console.log(`✅ [BETTING API] GraphQL success - found ${transformedData.length} games with lines`);
        return transformedData;
      }
    } else {
      // Direct gameLines query for simpler cases
      if (conditions.length > 0) {
        whereClause = `where: {${conditions.join(', ')}}`;
      }
      
      const linesQuery = `
        query GetGameLines {
          gameLines(${whereClause} limit: 50) {
            gameId
            spread
            overUnder
            moneylineHome
            moneylineAway
            spreadOpen
            overUnderOpen
            provider {
              name
            }
          }
        }
      `;
      
      const result = await fetchCollegeFootballGraphQL(linesQuery);
      
      if (result.gameLines && result.gameLines.length > 0) {
        console.log(`✅ [BETTING API] GraphQL success - found ${result.gameLines.length} lines`);
        return result.gameLines.map(line => ({
          gameId: line.gameId,
          provider: line.provider?.name || 'Unknown',
          spread: parseFloat(line.spread),
          overUnder: parseFloat(line.overUnder),
          homeMoneyline: line.moneylineHome,
          awayMoneyline: line.moneylineAway,
          spreadOpen: parseFloat(line.spreadOpen),
          overUnderOpen: parseFloat(line.overUnderOpen)
        }));
      }
    }

  } catch (graphqlError) {
    console.warn(`⚠️ [BETTING API] GraphQL failed, falling back to REST:`, graphqlError.message);
    
    // Fall back to REST API
    try {
      console.log(`🔄 [BETTING API] Using REST API fallback...`);
      const restResult = await fetchCollegeFootballData('/lines', params);
      console.log(`✅ [BETTING API] REST fallback successful`);
      return restResult;
    } catch (restError) {
      console.error(`❌ [BETTING API] Both GraphQL and REST failed:`, restError.message);
      throw new Error(`Betting lines fetch failed - GraphQL: ${graphqlError.message}, REST: ${restError.message}`);
    }
  }
  
  // If GraphQL returned no data but didn't error, try REST
  console.log(`🔄 [BETTING API] GraphQL returned no data, trying REST fallback...`);
  try {
    const restResult = await fetchCollegeFootballData('/lines', params);
    console.log(`✅ [BETTING API] REST fallback successful`);
    return restResult;
  } catch (restError) {
    console.error(`❌ [BETTING API] REST fallback also failed:`, restError.message);
    throw restError;
  }
};

// Generic fetch function for other APIs
const fetchData = async (endpoint, params = {}) => {
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch Error:", error.message);
    throw error;
  }
};

export { fetchCollegeFootballData, fetchCollegeFootballGraphQL, fetchBettingLines, fetchNewsData, fetchYouTubeData };
export default fetchData;
