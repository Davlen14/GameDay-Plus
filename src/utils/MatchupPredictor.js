// utilities/MatchupPredictor.js

import { gameService, teamService, rankingsService, bettingService, advancedDataService, analyticsService, driveService } from '../services';
import graphqlService from '../services/graphqlService';
import predictionDebugger from './PredictionDebugger';

/**
 * Enhanced MatchupPredictor v2.0 - Advanced college football game prediction system
 * 
 * Key Enhancements Based on Ohio State vs Oregon Analysis:
 * - PPA (Predicted Points Added) - Most predictive metric
 * - Success Rate analysis for consistency prediction
 * - Market efficiency detection and value betting
 * - Enhanced situational factors and weather modeling
 * - Drive efficiency and red zone performance
 * - Transfer portal impact assessment
 * - Multi-factor confidence scoring
 * 
 * This version implements all advanced metrics recommended from comprehensive game analysis
 */

class MatchupPredictor {
  constructor() {
    // Core data stores
    this.teams = new Map();
    this.historicalData = new Map();
    this.spRatings = new Map();
    this.recruitingData = new Map();
    this.transferData = new Map();
    this.eloRatings = new Map();
    this.weatherData = new Map();
    this.bettingData = new Map();
    this.comprehensiveData = new Map();
    
    // NEW: Advanced metrics caches
    this.ppaData = new Map();
    this.successRateData = new Map();
    this.advancedStatsData = new Map();
    this.driveEfficiencyData = new Map();
    this.redZoneData = new Map();
    this.transferPortalData = new Map();
    this.marketEfficiencyData = new Map();
    
    // Enhanced caches for GraphQL data
    this.comprehensiveDataCache = new Map();
    this.eloRatingsCache = new Map();
    this.weatherDataCache = new Map();
    this.bettingDataCache = new Map();
    
    this.isInitialized = false;
    this.modelVersion = '2.0-Enhanced';
    
    console.log('🚀 Enhanced MatchupPredictor v2.0 initialized with advanced metrics');
  }

  /**
   * Enhanced initialization with advanced metrics loading
   */
  async initialize(forceRefresh = false) {
    if (this.isInitialized && !forceRefresh) return;

    try {
      console.log('🔧 Initializing Enhanced MatchupPredictor v2.0...');
      
      // Check GraphQL availability first
      let graphqlAvailable = false;
      try {
        graphqlAvailable = await graphqlService.utils.isAvailable();
      } catch (error) {
        console.warn('GraphQL availability check failed:', error.message);
      }
      
      if (graphqlAvailable) {
        console.log('✓ GraphQL service available - enhanced predictions enabled');
        // Initialize enhanced caches
        this.comprehensiveDataCache = new Map();
        this.eloRatingsCache = new Map();
        this.weatherDataCache = new Map();
        this.bettingDataCache = new Map();
      } else {
        console.log('⚠️ GraphQL service not available - using REST API only');
      }
      
      // Load teams data - only FBS teams (this will handle its own GraphQL/REST fallback)
      const teams = await teamService.getFBSTeams(graphqlAvailable);
      teams.forEach(team => {
        this.teams.set(team.id, team);
      });

      // Load comprehensive data using enhanced approach
      if (graphqlAvailable) {
        try {
          await this.loadGraphQLData();
        } catch (graphqlError) {
          console.warn('GraphQL data loading failed, falling back to individual API calls:', graphqlError.message);
          await this.loadEnhancedFallbackData();
        }
      } else {
        await this.loadEnhancedFallbackData();
      }

      // NEW: Load advanced metrics that make the model more predictive
      await this.loadAdvancedMetrics();

      this.isInitialized = true;
      this.graphqlAvailable = graphqlAvailable;
      console.log('✅ Enhanced MatchupPredictor v2.0 initialized successfully');
      console.log(`📊 Loaded data for ${this.teams.size} teams with advanced metrics`);
      
    } catch (error) {
      console.warn('⚠️ MatchupPredictor initialization had errors:', error.message);
      // Continue with basic functionality
      this.isInitialized = true;
      this.graphqlAvailable = false;
    }
  }

  /**
   * NEW: Load advanced metrics that significantly improve prediction accuracy
   */
  async loadAdvancedMetrics() {
    console.log('🚀 Loading advanced predictive metrics...');
    
    try {
      const currentYear = 2024;
      
      // Load the most predictive metrics in parallel
      const [
        ppaData,
        successRateData,
        advancedStatsData,
        bettingLinesData,
        driveData
      ] = await Promise.all([
        // PPA - Most predictive single metric
        advancedDataService.getPPA(currentYear).catch(() => []),
        
        // Success Rate - Critical for close games
        advancedDataService.getSuccessRate(currentYear).catch(() => []),
        
        // Advanced Stats - Explosiveness, efficiency
        advancedDataService.getAdvancedStats(currentYear).catch(() => []),
        
        // Betting Lines - Market efficiency detection
        advancedDataService.getBettingLines(currentYear).catch(() => []),
        
        // Drive Efficiency - Red zone performance
        advancedDataService.getDriveStats(currentYear).catch(() => [])
      ]);

      // Store in caches for fast access during predictions
      this.cacheAdvancedMetrics(ppaData, 'ppa');
      this.cacheAdvancedMetrics(successRateData, 'successRate');
      this.cacheAdvancedMetrics(advancedStatsData, 'advancedStats');
      this.cacheAdvancedMetrics(bettingLinesData, 'betting');
      this.cacheAdvancedMetrics(driveData, 'drives');

      console.log('✅ Advanced metrics loaded successfully');
      console.log(`📈 PPA data: ${ppaData.length} teams`);
      console.log(`📊 Success rate data: ${successRateData.length} teams`);
      console.log(`⚡ Advanced stats: ${advancedStatsData.length} teams`);
      console.log(`💰 Betting data: ${bettingLinesData.length} games`);
      console.log(`🚗 Drive data: ${driveData.length} drives`);
      
    } catch (error) {
      console.error('❌ Error loading advanced metrics:', error);
      // Continue without advanced metrics - predictions will still work but be less accurate
    }
  }

  /**
   * Cache advanced metrics by team for fast lookup
   */
  cacheAdvancedMetrics(data, metricType) {
    if (!data || data.length === 0) return;
    
    const cache = this.getMetricCache(metricType);
    
    data.forEach(item => {
      const teamKey = item.team || item.school || item.offense || item.defense;
      if (teamKey) {
        cache.set(teamKey, item);
      }
    });
  }

  /**
   * Get the appropriate cache for a metric type
   */
  getMetricCache(metricType) {
    switch (metricType) {
      case 'ppa': return this.ppaData;
      case 'successRate': return this.successRateData;
      case 'advancedStats': return this.advancedStatsData;
      case 'betting': return this.marketEfficiencyData;
      case 'drives': return this.driveEfficiencyData;
      default: return new Map();
    }
  }

  /**
   * Enhanced fallback data loading with advanced metrics
   */
  async loadEnhancedFallbackData() {
    console.log('🔄 [API DEBUG] Loading enhanced fallback data via REST APIs...');
    
    try {
      // Load traditional metrics
      await this.loadFallbackData();
      
      // Load advanced metrics that weren't available in basic fallback
      console.log('📊 [API DEBUG] Loading enhanced metrics...');
      
      // These are the key metrics that dramatically improve accuracy
      const enhancedMetrics = await Promise.all([
        teamService.getTeamPPA(2024).catch(() => []),
        teamService.getAdvancedTeamStats(2024).catch(() => []),
        bettingService.getBettingLines(null, 2024).catch(() => [])
      ]);

      const [ppaData, advancedStats, bettingData] = enhancedMetrics;
      
      // Cache the enhanced metrics
      ppaData.forEach(ppa => this.ppaData.set(ppa.team, ppa));
      advancedStats.forEach(stats => this.advancedStatsData.set(stats.team, stats));
      bettingData.forEach(bet => {
        if (bet.homeTeam) this.marketEfficiencyData.set(bet.homeTeam, bet);
        if (bet.awayTeam) this.marketEfficiencyData.set(bet.awayTeam, bet);
      });

      console.log(`✅ [API DEBUG] Enhanced fallback data loaded`);
      console.log(`📈 Enhanced PPA data: ${ppaData.length} teams`);
      console.log(`⚡ Advanced stats: ${advancedStats.length} teams`);
      console.log(`💰 Betting lines: ${bettingData.length} games`);

    } catch (error) {
      console.error('❌ [API DEBUG] Error loading enhanced fallback data:', error);
    }
  }

  /**
   * Load data using GraphQL services
   */
  async loadGraphQLData() {
    console.log('🔄 Loading data via GraphQL...');
    
    // Load teams with GraphQL enhancement
    try {
      const teams = await graphqlService.teams.getCurrent();
      teams.forEach(team => {
        if (this.teams.has(team.id)) {
          // Enhance existing team data with GraphQL data
          const existing = this.teams.get(team.id);
          this.teams.set(team.id, { ...existing, ...team });
        }
      });
    } catch (error) {
      console.warn('GraphQL teams loading failed:', error.message);
    }

    // Load ELO ratings via direct GraphQL query
    try {
      const eloQuery = `
        query GetEloRatings($year: smallint!) {
          game(where: {season: {_eq: $year}}, limit: 100) {
            homeTeam
            awayTeam
            homeStartElo
            awayStartElo
          }
        }
      `;
      const eloData = await graphqlService.query(eloQuery, { year: 2024 });
      
      // Process ELO data - get latest ratings for each team
      const teamElos = new Map();
      eloData.game.forEach(game => {
        teamElos.set(game.homeTeam, game.homeStartElo);
        teamElos.set(game.awayTeam, game.awayStartElo);
      });
      
      teamElos.forEach((elo, team) => {
        this.eloRatings.set(team, { rating: elo, team });
      });
      
      console.log(`✓ Loaded ELO ratings for ${teamElos.size} teams`);
    } catch (error) {
      console.warn('GraphQL ELO loading failed:', error.message);
    }
  }

  /**
   * Process comprehensive GraphQL data
   */
  processComprehensiveData(data) {
    // Process SP+ ratings
    if (data.spRatings) {
      data.spRatings.forEach(rating => {
        this.spRatings.set(rating.team, rating);
      });
    }

    // Process recruiting data
    if (data.recruiting) {
      data.recruiting.forEach(recruit => {
        this.recruitingData.set(recruit.team, recruit);
      });
    }

    // Process ELO ratings
    if (data.eloRatings) {
      data.eloRatings.forEach(elo => {
        this.eloRatings.set(elo.team, elo);
      });
    }

    // Process betting data
    if (data.bettingData) {
      data.bettingData.forEach(betting => {
        this.bettingData.set(betting.team, betting);
      });
    }

    // Cache comprehensive data for team lookups
    if (data.teams) {
      data.teams.forEach(teamData => {
        this.comprehensiveData.set(teamData.id, teamData);
      });
    }
  }

  /**
   * Fallback data loading using REST APIs for statistical data
   */
  async loadFallbackData() {
    console.log('🔄 [API DEBUG] Loading fallback data via REST APIs...');
    
    try {
      // Load SP+ ratings using teamService
      console.log('📊 [API DEBUG] Loading SP+ ratings...');
      const spData = await teamService.getSPRatings(2024);
      spData.forEach(rating => {
        this.spRatings.set(rating.team, rating);
      });
      console.log(`✅ [API DEBUG] Loaded ${spData.length} SP+ ratings`);

      // Load ELO ratings using teamService
      console.log('📊 [API DEBUG] Loading ELO ratings...');
      const eloData = await teamService.getEloRatings(2024);
      eloData.forEach(rating => {
        this.eloRatings.set(rating.team, rating);
      });
      console.log(`✅ [API DEBUG] Loaded ${eloData.length} ELO ratings`);

      // Load recruiting data using teamService
      console.log('📊 [API DEBUG] Loading recruiting data...');
      const recruitingData = await teamService.getRecruitingRankings(2024);
      recruitingData.forEach(data => {
        this.recruitingData.set(data.team, data);
      });
      console.log(`✅ [API DEBUG] Loaded ${recruitingData.length} recruiting rankings`);

      // Load talent ratings using teamService
      console.log('📊 [API DEBUG] Loading talent ratings...');
      const talentData = await teamService.getTalentRatings(2024);
      talentData.forEach(data => {
        this.recruitingData.set(data.team, { 
          ...this.recruitingData.get(data.team), 
          talent: data.talent 
        });
      });
      console.log(`✅ [API DEBUG] Loaded ${talentData.length} talent ratings`);

    } catch (error) {
      console.error('❌ [API DEBUG] Error loading fallback data:', error);
    }
  }

  /**
   * Generate comprehensive matchup prediction
   */
  async predictMatchup(homeTeamId, awayTeamId, options = {}) {
    await this.initialize();

    const {
      neutralSite = false,
      week = 1,
      season = 2025,
      weatherConditions = null,
      conferenceGame = false
    } = options;

    // Start debugging session
    const homeTeam = this.teams.get(homeTeamId);
    const awayTeam = this.teams.get(awayTeamId);
    
    predictionDebugger.startDebugging(
      homeTeam?.school || homeTeamId, 
      awayTeam?.school || awayTeamId
    );

    try {
      predictionDebugger.log('TEAM LOOKUP', `Found teams: ${homeTeam?.school} vs ${awayTeam?.school}`, 'info', {
        homeTeam: homeTeam ? { id: homeTeam.id, school: homeTeam.school } : 'NOT_FOUND',
        awayTeam: awayTeam ? { id: awayTeam.id, school: awayTeam.school } : 'NOT_FOUND'
      });

      if (!homeTeam || !awayTeam) {
        predictionDebugger.error('TEAM LOOKUP', 'Team not found in database', new Error('Team not found'), { homeTeamId, awayTeamId });
        throw new Error('Team not found');
      }

      predictionDebugger.log('DATA FETCH', 'Starting data collection for prediction', 'info', { options });

      // Get historical data for both teams using enhanced GraphQL queries
      const [homeHistory, awayHistory, headToHead, weatherData, comprehensiveData] = await Promise.all([
        this.getEnhancedTeamHistory(homeTeamId).catch(error => {
          predictionDebugger.trackDataFetch('homeHistory', 'GraphQL', false, null, error);
          return this.getTeamHistory(homeTeamId); // fallback
        }),
        this.getEnhancedTeamHistory(awayTeamId).catch(error => {
          predictionDebugger.trackDataFetch('awayHistory', 'GraphQL', false, null, error);
          return this.getTeamHistory(awayTeamId); // fallback
        }),
        this.getEnhancedHeadToHeadHistory(homeTeamId, awayTeamId).catch(error => {
          predictionDebugger.trackDataFetch('headToHead', 'GraphQL', false, null, error);
          return this.getHeadToHeadHistory(homeTeamId, awayTeamId); // fallback
        }),
        this.getWeatherData(homeTeam, options).catch(error => {
          predictionDebugger.trackDataFetch('weather', 'API', false, null, error);
          return null; // fallback
        }),
        this.loadComprehensivePredictionData(homeTeam.school, awayTeam.school, season).catch(error => {
          predictionDebugger.trackDataFetch('comprehensive', 'GraphQL', false, null, error);
          return null; // fallback
        })
      ]);

      // Track successful data fetches
      if (homeHistory) predictionDebugger.trackDataFetch('homeHistory', 'GraphQL', true, { gamesCount: homeHistory.length });
      if (awayHistory) predictionDebugger.trackDataFetch('awayHistory', 'GraphQL', true, { gamesCount: awayHistory.length });
      if (headToHead) predictionDebugger.trackDataFetch('headToHead', 'GraphQL', true, { totalGames: headToHead.totalGames });
      if (weatherData) predictionDebugger.trackDataFetch('weather', 'API', true, { conditions: weatherData.conditions });
      if (comprehensiveData) predictionDebugger.trackDataFetch('comprehensive', 'GraphQL', true, { dataPoints: Object.keys(comprehensiveData).length });

      // Store comprehensive data for use in calculations
      if (comprehensiveData) {
        this.comprehensiveDataCache.set(`${homeTeam.school}_${awayTeam.school}_${season}`, comprehensiveData);
        predictionDebugger.log('CACHE', 'Stored comprehensive data in cache', 'success');
      }

      predictionDebugger.log('METRICS', 'Calculating enhanced team metrics with analytics and drive data', 'info');

      // Get advanced analytics and drive data for both teams
      const [homeAnalytics, awayAnalytics, homeDrives, awayDrives] = await Promise.all([
        analyticsService.getTeamMetrics(homeTeam.school, season).catch(error => {
          predictionDebugger.trackApiCall('analyticsService', 'getTeamMetrics', { team: homeTeam.school, season }, null, error);
          return null;
        }),
        analyticsService.getTeamMetrics(awayTeam.school, season).catch(error => {
          predictionDebugger.trackApiCall('analyticsService', 'getTeamMetrics', { team: awayTeam.school, season }, null, error);
          return null;
        }),
        driveService.getTeamDrives(homeTeam.school, season).catch(error => {
          predictionDebugger.trackApiCall('driveService', 'getTeamDrives', { team: homeTeam.school, season }, null, error);
          return null;
        }),
        driveService.getTeamDrives(awayTeam.school, season).catch(error => {
          predictionDebugger.trackApiCall('driveService', 'getTeamDrives', { team: awayTeam.school, season }, null, error);
          return null;
        })
      ]);

      // Track successful analytics and drive data fetches
      if (homeAnalytics) {
        predictionDebugger.trackApiCall('analyticsService', 'getTeamMetrics', { team: homeTeam.school, season }, homeAnalytics);
        predictionDebugger.log('ANALYTICS', `Loaded analytics data for ${homeTeam.school}`, 'success', {
          ppaCount: homeAnalytics.ppa?.length || 0,
          spRatings: homeAnalytics.spRatings?.length || 0,
          advancedStats: homeAnalytics.advancedStats?.length || 0,
          eloRatings: homeAnalytics.eloRatings?.length || 0
        });
      }
      if (awayAnalytics) {
        predictionDebugger.trackApiCall('analyticsService', 'getTeamMetrics', { team: awayTeam.school, season }, awayAnalytics);
        predictionDebugger.log('ANALYTICS', `Loaded analytics data for ${awayTeam.school}`, 'success', {
          ppaCount: awayAnalytics.ppa?.length || 0,
          spRatings: awayAnalytics.spRatings?.length || 0,
          advancedStats: awayAnalytics.advancedStats?.length || 0,
          eloRatings: awayAnalytics.eloRatings?.length || 0
        });
      }
      if (homeDrives) {
        predictionDebugger.trackApiCall('driveService', 'getTeamDrives', { team: homeTeam.school, season }, homeDrives);
        predictionDebugger.log('DRIVES', `Loaded ${homeDrives.length} drives for ${homeTeam.school}`, 'success');
      }
      if (awayDrives) {
        predictionDebugger.trackApiCall('driveService', 'getTeamDrives', { team: awayTeam.school, season }, awayDrives);
        predictionDebugger.log('DRIVES', `Loaded ${awayDrives.length} drives for ${awayTeam.school}`, 'success');
      }

      // Calculate enhanced metrics with GraphQL data AND analytics/drive data
      const homeMetrics = this.calculateEnhancedTeamMetrics(homeTeam, homeHistory, homeTeamId, homeAnalytics, homeDrives);
      const awayMetrics = this.calculateEnhancedTeamMetrics(awayTeam, awayHistory, awayTeamId, awayAnalytics, awayDrives);

      predictionDebugger.log('METRICS', 'Team metrics calculated successfully', 'success', {
        homeMetrics: {
          spRating: homeMetrics.spRating,
          avgPointsScored: homeMetrics.avgPointsScored,
          avgPointsAllowed: homeMetrics.avgPointsAllowed
        },
        awayMetrics: {
          spRating: awayMetrics.spRating,
          avgPointsScored: awayMetrics.avgPointsScored,
          avgPointsAllowed: awayMetrics.avgPointsAllowed
        }
      });

      predictionDebugger.log('PREDICTION', 'Starting enhanced prediction calculation', 'info');

      // Calculate enhanced predictions with GraphQL data
      const prediction = this.calculateEnhancedPrediction({
        homeTeam,
        awayTeam,
        homeMetrics,
        awayMetrics,
        headToHead,
        neutralSite,
        week,
        season,
        weatherConditions: weatherData,
        conferenceGame
      });

      predictionDebugger.log('PREDICTION', 'Enhanced prediction calculated', 'success', {
        score: prediction.score,
        spread: prediction.spread,
        total: prediction.total,
        winProbability: prediction.winProbability
      });

      predictionDebugger.log('ANALYSIS', 'Generating comprehensive analysis', 'info');

      // Generate comprehensive analysis
      const analysis = this.generateAnalysis({
        homeTeam,
        awayTeam,
        homeMetrics,
        awayMetrics,
        prediction,
        headToHead,
        options
      });

      predictionDebugger.log('ANALYSIS', 'Analysis generation complete', 'success', {
        keyFactorsCount: analysis.keyFactors?.length || 0,
        bettingInsightsCount: analysis.bettingInsights?.length || 0
      });

      const confidence = this.calculateConfidence(prediction, homeMetrics, awayMetrics);

      predictionDebugger.log('COMPLETE', `Prediction complete with ${(confidence * 100).toFixed(1)}% confidence`, 'success', {
        totalElapsed: predictionDebugger.startTime ? Date.now() - predictionDebugger.startTime : 0
      });

      // Create debug panel if enabled
      if (predictionDebugger.isEnabled && typeof window !== 'undefined') {
        predictionDebugger.createDebugPanel();
        predictionDebugger.updateDebugPanel();
      }

      return {
        prediction,
        analysis,
        teams: {
          home: { ...homeTeam, metrics: homeMetrics },
          away: { ...awayTeam, metrics: awayMetrics }
        },
        headToHead,
        confidence,
        lastUpdated: new Date().toISOString(),
        debugReport: predictionDebugger.getDebugReport()
      };

    } catch (error) {
      predictionDebugger.error('PREDICTION', 'Prediction failed', error, { homeTeamId, awayTeamId, options });
      console.error('Error generating matchup prediction:', error);
      throw error;
    }
  }

