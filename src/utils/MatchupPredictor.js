/**
 * Enhanced MatchupPredictor - Professional-grade college football predictions
 * 
 * Uses comprehensive service layer architecture for:
 * - Advanced analytics and talent ratings
 * - Real-time betting lines and market data
 * - Weather conditions and venue factors
 * - Drive efficiency and success rates
 * - SP+ ratings and efficiency metrics
 * - Recruiting rankings and depth charts
 * 
 * All API keys are stored securely in Vercel environment variables
 */

import { 
  analyticsService, 
  bettingService, 
  weatherService, 
  teamService,
  gameService,
  driveService,
  rankingsService
} from '../services';

export class MatchupPredictor {
  constructor() {
    this.version = '2.1.0';
    this.supportedSeason = 2024;
    this.cache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Main prediction engine - analyzes matchup and returns comprehensive prediction
   */
  async predictMatchup(homeTeam, awayTeam, options = {}) {
    try {
      console.log(`🏈 Enhanced MatchupPredictor v${this.version}: Analyzing ${awayTeam} @ ${homeTeam}`);
      
      const {
        week = null,
        season = this.supportedSeason,
        venue = null,
        includeWeather = true,
        includeBetting = true,
        includeAdvanced = true
      } = options;

      // Validate FBS teams only
      const fbsTeams = await this.getFBSTeams();
      const homeTeamData = fbsTeams.find(t => t.school === homeTeam);
      const awayTeamData = fbsTeams.find(t => t.school === awayTeam);
      
      if (!homeTeamData || !awayTeamData) {
        throw new Error('Both teams must be FBS teams for enhanced predictions');
      }

      // Load comprehensive data in parallel
      const [
        homeMetrics,
        awayMetrics,
        bettingData,
        weatherData,
        homeAdvanced,
        awayAdvanced,
        headToHead,
        venueFactor
      ] = await Promise.all([
        this.getEnhancedTeamMetrics(homeTeam, season),
        this.getEnhancedTeamMetrics(awayTeam, season),
        includeBetting ? this.getBettingIntelligence(homeTeam, awayTeam, week, season) : null,
        includeWeather ? this.getWeatherImpact(venue, homeTeam) : null,
        includeAdvanced ? this.getAdvancedAnalytics(homeTeam, season) : null,
        includeAdvanced ? this.getAdvancedAnalytics(awayTeam, season) : null,
        this.getHeadToHeadHistory(homeTeam, awayTeam),
        this.getVenueAdvantage(homeTeam, venue)
      ]);

      // Calculate prediction using enhanced algorithm
      const prediction = await this.calculateEnhancedPrediction({
        homeTeam: homeTeamData,
        awayTeam: awayTeamData,
        homeMetrics,
        awayMetrics,
        bettingData,
        weatherData,
        homeAdvanced,
        awayAdvanced,
        headToHead,
        venueFactor,
        season,
        week
      });

      console.log(`✅ Prediction complete: ${prediction.prediction} (Confidence: ${prediction.confidence}%)`);
      
      return {
        ...prediction,
        version: this.version,
        timestamp: new Date().toISOString(),
        dataSource: 'Enhanced Service Layer',
        factors: this.getAnalysisFactors(prediction)
      };

    } catch (error) {
      console.error('Enhanced MatchupPredictor Error:', error);
      return this.generateFallbackPrediction(homeTeam, awayTeam, error);
    }
  }

  /**
   * Get FBS teams with caching
   */
  async getFBSTeams() {
    const cacheKey = 'fbs_teams';
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    const teams = await teamService.getFBSTeams(true);
    this.cache.set(cacheKey, { data: teams, timestamp: Date.now() });
    return teams;
  }

  /**
   * Get comprehensive team metrics using enhanced analytics service
   */
  async getEnhancedTeamMetrics(team, season) {
    try {
      // Use the enhanced analytics service methods
      const metrics = await analyticsService.getEnhancedTeamMetrics(team, season);
      
      // Add SP+ ratings and additional metrics
      const [spRatings, ppaData, teamStats] = await Promise.all([
        teamService.getSPRatings(season, team),
        teamService.getTeamPPA(season, team),
        teamService.getAdvancedTeamStats(season, team)
      ]);

      const teamSP = spRatings?.find(r => r.team === team);
      const teamPPA = ppaData?.find(p => p.team === team);
      const teamAdv = teamStats?.find(s => s.team === team);

      return {
        ...metrics,
        spPlus: {
          overall: teamSP?.rating || 0,
          offense: teamSP?.offense || 0,
          defense: teamSP?.defense || 0,
          specialTeams: teamSP?.specialTeams || 0
        },
        ppa: {
          overall: teamPPA?.ppa || 0,
          offense: teamPPA?.offense?.overall || 0,
          defense: teamPPA?.defense?.overall || 0,
          passing: teamPPA?.offense?.passing || 0,
          rushing: teamPPA?.offense?.rushing || 0
        },
        advanced: {
          turnovers: teamAdv?.turnovers || 0,
          penalties: teamAdv?.penalties || 0,
          thirdDowns: teamAdv?.thirdDownConversions || 0,
          redZone: teamAdv?.redZoneConversions || 0
        }
      };
    } catch (error) {
      console.error(`Error loading metrics for ${team}:`, error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Get betting intelligence and market data
   */
  async getBettingIntelligence(homeTeam, awayTeam, week, season) {
    try {
      const bettingLines = await bettingService.getBettingLines(null, season, week, 'regular', null, homeTeam, awayTeam);
      
      if (!bettingLines || bettingLines.length === 0) {
        return null;
      }

      // Find the most recent line for this matchup
      const matchupLine = bettingLines.find(line => 
        (line.homeTeam === homeTeam && line.awayTeam === awayTeam) ||
        (line.home === homeTeam && line.away === awayTeam)
      );

      if (!matchupLine || !matchupLine.lines || matchupLine.lines.length === 0) {
        return null;
      }

      // Get the most recent line from the best provider
      const latestLine = matchupLine.lines
        .filter(line => line.spread !== undefined && line.overUnder !== undefined)
        .sort((a, b) => new Date(b.formattedSpread) - new Date(a.formattedSpread))[0];

      if (!latestLine) {
        return null;
      }

      return {
        spread: parseFloat(latestLine.spread) || 0,
        overUnder: parseFloat(latestLine.overUnder) || 0,
        provider: latestLine.provider || 'Unknown',
        moneylineHome: latestLine.homeMoneyline || null,
        moneylineAway: latestLine.awayMoneyline || null,
        impliedProbability: {
          home: this.calculateImpliedProbability(latestLine.homeMoneyline, latestLine.spread),
          away: this.calculateImpliedProbability(latestLine.awayMoneyline, -latestLine.spread)
        },
        marketConfidence: this.calculateMarketConfidence(latestLine),
        timestamp: latestLine.formattedSpread || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error loading betting data:', error);
      return null;
    }
  }

  /**
   * Get weather impact analysis
   */
  async getWeatherImpact(venue, homeTeam) {
    try {
      // Get weather data for the venue
      const weatherData = await weatherService.getGameWeather(null, venue, new Date());
      
      if (!weatherData) {
        return null;
      }

      // Calculate weather impact on game style
      const impact = {
        ...weatherData,
        gameStyle: this.calculateWeatherGameStyle(weatherData),
        advantageTeam: this.calculateWeatherAdvantage(weatherData, homeTeam),
        severity: this.calculateWeatherSeverity(weatherData)
      };

      return impact;
    } catch (error) {
      console.error('Error loading weather data:', error);
      return null;
    }
  }

  /**
   * Get advanced analytics including drive efficiency and success rates
   */
  async getAdvancedAnalytics(team, season) {
    try {
      const [
        driveData,
        wepaData,
        eloRatings
      ] = await Promise.all([
        driveService.getTeamDrives(team, season),
        analyticsService.getTeamWEPA(season, team),
        teamService.getEloRatings(season, null, team)
      ]);

      // Calculate advanced metrics
      const drives = driveData || [];
      const efficiency = this.calculateDriveEfficiency(drives);
      
      return {
        driveEfficiency: efficiency,
        wepa: wepaData || { offense: 0, defense: 0 },
        elo: eloRatings?.[0] || { elo: 1500 },
        momentum: this.calculateMomentum(drives),
        clutchFactor: this.calculateClutchPerformance(drives)
      };
    } catch (error) {
      console.error(`Error loading advanced analytics for ${team}:`, error);
      return this.getDefaultAdvanced();
    }
  }

  /**
   * Get head-to-head history and trends
   */
  async getHeadToHeadHistory(homeTeam, awayTeam) {
    try {
      const matchupData = await teamService.getTeamMatchup(homeTeam, awayTeam, 2019, 2024);
      
      if (!matchupData || !matchupData.games) {
        return { games: [], trends: null };
      }

      const games = matchupData.games;
      const trends = this.analyzeHeadToHeadTrends(games, homeTeam, awayTeam);
      
      return {
        games: games.slice(0, 5), // Last 5 meetings
        trends,
        totalMeetings: games.length,
        lastMeeting: games[0] || null
      };
    } catch (error) {
      console.error('Error loading head-to-head data:', error);
      return { games: [], trends: null };
    }
  }

  /**
   * Calculate venue advantage and home field impact
   */
  async getVenueAdvantage(homeTeam, venue) {
    try {
      // Get home team's record at venue
      const homeGames = await gameService.getGamesByTeam(homeTeam, this.supportedSeason);
      const atHome = homeGames.filter(game => 
        (game.home_team === homeTeam || game.homeTeam === homeTeam) && 
        !game.neutral_site
      );

      const homeRecord = this.calculateRecord(atHome, homeTeam);
      const venueAdvantage = this.calculateVenueAdvantage(homeRecord, homeTeam);

      return {
        homeRecord,
        venueAdvantage,
        altitude: venue ? this.getAltitudeAdvantage(venue) : 0,
        crowd: venue ? this.getCrowdAdvantage(venue, homeTeam) : 0.5,
        surface: venue ? this.getSurfaceAdvantage(venue) : 0
      };
    } catch (error) {
      console.error('Error calculating venue advantage:', error);
      return { homeRecord: { wins: 0, losses: 0 }, venueAdvantage: 0.03 };
    }
  }

  /**
   * Enhanced prediction algorithm combining all factors
   */
  async calculateEnhancedPrediction(data) {
    const {
      homeTeam,
      awayTeam,
      homeMetrics,
      awayMetrics,
      bettingData,
      weatherData,
      homeAdvanced,
      awayAdvanced,
      headToHead,
      venueFactor
    } = data;

    // Core team strength differential
    const talentDiff = (homeMetrics.talent.rating - awayMetrics.talent.rating) / 100;
    const spPlusDiff = (homeMetrics.spPlus.overall - awayMetrics.spPlus.overall) / 10;
    const efficiencyDiff = (homeMetrics.driveEfficiency - awayMetrics.driveEfficiency) * 10;
    
    // Advanced factors
    const ppaDiff = (homeMetrics.ppa.overall - awayMetrics.ppa.overall) * 5;
    const clutchDiff = (homeAdvanced?.clutchFactor || 0.5) - (awayAdvanced?.clutchFactor || 0.5);
    
    // Situational factors
    const homeFieldAdvantage = venueFactor.venueAdvantage + venueFactor.crowd + venueFactor.altitude;
    const weatherImpact = weatherData ? this.calculateWeatherImpactOnPrediction(weatherData, homeMetrics, awayMetrics) : 0;
    const bettingAdjustment = bettingData ? this.calculateBettingAdjustment(bettingData) : 0;
    
    // Historical factors
    const h2hTrend = headToHead.trends ? this.calculateH2HTrend(headToHead.trends, homeTeam.school) : 0;
    
    // Combine all factors with weights
    const rawScore = (
      talentDiff * 0.25 +
      spPlusDiff * 0.20 +
      efficiencyDiff * 0.15 +
      ppaDiff * 0.10 +
      clutchDiff * 0.08 +
      homeFieldAdvantage * 0.10 +
      weatherImpact * 0.05 +
      bettingAdjustment * 0.04 +
      h2hTrend * 0.03
    );

    // Convert to probability using logistic function
    const homeProbability = 1 / (1 + Math.exp(-rawScore * 3));
    const awayProbability = 1 - homeProbability;
    
    // Determine prediction and confidence
    const isHomeWin = homeProbability > 0.5;
    const confidence = Math.round(Math.max(homeProbability, awayProbability) * 100);
    const margin = Math.abs(rawScore * 14); // Convert to point spread estimate
    
    // Generate score prediction
    const scorePrediction = this.generateScorePrediction(
      homeMetrics, 
      awayMetrics, 
      rawScore, 
      weatherData
    );

    return {
      prediction: isHomeWin ? homeTeam.school : awayTeam.school,
      confidence,
      homeProbability: Math.round(homeProbability * 100),
      awayProbability: Math.round(awayProbability * 100),
      predictedMargin: Math.round(margin * 10) / 10,
      predictedScore: scorePrediction,
      keyFactors: this.identifyKeyFactors(data, rawScore),
      riskFactors: this.identifyRiskFactors(data),
      bettingRecommendation: this.generateBettingRecommendation(bettingData, homeProbability),
      model: {
        algorithm: 'Enhanced Multi-Factor Analysis',
        factors: {
          talent: talentDiff,
          spPlus: spPlusDiff,
          efficiency: efficiencyDiff,
          ppa: ppaDiff,
          clutch: clutchDiff,
          homeField: homeFieldAdvantage,
          weather: weatherImpact,
          betting: bettingAdjustment,
          history: h2hTrend
        },
        rawScore,
        version: this.version
      }
    };
  }

  /**
   * Generate detailed score prediction
   */
  generateScorePrediction(homeMetrics, awayMetrics, rawScore, weatherData) {
    // Base scoring from team efficiency
    const homeBaseScore = 24 + (homeMetrics.ppa.offense * 8) + (homeMetrics.driveEfficiency * 15);
    const awayBaseScore = 24 + (awayMetrics.ppa.offense * 8) + (awayMetrics.driveEfficiency * 15);
    
    // Apply defensive adjustments
    const homeAdjusted = homeBaseScore - (awayMetrics.ppa.defense * 5);
    const awayAdjusted = awayBaseScore - (homeMetrics.ppa.defense * 5);
    
    // Apply game script and situational factors
    const marginEffect = rawScore * 7;
    const homeScore = Math.max(10, Math.round(homeAdjusted + marginEffect));
    const awayScore = Math.max(10, Math.round(awayAdjusted - marginEffect));
    
    // Weather adjustments
    if (weatherData && weatherData.severity > 0.5) {
      const reduction = Math.round(weatherData.severity * 8);
      return {
        home: Math.max(7, homeScore - reduction),
        away: Math.max(7, awayScore - reduction),
        total: Math.max(14, homeScore + awayScore - (reduction * 2)),
        weatherAdjusted: true
      };
    }
    
    return {
      home: homeScore,
      away: awayScore,
      total: homeScore + awayScore,
      weatherAdjusted: false
    };
  }

  /**
   * Identify key factors influencing the prediction
   */
  identifyKeyFactors(data, rawScore) {
    const factors = [];
    const { homeMetrics, awayMetrics, bettingData, weatherData, venueFactor } = data;
    
    // Talent advantage
    const talentDiff = homeMetrics.talent.rating - awayMetrics.talent.rating;
    if (Math.abs(talentDiff) > 50) {
      factors.push({
        factor: 'Talent Advantage',
        advantage: talentDiff > 0 ? 'Home' : 'Away',
        magnitude: Math.abs(talentDiff),
        impact: 'High'
      });
    }
    
    // SP+ differential
    const spDiff = homeMetrics.spPlus.overall - awayMetrics.spPlus.overall;
    if (Math.abs(spDiff) > 5) {
      factors.push({
        factor: 'SP+ Rating',
        advantage: spDiff > 0 ? 'Home' : 'Away',
        magnitude: Math.abs(spDiff),
        impact: 'High'
      });
    }
    
    // Home field advantage
    if (venueFactor.venueAdvantage > 0.05) {
      factors.push({
        factor: 'Home Field Advantage',
        advantage: 'Home',
        magnitude: venueFactor.venueAdvantage,
        impact: 'Medium'
      });
    }
    
    // Weather impact
    if (weatherData && weatherData.severity > 0.4) {
      factors.push({
        factor: 'Weather Conditions',
        advantage: weatherData.advantageTeam || 'Neutral',
        magnitude: weatherData.severity,
        impact: 'Medium'
      });
    }
    
    // Betting market confidence
    if (bettingData && bettingData.marketConfidence > 0.7) {
      factors.push({
        factor: 'Market Consensus',
        advantage: bettingData.spread > 0 ? 'Away' : 'Home',
        magnitude: Math.abs(bettingData.spread),
        impact: 'Medium'
      });
    }
    
    return factors.slice(0, 5); // Top 5 factors
  }

  /**
   * Identify potential risk factors
   */
  identifyRiskFactors(data) {
    const risks = [];
    const { homeMetrics, awayMetrics, weatherData, headToHead } = data;
    
    // Close talent levels
    const talentDiff = Math.abs(homeMetrics.talent.rating - awayMetrics.talent.rating);
    if (talentDiff < 25) {
      risks.push('Teams have similar talent levels - could be decided by execution');
    }
    
    // Weather concerns
    if (weatherData && weatherData.severity > 0.6) {
      risks.push('Severe weather conditions may lead to unpredictable outcomes');
    }
    
    // Historical variance
    if (headToHead.games && headToHead.games.length > 2) {
      const margins = headToHead.games.map(g => Math.abs(g.homePoints - g.awayPoints));
      const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;
      if (avgMargin < 10) {
        risks.push('Historical meetings have been close - upset potential');
      }
    }
    
    return risks;
  }

  /**
   * Generate betting recommendation based on model vs market
   */
  generateBettingRecommendation(bettingData, modelProbability) {
    if (!bettingData) {
      return { recommendation: 'No betting data available', confidence: 0 };
    }
    
    const marketProbability = bettingData.impliedProbability.home;
    const edge = Math.abs(modelProbability - marketProbability);
    
    if (edge > 0.15) { // 15% edge threshold
      return {
        recommendation: modelProbability > marketProbability ? 'Home Team' : 'Away Team',
        edge: Math.round(edge * 100),
        confidence: edge > 0.25 ? 'High' : 'Medium',
        explanation: `Model suggests ${Math.round(edge * 100)}% edge over market`
      };
    }
    
    return {
      recommendation: 'No strong betting edge detected',
      edge: Math.round(edge * 100),
      confidence: 'Low'
    };
  }

  /**
   * Helper methods for calculations
   */
  calculateImpliedProbability(moneyline, spread) {
    if (!moneyline) return 0.5;
    
    if (moneyline > 0) {
      return 100 / (moneyline + 100);
    } else {
      return Math.abs(moneyline) / (Math.abs(moneyline) + 100);
    }
  }

  calculateMarketConfidence(line) {
    const spreadConfidence = Math.min(Math.abs(line.spread) / 20, 1);
    const moneylineConfidence = line.homeMoneyline && line.awayMoneyline ? 
      Math.min(Math.abs(line.homeMoneyline - line.awayMoneyline) / 400, 1) : 0.5;
    
    return (spreadConfidence + moneylineConfidence) / 2;
  }

  calculateWeatherGameStyle(weather) {
    if (weather.precipitation > 0.3 || weather.windSpeed > 20) {
      return 'Run-heavy, low-scoring';
    } else if (weather.temperature < 35 || weather.temperature > 85) {
      return 'Weather-impacted';
    }
    return 'Normal conditions';
  }

  calculateWeatherAdvantage(weather, homeTeam) {
    // Teams from colder climates might have advantage in cold weather
    if (weather.temperature < 35) {
      const coldWeatherTeams = ['Minnesota', 'Wisconsin', 'Michigan', 'Michigan State', 'Northwestern'];
      return coldWeatherTeams.includes(homeTeam) ? 'Home' : 'Neutral';
    }
    return 'Neutral';
  }

  calculateWeatherSeverity(weather) {
    let severity = 0;
    
    if (weather.precipitation > 0.2) severity += 0.3;
    if (weather.windSpeed > 15) severity += 0.2;
    if (weather.temperature < 32 || weather.temperature > 90) severity += 0.2;
    if (weather.humidity > 80) severity += 0.1;
    
    return Math.min(severity, 1);
  }

  calculateDriveEfficiency(drives) {
    if (!drives || drives.length === 0) return 0.35;
    
    const scoringDrives = drives.filter(d => d.scoring === true).length;
    return Math.min(scoringDrives / drives.length, 1);
  }

  calculateMomentum(drives) {
    if (!drives || drives.length < 5) return 0.5;
    
    const recentDrives = drives.slice(-5);
    const scoringPct = recentDrives.filter(d => d.scoring).length / recentDrives.length;
    return scoringPct;
  }

  calculateClutchPerformance(drives) {
    if (!drives || drives.length === 0) return 0.5;
    
    // This would need more detailed drive data to properly calculate
    // For now, return baseline
    return 0.5;
  }

  analyzeHeadToHeadTrends(games, homeTeam, awayTeam) {
    if (!games || games.length === 0) return null;
    
    let homeWins = 0;
    let totalMargin = 0;
    
    games.forEach(game => {
      const homePoints = game.home_team === homeTeam ? game.home_points : game.away_points;
      const awayPoints = game.home_team === homeTeam ? game.away_points : game.home_points;
      
      if (homePoints > awayPoints) homeWins++;
      totalMargin += Math.abs(homePoints - awayPoints);
    });
    
    return {
      homeAdvantage: homeWins / games.length,
      avgMargin: totalMargin / games.length,
      recentForm: games.slice(0, 3),
      totalGames: games.length
    };
  }

  calculateRecord(games, team) {
    let wins = 0;
    let losses = 0;
    
    games.forEach(game => {
      const isHome = (game.home_team === team || game.homeTeam === team);
      const homeScore = game.home_points || game.homePoints || 0;
      const awayScore = game.away_points || game.awayPoints || 0;
      
      const teamWon = isHome ? homeScore > awayScore : awayScore > homeScore;
      
      if (teamWon) wins++;
      else losses++;
    });
    
    return { wins, losses };
  }

  calculateVenueAdvantage(record, team) {
    const totalGames = record.wins + record.losses;
    if (totalGames === 0) return 0.03; // Default home field advantage
    
    const winPct = record.wins / totalGames;
    return Math.min(winPct - 0.5, 0.15); // Cap at 15% advantage
  }

  getAltitudeAdvantage(venue) {
    const highAltitudeVenues = {
      'Folsom Field': 0.05, // Colorado
      'LaVell Edwards Stadium': 0.03, // BYU
      'Sun Bowl': 0.02 // UTEP
    };
    
    return highAltitudeVenues[venue] || 0;
  }

  getCrowdAdvantage(venue, team) {
    // Simplified crowd advantage - would need venue capacity and attendance data
    const bigCrowdTeams = ['Alabama', 'LSU', 'Texas', 'Ohio State', 'Michigan', 'Penn State'];
    return bigCrowdTeams.includes(team) ? 0.04 : 0.02;
  }

  getSurfaceAdvantage(venue) {
    // Turf vs grass advantages - simplified
    return 0;
  }

  calculateWeatherImpactOnPrediction(weather, homeMetrics, awayMetrics) {
    if (!weather || weather.severity < 0.3) return 0;
    
    // Cold weather might favor rushing teams
    if (weather.temperature < 35) {
      const homeRushAdv = (homeMetrics.ppa.rushing || 0) - (awayMetrics.ppa.rushing || 0);
      return homeRushAdv * weather.severity * 0.1;
    }
    
    // High winds affect passing
    if (weather.windSpeed > 20) {
      const homePassAdv = (homeMetrics.ppa.passing || 0) - (awayMetrics.ppa.passing || 0);
      return -homePassAdv * weather.severity * 0.1; // Negative because wind hurts passing
    }
    
    return 0;
  }

  calculateBettingAdjustment(bettingData) {
    if (!bettingData || !bettingData.marketConfidence) return 0;
    
    // If market is very confident, slightly adjust toward market
    if (bettingData.marketConfidence > 0.8) {
      return (bettingData.spread > 0 ? -0.02 : 0.02);
    }
    
    return 0;
  }

  calculateH2HTrend(trends, homeTeam) {
    if (!trends) return 0;
    
    const homeAdvantage = trends.homeAdvantage - 0.5; // Center around 0
    return homeAdvantage * 0.1; // Small weight to historical trends
  }

  getAnalysisFactors(prediction) {
    return {
      primaryFactors: prediction.keyFactors?.slice(0, 3) || [],
      riskFactors: prediction.riskFactors || [],
      confidence: prediction.confidence,
      methodology: 'Multi-factor statistical analysis with advanced metrics'
    };
  }

  /**
   * Default/fallback data methods
   */
  getDefaultMetrics() {
    return {
      talent: { rating: 700, rank: 64 },
      recruiting: { rank: 64, points: 0 },
      efficiency: { ppa: [], advanced: [] },
      driveEfficiency: 0.35,
      successRate: 0.45,
      explosiveness: 0.1,
      spPlus: { overall: 0, offense: 0, defense: 0, specialTeams: 0 },
      ppa: { overall: 0, offense: 0, defense: 0, passing: 0, rushing: 0 },
      advanced: { turnovers: 0, penalties: 0, thirdDowns: 0, redZone: 0 }
    };
  }

  getDefaultAdvanced() {
    return {
      driveEfficiency: 0.35,
      wepa: { offense: 0, defense: 0 },
      elo: { elo: 1500 },
      momentum: 0.5,
      clutchFactor: 0.5
    };
  }

  generateFallbackPrediction(homeTeam, awayTeam, error) {
    console.warn('Using fallback prediction due to error:', error.message);
    
    return {
      prediction: homeTeam, // Default to home team
      confidence: 52,
      homeProbability: 52,
      awayProbability: 48,
      predictedMargin: 3.0,
      predictedScore: { home: 24, away: 21, total: 45 },
      keyFactors: [{ factor: 'Home Field Advantage', advantage: 'Home', impact: 'Medium' }],
      riskFactors: ['Limited data available for comprehensive analysis'],
      bettingRecommendation: { recommendation: 'Insufficient data', confidence: 'Low' },
      model: {
        algorithm: 'Fallback Basic Prediction',
        version: this.version,
        error: error.message
      },
      isFallback: true,
      version: this.version,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export default new MatchupPredictor();