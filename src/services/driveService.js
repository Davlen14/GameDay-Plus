import { fetchCollegeFootballData } from './core';

// Drive and play-by-play related API functions
export const driveService = {
  // GET /drives - Get drive data (year is required according to API docs)
  getDrives: async (year, seasonType = 'regular', week = null, team = null, offense = null, defense = null, conference = null, offenseConference = null, defenseConference = null, classification = 'fbs') => {
    const params = { year };
    if (seasonType) params.seasonType = seasonType;
    if (week) params.week = week;
    if (team) params.team = team;
    if (offense) params.offense = offense;
    if (defense) params.defense = defense;
    if (conference) params.conference = conference;
    if (offenseConference) params.offenseConference = offenseConference;
    if (defenseConference) params.defenseConference = defenseConference;
    if (classification) params.classification = classification;
    return await fetchCollegeFootballData('/drives', params);
  },

  // Get drives for specific team
  getTeamDrives: async (team, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchCollegeFootballData('/drives', { year, seasonType, team });
  },

  // Get offensive drives for team
  getOffensiveDrives: async (offense, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchCollegeFootballData('/drives', { year, seasonType, offense });
  },

  // Get defensive drives against team
  getDefensiveDrives: async (defense, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchCollegeFootballData('/drives', { year, seasonType, defense });
  },

  // Get drives for specific week
  getWeeklyDrives: async (week, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchCollegeFootballData('/drives', { year, seasonType, week });
  },

  // Get conference drives
  getConferenceDrives: async (conference, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchCollegeFootballData('/drives', { year, seasonType, conference });
  }
};