  /**
   * Calculate team performance metrics using both game history and season stats
   */
  async calculateTeamMetrics(team, history) {
    console.log(`📊 [API DEBUG] Calculating metrics for team: ${team.school}`);
    predictionDebugger.log('TEAM_METRICS', `Starting metrics calculation for ${team.school}`, 'info');
    
    // Get season statistics from REST API for accurate metrics
    let seasonStats = null;
    try {
      console.log(`📊 [API DEBUG] Loading season stats for ${team.school}...`);
      predictionDebugger.log('API_CALL', `Fetching season stats for ${team.school}`, 'info');
      
      const stats = await teamService.getTeamStats(2024, team.school);
      predictionDebugger.trackApiCall('teamService', 'getTeamStats', { year: 2024, team: team.school }, stats);
      
      if (stats && stats.length > 0) {
        // Convert array of {statName, statValue} to object
        seasonStats = {};
        stats.forEach(stat => {
          seasonStats[stat.statName] = stat.statValue;
        });
        console.log(`✅ [API DEBUG] Loaded ${stats.length} season stats for ${team.school}`);
        predictionDebugger.log('DATA_SUCCESS', `Loaded ${stats.length} season stats`, 'success', { teamName: team.school, statsCount: stats.length });
      }
    } catch (error) {
      predictionDebugger.trackApiCall('teamService', 'getTeamStats', { year: 2024, team: team.school }, null, error);
      console.warn(`⚠️ [API DEBUG] Could not load season stats for ${team.school}:`, error.message);
    }

    const recentGames = history.slice(-10); // Last 10 games
    const allGames = history;

    // Calculate from game history (fallback if season stats not available)
    const winPercentage = allGames.length > 0 ? 
      allGames.filter(g => g.isWin).length / allGames.length : 0.5;

    // Use season stats if available, otherwise calculate from games
    let avgPointsScored, avgPointsAllowed;
    
    if (seasonStats && seasonStats.games) {
      // Calculate from season totals if available
      const games = seasonStats.games;
      
      // Look for scoring stats in the season data
      // Note: College Football API doesn't provide direct points per game, 
      // so we still need to calculate from game history
      avgPointsScored = allGames.length > 0 ? 
        allGames.reduce((sum, g) => sum + g.pointsScored, 0) / allGames.length : 0;
      avgPointsAllowed = allGames.length > 0 ? 
        allGames.reduce((sum, g) => sum + g.pointsAllowed, 0) / allGames.length : 0;
      
      console.log(`📊 [API DEBUG] Calculated from games - PPG: ${avgPointsScored.toFixed(1)}, PAPG: ${avgPointsAllowed.toFixed(1)}`);
    } else {
      // Calculate from game history
      avgPointsScored = this.calculateAverage(allGames.map(g => g.pointsScored));
      avgPointsAllowed = this.calculateAverage(allGames.map(g => g.pointsAllowed));
      
      console.log(`📊 [API DEBUG] Calculated from game history - PPG: ${avgPointsScored.toFixed(1)}, PAPG: ${avgPointsAllowed.toFixed(1)}`);
    }

    const pointDifferential = avgPointsScored - avgPointsAllowed;

    // Recent form
    const recentWinPct = recentGames.length > 0 ? 
      recentGames.filter(g => g.isWin).length / recentGames.length : 0.5;

    const recentPtsScored = this.calculateAverage(recentGames.map(g => g.pointsScored));
    const recentPtsAllowed = this.calculateAverage(recentGames.map(g => g.pointsAllowed));

    // Get ratings with better error handling and prefer 2024 data
    let spRating = this.spRatings.get(team.school) || { rating: 0, ranking: 64 };
    let recruiting = this.recruitingData.get(team.school) || { rank: 64, points: 0 };
    let eloRating = this.eloRatings.get(team.school) || { elo: null };
    
    // Try to get more accurate SP+ ratings for 2024
    try {
      predictionDebugger.log('API_CALL', `Fetching current ratings for ${team.school}`, 'info');
      const currentRatings = await teamService.getTeamRatings(team.school, 2024);
      predictionDebugger.trackApiCall('teamService', 'getTeamRatings', { team: team.school, year: 2024 }, currentRatings);
      
      if (currentRatings && currentRatings.length > 0) {
        const spData = currentRatings.find(r => r.rating_type === 'sp+' || r.type === 'sp+');
        if (spData) {
          spRating = { rating: spData.rating || spData.value, ranking: spData.ranking || spData.rank };
          console.log(`📈 [METRICS] Updated SP+ for ${team.school}: ${spRating.rating.toFixed(1)}`);
          predictionDebugger.log('DATA_UPDATE', `Updated SP+ rating: ${spRating.rating.toFixed(1)}`, 'success');
        }
      }
    } catch (error) {
      predictionDebugger.trackApiCall('teamService', 'getTeamRatings', { team: team.school, year: 2024 }, null, error);
      console.warn(`⚠️ [METRICS] Could not load current ratings for ${team.school}:`, error.message);
    }

    // Advanced metrics from game data
    const strengthOfSchedule = await this.calculateSOS(team.school);
    const homeFieldAdvantage = this.calculateHomeFieldAdvantage(allGames);
    
    // Enhanced efficiency metrics using season stats when available
    const offensiveEfficiency = seasonStats ? 
      this.calculateOffensiveEfficiencyFromStats(seasonStats) : 
      this.calculateOffensiveEfficiency(allGames);
      
    const defensiveEfficiency = seasonStats ? 
      this.calculateDefensiveEfficiencyFromStats(seasonStats) : 
      this.calculateDefensiveEfficiency(allGames);

    // Red zone performance
    const redZoneScoring = this.calculateRedZoneEfficiency(allGames, 'offense');
    const redZoneDefense = this.calculateRedZoneEfficiency(allGames, 'defense');

    // Turnover metrics
    const turnoverMargin = this.calculateTurnoverMargin(allGames);

    const metrics = {
      // Core metrics
      winPercentage,
      avgPointsScored,
      avgPointsAllowed,
      pointDifferential,
      
      // Recent form
      recentWinPct,
      recentPtsScored,
      recentPtsAllowed,
      recentForm: recentPtsScored - recentPtsAllowed,
      
      // Advanced ratings
      spRating: spRating.rating || 0,
      spRanking: spRating.ranking || 64,
      recruitingRank: recruiting.rank || 64,
      recruitingPoints: recruiting.points || 0,
      eloRating: eloRating.elo || null,
      
      // Situational
      strengthOfSchedule,
      homeFieldAdvantage,
      
      // Efficiency
      offensiveEfficiency,
      defensiveEfficiency,
      redZoneScoring,
      redZoneDefense,
      turnoverMargin,
      
      // Enhanced metrics from season stats
      totalYards: seasonStats?.totalYards || null,
      rushingYards: seasonStats?.rushingYards || null,
      passingYards: seasonStats?.netPassingYards || null,
      firstDowns: seasonStats?.firstDowns || null,
      thirdDownConversion: seasonStats ? 
        (seasonStats.thirdDownConversions / Math.max(seasonStats.thirdDowns, 1)) : null,
      
      // Game counts
      totalGames: allGames.length,
      recentGames: recentGames.length,
      
      // Season stats reference
      seasonStats
    };

    console.log(`✅ [API DEBUG] Calculated metrics for ${team.school}:`, {
      ppg: avgPointsScored.toFixed(1),
      papg: avgPointsAllowed.toFixed(1),
      spRating: metrics.spRating,
      eloRating: metrics.eloRating,
      winPct: (winPercentage * 100).toFixed(1) + '%'
    });

    return metrics;
  }

  /**
   * Calculate final prediction
   */
  calculatePrediction({ homeTeam, awayTeam, homeMetrics, awayMetrics, headToHead, neutralSite, week, season, weatherConditions, conferenceGame }) {
    
    // Dynamic base prediction using team characteristics
    const homeBaseScore = this.calculateDynamicBaseScore(homeTeam, homeMetrics);
    const awayBaseScore = this.calculateDynamicBaseScore(awayTeam, awayMetrics);
    
    let homeScore = homeBaseScore;
    let awayScore = awayBaseScore;

    console.log(`🔧 [CALC DEBUG] Base scores - Home: ${homeScore.toFixed(1)}, Away: ${awayScore.toFixed(1)}`);

    // Factor in team strength (with null checks)
    const spDifferential = (homeMetrics.spRating || 0) - (awayMetrics.spRating || 0);
    const pointDifferential = (homeMetrics.pointDifferential || 0) - (awayMetrics.pointDifferential || 0);
    
    // Apply adjustments with null safety
    if (Math.abs(spDifferential) > 0.1) {
      homeScore += (spDifferential * 0.4);
      awayScore += (-spDifferential * 0.4);
      console.log(`🔧 [CALC DEBUG] SP+ adjustment: ${(spDifferential * 0.4).toFixed(1)}`);
    }
    
    if (Math.abs(pointDifferential) > 0.1) {
      homeScore += (pointDifferential * 0.15);
      awayScore += (-pointDifferential * 0.15);
      console.log(`🔧 [CALC DEBUG] Point differential adjustment: ${(pointDifferential * 0.15).toFixed(1)}`);
    }

    // Recent form adjustment
    const recentFormDiff = (homeMetrics.recentForm || 0) - (awayMetrics.recentForm || 0);
    if (Math.abs(recentFormDiff) > 0.1) {
      homeScore += recentFormDiff * 0.1;
      awayScore -= recentFormDiff * 0.1;
      console.log(`🔧 [CALC DEBUG] Recent form adjustment: ${(recentFormDiff * 0.1).toFixed(1)}`);
    }

    // Home field advantage (if not neutral site)
    if (!neutralSite) {
      const hfa = homeMetrics.homeFieldAdvantage || 3.2;
      homeScore += hfa;
      console.log(`🔧 [CALC DEBUG] Home field advantage: +${hfa.toFixed(1)}`);
    }

    // Week adjustments
    if (week <= 4) {
      // Early season - more conservative scoring
      homeScore *= 0.92;
      awayScore *= 0.92;
      console.log(`🔧 [CALC DEBUG] Early season adjustment: -8%`);
    }

    // Weather adjustments
    if (weatherConditions) {
      const weatherAdjustment = this.calculateWeatherImpact(weatherConditions);
      homeScore += weatherAdjustment.home;
      awayScore += weatherAdjustment.away;
      console.log(`🔧 [CALC DEBUG] Weather adjustment: Home ${weatherAdjustment.home.toFixed(1)}, Away ${weatherAdjustment.away.toFixed(1)}`);
    }

    // Conference game adjustment
    if (conferenceGame) {
      // Conference games tend to be closer
      const adjustment = Math.abs(homeScore - awayScore) * 0.15;
      if (homeScore > awayScore) {
        homeScore -= adjustment;
        awayScore += adjustment * 0.5;
      } else {
        awayScore -= adjustment;
        homeScore += adjustment * 0.5;
      }
      console.log(`🔧 [CALC DEBUG] Conference game adjustment: ${adjustment.toFixed(1)}`);
    }

    // Head-to-head historical adjustment
    if (headToHead && headToHead.totalGames > 2) {
      const h2hAdjustment = this.calculateHeadToHeadImpact(headToHead, homeTeam, awayTeam);
      homeScore += h2hAdjustment.home;
      awayScore += h2hAdjustment.away;
      console.log(`🔧 [CALC DEBUG] Head-to-head adjustment: Home ${h2hAdjustment.home.toFixed(1)}, Away ${h2hAdjustment.away.toFixed(1)}`);
    }

    // Ensure reasonable bounds
    homeScore = Math.max(10, Math.min(70, homeScore));
    awayScore = Math.max(7, Math.min(65, awayScore));

    // Round to reasonable numbers
    homeScore = Math.round(homeScore * 10) / 10;
    awayScore = Math.round(awayScore * 10) / 10;

    console.log(`✅ [CALC DEBUG] Final scores - Home: ${homeScore}, Away: ${awayScore}`);

    // Calculate derived metrics
    const total = homeScore + awayScore;
    const spread = homeScore - awayScore;
    const homeWinProb = this.calculateWinProbability(homeScore, awayScore, homeMetrics, awayMetrics);
    const awayWinProb = 1 - homeWinProb;

    // Convert to moneyline odds
    const homeMoneyline = this.probabilityToMoneyline(homeWinProb);
    const awayMoneyline = this.probabilityToMoneyline(awayWinProb);

    return {
      score: {
        home: homeScore,
        away: awayScore,
        total: Math.round(total * 10) / 10
      },
      spread: Math.round(spread * 10) / 10,
      total: Math.round(total * 10) / 10,
      winProbability: {
        home: Math.round(homeWinProb * 1000) / 10, // Percentage
        away: Math.round(awayWinProb * 1000) / 10
      },
      moneyline: {
        home: homeMoneyline,
        away: awayMoneyline
      },
      factors: {
        spDifferential: Math.round(spDifferential * 10) / 10,
        pointDifferential: Math.round(pointDifferential * 10) / 10,
        recentFormDiff: Math.round(recentFormDiff * 10) / 10,
        homeFieldValue: neutralSite ? 0 : (homeMetrics.homeFieldAdvantage || 3.2)
      }
    };
  }

