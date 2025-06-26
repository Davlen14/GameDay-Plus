import { fetchNewsData, fetchYouTubeData, fetchCollegeFootballData } from './core';

// News and content-related API functions
export const newsService = {
  // Using GNews API for general college football news
  getLatestNews: async (limit = 20) => {
    try {
      const response = await fetchNewsData('college football', 'sports', 'en', 'us', limit);
      
      const articles = response.articles || [];
      return articles.map((article, index) => ({
        id: article.id || `news-${index + 1}`,
        title: article.title,
        description: article.description,
        url: article.url,
        image: article.image,
        publishedAt: article.publishedAt,
        source: article.source
      }));
    } catch (error) {
      console.error('Error fetching latest news:', error);
      // Return fallback data if API fails
      return [
        {
          id: 'fallback-1',
          title: 'College Football News Currently Unavailable',
          description: 'Please check back later for the latest college football news.',
          url: '#',
          image: '/photos/ncaaf.png',
          publishedAt: new Date().toISOString(),
          source: { name: 'GAMEDAY+' }
        }
      ];
    }
  },

  getNewsByCategory: async (category, limit = 10) => {
    try {
      const searchQuery = `college football ${category}`;
      const response = await fetchNewsData(searchQuery, 'sports', 'en', 'us', limit);
      
      const articles = response.articles || [];
      return articles.map((article, index) => ({
        ...article,
        id: article.id || `category-${category}-${index + 1}`,
        image: article.image || "/photos/ncaaf.png"
      }));
    } catch (error) {
      console.error('Error fetching news by category:', error);
      return [];
    }
  },

  getDraftNews: async () => {
    try {
      const response = await fetchNewsData('NFL draft college football', 'sports', 'en', 'us', 15);
      
      const articles = response.articles || [];
      return articles.map((article, index) => ({
        ...article,
        id: article.id || `draft-${index + 1}`,
        image: article.image || "/photos/ncaaf.png"
      }));
    } catch (error) {
      console.error('Error fetching draft news:', error);
      return [];
    }
  },

  getCoachingChanges: async () => {
    try {
      const response = await fetchNewsData('college football coaching changes', 'sports', 'en', 'us', 10);
      
      const articles = response.articles || [];
      return articles.map((article, index) => ({
        ...article,
        id: article.id || `coaching-${index + 1}`,
        image: article.image || "/photos/ncaaf.png"
      }));
    } catch (error) {
      console.error('Error fetching coaching changes:', error);
      return [];
    }
  },

  getRecruitingNews: async () => {
    try {
      const response = await fetchNewsData('college football recruiting', 'sports', 'en', 'us', 15);
      
      const articles = response.articles || [];
      return articles.map((article, index) => ({
        ...article,
        id: article.id || `recruiting-${index + 1}`,
        image: article.image || "/photos/ncaaf.png"
      }));
    } catch (error) {
      console.error('Error fetching recruiting news:', error);
      return [];
    }
  },

  getAnalysis: async (topic = null) => {
    try {
      const searchQuery = topic ? `college football ${topic} analysis` : 'college football analysis';
      const response = await fetchNewsData(searchQuery, 'sports', 'en', 'us', 15);
      
      const articles = response.articles || [];
      return articles.map((article, index) => ({
        ...article,
        id: article.id || `analysis-${index + 1}`,
        image: article.image || "/photos/ncaaf.png"
      }));
    } catch (error) {
      console.error('Error fetching analysis:', error);
      return [];
    }
  },

  getInjuryReports: async () => {
    try {
      const response = await fetchNewsData('college football injuries', 'sports', 'en', 'us', 10);
      
      const articles = response.articles || [];
      return articles.map((article, index) => ({
        ...article,
        id: article.id || `injury-${index + 1}`,
        image: article.image || "/photos/ncaaf.png"
      }));
    } catch (error) {
      console.error('Error fetching injury reports:', error);
      return [];
    }
  },

  getTransferPortalNews: async () => {
    try {
      const response = await fetchNewsData('college football transfer portal', 'sports', 'en', 'us', 15);
      
      const articles = response.articles || [];
      return articles.map((article, index) => ({
        ...article,
        id: article.id || `transfer-${index + 1}`,
        image: article.image || "/photos/ncaaf.png"
      }));
    } catch (error) {
      console.error('Error fetching transfer portal news:', error);
      return [];
    }
  },

  // Using YouTube API for video content
  getPressConferences: async () => {
    try {
      const response = await fetchYouTubeData('college football press conference', 10);
      return response.items || [];
    } catch (error) {
      console.error('Error fetching press conferences:', error);
      return [];
    }
  },

  getVideos: async (category = 'highlights') => {
    try {
      const searchQuery = `college football ${category}`;
      const response = await fetchYouTubeData(searchQuery, 15);
      return response.items || [];
    } catch (error) {
      console.error('Error fetching videos:', error);
      return [];
    }
  },

  getHighlights: async () => {
    try {
      const response = await fetchYouTubeData('college football highlights', 20);
      return response.items || [];
    } catch (error) {
      console.error('Error fetching highlights:', error);
      return [];
    }
  },

  // Using College Football Data API for recruiting commitments
  getCommitments: async (year = new Date().getFullYear()) => {
    try {
      return await fetchCollegeFootballData('/recruiting/players', { year, classification: 'HighSchool' });
    } catch (error) {
      console.error('Error fetching commitments:', error);
      return [];
    }
  },

  // Team-specific news
  getTeamNews: async (teamName, limit = 10) => {
    try {
      const response = await fetchNewsData(`${teamName} college football`, 'sports', 'en', 'us', limit);
      
      const articles = response.articles || [];
      return articles.map((article, index) => ({
        ...article,
        id: article.id || `team-${teamName}-${index + 1}`,
        image: article.image || "/photos/ncaaf.png"
      }));
    } catch (error) {
      console.error('Error fetching team news:', error);
      return [];
    }
  },

  // Conference-specific news
  getConferenceNews: async (conferenceName, limit = 10) => {
    try {
      const response = await fetchNewsData(`${conferenceName} college football`, 'sports', 'en', 'us', limit);
      
      const articles = response.articles || [];
      return articles.map((article, index) => ({
        ...article,
        id: article.id || `conf-${conferenceName}-${index + 1}`,
        image: article.image || "/photos/ncaaf.png"
      }));
    } catch (error) {
      console.error('Error fetching conference news:', error);
      return [];
    }
  },

  // Transfer Portal specific news
  fetchTransferPortalNews: async (limit = 10) => {
    try {
      const response = await fetchNewsData('college football transfer portal', 'sports', 'en', 'us', limit);
      
      const articles = response.articles || [];
      return {
        articles: articles.map((article, index) => ({
          ...article,
          id: article.id || `transfer-${index + 1}`,
          image: article.image || "/photos/ncaaf.png"
        }))
      };
    } catch (error) {
      console.error('Error fetching transfer portal news:', error);
      return { articles: [] };
    }
  }
};