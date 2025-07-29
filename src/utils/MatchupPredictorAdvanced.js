// utilities/MatchupPredictorAdvanced.js

import { gameService, teamService, rankingsService, bettingService, advancedDataService, analyticsService, driveService } from '../services';
import graphqlService from '../services/graphqlService';

/**
 * MatchupPredictorAdvanced v2.0 - Simplified interface with sample data
 * 
 * This version maintains the same API as the original MatchupPredictor
 * but returns sample data instead of performing complex calculations.
 * Perfect for UI testing and demonstration purposes.
 */

class MatchupPredictorAdvanced {
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
    
    // Advanced metrics caches (maintained for API compatibility)
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
    this.modelVersion = '2.0-Advanced-UI';
    
    console.log('🚀 MatchupPredictorAdvanced v2.0 initialized for UI demonstration');
  }

  /**
   * Simplified initialization
   */
  async initialize(forceRefresh = false) {
    if (this.isInitialized && !forceRefresh) return;

    try {
      console.log('🔧 Initializing MatchupPredictorAdvanced v2.0...');
      
      // Check GraphQL availability first
      let graphqlAvailable = false;
      try {
        graphqlAvailable = await graphqlService.utils.isAvailable();
      } catch (error) {
        console.warn('GraphQL availability check failed:', error.message);
      }
      
      if (graphqlAvailable) {
        console.log('✓ GraphQL service available - enhanced UI enabled');
      } else {
        console.log('⚠️ GraphQL service not available - using REST API only');
      }
      
      // Load teams data
      const teams = await teamService.getFBSTeams(graphqlAvailable);
      teams.forEach(team => {
        this.teams.set(team.id, team);
      });

      // Load basic data (without complex calculations)
      await this.loadBasicData();

      this.isInitialized = true;
      this.graphqlAvailable = graphqlAvailable;
      console.log('✅ MatchupPredictorAdvanced v2.0 initialized successfully');
      console.log(`📊 Loaded data for ${this.teams.size} teams`);
      
    } catch (error) {
      console.warn('⚠️ MatchupPredictorAdvanced initialization had errors:', error.message);
      // Continue with basic functionality
      this.isInitialized = true;
      this.graphqlAvailable = false;
    }
  }

  /**
   * Load basic data without complex processing
   */
  async loadBasicData() {
    console.log('🔄 Loading basic data for UI...');
    
    try {
      const currentYear = 2024;
      
      // Load basic team data in parallel
      const [talentData, recruitingData] = await Promise.all([
        teamService.getTalentRatings(currentYear).catch(() => []),
        teamService.getRecruitingRankings(currentYear).catch(() => [])
      ]);

      // Store basic data
      talentData.forEach(talent => {
        this.recruitingData.set(talent.school, { talent: talent.talent });
      });
      
      recruitingData.forEach(recruiting => {
        const existing = this.recruitingData.get(recruiting.team) || {};
        this.recruitingData.set(recruiting.team, { 
          ...existing, 
          rank: recruiting.rank, 
          points: recruiting.points 
        });
      });

      console.log('✅ Basic data loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading basic data:', error);
    }
  }

  /**
   * Generate sample matchup prediction
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

    const homeTeam = this.teams.get(homeTeamId);
    const awayTeam = this.teams.get(awayTeamId);
    
    console.log('🎯 Generating sample prediction for:', homeTeam?.school, 'vs', awayTeam?.school);

    if (!homeTeam || !awayTeam) {
      throw new Error('Team not found');
    }

    try {
      // Get basic team data
      const [homeHistory, awayHistory, weatherData] = await Promise.all([
        this.getSampleTeamHistory(homeTeamId).catch(() => []),
        this.getSampleTeamHistory(awayTeamId).catch(() => []),
        this.getSampleWeatherData(homeTeam, options).catch(() => null)
      ]);

      // Calculate sample metrics
      const homeMetrics = this.calculateSampleTeamMetrics(homeTeam, homeHistory);
      const awayMetrics = this.calculateSampleTeamMetrics(awayTeam, awayHistory);

      console.log('📊 Sample metrics calculated');

      // Generate sample prediction
      const prediction = this.calculateSamplePrediction({
        homeTeam,
        awayTeam,
        homeMetrics,
        awayMetrics,
        neutralSite,
        week,
        season,
        weatherConditions: weatherData,
        conferenceGame
      });

      console.log('🎲 Sample prediction generated');

      // Generate sample analysis
      const analysis = this.generateSampleAnalysis({
        homeTeam,
        awayTeam,
        homeMetrics,
        awayMetrics,
        prediction,
        options
      });

      const confidence = this.calculateSampleConfidence(prediction, homeMetrics, awayMetrics);

      console.log('✅ Sample prediction complete');

      return {
        prediction,
        analysis,
        teams: {
          home: { ...homeTeam, metrics: homeMetrics },
          away: { ...awayTeam, metrics: awayMetrics }
        },
        headToHead: [],
        confidence,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error generating sample prediction:', error);
      throw error;
    }
  }

  /**
   * Get sample team history
   */
  async getSampleTeamHistory(teamId) {
    // Return sample game history
    const sampleGames = [];
    for (let i = 0; i < 10; i++) {
      sampleGames.push({
        gameId: `sample_${teamId}_${i}`,
        week: i + 1,
        pointsScored: Math.floor(Math.random() * 21) + 20, // 20-40 points
        pointsAllowed: Math.floor(Math.random() * 21) + 14, // 14-34 points
        isWin: Math.random() > 0.4, // 60% win rate
        opponent: `Sample Opponent ${i + 1}`,
        isHomeGame: Math.random() > 0.5
      });
    }
    return sampleGames;
  }

  /**
   * Get sample weather data
   */
  async getSampleWeatherData(homeTeam, options) {
    return {
      temperature: Math.floor(Math.random() * 40) + 50, // 50-90 degrees
      windSpeed: Math.floor(Math.random() * 20), // 0-20 mph
      precipitation: Math.random() > 0.7 ? Math.random() * 0.5 : 0, // 30% chance of rain
      conditions: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
      impact: 'low'
    };
  }

  /**
   * Calculate sample team metrics
   */
  calculateSampleTeamMetrics(team, history) {
    const wins = history.filter(g => g.isWin).length;
    const totalGames = history.length;
    
    return {
      // Core metrics
      winPercentage: totalGames > 0 ? wins / totalGames : 0.5,
      avgPointsScored: history.length > 0 ? 
        history.reduce((sum, g) => sum + g.pointsScored, 0) / history.length : 28,
      avgPointsAllowed: history.length > 0 ? 
        history.reduce((sum, g) => sum + g.pointsAllowed, 0) / history.length : 21,
      pointDifferential: 7, // Sample differential
      
      // Recent form
      recentWinPct: 0.6,
      recentPtsScored: 29,
      recentPtsAllowed: 19,
      recentForm: 10,
      
      // Sample ratings
      spRating: Math.random() * 20 - 10, // -10 to +10
      spRanking: Math.floor(Math.random() * 64) + 1,
      recruitingRank: Math.floor(Math.random() * 64) + 1,
      recruitingPoints: Math.random() * 300 + 200,
      eloRating: Math.random() * 400 + 1400, // 1400-1800
      
      // Situational
      strengthOfSchedule: Math.random() * 2 - 1, // -1 to +1
      homeFieldAdvantage: 3.2,
      
      // Efficiency (sample values)
      offensiveEfficiency: Math.random() * 0.4 + 0.4, // 0.4-0.8
      defensiveEfficiency: Math.random() * 0.4 + 0.4,
      redZoneScoring: Math.random() * 0.3 + 0.5, // 0.5-0.8
      redZoneDefense: Math.random() * 0.3 + 0.5,
      turnoverMargin: Math.random() * 2 - 1, // -1 to +1
      
      // Game counts
      totalGames: totalGames,
      recentGames: Math.min(totalGames, 5)
    };
  }

  /**
   * Calculate sample prediction
   */
  calculateSamplePrediction({ homeTeam, awayTeam, homeMetrics, awayMetrics, neutralSite, week, season, weatherConditions, conferenceGame }) {
    
    // Generate sample scores
    const homeScore = Math.floor(Math.random() * 21) + 20; // 20-40
    const awayScore = Math.floor(Math.random() * 21) + 17; // 17-37
    
    const total = homeScore + awayScore;
    const spread = homeScore - awayScore;
    const homeWinProb = homeScore > awayScore ? 
      Math.random() * 0.3 + 0.55 : // 55-85% if favored
      Math.random() * 0.3 + 0.15;  // 15-45% if underdog
    const awayWinProb = 1 - homeWinProb;

    // Convert to moneyline odds
    const homeMoneyline = this.probabilityToMoneyline(homeWinProb);
    const awayMoneyline = this.probabilityToMoneyline(awayWinProb);

    return {
      score: {
        home: homeScore,
        away: awayScore,
        total: total
      },
      spread: Math.round(spread * 10) / 10,
      total: Math.round(total * 10) / 10,
      winProbability: {
        home: Math.round(homeWinProb * 1000) / 10,
        away: Math.round(awayWinProb * 1000) / 10
      },
      moneyline: {
        home: homeMoneyline,
        away: awayMoneyline
      },
      factors: {
        spDifferential: homeMetrics.spRating - awayMetrics.spRating,
        pointDifferential: homeMetrics.pointDifferential - awayMetrics.pointDifferential,
        recentFormDiff: homeMetrics.recentForm - awayMetrics.recentForm,
        homeFieldValue: neutralSite ? 0 : 3.2
      }
    };
  }

  /**
   * Generate sample analysis
   */
  generateSampleAnalysis({ homeTeam, awayTeam, homeMetrics, awayMetrics, prediction, options }) {
    return {
      summary: {
        description: `GAMEDAY+ comprehensive analysis: ${awayTeam.school} enters hostile territory against ${homeTeam.school} in a critical conference matchup with significant playoff implications.`
      },
      keyFactors: [
        {
          factor: 'Home Field Advantage',
          impact: 'Home Team',
          description: `${homeTeam.school} benefits from playing at home with strong crowd support.`
        },
        {
          factor: 'Recent Form',
          impact: homeMetrics.recentForm > awayMetrics.recentForm ? 'Home Team' : 'Away Team',
          description: 'Recent performance trends favor the projected winner.'
        },
        {
          factor: 'Statistical Edge',
          impact: prediction.spread > 0 ? 'Home Team' : 'Away Team',
          description: 'Advanced metrics suggest a slight edge for the favored team.'
        }
      ],
      teamAnalysis: {
        home: {
          overall: this.getLetterGrade(homeMetrics.spRating),
          keyStats: [
            { label: 'PPG', value: homeMetrics.avgPointsScored.toFixed(1), rank: `#${homeMetrics.spRanking}` },
            { label: 'PAPG', value: homeMetrics.avgPointsAllowed.toFixed(1), rank: `#${Math.floor(Math.random() * 64) + 1}` },
            { label: 'Win %', value: (homeMetrics.winPercentage * 100).toFixed(0) + '%', rank: `#${Math.floor(Math.random() * 64) + 1}` },
            { label: 'SP+', value: homeMetrics.spRating.toFixed(1), rank: `#${homeMetrics.spRanking}` }
          ],
          strengths: this.generateStrengths(homeMetrics),
          weaknesses: this.generateWeaknesses(homeMetrics),
          trend: homeMetrics.recentForm > 5 ? 'Trending Up' : homeMetrics.recentForm < -5 ? 'Trending Down' : 'Steady'
        },
        away: {
          overall: this.getLetterGrade(awayMetrics.spRating),
          keyStats: [
            { label: 'PPG', value: awayMetrics.avgPointsScored.toFixed(1), rank: `#${awayMetrics.spRanking}` },
            { label: 'PAPG', value: awayMetrics.avgPointsAllowed.toFixed(1), rank: `#${Math.floor(Math.random() * 64) + 1}` },
            { label: 'Win %', value: (awayMetrics.winPercentage * 100).toFixed(0) + '%', rank: `#${Math.floor(Math.random() * 64) + 1}` },
            { label: 'SP+', value: awayMetrics.spRating.toFixed(1), rank: `#${awayMetrics.spRanking}` }
          ],
          strengths: this.generateStrengths(awayMetrics),
          weaknesses: this.generateWeaknesses(awayMetrics),
          trend: awayMetrics.recentForm > 5 ? 'Trending Up' : awayMetrics.recentForm < -5 ? 'Trending Down' : 'Steady'
        }
      },
      bettingInsights: [
        {
          insight: 'Sample Value',
          description: 'This appears to be a sample betting insight based on the projected spread.',
          confidence: 'Medium'
        }
      ]
    };
  }

  /**
   * Calculate sample confidence
   */
  calculateSampleConfidence(prediction, homeMetrics, awayMetrics) {
    // Simple confidence based on spread and team quality
    const spreadConfidence = Math.abs(prediction.spread) / 14; // 0-1 based on spread size
    const qualityDiff = Math.abs(homeMetrics.spRating - awayMetrics.spRating) / 20; // 0-1 based on rating diff
    
    const confidence = Math.min(0.9, Math.max(0.5, (spreadConfidence + qualityDiff) / 2 + 0.3));
    return confidence;
  }

  /**
   * Helper method for letter grades
   */
  getLetterGrade(spRating) {
    if (spRating > 15) return 'A';
    if (spRating > 10) return 'A-';
    if (spRating > 5) return 'B+';
    if (spRating > 0) return 'B';
    if (spRating > -5) return 'B-';
    if (spRating > -10) return 'C+';
    if (spRating > -15) return 'C';
    return 'C-';
  }

  /**
   * Generate sample strengths
   */
  generateStrengths(metrics) {
    const strengths = [];
    if (metrics.avgPointsScored > 30) strengths.push('High-powered offense');
    if (metrics.avgPointsAllowed < 20) strengths.push('Stingy defense');
    if (metrics.redZoneScoring > 0.7) strengths.push('Red zone efficiency');
    if (metrics.turnoverMargin > 0.5) strengths.push('Turnover margin');
    if (metrics.recentForm > 5) strengths.push('Strong recent form');
    
    // Ensure at least 2 strengths
    while (strengths.length < 2) {
      const randomStrengths = ['Balanced attack', 'Veteran leadership', 'Home field advantage', 'Coaching edge', 'Depth'];
      const randomStrength = randomStrengths[Math.floor(Math.random() * randomStrengths.length)];
      if (!strengths.includes(randomStrength)) {
        strengths.push(randomStrength);
      }
    }
    
    return strengths.slice(0, 3);
  }

  /**
   * Generate sample weaknesses
   */
  generateWeaknesses(metrics) {
    const weaknesses = [];
    if (metrics.avgPointsScored < 21) weaknesses.push('Offensive struggles');
    if (metrics.avgPointsAllowed > 28) weaknesses.push('Defensive issues');
    if (metrics.redZoneDefense < 0.5) weaknesses.push('Red zone defense');
    if (metrics.turnoverMargin < -0.5) weaknesses.push('Turnover prone');
    if (metrics.recentForm < -5) weaknesses.push('Poor recent form');
    
    // Ensure at least 2 weaknesses
    while (weaknesses.length < 2) {
      const randomWeaknesses = ['Inconsistency', 'Injury concerns', 'Road struggles', 'Special teams', 'Depth issues'];
      const randomWeakness = randomWeaknesses[Math.floor(Math.random() * randomWeaknesses.length)];
      if (!weaknesses.includes(randomWeakness)) {
        weaknesses.push(randomWeakness);
      }
    }
    
    return weaknesses.slice(0, 3);
  }

  /**
   * Convert probability to moneyline
   */
  probabilityToMoneyline(probability) {
    if (probability > 0.5) {
      return Math.round(-100 / (probability / (1 - probability)));
    } else {
      return Math.round(100 * ((1 - probability) / probability));
    }
  }

  /**
   * Get simple team suggestions for search
   */
  getTeamSuggestions(query) {
    const suggestions = [];
    this.teams.forEach((team) => {
      if (team.school.toLowerCase().includes(query.toLowerCase()) && suggestions.length < 10) {
        suggestions.push({
          id: team.id,
          school: team.school,
          abbreviation: team.abbreviation,
          conference: team.conference,
          logos: team.logos
        });
      }
    });
    return suggestions;
  }

  /**
   * Generate enhanced summary prediction (API compatibility)
   */
  async getSummaryPrediction(homeTeamId, awayTeamId, options = {}) {
    const fullPrediction = await this.predictMatchup(homeTeamId, awayTeamId, options);
    
    return {
      score: fullPrediction.prediction.score,
      spread: fullPrediction.prediction.spread,
      total: fullPrediction.prediction.total,
      winProbability: fullPrediction.prediction.winProbability,
      moneyline: fullPrediction.prediction.moneyline,
      confidence: fullPrediction.confidence,
      summary: fullPrediction.analysis.summary.description
    };
  }

  /**
   * Calculate average (utility method)
   */
  calculateAverage(values) {
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, val) => sum + (val || 0), 0) / values.length;
  }
}

// Create and export instance
const matchupPredictorAdvanced = new MatchupPredictorAdvanced();
export default matchupPredictorAdvanced;