  /**
   * Calculate dynamic base score based on team characteristics and historical performance
   */
  calculateDynamicBaseScore(team, metrics) {
    // Start with more realistic national averages
    let baseScore = 24.8; // 2024 FBS average
    
    console.log(`🎯 [BASE SCORE] Starting calculation for ${team?.school || 'Unknown'}`);
    console.log(`🎯 [BASE SCORE] Metrics available:`, {
      avgPointsScored: metrics?.avgPointsScored,
      spRating: metrics?.spRating,
      winPercentage: metrics?.winPercentage,
      totalGames: metrics?.totalGames,
      pointDifferential: metrics?.pointDifferential,
      offensiveEfficiency: metrics?.offensiveEfficiency
    });
    
    // Priority 1: Use actual season statistics if available
    if (metrics?.avgPointsScored && metrics.avgPointsScored > 0) {
      baseScore = metrics.avgPointsScored;
      console.log(`✅ [BASE SCORE] Using actual PPG: ${baseScore.toFixed(1)}`);
      return Math.max(10, Math.min(55, baseScore));
    }
    
    // Priority 2: Use advanced metrics to estimate scoring
    let scoreEstimate = baseScore;
    
    // SP+ Rating influence (most predictive)
    if (metrics.spRating && Math.abs(metrics.spRating) > 0.1) {
      // SP+ is centered around 0, positive is better
      const spBonus = metrics.spRating * 0.6; // Strong influence
      scoreEstimate += spBonus;
      console.log(`📈 [BASE SCORE] SP+ adjustment: ${spBonus.toFixed(1)} (rating: ${metrics.spRating.toFixed(1)})`);
    }
    
    // Win percentage influence
    if (metrics.winPercentage !== undefined && metrics.totalGames > 0) {
      // Better teams typically score more
      const winBonus = (metrics.winPercentage - 0.5) * 8; // 8 point swing for perfect vs worst
      scoreEstimate += winBonus;
      console.log(`🏆 [BASE SCORE] Win% adjustment: ${winBonus.toFixed(1)} (${(metrics.winPercentage * 100).toFixed(1)}%)`);
    }
    
    // Recruiting/Talent influence (long-term program strength)
    if (metrics.talentComposite && metrics.talentComposite > 0) {
      // Scale around 85 rating (average)
      const talentBonus = (metrics.talentComposite - 85) * 0.15;
      scoreEstimate += talentBonus;
      console.log(`⭐ [BASE SCORE] Talent adjustment: ${talentBonus.toFixed(1)} (rating: ${metrics.talentComposite.toFixed(1)})`);
    }
    
    // Point differential as backup indicator
    if (metrics.pointDifferential !== undefined && Math.abs(metrics.pointDifferential) > 0.1) {
      const diffBonus = metrics.pointDifferential * 0.25;
      scoreEstimate += diffBonus;
      console.log(`📊 [BASE SCORE] Point diff adjustment: ${diffBonus.toFixed(1)} (diff: ${metrics.pointDifferential.toFixed(1)})`);
    }
    
    // Offensive efficiency bonus
    if (metrics.offensiveEfficiency && metrics.offensiveEfficiency > 0.1) {
      const efficiencyBonus = (metrics.offensiveEfficiency - 0.5) * 12; // Scale around 50% efficiency
      scoreEstimate += efficiencyBonus;
      console.log(`⚡ [BASE SCORE] Offensive efficiency adjustment: ${efficiencyBonus.toFixed(1)}`);
    }
    
    // Conference strength adjustment
    if (team?.conference) {
      const conferenceAdjustment = this.getConferenceAdjustment(team.conference);
      scoreEstimate += conferenceAdjustment;
      console.log(`🏛️ [BASE SCORE] Conference adjustment: ${conferenceAdjustment.toFixed(1)} (${team.conference})`);
    }
    
    // Add some controlled randomness for teams without good data
    if (!metrics.avgPointsScored && (!metrics.spRating || Math.abs(metrics.spRating) < 0.1)) {
      const teamHash = team?.school ? this.simpleHash(team.school) : Math.random() * 1000;
      const randomVariation = ((teamHash % 12) - 6) * 0.5; // -3 to +3 variation
      scoreEstimate += randomVariation;
      console.log(`🎲 [BASE SCORE] Random variation for ${team?.school || 'Unknown'}: ${randomVariation.toFixed(1)}`);
    }
    
    // Ensure realistic bounds
    const finalScore = Math.max(12, Math.min(50, scoreEstimate));
    
    // Final safety check for NaN
    const safeScore = isNaN(finalScore) ? 24.8 : finalScore;
    
    console.log(`✅ [BASE SCORE] Final score for ${team?.school || 'Unknown'}: ${safeScore.toFixed(1)} (isNaN check: ${isNaN(finalScore)})`);
    
    return safeScore;
  }

  /**
   * Get conference strength adjustment
   */
  getConferenceAdjustment(conference) {
    const conferenceStrength = {
      'SEC': 2.5,
      'Big Ten': 2.0,
      'Big 12': 1.5,
      'ACC': 1.0,
      'Pac-12': 1.0,
      'American Athletic': 0.0,
      'Mountain West': -0.5,
      'Conference USA': -1.0,
      'MAC': -1.5,
      'Sun Belt': -1.0,
      'FBS Independents': 0.0
    };
    
    return conferenceStrength[conference] || 0;
  }

  /**
   * Enhanced prediction calculation using GraphQL data and advanced metrics
   */
  calculateEnhancedPrediction({ homeTeam, awayTeam, homeMetrics, awayMetrics, headToHead, neutralSite, week, season, weatherConditions, conferenceGame }) {
    
    predictionDebugger.log('ENHANCED_CALC', 'Starting enhanced prediction calculation', 'info', {
      homeTeam: homeTeam.school,
      awayTeam: awayTeam.school,
      neutralSite,
      week,
      season
    });

    // Start with base prediction
    const basePrediction = this.calculatePrediction({ 
      homeTeam, awayTeam, homeMetrics, awayMetrics, headToHead, 
      neutralSite, week, season, weatherConditions, conferenceGame 
    });
    
    predictionDebugger.log('BASE_PREDICTION_RAW', 'Raw base prediction result', 'info', {
      basePrediction,
      homeScore: basePrediction?.score?.home,
      awayScore: basePrediction?.score?.away,
      basePredictionType: typeof basePrediction,
      hasScore: !!basePrediction?.score
    });
    
    // Ensure we have valid scores from base prediction
    let homeScore = basePrediction?.score?.home || 25;
    let awayScore = basePrediction?.score?.away || 25;
    
    // Safety check to ensure scores are numbers
    if (isNaN(homeScore) || homeScore === null || homeScore === undefined) {
      console.warn('⚠️ Home score is invalid, using fallback:', homeScore);
      homeScore = 25;
    }
    if (isNaN(awayScore) || awayScore === null || awayScore === undefined) {
      console.warn('⚠️ Away score is invalid, using fallback:', awayScore);
      awayScore = 25;
    }

    predictionDebugger.log('BASE_PREDICTION', 'Base prediction calculated', 'success', {
      homeScore,
      awayScore,
      spread: basePrediction?.spread || 0,
      basePredictionValid: !!basePrediction,
      homeScoreType: typeof homeScore,
      awayScoreType: typeof awayScore,
      homeScoreIsNaN: isNaN(homeScore),
      awayScoreIsNaN: isNaN(awayScore)
    });
    
    // Enhanced adjustments using GraphQL data and analytics
    
    // PPA (Predicted Points Added) - THE MOST PREDICTIVE METRIC
    if (homeMetrics.ppaOffense !== undefined && awayMetrics.ppaOffense !== undefined &&
        homeMetrics.ppaDefense !== undefined && awayMetrics.ppaDefense !== undefined) {
      
      // Calculate net PPA advantage with safety checks
      const homeNetPPA = (homeMetrics.ppaOffense || 0) - (awayMetrics.ppaDefense || 0);
      const awayNetPPA = (awayMetrics.ppaOffense || 0) - (homeMetrics.ppaDefense || 0);
      
      // PPA directly correlates to scoring - this is the key insight from Ohio State vs Oregon analysis
      const ppaScoreAdjustment = 0.85; // PPA has very high predictive value
      const homeAdjustment = homeNetPPA * ppaScoreAdjustment;
      const awayAdjustment = awayNetPPA * ppaScoreAdjustment;
      
      // Apply adjustments with safety checks
      if (!isNaN(homeAdjustment)) homeScore += homeAdjustment;
      if (!isNaN(awayAdjustment)) awayScore += awayAdjustment;
      
      predictionDebugger.log('PPA_ADJUSTMENT', 'Applied PPA (most predictive metric)', 'info', {
        homeNetPPA,
        awayNetPPA,
        homeOffensePPA: homeMetrics.ppaOffense,
        homeDefensePPA: homeMetrics.ppaDefense,
        awayOffensePPA: awayMetrics.ppaOffense,
        awayDefensePPA: awayMetrics.ppaDefense,
        homeAdjustment,
        awayAdjustment
      });
    }

    // Drive Efficiency Impact - Critical for close games
    if (homeMetrics.driveEfficiency !== null && awayMetrics.driveEfficiency !== null) {
      const driveEfficiencyDiff = (homeMetrics.driveEfficiency || 0) - (awayMetrics.driveEfficiency || 0);
      const driveAdjustment = driveEfficiencyDiff * 12; // Drive efficiency strongly correlates to scoring
      
      if (!isNaN(driveAdjustment)) {
        homeScore += driveAdjustment;
        awayScore -= driveAdjustment;
      }
      
      predictionDebugger.log('DRIVE_EFFICIENCY', 'Applied drive efficiency adjustment', 'info', {
        homeDriveEff: homeMetrics.driveEfficiency,
        awayDriveEff: awayMetrics.driveEfficiency,
        driveEfficiencyDiff,
        driveAdjustment
      });
    }

    // Scoring Drive Rate - More granular than just drive efficiency
    if (homeMetrics.scoringDriveRate !== null && awayMetrics.scoringDriveRate !== null) {
      const scoringRateDiff = (homeMetrics.scoringDriveRate || 0) - (awayMetrics.scoringDriveRate || 0);
      const scoringAdjustment = scoringRateDiff * 8; // Direct impact on scoring potential
      
      if (!isNaN(scoringAdjustment)) {
        homeScore += scoringAdjustment;
        awayScore -= scoringAdjustment;
      }
      
      predictionDebugger.log('SCORING_DRIVES', 'Applied scoring drive rate adjustment', 'info', {
        homeScoringRate: homeMetrics.scoringDriveRate,
        awayScoringRate: awayMetrics.scoringDriveRate,
        scoringRateDiff,
        scoringAdjustment
      });
    }

    // Red Zone Conversion Rate - Critical for finishing drives
    if (homeMetrics.redZoneConversionRate !== null && awayMetrics.redZoneConversionRate !== null) {
      const redZoneDiff = (homeMetrics.redZoneConversionRate || 0) - (awayMetrics.redZoneConversionRate || 0);
      const redZoneAdjustment = redZoneDiff * 6; // Red zone efficiency impact
      
      if (!isNaN(redZoneAdjustment)) {
        homeScore += redZoneAdjustment;
        awayScore -= redZoneAdjustment;
      }
      
      predictionDebugger.log('RED_ZONE', 'Applied red zone conversion adjustment', 'info', {
        homeRedZone: homeMetrics.redZoneConversionRate,
        awayRedZone: awayMetrics.redZoneConversionRate,
        redZoneDiff,
        redZoneAdjustment
      });
    }
    
    // ELO Rating adjustments (more accurate than SP+ alone)
    if (homeMetrics.eloRating && awayMetrics.eloRating) {
      const eloDiff = (homeMetrics.eloRating || 1500) - (awayMetrics.eloRating || 1500);
      const eloAdjustment = eloDiff * 0.02; // ELO differential impact
      
      if (!isNaN(eloAdjustment)) {
        homeScore += eloAdjustment;
        awayScore -= eloAdjustment;
      }
      
      predictionDebugger.log('ELO_ADJUSTMENT', 'Applied ELO rating adjustment', 'info', {
        eloDiff,
        eloAdjustment,
        homeElo: homeMetrics.eloRating,
        awayElo: awayMetrics.eloRating
      });
    }
    
    // Talent composite adjustments
    if (homeMetrics.talentComposite && awayMetrics.talentComposite) {
      const talentDiff = (homeMetrics.talentComposite || 0) - (awayMetrics.talentComposite || 0);
      const talentAdjustment = talentDiff * 0.15;
      
      if (!isNaN(talentAdjustment)) {
        homeScore += talentAdjustment;
        awayScore -= talentAdjustment;
      }
      
      predictionDebugger.log('TALENT_ADJUSTMENT', 'Applied talent composite adjustment', 'info', {
        talentDiff,
        talentAdjustment,
        homeTalent: homeMetrics.talentComposite,
        awayTalent: awayMetrics.talentComposite
      });
    }
    
    // Transfer portal impact
    if (homeMetrics.transferPortalImpact && awayMetrics.transferPortalImpact) {
      const transferDiff = (homeMetrics.transferPortalImpact || 0) - (awayMetrics.transferPortalImpact || 0);
      const transferAdjustment = transferDiff * 0.8; // Transfer impact on scoring
      
      if (!isNaN(transferAdjustment)) {
        homeScore += transferAdjustment;
        awayScore -= transferAdjustment;
      }
      
      predictionDebugger.log('TRANSFER_ADJUSTMENT', 'Applied transfer portal impact', 'info', {
        transferDiff,
        impactAdjustment: transferAdjustment,
        homeTransferImpact: homeMetrics.transferPortalImpact,
        awayTransferImpact: awayMetrics.transferPortalImpact
      });
    }
    
    // Enhanced weather impact (more detailed from GraphQL)
    if (weatherConditions && weatherConditions.detailedConditions) {
      const enhancedWeatherImpact = this.calculateEnhancedWeatherImpact(
        weatherConditions.detailedConditions, 
        homeMetrics, 
        awayMetrics
      );
      
      const homeWeatherAdj = enhancedWeatherImpact?.home || 0;
      const awayWeatherAdj = enhancedWeatherImpact?.away || 0;
      
      if (!isNaN(homeWeatherAdj)) homeScore += homeWeatherAdj;
      if (!isNaN(awayWeatherAdj)) awayScore += awayWeatherAdj;
      
      predictionDebugger.log('WEATHER_ADJUSTMENT', 'Applied enhanced weather impact', 'info', {
        weatherConditions: weatherConditions.detailedConditions,
        homeAdjustment: homeWeatherAdj,
        awayAdjustment: awayWeatherAdj
      });
    }
    
    // Betting market efficiency (if our model disagrees with market)
    if (homeMetrics.impliedWinRate && awayMetrics.impliedWinRate) {
      const marketHomeWinRate = homeMetrics.impliedWinRate || 0.5;
      const modelHomeWinRate = this.calculateWinProbability(homeScore, awayScore, homeMetrics, awayMetrics);
      const marketDisagreement = Math.abs(modelHomeWinRate - marketHomeWinRate);
      
      // If we disagree significantly with market, increase confidence but moderate prediction
      if (marketDisagreement > 0.15) {
        // Market inefficiency detected - trust our model more
        const adjustment = marketDisagreement * 0.5;
        if (modelHomeWinRate > marketHomeWinRate) {
          if (!isNaN(adjustment)) homeScore += adjustment;
        } else {
          if (!isNaN(adjustment)) awayScore += adjustment;
        }
        
        predictionDebugger.log('MARKET_EFFICIENCY', 'Detected market disagreement - applied adjustment', 'warning', {
          marketHomeWinRate,
          modelHomeWinRate,
          marketDisagreement,
          adjustment
        });
      }
    }
    
    // Ensure reasonable bounds and handle NaN
    homeScore = isNaN(homeScore) ? 25 : Math.max(7, Math.min(75, homeScore));
    awayScore = isNaN(awayScore) ? 25 : Math.max(3, Math.min(70, awayScore));
    
    // Round to realistic numbers
    homeScore = Math.round(homeScore * 10) / 10;
    awayScore = Math.round(awayScore * 10) / 10;
    
    // Final safety check
    if (isNaN(homeScore)) homeScore = 25;
    if (isNaN(awayScore)) awayScore = 25;
    
    // Calculate enhanced derived metrics
    const total = homeScore + awayScore;
    const spread = homeScore - awayScore;
    const homeWinProb = this.calculateEnhancedWinProbability(homeScore, awayScore, homeMetrics, awayMetrics);
    const awayWinProb = 1 - homeWinProb;
    
    // Safety check for win probabilities
    const safeHomeWinProb = isNaN(homeWinProb) || homeWinProb === null || homeWinProb === undefined ? 0.5 : homeWinProb;
    const safeAwayWinProb = isNaN(awayWinProb) || awayWinProb === null || awayWinProb === undefined ? 0.5 : awayWinProb;
    
    // Final data integrity check before any calculations
    const finalHomeScore = isNaN(homeScore) || homeScore === null ? 25 : homeScore;
    const finalAwayScore = isNaN(awayScore) || awayScore === null ? 25 : awayScore;
    const finalTotal = finalHomeScore + finalAwayScore;
    const finalSpread = finalHomeScore - finalAwayScore;
    
    predictionDebugger.log('SCORES_INTEGRITY_CHECK', 'Final scores integrity check', 'info', {
      originalHomeScore: homeScore,
      originalAwayScore: awayScore,
      finalHomeScore,
      finalAwayScore,
      homeScoreValid: !isNaN(finalHomeScore) && finalHomeScore !== null,
      awayScoreValid: !isNaN(finalAwayScore) && finalAwayScore !== null,
      totalValid: !isNaN(finalTotal),
      spreadValid: !isNaN(finalSpread)
    });
    
    // Enhanced moneyline calculation
    const homeMoneyline = this.probabilityToMoneyline(safeHomeWinProb);
    const awayMoneyline = this.probabilityToMoneyline(safeAwayWinProb);

    predictionDebugger.log('FINAL_PREDICTION', 'Enhanced prediction complete', 'success', {
      finalHomeScore: finalHomeScore,
      finalAwayScore: finalAwayScore,
      spread: finalSpread,
      total: finalTotal,
      homeWinProb: (safeHomeWinProb * 100).toFixed(1) + '%',
      awayWinProb: (safeAwayWinProb * 100).toFixed(1) + '%'
    });
    
    // Final debug check before return
    predictionDebugger.log('FINAL_SCORES_CHECK', 'Final scores before return', 'info', {
      homeScore: finalHomeScore,
      awayScore: finalAwayScore,
      total: finalTotal,
      spread: finalSpread,
      isHomeScoreValid: !isNaN(finalHomeScore) && finalHomeScore !== null && finalHomeScore !== undefined,
      isAwayScoreValid: !isNaN(finalAwayScore) && finalAwayScore !== null && finalAwayScore !== undefined
    });
    
    return {
      score: {
        home: finalHomeScore,
        away: finalAwayScore,
        total: Math.round(finalTotal * 10) / 10
      },
      spread: Math.round(finalSpread * 10) / 10,
      total: Math.round(finalTotal * 10) / 10,
      winProbability: {
        home: Math.round(safeHomeWinProb * 1000) / 10,
        away: Math.round(safeAwayWinProb * 1000) / 10
      },
      moneyline: {
        home: homeMoneyline,
        away: awayMoneyline
      },
      // Enhanced factors
      factors: {
        ...basePrediction.factors,
        eloRatingDiff: homeMetrics.eloRating && awayMetrics.eloRating ? 
          Math.round((homeMetrics.eloRating - awayMetrics.eloRating) * 10) / 10 : null,
        talentDiff: homeMetrics.talentComposite && awayMetrics.talentComposite ?
          Math.round((homeMetrics.talentComposite - awayMetrics.talentComposite) * 10) / 10 : null,
        transferImpact: homeMetrics.transferPortalImpact && awayMetrics.transferPortalImpact ?
          Math.round((homeMetrics.transferPortalImpact - awayMetrics.transferPortalImpact) * 10) / 10 : null,
        weatherImpact: weatherConditions?.severity || 'none',
        excitementIndex: Math.max(homeMetrics.excitementIndex || 0, awayMetrics.excitementIndex || 0)
      }
    };
  }

