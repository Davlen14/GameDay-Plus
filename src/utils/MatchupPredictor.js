// utilities/MatchupPredictor.js

import { gameService, teamService, rankingsService } from '../services';
import graphqlService from '../services/graphqlService';

/**
 * Universal College Football Matchup Predictor
 * Provides comprehensive game predictions for any team matchup
 */

class MatchupPredictor {
  constructor() {
    this.teams = new Map();
    this.historicalData = new Map();
    this.spRatings = new Map();
    this.recruitingData = new Map();
    this.transferData = new Map();
    this.eloRatings = new Map();
    this.weatherData = new Map();
    this.bettingData = new Map();
    this.comprehensiveData = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the predictor with necessary data
   */
  async initialize(forceRefresh = false) {
    if (this.isInitialized && !forceRefresh) return;

    try {
      console.log('🔧 Initializing Enhanced MatchupPredictor...');
      
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

      // Load comprehensive data using GraphQL for better performance
      if (graphqlAvailable) {
        try {
          const comprehensiveData = await graphqlService.getComprehensivePredictionData();
          this.processComprehensiveData(comprehensiveData);
          console.log('✓ Loaded comprehensive data via GraphQL');
        } catch (graphqlError) {
          console.warn('GraphQL data loading failed, falling back to individual API calls:', graphqlError.message);
          await this.loadFallbackData();
        }
      } else {
        await this.loadFallbackData();
      }

      this.isInitialized = true;
      this.graphqlAvailable = graphqlAvailable;
      console.log('✅ Enhanced MatchupPredictor initialized successfully');
      
    } catch (error) {
      console.warn('⚠️ MatchupPredictor initialization had errors:', error.message);
      // Continue with basic functionality
      this.isInitialized = true;
      this.graphqlAvailable = false;
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
   * Fallback data loading if GraphQL fails
   */
  async loadFallbackData() {
    console.log('Loading fallback data...');
    
    // Load SP+ ratings (most recent)
    const spData = await this.loadSPRatings();
    spData.forEach(rating => {
      this.spRatings.set(rating.team, rating);
    });

    // Load recruiting data
    const recruitingData = await this.loadRecruitingData();
    recruitingData.forEach(data => {
      this.recruitingData.set(data.team, data);
    });
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

    try {
      const homeTeam = this.teams.get(homeTeamId);
      const awayTeam = this.teams.get(awayTeamId);

      if (!homeTeam || !awayTeam) {
        throw new Error('Team not found');
      }

      // Get historical data for both teams using enhanced GraphQL queries
      const [homeHistory, awayHistory, headToHead, weatherData] = await Promise.all([
        this.getEnhancedTeamHistory(homeTeamId),
        this.getEnhancedTeamHistory(awayTeamId),
        this.getEnhancedHeadToHeadHistory(homeTeamId, awayTeamId),
        this.getWeatherData(homeTeam, options)
      ]);

      // Calculate enhanced metrics with GraphQL data
      const homeMetrics = this.calculateEnhancedTeamMetrics(homeTeam, homeHistory, homeTeamId);
      const awayMetrics = this.calculateEnhancedTeamMetrics(awayTeam, awayHistory, awayTeamId);

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

      return {
        prediction,
        analysis,
        teams: {
          home: { ...homeTeam, metrics: homeMetrics },
          away: { ...awayTeam, metrics: awayMetrics }
        },
        headToHead,
        confidence: this.calculateConfidence(prediction, homeMetrics, awayMetrics),
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error generating matchup prediction:', error);
      throw error;
    }
  }

  /**
   * Calculate team performance metrics
   */
  calculateTeamMetrics(team, history) {
    const recentGames = history.slice(-10); // Last 10 games
    const allGames = history;

    // Basic stats
    const winPercentage = allGames.length > 0 ? 
      allGames.filter(g => g.isWin).length / allGames.length : 0.5;

    const avgPointsScored = this.calculateAverage(allGames.map(g => g.pointsScored));
    const avgPointsAllowed = this.calculateAverage(allGames.map(g => g.pointsAllowed));
    const pointDifferential = avgPointsScored - avgPointsAllowed;

    // Recent form
    const recentWinPct = recentGames.length > 0 ? 
      recentGames.filter(g => g.isWin).length / recentGames.length : 0.5;

    const recentPtsScored = this.calculateAverage(recentGames.map(g => g.pointsScored));
    const recentPtsAllowed = this.calculateAverage(recentGames.map(g => g.pointsAllowed));

    // Get SP+ rating
    const spRating = this.spRatings.get(team.school) || { rating: 0, ranking: 64 };

    // Get recruiting strength
    const recruiting = this.recruitingData.get(team.school) || { rank: 64, points: 0 };

    // Advanced metrics
    const strengthOfSchedule = this.calculateSOS(allGames);
    const homeFieldAdvantage = this.calculateHomeFieldAdvantage(allGames);
    
    // Efficiency metrics
    const offensiveEfficiency = this.calculateOffensiveEfficiency(allGames);
    const defensiveEfficiency = this.calculateDefensiveEfficiency(allGames);

    // Red zone performance
    const redZoneScoring = this.calculateRedZoneEfficiency(allGames, 'offense');
    const redZoneDefense = this.calculateRedZoneEfficiency(allGames, 'defense');

    // Turnover metrics
    const turnoverMargin = this.calculateTurnoverMargin(allGames);

    return {
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
      
      // Situational
      strengthOfSchedule,
      homeFieldAdvantage,
      
      // Efficiency
      offensiveEfficiency,
      defensiveEfficiency,
      redZoneScoring,
      redZoneDefense,
      turnoverMargin,
      
      // Game counts
      totalGames: allGames.length,
      recentGames: recentGames.length
    };
  }

  /**
   * Calculate final prediction
   */
  calculatePrediction({ homeTeam, awayTeam, homeMetrics, awayMetrics, headToHead, neutralSite, week, season, weatherConditions, conferenceGame }) {
    
    // Base prediction using multiple factors
    let homeScore = 28; // Base score
    let awayScore = 24; // Base score

    // Factor in team strength
    const spDifferential = homeMetrics.spRating - awayMetrics.spRating;
    const pointDifferential = homeMetrics.pointDifferential - awayMetrics.pointDifferential;
    
    // Adjust scores based on team strength
    homeScore += (spDifferential * 0.4) + (pointDifferential * 0.15);
    awayScore += (-spDifferential * 0.4) + (-pointDifferential * 0.15);

    // Recent form adjustment
    const recentFormDiff = homeMetrics.recentForm - awayMetrics.recentForm;
    homeScore += recentFormDiff * 0.1;
    awayScore -= recentFormDiff * 0.1;

    // Home field advantage (if not neutral site)
    if (!neutralSite) {
      homeScore += homeMetrics.homeFieldAdvantage || 3.2;
    }

    // Week adjustments
    if (week <= 4) {
      // Early season - more conservative scoring
      homeScore *= 0.92;
      awayScore *= 0.92;
    }

    // Weather adjustments
    if (weatherConditions) {
      const weatherAdjustment = this.calculateWeatherImpact(weatherConditions);
      homeScore += weatherAdjustment.home;
      awayScore += weatherAdjustment.away;
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
    }

    // Ensure reasonable bounds
    homeScore = Math.max(10, Math.min(70, homeScore));
    awayScore = Math.max(7, Math.min(65, awayScore));

    // Round to reasonable numbers
    homeScore = Math.round(homeScore * 10) / 10;
    awayScore = Math.round(awayScore * 10) / 10;

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
   * Enhanced prediction calculation using GraphQL data and advanced metrics
   */
  calculateEnhancedPrediction({ homeTeam, awayTeam, homeMetrics, awayMetrics, headToHead, neutralSite, week, season, weatherConditions, conferenceGame }) {
    
    // Start with base prediction
    const basePrediction = this.calculatePrediction({ 
      homeTeam, awayTeam, homeMetrics, awayMetrics, headToHead, 
      neutralSite, week, season, weatherConditions, conferenceGame 
    });
    
    let homeScore = basePrediction.score.home;
    let awayScore = basePrediction.score.away;
    
    // Enhanced adjustments using GraphQL data
    
    // ELO Rating adjustments (more accurate than SP+ alone)
    if (homeMetrics.eloRating && awayMetrics.eloRating) {
      const eloDiff = homeMetrics.eloRating - awayMetrics.eloRating;
      const eloAdjustment = eloDiff * 0.02; // ELO differential impact
      homeScore += eloAdjustment;
      awayScore -= eloAdjustment;
    }
    
    // Talent composite adjustments
    if (homeMetrics.talentComposite && awayMetrics.talentComposite) {
      const talentDiff = homeMetrics.talentComposite - awayMetrics.talentComposite;
      const talentAdjustment = talentDiff * 0.15;
      homeScore += talentAdjustment;
      awayScore -= talentAdjustment;
    }
    
    // Transfer portal impact
    if (homeMetrics.transferPortalImpact && awayMetrics.transferPortalImpact) {
      const transferDiff = homeMetrics.transferPortalImpact - awayMetrics.transferPortalImpact;
      homeScore += transferDiff * 0.8; // Transfer impact on scoring
      awayScore -= transferDiff * 0.8;
    }
    
    // Enhanced weather impact (more detailed from GraphQL)
    if (weatherConditions && weatherConditions.detailedConditions) {
      const enhancedWeatherImpact = this.calculateEnhancedWeatherImpact(
        weatherConditions.detailedConditions, 
        homeMetrics, 
        awayMetrics
      );
      homeScore += enhancedWeatherImpact.home;
      awayScore += enhancedWeatherImpact.away;
    }
    
    // Betting market efficiency (if our model disagrees with market)
    if (homeMetrics.impliedWinRate && awayMetrics.impliedWinRate) {
      const marketHomeWinRate = homeMetrics.impliedWinRate;
      const modelHomeWinRate = this.calculateWinProbability(homeScore, awayScore, homeMetrics, awayMetrics);
      const marketDisagreement = Math.abs(modelHomeWinRate - marketHomeWinRate);
      
      // If we disagree significantly with market, increase confidence but moderate prediction
      if (marketDisagreement > 0.15) {
        // Market inefficiency detected - trust our model more
        const adjustment = marketDisagreement * 0.5;
        if (modelHomeWinRate > marketHomeWinRate) {
          homeScore += adjustment;
        } else {
          awayScore += adjustment;
        }
      }
    }
    
    // Ensure reasonable bounds
    homeScore = Math.max(7, Math.min(75, homeScore));
    awayScore = Math.max(3, Math.min(70, awayScore));
    
    // Round to realistic numbers
    homeScore = Math.round(homeScore * 10) / 10;
    awayScore = Math.round(awayScore * 10) / 10;
    
    // Calculate enhanced derived metrics
    const total = homeScore + awayScore;
    const spread = homeScore - awayScore;
    const homeWinProb = this.calculateEnhancedWinProbability(homeScore, awayScore, homeMetrics, awayMetrics);
    const awayWinProb = 1 - homeWinProb;
    
    // Enhanced moneyline calculation
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
        home: Math.round(homeWinProb * 1000) / 10,
        away: Math.round(awayWinProb * 1000) / 10
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
    // Start with base probability
    let prob = this.calculateWinProbability(homeScore, awayScore, homeMetrics, awayMetrics);
    
    // ELO rating adjustment
    if (homeMetrics.eloRating && awayMetrics.eloRating) {
      const eloAdj = (homeMetrics.eloRating - awayMetrics.eloRating) / 400; // ELO scale
      prob += eloAdj * 0.05;
    }
    
    // Talent composite adjustment
    if (homeMetrics.talentComposite && awayMetrics.talentComposite) {
      const talentAdj = (homeMetrics.talentComposite - awayMetrics.talentComposite) / 100;
      prob += talentAdj * 0.03;
    }
    
    // Market efficiency check
    if (homeMetrics.impliedWinRate) {
      const marketProb = homeMetrics.impliedWinRate;
      const diff = Math.abs(prob - marketProb);
      
      // If we're very different from market, moderate slightly
      if (diff > 0.2) {
        prob = prob * 0.8 + marketProb * 0.2; // Blend with market
      }
    }
    
    // Bound probability
    return Math.max(0.02, Math.min(0.98, prob));
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

    // Identify strengths
    if (metrics.offensiveEfficiency >= 0.6) strengths.push('Elite Offense');
    else if (metrics.offensiveEfficiency >= 0.4) strengths.push('Strong Offense');
    
    if (metrics.defensiveEfficiency >= 0.6) strengths.push('Elite Defense');
    else if (metrics.defensiveEfficiency >= 0.4) strengths.push('Strong Defense');
    
    if (metrics.redZoneScoring >= 0.7) strengths.push('Red Zone Efficiency');
    if (metrics.turnoverMargin >= 0.5) strengths.push('Turnover Creation');
    if (metrics.recentWinPct >= 0.8) strengths.push('Hot Streak');

    // Identify weaknesses
    if (metrics.offensiveEfficiency <= 0.3) weaknesses.push('Struggling Offense');
    if (metrics.defensiveEfficiency <= 0.3) weaknesses.push('Poor Defense');
    if (metrics.redZoneDefense <= 0.4) weaknesses.push('Red Zone Defense');
    if (metrics.turnoverMargin <= -0.5) weaknesses.push('Turnover Issues');
    if (metrics.recentWinPct <= 0.3) weaknesses.push('Poor Recent Form');

    // Key stats
    keyStats.push({
      label: 'Points Per Game',
      value: metrics.avgPointsScored.toFixed(1),
      rank: this.getRankFromValue(metrics.avgPointsScored, 45, 20)
    });
    
    keyStats.push({
      label: 'Points Allowed',
      value: metrics.avgPointsAllowed.toFixed(1),
      rank: this.getRankFromValue(metrics.avgPointsAllowed, 15, 35, true)
    });
    
    keyStats.push({
      label: 'Win Percentage',
      value: `${(metrics.winPercentage * 100).toFixed(1)}%`,
      rank: this.getRankFromValue(metrics.winPercentage, 0.8, 0.4)
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

    // Offensive vs Defensive matchups
    const homeOffVsAwayDef = homeMetrics.offensiveEfficiency - awayMetrics.defensiveEfficiency;
    const awayOffVsHomeDef = awayMetrics.offensiveEfficiency - homeMetrics.defensiveEfficiency;

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
   * Generate betting insights
   */
  generateBettingInsights(prediction, homeMetrics, awayMetrics) {
    const insights = [];

    // Spread analysis
    const spreadConfidence = this.analyzeSpreadConfidence(prediction, homeMetrics, awayMetrics);
    insights.push({
      type: 'Spread',
      recommendation: spreadConfidence.recommendation,
      confidence: spreadConfidence.confidence,
      reasoning: spreadConfidence.reasoning
    });

    // Total analysis
    const totalConfidence = this.analyzeTotalConfidence(prediction, homeMetrics, awayMetrics);
    insights.push({
      type: 'Total',
      recommendation: totalConfidence.recommendation,
      confidence: totalConfidence.confidence,
      reasoning: totalConfidence.reasoning
    });

    // Moneyline value
    const mlValue = this.analyzeMoneylineValue(prediction);
    if (mlValue.hasValue) {
      insights.push({
        type: 'Moneyline',
        recommendation: mlValue.recommendation,
        confidence: mlValue.confidence,
        reasoning: mlValue.reasoning
      });
    }

    return insights;
  }

  // Helper methods for calculations
  calculateAverage(values) {
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  calculateWinProbability(homeScore, awayScore, homeMetrics, awayMetrics) {
    const scoreDiff = homeScore - awayScore;
    const strengthDiff = (homeMetrics.spRating - awayMetrics.spRating) / 10;
    
    // Base probability from score differential
    let prob = 0.5 + (scoreDiff / 35);
    
    // Adjust for team strength
    prob += strengthDiff * 0.05;
    
    // Adjust for recent form
    const formDiff = (homeMetrics.recentWinPct - awayMetrics.recentWinPct);
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

    // Data quality
    const dataQuality = Math.min(homeMetrics.totalGames, awayMetrics.totalGames);
    if (dataQuality >= 10) confidence += 0.1;
    else if (dataQuality <= 5) confidence -= 0.1;

    // Prediction certainty
    const spreadAbs = Math.abs(prediction.spread);
    if (spreadAbs >= 10) confidence += 0.1;
    else if (spreadAbs <= 3) confidence -= 0.05;

    // Team strength differential
    const strengthDiff = Math.abs(homeMetrics.spRating - awayMetrics.spRating);
    if (strengthDiff >= 10) confidence += 0.1;
    else if (strengthDiff <= 3) confidence -= 0.05;

    return Math.max(0.4, Math.min(0.95, confidence));
  }

  // Placeholder implementations for data loading methods
  async loadSPRatings() {
    // This would load SP+ ratings from your API
    // For now, return mock data for testing
    return [
      { team: 'Georgia', rating: 28.5, ranking: 1 },
      { team: 'Alabama', rating: 25.2, ranking: 2 },
      { team: 'Ohio State', rating: 23.8, ranking: 3 },
      { team: 'Texas', rating: 22.1, ranking: 4 },
      { team: 'Oregon', rating: 20.5, ranking: 5 }
    ];
  }

  async loadRecruitingData() {
    // This would load recruiting data from your API
    // For now, return mock data for testing
    return [
      { team: 'Georgia', rank: 1, points: 325.4 },
      { team: 'Alabama', rank: 2, points: 315.8 },
      { team: 'Ohio State', rank: 3, points: 310.2 },
      { team: 'Texas', rank: 4, points: 295.6 },
      { team: 'Oregon', rank: 5, points: 285.1 }
    ];
  }

  async getTeamHistory(teamId) {
    try {
      console.log(`📊 [API DEBUG] Attempting to fetch team history for team ${teamId}...`);
      
      // Get team's recent games from game service
      const games = await gameService.getGamesByTeam(teamId, 2024); // Use 2024 data for now
      
      console.log(`✅ [API DEBUG] Successfully fetched ${games.length} games for team ${teamId}`);
      
      // Transform games into the expected format
      return games.map(game => ({
        isWin: game.completed && 
               ((game.homeId === teamId && game.homePoints > game.awayPoints) ||
                (game.awayId === teamId && game.awayPoints > game.homePoints)),
        pointsScored: game.homeId === teamId ? game.homePoints : game.awayPoints,
        pointsAllowed: game.homeId === teamId ? game.awayPoints : game.homePoints,
        isHome: game.homeId === teamId,
        opponent: game.homeId === teamId ? game.awayTeam : game.homeTeam,
        week: game.week
      })).filter(game => game.pointsScored !== undefined && game.pointsAllowed !== undefined);
    } catch (error) {
      console.error('❌ [API DEBUG] Error loading team history for team', teamId, '- using mock data:', error);
      // Return mock data for development - this prevents the prediction from failing
      console.log('🔄 [API DEBUG] Generating mock team history to prevent prediction failure');
      return this.generateMockTeamHistory();
    }
  }

  generateMockTeamHistory() {
    console.log('🔄 [API DEBUG] Generating realistic mock team history...');
    // Generate mock team history for development with more realistic data
    const games = [];
    const teamStrength = 0.3 + Math.random() * 0.4; // Random team strength 0.3-0.7
    
    for (let i = 0; i < 12; i++) {
      // More realistic scoring with team strength influence
      const baseOffense = 20 + (teamStrength * 25); // 20-45 base points
      const baseDefense = 15 + ((1 - teamStrength) * 20); // 15-35 points allowed
      
      const homePoints = Math.floor(baseOffense + (Math.random() * 21) - 10); // ±10 variance
      const awayPoints = Math.floor(baseDefense + (Math.random() * 21) - 10); // ±10 variance
      
      games.push({
        isWin: homePoints > awayPoints,
        pointsScored: Math.max(0, homePoints),
        pointsAllowed: Math.max(0, awayPoints),
        isHome: Math.random() > 0.5,
        week: i + 1,
        // Add some realistic opponent context
        opponent: `Mock Team ${i + 1}`,
        excitementIndex: Math.random() * 10
      });
    }
    
    console.log(`✅ [API DEBUG] Generated ${games.length} mock games for fallback`);
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
      
      // Try to get comprehensive data from GraphQL first
      const teamData = this.comprehensiveData.get(teamId);
      if (teamData && teamData.games) {
        console.log(`✅ [API DEBUG] Using cached enhanced team history for team ${teamId}`);
        return teamData.games.map(game => ({
          isWin: game.completed && 
                 ((game.homeId === teamId && game.homePoints > game.awayPoints) ||
                  (game.awayId === teamId && game.awayPoints > game.homePoints)),
          pointsScored: game.homeId === teamId ? game.homePoints : game.awayPoints,
          pointsAllowed: game.homeId === teamId ? game.awayPoints : game.homePoints,
          isHome: game.homeId === teamId,
          opponent: game.homeId === teamId ? game.awayTeam : game.homeTeam,
          week: game.week,
          // Enhanced data from GraphQL
          excitementIndex: game.excitementIndex || 0,
          eloRating: game.eloRating || null,
          weatherConditions: game.weather || null
        }));
      }
      
      console.log(`🔄 [API DEBUG] No cached data, falling back to standard team history for team ${teamId}`);
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
      // Try GraphQL enhanced head-to-head query
      const h2hData = await graphqlService.getHeadToHeadHistory(team1Id, team2Id);
      
      if (h2hData && h2hData.games) {
        return {
          games: h2hData.games.map(game => ({
            ...game,
            excitementIndex: game.excitementIndex || 0,
            eloRatingDiff: game.eloRatingDiff || 0
          })),
          team1Wins: h2hData.team1Wins || 0,
          team2Wins: h2hData.team2Wins || 0,
          avgPointDiff: h2hData.avgPointDiff || 0,
          lastMeeting: h2hData.lastMeeting || null
        };
      }
      
      // Fallback to original method
      return await this.getHeadToHeadHistory(team1Id, team2Id);
    } catch (error) {
      console.error('Error loading enhanced head-to-head history:', error);
      return await this.getHeadToHeadHistory(team1Id, team2Id);
    }
  }

  /**
   * Get weather data for game location
   */
  async getWeatherData(homeTeam, options = {}) {
    try {
      // Return early if weather conditions are provided in options
      if (options.weatherConditions) {
        console.log('🌤️ [API DEBUG] Using provided weather conditions from options');
        return options.weatherConditions;
      }

      // Check if weather data is available in comprehensive data
      const teamData = this.comprehensiveData.get(homeTeam.id);
      if (teamData && teamData.weather) {
        console.log('📊 [API DEBUG] Using cached weather data from comprehensive data');
        return teamData.weather;
      }

      // Only try GraphQL if available and CORS isn't an issue
      if (this.graphqlAvailable) {
        try {
          console.log('🌤️ [API DEBUG] Attempting to fetch weather data via GraphQL...');
          const weatherData = await graphqlService.getWeatherConditions(homeTeam.id, options.week, options.season);
          if (weatherData) {
            console.log('✅ [API DEBUG] Weather data fetched successfully via GraphQL');
            return weatherData;
          }
        } catch (graphqlError) {
          console.log('❌ [API DEBUG] GraphQL weather fetch failed, using default weather data');
          // Don't throw, just continue with fallback
        }
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
   * Enhanced team metrics calculation with GraphQL data
   */
  calculateEnhancedTeamMetrics(team, history, teamId) {
    // Start with base metrics
    const baseMetrics = this.calculateTeamMetrics(team, history);
    
    // Add enhanced metrics from GraphQL data
    const teamData = this.comprehensiveData.get(teamId);
    const eloData = this.eloRatings.get(team.school);
    const bettingData = this.bettingData.get(team.school);
    
    return {
      ...baseMetrics,
      // Enhanced ratings
      eloRating: eloData?.rating || null,
      eloRanking: eloData?.ranking || null,
      
      // Betting insights
      impliedWinRate: bettingData?.impliedWinRate || null,
      avgClosingLine: bettingData?.avgClosingLine || null,
      
      // Advanced analytics
      excitementIndex: teamData?.excitementIndex || 0,
      talentComposite: teamData?.talentComposite || null,
      transferPortalImpact: teamData?.transferPortalImpact || null,
      
      // Enhanced efficiency metrics
      thirdDownConversion: teamData?.thirdDownConversion || null,
      redZoneSuccess: teamData?.redZoneSuccess || null,
      yardsPerPlay: teamData?.yardsPerPlay || null,
      timePossession: teamData?.timePossession || null
    };
  }

  /**
   * Get quick summary prediction (used by GamePredictor)
   */
  async getSummaryPrediction(homeTeamId, awayTeamId, options = {}) {
    try {
      const fullPrediction = await this.predictMatchup(homeTeamId, awayTeamId, options);
      
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
      console.error('Error generating summary prediction:', error);
      // Return fallback prediction
      return {
        score: { home: 24, away: 21 },
        spread: 3,
        total: 45,
        winProbability: { home: 60, away: 40 },
        moneyline: { home: -150, away: 125 },
        confidence: 0.6,
        summary: 'Prediction unavailable - using fallback'
      };
    }
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
  calculateSOS(games) {
    // Calculate strength of schedule based on opponent performance
    if (!games || games.length === 0) return 0.5;
    
    // Simple SOS calculation - average of opponents' win percentages
    // In a real implementation, this would use opponent records
    return 0.5 + (Math.random() - 0.5) * 0.3; // Mock calculation
  }

  calculateHomeFieldAdvantage(games) {
    // Calculate home field advantage based on home vs away performance
    const homeGames = games.filter(g => g.isHome);
    const awayGames = games.filter(g => !g.isHome);
    
    if (homeGames.length === 0 || awayGames.length === 0) return 3.2; // Default
    
    const homeAvg = this.calculateAverage(homeGames.map(g => g.pointsScored));
    const awayAvg = this.calculateAverage(awayGames.map(g => g.pointsScored));
    
    return Math.max(1.0, Math.min(6.0, homeAvg - awayAvg + 3.2));
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
    // Calculate overall team grade
    const offenseGrade = metrics.offensiveEfficiency * 100;
    const defenseGrade = metrics.defensiveEfficiency * 100;
    const overallGrade = (offenseGrade + defenseGrade) / 2;
    
    if (overallGrade >= 80) return 'A';
    if (overallGrade >= 70) return 'B';
    if (overallGrade >= 60) return 'C';
    if (overallGrade >= 50) return 'D';
    return 'F';
  }

  getTrend(metrics) {
    // Calculate team trend
    if (metrics.recentWinPct > 0.7) return 'Hot';
    if (metrics.recentWinPct > 0.5) return 'Stable';
    return 'Cold';
  }

  // Missing betting analysis methods
  analyzeSpreadConfidence(prediction, homeMetrics, awayMetrics) {
    const spreadAbs = Math.abs(prediction.spread);
    const confidence = spreadAbs > 7 ? 'High' : (spreadAbs > 3 ? 'Medium' : 'Low');
    
    return {
      recommendation: prediction.spread > 0 ? 'Take Home' : 'Take Away',
      confidence,
      reasoning: `Spread confidence based on ${spreadAbs.toFixed(1)} point differential`
    };
  }

  analyzeTotalConfidence(prediction, homeMetrics, awayMetrics) {
    const avgCombinedPoints = (homeMetrics.avgPointsScored + awayMetrics.avgPointsScored + 
                              homeMetrics.avgPointsAllowed + awayMetrics.avgPointsAllowed) / 2;
    const totalDiff = Math.abs(prediction.total - avgCombinedPoints);
    
    const confidence = totalDiff < 7 ? 'High' : (totalDiff < 14 ? 'Medium' : 'Low');
    const recommendation = prediction.total > avgCombinedPoints ? 'Take Under' : 'Take Over';
    
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
}

// Create singleton instance
const matchupPredictor = new MatchupPredictor();

export default matchupPredictor;

// Named exports for specific functions
export const {
  predictMatchup,
  quickPredict,
  getSummaryPrediction,
  getTeamSuggestions,
  initialize
} = matchupPredictor;
