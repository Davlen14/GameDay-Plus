import { fetchCollegeFootballData } from './core';

// Player-related API functions using College Football Data API
export const playerService = {
  // GET /roster - Get team roster data
  getRoster: async (team = null, year = null) => {
    const params = {};
    if (team) params.team = team;
    if (year) params.year = year;
    return await fetchCollegeFootballData('/roster', params);
  },

  // GET /player/search - Search for players (lists top 100 results)
  searchPlayers: async (searchTerm, year = null, team = null, position = null) => {
    const params = { searchTerm };
    if (year) params.year = year;
    if (team) params.team = team;
    if (position) params.position = position;
    return await fetchCollegeFootballData('/player/search', params);
  },

  // GET /player/usage - Get player usage data
  getPlayerUsage: async (year, conference = null, position = null, team = null, playerId = null, excludeGarbageTime = false) => {
    const params = { year };
    if (conference) params.conference = conference;
    if (position) params.position = position;
    if (team) params.team = team;
    if (playerId) params.playerId = playerId;
    if (excludeGarbageTime) params.excludeGarbageTime = excludeGarbageTime;
    return await fetchCollegeFootballData('/player/usage', params);
  },

  // GET /player/returning - Get returning production data (Either year or team filter must be specified)
  getReturningProduction: async (year = null, team = null, conference = null) => {
    const params = {};
    if (year) params.year = year;
    if (team) params.team = team;
    if (conference) params.conference = conference;
    return await fetchCollegeFootballData('/player/returning', params);
  },

  // Get all positions (static data)
  getPositions: async () => {
    return [
      'QB', 'RB', 'FB', 'WR', 'TE', 'OL', 'C', 'OG', 'OT',
      'DL', 'DE', 'DT', 'NT', 'LB', 'ILB', 'OLB', 'DB', 'CB', 'S', 'FS', 'SS',
      'K', 'P', 'LS', 'KR', 'PR'
    ];
  }
};