  /**
   * Enhanced weather impact calculation with detailed conditions
   */
  calculateEnhancedWeatherImpact(detailedConditions, homeMetrics, awayMetrics) {
    let homeImpact = 0;
    let awayImpact = 0;
    
    const { temperature, windSpeed, precipitation, humidity, visibility } = detailedConditions;
    
    // Temperature effects (more nuanced)
    if (temperature < 20) {
      homeImpact -= 3;
      awayImpact -= 5; // Away team more affected by extreme cold
    } else if (temperature < 35) {
      homeImpact -= 1.5;
      awayImpact -= 3;
    } else if (temperature > 95) {
      homeImpact -= 2;
      awayImpact -= 3.5; // Heat affects away team more
    }
    
    // Wind effects on passing games
    if (windSpeed > 25) {
      // Heavily impacts passing
      const homePassingImpact = (homeMetrics.yardsPerPlay || 0) > 6 ? -3 : -1;
      const awayPassingImpact = (awayMetrics.yardsPerPlay || 0) > 6 ? -3 : -1;
      homeImpact += homePassingImpact;
      awayImpact += awayPassingImpact;
    } else if (windSpeed > 15) {
      const homePassingImpact = (homeMetrics.yardsPerPlay || 0) > 6 ? -1.5 : -0.5;
      const awayPassingImpact = (awayMetrics.yardsPerPlay || 0) > 6 ? -1.5 : -0.5;
      homeImpact += homePassingImpact;
      awayImpact += awayPassingImpact;
    }
    
    // Precipitation effects
    if (precipitation) {
      if (precipitation.type === 'snow' && precipitation.intensity > 0.5) {
        homeImpact -= 2;
        awayImpact -= 4; // Snow heavily favors home team
      } else if (precipitation.type === 'rain' && precipitation.intensity > 0.3) {
        homeImpact -= 1;
        awayImpact -= 2.5;
      }
    }
    
    // Visibility effects
    if (visibility && visibility < 0.25) { // Quarter mile or less
      homeImpact -= 1;
      awayImpact -= 2.5;
    }
    
    return { home: homeImpact, away: awayImpact };
  }

  /**
   * Enhanced win probability calculation with more factors
   */
  calculateEnhancedWinProbability(homeScore, awayScore, homeMetrics, awayMetrics) {
    // Ensure we have valid input scores
    const safeHomeScore = isNaN(homeScore) || homeScore === null ? 25 : homeScore;
    const safeAwayScore = isNaN(awayScore) || awayScore === null ? 25 : awayScore;
    
    // Start with base probability
    let prob = this.calculateWinProbability(safeHomeScore, safeAwayScore, homeMetrics, awayMetrics);
    
    // Ensure base probability is valid
    if (isNaN(prob) || prob === null || prob === undefined) {
      prob = 0.5; // Default to 50-50
    }
    
    predictionDebugger.log('WIN_PROB_BASE', 'Base win probability calculated', 'info', {
      baseProb: (prob * 100).toFixed(1) + '%',
      homeScore: safeHomeScore,
      awayScore: safeAwayScore
    });
    
    // PPA-based probability adjustment (most predictive)
    if (homeMetrics.ppaOffense !== undefined && awayMetrics.ppaOffense !== undefined &&
        homeMetrics.ppaDefense !== undefined && awayMetrics.ppaDefense !== undefined) {
      
      const homeNetPPA = homeMetrics.ppaOffense - awayMetrics.ppaDefense;
      const awayNetPPA = awayMetrics.ppaOffense - homeMetrics.ppaDefense;
      const netPPADiff = homeNetPPA - awayNetPPA;
      
      // PPA has strong correlation with win probability
      const ppaWinAdjustment = netPPADiff * 0.08; // PPA impact on win probability
      prob += ppaWinAdjustment;
      
      predictionDebugger.log('WIN_PROB_PPA', 'Applied PPA adjustment to win probability', 'info', {
        netPPADiff,
        ppaWinAdjustment,
        adjustedProb: ((prob + ppaWinAdjustment) * 100).toFixed(1) + '%'
      });
    }

    // Drive efficiency impact on win probability
    if (homeMetrics.driveEfficiency !== null && awayMetrics.driveEfficiency !== null) {
      const driveEffDiff = homeMetrics.driveEfficiency - awayMetrics.driveEfficiency;
      const driveWinAdj = driveEffDiff * 0.25; // Drive efficiency impact
      prob += driveWinAdj;
      
      predictionDebugger.log('WIN_PROB_DRIVES', 'Applied drive efficiency to win probability', 'info', {
        driveEffDiff,
        driveWinAdj,
        homeEff: homeMetrics.driveEfficiency,
        awayEff: awayMetrics.driveEfficiency
      });
    }

    // Scoring drive rate impact
    if (homeMetrics.scoringDriveRate !== null && awayMetrics.scoringDriveRate !== null) {
      const scoringRateDiff = homeMetrics.scoringDriveRate - awayMetrics.scoringDriveRate;
      const scoringWinAdj = scoringRateDiff * 0.20;
      prob += scoringWinAdj;
      
      predictionDebugger.log('WIN_PROB_SCORING', 'Applied scoring rate to win probability', 'info', {
        scoringRateDiff,
        scoringWinAdj
      });
    }
    
    // ELO rating adjustment
    if (homeMetrics.eloRating && awayMetrics.eloRating) {
      const eloAdj = (homeMetrics.eloRating - awayMetrics.eloRating) / 400; // ELO scale
      prob += eloAdj * 0.05;
      
      predictionDebugger.log('WIN_PROB_ELO', 'Applied ELO adjustment', 'info', {
        eloAdj,
        homeElo: homeMetrics.eloRating,
        awayElo: awayMetrics.eloRating
      });
    }
    
    // Talent composite adjustment
    if (homeMetrics.talentComposite && awayMetrics.talentComposite) {
      const talentAdj = (homeMetrics.talentComposite - awayMetrics.talentComposite) / 100;
      prob += talentAdj * 0.03;
      
      predictionDebugger.log('WIN_PROB_TALENT', 'Applied talent adjustment', 'info', {
        talentAdj,
        homeTalent: homeMetrics.talentComposite,
        awayTalent: awayMetrics.talentComposite
      });
    }
    
    // Market efficiency check
    if (homeMetrics.impliedWinRate) {
      const marketProb = homeMetrics.impliedWinRate;
      const diff = Math.abs(prob - marketProb);
      
      // If we're very different from market, moderate slightly
      if (diff > 0.2) {
        const oldProb = prob;
        prob = prob * 0.8 + marketProb * 0.2; // Blend with market
        
        predictionDebugger.log('WIN_PROB_MARKET', 'Applied market efficiency adjustment', 'warning', {
          modelProb: (oldProb * 100).toFixed(1) + '%',
          marketProb: (marketProb * 100).toFixed(1) + '%',
          finalProb: (prob * 100).toFixed(1) + '%',
          difference: diff
        });
      }
    }
    
    // Bound probability and final safety check
    let finalProb = Math.max(0.02, Math.min(0.98, prob));
    
    // Final NaN safety check
    if (isNaN(finalProb) || finalProb === null || finalProb === undefined) {
      finalProb = 0.5; // Default to 50-50 if anything goes wrong
      predictionDebugger.log('WIN_PROB_FALLBACK', 'Used fallback probability due to invalid calculation', 'warning', {
        originalProb: prob,
        fallbackProb: finalProb
      });
    }
    
    predictionDebugger.log('WIN_PROB_FINAL', 'Final enhanced win probability', 'success', {
      finalProb: (finalProb * 100).toFixed(1) + '%',
      homeScore: safeHomeScore,
      awayScore: safeAwayScore
    });
    
    return finalProb;
  }

  /**
   * Calculate head-to-head historical impact on scoring prediction
   */
  calculateHeadToHeadImpact(headToHead, homeTeam, awayTeam) {
    if (!headToHead || headToHead.totalGames < 3) {
      return { home: 0, away: 0 };
    }
    
    // Calculate historical dominance
    const homeWins = headToHead.team1Wins || 0;
    const awayWins = headToHead.team2Wins || 0;
    const totalGames = headToHead.totalGames;
    
    // Determine which team is team1 in the historical data
    const isHomeTeam1 = homeTeam.school === headToHead.team1Name;
    const effectiveHomeWins = isHomeTeam1 ? homeWins : awayWins;
    const effectiveAwayWins = isHomeTeam1 ? awayWins : homeWins;
    
    // Calculate win percentage impact (max ±2 points)
    const homeWinRate = effectiveHomeWins / totalGames;
    const winRateImpact = (homeWinRate - 0.5) * 4; // ±2 points max
    
    // Average point differential impact (max ±1.5 points)
    const avgPointDiff = headToHead.avgPointDiff || 0;
    const pointDiffImpact = isHomeTeam1 ? avgPointDiff * 0.3 : -avgPointDiff * 0.3;
    
    // Recency bias - weight recent games more heavily
    const recencyFactor = Math.min(1.0, totalGames / 10); // Full weight after 10 games
    
    const homeAdjustment = (winRateImpact + pointDiffImpact) * recencyFactor;
    
    console.log(`📚 [H2H] Historical impact: ${homeTeam.school} ${effectiveHomeWins}-${effectiveAwayWins} vs ${awayTeam.school}, adjustment: ${homeAdjustment.toFixed(1)}`);
    
    return {
      home: Math.max(-3, Math.min(3, homeAdjustment)), // Cap at ±3 points
      away: Math.max(-3, Math.min(3, -homeAdjustment))
    };
  }

  /**
   * Generate comprehensive analysis
   */
  generateAnalysis({ homeTeam, awayTeam, homeMetrics, awayMetrics, prediction, headToHead, options }) {
    const analysis = {
      summary: this.generateSummary(homeTeam, awayTeam, prediction),
      keyFactors: this.identifyKeyFactors(homeMetrics, awayMetrics, prediction),
      teamAnalysis: {
        home: this.generateTeamAnalysis(homeTeam, homeMetrics, 'home'),
        away: this.generateTeamAnalysis(awayTeam, awayMetrics, 'away')
      },
      matchupEdges: this.identifyMatchupEdges(homeMetrics, awayMetrics),
      historicalContext: this.analyzeHistoricalContext(headToHead),
      situationalFactors: this.analyzeSituationalFactors(options),
      confidenceFactors: this.getConfidenceFactors(homeMetrics, awayMetrics, prediction),
      bettingInsights: this.generateBettingInsights(prediction, homeMetrics, awayMetrics)
    };

    return analysis;
  }

  /**
   * Generate game summary
   */
  generateSummary(homeTeam, awayTeam, prediction) {
    const favorite = prediction.spread > 0 ? homeTeam.school : awayTeam.school;
    const favoriteBy = Math.abs(prediction.spread);
    const total = prediction.total;
    const homeProb = prediction.winProbability.home;

    let gameType = 'competitive';
    if (favoriteBy >= 14) gameType = 'blowout potential';
    else if (favoriteBy >= 7) gameType = 'comfortable favorite';
    else if (favoriteBy >= 3) gameType = 'slight favorite';
    else gameType = 'toss-up';

    let scoringExpectation = 'moderate';
    if (total >= 65) scoringExpectation = 'high-scoring';
    else if (total >= 55) scoringExpectation = 'above-average scoring';
    else if (total <= 45) scoringExpectation = 'low-scoring';

    return {
      gameType,
      scoringExpectation,
      favorite,
      favoriteBy: Math.round(favoriteBy * 10) / 10,
      description: `${favorite} is favored by ${favoriteBy.toFixed(1)} points in what projects to be a ${gameType} ${scoringExpectation} game with a total of ${total.toFixed(1)} points. ${homeTeam.school} has a ${homeProb.toFixed(1)}% chance to win at home.`
    };
  }

  /**
   * Identify key factors driving the prediction
   */
  identifyKeyFactors(homeMetrics, awayMetrics, prediction) {
    const factors = [];

    // SP+ differential
    const spDiff = homeMetrics.spRating - awayMetrics.spRating;
    if (Math.abs(spDiff) >= 5) {
      factors.push({
        factor: 'Team Quality Gap',
        impact: spDiff > 0 ? 'Favors Home' : 'Favors Away',
        strength: Math.abs(spDiff) >= 10 ? 'Strong' : 'Moderate',
        description: `SP+ rating differential of ${spDiff.toFixed(1)} points indicates ${Math.abs(spDiff) >= 10 ? 'significant' : 'notable'} talent gap`
      });
    }

    // Recent form
    const formDiff = homeMetrics.recentForm - awayMetrics.recentForm;
    if (Math.abs(formDiff) >= 7) {
      factors.push({
        factor: 'Recent Form',
        impact: formDiff > 0 ? 'Favors Home' : 'Favors Away',
        strength: Math.abs(formDiff) >= 14 ? 'Strong' : 'Moderate',
        description: `Recent point differential gap of ${Math.abs(formDiff).toFixed(1)} points per game`
      });
    }

    // Offensive vs Defensive matchup
    const offVsDef = homeMetrics.offensiveEfficiency - awayMetrics.defensiveEfficiency;
    const defVsOff = homeMetrics.defensiveEfficiency - awayMetrics.offensiveEfficiency;
    
    if (offVsDef >= 0.3) {
      factors.push({
        factor: 'Home Offensive Advantage',
        impact: 'Favors Home',
        strength: offVsDef >= 0.5 ? 'Strong' : 'Moderate',
        description: 'Home team\'s offense significantly better than away team\'s defense'
      });
    }

    if (defVsOff >= 0.3) {
      factors.push({
        factor: 'Home Defensive Advantage',
        impact: 'Favors Home',
        strength: defVsOff >= 0.5 ? 'Strong' : 'Moderate',
        description: 'Home team\'s defense significantly better than away team\'s offense'
      });
    }

    // Home field advantage
    if (homeMetrics.homeFieldAdvantage >= 4.5) {
      factors.push({
        factor: 'Strong Home Field',
        impact: 'Favors Home',
        strength: 'Moderate',
        description: `Home team has strong home field advantage worth ${homeMetrics.homeFieldAdvantage.toFixed(1)} points`
      });
    }

    return factors.slice(0, 5); // Top 5 factors
  }

