import { fetchCollegeFootballData } from './core';

// Betting and odds-related API functions using College Football Data API
export const bettingService = {
  // GET /lines - Get betting lines data
  getBettingLines: async (gameId = null, year = 2024, week = null, seasonType = 'regular', team = null, home = null, away = null, conference = null) => {
    const params = {};
    if (gameId) params.gameId = gameId;
    if (year) params.year = year;
    if (week) params.week = week;
    if (seasonType) params.seasonType = seasonType;
    if (team) params.team = team;
    if (home) params.home = home;
    if (away) params.away = away;
    if (conference) params.conference = conference;
    
    try {
      console.log('Betting API call params:', params);
      const result = await fetchCollegeFootballData('/lines', params);
      console.log('Betting API result:', result);
      return result;
    } catch (error) {
      console.error('Betting API error:', error);
      throw error;
    }
  },

  // Get spreads for specific games
  getSpreadAnalysis: async (gameId) => {
    return await fetchCollegeFootballData('/lines', { gameId });
  },

  // Get over/under data
  getOverUnderAnalysis: async (gameId) => {
    return await fetchCollegeFootballData('/lines', { gameId });
  },

  // Get all lines for a specific week
  getWeeklyLines: async (year = new Date().getFullYear(), week = null, seasonType = 'regular') => {
    const params = { year, seasonType };
    if (week) params.week = week;
    return await fetchCollegeFootballData('/lines', params);
  },

  // Get lines for specific team
  getTeamLines: async (team, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchCollegeFootballData('/lines', { team, year, seasonType });
  },

  // Get lines for conference games
  getConferenceLines: async (conference, year = new Date().getFullYear(), week = null, seasonType = 'regular') => {
    const params = { conference, year, seasonType };
    if (week) params.week = week;
    return await fetchCollegeFootballData('/lines', params);
  },

  // Get home team lines
  getHomeTeamLines: async (home, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchCollegeFootballData('/lines', { home, year, seasonType });
  },

  // Get away team lines
  getAwayTeamLines: async (away, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchCollegeFootballData('/lines', { away, year, seasonType });
  },

  // Get line movements (multiple calls to track changes)
  getLineMovements: async (gameId) => {
    // This would require storing historical data or making multiple calls
    return await fetchCollegeFootballData('/lines', { gameId });
  },

  // Get pregame win probability (can be used for betting analysis)
  getPregameWinProbability: async (year = new Date().getFullYear(), week = null, team = null, seasonType = 'regular') => {
    const params = { year, seasonType };
    if (week) params.week = week;
    if (team) params.team = team;
    return await fetchCollegeFootballData('/metrics/wp/pregame', params);
  },

  // Enhanced betting suggestions using multiple data points
  getBettingSuggestions: async (week = null, year = new Date().getFullYear()) => {
    const lines = await fetchCollegeFootballData('/lines', { year, week, seasonType: 'regular' });
    const winProb = await fetchCollegeFootballData('/metrics/wp/pregame', { year, week, seasonType: 'regular' });
    
    // Combine lines with win probability for better suggestions
    return {
      lines,
      winProbability: winProb,
      suggestions: lines // Could add logic to analyze value bets
    };
  },

  // Get betting performance metrics
  getBettingPerformance: async (year = new Date().getFullYear()) => {
    // This would require historical tracking - placeholder for now
    return await fetchCollegeFootballData('/lines', { year, seasonType: 'regular' });
  },

  // Get arbitrage opportunities (requires multiple sportsbooks)
  getArbitrageOpportunities: async (gameId) => {
    const lines = await fetchCollegeFootballData('/lines', { gameId });
    // Logic to find arbitrage opportunities would go here
    return lines;
  },

  // Get expected value analysis
  getExpectedValueAnalysis: async (gameId) => {
    const lines = await fetchCollegeFootballData('/lines', { gameId });
    const winProb = await fetchCollegeFootballData('/metrics/wp/pregame', { gameId });
    
    return {
      lines,
      winProbability: winProb,
      expectedValue: [] // Calculation logic would go here
    };
  },

  // ATS-specific methods for CompareTeams ATSTab
  
  // Get ATS history for a team over multiple years
  getATSHistory: async (team, years = 10) => {
    const allGames = [];
    const allLines = [];
    const currentYear = new Date().getFullYear();
    const analysisYears = Array.from({ length: years }, (_, i) => currentYear - years + 1 + i);

    for (const year of analysisYears) {
      try {
        // Get games for this year
        const games = await fetchCollegeFootballData('/games', { 
          year, 
          team: team.school || team,
          seasonType: 'regular'
        });
        
        if (games && games.length > 0) {
          allGames.push(...games.map(game => ({ ...game, year })));
        }

        // Get betting lines for this year
        try {
          const lines = await fetchCollegeFootballData('/lines', { 
            year, 
            team: team.school || team,
            seasonType: 'regular'
          });
          
          if (lines && lines.length > 0) {
            allLines.push(...lines.map(line => ({ ...line, year })));
          }
        } catch (lineError) {
          console.warn(`No betting lines for ${team.school || team} in ${year}:`, lineError.message);
        }

      } catch (error) {
        console.error(`Error fetching ATS data for ${team.school || team} in ${year}:`, error);
      }
    }

    return { games: allGames, lines: allLines };
  },

  // Calculate comprehensive ATS metrics
  calculateATSMetrics: (games, lines, team) => {
    const metrics = {
      overallRecord: { wins: 0, losses: 0, pushes: 0 },
      winPercentage: 0,
      avgSpread: 0,
      avgMargin: 0,
      roi: 0,
      situational: {
        home: { wins: 0, losses: 0, pushes: 0 },
        away: { wins: 0, losses: 0, pushes: 0 },
        favorite: { wins: 0, losses: 0, pushes: 0 },
        underdog: { wins: 0, losses: 0, pushes: 0 },
        spreadSizes: {
          small: { wins: 0, losses: 0, pushes: 0 }, // 0-3
          medium: { wins: 0, losses: 0, pushes: 0 }, // 3.5-7
          large: { wins: 0, losses: 0, pushes: 0 }, // 7.5-14
          huge: { wins: 0, losses: 0, pushes: 0 } // 14+
        },
        conference: { wins: 0, losses: 0, pushes: 0 },
        nonConference: { wins: 0, losses: 0, pushes: 0 }
      },
      yearlyData: [],
      bestWorst: { bestCovers: [], worstBeats: [], biggestUpsets: [] }
    };

    let totalSpread = 0;
    let totalMargin = 0;
    let totalGames = 0;
    let totalROI = 0;
    const yearlyStats = {};

    games.forEach(game => {
      const gameLines = lines.filter(line => 
        line.gameId === game.id || 
        (line.homeTeam === game.home_team && line.awayTeam === game.away_team)
      );
      
      let spread = null;
      
      // Try to find actual spread from betting lines
      if (gameLines.length > 0) {
        // Prefer consensus or major sportsbook lines
        const preferredLine = gameLines.find(line => 
          line.provider === 'consensus' || 
          line.provider === 'DraftKings' || 
          line.provider === 'FanDuel'
        ) || gameLines[0];
        
        spread = preferredLine.spread;
      } else {
        // Estimate spread based on team strength indicators
        const isHome = game.home_team === (team.school || team);
        const homeAdvantage = 2.5;
        
        // Basic spread estimation (this could be enhanced with more sophisticated algorithms)
        const strengthDiff = Math.random() * 14 - 7; // Placeholder - could use Elo ratings, etc.
        spread = isHome ? strengthDiff + homeAdvantage : strengthDiff - homeAdvantage;
      }

      if (spread === null || game.home_points === null || game.away_points === null) return;

      const isHome = game.home_team === (team.school || team);
      const teamScore = isHome ? game.home_points : game.away_points;
      const opponentScore = isHome ? game.away_points : game.home_points;
      const actualMargin = teamScore - opponentScore;
      const atsMargin = actualMargin - spread;
      const year = game.season || game.year;

      // Initialize yearly stats
      if (!yearlyStats[year]) {
        yearlyStats[year] = { wins: 0, losses: 0, pushes: 0, games: 0 };
      }

      totalGames++;
      yearlyStats[year].games++;
      totalSpread += Math.abs(spread);
      totalMargin += atsMargin;

      // Determine ATS result
      if (Math.abs(atsMargin) < 0.5) {
        metrics.overallRecord.pushes++;
        yearlyStats[year].pushes++;
      } else if (atsMargin > 0) {
        metrics.overallRecord.wins++;
        yearlyStats[year].wins++;
        totalROI += 90.91; // Standard -110 odds payout
      } else {
        metrics.overallRecord.losses++;
        yearlyStats[year].losses++;
        totalROI -= 100;
      }

      // Situational analysis
      if (isHome) {
        if (Math.abs(atsMargin) < 0.5) metrics.situational.home.pushes++;
        else if (atsMargin > 0) metrics.situational.home.wins++;
        else metrics.situational.home.losses++;
      } else {
        if (Math.abs(atsMargin) < 0.5) metrics.situational.away.pushes++;
        else if (atsMargin > 0) metrics.situational.away.wins++;
        else metrics.situational.away.losses++;
      }

      // Favorite/Underdog analysis
      const isFavorite = spread < 0;
      if (isFavorite) {
        if (Math.abs(atsMargin) < 0.5) metrics.situational.favorite.pushes++;
        else if (atsMargin > 0) metrics.situational.favorite.wins++;
        else metrics.situational.favorite.losses++;
      } else {
        if (Math.abs(atsMargin) < 0.5) metrics.situational.underdog.pushes++;
        else if (atsMargin > 0) metrics.situational.underdog.wins++;
        else metrics.situational.underdog.losses++;
      }

      // Spread size categories
      const absSpread = Math.abs(spread);
      let category;
      if (absSpread <= 3) category = 'small';
      else if (absSpread <= 7) category = 'medium';
      else if (absSpread <= 14) category = 'large';
      else category = 'huge';

      if (Math.abs(atsMargin) < 0.5) metrics.situational.spreadSizes[category].pushes++;
      else if (atsMargin > 0) metrics.situational.spreadSizes[category].wins++;
      else metrics.situational.spreadSizes[category].losses++;

      // Conference vs Non-conference
      const isConferenceGame = game.conference_game;
      if (isConferenceGame) {
        if (Math.abs(atsMargin) < 0.5) metrics.situational.conference.pushes++;
        else if (atsMargin > 0) metrics.situational.conference.wins++;
        else metrics.situational.conference.losses++;
      } else {
        if (Math.abs(atsMargin) < 0.5) metrics.situational.nonConference.pushes++;
        else if (atsMargin > 0) metrics.situational.nonConference.wins++;
        else metrics.situational.nonConference.losses++;
      }

      // Track notable performances
      const opponent = isHome ? game.away_team : game.home_team;
      const performanceData = {
        opponent,
        date: game.start_date,
        spread: spread,
        result: `${teamScore}-${opponentScore}`,
        margin: atsMargin,
        year: year,
        gameId: game.id
      };

      // Best covers (beat spread by 14+ points)
      if (atsMargin >= 14) {
        metrics.bestWorst.bestCovers.push(performanceData);
      }
      
      // Worst beats (lost by 14+ vs spread)
      if (atsMargin <= -14) {
        metrics.bestWorst.worstBeats.push(performanceData);
      }

      // Biggest upsets (won as big underdog)
      if (spread >= 10 && atsMargin > 0) {
        metrics.bestWorst.biggestUpsets.push(performanceData);
      }
    });

    // Calculate final metrics
    const totalAtsGames = metrics.overallRecord.wins + metrics.overallRecord.losses;
    metrics.winPercentage = totalAtsGames > 0 ? (metrics.overallRecord.wins / totalAtsGames) * 100 : 0;
    metrics.avgSpread = totalGames > 0 ? totalSpread / totalGames : 0;
    metrics.avgMargin = totalGames > 0 ? totalMargin / totalGames : 0;
    metrics.roi = totalGames > 0 ? (totalROI / (totalGames * 100)) * 100 : 0;

    // Process yearly data
    metrics.yearlyData = Object.keys(yearlyStats).map(year => {
      const stats = yearlyStats[year];
      const atsGames = stats.wins + stats.losses;
      return {
        year: parseInt(year),
        ...stats,
        winPercentage: atsGames > 0 ? (stats.wins / atsGames) * 100 : 0
      };
    }).sort((a, b) => a.year - b.year);

    // Sort performance arrays
    metrics.bestWorst.bestCovers.sort((a, b) => b.margin - a.margin).splice(10);
    metrics.bestWorst.worstBeats.sort((a, b) => a.margin - b.margin).splice(10);
    metrics.bestWorst.biggestUpsets.sort((a, b) => b.spread - a.spread).splice(5);

    return metrics;
  },

  // Get team ATS performance with enhanced analysis
  getTeamATSAnalysis: async (team, years = 10) => {
    try {
      const { games, lines } = await bettingService.getATSHistory(team, years);
      const metrics = bettingService.calculateATSMetrics(games, lines, team);
      
      return {
        success: true,
        data: metrics,
        metadata: {
          totalGames: games.length,
          linesFound: lines.length,
          estimatedLines: games.length - lines.length,
          analysisYears: years,
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error in getTeamATSAnalysis:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
};
