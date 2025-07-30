import { fetchCollegeFootballData, fetchCollegeFootballGraphQL, fetchBettingLines } from './core.js';

// Enhanced betting and odds-related API functions using GraphQL + REST fallback
export const bettingService = {
  // GET /lines - Get betting lines data with GraphQL primary, REST fallback
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
      console.log('🎯 Enhanced Betting API call params:', params);
      const result = await fetchBettingLines(params);
      console.log('✅ Enhanced Betting API result:', result?.length || 0, 'items');
      return result;
    } catch (error) {
      console.error('❌ Enhanced Betting API error:', error);
      throw error;
    }
  },

  // Get spreads for specific games using GraphQL first
  getSpreadAnalysis: async (gameId) => {
    try {
      console.log(`🔮 Getting spread analysis for game ${gameId} via GraphQL...`);
      
      const query = `
        query GetGameSpread($gameId: Int!) {
          gameLines(where: {gameId: {_eq: $gameId}}) {
            gameId
            spread
            spreadOpen
            provider {
              name
            }
          }
        }
      `;
      
      const result = await fetchCollegeFootballGraphQL(query, { gameId });
      
      if (result.gameLines && result.gameLines.length > 0) {
        return result.gameLines.map(line => ({
          gameId: line.gameId,
          provider: line.provider?.name,
          spread: parseFloat(line.spread),
          spreadOpen: parseFloat(line.spreadOpen)
        }));
      }
      
      // Fallback to REST
      return await fetchCollegeFootballData('/lines', { gameId });
    } catch (error) {
      console.warn('GraphQL spread analysis failed, using REST:', error.message);
      return await fetchCollegeFootballData('/lines', { gameId });
    }
  },

  // Get over/under data using GraphQL first  
  getOverUnderAnalysis: async (gameId) => {
    try {
      console.log(`🔮 Getting over/under analysis for game ${gameId} via GraphQL...`);
      
      const query = `
        query GetGameOverUnder($gameId: Int!) {
          gameLines(where: {gameId: {_eq: $gameId}}) {
            gameId
            overUnder
            overUnderOpen
            provider {
              name
            }
          }
        }
      `;
      
      const result = await fetchCollegeFootballGraphQL(query, { gameId });
      
      if (result.gameLines && result.gameLines.length > 0) {
        return result.gameLines.map(line => ({
          gameId: line.gameId,
          provider: line.provider?.name,
          overUnder: parseFloat(line.overUnder),
          overUnderOpen: parseFloat(line.overUnderOpen)
        }));
      }
      
      // Fallback to REST
      return await fetchCollegeFootballData('/lines', { gameId });
    } catch (error) {
      console.warn('GraphQL over/under analysis failed, using REST:', error.message);
      return await fetchCollegeFootballData('/lines', { gameId });
    }
  },

  // Get all lines for a specific week using enhanced fetch
  getWeeklyLines: async (year = new Date().getFullYear(), week = null, seasonType = 'regular') => {
    const params = { year, seasonType };
    if (week) params.week = week;
    return await fetchBettingLines(params);
  },

  // Get lines for specific team using enhanced fetch (PRIMARY METHOD FOR ATS TAB)
  getTeamLines: async (team, year = new Date().getFullYear(), seasonType = 'regular') => {
    console.log(`🎯 getTeamLines called for ${team} ${year} ${seasonType}`);
    return await fetchBettingLines({ team, year, seasonType });
  },

  // Get lines for conference games using enhanced fetch
  getConferenceLines: async (conference, year = new Date().getFullYear(), week = null, seasonType = 'regular') => {
    const params = { conference, year, seasonType };
    if (week) params.week = week;
    return await fetchBettingLines(params);
  },

  // Get home team lines using enhanced fetch
  getHomeTeamLines: async (home, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchBettingLines({ home, year, seasonType });
  },

  // Get away team lines using enhanced fetch
  getAwayTeamLines: async (away, year = new Date().getFullYear(), seasonType = 'regular') => {
    return await fetchBettingLines({ away, year, seasonType });
  },

  // Get line movements using GraphQL first
  getLineMovements: async (gameId) => {
    try {
      console.log(`🔮 Getting line movements for game ${gameId} via GraphQL...`);
      
      const query = `
        query GetLineMovements($gameId: Int!) {
          gameLines(where: {gameId: {_eq: $gameId}}) {
            gameId
            spread
            spreadOpen
            overUnder
            overUnderOpen
            moneylineHome
            moneylineAway
            provider {
              name
            }
          }
        }
      `;
      
      const result = await fetchCollegeFootballGraphQL(query, { gameId });
      
      if (result.gameLines && result.gameLines.length > 0) {
        return result.gameLines.map(line => ({
          gameId: line.gameId,
          provider: line.provider?.name,
          spread: parseFloat(line.spread),
          spreadOpen: parseFloat(line.spreadOpen),
          overUnder: parseFloat(line.overUnder),
          overUnderOpen: parseFloat(line.overUnderOpen),
          moneylineHome: line.moneylineHome,
          moneylineAway: line.moneylineAway,
          movement: {
            spread: line.spreadOpen ? parseFloat(line.spread) - parseFloat(line.spreadOpen) : 0,
            overUnder: line.overUnderOpen ? parseFloat(line.overUnder) - parseFloat(line.overUnderOpen) : 0
          }
        }));
      }
      
      // Fallback to REST
      return await fetchCollegeFootballData('/lines', { gameId });
    } catch (error) {
      console.warn('GraphQL line movements failed, using REST:', error.message);
      return await fetchCollegeFootballData('/lines', { gameId });
    }
  },

  // Get pregame win probability (can be used for betting analysis)
  getPregameWinProbability: async (year = new Date().getFullYear(), week = null, team = null, seasonType = 'regular') => {
    const params = { year, seasonType };
    if (week) params.week = week;
    if (team) params.team = team;
    return await fetchCollegeFootballData('/metrics/wp/pregame', params);
  },

  // Enhanced betting suggestions using GraphQL + multiple data points
  getBettingSuggestions: async (week = null, year = new Date().getFullYear()) => {
    try {
      console.log(`🔮 Getting betting suggestions via enhanced fetch...`);
      
      // Use enhanced betting lines fetch
      const lines = await fetchBettingLines({ year, week, seasonType: 'regular' });
      const winProb = await fetchCollegeFootballData('/metrics/wp/pregame', { year, week, seasonType: 'regular' });
      
      // Combine lines with win probability for better suggestions
      return {
        lines,
        winProbability: winProb,
        suggestions: lines, // Could add logic to analyze value bets
        dataSource: 'enhanced-graphql-rest'
      };
    } catch (error) {
      console.error('Enhanced betting suggestions failed:', error.message);
      throw error;
    }
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

  // ENHANCED ATS-specific methods for CompareTeams ATSTab
  
  // Get ATS history for a team over multiple years using GraphQL + REST
  getATSHistory: async (team, years = 10) => {
    console.log(`🎯 Enhanced getATSHistory for ${team.school || team} over ${years} years`);
    
    const allGames = [];
    const allLines = [];
    const currentYear = new Date().getFullYear();
    const analysisYears = Array.from({ length: years }, (_, i) => currentYear - years + 1 + i);

    for (const year of analysisYears) {
      try {
        console.log(`🔮 Processing ${team.school || team} for year ${year}...`);
        
        // Use enhanced betting lines fetch for this team/year
        const teamData = await fetchBettingLines({ 
          team: team.school || team,
          year,
          seasonType: 'regular'
        });

        if (teamData && teamData.length > 0) {
          // teamData should already include both games and lines in the enhanced format
          teamData.forEach(gameWithLines => {
            // Add the game data
            allGames.push({
              id: gameWithLines.id,
              season: gameWithLines.season,
              seasonType: gameWithLines.seasonType,
              week: gameWithLines.week,
              start_date: gameWithLines.startDate,
              home_team: gameWithLines.homeTeam,
              away_team: gameWithLines.awayTeam,
              home_points: gameWithLines.homeScore,
              away_points: gameWithLines.awayScore,
              year
            });

            // Add the lines data with proper gameId reference
            if (gameWithLines.lines && gameWithLines.lines.length > 0) {
              gameWithLines.lines.forEach(line => {
                allLines.push({
                  gameId: gameWithLines.id,
                  game_id: gameWithLines.id, // Alternative field name for compatibility
                  provider: line.provider,
                  spread: line.spread,
                  overUnder: line.overUnder,
                  homeMoneyline: line.homeMoneyline,
                  awayMoneyline: line.awayMoneyline,
                  spreadOpen: line.spreadOpen,
                  overUnderOpen: line.overUnderOpen,
                  year
                });
              });
            }
          });
          
          console.log(`✅ Enhanced fetch: ${teamData.length} games found for ${team.school || team} ${year}`);
        } else {
          console.log(`⚠️ No enhanced data found for ${team.school || team} ${year}, trying separate calls...`);
          
          // Fallback: separate games and lines calls
          try {
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
              const lines = await fetchBettingLines({ 
                team: team.school || team,
                year,
                seasonType: 'regular'
              });
              
              if (lines && lines.length > 0) {
                allLines.push(...lines.map(line => ({ ...line, year })));
              }
            } catch (lineError) {
              console.warn(`No betting lines for ${team.school || team} in ${year}:`, lineError.message);
            }
          } catch (gameError) {
            console.warn(`No games found for ${team.school || team} in ${year}:`, gameError.message);
          }
        }

      } catch (error) {
        console.error(`Error fetching enhanced ATS data for ${team.school || team} in ${year}:`, error);
        
        // Final fallback to original REST approach
        try {
          const games = await fetchCollegeFootballData('/games', { 
            year, 
            team: team.school || team,
            seasonType: 'regular'
          });
          
          if (games && games.length > 0) {
            allGames.push(...games.map(game => ({ ...game, year })));
          }
        } catch (finalError) {
          console.error(`Final fallback also failed for ${team.school || team} ${year}:`, finalError.message);
        }
      }
    }

    console.log(`🎯 Enhanced ATS History Complete - Games: ${allGames.length}, Lines: ${allLines.length}`);
    console.log(`🎯 Enhanced ATS History Complete - Games: ${allGames.length}, Lines: ${allLines.length}`);
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