  /**
   * Generate team-specific analysis
   */
  generateTeamAnalysis(team, metrics, side) {
    const strengths = [];
    const weaknesses = [];
    const keyStats = [];

    // Safely access metrics with fallbacks
    const avgPointsScored = metrics.avgPointsScored || 0;
    const avgPointsAllowed = metrics.avgPointsAllowed || 0;
    const winPercentage = metrics.winPercentage || 0;
    const offensiveEfficiency = metrics.offensiveEfficiency || 0;
    const defensiveEfficiency = metrics.defensiveEfficiency || 0;
    const redZoneScoring = metrics.redZoneScoring || 0;
    const redZoneDefense = metrics.redZoneDefense || 0;
    const turnoverMargin = metrics.turnoverMargin || 0;
    const recentWinPct = metrics.recentWinPct || 0;

    // Identify strengths
    if (offensiveEfficiency >= 0.6) strengths.push('Elite Offense');
    else if (offensiveEfficiency >= 0.4) strengths.push('Strong Offense');
    
    if (defensiveEfficiency >= 0.6) strengths.push('Elite Defense');
    else if (defensiveEfficiency >= 0.4) strengths.push('Strong Defense');
    
    if (redZoneScoring >= 0.7) strengths.push('Red Zone Efficiency');
    if (turnoverMargin >= 0.5) strengths.push('Turnover Creation');
    if (recentWinPct >= 0.8) strengths.push('Hot Streak');

    // Identify weaknesses
    if (offensiveEfficiency <= 0.3) weaknesses.push('Struggling Offense');
    if (defensiveEfficiency <= 0.3) weaknesses.push('Poor Defense');
    if (redZoneDefense <= 0.4) weaknesses.push('Red Zone Defense');
    if (turnoverMargin <= -0.5) weaknesses.push('Turnover Issues');
    if (recentWinPct <= 0.3) weaknesses.push('Poor Recent Form');

    // Key stats with safe access
    keyStats.push({
      label: 'Points Per Game',
      value: avgPointsScored.toFixed(1),
      rank: this.getRankFromValue(avgPointsScored, 45, 20)
    });
    
    keyStats.push({
      label: 'Points Allowed',
      value: avgPointsAllowed.toFixed(1),
      rank: this.getRankFromValue(avgPointsAllowed, 15, 35, true)
    });
    
    keyStats.push({
      label: 'Win Percentage',
      value: `${(winPercentage * 100).toFixed(1)}%`,
      rank: this.getRankFromValue(winPercentage, 0.8, 0.4)
    });

    return {
      strengths: strengths.slice(0, 3),
      weaknesses: weaknesses.slice(0, 3),
      keyStats,
      overall: this.getOverallGrade(metrics),
      trend: this.getTrend(metrics)
    };
  }

  /**
   * Identify specific matchup edges
   */
  identifyMatchupEdges(homeMetrics, awayMetrics) {
    const edges = [];

    // Safely access metrics with fallbacks
    const homeOffEff = homeMetrics?.offensiveEfficiency || 0;
    const awayOffEff = awayMetrics?.offensiveEfficiency || 0;
    const homeDefEff = homeMetrics?.defensiveEfficiency || 0;
    const awayDefEff = awayMetrics?.defensiveEfficiency || 0;

    // Offensive vs Defensive matchups
    const homeOffVsAwayDef = homeOffEff - awayDefEff;
    const awayOffVsHomeDef = awayOffEff - homeDefEff;

    if (homeOffVsAwayDef >= 0.2) {
      edges.push({
        type: 'Offensive Mismatch',
        favors: 'Home',
        strength: homeOffVsAwayDef >= 0.4 ? 'Major' : 'Moderate',
        description: 'Home team offense vs Away team defense'
      });
    }

    if (awayOffVsHomeDef >= 0.2) {
      edges.push({
        type: 'Offensive Mismatch',
        favors: 'Away',
        strength: awayOffVsHomeDef >= 0.4 ? 'Major' : 'Moderate',
        description: 'Away team offense vs Home team defense'
      });
    }

    // Special situations
    const redZoneDiff = homeMetrics.redZoneScoring - awayMetrics.redZoneDefense;
    if (Math.abs(redZoneDiff) >= 0.2) {
      edges.push({
        type: 'Red Zone Edge',
        favors: redZoneDiff > 0 ? 'Home' : 'Away',
        strength: Math.abs(redZoneDiff) >= 0.3 ? 'Major' : 'Moderate',
        description: `${redZoneDiff > 0 ? 'Home' : 'Away'} team has red zone advantage`
      });
    }

    // Turnover battle
    const turnoverDiff = homeMetrics.turnoverMargin - awayMetrics.turnoverMargin;
    if (Math.abs(turnoverDiff) >= 1.0) {
      edges.push({
        type: 'Turnover Battle',
        favors: turnoverDiff > 0 ? 'Home' : 'Away',
        strength: Math.abs(turnoverDiff) >= 1.5 ? 'Major' : 'Moderate',
        description: `${turnoverDiff > 0 ? 'Home' : 'Away'} team much better with ball security`
      });
    }

    return edges;
  }

  /**
   * Generate enhanced betting insights with market efficiency analysis
   */
  generateBettingInsights(prediction, homeMetrics, awayMetrics) {
    const insights = [];

    // Enhanced spread analysis with market comparison
    const spreadConfidence = this.analyzeEnhancedSpreadConfidence(prediction, homeMetrics, awayMetrics);
    insights.push({
      type: 'Spread',
      recommendation: spreadConfidence.recommendation,
      confidence: spreadConfidence.confidence,
      reasoning: spreadConfidence.reasoning,
      marketEdge: spreadConfidence.marketEdge,
      valueRating: spreadConfidence.valueRating
    });

    // Enhanced total analysis with drive efficiency factors
    const totalConfidence = this.analyzeEnhancedTotalConfidence(prediction, homeMetrics, awayMetrics);
    insights.push({
      type: 'Total',
      recommendation: totalConfidence.recommendation,
      confidence: totalConfidence.confidence,
      reasoning: totalConfidence.reasoning,
      weatherImpact: totalConfidence.weatherImpact,
      paceFactors: totalConfidence.paceFactors
    });

    // Enhanced moneyline value with advanced probability models
    const mlValue = this.analyzeEnhancedMoneylineValue(prediction, homeMetrics, awayMetrics);
    if (mlValue.hasValue) {
      insights.push({
        type: 'Moneyline',
        recommendation: mlValue.recommendation,
        confidence: mlValue.confidence,
        reasoning: mlValue.reasoning,
        impliedProbability: mlValue.impliedProbability,
        modelProbability: mlValue.modelProbability,
        expectedValue: mlValue.expectedValue
      });
    }

    // NEW: PPA-based insights (most predictive)
    const ppaInsights = this.analyzePPAInsights(homeMetrics, awayMetrics);
    insights.push({
      type: 'PPA Analysis',
      recommendation: ppaInsights.recommendation,
      confidence: ppaInsights.confidence,
      reasoning: ppaInsights.reasoning,
      offensiveEdge: ppaInsights.offensiveEdge,
      defensiveEdge: ppaInsights.defensiveEdge
    });

    // NEW: Success Rate insights
    const successInsights = this.analyzeSuccessRateInsights(homeMetrics, awayMetrics);
    insights.push({
      type: 'Success Rate Analysis',
      recommendation: successInsights.recommendation,
      confidence: successInsights.confidence,
      reasoning: successInsights.reasoning,
      consistencyFactor: successInsights.consistencyFactor
    });

    return insights;
  }

  /**
   * Analyze PPA-based betting insights (most predictive metric)
   */
  analyzePPAInsights(homeMetrics, awayMetrics) {
    const homePPA = homeMetrics.ppa?.offense || 0;
    const awayPPA = awayMetrics.ppa?.offense || 0;
    const homeDefPPA = homeMetrics.ppa?.defense || 0;
    const awayDefPPA = awayMetrics.ppa?.defense || 0;

    // Calculate PPA differential (offense vs defense matchup)
    const homeOffVsAwayDef = homePPA - awayDefPPA;
    const awayOffVsHomeDef = awayPPA - homeDefPPA;
    const totalPPAEdge = homeOffVsAwayDef - awayOffVsHomeDef;

    let recommendation, confidence, reasoning;
    let offensiveEdge = 'None';
    let defensiveEdge = 'None';

    if (Math.abs(totalPPAEdge) >= 0.5) {
      confidence = 'High';
      if (totalPPAEdge > 0) {
        recommendation = 'Home Team';
        reasoning = `Home team has significant PPA advantage (${totalPPAEdge.toFixed(2)}). PPA is the most predictive metric in college football.`;
        offensiveEdge = homeOffVsAwayDef >= 0.3 ? 'Strong Home' : 'Moderate Home';
        defensiveEdge = (homeDefPPA - awayDefPPA) >= 0.3 ? 'Strong Home' : 'Moderate Home';
      } else {
        recommendation = 'Away Team';
        reasoning = `Away team has significant PPA advantage (${Math.abs(totalPPAEdge).toFixed(2)}). PPA differential strongly favors away team.`;
        offensiveEdge = awayOffVsHomeDef >= 0.3 ? 'Strong Away' : 'Moderate Away';
        defensiveEdge = (awayDefPPA - homeDefPPA) >= 0.3 ? 'Strong Away' : 'Moderate Away';
      }
    } else if (Math.abs(totalPPAEdge) >= 0.2) {
      confidence = 'Medium';
      recommendation = totalPPAEdge > 0 ? 'Home Team' : 'Away Team';
      reasoning = `Moderate PPA edge detected. ${totalPPAEdge > 0 ? 'Home' : 'Away'} team shows better advanced metrics.`;
    } else {
      confidence = 'Low';
      recommendation = 'No Strong Edge';
      reasoning = 'PPA metrics show relatively even matchup. Look to other factors for betting edge.';
    }

    return {
      recommendation,
      confidence,
      reasoning,
      offensiveEdge,
      defensiveEdge,
      totalPPAEdge: totalPPAEdge.toFixed(3)
    };
  }

  /**
   * Analyze Success Rate insights for consistency and close-game prediction
   */
  analyzeSuccessRateInsights(homeMetrics, awayMetrics) {
    const homeSuccessRate = homeMetrics.successRate?.offense || 0.5;
    const awaySuccessRate = awayMetrics.successRate?.offense || 0.5;
    const homeDefSuccess = homeMetrics.successRate?.defense || 0.5;
    const awayDefSuccess = awayMetrics.successRate?.defense || 0.5;

    const homeConsistency = homeSuccessRate + (1 - homeDefSuccess); // Good offense + good defense
    const awayConsistency = awaySuccessRate + (1 - awayDefSuccess);
    const consistencyDiff = homeConsistency - awayConsistency;

    let recommendation, confidence, reasoning;
    let consistencyFactor;

    if (Math.abs(consistencyDiff) >= 0.3) {
      confidence = 'High';
      consistencyFactor = 'Strong';
      if (consistencyDiff > 0) {
        recommendation = 'Home Team (Consistency)';
        reasoning = `Home team shows superior consistency in success rate metrics. Better suited for close game execution.`;
      } else {
        recommendation = 'Away Team (Consistency)';
        reasoning = `Away team demonstrates better consistency metrics. More reliable in crucial downs.`;
      }
    } else if (Math.abs(consistencyDiff) >= 0.15) {
      confidence = 'Medium';
      consistencyFactor = 'Moderate';
      recommendation = consistencyDiff > 0 ? 'Home Team Edge' : 'Away Team Edge';
      reasoning = `Moderate edge in success rate consistency detected for ${consistencyDiff > 0 ? 'home' : 'away'} team.`;
    } else {
      confidence = 'Low';
      consistencyFactor = 'Even';
      recommendation = 'Even Matchup';
      reasoning = 'Success rate metrics indicate evenly matched teams in terms of consistency.';
    }

    return {
      recommendation,
      confidence,
      reasoning,
      consistencyFactor,
      homeConsistency: homeConsistency.toFixed(3),
      awayConsistency: awayConsistency.toFixed(3)
    };
  }

  /**
   * Enhanced spread analysis with market efficiency
   */
  analyzeEnhancedSpreadConfidence(prediction, homeMetrics, awayMetrics) {
    const modelSpread = prediction.spread;
    const marketSpread = homeMetrics.betting?.averageSpread || modelSpread;
    const spreadDifference = Math.abs(modelSpread - marketSpread);
    
    let marketEdge = 'None';
    let valueRating = 'No Value';
    let confidence, recommendation, reasoning;

    // Market disagreement analysis
    if (spreadDifference >= 3) {
      marketEdge = 'Strong';
      valueRating = 'High Value';
      confidence = 'High';
      
      if (modelSpread > marketSpread) {
        recommendation = 'Take Home (Model favors home more than market)';
        reasoning = `Model predicts home team by ${modelSpread.toFixed(1)}, market has ${marketSpread.toFixed(1)}. Significant value on home team.`;
      } else {
        recommendation = 'Take Away (Model favors away more than market)';
        reasoning = `Model predicts away team performance better than market suggests. Value on away team.`;
      }
    } else if (spreadDifference >= 1.5) {
      marketEdge = 'Moderate';
      valueRating = 'Moderate Value';
      confidence = 'Medium';
      recommendation = modelSpread > marketSpread ? 'Lean Home' : 'Lean Away';
      reasoning = `Moderate disagreement with market provides some betting value.`;
    } else {
      marketEdge = 'Minimal';
      valueRating = 'Low Value';
      confidence = 'Low';
      recommendation = 'No Strong Play';
      reasoning = 'Model and market largely agree on spread. Limited betting value.';
    }

    return {
      recommendation,
      confidence,
      reasoning,
      marketEdge,
      valueRating,
      modelSpread: modelSpread.toFixed(1),
      marketSpread: marketSpread.toFixed(1),
      difference: spreadDifference.toFixed(1)
    };
  }

  /**
   * Enhanced total analysis with pace and efficiency factors
   */
  analyzeEnhancedTotalConfidence(prediction, homeMetrics, awayMetrics) {
    const modelTotal = prediction.total;
    const homePace = homeMetrics.advanced?.pace || 65; // plays per game
    const awayPace = awayMetrics.advanced?.pace || 65;
    const avgPace = (homePace + awayPace) / 2;
    
    // Weather impact
    const weatherImpact = this.calculateWeatherTotalImpact(prediction.factors?.weatherImpact);
    
    // Pace factors
    let paceFactors = 'Average';
    if (avgPace >= 75) paceFactors = 'Fast';
    else if (avgPace <= 55) paceFactors = 'Slow';

    let recommendation, confidence, reasoning;

    // Enhanced total analysis
    const adjustedTotal = modelTotal + weatherImpact;
    
    if (paceFactors === 'Fast' && weatherImpact <= -3) {
      recommendation = 'Under (Fast pace offset by weather)';
      confidence = 'Medium';
      reasoning = 'Fast-paced teams but weather conditions favor under';
    } else if (paceFactors === 'Fast' && weatherImpact >= -1) {
      recommendation = 'Over (Fast pace, good conditions)';
      confidence = 'High';
      reasoning = 'Fast-paced matchup with favorable scoring conditions';
    } else if (paceFactors === 'Slow' && weatherImpact <= -2) {
      recommendation = 'Under (Slow pace + weather)';
      confidence = 'High';
      reasoning = 'Multiple factors pointing to low-scoring game';
    } else {
      recommendation = 'No Strong Play';
      confidence = 'Low';
      reasoning = 'Mixed signals on total points';
    }

    return {
      recommendation,
      confidence,
      reasoning,
      weatherImpact: weatherImpact.toFixed(1),
      paceFactors,
      adjustedTotal: adjustedTotal.toFixed(1)
    };
  }

  /**
   * Enhanced moneyline analysis with expected value calculation
   */
  analyzeEnhancedMoneylineValue(prediction, homeMetrics, awayMetrics) {
    const modelHomeWinProb = prediction.winProbability.home / 100;
    const marketHomeWinProb = homeMetrics.betting?.impliedWinRate || 0.5;
    
    const homeMoneyline = prediction.moneyline.home;
    const awayMoneyline = prediction.moneyline.away;
    
    // Calculate expected value
    const homeEV = this.calculateExpectedValue(modelHomeWinProb, homeMoneyline);
    const awayEV = this.calculateExpectedValue(1 - modelHomeWinProb, awayMoneyline);
    
    const probabilityDiff = Math.abs(modelHomeWinProb - marketHomeWinProb);
    
    let hasValue = false;
    let recommendation, confidence, reasoning;
    let expectedValue = 0;

    if (homeEV > 5) {
      hasValue = true;
      recommendation = 'Home Moneyline';
      confidence = 'High';
      reasoning = `Strong positive expected value on home team (${homeEV.toFixed(1)}%)`;
      expectedValue = homeEV;
    } else if (awayEV > 5) {
      hasValue = true;
      recommendation = 'Away Moneyline';
      confidence = 'High';
      reasoning = `Strong positive expected value on away team (${awayEV.toFixed(1)}%)`;
      expectedValue = awayEV;
    } else if (homeEV > 2 || awayEV > 2) {
      hasValue = true;
      recommendation = homeEV > awayEV ? 'Home Moneyline' : 'Away Moneyline';
      confidence = 'Medium';
      reasoning = `Moderate expected value detected (${Math.max(homeEV, awayEV).toFixed(1)}%)`;
      expectedValue = Math.max(homeEV, awayEV);
    }

    return {
      hasValue,
      recommendation,
      confidence,
      reasoning,
      impliedProbability: marketHomeWinProb.toFixed(3),
      modelProbability: modelHomeWinProb.toFixed(3),
      expectedValue: expectedValue.toFixed(1),
      homeEV: homeEV.toFixed(1),
      awayEV: awayEV.toFixed(1)
    };
  }

  /**
   * Calculate expected value for betting
   */
  calculateExpectedValue(winProbability, odds) {
    if (odds > 0) {
      // Positive odds (underdog)
      return (winProbability * odds) - ((1 - winProbability) * 100);
    } else {
      // Negative odds (favorite)
      return (winProbability * (100 / Math.abs(odds)) * 100) - ((1 - winProbability) * 100);
    }
  }

