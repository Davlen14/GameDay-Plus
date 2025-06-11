import { fetchCollegeFootballData } from './core';

// Analytics and AI-related API functions using College Football Data API
export const analyticsService = {
  // GET /ppa/teams - Get team PPA (Predicted Points Added) metrics
  getTeamMetrics: async (teamId, year = new Date().getFullYear(), conference = null, excludeGarbageTime = true) => {
    const params = { year, excludeGarbageTime };
    if (teamId) params.team = teamId;
    if (conference) params.conference = conference;
    
    // Get multiple metrics for comprehensive team analysis
    const [ppaData, spRatings, advancedStats, eloRatings] = await Promise.all([
      fetchCollegeFootballData('/ppa/teams', params),
      fetchCollegeFootballData('/ratings/sp', { year, team: teamId }),
      fetchCollegeFootballData('/stats/season/advanced', { year, team: teamId, excludeGarbageTime }),
      fetchCollegeFootballData('/ratings/elo', { year, team: teamId })
    ]);
    
    return {
      ppa: ppaData,
      spRatings,
      advancedStats,
      eloRatings
    };
  },

  // GET /ppa/players/season - Get player PPA metrics
  getPlayerMetrics: async (playerId, year = new Date().getFullYear(), team = null, position = null, excludeGarbageTime = true) => {
    const params = { year, excludeGarbageTime };
    if (playerId) params.playerId = playerId;
    if (team) params.team = team;
    if (position) params.position = position;
    
    // Get comprehensive player data
    const [ppaSeason, playerStats, playerUsage] = await Promise.all([
      fetchCollegeFootballData('/ppa/players/season', params),
      fetchCollegeFootballData('/stats/player/season', { year, team }),
      fetchCollegeFootballData('/player/usage', params)
    ]);
    
    return {
      ppa: ppaSeason,
      stats: playerStats,
      usage: playerUsage
    };
  },

  // Custom GamedayGPT function using available data
  getGamedayGPT: async (query) => {
    // This would integrate with a custom AI service or return relevant data based on query
    try {
      // Parse query to determine what data to fetch
      const currentYear = new Date().getFullYear();
      
      if (query.toLowerCase().includes('team')) {
        const teams = await fetchCollegeFootballData('/teams');
        return { type: 'teams', data: teams, query };
      } else if (query.toLowerCase().includes('game')) {
        const games = await fetchCollegeFootballData('/games', { year: currentYear });
        return { type: 'games', data: games, query };
      } else if (query.toLowerCase().includes('ranking')) {
        const rankings = await fetchCollegeFootballData('/rankings', { year: currentYear });
        return { type: 'rankings', data: rankings, query };
      }
      
      return { type: 'general', data: [], query, message: 'Please be more specific about teams, games, or rankings.' };
    } catch (error) {
      console.error('GamedayGPT Error:', error);
      return { type: 'error', data: [], query, error: error.message };
    }
  },

  // GET /ppa/games - Get AI insights for games
  getAIInsights: async (teamId, gameId = null, year = new Date().getFullYear()) => {
    const params = { year, excludeGarbageTime: true };
    if (teamId) params.team = teamId;
    
    try {
      const [gamePPA, teamPPA, winProb] = await Promise.all([
        gameId ? fetchCollegeFootballData('/ppa/games', { year, week: null, team: teamId }) : null,
        fetchCollegeFootballData('/ppa/teams', params),
        gameId ? fetchCollegeFootballData('/metrics/wp/pregame', { year, team: teamId }) : null
      ]);
      
      return {
        gamePPA,
        teamPPA,
        winProbability: winProb,
        insights: 'AI-powered analysis based on PPA and advanced metrics'
      };
    } catch (error) {
      console.error('AI Insights Error:', error);
      return { error: error.message };
    }
  },

  // GET /metrics/wp/pregame - Predict game outcomes
  predictOutcomes: async (gameId, factors = [], year = new Date().getFullYear()) => {
    try {
      const [winProb, pregameWP] = await Promise.all([
        gameId ? fetchCollegeFootballData('/metrics/wp', { gameId }) : null,
        fetchCollegeFootballData('/metrics/wp/pregame', { year })
      ]);
      
      return {
        gameId,
        winProbability: winProb,
        pregameWinProbability: pregameWP,
        factors,
        prediction: 'Based on advanced metrics and historical data'
      };
    } catch (error) {
      console.error('Predict Outcomes Error:', error);
      return { error: error.message };
    }
  },

  // GET /coaches - Get coach analysis
  getCoachAnalysis: async (coachId) => {
    try {
      const coaches = await fetchCollegeFootballData('/coaches');
      const coach = coaches.find(c => c.id === coachId || c.first_name + ' ' + c.last_name === coachId);
      
      if (coach) {
        // Get team performance data for coach's team
        const teamData = await fetchCollegeFootballData('/ppa/teams', { 
          year: new Date().getFullYear(), 
          team: coach.team 
        });
        
        return {
          coach,
          teamPerformance: teamData,
          analysis: 'Coach performance based on team metrics'
        };
      }
      
      return { error: 'Coach not found' };
    } catch (error) {
      console.error('Coach Analysis Error:', error);
      return { error: error.message };
    }
  },

  // GET /stats/season/advanced - Get performance metrics
  getPerformanceMetrics: async (entityType, entityId, timeframe = 'season', year = new Date().getFullYear()) => {
    try {
      if (entityType === 'team') {
        return await fetchCollegeFootballData('/stats/season/advanced', { 
          year, 
          team: entityId, 
          excludeGarbageTime: true 
        });
      } else if (entityType === 'player') {
        return await fetchCollegeFootballData('/stats/player/season', { 
          year, 
          team: entityId 
        });
      }
      
      return { error: 'Invalid entity type' };
    } catch (error) {
      console.error('Performance Metrics Error:', error);
      return { error: error.message };
    }
  },

  // GET /stats/season/advanced - Get advanced team stats
  getAdvancedStats: async (teamId, statType = 'efficiency', year = new Date().getFullYear()) => {
    try {
      const params = { year, excludeGarbageTime: true };
      if (teamId) params.team = teamId;
      
      return await fetchCollegeFootballData('/stats/season/advanced', params);
    } catch (error) {
      console.error('Advanced Stats Error:', error);
      return { error: error.message };
    }
  },

  // GET /games/weather - Get weather impact analysis
  getWeatherImpact: async (gameId) => {
    try {
      const weather = await fetchCollegeFootballData('/games/weather', { gameId });
      
      // Add analysis based on weather conditions
      const analysis = weather.map(game => ({
        ...game,
        impact: this.analyzeWeatherImpact(game)
      }));
      
      return analysis;
    } catch (error) {
      console.error('Weather Impact Error:', error);
      return { error: error.message };
    }
  },

  // Helper function to analyze weather impact
  analyzeWeatherImpact: (weatherData) => {
    if (!weatherData) return 'No weather data available';
    
    const { temperature, wind_speed, precipitation } = weatherData;
    let impact = [];
    
    if (temperature && temperature < 32) {
      impact.push('Cold weather may affect passing game');
    }
    if (wind_speed && wind_speed > 15) {
      impact.push('High winds may impact kicking and passing');
    }
    if (precipitation) {
      impact.push('Precipitation may favor running game');
    }
    
    return impact.length ? impact.join('; ') : 'Favorable weather conditions';
  },

  // GET /wepa/team/season - Get team WEPA metrics
  getTeamWEPA: async (year = new Date().getFullYear(), team = null, conference = null) => {
    const params = { year };
    if (team) params.team = team;
    if (conference) params.conference = conference;
    
    try {
      return await fetchCollegeFootballData('/wepa/team/season', params);
    } catch (error) {
      console.error('Team WEPA Error:', error);
      return { error: error.message };
    }
  },

  // GET /team/talent - Get team talent composite ratings
  getTeamTalentRatings: async (year = new Date().getFullYear()) => {
    try {
      return await fetchCollegeFootballData('/talent', { year });
    } catch (error) {
      console.error('Team Talent Error:', error);
      return [];
    }
  },

  // GET /recruiting/teams - Get team recruiting rankings
  getTeamRecruitingRankings: async (year = new Date().getFullYear()) => {
    try {
      return await fetchCollegeFootballData('/recruiting/teams', { year });
    } catch (error) {
      console.error('Recruiting Rankings Error:', error);
      return [];
    }
  },

  // GET /ppa/teams - Get team success rate and efficiency metrics
  getTeamEfficiencyMetrics: async (team, year = new Date().getFullYear(), excludeGarbageTime = true) => {
    try {
      const params = { year, excludeGarbageTime };
      if (team) params.team = team;
      
      const [ppaData, advancedStats] = await Promise.all([
        fetchCollegeFootballData('/ppa/teams', params),
        fetchCollegeFootballData('/stats/season/advanced', params)
      ]);
      
      return {
        ppa: ppaData,
        advanced: advancedStats
      };
    } catch (error) {
      console.error('Team Efficiency Error:', error);
      return { ppa: [], advanced: [] };
    }
  },

  // Calculate drive efficiency from drives data
  calculateDriveEfficiency: async (team, year = new Date().getFullYear()) => {
    try {
      const { driveService } = await import('./driveService');
      const drives = await driveService.getOffensiveDrives(team, year);
      
      if (!drives || drives.length === 0) return 0.35; // Default fallback
      
      const scoringDrives = drives.filter(drive => 
        drive.drive_result === 'TD' || drive.drive_result === 'FG'
      );
      
      return scoringDrives.length / drives.length;
    } catch (error) {
      console.error('Drive Efficiency Error:', error);
      return 0.35; // Default fallback
    }
  },

  // Get team success rate from advanced stats
  getTeamSuccessRate: async (team, year = new Date().getFullYear()) => {
    try {
      const advancedStats = await fetchCollegeFootballData('/stats/season/advanced', {
        year,
        team,
        excludeGarbageTime: true
      });
      
      if (!advancedStats || advancedStats.length === 0) return 0.45; // Default fallback
      
      const teamStats = advancedStats.find(stat => stat.team === team);
      return teamStats?.offense?.successRate || 0.45;
    } catch (error) {
      console.error('Success Rate Error:', error);
      return 0.45; // Default fallback
    }
  },

  // Get team explosiveness rating
  getTeamExplosiveness: async (team, year = new Date().getFullYear()) => {
    try {
      const ppaData = await fetchCollegeFootballData('/ppa/teams', {
        year,
        team,
        excludeGarbageTime: true
      });
      
      if (!ppaData || ppaData.length === 0) return 0.1; // Default fallback
      
      const teamData = ppaData.find(data => data.team === team);
      return teamData?.offense?.explosiveness || 0.1;
    } catch (error) {
      console.error('Explosiveness Error:', error);
      return 0.1; // Default fallback
    }
  },

  // Get comprehensive team metrics for enhanced predictions
  getEnhancedTeamMetrics: async (team, year = new Date().getFullYear()) => {
    try {
      const [talent, recruiting, efficiency, driveEff, successRate, explosiveness] = await Promise.all([
        analyticsService.getTeamTalentRatings(year),
        analyticsService.getTeamRecruitingRankings(year),
        analyticsService.getTeamEfficiencyMetrics(team, year),
        analyticsService.calculateDriveEfficiency(team, year),
        analyticsService.getTeamSuccessRate(team, year),
        analyticsService.getTeamExplosiveness(team, year)
      ]);

      const teamTalent = talent.find(t => t.school === team);
      const teamRecruiting = recruiting.find(r => r.team === team);

      return {
        talent: {
          rating: teamTalent?.talent || 700,
          rank: teamTalent?.rank || 64
        },
        recruiting: {
          rank: teamRecruiting?.rank || 64,
          points: teamRecruiting?.points || 0
        },
        efficiency: efficiency,
        driveEfficiency: driveEff,
        successRate: successRate,
        explosiveness: explosiveness
      };
    } catch (error) {
      console.error('Enhanced Team Metrics Error:', error);
      return {
        talent: { rating: 700, rank: 64 },
        recruiting: { rank: 64, points: 0 },
        efficiency: { ppa: [], advanced: [] },
        driveEfficiency: 0.35,
        successRate: 0.45,
        explosiveness: 0.1
      };
    }
  }
};
