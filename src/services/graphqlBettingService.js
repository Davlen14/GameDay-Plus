// GraphQL Betting Service for College Football Data API
import { API_CONFIG } from './api';

class GraphQLBettingService {
  constructor() {
    this.baseURL = 'https://graphql.collegefootballdata.com/v1/graphql';
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.key}`
    };
  }

  async executeQuery(query, variables = {}) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query,
          variables
        })
      });

      if (!response.ok) {
        throw new Error(`GraphQL HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        throw new Error(`GraphQL error: ${data.errors[0]?.message || 'Unknown error'}`);
      }

      return data.data;
    } catch (error) {
      console.error('GraphQL query failed:', error);
      throw error;
    }
  }

  // Get all available sportsbook providers
  async getProviders() {
    const query = `
      query GetProviders {
        linesProvider(limit: 50) {
          id
          name
        }
      }
    `;

    const data = await this.executeQuery(query);
    return data.linesProvider || [];
  }

  // Get betting lines for games with filtering
  async getGameLines(filters = {}) {
    const {
      limit = 100,
      gameIds = null,
      providers = null,
      seasonType = 'regular'
    } = filters;

    let whereClause = '';
    let gameFilter = '';

    // Build where clause for gameLines
    const conditions = [];
    if (providers && providers.length > 0) {
      const providerNames = providers.map(p => `"${p}"`).join(', ');
      conditions.push(`provider: {name: {_in: [${providerNames}]}}`);
    }
    
    if (conditions.length > 0) {
      whereClause = `where: {${conditions.join(', ')}}`;
    }

    // Build game filter if gameIds provided
    if (gameIds && gameIds.length > 0) {
      const gameIdList = gameIds.join(', ');
      gameFilter = `where: {id: {_in: [${gameIdList}]}}`;
    }

    const query = `
      query GetGameLines {
        gameLines(${whereClause}, limit: ${limit}) {
          gameId
          provider {
            id
            name
          }
          spread
          moneylineHome
          moneylineAway
          overUnder
          overUnderOpen
          spreadOpen
          game {
            id
            week
            seasonType
            homeTeam {
              id
              school
              abbreviation
              logos
            }
            awayTeam {
              id
              school
              abbreviation
              logos
            }
            startDate
            venue {
              name
              city
              state
            }
          }
        }
      }
    `;

    const data = await this.executeQuery(query);
    return this.processGameLines(data.gameLines || []);
  }

  // Get betting lines by specific week and year
  async getGameLinesByWeek(year, week, seasonType = 'regular') {
    // First get games for the week, then get lines for those games
    const gamesQuery = `
      query GetGamesByWeek {
        game(where: {year: {_eq: ${year}}, week: {_eq: ${week}}, seasonType: {_eq: "${seasonType}"}}, limit: 100) {
          id
          week
          seasonType
          homeTeam {
            id
            school
            abbreviation
            logos
          }
          awayTeam {
            id
            school
            abbreviation
            logos
          }
          startDate
          venue {
            name
            city
            state
          }
        }
      }
    `;

    const gamesData = await this.executeQuery(gamesQuery);
    const games = gamesData.game || [];
    
    if (games.length === 0) {
      return [];
    }

    const gameIds = games.map(g => g.id);
    
    // Now get lines for these games
    const linesQuery = `
      query GetLinesForGames {
        gameLines(where: {gameId: {_in: [${gameIds.join(', ')}]}}, limit: 500) {
          gameId
          provider {
            id
            name
          }
          spread
          moneylineHome
          moneylineAway
          overUnder
          overUnderOpen
          spreadOpen
        }
      }
    `;

    const linesData = await this.executeQuery(linesQuery);
    const lines = linesData.gameLines || [];

    // Combine games with their lines
    return this.combineGamesWithLines(games, lines);
  }

  // Process and structure game lines data
  processGameLines(rawLines) {
    // Group lines by game
    const gameMap = new Map();

    rawLines.forEach(line => {
      const gameId = line.gameId;
      
      if (!gameMap.has(gameId)) {
        gameMap.set(gameId, {
          id: gameId,
          game: line.game,
          lines: []
        });
      }

      gameMap.get(gameId).lines.push({
        provider: line.provider.name,
        providerId: line.provider.id,
        spread: line.spread,
        moneylineHome: line.moneylineHome,
        moneylineAway: line.moneylineAway,
        overUnder: line.overUnder,
        overUnderOpen: line.overUnderOpen,
        spreadOpen: line.spreadOpen
      });
    });

    return Array.from(gameMap.values());
  }

  // Combine games with their betting lines
  combineGamesWithLines(games, lines) {
    const linesByGame = new Map();

    // Group lines by gameId
    lines.forEach(line => {
      const gameId = line.gameId;
      if (!linesByGame.has(gameId)) {
        linesByGame.set(gameId, []);
      }
      
      linesByGame.get(gameId).push({
        provider: line.provider.name,
        providerId: line.provider.id,
        spread: line.spread,
        moneylineHome: line.moneylineHome,
        moneylineAway: line.moneylineAway,
        overUnder: line.overUnder,
        overUnderOpen: line.overUnderOpen,
        spreadOpen: line.spreadOpen
      });
    });

    // Combine games with their lines
    return games.map(game => ({
      id: game.id,
      week: game.week,
      seasonType: game.seasonType,
      homeTeam: game.homeTeam?.school || 'Unknown',
      awayTeam: game.awayTeam?.school || 'Unknown',
      homeTeamId: game.homeTeam?.id,
      awayTeamId: game.awayTeam?.id,
      homeTeamAbbr: game.homeTeam?.abbreviation,
      awayTeamAbbr: game.awayTeam?.abbreviation,
      homeTeamLogos: game.homeTeam?.logos || [],
      awayTeamLogos: game.awayTeam?.logos || [],
      startDate: game.startDate,
      venue: game.venue,
      lines: linesByGame.get(game.id) || []
    }));
  }

  // Get games with arbitrage opportunities
  async getArbitrageGames(year, week, seasonType = 'regular') {
    const games = await this.getGameLinesByWeek(year, week, seasonType);
    
    return games.map(game => {
      // Calculate arbitrage for each game
      const arbitrageData = this.calculateArbitrage(game.lines);
      
      return {
        ...game,
        ...arbitrageData
      };
    }).filter(game => game.lines.length >= 2); // Only games with multiple sportsbooks
  }

  // Calculate arbitrage opportunities for a set of lines
  calculateArbitrage(lines) {
    if (!lines || lines.length < 2) {
      return {
        hasArbitrage: false,
        bestProfit: 0,
        bestCombination: null
      };
    }

    let bestProfit = 0;
    let bestCombination = null;
    let hasArbitrage = false;

    // Check moneyline arbitrage
    const validMoneylines = lines.filter(line => 
      line.moneylineHome !== null && line.moneylineAway !== null
    );

    if (validMoneylines.length >= 2) {
      const bestHome = validMoneylines.reduce((best, current) => 
        (current.moneylineHome > best.moneylineHome) ? current : best
      );
      
      const bestAway = validMoneylines.reduce((best, current) => 
        (current.moneylineAway > best.moneylineAway) ? current : best
      );

      if (bestHome.provider !== bestAway.provider) {
        // Calculate implied probabilities
        const homeImplied = this.calculateImpliedProbability(bestHome.moneylineHome);
        const awayImplied = this.calculateImpliedProbability(bestAway.moneylineAway);
        
        const totalImplied = homeImplied + awayImplied;
        
        if (totalImplied < 1.0) {
          hasArbitrage = true;
          const profit = ((1 / totalImplied) - 1) * 100;
          
          if (profit > bestProfit) {
            bestProfit = profit;
            bestCombination = {
              type: 'moneyline',
              homeBet: {
                provider: bestHome.provider,
                odds: bestHome.moneylineHome,
                stake: (1 / totalImplied) * homeImplied * 100
              },
              awayBet: {
                provider: bestAway.provider,
                odds: bestAway.moneylineAway,
                stake: (1 / totalImplied) * awayImplied * 100
              }
            };
          }
        }
      }
    }

    return {
      hasArbitrage,
      bestProfit,
      bestCombination
    };
  }

  // Calculate implied probability from American odds
  calculateImpliedProbability(americanOdds) {
    if (americanOdds > 0) {
      return 100 / (americanOdds + 100);
    } else {
      return Math.abs(americanOdds) / (Math.abs(americanOdds) + 100);
    }
  }

  // Get current week based on date
  getCurrentWeek() {
    const now = new Date();
    const seasonStart = new Date(now.getFullYear(), 7, 15); // Approximate season start
    const weeksSinceStart = Math.floor((now - seasonStart) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, Math.min(weeksSinceStart + 1, 15));
  }

  // Get current year
  getCurrentYear() {
    const now = new Date();
    return now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  }
}

export const graphqlBettingService = new GraphQLBettingService();