  /**
   * Calculate weather impact on total points
   */
  calculateWeatherTotalImpact(weatherSeverity) {
    switch (weatherSeverity) {
      case 'extreme': return -8;
      case 'severe': return -5;
      case 'moderate': return -2;
      case 'light': return -1;
      default: return 0;
    }
  }

  // Helper methods for calculations
  calculateAverage(values) {
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  calculateWinProbability(homeScore, awayScore, homeMetrics, awayMetrics) {
    // Safely handle null/undefined values
    const safeHomeScore = homeScore || 0;
    const safeAwayScore = awayScore || 0;
    const homeSpRating = homeMetrics?.spRating || 0;
    const awaySpRating = awayMetrics?.spRating || 0;
    const homeRecentWinPct = homeMetrics?.recentWinPct || 0.5;
    const awayRecentWinPct = awayMetrics?.recentWinPct || 0.5;
    
    const scoreDiff = safeHomeScore - safeAwayScore;
    const strengthDiff = (homeSpRating - awaySpRating) / 10;
    
    // Base probability from score differential
    let prob = 0.5 + (scoreDiff / 35);
    
    // Adjust for team strength
    prob += strengthDiff * 0.05;
    
    // Adjust for recent form
    const formDiff = (homeRecentWinPct - awayRecentWinPct);
    prob += formDiff * 0.1;
    
    // Bound between 0.05 and 0.95
    return Math.max(0.05, Math.min(0.95, prob));
  }

  probabilityToMoneyline(probability) {
    if (probability >= 0.5) {
      return Math.round(-probability / (1 - probability) * 100);
    } else {
      return Math.round((1 - probability) / probability * 100);
    }
  }

  calculateConfidence(prediction, homeMetrics, awayMetrics) {
    let confidence = 0.7; // Base confidence

    // Safely access metrics with fallbacks
    const homeGames = homeMetrics?.totalGames || 0;
    const awayGames = awayMetrics?.totalGames || 0;
    const homeSpRating = homeMetrics?.spRating || 0;
    const awaySpRating = awayMetrics?.spRating || 0;
    const spread = prediction?.spread || 0;

    // Data quality
    const dataQuality = Math.min(homeGames, awayGames);
    if (dataQuality >= 10) confidence += 0.1;
    else if (dataQuality <= 5) confidence -= 0.1;

    // Prediction certainty
    const spreadAbs = Math.abs(spread);
    if (spreadAbs >= 10) confidence += 0.1;
    else if (spreadAbs <= 3) confidence -= 0.05;

    // Team strength differential
    const strengthDiff = Math.abs(homeSpRating - awaySpRating);
    if (strengthDiff >= 10) confidence += 0.1;
    else if (strengthDiff <= 3) confidence -= 0.05;

    return Math.max(0.4, Math.min(0.95, confidence));
  }

  // Placeholder implementations for data loading methods
  async loadSPRatings() {
    // This method is now replaced by direct teamService calls in loadFallbackData
    // Keeping for backward compatibility
    console.warn('loadSPRatings is deprecated, use teamService.getSPRatings instead');
    return await teamService.getSPRatings(2024);
  }

  async loadRecruitingData() {
    // This method is now replaced by direct teamService calls in loadFallbackData
    // Keeping for backward compatibility
    console.warn('loadRecruitingData is deprecated, use teamService.getRecruitingRankings instead');
    return await teamService.getRecruitingRankings(2024);
  }

  /**
   * Calculate offensive efficiency from season statistics
   */
  calculateOffensiveEfficiencyFromStats(seasonStats) {
    if (!seasonStats) return 0.5;
    
    const totalYards = seasonStats.totalYards || 0;
    const games = seasonStats.games || 1;
    const yardsPerGame = totalYards / games;
    
    // Normalize based on typical FBS averages (around 400-450 yards per game)
    return Math.min(1.0, Math.max(0.0, (yardsPerGame - 200) / 400));
  }

  /**
   * Calculate defensive efficiency from season statistics  
   */
  calculateDefensiveEfficiencyFromStats(seasonStats) {
    if (!seasonStats) return 0.5;
    
    // Defensive efficiency is inverse - lower yards allowed = better
    const totalYardsAllowed = seasonStats.totalYardsAllowed || seasonStats.totalYards || 0;
    const games = seasonStats.games || 1;
    const yardsAllowedPerGame = totalYardsAllowed / games;
    
    // Normalize - lower is better for defense
    return Math.min(1.0, Math.max(0.0, 1.0 - (yardsAllowedPerGame - 200) / 400));
  }

  async getTeamHistory(teamId) {
    try {
      console.log(`📊 [API DEBUG] Attempting to fetch team history for team ${teamId}...`);
      
      // First try to get the team name from our teams map
      const team = this.teams.get(teamId);
      const teamName = team?.school || teamId;
      
      console.log(`📊 [API DEBUG] Fetching games for team: ${teamName}`);
      
      // Get team's games from game service (this handles GraphQL/REST fallback internally)
      const games = await gameService.getGamesByTeam(teamName, 2024);
      
      console.log(`✅ [API DEBUG] Successfully fetched ${games.length} games for team ${teamName}`);
      
      if (!games || games.length === 0) {
        console.warn(`⚠️ [API DEBUG] No games found for team ${teamName}, generating mock data`);
        return this.generateMockTeamHistory();
      }
      
      // Transform games into the expected format with proper field mapping
      const transformedGames = games.map(game => {
        // Determine if this team was home or away
        const isHome = game.homeTeam === teamName || game.home_team === teamName;
        
        // Get points scored and allowed
        const pointsScored = isHome ? 
          (game.homePoints || game.home_points || 0) : 
          (game.awayPoints || game.away_points || 0);
        const pointsAllowed = isHome ? 
          (game.awayPoints || game.away_points || 0) : 
          (game.homePoints || game.home_points || 0);
        
        // Determine win/loss
        const isWin = pointsScored > pointsAllowed;
        
        // Get opponent name
        const opponent = isHome ? 
          (game.awayTeam || game.away_team) : 
          (game.homeTeam || game.home_team);
        
        return {
          isWin,
          pointsScored,
          pointsAllowed,
          isHome,
          opponent,
          week: game.week,
          season: game.season || game.year || 2024,
          // Additional context for enhanced metrics
          gameId: game.id,
          neutralSite: game.neutralSite || game.neutral_site || false,
          conferenceGame: game.conferenceGame || game.conference_game || false,
          excitementIndex: game.excitement || game.excitementIndex || 0
        };
      }).filter(game => 
        // Filter out games with invalid data
        game.pointsScored !== undefined && 
        game.pointsAllowed !== undefined &&
        !isNaN(game.pointsScored) && 
        !isNaN(game.pointsAllowed)
      );
      
      console.log(`✅ [API DEBUG] Transformed ${transformedGames.length} valid games for team ${teamName}`);
      
      if (transformedGames.length === 0) {
        console.warn(`⚠️ [API DEBUG] No valid games after transformation for team ${teamName}, using mock data`);
        return this.generateMockTeamHistory();
      }
      
      return transformedGames;
      
    } catch (error) {
      console.error('❌ [API DEBUG] Error loading team history for team', teamId, '- using mock data:', error);
      // Return mock data for development - this prevents the prediction from failing
      console.log('🔄 [API DEBUG] Generating mock team history to prevent prediction failure');
      return this.generateMockTeamHistory();
    }
  }

  generateMockTeamHistory() {
    console.log('🔄 [API DEBUG] Generating enhanced mock team history...');
    // Generate more realistic mock team history based on CFB patterns
    const games = [];
    
    // Determine team tier based on name hash for consistency
    const teamHash = Math.random() * 1000; // This would use actual team name in real scenario
    let teamTier;
    
    if (teamHash % 100 < 15) {
      teamTier = 'elite'; // Top 15%
    } else if (teamHash % 100 < 35) {
      teamTier = 'good'; // Next 20%
    } else if (teamHash % 100 < 65) {
      teamTier = 'average'; // Middle 30%
    } else {
      teamTier = 'struggling'; // Bottom 35%
    }
    
    // Set performance parameters based on tier
    let baseOffense, baseDefense, winRate, variance;
    switch (teamTier) {
      case 'elite':
        baseOffense = 35; baseDefense = 18; winRate = 0.75; variance = 12;
        break;
      case 'good':
        baseOffense = 28; baseDefense = 23; winRate = 0.60; variance = 14;
        break;
      case 'average':
        baseOffense = 24; baseDefense = 26; winRate = 0.50; variance = 16;
        break;
      default: // struggling
        baseOffense = 19; baseDefense = 32; winRate = 0.30; variance = 18;
    }
    
    console.log(`🎯 [MOCK] Generating ${teamTier} team profile: ${baseOffense}/${baseDefense} avg, ${(winRate*100).toFixed(0)}% target win rate`);
    
    for (let i = 0; i < 12; i++) {
      // Generate realistic scores with some variance
      const offenseVariance = (Math.random() - 0.5) * variance;
      const defenseVariance = (Math.random() - 0.5) * (variance * 0.7);
      
      const pointsScored = Math.max(0, Math.round(baseOffense + offenseVariance));
      const pointsAllowed = Math.max(0, Math.round(baseDefense + defenseVariance));
      
      // Adjust win probability based on team tier
      const shouldWin = Math.random() < winRate;
      const adjustedPointsScored = shouldWin ? 
        Math.max(pointsScored, pointsAllowed + 1 + Math.floor(Math.random() * 10)) : 
        pointsScored;
      
      games.push({
        isWin: adjustedPointsScored > pointsAllowed,
        pointsScored: adjustedPointsScored,
        pointsAllowed: pointsAllowed,
        isHome: Math.random() > 0.5,
        week: i + 1,
        opponent: `Mock Team ${i + 1}`,
        excitementIndex: Math.random() * 10,
        // Add some context for better metrics
        neutralSite: Math.random() < 0.1, // 10% neutral site games
        conferenceGame: Math.random() < 0.6 // 60% conference games
      });
    }
    
    const actualWinRate = games.filter(g => g.isWin).length / games.length;
    const avgScored = games.reduce((sum, g) => sum + g.pointsScored, 0) / games.length;
    const avgAllowed = games.reduce((sum, g) => sum + g.pointsAllowed, 0) / games.length;
    
    console.log(`✅ [MOCK] Generated ${games.length} games: ${(actualWinRate*100).toFixed(1)}% wins, ${avgScored.toFixed(1)} PPG, ${avgAllowed.toFixed(1)} PAPG`);
    return games;
  }

  async getHeadToHeadHistory(team1Id, team2Id) {
    try {
      // This would query for head-to-head games between the teams
      // For now, return mock data
      return {
        games: [],
        team1Wins: Math.floor(Math.random() * 5),
        team2Wins: Math.floor(Math.random() * 5)
      };
    } catch (error) {
      console.error('Error loading head-to-head history:', error);
      return { games: [], team1Wins: 0, team2Wins: 0 };
    }
  }

  /**
   * Enhanced team history using GraphQL comprehensive data
   */
  async getEnhancedTeamHistory(teamId) {
    try {
      console.log(`📊 [API DEBUG] Attempting to fetch enhanced team history for team ${teamId}...`);
      
      const team = this.teams.get(teamId);
      const teamName = team?.school || teamId;
      
      // Try to get comprehensive data from GraphQL first
      if (this.graphqlAvailable) {
        try {
          console.log(`🚀 [API DEBUG] Fetching comprehensive GraphQL data for ${teamName}...`);
          
          // Use GraphQL to get enhanced game data
          const games = await gameService.getGamesByTeam(teamName, 2024, null, true); // Force GraphQL
          
          if (games && games.length > 0) {
            console.log(`✅ [API DEBUG] Successfully fetched ${games.length} enhanced games via GraphQL for ${teamName}`);
            
            return games.map(game => {
              const isHome = game.homeTeam === teamName || game.home_team === teamName;
              const pointsScored = isHome ? 
                (game.homePoints || game.home_points || 0) : 
                (game.awayPoints || game.away_points || 0);
              const pointsAllowed = isHome ? 
                (game.awayPoints || game.away_points || 0) : 
                (game.homePoints || game.home_points || 0);
              
              return {
                isWin: pointsScored > pointsAllowed,
                pointsScored,
                pointsAllowed,
                isHome,
                opponent: isHome ? 
                  (game.awayTeam || game.away_team) : 
                  (game.homeTeam || game.home_team),
                week: game.week,
                season: game.season || 2024,
                // Enhanced GraphQL data
                excitementIndex: game.excitement || game.excitementIndex || 0,
                homeStartElo: game.homeStartElo || game.home_pregame_elo || null,
                awayStartElo: game.awayStartElo || game.away_pregame_elo || null,
                homeEndElo: game.homeEndElo || game.home_postgame_elo || null,
                awayEndElo: game.awayEndElo || game.away_postgame_elo || null,
                neutralSite: game.neutralSite || game.neutral_site || false,
                conferenceGame: game.conferenceGame || game.conference_game || false,
                weather: game.weather || null,
                bettingLines: game.lines || null
              };
            }).filter(game => 
              game.pointsScored !== undefined && 
              game.pointsAllowed !== undefined &&
              !isNaN(game.pointsScored) && 
              !isNaN(game.pointsAllowed)
            );
          }
        } catch (graphqlError) {
          console.warn(`⚠️ [API DEBUG] GraphQL enhanced data fetch failed for ${teamName}:`, graphqlError.message);
        }
      }
      
      console.log(`🔄 [API DEBUG] Falling back to standard team history for ${teamName}`);
      // Fallback to original method
      return await this.getTeamHistory(teamId);
    } catch (error) {
      console.error('❌ [API DEBUG] Error loading enhanced team history for team', teamId, '- falling back to standard method:', error);
      return await this.getTeamHistory(teamId);
    }
  }

  /**
   * Enhanced head-to-head history using GraphQL
   */
  async getEnhancedHeadToHeadHistory(team1Id, team2Id) {
    try {
      const team1 = this.teams.get(team1Id);
      const team2 = this.teams.get(team2Id);
      const team1Name = team1?.school || team1Id;
      const team2Name = team2?.school || team2Id;
      
      console.log(`📊 [API DEBUG] Fetching head-to-head history: ${team1Name} vs ${team2Name}`);
      
      // Try GraphQL enhanced head-to-head query if available
      if (this.graphqlAvailable) {
        try {
          console.log(`🚀 [API DEBUG] Using improved GraphQL function for enhanced head-to-head data...`);
          
          const h2hResult = await graphqlService.getHeadToHeadHistory(team1Name, team2Name, 2024);
          
          if (h2hResult && h2hResult.games && h2hResult.games.length > 0) {
            console.log(`✅ [API DEBUG] Improved GraphQL head-to-head data found: ${h2hResult.games.length} games`);
            
            return {
              games: h2hResult.games,
              team1Wins: h2hResult.team1Wins,
              team2Wins: h2hResult.team2Wins,
              avgPointDiff: h2hResult.avgPointDiff,
              lastMeeting: h2hResult.lastMeeting,
              totalGames: h2hResult.games.length,
              averageEloDiff: h2hResult.games.length > 0 ? 
                h2hResult.games.reduce((sum, game) => sum + (game.eloRatingDiff || 0), 0) / h2hResult.games.length : 0,
              averageExcitement: h2hResult.games.length > 0 ? 
                h2hResult.games.reduce((sum, game) => sum + (game.excitementIndex || 0), 0) / h2hResult.games.length : 0
            };
          }
        } catch (graphqlError) {
          console.warn(`⚠️ [API DEBUG] GraphQL head-to-head query failed:`, graphqlError.message);
        }
      }
      
      // Fallback to REST API team matchup data
      try {
        console.log(`🔄 [API DEBUG] Using REST API for team matchup data...`);
        const matchupData = await teamService.getTeamMatchup(team1Name, team2Name, 2020, 2024);
        
        if (matchupData && matchupData.games) {
          console.log(`✅ [API DEBUG] REST matchup data found: ${matchupData.games.length} games`);
          
          // Calculate head-to-head record
          let team1Wins = 0;
          let team2Wins = 0;
          let totalPointDiff = 0;
          
          matchupData.games.forEach(game => {
            const isTeam1Home = game.homeTeam === team1Name;
            const team1Score = isTeam1Home ? game.homeScore : game.awayScore;
            const team2Score = isTeam1Home ? game.awayScore : game.homeScore;
            
            if (team1Score > team2Score) {
              team1Wins++;
            } else if (team2Score > team1Score) {
              team2Wins++;
            }
            
            totalPointDiff += (team1Score - team2Score);
          });
          
          return {
            games: matchupData.games.map(game => ({
              id: game.id,
              season: game.season,
              week: game.week,
              homeTeam: game.homeTeam,
              awayTeam: game.awayTeam,
              homeScore: game.homeScore,
              awayScore: game.awayScore,
              neutralSite: game.neutralSite || false,
              excitementIndex: 0 // Not available in REST
            })),
            team1Wins,
            team2Wins,
            avgPointDiff: matchupData.games.length > 0 ? totalPointDiff / matchupData.games.length : 0,
            lastMeeting: matchupData.games.length > 0 ? matchupData.games[matchupData.games.length - 1] : null
          };
        }
      } catch (restError) {
        console.warn(`⚠️ [API DEBUG] REST team matchup query failed:`, restError.message);
      }
      
      // Final fallback to original method
      return await this.getHeadToHeadHistory(team1Id, team2Id);
    } catch (error) {
      console.error('❌ [API DEBUG] Error loading enhanced head-to-head history:', error);
      return await this.getHeadToHeadHistory(team1Id, team2Id);
    }
  }

  /**
   * Get weather data for game location using GraphQL when available
   */
  async getWeatherData(homeTeam, options = {}) {
    try {
      // Return early if weather conditions are provided in options
      if (options.weatherConditions) {
        console.log('🌤️ [API DEBUG] Using provided weather conditions from options');
        return options.weatherConditions;
      }

      const teamName = homeTeam.school || homeTeam;
      console.log(`🌤️ [API DEBUG] Fetching weather data for ${teamName}...`);

      // Check if weather data is available in comprehensive data
      const teamData = this.comprehensiveData.get(homeTeam.id);
      if (teamData && teamData.weather) {
        console.log('📊 [API DEBUG] Using cached weather data from comprehensive data');
        return teamData.weather;
      }

      // Try GraphQL weather conditions if available
      if (this.graphqlAvailable) {
        try {
          console.log('🌤️ [API DEBUG] Attempting to fetch weather data via improved GraphQL function...');
          
          // Get team ID for weather lookup
          const teamId = homeTeam.teamId || homeTeam.id || 252; // Default to BYU if no ID
          const week = options.week || 1;
          const season = options.season || 2024;
          
          const weatherResult = await graphqlService.getWeatherConditions(teamId, week, season);
          
          if (weatherResult && weatherResult.detailedConditions) {
            console.log('✅ [API DEBUG] Weather data fetched successfully via improved GraphQL function');
            return {
              temperature: weatherResult.detailedConditions.temperature || 70,
              humidity: weatherResult.detailedConditions.humidity || 50,
              windSpeed: weatherResult.detailedConditions.windSpeed || 5,
              conditions: weatherResult.detailedConditions.weatherCondition || 'Clear',
              severity: weatherResult.severity || 'low',
              impact: this.getWeatherImpact(weatherResult.detailedConditions),
              precipitation: weatherResult.detailedConditions.precipitation || null,
              detailedConditions: weatherResult.detailedConditions,
              game: weatherResult.game
            };
          } else if (weatherResult && weatherResult.message) {
            console.log(`ℹ️ [API DEBUG] Weather message: ${weatherResult.message}`);
          }
        } catch (graphqlError) {
          console.log('❌ [API DEBUG] GraphQL weather fetch failed:', graphqlError.message);
        }
      }

      // Try REST API weather endpoint
      try {
        console.log('🌤️ [API DEBUG] Attempting to fetch weather data via REST API...');
        const games = await gameService.getGamesByTeam(teamName, options.season || 2024);
        
        // Find the most recent home game for weather context
        const homeGames = games.filter(game => 
          (game.homeTeam === teamName || game.home_team === teamName) && 
          game.week <= (options.week || 20)
        );
        
        if (homeGames.length > 0) {
          const recentGame = homeGames[homeGames.length - 1];
          if (recentGame.weather) {
            console.log('✅ [API DEBUG] Weather data found from recent game');
            return {
              temperature: recentGame.weather.temperature || 70,
              humidity: recentGame.weather.humidity || 50,
              windSpeed: recentGame.weather.windSpeed || 5,
              conditions: recentGame.weather.description || 'Clear',
              severity: this.getWeatherSeverity(recentGame.weather),
              impact: this.getWeatherImpact(recentGame.weather)
            };
          }
        }
      } catch (restError) {
        console.log('❌ [API DEBUG] REST weather fetch failed:', restError.message);
      }

      // Return default/mock weather data
      console.log('🌤️ [API DEBUG] Using default weather conditions (no API data available)');
      return {
        temperature: 70,
        humidity: 50,
        windSpeed: 5,
        conditions: 'Clear',
        severity: 'none',
        impact: 'minimal'
      };
    } catch (error) {
      console.warn('Weather data unavailable, using default conditions:', error);
      return {
        temperature: 70,
        humidity: 50,
        windSpeed: 5,
        conditions: 'Clear',
        severity: 'none',
        impact: 'minimal'
      };
    }
  }

  /**
   * Determine weather severity level
   */
  getWeatherSeverity(weather) {
    if (!weather) return 'none';
    
    const temp = weather.temperature || 70;
    const wind = weather.windSpeed || 0;
    const precipitation = weather.precipitation;
    
    if (temp < 20 || temp > 100 || wind > 25 || (precipitation && precipitation.intensity > 0.5)) {
      return 'high';
    } else if (temp < 35 || temp > 90 || wind > 15 || (precipitation && precipitation.intensity > 0.2)) {
      return 'moderate';
    }
    
    return 'low';
  }

  /**
   * Determine weather impact on game
   */
  getWeatherImpact(weather) {
    const severity = this.getWeatherSeverity(weather);
    
    switch (severity) {
      case 'high': return 'significant';
      case 'moderate': return 'moderate';
      case 'low': return 'minimal';
      default: return 'none';
    }
  }

  /**
   * Enhanced team metrics calculation with GraphQL data, REST statistics, analytics, and drive data
   */
  async calculateEnhancedTeamMetrics(team, history, teamId, analyticsData = null, driveData = null) {
    predictionDebugger.log('ENHANCED_METRICS', `Calculating enhanced metrics for ${team.school}`, 'info', {
      hasAnalytics: !!analyticsData,
      hasDrives: !!driveData,
      historySize: history?.length || 0
    });

    // Start with comprehensive base metrics
    const baseMetrics = await this.calculateTeamMetrics(team, history);
    
    try {
      // Get comprehensive metrics from your new service
      const comprehensiveMetrics = await advancedDataService.getComprehensiveMetrics(team.school, 2024);
      
      // Initialize enhanced metrics with base metrics
      const enhancedMetrics = {
        ...baseMetrics,
        
        // PPA Metrics (MOST IMPORTANT) - from analyticsService if available
        ppa: analyticsData?.ppa?.[0] || comprehensiveMetrics.ppa,
        ppaOffense: analyticsData?.ppa?.[0]?.offense || comprehensiveMetrics.ppa.offense,
        ppaDefense: analyticsData?.ppa?.[0]?.defense || comprehensiveMetrics.ppa.defense,
        
        // Success Rate Metrics (CRITICAL FOR CLOSE GAMES)
        successRate: comprehensiveMetrics.successRate,
        offensiveSuccessRate: comprehensiveMetrics.successRate.offense,
        defensiveSuccessRate: comprehensiveMetrics.successRate.defense,
        
        // Advanced Stats - enhanced with analyticsService data
        explosiveness: analyticsData?.advancedStats?.[0]?.explosiveness || comprehensiveMetrics.advanced.explosiveness,
        havocRate: analyticsData?.advancedStats?.[0]?.havoc || comprehensiveMetrics.advanced.havoc,
        stuffRate: analyticsData?.advancedStats?.[0]?.stuffRate || comprehensiveMetrics.advanced.stuffRate,
        
        // SP Ratings - from analyticsService if available
        spRating: analyticsData?.spRatings?.[0]?.rating || comprehensiveMetrics.ratings.sp.rating,
        spOffense: analyticsData?.spRatings?.[0]?.offense || comprehensiveMetrics.ratings.sp.offense,
        spDefense: analyticsData?.spRatings?.[0]?.defense || comprehensiveMetrics.ratings.sp.defense,
        
        // ELO Ratings - from analyticsService if available
        eloRating: analyticsData?.eloRatings?.[0]?.elo || comprehensiveMetrics.ratings.elo.elo,
        
        // Betting Market Data
        impliedWinRate: comprehensiveMetrics.betting.impliedWinRate,
        averageSpread: comprehensiveMetrics.betting.averageSpread,
        
        // Enhanced Drive Efficiency - from driveService if available
        driveEfficiency: this.calculateDriveEfficiency(driveData) || comprehensiveMetrics.drives.efficiency,
        averageDriveYards: this.calculateAverageDriveYards(driveData) || comprehensiveMetrics.drives.averageYards,
        scoringDriveRate: this.calculateScoringDriveRate(driveData) || 0,
        redZoneConversionRate: this.calculateRedZoneRate(driveData) || 0,
        
        // Red Zone Performance
        redZoneScoring: comprehensiveMetrics.redZone.scoring,
        redZoneDefense: comprehensiveMetrics.redZone.defense,
        
        // Transfer Portal Impact
        transferPortalImpact: comprehensiveMetrics.transfers.impact,
        
        // Enhanced Ratings
        talentComposite: comprehensiveMetrics.ratings.talent.talent
      };

      // Log the enhanced metrics for debugging
      predictionDebugger.log('ENHANCED_METRICS', `Enhanced metrics calculated for ${team.school}`, 'success', {
        ppaOffense: enhancedMetrics.ppaOffense,
        spRating: enhancedMetrics.spRating,
        eloRating: enhancedMetrics.eloRating,
        driveEfficiency: enhancedMetrics.driveEfficiency,
        scoringDriveRate: enhancedMetrics.scoringDriveRate,
        dataSource: {
          analyticsUsed: !!analyticsData,
          drivesUsed: !!driveData,
          comprehensiveUsed: true
        }
      });

      console.log(`✅ Enhanced metrics loaded for ${team.school}:`, {
        ppaOffense: enhancedMetrics.ppaOffense,
        successRate: enhancedMetrics.offensiveSuccessRate,
        explosiveness: enhancedMetrics.explosiveness,
        marketImpliedWinRate: enhancedMetrics.impliedWinRate,
        driveEfficiency: enhancedMetrics.driveEfficiency,
        spRating: enhancedMetrics.spRating,
        eloRating: enhancedMetrics.eloRating
      });

      return enhancedMetrics;
      
    } catch (error) {
      predictionDebugger.error('ENHANCED_METRICS', `Could not load enhanced metrics for ${team.school}`, error);
      console.warn(`⚠️ Could not load enhanced metrics for ${team.school}:`, error.message);
      
      // If we have analytics/drive data but comprehensive failed, use what we have
      if (analyticsData || driveData) {
        const fallbackMetrics = {
          ...baseMetrics,
          ppaOffense: analyticsData?.ppa?.[0]?.offense || 0,
          ppaDefense: analyticsData?.ppa?.[0]?.defense || 0,
          spRating: analyticsData?.spRatings?.[0]?.rating || baseMetrics.spRating,
          eloRating: analyticsData?.eloRatings?.[0]?.elo || 1500,
          driveEfficiency: this.calculateDriveEfficiency(driveData) || 0.5,
          scoringDriveRate: this.calculateScoringDriveRate(driveData) || 0,
          redZoneConversionRate: this.calculateRedZoneRate(driveData) || 0
        };
        
        predictionDebugger.log('ENHANCED_METRICS', `Enhanced metrics calculated for ${team.school}`, 'success', {
          ppaOffense: fallbackMetrics.ppaOffense,
          spRating: fallbackMetrics.spRating,
          eloRating: fallbackMetrics.eloRating,
          driveEfficiency: fallbackMetrics.driveEfficiency,
          scoringDriveRate: fallbackMetrics.scoringDriveRate,
          dataSource: {
            analyticsUsed: !!analyticsData,
            drivesUsed: !!driveData,
            comprehensiveUsed: false
          }
        });
        
        predictionDebugger.log('ENHANCED_METRICS', `Using fallback metrics with analytics/drive data for ${team.school}`, 'warning');
        return fallbackMetrics;
      }
      
      // Final fallback - ensure we have all required properties
      const finalFallback = {
        ...baseMetrics,
        ppaOffense: 0,
        ppaDefense: 0,
        spRating: baseMetrics.spRating || 0,
        eloRating: 1500,
        driveEfficiency: 0.5,
        scoringDriveRate: 0,
        redZoneConversionRate: null,
        // Ensure we have all the basic properties that generateTeamAnalysis needs
        avgPointsScored: baseMetrics.avgPointsScored || 0,
        avgPointsAllowed: baseMetrics.avgPointsAllowed || 0,
        winPercentage: baseMetrics.winPercentage || 0,
        offensiveEfficiency: baseMetrics.offensiveEfficiency || 0,
        defensiveEfficiency: baseMetrics.defensiveEfficiency || 0,
        redZoneScoring: baseMetrics.redZoneScoring || 0,
        redZoneDefense: baseMetrics.redZoneDefense || 0,
        turnoverMargin: baseMetrics.turnoverMargin || 0,
        recentWinPct: baseMetrics.recentWinPct || 0
      };
      
      predictionDebugger.log('ENHANCED_METRICS', `Enhanced metrics calculated for ${team.school}`, 'success', {
        ppaOffense: finalFallback.ppaOffense,
        spRating: finalFallback.spRating,
        eloRating: finalFallback.eloRating,
        driveEfficiency: finalFallback.driveEfficiency,
        scoringDriveRate: finalFallback.scoringDriveRate,
        dataSource: {
          analyticsUsed: false,
          drivesUsed: false,
          comprehensiveUsed: false
        }
      });
      
      return finalFallback; // Final fallback to base metrics with guaranteed properties
    }
  }

  /**
   * Calculate drive efficiency from drive data
   */
  calculateDriveEfficiency(driveData) {
    if (!driveData || !Array.isArray(driveData) || driveData.length === 0) {
      return null;
    }

    const totalDrives = driveData.length;
    const successfulDrives = driveData.filter(drive => 
      drive.drive_result === 'TD' || 
      drive.drive_result === 'FG' || 
      drive.points > 0
    ).length;

    return totalDrives > 0 ? successfulDrives / totalDrives : 0;
  }

  /**
   * Calculate average drive yards from drive data
   */
  calculateAverageDriveYards(driveData) {
    if (!driveData || !Array.isArray(driveData) || driveData.length === 0) {
      return null;
    }

    const totalYards = driveData.reduce((sum, drive) => sum + (drive.yards || 0), 0);
    return driveData.length > 0 ? totalYards / driveData.length : 0;
  }

  /**
   * Calculate scoring drive rate from drive data
   */
  calculateScoringDriveRate(driveData) {
    if (!driveData || !Array.isArray(driveData) || driveData.length === 0) {
      return null;
    }

    const totalDrives = driveData.length;
    const scoringDrives = driveData.filter(drive => 
      drive.drive_result === 'TD' || 
      drive.drive_result === 'FG' ||
      (drive.points && drive.points > 0)
    ).length;

    return totalDrives > 0 ? scoringDrives / totalDrives : 0;
  }

  /**
   * Calculate red zone conversion rate from drive data
   */
  calculateRedZoneRate(driveData) {
    if (!driveData || !Array.isArray(driveData) || driveData.length === 0) {
      return null;
    }

    const redZoneDrives = driveData.filter(drive => 
      drive.start_yardline && drive.start_yardline >= 80 // Red zone drives
    );

    if (redZoneDrives.length === 0) {
      return null;
    }

    const redZoneScores = redZoneDrives.filter(drive => 
      drive.drive_result === 'TD' || 
      drive.drive_result === 'FG' ||
      (drive.points && drive.points > 0)
    ).length;

    return redZoneScores / redZoneDrives.length;
  }

  /**
   * Get quick summary prediction (used by GamePredictor)
   */
  async getSummaryPrediction(homeTeamId, awayTeamId, options = {}) {
    try {
      predictionDebugger.log('QUICK_PREDICTION', `Starting quick prediction: ${homeTeamId} vs ${awayTeamId}`, 'info', { options });
      console.log(`🎯 [PREDICTION DEBUG] Starting prediction for ${homeTeamId} vs ${awayTeamId}`);
      
      const fullPrediction = await this.predictMatchup(homeTeamId, awayTeamId, options);
      
      console.log(`✅ [PREDICTION DEBUG] Successful prediction:`, {
        homeScore: fullPrediction.prediction.score.home,
        awayScore: fullPrediction.prediction.score.away,
        spread: fullPrediction.prediction.spread
      });

      predictionDebugger.log('QUICK_PREDICTION', 'Quick prediction completed successfully', 'success', {
        homeScore: fullPrediction.prediction.score.home,
        awayScore: fullPrediction.prediction.score.away,
        spread: fullPrediction.prediction.spread,
        confidence: fullPrediction.confidence
      });
      
      // Return simplified prediction format
      return {
        score: fullPrediction.prediction.score,
        spread: fullPrediction.prediction.spread,
        total: fullPrediction.prediction.total,
        winProbability: fullPrediction.prediction.winProbability,
        moneyline: fullPrediction.prediction.moneyline,
        confidence: fullPrediction.confidence,
        summary: fullPrediction.analysis?.summary?.description || 'Prediction complete'
      };
    } catch (error) {
      predictionDebugger.error('QUICK_PREDICTION', 'Quick prediction failed', error, { homeTeamId, awayTeamId, options });
      console.error(`❌ [PREDICTION DEBUG] Error generating prediction for ${homeTeamId} vs ${awayTeamId}:`, error);
      
      // Generate more dynamic fallback prediction instead of static scores
      const homeTeam = this.teams.get(homeTeamId);
      const awayTeam = this.teams.get(awayTeamId);
      
      // Use team names to generate different but consistent scores
      const homeNameHash = homeTeam?.school ? this.simpleHash(homeTeam.school) : Math.random();
      const awayNameHash = awayTeam?.school ? this.simpleHash(awayTeam.school) : Math.random();
      
      // Generate scores between 14-42 based on team name hash
      const homeScore = Math.round(14 + (homeNameHash % 28));
      const awayScore = Math.round(14 + (awayNameHash % 28));
      
      const spread = homeScore - awayScore;
      const total = homeScore + awayScore;
      const homeWinProb = homeScore > awayScore ? 55 + Math.random() * 20 : 25 + Math.random() * 20;
      
      console.log(`🔄 [PREDICTION DEBUG] Using dynamic fallback: ${homeScore}-${awayScore}`);
      predictionDebugger.log('FALLBACK', `Generated fallback prediction: ${homeScore}-${awayScore}`, 'warning');
      
      return {
        score: { home: homeScore, away: awayScore },
        spread: spread,
        total: total,
        winProbability: { home: Math.round(homeWinProb), away: Math.round(100 - homeWinProb) },
        moneyline: { 
          home: homeScore > awayScore ? -120 - Math.random() * 80 : 110 + Math.random() * 150,
          away: homeScore > awayScore ? 110 + Math.random() * 150 : -120 - Math.random() * 80
        },
        confidence: 0.4 + Math.random() * 0.3, // Lower confidence for fallback
        summary: `Fallback prediction (${error.message})`
      };
    }
  }

  // Simple hash function for consistent but varied fallback scores
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 1000000; // Normalize to 0-~2000 range
  }

