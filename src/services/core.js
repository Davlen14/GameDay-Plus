// Core API utility functions
const COLLEGE_FOOTBALL_API_BASE = 'https://api.collegefootballdata.com';
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

export { fetchCollegeFootballData, fetchNewsData, fetchYouTubeData };
export default fetchData;
