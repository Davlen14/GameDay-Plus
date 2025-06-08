import { fetchCollegeFootballData } from './core';

// Miscellaneous API functions for conferences, venues, and coaches
export const miscService = {
  // GET /conferences - Get list of conferences
  getConferences: async () => {
    return await fetchCollegeFootballData('/conferences');
  },

  // GET /venues - Get list of venues
  getVenues: async () => {
    return await fetchCollegeFootballData('/venues');
  },

  // GET /coaches - Get historical head coach information and records
  getCoaches: async (firstName = null, lastName = null, team = null, year = null, minYear = null, maxYear = null) => {
    const params = {};
    if (firstName) params.firstName = firstName;
    if (lastName) params.lastName = lastName;
    if (team) params.team = team;
    if (year) params.year = year;
    if (minYear) params.minYear = minYear;
    if (maxYear) params.maxYear = maxYear;
    return await fetchCollegeFootballData('/coaches', params);
  }
};
