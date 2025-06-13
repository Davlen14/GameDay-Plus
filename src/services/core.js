// Core API utility functions - Updated for Vercel API Functions (Secure)
// ✅ No API keys exposed in client code
// ✅ CORS issues resolved through API proxies
// ✅ Secure for production deployment

// Use Vercel API Functions instead of direct API calls
const COLLEGE_FOOTBALL_API_BASE = '/api/college-football';
const NEWS_API_BASE = '/api/news';
const YOUTUBE_API_BASE = '/api/youtube';

// ✅ Secure College Football Data API (via Vercel Function)
const fetchCollegeFootballData = async (endpoint, params = {}) => {
  console.log(`📡 [API DEBUG] Making secure REST API request to: ${endpoint}`, params);

  try {
    // Build query string for the proxy API
    const queryParams = new URLSearchParams({
      endpoint,
      ...params
    });

    const response = await fetch(`${COLLEGE_FOOTBALL_API_BASE}?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ [API DEBUG] REST API Error: ${response.status}`, errorData);
      const error = new Error(`College Football API Error: ${response.status} ${response.statusText} - ${errorData.error || 'No additional details'}`);
      error.status = response.status;
      error.statusText = response.statusText;
      error.endpoint = endpoint;
      error.params = params;
      throw error;
    }
    
    const data = await response.json();
    console.log(`✅ [API DEBUG] Secure REST API request successful for: ${endpoint}`);
    return data;
  } catch (error) {
    console.error(`❌ [API DEBUG] College Football API Error for ${endpoint}:`, error.message);
    
    // Check if it's a CORS or network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('❌ [API DEBUG] Network/CORS error detected - REST API may be blocked');
    
    // Check if it's a CORS or network error - should be less likely now
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const corsError = new Error(`Network error accessing ${endpoint} via secure proxy`);
      corsError.isCorsError = true;
      corsError.originalError = error;
      throw corsError;
    }
    
    throw error;
  }
};

// ✅ Secure News API (via Vercel Function)
const fetchNewsData = async (query, category = 'sports', lang = 'en', country = 'us', max = 10) => {
  try {
    const queryParams = new URLSearchParams({
      query,
      category,
      lang,
      country,
      max: max.toString()
    });

    console.log(`📡 [API DEBUG] Making secure news request for: ${query}`);

    const response = await fetch(`${NEWS_API_BASE}?${queryParams}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`News API Error: ${response.status} ${response.statusText} - ${errorData.error || ''}`);
    }
    
    const data = await response.json();
    console.log(`✅ [API DEBUG] Secure news request successful`);
    return data;
  } catch (error) {
    console.error("❌ [API DEBUG] News API Error:", error.message);
    throw error;
  }
};

// ✅ Secure YouTube API (via Vercel Function)
const fetchYouTubeData = async (query, maxResults = 25) => {
  try {
    const queryParams = new URLSearchParams({
      query,
      maxResults: maxResults.toString()
    });

    console.log(`📡 [API DEBUG] Making secure YouTube request for: ${query}`);

    const response = await fetch(`${YOUTUBE_API_BASE}?${queryParams}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`YouTube API Error: ${response.status} ${response.statusText} - ${errorData.error || ''}`);
    }
    
    const data = await response.json();
    console.log(`✅ [API DEBUG] Secure YouTube request successful`);
    return data;
  } catch (error) {
    console.error("❌ [API DEBUG] YouTube API Error:", error.message);
    throw error;
  }
};

// Generic fetch function for other APIs
const fetchData = async (endpoint, params = {}) => {
  const url = `/api/proxy`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ endpoint, params }),
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
