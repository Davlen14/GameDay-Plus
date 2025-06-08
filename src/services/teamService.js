import { fetchCollegeFootballData } from './core';
import graphqlService from './graphqlService';

// Team-related API functions using hybrid GraphQL/REST approach
export const teamService = {
  // GET /teams - Get all teams (hybrid: GraphQL for speed, REST for logos)
  getAllTeams: async (useGraphQL = true) => {
    if (useGraphQL) {
      try {
        // Use GraphQL for fast basic team data
        const graphqlTeams = await graphqlService.teams.getCurrent();
        
        // Fall back to REST to get complete data including logos
        const restTeams = await fetchCollegeFootballData('/teams');
        
        // Merge GraphQL efficiency with REST completeness
        return restTeams.map(restTeam => {
          const graphqlTeam = graphqlTeams.find(gql => gql.school === restTeam.school);
          return {
            ...restTeam, // Keep all REST data including logos
            ...graphqlTeam, // Overlay any GraphQL data
            // Ensure we keep the logos from REST
            logos: restTeam.logos
          };
        });
      } catch (error) {
        console.warn('GraphQL teams failed, falling back to REST:', error);
        return await fetchCollegeFootballData('/teams');
      }
    } else {
      return await fetchCollegeFootballData('/teams');
    }
  },

  // GET /teams - Get FBS teams only (hybrid approach)
  getFBSTeams: async (useGraphQL = true) => {
    if (useGraphQL) {
      try {
        const graphqlTeams = await graphqlService.teams.getCurrent({ 
          classification: 'fbs' 
        });
        
        // Still need REST for logos
        const restTeams = await fetchCollegeFootballData('/teams', { division: 'fbs' });
        
        return restTeams.map(restTeam => {
          const graphqlTeam = graphqlTeams.find(gql => gql.school === restTeam.school);
          return {
            ...restTeam,
            ...graphqlTeam,
            logos: restTeam.logos
          };
        });
      } catch (error) {
        console.warn('GraphQL FBS teams failed, falling back to REST:', error);
        return await fetchCollegeFootballData('/teams', { division: 'fbs' });
      }
    } else {
      return await fetchCollegeFootballData('/teams', { division: 'fbs' });
    }
  },

  // GET /teams - Get teams by conference (hybrid approach)
  getConferenceTeams: async (conference, useGraphQL = true) => {
    if (useGraphQL) {
      try {
        const graphqlTeams = await graphqlService.teams.getByConference(conference);
        
        // Get REST data for logos
        const restTeams = await fetchCollegeFootballData('/teams', { conference });
        
        return restTeams.map(restTeam => {
          const graphqlTeam = graphqlTeams.find(gql => gql.school === restTeam.school);
          return {
            ...restTeam,
            ...graphqlTeam,
            logos: restTeam.logos
          };
        });
      } catch (error) {
        console.warn('GraphQL conference teams failed, falling back to REST:', error);
        return await fetchCollegeFootballData('/teams', { conference });
      }
    } else {
      return await fetchCollegeFootballData('/teams', { conference });
    }
  },

  // Get single team by name (GraphQL optimized)
  getTeamByName: async (schoolName, useGraphQL = true) => {
    if (useGraphQL) {
      try {
        const graphqlTeam = await graphqlService.teams.getBySchool(schoolName);
        
        if (graphqlTeam) {
          // Get logo data from REST
          const restTeams = await fetchCollegeFootballData('/teams');
          const restTeam = restTeams.find(team => team.school === schoolName);
          
          return {
            ...graphqlTeam,
            logos: restTeam?.logos || []
          };
        }
        
        return null;
      } catch (error) {
        console.warn('GraphQL team lookup failed, falling back to REST:', error);
        const restTeams = await fetchCollegeFootballData('/teams');
        return restTeams.find(team => team.school === schoolName) || null;
      }
    } else {
      const restTeams = await fetchCollegeFootballData('/teams');
      return restTeams.find(team => team.school === schoolName) || null;
    }
  },

  // GET /teams/matchup - Get team matchup data
  getTeamMatchup: async (team1, team2, minYear = null, maxYear = null) => {
    const params = { team1, team2 };
    if (minYear) params.minYear = minYear;
    if (maxYear) params.maxYear = maxYear;
    return await fetchCollegeFootballData('/teams/matchup', params);
  },

  // GET /roster - Get team roster
  getTeamRoster: async (team, year = new Date().getFullYear()) => {
    return await fetchCollegeFootballData('/roster', { team, year });
  },

  // GET /talent - Get team talent ratings
  getTeamTalent: async (year = new Date().getFullYear()) => {
    return await fetchCollegeFootballData('/talent', { year });
  },

  // GET /stats/season - Get team season stats
  getTeamStats: async (year = new Date().getFullYear(), team = null, conference = null, startWeek = null, endWeek = null) => {
    const params = { year };
    if (team) params.team = team;
    if (conference) params.conference = conference;
    if (startWeek) params.startWeek = startWeek;
    if (endWeek) params.endWeek = endWeek;
    return await fetchCollegeFootballData('/stats/season', params);
  },

  // GET /stats/season/advanced - Get advanced team stats
  getAdvancedTeamStats: async (year = new Date().getFullYear(), team = null, excludeGarbageTime = true) => {
    const params = { year, excludeGarbageTime };
    if (team) params.team = team;
    return await fetchCollegeFootballData('/stats/season/advanced', params);
  },

  // GET /ppa/teams - Get team PPA (Predicted Points Added) data
  getTeamPPA: async (year = new Date().getFullYear(), team = null, conference = null, excludeGarbageTime = true) => {
    const params = { year, excludeGarbageTime };
    if (team) params.team = team;
    if (conference) params.conference = conference;
    return await fetchCollegeFootballData('/ppa/teams', params);
  },

  // GET /ratings/sp - Get SP+ ratings
  getSPRatings: async (year = new Date().getFullYear(), team = null) => {
    const params = { year };
    if (team) params.team = team;
    return await fetchCollegeFootballData('/ratings/sp', params);
  },

  // GET /ratings/elo - Get Elo ratings
  getEloRatings: async (year = new Date().getFullYear(), week = null, team = null, conference = null) => {
    const params = { year };
    if (week) params.week = week;
    if (team) params.team = team;
    if (conference) params.conference = conference;
    return await fetchCollegeFootballData('/ratings/elo', params);
  },

  // GET /ratings/fpi - Get FPI ratings
  getFPIRatings: async (year = new Date().getFullYear(), team = null, conference = null) => {
    const params = { year };
    if (team) params.team = team;
    if (conference) params.conference = conference;
    return await fetchCollegeFootballData('/ratings/fpi', params);
  },

  // GET /conferences - Get all conferences
  getConferences: async () => {
    return await fetchCollegeFootballData('/conferences');
  },

  // GET /venues - Get team venues/stadiums
  getVenues: async () => {
    return await fetchCollegeFootballData('/venues');
  },

  // GET /recruiting/teams - Get team recruiting rankings
  getRecruitingRankings: async (year = new Date().getFullYear(), team = null) => {
    const params = { year };
    if (team) params.team = team;
    return await fetchCollegeFootballData('/recruiting/teams', params);
  }
};
