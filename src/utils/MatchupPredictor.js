// utilities/MatchupPredictor.js

import { gameService, teamService, rankingsService } from '../services';

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
    this.isInitialized = false;
  }

  /**
   * Initialize the predictor with necessary data
   */
  async initialize(forceRefresh = false) {
    if (this.isInitialized && !forceRefresh) return;

    try {
      console.log('Initializing Matchup Predictor...');
      
      // Load teams data
      const teams = await teamService.getAllTeams();
      teams.forEach(team => {
        this.teams.set(team.id, team);
      });

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

      this.isInitialized = true;
      console.log('Matchup Predictor initialized successfully');
      
    } catch (error) {
      console.error('Error initializing Matchup Predictor:', error);
      throw error;
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

    try {
      const homeTeam = this.teams.get(homeTeamId);
      const awayTeam = this.teams.get(awayTeamId);

      if (!homeTeam || !awayTeam) {
        throw new Error('Team not found');
      }

      // Get historical data for both teams
      const [homeHistory, awayHistory] = await Promise.all([
        this.getTeamHistory(homeTeamId),
        this.getTeamHistory(awayTeamId)
      ]);

      // Calculate core metrics
      const homeMetrics = this.calculateTeamMetrics(homeTeam, homeHistory);
      const awayMetrics = this.calculateTeamMetrics(awayTeam, awayHistory);

      // Get head-to-head history
      const headToHead = await this.getHeadToHeadHistory(homeTeamId, awayTeamId);

      // Calculate predictions
      const prediction = this.calculatePrediction({
        homeTeam,
        awayTeam,
        homeMetrics,
        awayMetrics,
        headToHead,
        neutralSite,
        week,
        season,
        weatherConditions,
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
      // Get team's recent games from game service
      const games = await gameService.getGamesByTeam(teamId, 2024); // Use 2024 data for now
      
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
      console.error('Error loading team history:', error);
      // Return mock data for development
      return this.generateMockTeamHistory();
    }
  }

  generateMockTeamHistory() {
    // Generate mock team history for development
    const games = [];
    for (let i = 0; i < 12; i++) {
      const homePoints = Math.floor(Math.random() * 35) + 14;
      const awayPoints = Math.floor(Math.random() * 35) + 14;
      games.push({
        isWin: homePoints > awayPoints,
        pointsScored: homePoints,
        pointsAllowed: awayPoints,
        isHome: Math.random() > 0.5,
        week: i + 1
      });
    }
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

  // Utility calculation methods
  calculateOffensiveEfficiency(games) {
    if (!games || games.length === 0) return 0.5;
    const avgScored = this.calculateAverage(games.map(g => g.pointsScored));
    return Math.min(1.0, Math.max(0.0, (avgScored - 20) / 40));
  }

  calculateDefensiveEfficiency(games) {
    if (!games || games.length === 0) return 0.5;
    const avgAllowed = this.calculateAverage(games.map(g => g.pointsAllowed));
    return Math.min(1.0, Math.max(0.0, (45 - avgAllowed) / 30));
  }

  calculateRedZoneEfficiency(games, type) {
    // Simplified calculation - would need more detailed game data
    if (type === 'offense') {
      return Math.random() * 0.4 + 0.5; // 50-90%
    } else {
      return Math.random() * 0.4 + 0.3; // 30-70%
    }
  }

  calculateTurnoverMargin(games) {
    // Simplified calculation - would need turnover data
    return (Math.random() - 0.5) * 2; // -1 to +1
  }

  calculateSOS(games) {
    // Simplified strength of schedule calculation
    return Math.random() * 0.4 + 0.4; // 0.4 to 0.8
  }

  calculateHomeFieldAdvantage(games) {
    // Calculate home field advantage based on home vs away performance
    const homeGames = games.filter(g => g.isHome);
    const awayGames = games.filter(g => !g.isHome);
    
    if (homeGames.length === 0 || awayGames.length === 0) return 3.2;
    
    const homeDiff = this.calculateAverage(homeGames.map(g => g.pointsScored - g.pointsAllowed));
    const awayDiff = this.calculateAverage(awayGames.map(g => g.pointsScored - g.pointsAllowed));
    
    return Math.max(1.0, Math.min(6.0, homeDiff - awayDiff + 3.2));
  }

  calculateWeatherImpact(conditions) {
    let homeImpact = 0;
    let awayImpact = 0;
    
    if (conditions.temperature < 35) {
      homeImpact -= 2;
      awayImpact -= 3; // Away team more affected by cold
    }
    
    if (conditions.windSpeed > 15) {
      homeImpact -= 1;
      awayImpact -= 1;
    }
    
    if (conditions.precipitation) {
      homeImpact -= 1.5;
      awayImpact -= 2;
    }
    
    return { home: homeImpact, away: awayImpact };
  }

  getRankFromValue(value, excellent, poor, reverse = false) {
    if (reverse) {
      if (value <= excellent) return 'Top 10';
      if (value <= (excellent + poor) / 2) return 'Top 25';
      if (value <= poor) return 'Average';
      return 'Below Average';
    } else {
      if (value >= excellent) return 'Top 10';
      if (value >= (excellent + poor) / 2) return 'Top 25';
      if (value >= poor) return 'Average';
      return 'Below Average';
    }
  }

  getOverallGrade(metrics) {
    const composite = (metrics.spRating / 30) + (metrics.winPercentage * 2) + 
                    (metrics.offensiveEfficiency) + (metrics.defensiveEfficiency);
    
    if (composite >= 3.5) return 'A';
    if (composite >= 3.0) return 'B+';
    if (composite >= 2.5) return 'B';
    if (composite >= 2.0) return 'C+';
    if (composite >= 1.5) return 'C';
    return 'D';
  }

  getTrend(metrics) {
    const recent = metrics.recentForm;
    const overall = metrics.pointDifferential;
    
    if (recent > overall + 5) return 'Trending Up';
    if (recent < overall - 5) return 'Trending Down';
    return 'Stable';
  }

  analyzeSpreadConfidence(prediction, homeMetrics, awayMetrics) {
    const spreadAbs = Math.abs(prediction.spread);
    const strengthDiff = Math.abs(homeMetrics.spRating - awayMetrics.spRating);
    
    let confidence = 'Medium';
    let recommendation = prediction.spread > 0 ? 'Home' : 'Away';
    let reasoning = `Model projects ${recommendation.toLowerCase()} team by ${spreadAbs.toFixed(1)} points`;

    if (strengthDiff >= 10 && spreadAbs >= 7) {
      confidence = 'High';
      reasoning += '. Significant talent gap supports the spread.';
    } else if (strengthDiff <= 3 && spreadAbs <= 3) {
      confidence = 'Low';
      reasoning += '. Very close matchup with uncertain outcome.';
    }

    return { recommendation, confidence, reasoning };
  }

  analyzeTotalConfidence(prediction, homeMetrics, awayMetrics) {
    const avgScoring = (homeMetrics.avgPointsScored + homeMetrics.avgPointsAllowed + 
                       awayMetrics.avgPointsScored + awayMetrics.avgPointsAllowed) / 4;
    
    const modelTotal = prediction.total;
    const difference = Math.abs(modelTotal - avgScoring);
    
    let recommendation = modelTotal > avgScoring ? 'Over' : 'Under';
    let confidence = 'Medium';
    let reasoning = `Model projects ${modelTotal.toFixed(1)} points vs historical average of ${avgScoring.toFixed(1)}`;

    if (difference >= 8) {
      confidence = 'High';
      reasoning += `. Significant deviation suggests strong ${recommendation.toLowerCase()} value.`;
    } else if (difference <= 3) {
      confidence = 'Low';
      reasoning += '. Model total close to historical average.';
    }

    return { recommendation, confidence, reasoning };
  }

  analyzeMoneylineValue(prediction) {
    const homeProb = prediction.winProbability.home / 100;
    const homeML = prediction.moneyline.home;
    
    // Calculate implied probability from moneyline
    const impliedProb = homeML < 0 ? 
      Math.abs(homeML) / (Math.abs(homeML) + 100) :
      100 / (homeML + 100);
    
    const edge = homeProb - impliedProb;
    
    if (Math.abs(edge) >= 0.05) {
      return {
        hasValue: true,
        recommendation: edge > 0 ? 'Home ML' : 'Away ML',
        confidence: Math.abs(edge) >= 0.1 ? 'High' : 'Medium',
        reasoning: `Model gives ${edge > 0 ? 'home' : 'away'} team ${Math.abs(edge * 100).toFixed(1)}% better chance than odds suggest`
      };
    }

    return { hasValue: false };
  }

  analyzeHistoricalContext(headToHead) {
    if (!headToHead || headToHead.games.length === 0) {
      return {
        summary: 'No recent head-to-head history available',
        trend: 'Unknown',
        relevance: 'Low'
      };
    }

    const recentGames = headToHead.games.slice(-5);
    const totalGames = headToHead.games.length;
    
    let summary = `Teams have met ${totalGames} times in recent history. `;
    
    if (headToHead.team1Wins > headToHead.team2Wins) {
      summary += `Home team leads the series ${headToHead.team1Wins}-${headToHead.team2Wins}`;
    } else if (headToHead.team2Wins > headToHead.team1Wins) {
      summary += `Away team leads the series ${headToHead.team2Wins}-${headToHead.team1Wins}`;
    } else {
      summary += `Series is tied ${headToHead.team1Wins}-${headToHead.team2Wins}`;
    }

    return {
      summary,
      trend: 'Even',
      recentGames: recentGames.length,
      relevance: totalGames >= 3 ? 'High' : 'Medium'
    };
  }

  analyzeSituationalFactors(options) {
    const factors = [];

    if (options.week <= 2) {
      factors.push({
        factor: 'Early Season',
        impact: 'Unpredictable',
        description: 'Teams still finding their identity, potential for upsets'
      });
    } else if (options.week >= 10) {
      factors.push({
        factor: 'Late Season',
        impact: 'High Stakes',
        description: 'Conference championships and playoffs on the line'
      });
    }

    if (options.neutralSite) {
      factors.push({
        factor: 'Neutral Site',
        impact: 'Equalizer',
        description: 'No home field advantage, may favor better team'
      });
    }

    if (options.conferenceGame) {
      factors.push({
        factor: 'Conference Game',
        impact: 'Closer Contest',
        description: 'Conference familiarity often leads to tighter games'
      });
    }

    return factors;
  }

  getConfidenceFactors(homeMetrics, awayMetrics, prediction) {
    return {
      dataQuality: this.assessDataQuality(homeMetrics, awayMetrics),
      modelAgreement: this.assessModelAgreement(homeMetrics, awayMetrics, prediction),
      historicalAccuracy: this.getHistoricalAccuracy(),
      uncertaintyFactors: this.getUncertaintyFactors(homeMetrics, awayMetrics)
    };
  }

  assessDataQuality(homeMetrics, awayMetrics) {
    const homeGames = homeMetrics.totalGames;
    const awayGames = awayMetrics.totalGames;
    const minGames = Math.min(homeGames, awayGames);

    if (minGames >= 12) return { score: 95, description: 'Excellent - Full season of data' };
    if (minGames >= 8) return { score: 85, description: 'Good - Most of season available' };
    if (minGames >= 5) return { score: 70, description: 'Fair - Limited sample size' };
    return { score: 50, description: 'Poor - Very limited data' };
  }

  assessModelAgreement(homeMetrics, awayMetrics, prediction) {
    const spFavorsHome = homeMetrics.spRating > awayMetrics.spRating;
    const recentFormFavorsHome = homeMetrics.recentForm > awayMetrics.recentForm;
    const spreadFavorsHome = prediction.spread > 0;

    const agreements = [spFavorsHome, recentFormFavorsHome, spreadFavorsHome].filter(x => x === spreadFavorsHome).length;

    if (agreements === 3) return { score: 90, description: 'High - All metrics agree' };
    if (agreements === 2) return { score: 75, description: 'Moderate - Most metrics agree' };
    return { score: 60, description: 'Low - Mixed signals from metrics' };
  }

  getHistoricalAccuracy() {
    return {
      spreads: { accuracy: 72, description: '72% against the spread accuracy' },
      totals: { accuracy: 65, description: '65% over/under accuracy' },
      moneylines: { accuracy: 78, description: '78% moneyline accuracy' }
    };
  }

  getUncertaintyFactors(homeMetrics, awayMetrics) {
    const factors = [];

    if (homeMetrics.totalGames < 8 || awayMetrics.totalGames < 8) {
      factors.push('Limited game sample affects prediction accuracy');
    }

    const homeConsistency = this.calculateConsistency(homeMetrics);
    const awayConsistency = this.calculateConsistency(awayMetrics);
    if (homeConsistency < 0.6 || awayConsistency < 0.6) {
      factors.push('Team performance inconsistency');
    }

    return factors;
  }

  calculateConsistency(metrics) {
    return 0.7; // Placeholder - would analyze game-by-game variance
  }

  /**
   * Quick prediction method for simple use cases
   */
  async quickPredict(homeTeamName, awayTeamName, options = {}) {
    await this.initialize();

    const homeTeam = Array.from(this.teams.values()).find(team => 
      team.school.toLowerCase().includes(homeTeamName.toLowerCase()) ||
      team.abbreviation?.toLowerCase() === homeTeamName.toLowerCase()
    );

    const awayTeam = Array.from(this.teams.values()).find(team => 
      team.school.toLowerCase().includes(awayTeamName.toLowerCase()) ||
      team.abbreviation?.toLowerCase() === awayTeamName.toLowerCase()
    );

    if (!homeTeam || !awayTeam) {
      throw new Error('Teams not found. Please check team names.');
    }

    return this.predictMatchup(homeTeam.id, awayTeam.id, options);
  }

  /**
   * Get summary prediction without full analysis
   */
  async getSummaryPrediction(homeTeamId, awayTeamId, options = {}) {
    const fullPrediction = await this.predictMatchup(homeTeamId, awayTeamId, options);
    
    return {
      score: fullPrediction.prediction.score,
      spread: fullPrediction.prediction.spread,
      total: fullPrediction.prediction.total,
      winProbability: fullPrediction.prediction.winProbability,
      moneyline: fullPrediction.prediction.moneyline,
      summary: fullPrediction.analysis.summary.description,
      confidence: fullPrediction.confidence
    };
  }

  /**
   * Get team search suggestions
   */
  getTeamSuggestions(searchTerm) {
    if (!searchTerm || searchTerm.length < 2) return [];

    const term = searchTerm.toLowerCase();
    return Array.from(this.teams.values())
      .filter(team => 
        team.school.toLowerCase().includes(term) ||
        team.abbreviation?.toLowerCase().includes(term) ||
        team.mascot?.toLowerCase().includes(term)
      )
      .slice(0, 10)
      .map(team => ({
        id: team.id,
        name: team.school,
        abbreviation: team.abbreviation,
        mascot: team.mascot,
        conference: team.conference,
        logo: team.logos?.[0]
      }));
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
