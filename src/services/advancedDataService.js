import { fetchCollegeFootballData } from './core';
import { teamService } from './teamService';
import { analyticsService } from './analyticsService';
import { bettingService } from './bettingService';
import { driveService } from './driveService';

/**
 * Advanced Data Service - Implements all the enhanced metrics for advanced matchup prediction
 * Based on comprehensive analysis of Ohio State vs Oregon game 401628515
 */
export const advancedDataService = {
  
  /**
   * GET PPA (Predicted Points Added) - MOST PREDICTIVE METRIC
   * This is the single most important upgrade to implement
   */
  getPPA: async (year = 2024, team = null, conference = null, excludeGarbageTime = true) => {
    const params = { year, excludeGarbageTime };
    if (team) params.team = team;
    if (conference) params.conference = conference;
    
    try {
      const ppaData = await fetchCollegeFootballData('/ppa/teams', params);
      console.log(`📈 [PPA] Loaded PPA data for ${team || 'all teams'}: ${ppaData.length} records`);
      return ppaData;
    } catch (error) {
      console.error('❌ [PPA] Error loading PPA data:', error);
      return [];
    }
  },

  /**
   * GET Success Rate - Critical for down and distance efficiency
   * Success Rate is better predictor than raw yards for game outcomes
   */
  getSuccessRate: async (year = 2024, team = null, conference = null) => {
    try {
      // Success rate is calculated from advanced stats
      const advancedStats = await fetchCollegeFootballData('/stats/season/advanced', { 
        year, 
        team, 
        excludeGarbageTime: true 
      });
      
      console.log(`📊 [SUCCESS] Loaded success rate data for ${team || 'all teams'}`);
      return advancedStats;
    } catch (error) {
      console.error('❌ [SUCCESS] Error loading success rate data:', error);
      return [];
    }
  },

  /**
   * GET Advanced Team Stats - Explosiveness, stuff rate, havoc rate
   */
  getAdvancedStats: async (year = 2024, team = null, excludeGarbageTime = true) => {
    const params = { year, excludeGarbageTime };
    if (team) params.team = team;
    
    try {
      const advancedStats = await fetchCollegeFootballData('/stats/season/advanced', params);
      console.log(`⚡ [ADVANCED] Loaded advanced stats for ${team || 'all teams'}`);
      return advancedStats;
    } catch (error) {
      console.error('❌ [ADVANCED] Error loading advanced stats:', error);
      return [];
    }
  },

  /**
   * GET Betting Lines - Market efficiency detection
   * Critical for identifying where models disagree with market
   */
  getBettingLines: async (year = 2024, team = null, week = null, gameId = null) => {
    try {
      const params = { year };
      if (team) params.team = team;
      if (week) params.week = week;
      if (gameId) params.gameId = gameId;
      
      const bettingLines = await bettingService.getBettingLines(gameId, year, week, 'regular', team);
      console.log(`💰 [BETTING] Loaded betting lines for ${team || 'all teams'}`);
      return bettingLines;
    } catch (error) {
      console.error('❌ [BETTING] Error loading betting lines:', error);
      return [];
    }
  },

  /**
   * GET Drive Efficiency - How teams perform on each drive
   */
  getDriveStats: async (year = 2024, team = null, offense = null, defense = null) => {
    try {
      const drives = await driveService.getDrives(year, 'regular', null, team, offense, defense);
      console.log(`🚗 [DRIVES] Loaded drive stats for ${team || offense || defense || 'all teams'}`);
      return drives;
    } catch (error) {
      console.error('❌ [DRIVES] Error loading drive stats:', error);
      return [];
    }
  },

  /**
   * GET Red Zone Stats - Critical for scoring efficiency
   */
  getRedZoneStats: async (year = 2024, team = null) => {
    try {
      // Red zone stats are part of season stats with redzone category
      const redZoneStats = await fetchCollegeFootballData('/stats/season', { 
        year, 
        team,
        category: 'redzone'
      });
      console.log(`🎯 [REDZONE] Loaded red zone stats for ${team || 'all teams'}`);
      return redZoneStats;
    } catch (error) {
      console.warn('⚠️ [REDZONE] Red zone category not available, using general stats');
      // Fallback to general season stats
      return await teamService.getTeamStats(year, team);
    }
  },

  /**
   * GET Transfer Portal Impact - New player talent injection
   */
  getTransferData: async (year = 2024, team = null) => {
    try {
      // Transfer portal data from player API
      const transfers = await fetchCollegeFootballData('/player/portal', { year, team });
      console.log(`🔄 [TRANSFER] Loaded transfer data for ${team || 'all teams'}`);
      return transfers;
    } catch (error) {
      console.warn('⚠️ [TRANSFER] Transfer portal API not available, using recruiting data as proxy');
      // Fallback to recruiting data as proxy for talent injection
      return await teamService.getRecruitingRankings(year, team);
    }
  },

  /**
   * GET Comprehensive Team Metrics - All advanced metrics in one call
   * This is the main method that loads all data for enhanced predictions
   */
  getComprehensiveMetrics: async (team, year = 2024) => {
    console.log(`🔍 [COMPREHENSIVE] Loading all advanced metrics for ${team}...`);
    
    try {
      // Load all metrics in parallel for performance
      const [
        ppaData,
        successRateData,
        advancedStatsData,
        bettingData,
        driveData,
        redZoneData,
        transferData,
        spRatings,
        eloRatings,
        talentData
      ] = await Promise.all([
        this.getPPA(year, team),
        this.getSuccessRate(year, team),
        this.getAdvancedStats(year, team),
        this.getBettingLines(year, team),
        this.getDriveStats(year, team),
        this.getRedZoneStats(year, team),
        this.getTransferData(year, team),
        teamService.getSPRatings(year, team),
        teamService.getEloRatings(year, null, team),
        teamService.getTalentRatings(year)
      ]);

      // Process and combine all data
      const comprehensiveMetrics = {
        team,
        year,
        ppa: this.processPPAData(ppaData, team),
        successRate: this.processSuccessRateData(successRateData, team),
        advanced: this.processAdvancedStats(advancedStatsData, team),
        betting: this.processBettingData(bettingData, team),
        drives: this.processDriveData(driveData, team),
        redZone: this.processRedZoneData(redZoneData, team),
        transfers: this.processTransferData(transferData, team),
        ratings: {
          sp: spRatings.find(r => r.team === team) || { rating: 0, ranking: 64 },
          elo: eloRatings.find(r => r.team === team) || { elo: 1500 },
          talent: talentData.find(t => t.school === team) || { talent: 0 }
        }
      };

      console.log(`✅ [COMPREHENSIVE] Loaded comprehensive metrics for ${team}`);
      return comprehensiveMetrics;
      
    } catch (error) {
      console.error(`❌ [COMPREHENSIVE] Error loading comprehensive metrics for ${team}:`, error);
      // Return basic structure to prevent crashes
      return {
        team,
        year,
        ppa: { offense: 0, defense: 0, overall: 0 },
        successRate: { offense: 0.5, defense: 0.5 },
        advanced: { explosiveness: 0, efficiency: 0.5 },
        betting: { impliedWinRate: 0.5 },
        drives: { efficiency: 0.5 },
        redZone: { scoring: 0.5, defense: 0.5 },
        transfers: { impact: 0 },
        ratings: {
          sp: { rating: 0, ranking: 64 },
          elo: { elo: 1500 },
          talent: { talent: 0 }
        }
      };
    }
  },

  /**
   * Process PPA data into usable metrics
   */
  processPPAData: (ppaData, team) => {
    if (!ppaData || ppaData.length === 0) {
      return { offense: 0, defense: 0, overall: 0, passing: 0, rushing: 0 };
    }

    const teamPPA = ppaData.find(p => p.team === team);
    if (!teamPPA) {
      return { offense: 0, defense: 0, overall: 0, passing: 0, rushing: 0 };
    }

    return {
      offense: teamPPA.offense?.overall || 0,
      defense: teamPPA.defense?.overall || 0,
      overall: teamPPA.overall || 0,
      passing: teamPPA.offense?.passing || 0,
      rushing: teamPPA.offense?.rushing || 0,
      // Defensive metrics
      passingDefense: teamPPA.defense?.passing || 0,
      rushingDefense: teamPPA.defense?.rushing || 0
    };
  },

  /**
   * Process Success Rate data
   */
  processSuccessRateData: (successData, team) => {
    if (!successData || successData.length === 0) {
      return { offense: 0.5, defense: 0.5, thirdDown: 0.5, redZone: 0.5 };
    }

    const teamSuccess = successData.find(s => s.team === team);
    if (!teamSuccess) {
      return { offense: 0.5, defense: 0.5, thirdDown: 0.5, redZone: 0.5 };
    }

    return {
      offense: teamSuccess.offense?.successRate || 0.5,
      defense: teamSuccess.defense?.successRate || 0.5,
      thirdDown: teamSuccess.offense?.thirdDowns || 0.5,
      redZone: teamSuccess.offense?.redZone || 0.5
    };
  },

  /**
   * Process Advanced Stats data
   */
  processAdvancedStats: (advancedData, team) => {
    if (!advancedData || advancedData.length === 0) {
      return { explosiveness: 0, efficiency: 0.5, havoc: 0, stuffRate: 0.5 };
    }

    const teamAdvanced = advancedData.find(a => a.team === team);
    if (!teamAdvanced) {
      return { explosiveness: 0, efficiency: 0.5, havoc: 0, stuffRate: 0.5 };
    }

    return {
      explosiveness: teamAdvanced.offense?.explosiveness || 0,
      efficiency: teamAdvanced.offense?.efficiency || 0.5,
      havoc: teamAdvanced.defense?.havocRate || 0,
      stuffRate: teamAdvanced.defense?.stuffRate || 0.5,
      lineYards: teamAdvanced.offense?.lineYards || 0,
      openFieldYards: teamAdvanced.offense?.openFieldYards || 0
    };
  },

  /**
   * Process Betting data for market efficiency
   */
  processBettingData: (bettingData, team) => {
    if (!bettingData || bettingData.length === 0) {
      return { impliedWinRate: 0.5, averageSpread: 0, lineMovement: 0 };
    }

    // Calculate implied win rates from betting lines
    const teamGames = bettingData.filter(b => 
      b.homeTeam === team || b.awayTeam === team
    );

    if (teamGames.length === 0) {
      return { impliedWinRate: 0.5, averageSpread: 0, lineMovement: 0 };
    }

    // Calculate average implied win rate from spreads
    let totalImpliedWinRate = 0;
    let totalSpread = 0;
    
    teamGames.forEach(game => {
      const isHome = game.homeTeam === team;
      const spread = isHome ? game.spread : -game.spread;
      totalSpread += spread;
      
      // Convert spread to implied win rate
      const impliedWinRate = this.spreadToWinProbability(spread);
      totalImpliedWinRate += impliedWinRate;
    });

    return {
      impliedWinRate: totalImpliedWinRate / teamGames.length,
      averageSpread: totalSpread / teamGames.length,
      lineMovement: 0, // Would need historical data
      gamesAnalyzed: teamGames.length
    };
  },

  /**
   * Process Drive data
   */
  processDriveData: (driveData, team) => {
    if (!driveData || driveData.length === 0) {
      return { efficiency: 0.5, averageYards: 0, scoringRate: 0.5 };
    }

    const teamDrives = driveData.filter(d => 
      d.offense === team || d.defense === team
    );

    if (teamDrives.length === 0) {
      return { efficiency: 0.5, averageYards: 0, scoringRate: 0.5 };
    }

    const offensiveDrives = teamDrives.filter(d => d.offense === team);
    const totalYards = offensiveDrives.reduce((sum, d) => sum + (d.yards || 0), 0);
    const scoringDrives = offensiveDrives.filter(d => 
      d.driveResult === 'TD' || d.driveResult === 'FG'
    );

    return {
      efficiency: offensiveDrives.length > 0 ? 
        scoringDrives.length / offensiveDrives.length : 0.5,
      averageYards: offensiveDrives.length > 0 ? 
        totalYards / offensiveDrives.length : 0,
      scoringRate: offensiveDrives.length > 0 ? 
        scoringDrives.length / offensiveDrives.length : 0.5,
      totalDrives: offensiveDrives.length
    };
  },

  /**
   * Process Red Zone data
   */
  processRedZoneData: (redZoneData, team) => {
    if (!redZoneData || redZoneData.length === 0) {
      return { scoring: 0.5, defense: 0.5, touchdownRate: 0.5 };
    }

    const teamRedZone = redZoneData.find(r => r.team === team);
    if (!teamRedZone) {
      return { scoring: 0.5, defense: 0.5, touchdownRate: 0.5 };
    }

    return {
      scoring: teamRedZone.redZoneConversions || 0.5,
      defense: teamRedZone.redZoneDefense || 0.5,
      touchdownRate: teamRedZone.redZoneTDs || 0.5,
      attempts: teamRedZone.redZoneAttempts || 0
    };
  },

  /**
   * Process Transfer data
   */
  processTransferData: (transferData, team) => {
    if (!transferData || transferData.length === 0) {
      return { impact: 0, playersIn: 0, playersOut: 0 };
    }

    const teamTransfers = transferData.filter(t => 
      t.fromTeam === team || t.toTeam === team
    );

    const transfersIn = teamTransfers.filter(t => t.toTeam === team);
    const transfersOut = teamTransfers.filter(t => t.fromTeam === team);

    // Simple impact calculation - could be enhanced with player ratings
    const impact = (transfersIn.length * 0.5) - (transfersOut.length * 0.3);

    return {
      impact: Math.max(-2, Math.min(2, impact)), // Cap impact at ±2
      playersIn: transfersIn.length,
      playersOut: transfersOut.length,
      netTransfers: transfersIn.length - transfersOut.length
    };
  },

  /**
   * Convert spread to win probability
   */
  spreadToWinProbability: (spread) => {
    // Standard formula: P = 1 / (1 + e^(-spread/3.5))
    return 1 / (1 + Math.exp(-spread / 3.5));
  },

  /**
   * Calculate Market Disagreement Score
   */
  calculateMarketDisagreement: (modelProbability, marketProbability) => {
    return Math.abs(modelProbability - marketProbability);
  }
};