  /**
   * Quick prediction method (used by GamePredictor)
   */
  async quickPredict(homeTeamId, awayTeamId, options = {}) {
    return await this.getSummaryPrediction(homeTeamId, awayTeamId, options);
  }

  /**
   * Get team suggestions for search (used by GamePredictor)
   */
  getTeamSuggestions(query) {
    if (!query || query.length < 2) return [];
    
    const suggestions = [];
    const lowercaseQuery = query.toLowerCase();
    
    for (const [teamId, team] of this.teams) {
      if (team.school?.toLowerCase().includes(lowercaseQuery) ||
          team.abbreviation?.toLowerCase().includes(lowercaseQuery) ||
          team.mascot?.toLowerCase().includes(lowercaseQuery)) {
        suggestions.push({
          id: teamId,
          school: team.school,
          abbreviation: team.abbreviation,
          conference: team.conference,
          logos: team.logos || []
        });
        
        if (suggestions.length >= 8) break; // Limit suggestions
      }
    }
    
    return suggestions;
  }

  /**
   * Load team data (used during initialization)
   */
  async loadTeamData() {
    try {
      const teams = await teamService.getFBSTeams(this.graphqlAvailable);
      teams.forEach(team => {
        this.teams.set(team.id, team);
      });
      console.log(`✓ Loaded ${teams.length} FBS teams`);
    } catch (error) {
      console.error('Error loading team data:', error);
    }
  }

