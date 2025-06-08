import { fetchCollegeFootballData } from './core';
import graphqlService from './graphqlService';

// Rankings and standings-related API functions using hybrid GraphQL/REST approach
export const rankingsService = {
  // GET /rankings - Get historical poll rankings (hybrid approach)
  getHistoricalRankings: async (year = new Date().getFullYear(), week = null, seasonType = 'regular', useGraphQL = true) => {
    if (useGraphQL) {
      try {
        // Use GraphQL for faster poll data retrieval
        const polls = await graphqlService.polls.get(year, week);
        
        // Transform GraphQL response to match REST format
        const transformedRankings = polls.map(poll => ({
          season: poll.season,
          seasonType: poll.season_type,
          week: poll.week,
          poll: poll.poll,
          ranks: poll.pollRanks.map(rank => ({
            rank: rank.rank,
            school: rank.school,
            conference: rank.conference,
            firstPlaceVotes: rank.first_place_votes,
            points: rank.points
          }))
        }));

        return transformedRankings;
      } catch (error) {
        console.warn('GraphQL rankings failed, falling back to REST:', error);
        const params = { year, seasonType };
        if (week) params.week = week;
        return await fetchCollegeFootballData('/rankings', params);
      }
    } else {
      const params = { year, seasonType };
      if (week) params.week = week;
      return await fetchCollegeFootballData('/rankings', params);
    }
  },

  // Get current AP Poll rankings (latest week of current year)
  getAPPoll: async (year = new Date().getFullYear(), useGraphQL = true) => {
    if (useGraphQL) {
      try {
        const polls = await graphqlService.polls.get(year, null, 'AP Top 25');
        return polls.map(poll => ({
          season: poll.season,
          seasonType: poll.season_type,
          week: poll.week,
          poll: poll.poll,
          ranks: poll.pollRanks.map(rank => ({
            rank: rank.rank,
            school: rank.school,
            conference: rank.conference,
            firstPlaceVotes: rank.first_place_votes,
            points: rank.points
          }))
        }));
      } catch (error) {
        console.warn('GraphQL AP Poll failed, falling back to REST:', error);
        const rankings = await fetchCollegeFootballData('/rankings', { year, seasonType: 'regular' });
        return rankings.filter(ranking => ranking.poll === 'AP Top 25');
      }
    } else {
      const rankings = await fetchCollegeFootballData('/rankings', { year, seasonType: 'regular' });
      return rankings.filter(ranking => ranking.poll === 'AP Top 25');
    }
  },

  // Get current Coaches Poll rankings
  getCoachesPoll: async (year = new Date().getFullYear(), useGraphQL = true) => {
    if (useGraphQL) {
      try {
        const polls = await graphqlService.polls.get(year, null, 'Coaches Poll');
        return polls.map(poll => ({
          season: poll.season,
          seasonType: poll.season_type,
          week: poll.week,
          poll: poll.poll,
          ranks: poll.pollRanks.map(rank => ({
            rank: rank.rank,
            school: rank.school,
            conference: rank.conference,
            firstPlaceVotes: rank.first_place_votes,
            points: rank.points
          }))
        }));
      } catch (error) {
        console.warn('GraphQL Coaches Poll failed, falling back to REST:', error);
        const rankings = await fetchCollegeFootballData('/rankings', { year, seasonType: 'regular' });
        return rankings.filter(ranking => ranking.poll === 'Coaches Poll');
      }
    } else {
      const rankings = await fetchCollegeFootballData('/rankings', { year, seasonType: 'regular' });
      return rankings.filter(ranking => ranking.poll === 'Coaches Poll');
    }
  },

  // Get CFP Rankings
  getCFPRankings: async (year = new Date().getFullYear(), useGraphQL = true) => {
    if (useGraphQL) {
      try {
        const polls = await graphqlService.polls.get(year, null, 'Playoff Committee Rankings');
        return polls.map(poll => ({
          season: poll.season,
          seasonType: poll.season_type,
          week: poll.week,
          poll: poll.poll,
          ranks: poll.pollRanks.map(rank => ({
            rank: rank.rank,
            school: rank.school,
            conference: rank.conference,
            firstPlaceVotes: rank.first_place_votes,
            points: rank.points
          }))
        }));
      } catch (error) {
        console.warn('GraphQL CFP Rankings failed, falling back to REST:', error);
        const rankings = await fetchCollegeFootballData('/rankings', { year, seasonType: 'regular' });
        return rankings.filter(ranking => ranking.poll === 'Playoff Committee Rankings');
      }
    } else {
      const rankings = await fetchCollegeFootballData('/rankings', { year, seasonType: 'regular' });
      return rankings.filter(ranking => ranking.poll === 'Playoff Committee Rankings');
    }
  },

  // Get conference standings using records
  getConferenceStandings: async (conference, year = new Date().getFullYear()) => {
    return await fetchCollegeFootballData('/records', { year, conference });
  },

  // Get recruiting rankings for teams
  getRecruitingRankings: async (year = new Date().getFullYear(), type = 'team') => {
    if (type === 'team') {
      return await fetchCollegeFootballData('/recruiting/teams', { year });
    } else {
      return await fetchCollegeFootballData('/recruiting/players', { year });
    }
  },

  // Get team recruiting rankings
  getTeamRecruitingRankings: async (year = new Date().getFullYear()) => {
    return await fetchCollegeFootballData('/recruiting/teams', { year });
  },

  // Get player recruiting rankings
  getPlayerRecruitingRankings: async (year = new Date().getFullYear(), position = null, state = null, team = null) => {
    const params = { year, classification: 'HighSchool' };
    if (position) params.position = position;
    if (state) params.state = state;
    if (team) params.team = team;
    return await fetchCollegeFootballData('/recruiting/players', params);
  },

  // Get draft rankings (NFL draft picks by college)
  getDraftRankings: async (year = null, position = null, college = null, conference = null) => {
    const params = {};
    if (year) params.year = year;
    if (position) params.position = position;
    if (college) params.college = college;
    if (conference) params.conference = conference;
    return await fetchCollegeFootballData('/draft/picks', params);
  },

  // Get SP+ ratings (similar to coach rankings)
  getSPRatings: async (year = new Date().getFullYear(), team = null) => {
    const params = { year };
    if (team) params.team = team;
    return await fetchCollegeFootballData('/ratings/sp', params);
  },

  // Get SP+ conference ratings
  getSPConferenceRatings: async (year = new Date().getFullYear(), conference = null) => {
    const params = { year };
    if (conference) params.conference = conference;
    return await fetchCollegeFootballData('/ratings/sp', params);
  },

  // Get Elo ratings
  getEloRatings: async (year = new Date().getFullYear(), week = null, team = null, conference = null) => {
    const params = { year };
    if (week) params.week = week;
    if (team) params.team = team;
    if (conference) params.conference = conference;
    return await fetchCollegeFootballData('/ratings/elo', params);
  },

  // Get FPI ratings
  getFPIRatings: async (year = new Date().getFullYear(), team = null, conference = null) => {
    const params = { year };
    if (team) params.team = team;
    if (conference) params.conference = conference;
    return await fetchCollegeFootballData('/ratings/fpi', params);
  },

  // Get preseason rankings for a specific year
  getPreseasonRankings: async (year = new Date().getFullYear()) => {
    return await fetchCollegeFootballData('/rankings', { year, week: 1, seasonType: 'regular' });
  },

  // Get final rankings for a year
  getFinalRankings: async (year = new Date().getFullYear() - 1) => {
    // Get the last week of the season
    return await fetchCollegeFootballData('/rankings', { year, seasonType: 'postseason' });
  },

  // Get all available poll types
  getAvailablePolls: async (year = new Date().getFullYear()) => {
    const rankings = await fetchCollegeFootballData('/rankings', { year });
    const polls = [...new Set(rankings.map(r => r.poll))];
    return polls;
  },

  // Get rankings for specific week
  getWeeklyRankings: async (year = new Date().getFullYear(), week, seasonType = 'regular') => {
    return await fetchCollegeFootballData('/rankings', { year, week, seasonType });
  }
};
