import { fetchCollegeFootballData } from './core';

// Enhanced Game Statistics Service - mirrors Swift app functionality
export const gameStatsService = {
  // Get comprehensive game statistics with caching
  getGameStats: async (gameId, options = {}) => {
    const { useCache = true, retryCount = 0 } = options;
    
    try {
      // Parallel API calls for all game stats data
      const [teamStats, playerStats, gamePPA, playerPPA] = await Promise.allSettled([
        gameStatsService.getGameTeamStats(gameId),
        gameStatsService.getGamePlayerStats(gameId),
        gameStatsService.getGamePPA(gameId),
        gameStatsService.getPlayerGamePPA(gameId)
      ]);

      // Transform the data to expected format
      const transformedTeamStats = teamStats.status === 'fulfilled' 
        ? gameStatsService.logic.transformTeamStats(teamStats.value) 
        : [];
        
      const transformedPlayerStats = playerStats.status === 'fulfilled' 
        ? gameStatsService.logic.transformPlayerStats(playerStats.value) 
        : [];

      const result = {
        teamStats: transformedTeamStats,
        playerStats: transformedPlayerStats,
        gamePPA: gamePPA.status === 'fulfilled' ? gamePPA.value : null,
        playerPPA: playerPPA.status === 'fulfilled' ? playerPPA.value : [],
        errors: []
      };

      // Track any errors but don't fail completely
      [teamStats, playerStats, gamePPA, playerPPA].forEach((result, index) => {
        if (result.status === 'rejected') {
          const apiNames = ['teamStats', 'playerStats', 'gamePPA', 'playerPPA'];
          result.errors?.push({
            api: apiNames[index],
            error: result.reason?.message || 'Unknown error'
          });
        }
      });

      console.log('✅ Final transformed stats:', result);
      return result;
    } catch (error) {
      console.error('Error fetching game stats:', error);
      if (retryCount < 2) {
        console.log(`Retrying game stats fetch (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return gameStatsService.getGameStats(gameId, { ...options, retryCount: retryCount + 1 });
      }
      throw error;
    }
  },

  // Get team statistics for a specific game
  getGameTeamStats: async (gameId) => {
    try {
      return await fetchCollegeFootballData('/games/teams', { id: gameId });
    } catch (error) {
      console.error('Error fetching team stats:', error);
      return [];
    }
  },

  // Get player statistics for a specific game  
  getGamePlayerStats: async (gameId) => {
    try {
      return await fetchCollegeFootballData('/games/players', { id: gameId });
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return [];
    }
  },

  // Get PPA (Predicted Points Added) data for game
  getGamePPA: async (gameId) => {
    try {
      // Get current game to determine year/week for PPA API
      const currentYear = new Date().getFullYear();
      const ppaData = await fetchCollegeFootballData('/ppa/games', { 
        year: currentYear, 
        gameId: gameId 
      });
      return ppaData?.length > 0 ? ppaData[0] : null;
    } catch (error) {
      console.error('Error fetching game PPA:', error);
      return null;
    }
  },

  // Get player-level PPA data for game
  getPlayerGamePPA: async (gameId) => {
    try {
      const currentYear = new Date().getFullYear();
      return await fetchCollegeFootballData('/ppa/players/games', { 
        year: currentYear, 
        gameId: gameId 
      });
    } catch (error) {
      console.error('Error fetching player PPA:', error);
      return [];
    }
  },

  // Game Stats Logic Helper Functions (mirrors Swift GameStatsLogic)
  logic: {
    // Transform API response to flatten team stats
    transformTeamStats: (teamStats) => {
      if (!teamStats || !Array.isArray(teamStats)) return [];
      
      const flattened = [];
      
      teamStats.forEach(gameData => {
        if (gameData.teams && Array.isArray(gameData.teams)) {
          gameData.teams.forEach(team => {
            // Convert stats array to object for easier access
            const statsObj = {};
            if (team.stats && Array.isArray(team.stats)) {
              team.stats.forEach(stat => {
                statsObj[stat.category] = stat.stat;
              });
            }
            
            // Create flattened team stat object
            const flatTeam = {
              school: team.team,
              teamId: team.teamId,
              team: team.team,
              conference: team.conference,
              homeAway: team.homeAway,
              points: team.points,
              
              // Extract common stats with fallbacks
              totalYards: parseInt(statsObj.totalYards) || 0,
              netPassingYards: parseInt(statsObj.netPassingYards) || 0,
              rushingYards: parseInt(statsObj.rushingYards) || 0,
              firstDowns: parseInt(statsObj.firstDowns) || 0,
              thirdDownEff: statsObj.thirdDownEff || '0-0',
              possessionTime: statsObj.possessionTime || '0:00',
              turnovers: parseInt(statsObj.turnovers) || 0,
              sacks: parseInt(statsObj.sacks) || 0,
              tackles: parseInt(statsObj.tackles) || 0,
              passesIntercepted: parseInt(statsObj.passesIntercepted) || 0,
              tacklesForLoss: parseInt(statsObj.tacklesForLoss) || 0,
              
              // Keep raw stats for advanced access
              rawStats: statsObj
            };
            
            flattened.push(flatTeam);
          });
        }
      });
      
      console.log('🔄 Transformed team stats:', flattened);
      return flattened;
    },

    // Transform player stats to flattened format
    transformPlayerStats: (playerStats) => {
      if (!playerStats || !Array.isArray(playerStats)) return [];
      
      const flattened = [];
      
      playerStats.forEach(gameData => {
        if (gameData.teams && Array.isArray(gameData.teams)) {
          gameData.teams.forEach(team => {
            if (team.categories && Array.isArray(team.categories)) {
              team.categories.forEach(category => {
                if (category.types && Array.isArray(category.types)) {
                  category.types.forEach(type => {
                    if (type.athletes && Array.isArray(type.athletes)) {
                      type.athletes.forEach(athlete => {
                        flattened.push({
                          team: team.team,
                          player: athlete.name,
                          playerId: athlete.id,
                          category: category.name,
                          statType: type.name,
                          stat: parseFloat(athlete.stat) || 0,
                          statValue: athlete.stat,
                          numericValue: parseFloat(athlete.stat) || 0
                        });
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
      
      console.log('🔄 Transformed player stats:', flattened.length, 'records');
      return flattened;
    },

    // Get team stats for home or away team
    getTeamStats: (isHome, game, teamStats) => {
      if (!teamStats || !game) return null;
      
      const teamName = isHome ? game.home_team : game.away_team;
      const homeAway = isHome ? 'home' : 'away';
      
      console.log(`🔍 Looking for ${homeAway} team: ${teamName}`);
      
      return teamStats.find(stat => 
        stat.team === teamName || stat.homeAway === homeAway
      );
    },

    // Parse efficiency string (e.g., "5-12" to { made: 5, attempts: 12, percentage: 41.67 })
    parseEfficiency: (efficiencyStr) => {
      if (!efficiencyStr || typeof efficiencyStr !== 'string') return null;
      
      const match = efficiencyStr.match(/(\d+)-(\d+)/);
      if (!match) return null;
      
      const made = parseInt(match[1]);
      const attempts = parseInt(match[2]);
      const percentage = attempts > 0 ? (made / attempts) * 100 : 0;
      
      return { made, attempts, percentage };
    },

    // Parse possession time (e.g., "28:30" to 28.5 minutes)
    parsePossessionTime: (timeStr) => {
      if (!timeStr || typeof timeStr !== 'string') return null;
      
      const match = timeStr.match(/(\d+):(\d+)/);
      if (!match) return null;
      
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      
      return minutes + (seconds / 60);
    },

    // Get top players by category
    getTopPassers: (isHome, game, playerStats) => {
      const teamName = isHome ? game.home_team : game.away_team;
      return playerStats
        .filter(p => p.team === teamName && p.category === 'passing')
        .sort((a, b) => (b.stat || 0) - (a.stat || 0));
    },

    getTopRushers: (isHome, game, playerStats) => {
      const teamName = isHome ? game.home_team : game.away_team;
      return playerStats
        .filter(p => p.team === teamName && p.category === 'rushing')
        .sort((a, b) => (b.stat || 0) - (a.stat || 0));
    },

    getTopReceivers: (isHome, game, playerStats) => {
      const teamName = isHome ? game.home_team : game.away_team;
      return playerStats
        .filter(p => p.team === teamName && p.category === 'receiving')
        .sort((a, b) => (b.stat || 0) - (a.stat || 0));
    },

    getTopDefenders: (isHome, game, playerStats) => {
      const teamName = isHome ? game.home_team : game.away_team;
      return playerStats
        .filter(p => p.team === teamName && p.category === 'defensive')
        .sort((a, b) => (b.stat || 0) - (a.stat || 0));
    },

    // Calculate game outcome analysis
    getGameOutcome: (game, teamStats) => {
      const homeScore = game.home_points || 0;
      const awayScore = game.away_points || 0;
      const scoreDifference = Math.abs(homeScore - awayScore);
      
      return {
        homeScore,
        awayScore,
        winner: homeScore > awayScore ? 'home' : awayScore > homeScore ? 'away' : 'tie',
        scoreDifference,
        margin: homeScore > awayScore ? homeScore - awayScore : awayScore - homeScore,
        gameType: scoreDifference > 21 ? 'blowout' : scoreDifference > 14 ? 'decisive' : scoreDifference > 7 ? 'close' : 'very-close'
      };
    },

    // Generate game analysis text
    generateGameAnalysis: (game, teamStats, playerStats) => {
      const outcome = gameStatsService.logic.getGameOutcome(game, teamStats);
      const homeTeam = game.home_team;
      const awayTeam = game.away_team;
      
      let analysis = '';
      
      if (outcome.gameType === 'blowout') {
        analysis = `${outcome.winner === 'home' ? homeTeam : awayTeam} dominated this matchup with a commanding ${outcome.margin}-point victory. `;
      } else if (outcome.gameType === 'close') {
        analysis = `This was a tightly contested battle that came down to the wire, with ${outcome.winner === 'home' ? homeTeam : awayTeam} pulling out a ${outcome.margin}-point victory. `;
      } else {
        analysis = `${outcome.winner === 'home' ? homeTeam : awayTeam} secured a solid ${outcome.margin}-point win in this matchup. `;
      }

      // Add statistical context if available
      const homeStats = gameStatsService.logic.getTeamStats(true, game, teamStats);
      const awayStats = gameStatsService.logic.getTeamStats(false, game, teamStats);
      
      if (homeStats && awayStats) {
        const totalYardsDiff = Math.abs(homeStats.totalYards - awayStats.totalYards);
        if (totalYardsDiff > 200) {
          const yardLeader = homeStats.totalYards > awayStats.totalYards ? homeTeam : awayTeam;
          analysis += `${yardLeader} significantly outgained their opponent with a ${totalYardsDiff}-yard advantage.`;
        }
      }

      return analysis;
    }
  }
};

export default gameStatsService;