  /**
   * Load rankings data (used during initialization)
   */
  async loadRankingsData() {
    try {
      // Load various rankings
      const rankings = await rankingsService.getAPPoll(2024);
      rankings.forEach(ranking => {
        const team = Array.from(this.teams.values()).find(t => 
          t.school?.toLowerCase() === ranking.school?.toLowerCase()
        );
        if (team) {
          team.ranking = ranking.rank;
        }
      });
      console.log('✓ Loaded rankings data');
    } catch (error) {
      console.warn('Rankings data unavailable:', error);
    }
  }

  /**
   * Load recruiting data (used during initialization)
   */
  async loadRecruitingData() {
    try {
      const recruitingData = await this.loadRecruitingData();
      recruitingData.forEach(data => {
        this.recruitingData.set(data.team, data);
      });
      console.log('✓ Loaded recruiting data');
    } catch (error) {
      console.warn('Recruiting data unavailable:', error);
    }
  }

  // Missing helper methods for calculateTeamMetrics
  async calculateSOS(team, year = 2024) {
    try {
      const games = await gameService.getGamesByTeam(team, year);
      if (!games || games.length === 0) return 0.5;
      
      let totalOpponentWinPct = 0;
      let validOpponents = 0;
      
      for (const game of games) {
        const opponent = game.homeTeam === team ? game.awayTeam : game.homeTeam;
        if (!opponent) continue;
        
        try {
          // Get opponent's season record
          const oppGames = await gameService.getGamesByTeam(opponent, year);
          if (oppGames && oppGames.length > 0) {
            const oppWins = oppGames.filter(g => {
              const isOppHome = g.homeTeam === opponent;
              const oppScore = isOppHome ? g.homePoints : g.awayPoints;
              const otherScore = isOppHome ? g.awayPoints : g.homePoints;
              return oppScore > otherScore;
            }).length;
            
            totalOpponentWinPct += (oppWins / oppGames.length);
            validOpponents++;
          }
        } catch (oppError) {
          console.warn(`Could not get record for opponent ${opponent}`);
        }
      }
      
      return validOpponents > 0 ? totalOpponentWinPct / validOpponents : 0.5;
    } catch (error) {
      console.warn('SOS calculation failed:', error);
      return 0.5;
    }
  }

  calculateHomeFieldAdvantage(games) {
    const homeGames = games.filter(g => g.isHome);
    const awayGames = games.filter(g => !g.isHome);
    
    if (homeGames.length === 0 || awayGames.length === 0) return 6.5; // INCREASED from 3.2
    
    const homePointDiff = this.calculateAverage(
      homeGames.map(g => g.pointsScored - g.pointsAllowed)
    );
    const awayPointDiff = this.calculateAverage(
      awayGames.map(g => g.pointsScored - g.pointsAllowed)
    );
    
    const hfa = homePointDiff - awayPointDiff;
    
    // Enhanced HFA range: 3.0 to 10.0 points (was 1.0 to 6.0)
    return Math.max(3.0, Math.min(10.0, hfa + 6.5));
  }

  calculateOffensiveEfficiency(games) {
    // Calculate offensive efficiency (0-1 scale)
    if (!games || games.length === 0) return 0.5;
    
    const avgPoints = this.calculateAverage(games.map(g => g.pointsScored));
    // Normalize to 0-1 scale (assumes 0-70 point range)
    return Math.max(0, Math.min(1, avgPoints / 50));
  }

  calculateDefensiveEfficiency(games) {
    // Calculate defensive efficiency (0-1 scale, higher is better)
    if (!games || games.length === 0) return 0.5;
    
    const avgPointsAllowed = this.calculateAverage(games.map(g => g.pointsAllowed));
    // Invert scale - lower points allowed = higher efficiency
    return Math.max(0, Math.min(1, 1 - (avgPointsAllowed / 50)));
  }

  calculateRedZoneEfficiency(games, type) {
    // Calculate red zone efficiency (mock implementation)
    if (!games || games.length === 0) return 0.5;
    
    // In real implementation, would need red zone attempt/success data
    // For now, correlate with overall scoring
    const efficiency = type === 'offense' ? 
      this.calculateOffensiveEfficiency(games) : 
      this.calculateDefensiveEfficiency(games);
    
    return Math.max(0.2, Math.min(0.9, efficiency + (Math.random() - 0.5) * 0.2));
  }

  calculateTurnoverMargin(games) {
    // Calculate turnover margin (mock implementation)
    if (!games || games.length === 0) return 0;
    
    // In real implementation, would need turnover data
    // For now, correlate with win/loss record
    const winPct = games.filter(g => g.isWin).length / games.length;
    return (winPct - 0.5) * 2; // Range roughly -1 to +1
  }

  calculateWeatherImpact(weatherConditions) {
    // Basic weather impact calculation
    if (!weatherConditions) return { home: 0, away: 0 };
    
    let homeImpact = 0;
    let awayImpact = 0;
    
    // Temperature effects
    if (weatherConditions.temperature < 32) {
      homeImpact -= 1;
      awayImpact -= 2; // Away team more affected
    }
    
    // Wind effects
    if (weatherConditions.windSpeed > 20) {
      homeImpact -= 1.5;
      awayImpact -= 2;
    }
    
    // Precipitation effects
    if (weatherConditions.precipitation > 0.1) {
      homeImpact -= 1;
      awayImpact -= 1.5;
    }
    
    return { home: homeImpact, away: awayImpact };
  }

  // Missing helper methods for analysis
  getRankFromValue(value, excellent, poor, inverse = false) {
    // Convert a value to a ranking (mock implementation)
    if (inverse) {
      if (value <= excellent) return 'Top 10';
      if (value <= (excellent + poor) / 2) return 'Top 25';
      if (value <= poor) return 'Top 50';
      return 'Below Average';
    } else {
      if (value >= excellent) return 'Top 10';
      if (value >= (excellent + poor) / 2) return 'Top 25';
      if (value >= poor) return 'Top 50';
      return 'Below Average';
    }
  }

  getOverallGrade(metrics) {
    // Calculate overall team grade with safe access
    const offenseGrade = (metrics?.offensiveEfficiency || 0) * 100;
    const defenseGrade = (metrics?.defensiveEfficiency || 0) * 100;
    const overallGrade = (offenseGrade + defenseGrade) / 2;
    
    if (overallGrade >= 80) return 'A';
    if (overallGrade >= 70) return 'B';
    if (overallGrade >= 60) return 'C';
    if (overallGrade >= 50) return 'D';
    return 'F';
  }

  getTrend(metrics) {
    // Calculate team trend with safe access
    const recentWinPct = metrics?.recentWinPct || 0.5;
    if (recentWinPct > 0.7) return 'Hot';
    if (recentWinPct > 0.5) return 'Stable';
    return 'Cold';
  }

  // Missing betting analysis methods
  analyzeSpreadConfidence(prediction, homeMetrics, awayMetrics) {
    const spread = prediction?.spread || 0;
    const spreadAbs = Math.abs(spread);
    const confidence = spreadAbs > 7 ? 'High' : (spreadAbs > 3 ? 'Medium' : 'Low');
    
    return {
      recommendation: spread > 0 ? 'Take Home' : 'Take Away',
      confidence,
      reasoning: `Spread confidence based on ${spreadAbs.toFixed(1)} point differential`
    };
  }

  analyzeTotalConfidence(prediction, homeMetrics, awayMetrics) {
    const homeAvgScored = homeMetrics?.avgPointsScored || 0;
    const awayAvgScored = awayMetrics?.avgPointsScored || 0;
    const homeAvgAllowed = homeMetrics?.avgPointsAllowed || 0;
    const awayAvgAllowed = awayMetrics?.avgPointsAllowed || 0;
    const predictionTotal = prediction?.total || 0;
    
    const avgCombinedPoints = (homeAvgScored + awayAvgScored + homeAvgAllowed + awayAvgAllowed) / 2;
    const totalDiff = Math.abs(predictionTotal - avgCombinedPoints);
    
    const confidence = totalDiff < 7 ? 'High' : (totalDiff < 14 ? 'Medium' : 'Low');
    const recommendation = predictionTotal > avgCombinedPoints ? 'Take Under' : 'Take Over';
    
    return {
      recommendation,
      confidence,
      reasoning: `Total analysis based on team averages vs predicted total`
    };
  }

  analyzeMoneylineValue(prediction) {
    const probDiff = Math.abs(prediction.winProbability.home - 50);
    
    if (probDiff < 10) {
      return { hasValue: false };
    }
    
    return {
      hasValue: true,
      recommendation: prediction.winProbability.home > 50 ? 'Take Home ML' : 'Take Away ML',
      confidence: probDiff > 20 ? 'High' : 'Medium',
      reasoning: `Moneyline value based on ${probDiff.toFixed(1)}% probability edge`
    };
  }

  // Missing analysis methods
  analyzeHistoricalContext(headToHead) {
    if (!headToHead || !headToHead.games || headToHead.games.length === 0) {
      return {
        gamesPlayed: 0,
        series: 'No recent history',
        trends: []
      };
    }
    
    return {
      gamesPlayed: headToHead.games.length,
      series: `Series tied ${headToHead.team1Wins}-${headToHead.team2Wins}`,
      trends: ['Limited head-to-head data available']
    };
  }

  analyzeSituationalFactors(options) {
    const factors = [];
    
    if (options.neutralSite) {
      factors.push('Neutral site game eliminates home field advantage');
    }
    
    if (options.conferenceGame) {
      factors.push('Conference game - expect closer competition');
    }
    
    if (options.week <= 4) {
      factors.push('Early season - teams still finding identity');
    }
    
    return factors;
  }

  getConfidenceFactors(homeMetrics, awayMetrics, prediction) {
    const factors = [];
    
    factors.push({
      factor: 'Data Quality',
      impact: Math.min(homeMetrics.totalGames, awayMetrics.totalGames) >= 8 ? 'Positive' : 'Negative'
    });
    
    factors.push({
      factor: 'Prediction Certainty',
      impact: Math.abs(prediction.spread) >= 7 ? 'Positive' : 'Negative'
    });
    
    return factors;
  }

  /**
   * Load comprehensive prediction data using improved GraphQL function
   */
  async loadComprehensivePredictionData(homeTeam, awayTeam, year = 2024) {
    if (!this.graphqlAvailable) return null;
    
    try {
      console.log(`🚀 [API DEBUG] Loading comprehensive prediction data for ${homeTeam} vs ${awayTeam}...`);
      
      const comprehensiveData = await graphqlService.getComprehensivePredictionData(homeTeam, awayTeam, year);
      
      if (comprehensiveData) {
        console.log(`✅ [API DEBUG] Comprehensive prediction data loaded successfully`);
        
        // Cache the data for future use
        const cacheKey = `${homeTeam}_${awayTeam}_${year}`;
        this.comprehensiveDataCache.set(cacheKey, comprehensiveData);
        
        return comprehensiveData;
      }
    } catch (error) {
      console.warn(`⚠️ [API DEBUG] Failed to load comprehensive prediction data:`, error.message);
    }
    
    return null;
  }

  /**
   * Calculate multi-factor score using enhanced metrics
   */
  calculateMultiFactorScore(homeMetrics, awayMetrics) {
    const factors = {
      // PPA Impact (40% weight) - Most predictive
      ppaImpact: (homeMetrics.ppaOffense - awayMetrics.ppaDefense) * 0.8,
      
      // Success Rate Impact (25% weight) - Critical for consistency  
      successImpact: (homeMetrics.offensiveSuccessRate - awayMetrics.defensiveSuccessRate) * 0.6,
      
      // Explosiveness Impact (20% weight) - Big play potential
      explosiveImpact: (homeMetrics.explosiveness - awayMetrics.explosiveness) * 0.5,
      
      // Traditional Metrics (10% weight) - SP+, ELO
      traditionalImpact: (homeMetrics.spRating - awayMetrics.spRating) * 0.2,
      
      // Market Efficiency (5% weight) - Where books might be wrong
      marketImpact: this.calculateMarketDisagreement(homeMetrics, awayMetrics)
    };

    const totalImpact = Object.values(factors).reduce((sum, val) => sum + (val || 0), 0);
    
    return { factors, totalImpact };
  }

  /**
   * Calculate market disagreement for value betting opportunities
   */
  calculateMarketDisagreement(homeMetrics, awayMetrics) {
    if (!homeMetrics.impliedWinRate || !awayMetrics.impliedWinRate) return 0;
    
    const marketHomeWinRate = homeMetrics.impliedWinRate;
    const marketAwayWinRate = awayMetrics.impliedWinRate;
    
    // If market shows disagreement with our model's factors, there might be value
    const modelFactorEdge = (homeMetrics.ppaOffense + homeMetrics.offensiveSuccessRate) - 
                           (awayMetrics.ppaOffense + awayMetrics.offensiveSuccessRate);
    
    const marketFactorEdge = marketHomeWinRate - marketAwayWinRate;
    
    return Math.abs(modelFactorEdge - marketFactorEdge) * 0.3;
  }

  /**
   * Get debug information for the last prediction
   */
  getDebugInfo() {
    return predictionDebugger.getDebugReport();
  }

  /**
   * Print debug report to console
   */
  printDebugReport() {
    return predictionDebugger.printDebugReport();
  }

  /**
   * Export debug report as JSON file
   */
  exportDebugReport() {
    return predictionDebugger.exportReport();
  }

  /**
   * Enable/disable debugging
   */
  enableDebug() {
    predictionDebugger.enable();
  }

  disableDebug() {
    predictionDebugger.disable();
  }

  /**
   * Create debug panel in UI
   */
  showDebugPanel() {
    if (typeof window !== 'undefined') {
      predictionDebugger.createDebugPanel();
      predictionDebugger.updateDebugPanel();
    }
  }

  /**
   * Test enhanced prediction with specific teams
   */
  async testEnhancedPrediction(homeTeam = "Ohio State", awayTeam = "Oregon") {
    console.log(`🧪 Testing enhanced prediction: ${homeTeam} vs ${awayTeam}`);
    
    try {
      const prediction = await this.predictMatchup(homeTeam, awayTeam, {
        season: 2024,
        week: 14,
        neutralSite: false
      });
      
      console.log('✅ Enhanced Prediction Test Results:');
      console.log(`   Score: ${homeTeam} ${prediction.prediction.score.home} - ${awayTeam} ${prediction.prediction.score.away}`);
      console.log(`   Spread: ${prediction.prediction.spread.toFixed(1)}`);
      console.log(`   Total: ${prediction.prediction.total.toFixed(1)}`);
      console.log(`   Confidence: ${(prediction.confidence * 100).toFixed(1)}%`);
      console.log(`   Key Factors:`, prediction.prediction.factors);
      
      return prediction;
    } catch (error) {
      console.error('❌ Enhanced prediction test failed:', error);
      return null;
    }
  }
}

// Create singleton instance
const matchupPredictor = new MatchupPredictor();

// Export the class and default instance
export { MatchupPredictor };
export default matchupPredictor;

// Named exports for specific functions
export const {
  predictMatchup,
  quickPredict,
  getSummaryPrediction,
  getTeamSuggestions,
  initialize
} = matchupPredictor;
