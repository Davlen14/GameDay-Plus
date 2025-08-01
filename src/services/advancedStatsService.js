import { fetchCollegeFootballData } from './core';
import { advancedStatsStructure } from './comparisonAnalyzer';

// Advanced stats and analytics service following the gameService pattern
export const advancedStatsService = {
  // Cache for performance
  cache: new Map(),
  cacheTimeout: 5 * 60 * 1000, // 5 minutes

  // GET /ppa/teams - Get team PPA data (Points Per Attempt)
  getTeamPPA: async (year = 2024, team = null, conference = null, excludeGarbageTime = true) => {
    const params = { year, excludeGarbageTime };
    if (team) params.team = team;
    if (conference) params.conference = conference;
    return await fetchCollegeFootballData('/ppa/teams', params);
  },

  // GET /stats/season/advanced - Get advanced team stats including havoc rates
  getAdvancedTeamStats: async (year = 2024, team = null, conference = null, startWeek = null, endWeek = null, excludeGarbageTime = true) => {
    const params = { year, excludeGarbageTime };
    if (team) params.team = team;
    if (conference) params.conference = conference;
    if (startWeek) params.startWeek = startWeek;
    if (endWeek) params.endWeek = endWeek;
    return await fetchCollegeFootballData('/stats/season/advanced', params);
  },

  // GET /stats/season - Get basic season stats  
  getSeasonStats: async (year = 2024, team = null, conference = null, startWeek = null, endWeek = null) => {
    const params = { year };
    if (team) params.team = team;
    if (conference) params.conference = conference;
    if (startWeek) params.startWeek = startWeek;
    if (endWeek) params.endWeek = endWeek;
    return await fetchCollegeFootballData('/stats/season', params);
  },

  // GET /stats/game/advanced - Get advanced game stats
  getAdvancedGameStats: async (year = 2024, week = null, team = null, conference = null, gameId = null, excludeGarbageTime = true) => {
    const params = { year, excludeGarbageTime };
    if (week) params.week = week;
    if (team) params.team = team;
    if (conference) params.conference = conference;
    if (gameId) params.gameId = gameId;
    return await fetchCollegeFootballData('/stats/game/advanced', params);
  },

  // GET /ppa/players/season - Get player season PPA data
  getPlayerSeasonPPA: async (year = 2024, team = null, conference = null, position = null, playerId = null, excludeGarbageTime = true) => {
    const params = { year, excludeGarbageTime };
    if (team) params.team = team;
    if (conference) params.conference = conference;
    if (position) params.position = position;
    if (playerId) params.playerId = playerId;
    return await fetchCollegeFootballData('/ppa/players/season', params);
  },

  // GET /stats/player/season - Get player season stats
  getPlayerSeasonStats: async (year = 2024, team = null, conference = null, startWeek = null, endWeek = null, seasonType = 'regular', category = null) => {
    const params = { year, seasonType };
    if (team) params.team = team;
    if (conference) params.conference = conference;
    if (startWeek) params.startWeek = startWeek;
    if (endWeek) params.endWeek = endWeek;
    if (category) params.category = category;
    return await fetchCollegeFootballData('/stats/player/season', params);
  },

  /**
   * Fetch comprehensive advanced stats for a team using proper API endpoints
   * @param {string} teamName - Team name
   * @param {number} year - Season year (default: 2024)
   * @returns {Object} Advanced statistics object
   */
  fetchTeamAdvancedStats: async (teamName, year = 2024) => {
    const cacheKey = `${teamName}-${year}`;
    
    // Check cache first
    if (advancedStatsService.cache.has(cacheKey)) {
      const cached = advancedStatsService.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < advancedStatsService.cacheTimeout) {
        console.log(`📊 Using cached advanced stats for ${teamName}`);
        return cached.data;
      }
    }

    try {
      console.log(`🔍 Fetching advanced stats for ${teamName} (${year}) using proper API endpoints`);
      
      // Parallel API calls for different stat categories using the service methods
      const [teamPPA, advancedStats, seasonStats] = await Promise.all([
        advancedStatsService.getTeamPPA(year, teamName),
        advancedStatsService.getAdvancedTeamStats(year, teamName),
        advancedStatsService.getSeasonStats(year, teamName)
      ]);

      console.log(`📊 Raw API data for ${teamName}:`, { teamPPA, advancedStats, seasonStats });

      // Combine all stats into unified structure
      const combinedStats = advancedStatsService.combineAdvancedStats(teamPPA, advancedStats, seasonStats);
      
      // Cache the result
      advancedStatsService.cache.set(cacheKey, {
        data: combinedStats,
        timestamp: Date.now()
      });

      console.log(`✅ Advanced stats loaded for ${teamName}:`, combinedStats);
      return combinedStats;

    } catch (error) {
      console.error(`❌ Error fetching advanced stats for ${teamName}:`, error);
      
      // Return mock data structure for development/fallback
      return advancedStatsService.generateMockAdvancedStats(teamName);
    }
  },

  /**
   * Combine all stat sources into unified advanced stats structure
   */
  combineAdvancedStats: (teamPPA, advancedStats, seasonStats) => {
    const stats = JSON.parse(JSON.stringify(advancedStatsStructure)); // Deep clone

    try {
      console.log('🔧 Combining stats from API responses:', { teamPPA, advancedStats, seasonStats });

      // Process PPA data - API returns array with direct offense/defense objects
      if (teamPPA && teamPPA.length > 0) {
        const ppaData = teamPPA[0]; // First (and typically only) result
        
        if (ppaData.offense) {
          stats.offense.ppa = ppaData.offense.overall || 0;
          stats.offense.explosiveness = 1.0; // Will be updated from advanced stats
          
          console.log('✅ Processed offense PPA data:', ppaData.offense);
        }

        if (ppaData.defense) {
          stats.defense.ppa = ppaData.defense.overall || 0;
          
          console.log('✅ Processed defense PPA data:', ppaData.defense);
        }
      }

      // Process advanced stats - API returns array with direct offense/defense objects
      if (advancedStats && advancedStats.length > 0) {
        const advData = advancedStats[0]; // First (and typically only) result

        if (advData.offense) {
          stats.offense.successRate = advData.offense.successRate || 0;
          stats.offense.explosiveness = advData.offense.explosiveness || 0;
          stats.offense.passingPlays.rate = advData.offense.passingPlays?.rate || 0.5;
          stats.offense.passingPlays.successRate = advData.offense.passingPlays?.successRate || 0;
          stats.offense.rushingPlays.rate = advData.offense.rushingPlays?.rate || 0.5;
          stats.offense.rushingPlays.successRate = advData.offense.rushingPlays?.successRate || 0;
          stats.offense.fieldPosition.averageStart = advData.offense.fieldPosition?.averageStart || 25;
          stats.offense.pointsPerOpportunity = advData.offense.pointsPerOpportunity || 0;
          stats.offense.standardDowns.successRate = advData.offense.standardDowns?.successRate || 0;
          stats.offense.passingDowns.successRate = advData.offense.passingDowns?.successRate || 0;
          
          console.log('✅ Processed offense advanced data:', advData.offense);
        }

        if (advData.defense) {
          stats.defense.successRate = advData.defense.successRate || 0;
          stats.defense.havoc.total = advData.defense.havoc?.total || 0;
          stats.defense.havoc.frontSeven = advData.defense.havoc?.frontSeven || 0;
          stats.defense.havoc.secondary = advData.defense.havoc?.db || 0; // Note: API uses 'db' not 'secondary'
          stats.defense.stuffRate = advData.defense.stuffRate || 0;
          stats.defense.lineYards = advData.defense.lineYards || 0;
          stats.defense.secondLevelYards = advData.defense.secondLevelYards || 0;
          stats.defense.openFieldYards = advData.defense.openFieldYards || 0;
          
          console.log('✅ Processed defense advanced data:', advData.defense);
        }
      }

      // Add data quality indicators
      stats._metadata = {
        dataQuality: advancedStatsService.assessDataQuality(teamPPA, advancedStats, seasonStats),
        lastUpdated: new Date().toISOString(),
        sources: ['cfbd-ppa', 'cfbd-advanced', 'cfbd-season']
      };

      console.log('✅ Final combined stats structure:', stats);

    } catch (error) {
      console.error('Error combining advanced stats:', error);
    }

    return stats;
  },

  /**
   * Assess data quality for transparency
   */
  assessDataQuality: (ppaData, advancedStats, seasonStats) => {
    let score = 0;
    let maxScore = 3;

    if (ppaData && ppaData.length > 0) score += 1;
    if (advancedStats && advancedStats.length > 0) score += 1;
    if (seasonStats && seasonStats.length > 0) score += 1;

    return {
      score: score,
      maxScore: maxScore,
      percentage: Math.round((score / maxScore) * 100),
      quality: score >= 2 ? 'Good' : score >= 1 ? 'Fair' : 'Limited'
    };
  },

  /**
   * Generate mock data for development/fallback with realistic team differences
   */
  generateMockAdvancedStats: (teamName) => {
    console.log(`🎭 Generating mock advanced stats for ${teamName}`);
    
    const mockStats = JSON.parse(JSON.stringify(advancedStatsStructure));
    
    // Create realistic differences based on team quality
    // Ohio State should have significantly better stats than teams like Purdue
    const isEliteTeam = ['Ohio State', 'Alabama', 'Georgia', 'Michigan', 'Texas', 'Oregon', 'Notre Dame', 'USC', 'Penn State', 'Florida State'].includes(teamName);
    const isGoodTeam = ['Wisconsin', 'Iowa', 'Minnesota', 'Northwestern', 'Maryland', 'Rutgers', 'Michigan State', 'Indiana', 'Illinois', 'Nebraska'].includes(teamName);
    
    let offenseBase, defenseBase;
    
    if (isEliteTeam) {
      // Elite teams have much better stats
      offenseBase = { ppa: 0.25, successRate: 0.48, explosiveness: 1.4 };
      defenseBase = { ppa: -0.15, successRate: 0.35, havoc: 0.20 };
    } else if (isGoodTeam) {
      // Good teams have above average stats
      offenseBase = { ppa: 0.10, successRate: 0.42, explosiveness: 1.1 };
      defenseBase = { ppa: -0.05, successRate: 0.40, havoc: 0.16 };
    } else {
      // Average/below average teams
      offenseBase = { ppa: -0.05, successRate: 0.38, explosiveness: 0.9 };
      defenseBase = { ppa: 0.08, successRate: 0.45, havoc: 0.13 };
    }
    
    // Add some randomness but keep the base differences
    mockStats.offense.ppa = offenseBase.ppa + (Math.random() * 0.1 - 0.05);
    mockStats.offense.successRate = offenseBase.successRate + (Math.random() * 0.06 - 0.03);
    mockStats.offense.explosiveness = offenseBase.explosiveness + (Math.random() * 0.3 - 0.15);
    mockStats.offense.passingPlays.rate = (Math.random() * 0.3 + 0.4);
    mockStats.offense.passingPlays.successRate = mockStats.offense.successRate + (Math.random() * 0.1 - 0.05);
    mockStats.offense.rushingPlays.rate = 1 - mockStats.offense.passingPlays.rate;
    mockStats.offense.rushingPlays.successRate = mockStats.offense.successRate + (Math.random() * 0.1 - 0.05);
    mockStats.offense.fieldPosition.averageStart = Math.round(Math.random() * 8 + (isEliteTeam ? 30 : 26));
    mockStats.offense.pointsPerOpportunity = (isEliteTeam ? 5.5 : isGoodTeam ? 4.5 : 3.8) + (Math.random() * 1 - 0.5);
    mockStats.offense.standardDowns.successRate = mockStats.offense.successRate + 0.05;
    mockStats.offense.passingDowns.successRate = mockStats.offense.successRate - 0.15;

    mockStats.defense.ppa = defenseBase.ppa + (Math.random() * 0.1 - 0.05);
    mockStats.defense.successRate = defenseBase.successRate + (Math.random() * 0.06 - 0.03);
    mockStats.defense.havoc.total = defenseBase.havoc + (Math.random() * 0.04 - 0.02);
    mockStats.defense.havoc.frontSeven = mockStats.defense.havoc.total * 0.6;
    mockStats.defense.havoc.secondary = mockStats.defense.havoc.total * 0.4;
    mockStats.defense.stuffRate = (isEliteTeam ? 0.22 : 0.17) + (Math.random() * 0.06 - 0.03);
    mockStats.defense.lineYards = (isEliteTeam ? 1.8 : 2.3) + (Math.random() * 0.4 - 0.2);
    mockStats.defense.secondLevelYards = (isEliteTeam ? 1.5 : 2.0) + (Math.random() * 0.5 - 0.25);
    mockStats.defense.openFieldYards = (isEliteTeam ? 2.8 : 3.5) + (Math.random() * 0.8 - 0.4);

    mockStats._metadata = {
      dataQuality: { score: 0, maxScore: 3, percentage: 0, quality: 'Mock' },
      lastUpdated: new Date().toISOString(),
      sources: ['mock-data'],
      isMock: true,
      teamTier: isEliteTeam ? 'Elite' : isGoodTeam ? 'Good' : 'Average'
    };

    console.log(`🎭 Generated mock stats for ${teamName} (${mockStats._metadata.teamTier}):`, mockStats);
    return mockStats;
  },

  /**
   * Clear cache for fresh data
   */
  clearCache: () => {
    advancedStatsService.cache.clear();
    console.log('🗑️ Advanced stats cache cleared');
  },

  /**
   * Get cache statistics for debugging
   */
  getCacheStats: () => {
    return {
      size: advancedStatsService.cache.size,
      entries: Array.from(advancedStatsService.cache.keys())
    };
  }
};

// Export as default to maintain compatibility
export default advancedStatsService;
