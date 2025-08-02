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
        console.log('🔍 [API DEBUG] Checking GraphQL availability for FBS teams...');
        // Test GraphQL availability first
        const isGraphQLAvailable = await graphqlService.utils.isAvailable();
        if (!isGraphQLAvailable) {
          console.log('🔄 [API DEBUG] GraphQL not available, using REST API for FBS teams');
          const allTeams = await fetchCollegeFootballData('/teams');
          return allTeams.filter(team => team.classification === 'fbs');
        }

        console.log('✅ [API DEBUG] GraphQL available, fetching FBS teams via GraphQL...');
        const graphqlTeams = await graphqlService.teams.getCurrent({ 
          classification: 'fbs' 
        });
        
        console.log('🔄 [API DEBUG] Supplementing with REST API for team logos...');
        // Get all teams and filter for FBS only
        const allRestTeams = await fetchCollegeFootballData('/teams');
        const fbsRestTeams = allRestTeams.filter(team => team.classification === 'fbs');
        
        return fbsRestTeams.map(restTeam => {
          const graphqlTeam = graphqlTeams.find(gql => gql.school === restTeam.school);
          return {
            ...restTeam,
            ...graphqlTeam,
            logos: restTeam.logos
          };
        });
      } catch (error) {
        console.warn('GraphQL FBS teams failed, falling back to REST:', error.message);
        const allTeams = await fetchCollegeFootballData('/teams');
        return allTeams.filter(team => team.classification === 'fbs');
      }
    } else {
      const allTeams = await fetchCollegeFootballData('/teams');
      return allTeams.filter(team => team.classification === 'fbs');
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
  },

  // GET /talent - Get team talent ratings
  getTalentRatings: async (year = new Date().getFullYear()) => {
    return await fetchCollegeFootballData('/talent', { year });
  },

  // GET /games/teams - Get advanced team game stats
  getAdvancedGameStats: async (year = new Date().getFullYear(), team = null, week = null) => {
    const params = { year };
    if (team) params.team = team;
    if (week) params.week = week;
    return await fetchCollegeFootballData('/games/teams', params);
  },

  // GET /stats/season/advanced - Get advanced season stats
  getAdvancedSeasonStats: async (year = new Date().getFullYear(), team = null) => {
    const params = { year };
    if (team) params.team = team;
    return await fetchCollegeFootballData('/stats/season/advanced', params);
  },

  // GET /ppa/teams - Get PPA data for drive efficiency
  getDriveEfficiency: async (year = new Date().getFullYear(), team = null) => {
    const params = { year };
    if (team) params.team = team;
    return await fetchCollegeFootballData('/ppa/teams', params);
  },

  // GET /coaches - Get coaches data
  getCoaches: async () => {
    return await fetchCollegeFootballData('/coaches');
  },

  // GET /games - Get team games for a specific team and year
  getTeamGames: async (team, year = new Date().getFullYear()) => {
    const params = { year, team };
    return await fetchCollegeFootballData('/games', params);
  },

  // Calculate team records from games data
  getTeamRecords: async (team, year = new Date().getFullYear()) => {
    try {
      // Get all games for the team
      const games = await fetchCollegeFootballData('/games', { year, team });
      
      if (!games || games.length === 0) {
        return [{
          year,
          team,
          total: { wins: 0, losses: 0, ties: 0 },
          conferenceGames: { wins: 0, losses: 0, ties: 0 },
          homeGames: { wins: 0, losses: 0, ties: 0 },
          awayGames: { wins: 0, losses: 0, ties: 0 }
        }];
      }

      // Calculate records from games
      let totalWins = 0, totalLosses = 0, totalTies = 0;
      let confWins = 0, confLosses = 0, confTies = 0;
      let homeWins = 0, homeLosses = 0, homeTies = 0;
      let awayWins = 0, awayLosses = 0, awayTies = 0;

      games.forEach(game => {
        if (!game.completed) return; // Skip incomplete games

        const isHomeTeam = game.home_team === team;
        const teamPoints = isHomeTeam ? game.home_points : game.away_points;
        const opponentPoints = isHomeTeam ? game.away_points : game.home_points;

        // Determine win/loss/tie
        let isWin = false, isLoss = false, isTie = false;
        if (teamPoints > opponentPoints) {
          isWin = true;
          totalWins++;
        } else if (teamPoints < opponentPoints) {
          isLoss = true;
          totalLosses++;
        } else {
          isTie = true;
          totalTies++;
        }

        // Conference games
        if (game.conference_game) {
          if (isWin) confWins++;
          else if (isLoss) confLosses++;
          else confTies++;
        }

        // Home/Away games
        if (isHomeTeam) {
          if (isWin) homeWins++;
          else if (isLoss) homeLosses++;
          else homeTies++;
        } else {
          if (isWin) awayWins++;
          else if (isLoss) awayLosses++;
          else awayTies++;
        }
      });

      return [{
        year,
        team,
        total: { wins: totalWins, losses: totalLosses, ties: totalTies },
        conferenceGames: { wins: confWins, losses: confLosses, ties: confTies },
        homeGames: { wins: homeWins, losses: homeLosses, ties: homeTies },
        awayGames: { wins: awayWins, losses: awayLosses, ties: awayTies },
        gamesPlayed: games.filter(g => g.completed).length,
        winPercentage: totalWins / (totalWins + totalLosses + totalTies) || 0
      }];
    } catch (error) {
      console.error('Error fetching team records:', error);
      // Return empty record as fallback
      return [{
        year,
        team,
        total: { wins: 0, losses: 0, ties: 0 },
        conferenceGames: { wins: 0, losses: 0, ties: 0 },
        homeGames: { wins: 0, losses: 0, ties: 0 },
        awayGames: { wins: 0, losses: 0, ties: 0 },
        gamesPlayed: 0,
        winPercentage: 0
      }];
    }
  },

  // GET /rankings - Get team rankings (wrapper for rankingsService)
  getRankings: async (year = new Date().getFullYear(), week = null, team = null, seasonType = 'regular') => {
    const params = { year };
    if (week) params.week = week;
    if (team) params.team = team;
    if (seasonType) params.seasonType = seasonType;
    return await fetchCollegeFootballData('/rankings', params);
  },

  // ===== ENHANCED METHODS FOR ADVANCED PREDICTION =====

  // GET /ppa/teams - PPA (Predicted Points Added) data
  getTeamPPA: async (year = 2024, team = null) => {
    const params = { year, excludeGarbageTime: true };
    if (team) params.team = team;
    
    try {
      return await fetchCollegeFootballData('/ppa/teams', params);
    } catch (error) {
      console.error('Error loading PPA data:', error);
      return [];
    }
  },

  // GET /stats/season/advanced - Advanced team statistics
  getAdvancedTeamStats: async (year = 2024, team = null) => {
    const params = { year, excludeGarbageTime: true };
    if (team) params.team = team;
    
    try {
      return await fetchCollegeFootballData('/stats/season/advanced', params);
    } catch (error) {
      console.error('Error loading advanced stats:', error);
      return [];
    }
  },

  // GET /ratings/sp - SP+ ratings
  getSPRatings: async (year = 2024, team = null) => {
    const params = { year };
    if (team) params.team = team;
    
    try {
      return await fetchCollegeFootballData('/ratings/sp', params);
    } catch (error) {
      console.error('Error loading SP+ ratings:', error);
      return [];
    }
  },

  // GET /ratings/elo - ELO ratings
  getEloRatings: async (year = 2024, week = null, team = null) => {
    const params = { year };
    if (week) params.week = week;
    if (team) params.team = team;
    
    try {
      return await fetchCollegeFootballData('/ratings/elo', params);
    } catch (error) {
      console.error('Error loading ELO ratings:', error);
      return [];
    }
  },

  // GET /talent - Team talent composite ratings
  getTalentRatings: async (year = 2024) => {
    try {
      return await fetchCollegeFootballData('/talent', { year });
    } catch (error) {
      console.error('Error loading talent ratings:', error);
      return [];
    }
  },

  // GET /recruiting/teams - Team recruiting rankings
  getRecruitingRankings: async (year = 2024, team = null) => {
    const params = { year };
    if (team) params.team = team;
    
    try {
      return await fetchCollegeFootballData('/recruiting/teams', params);
    } catch (error) {
      console.error('Error loading recruiting rankings:', error);
      return [];
    }
  },

  // GET /player/portal - Transfer portal data
  getPlayerPortal: async (year = 2025) => {
    try {
      console.log(`Fetching transfer portal data for year: ${year}`);
      const transfers = await fetchCollegeFootballData('/player/portal', { year });
      console.log(`Retrieved ${transfers?.length || 0} transfers from API`);
      return transfers || [];
    } catch (error) {
      console.error('Error loading transfer portal data:', error);
      throw error; // Don't return mock data, let the component handle the error
    }
  },

  // Helper method to get all recruits (for backward compatibility with legacy)
  getAllRecruits: async (year = new Date().getFullYear()) => {
    return await fetchCollegeFootballData('/recruiting/players', { 
      year, 
      classification: 'HighSchool' 
    });
  },

  // Helper method to get teams (for backward compatibility)
  getTeams: async () => {
    return await teamService.getAllTeams();
  },

  // ========== OVERVIEW TAB SPECIFIC FUNCTIONS ==========
  
  // Get comprehensive team overview data for the Overview Tab
  getTeamOverviewData: async (teamName, year = new Date().getFullYear()) => {
    try {
      console.log(`🏈 [OVERVIEW] Loading comprehensive data for ${teamName} (${year})`);
      
      // Fetch all necessary data concurrently for better performance
      const [
        basicInfo,
        records,
        rankings,
        coachInfo,
        recruitingInfo,
        advancedStats
      ] = await Promise.all([
        teamService.getTeamByName(teamName),
        teamService.getTeamRecords(teamName, year),
        teamService.getCurrentRankings(teamName, year),
        teamService.getCoachInfo(teamName, year),
        teamService.getRecruitingRankings(year, teamName),
        teamService.getAdvancedTeamStats(year, teamName)
      ]);

      // Use stadium information from basicInfo.location (no need for separate venues call)
      const stadium = basicInfo?.location || {};

      const overviewData = {
        basicInfo: basicInfo || {},
        records: records?.[0] || {},
        rankings: rankings || {},
        coach: coachInfo?.[0] || {},
        recruiting: recruitingInfo?.[0] || {},
        stadium: stadium || {},
        advancedStats: advancedStats?.[0] || {}
      };

      console.log(`✅ [OVERVIEW] Successfully loaded data for ${teamName}`);
      return overviewData;
    } catch (error) {
      console.error(`❌ [OVERVIEW] Error loading data for ${teamName}:`, error);
      throw error;
    }
  },

  // Get team records for a specific year
  getTeamRecords: async (teamName, year = new Date().getFullYear()) => {
    try {
      return await fetchCollegeFootballData('/records', { 
        year, 
        team: teamName 
      });
    } catch (error) {
      console.error('Error loading team records:', error);
      return [];
    }
  },

  // Get current rankings for a team across all polls
  getCurrentRankings: async (teamName, year = new Date().getFullYear()) => {
    try {
      // Get the latest week's rankings
      const rankings = await fetchCollegeFootballData('/rankings', { 
        year, 
        seasonType: 'regular' 
      });
      
      if (!rankings || rankings.length === 0) return {};

      // Find the most recent week with rankings
      const latestWeek = Math.max(...rankings.map(r => r.week));
      const latestRankings = rankings.filter(r => r.week === latestWeek);

      // Extract rankings for this team from each poll
      const teamRankings = {};
      latestRankings.forEach(ranking => {
        const teamRank = ranking.ranks?.find(rank => 
          rank.school.toLowerCase() === teamName.toLowerCase()
        );
        
        if (teamRank) {
          const pollName = ranking.poll.toLowerCase();
          if (pollName.includes('playoff') || pollName.includes('cfp')) {
            teamRankings.cfp = teamRank.rank;
          } else if (pollName.includes('ap')) {
            teamRankings.ap = teamRank.rank;
            teamRankings.apPoints = teamRank.points;
          } else if (pollName.includes('coaches')) {
            teamRankings.coaches = teamRank.rank;
            teamRankings.coachesPoints = teamRank.points;
          }
        }
      });

      return teamRankings;
    } catch (error) {
      console.error('Error loading current rankings:', error);
      return {};
    }
  },

  // Get coach information for a specific team and year
  getCoachInfo: async (teamName, year = new Date().getFullYear()) => {
    try {
      return await fetchCollegeFootballData('/coaches', { 
        team: teamName, 
        year 
      });
    } catch (error) {
      console.error('Error loading coach info:', error);
      return [];
    }
  },

  // Get recent game performance stats for quick stats display
  getRecentPerformance: async (teamName, year = new Date().getFullYear()) => {
    try {
      const games = await teamService.getAdvancedGameStats(year, teamName);
      
      if (!games || games.length === 0) return {};

      // Calculate averages from recent games
      const gameStats = games.map(game => {
        const teamStats = game.teams?.find(t => 
          t.team.toLowerCase() === teamName.toLowerCase()
        );
        return teamStats;
      }).filter(Boolean);

      if (gameStats.length === 0) return {};

      // Calculate key performance metrics
      const totalPoints = gameStats.reduce((sum, game) => sum + (game.points || 0), 0);
      const avgPointsScored = (totalPoints / gameStats.length).toFixed(1);
      
      // Extract specific stats (first downs, total yards, etc.)
      const getStatValue = (statName) => {
        const values = gameStats.map(game => {
          const stat = game.stats?.find(s => s.category === statName);
          return stat ? parseInt(stat.stat) || 0 : 0;
        });
        return values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 0;
      };

      return {
        avgPointsScored,
        avgTotalYards: getStatValue('totalYards'),
        avgFirstDowns: getStatValue('firstDowns'),
        gamesPlayed: gameStats.length
      };
    } catch (error) {
      console.error('Error loading recent performance:', error);
      return {};
    }
  },

  // Get national averages for ratings comparison
  getNationalAverages: () => {
    // These are approximate 2024 FBS national averages
    return {
      spOverall: 0.0,        // SP+ Overall (0 is average)
      spOffense: 0.0,        // SP+ Offense (0 is average)  
      spDefense: 0.0,        // SP+ Defense (0 is average, lower is better)
      srs: 0.0,              // SRS (0 is average)
      recruitingRank: 65,    // Average recruiting rank (out of ~130 teams)
      recruitingPoints: 150  // Average recruiting points
    };
  },

  // Get rating comparison with national average
  getRatingComparison: (value, average, isDefensive = false) => {
    if (value === null || value === undefined || value === '--') {
      return { color: 'gray', status: 'N/A', difference: null };
    }

    const numValue = parseFloat(value);
    const numAverage = parseFloat(average);
    
    if (isNaN(numValue) || isNaN(numAverage)) {
      return { color: 'gray', status: 'N/A', difference: null };
    }

    const difference = numValue - numAverage;
    
    // For defensive stats, lower is better (reverse logic)
    const threshold = isDefensive ? -2 : 2;
    const isGood = isDefensive ? difference < -threshold : difference > threshold;
    const isOk = isDefensive ? 
      (difference >= -threshold && difference <= 0) : 
      (difference <= threshold && difference >= 0);

    let color, status;
    if (isGood) {
      color = 'green';
      status = isDefensive ? 'Excellent' : 'Above Average';
    } else if (isOk) {
      color = 'yellow';
      status = 'Average';
    } else {
      color = 'red';
      status = isDefensive ? 'Needs Improvement' : 'Below Average';
    }

    return {
      color,
      status,
      difference: difference.toFixed(1),
      isDefensive
    };
  }
};
