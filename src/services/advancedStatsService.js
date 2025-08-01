import { fetchCollegeFootballData } from './core';
import { advancedStatsStructure } from './comparisonAnalyzer';

/**
 * AdvancedStatsService - Handles API integration for advanced team statistics
 * Integrates with College Football Data API for comprehensive team metrics
 */
class AdvancedStatsService {
  constructor() {
    this.baseUrl = 'https://api.collegefootballdata.com';
    this.cache = new Map(); // Simple caching to avoid redundant API calls
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  /**
   * Fetch comprehensive advanced stats for a team
   * @param {string} teamName - Team name
   * @param {number} year - Season year (default: 2024)
   * @returns {Object} Advanced statistics object
   */
  async fetchTeamAdvancedStats(teamName, year = 2024) {
    const cacheKey = `${teamName}-${year}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`📊 Using cached advanced stats for ${teamName}`);
        return cached.data;
      }
    }

    try {
      console.log(`🔍 Fetching advanced stats for ${teamName} (${year})`);
      
      // Parallel API calls for different stat categories
      const [teamStats, ppaData, havocData, advancedStats] = await Promise.all([
        this.fetchBasicTeamStats(teamName, year),
        this.fetchPPAData(teamName, year),
        this.fetchHavocData(teamName, year),
        this.fetchAdvancedTeamData(teamName, year)
      ]);

      // Combine all stats into unified structure
      const combinedStats = this.combineAdvancedStats(teamStats, ppaData, havocData, advancedStats);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: combinedStats,
        timestamp: Date.now()
      });

      console.log(`✅ Advanced stats loaded for ${teamName}:`, combinedStats);
      return combinedStats;

    } catch (error) {
      console.error(`❌ Error fetching advanced stats for ${teamName}:`, error);
      
      // Return mock data structure for development/fallback
      return this.generateMockAdvancedStats(teamName);
    }
  }

  /**
   * Fetch basic team statistics
   */
  async fetchBasicTeamStats(teamName, year) {
    try {
      const response = await fetchCollegeFootballData(`/stats/season?year=${year}&team=${encodeURIComponent(teamName)}`);
      return response || [];
    } catch (error) {
      console.error('Error fetching basic team stats:', error);
      return [];
    }
  }

  /**
   * Fetch Predicted Points Added (PPA) data
   */
  async fetchPPAData(teamName, year) {
    try {
      const response = await fetchCollegeFootballData(`/ppa/teams?year=${year}&team=${encodeURIComponent(teamName)}`);
      return response || [];
    } catch (error) {
      console.error('Error fetching PPA data:', error);
      return [];
    }
  }

  /**
   * Fetch Havoc rate data (defensive disruption metrics)
   */
  async fetchHavocData(teamName, year) {
    try {
      const response = await fetchCollegeFootballData(`/stats/season/advanced?year=${year}&team=${encodeURIComponent(teamName)}`);
      return response || [];
    } catch (error) {
      console.error('Error fetching havoc data:', error);
      return [];
    }
  }

  /**
   * Fetch additional advanced team data
   */
  async fetchAdvancedTeamData(teamName, year) {
    try {
      const response = await fetchCollegeFootballData(`/stats/season/advanced?year=${year}&team=${encodeURIComponent(teamName)}`);
      return response || [];
    } catch (error) {
      console.error('Error fetching advanced team data:', error);
      return [];
    }
  }

  /**
   * Combine all stat sources into unified advanced stats structure
   */
  combineAdvancedStats(teamStats, ppaData, havocData, advancedStats) {
    const stats = JSON.parse(JSON.stringify(advancedStatsStructure)); // Deep clone

    try {
      // Process PPA data
      if (ppaData && ppaData.length > 0) {
        const offensePPA = ppaData.find(stat => stat.unit === 'offense');
        const defensePPA = ppaData.find(stat => stat.unit === 'defense');
        
        if (offensePPA) {
          stats.offense.ppa = offensePPA.overall?.ppa || 0;
          stats.offense.successRate = offensePPA.overall?.successRate || 0;
          stats.offense.explosiveness = offensePPA.overall?.explosiveness || 0;
          stats.offense.passingPlays.rate = offensePPA.passing?.rate || 0.5;
          stats.offense.passingPlays.successRate = offensePPA.passing?.successRate || 0;
          stats.offense.rushingPlays.rate = offensePPA.rushing?.rate || 0.5;
          stats.offense.rushingPlays.successRate = offensePPA.rushing?.successRate || 0;
        }

        if (defensePPA) {
          stats.defense.ppa = defensePPA.overall?.ppa || 0;
          stats.defense.successRate = defensePPA.overall?.successRate || 0;
        }
      }

      // Process advanced/havoc data
      if (advancedStats && advancedStats.length > 0) {
        const offenseAdv = advancedStats.find(stat => stat.unit === 'offense');
        const defenseAdv = advancedStats.find(stat => stat.unit === 'defense');

        if (offenseAdv) {
          stats.offense.fieldPosition.averageStart = offenseAdv.fieldPosition?.averageStart || 25;
          stats.offense.pointsPerOpportunity = offenseAdv.pointsPerOpportunity || 0;
          stats.offense.standardDowns.successRate = offenseAdv.standardDowns?.successRate || 0;
          stats.offense.passingDowns.successRate = offenseAdv.passingDowns?.successRate || 0;
        }

        if (defenseAdv) {
          stats.defense.havoc.total = defenseAdv.havoc?.total || 0;
          stats.defense.havoc.frontSeven = defenseAdv.havoc?.frontSeven || 0;
          stats.defense.havoc.secondary = defenseAdv.havoc?.secondary || 0;
          stats.defense.stuffRate = defenseAdv.stuffRate || 0;
          stats.defense.lineYards = defenseAdv.lineYards || 0;
          stats.defense.secondLevelYards = defenseAdv.secondLevelYards || 0;
          stats.defense.openFieldYards = defenseAdv.openFieldYards || 0;
        }
      }

      // Add data quality indicators
      stats._metadata = {
        dataQuality: this.assessDataQuality(ppaData, havocData, advancedStats),
        lastUpdated: new Date().toISOString(),
        sources: ['cfbd-ppa', 'cfbd-advanced', 'cfbd-havoc']
      };

    } catch (error) {
      console.error('Error combining advanced stats:', error);
    }

    return stats;
  }

  /**
   * Assess data quality for transparency
   */
  assessDataQuality(ppaData, havocData, advancedStats) {
    let score = 0;
    let maxScore = 3;

    if (ppaData && ppaData.length > 0) score += 1;
    if (havocData && havocData.length > 0) score += 1;
    if (advancedStats && advancedStats.length > 0) score += 1;

    return {
      score: score,
      maxScore: maxScore,
      percentage: Math.round((score / maxScore) * 100),
      quality: score >= 2 ? 'Good' : score >= 1 ? 'Fair' : 'Limited'
    };
  }

  /**
   * Generate mock data for development/fallback
   * This provides realistic statistical ranges for testing
   */
  generateMockAdvancedStats(teamName) {
    console.log(`🎭 Generating mock advanced stats for ${teamName}`);
    
    const mockStats = JSON.parse(JSON.stringify(advancedStatsStructure));
    
    // Generate realistic mock values
    mockStats.offense.ppa = (Math.random() * 0.6 - 0.1); // -0.1 to 0.5 range
    mockStats.offense.successRate = (Math.random() * 0.2 + 0.35); // 0.35 to 0.55 range
    mockStats.offense.explosiveness = (Math.random() * 0.8 + 0.8); // 0.8 to 1.6 range
    mockStats.offense.passingPlays.rate = (Math.random() * 0.3 + 0.4); // 0.4 to 0.7 range
    mockStats.offense.passingPlays.successRate = (Math.random() * 0.2 + 0.35);
    mockStats.offense.rushingPlays.rate = 1 - mockStats.offense.passingPlays.rate;
    mockStats.offense.rushingPlays.successRate = (Math.random() * 0.2 + 0.35);
    mockStats.offense.fieldPosition.averageStart = Math.round(Math.random() * 10 + 25); // 25-35 yard line
    mockStats.offense.pointsPerOpportunity = (Math.random() * 3 + 3); // 3-6 points
    mockStats.offense.standardDowns.successRate = (Math.random() * 0.2 + 0.4);
    mockStats.offense.passingDowns.successRate = (Math.random() * 0.15 + 0.25);

    mockStats.defense.ppa = (Math.random() * 0.4 - 0.2); // -0.2 to 0.2 range
    mockStats.defense.successRate = (Math.random() * 0.2 + 0.35);
    mockStats.defense.havoc.total = (Math.random() * 0.1 + 0.12); // 0.12 to 0.22 range
    mockStats.defense.havoc.frontSeven = mockStats.defense.havoc.total * 0.6;
    mockStats.defense.havoc.secondary = mockStats.defense.havoc.total * 0.4;
    mockStats.defense.stuffRate = (Math.random() * 0.1 + 0.15);
    mockStats.defense.lineYards = (Math.random() * 0.5 + 1.0);
    mockStats.defense.secondLevelYards = (Math.random() * 0.8 + 1.0);
    mockStats.defense.openFieldYards = (Math.random() * 1.0 + 0.5);

    mockStats._metadata = {
      dataQuality: { score: 0, maxScore: 3, percentage: 0, quality: 'Mock' },
      lastUpdated: new Date().toISOString(),
      sources: ['mock-data'],
      isMock: true
    };

    return mockStats;
  }

  /**
   * Clear cache for fresh data
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Advanced stats cache cleared');
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

export default new AdvancedStatsService();
