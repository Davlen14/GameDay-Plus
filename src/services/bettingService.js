import { fetchCollegeFootballData } from './core';

// Betting and odds-related API functions using College Football Data API
export const bettingService = {
  // GET /lines - Get betting lines data
  getBettingLines: async (gameId = null, year = 2024, week = null, seasonType = 'regular', team = null, home = null, away = null, conference = null) => {
    const params = {};
    if (gameId) params.gameId = gameId;
    if (year) params.year = year;
    if (week) params.week = week;
    if (seasonType) params.seasonType = seasonType;
    if (team) params.team = team;
    if (home) params.home = home;
    if (away) params.away = away;
    if (conference) params.conference = conference;
    
    try {
      console.log('Betting API call params:', params);
      const result = await fetchCollegeFootballData('/lines', params);
      console.log('Betting API result:', result);
      return result;
    } catch (error) {
      console.error('Betting API error:', error);
      throw error;
    }
  },

  // Get spreads for specific games
  getSpreadAnalysis: async (gameId) => {
    return await fetchCollegeFootballData('/lines', { gameId });
  },

  // Get over/under data
  getOverUnderAnalysis: async (gameId) => {
    return await fetchCollegeFootballData('/lines', { gameId });
  },

  // Get all lines for a specific week
  getWeeklyLines: async (year = new Date().getFullYear(), week = null, seasonType = 'regular') => {
    const params = { year, seasonType };
    if (week) params.week = week;
    return await fetchCollegeFootballData('/lines', params);
  },

  // Get lines for specific team
  getTeamLines: async (team, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchCollegeFootballData('/lines', { team, year, seasonType });
  },

  // Get lines for conference games
  getConferenceLines: async (conference, year = new Date().getFullYear(), week = null, seasonType = 'regular') => {
    const params = { conference, year, seasonType };
    if (week) params.week = week;
    return await fetchCollegeFootballData('/lines', params);
  },

  // Get home team lines
  getHomeTeamLines: async (home, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchCollegeFootballData('/lines', { home, year, seasonType });
  },

  // Get away team lines
  getAwayTeamLines: async (away, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchCollegeFootballData('/lines', { away, year, seasonType });
  },

  // Get line movements (multiple calls to track changes)
  getLineMovements: async (gameId) => {
    // This would require storing historical data or making multiple calls
    return await fetchCollegeFootballData('/lines', { gameId });
  },

  // Get pregame win probability (can be used for betting analysis)
  getPregameWinProbability: async (year = new Date().getFullYear(), week = null, team = null, seasonType = 'regular') => {
    const params = { year, seasonType };
    if (week) params.week = week;
    if (team) params.team = team;
    return await fetchCollegeFootballData('/metrics/wp/pregame', params);
  },

  // Enhanced betting suggestions using multiple data points
  getBettingSuggestions: async (week = null, year = new Date().getFullYear()) => {
    const lines = await fetchCollegeFootballData('/lines', { year, week, seasonType: 'regular' });
    const winProb = await fetchCollegeFootballData('/metrics/wp/pregame', { year, week, seasonType: 'regular' });
    
    // Combine lines with win probability for better suggestions
    return {
      lines,
      winProbability: winProb,
      suggestions: lines // Could add logic to analyze value bets
    };
  },

  // Get betting performance metrics
  getBettingPerformance: async (year = new Date().getFullYear()) => {
    // This would require historical tracking - placeholder for now
    return await fetchCollegeFootballData('/lines', { year, seasonType: 'regular' });
  },

  // Get arbitrage opportunities (requires multiple sportsbooks)
  getArbitrageOpportunities: async (gameId) => {
    const lines = await fetchCollegeFootballData('/lines', { gameId });
    // Logic to find arbitrage opportunities would go here
    return lines;
  },

  // Get expected value analysis
  getExpectedValueAnalysis: async (gameId) => {
    const lines = await fetchCollegeFootballData('/lines', { gameId });
    const winProb = await fetchCollegeFootballData('/metrics/wp/pregame', { gameId });
    
    return {
      lines,
      winProbability: winProb,
      expectedValue: [] // Calculation logic would go here
    };
  }
};
