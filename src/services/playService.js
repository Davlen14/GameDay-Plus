import { fetchCollegeFootballData } from './core';

// Play-by-play related API functions
export const playService = {
  // GET /plays - Get play by play data (year and week are both required according to API docs)
  getPlays: async (year, week, team = null, offense = null, defense = null, offenseConference = null, defenseConference = null, conference = null, playType = null, seasonType = 'regular', classification = 'fbs') => {
    const params = { year, week };
    if (team) params.team = team;
    if (offense) params.offense = offense;
    if (defense) params.defense = defense;
    if (offenseConference) params.offenseConference = offenseConference;
    if (defenseConference) params.defenseConference = defenseConference;
    if (conference) params.conference = conference;
    if (playType) params.playType = playType;
    if (seasonType) params.seasonType = seasonType;
    if (classification) params.classification = classification;
    return await fetchCollegeFootballData('/plays', params);
  },

  // GET /plays/types - Get play types
  getPlayTypes: async () => {
    return await fetchCollegeFootballData('/plays/types');
  },

  // GET /plays/stats - Get play stats (limit 2000)
  getPlayStats: async (year = null, week = null, team = null, gameId = null, athleteId = null, statTypeId = null, seasonType = 'regular', conference = null) => {
    const params = {};
    if (year) params.year = year;
    if (week) params.week = week;
    if (team) params.team = team;
    if (gameId) params.gameId = gameId;
    if (athleteId) params.athleteId = athleteId;
    if (statTypeId) params.statTypeId = statTypeId;
    if (seasonType) params.seasonType = seasonType;
    if (conference) params.conference = conference;
    return await fetchCollegeFootballData('/plays/stats', params);
  },

  // GET /plays/stats/types - Get play stat types
  getPlayStatTypes: async () => {
    return await fetchCollegeFootballData('/plays/stats/types');
  },

  // GET /live/plays - Get live play data
  getLivePlays: async (gameId) => {
    return await fetchCollegeFootballData('/live/plays', { gameId });
  },

  // Get plays for specific team
  getTeamPlays: async (team, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchCollegeFootballData('/plays', { year, seasonType, team });
  },

  // Get offensive plays for team
  getOffensivePlays: async (offense, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchCollegeFootballData('/plays', { year, seasonType, offense });
  },

  // Get defensive plays against team
  getDefensivePlays: async (defense, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchCollegeFootballData('/plays', { year, seasonType, defense });
  },

  // Get plays by type
  getPlaysByType: async (playType, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchCollegeFootballData('/plays', { year, seasonType, playType });
  },

  // Get plays for specific week
  getWeeklyPlays: async (week, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchCollegeFootballData('/plays', { year, seasonType, week });
  },

  // Get conference plays
  getConferencePlays: async (conference, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchCollegeFootballData('/plays', { year, seasonType, conference });
  },

  // Get player play stats
  getPlayerPlayStats: async (athleteId, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchCollegeFootballData('/plays/stats', { year, seasonType, athleteId });
  },

  // Get game play stats
  getGamePlayStats: async (gameId) => {
    return await fetchCollegeFootballData('/plays/stats', { gameId });
  }
};
