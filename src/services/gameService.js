import { fetchCollegeFootballData } from './core';
import graphqlService from './graphqlService';

// Game and schedule-related API functions using hybrid GraphQL/REST approach
export const gameService = {
  // GET /games - Get games data (hybrid approach)
  getGames: async (year = null, week = null, seasonType = 'regular', team = null, home = null, away = null, conference = null, classification = 'fbs', id = null, useGraphQL = true) => {
    if (useGraphQL && !id) { // GraphQL doesn't support ID lookup yet
      try {
        const filters = {};
        if (year) filters.season = year;
        if (week) filters.week = week;
        if (seasonType) filters.seasonType = seasonType;
        if (team) filters.team = team;
        if (conference) filters.conference = conference;
        if (classification === 'fbs') {
          // GraphQL can filter by completed status and other criteria
          // but classification filtering will need to be done post-query
        }

        const games = await graphqlService.games.get(filters);
        
        // Apply any additional filtering that GraphQL doesn't support
        let filteredGames = games;
        
        if (home) {
          filteredGames = filteredGames.filter(game => game.home_team === home);
        }
        
        if (away) {
          filteredGames = filteredGames.filter(game => game.away_team === away);
        }

        // Transform GraphQL response to match REST format
        return filteredGames.map(game => ({
          id: game.id,
          season: game.season,
          week: game.week,
          season_type: game.season_type,
          start_date: game.start_date,
          start_time_tbd: game.start_time_tbd,
          completed: game.completed,
          neutral_site: game.neutral_site,
          conference_game: game.conference_game,
          attendance: game.attendance,
          venue_id: game.venue_id,
          venue: game.venue,
          home_id: game.home_id,
          home_team: game.home_team,
          home_conference: game.home_conference,
          home_division: game.home_division,
          home_points: game.home_points,
          home_line_scores: game.home_line_scores,
          home_post_win_prob: game.home_post_win_prob,
          home_pregame_elo: game.home_pregame_elo,
          home_postgame_elo: game.home_postgame_elo,
          away_id: game.away_id,
          away_team: game.away_team,
          away_conference: game.away_conference,
          away_division: game.away_division,
          away_points: game.away_points,
          away_line_scores: game.away_line_scores,
          away_post_win_prob: game.away_post_win_prob,
          away_pregame_elo: game.away_pregame_elo,
          away_postgame_elo: game.away_postgame_elo,
          excitement_index: game.excitement_index,
          highlights: game.highlights,
          notes: game.notes
        }));
      } catch (error) {
        console.warn('GraphQL games failed, falling back to REST:', error);
        // Fall through to REST implementation
      }
    }

    // REST implementation (original)
    const params = {};
    // Year is required except when id is specified
    if (id) {
      params.id = id;
    } else {
      if (!year) year = new Date().getFullYear();
      params.year = year;
    }
    
    if (seasonType) params.seasonType = seasonType;
    if (classification) params.classification = classification;
    if (week) params.week = week;
    if (team) params.team = team;
    if (home) params.home = home;
    if (away) params.away = away;
    if (conference) params.conference = conference;
    
    return await fetchCollegeFootballData('/games', params);
  },

  // Get games by team (optimized with GraphQL)
  getGamesByTeam: async (teamName, season = null, limit = null, useGraphQL = true) => {
    if (useGraphQL) {
      try {
        return await graphqlService.games.getByTeam(teamName, season, limit);
      } catch (error) {
        console.warn('GraphQL team games failed, falling back to REST:', error);
        const params = { team: teamName };
        if (season) params.year = season;
        return await fetchCollegeFootballData('/games', params);
      }
    } else {
      const params = { team: teamName };
      if (season) params.year = season;
      return await fetchCollegeFootballData('/games', params);
    }
  },

  // Get games by week (optimized with GraphQL)
  getGamesByWeek: async (season, week, seasonType = 'regular', useGraphQL = true) => {
    if (useGraphQL) {
      try {
        return await graphqlService.games.getByWeek(season, week, seasonType);
      } catch (error) {
        console.warn('GraphQL week games failed, falling back to REST:', error);
        return await fetchCollegeFootballData('/games', { 
          year: season, 
          week, 
          seasonType 
        });
      }
    } else {
      return await fetchCollegeFootballData('/games', { 
        year: season, 
        week, 
        seasonType 
      });
    }
  },

  // GET /games/teams - Get team game stats  
  getGameTeamStats: async (year = null, week = null, seasonType = 'regular', team = null, conference = null, classification = 'fbs', id = null) => {
    const params = {};
    
    // Year is required along with one of week, team, or conference, unless id is specified
    if (id) {
      params.id = id;
    } else {
      if (!year) year = new Date().getFullYear();
      params.year = year;
      
      // Need at least one of week, team, or conference
      if (week) params.week = week;
      if (team) params.team = team;
      if (conference) params.conference = conference;
    }
    
    if (seasonType) params.seasonType = seasonType;
    if (classification) params.classification = classification;
    
    return await fetchCollegeFootballData('/games/teams', params);
  },

  // GET /games/players - Get player game stats
  getGamePlayerStats: async (year = null, week = null, seasonType = 'regular', team = null, conference = null, classification = 'fbs', category = null, id = null) => {
    const params = {};
    
    // Year is required along with one of week, team, or conference, unless id is specified
    if (id) {
      params.id = id;
    } else {
      if (!year) year = new Date().getFullYear();
      params.year = year;
      
      // Need at least one of week, team, or conference
      if (week) params.week = week;
      if (team) params.team = team;
      if (conference) params.conference = conference;
    }
    
    if (seasonType) params.seasonType = seasonType;
    if (classification) params.classification = classification;
    if (category) params.category = category;
    
    return await fetchCollegeFootballData('/games/players', params);
  },

  // GET /games/media - Get game media information
  getGameMedia: async (year, week = null, seasonType = 'regular', team = null, conference = null, classification = 'fbs', mediaType = null) => {
    const params = { year, seasonType };
    if (classification) params.classification = classification;
    if (week) params.week = week;
    if (team) params.team = team;
    if (conference) params.conference = conference;
    if (mediaType) params.mediaType = mediaType;
    return await fetchCollegeFootballData('/games/media', params);
  },

  // GET /games/weather - Get game weather data
  getGameWeather: async (gameId = null, year = null, week = null, seasonType = 'regular', team = null, conference = null) => {
    const params = {};
    if (gameId) params.gameId = gameId;
    if (year) params.year = year;
    if (week) params.week = week;
    if (seasonType) params.seasonType = seasonType;
    if (team) params.team = team;
    if (conference) params.conference = conference;
    return await fetchCollegeFootballData('/games/weather', params);
  },

  // GET /records - Get team records
  getRecords: async (year = new Date().getFullYear(), team = null, conference = null) => {
    const params = { year };
    if (team) params.team = team;
    if (conference) params.conference = conference;
    return await fetchCollegeFootballData('/records', params);
  },

  // GET /calendar - Get game calendar
  getCalendar: async (year = new Date().getFullYear()) => {
    return await fetchCollegeFootballData('/calendar', { year });
  },

  // GET /scoreboard - Get scoreboard data
  getScoreboard: async (classification = 'fbs', conference = null) => {
    const params = { classification };
    if (conference) params.conference = conference;
    return await fetchCollegeFootballData('/scoreboard', params);
  },

  // GET /game/box/advanced - Get advanced box score
  getAdvancedBoxScore: async (id) => {
    return await fetchCollegeFootballData('/game/box/advanced', { id });
  },

  // GET /ppa/games - Get game PPA data
  getGamePPA: async (year = new Date().getFullYear(), week = null, team = null, conference = null, excludeGarbageTime = true) => {
    const params = { year, excludeGarbageTime };
    if (week) params.week = week;
    if (team) params.team = team;
    if (conference) params.conference = conference;
    return await fetchCollegeFootballData('/ppa/games', params);
  },

  // GET /metrics/wp - Get win probability data
  getWinProbability: async (gameId) => {
    return await fetchCollegeFootballData('/metrics/wp', { gameId });
  },

  // GET /metrics/wp/pregame - Get pregame win probability
  getPregameWinProbability: async (year = new Date().getFullYear(), week = null, team = null, seasonType = 'regular') => {
    const params = { year, seasonType };
    if (week) params.week = week;
    if (team) params.team = team;
    return await fetchCollegeFootballData('/metrics/wp/pregame', params);
  },

  // Get postseason games (bowl games, playoffs, championships)
  // Based on API analysis: all postseason games use week=1 and seasonType="postseason"
  getPostseasonGames: async (season, useGraphQL = true) => {
    try {
      console.log(`🏆 Loading postseason games for ${season} (week=1, seasonType=postseason)...`);
      
      // Method 1: Use getGamesByWeek with week=1 and seasonType=postseason
      try {
        let postseasonGames = await gameService.getGamesByWeek(season, 1, 'postseason', useGraphQL);
        if (postseasonGames && postseasonGames.length > 0) {
          console.log(`✅ Method 1 success: Found ${postseasonGames.length} postseason games using getGamesByWeek`);
          return postseasonGames;
        }
      } catch (error) {
        console.log(`⚠️ Method 1 failed: ${error.message}`);
      }
      
      // Method 2: Use general getGames with week=1 and seasonType=postseason
      try {
        console.log(`🔄 Method 2: using getGames with week=1 and seasonType=postseason...`);
        let postseasonGames = await gameService.getGames(season, 1, 'postseason', null, null, null, null, 'fbs', null, useGraphQL);
        if (postseasonGames && postseasonGames.length > 0) {
          console.log(`✅ Method 2 success: Found ${postseasonGames.length} postseason games using getGames`);
          return postseasonGames;
        }
      } catch (error) {
        console.log(`⚠️ Method 2 failed: ${error.message}`);
      }
      
      // Method 3: Try different postseason weeks (some APIs use different week numbering)
      console.log(`🔄 Method 3: trying different postseason weeks...`);
      for (let week = 1; week <= 5; week++) {
        try {
          let postseasonGames = await gameService.getGames(season, week, 'postseason', null, null, null, null, 'fbs', null, useGraphQL);
          if (postseasonGames && postseasonGames.length > 0) {
            console.log(`✅ Method 3 success: Found ${postseasonGames.length} postseason games for week ${week}`);
            return postseasonGames;
          }
        } catch (error) {
          console.log(`⚠️ Method 3 week ${week} failed: ${error.message}`);
        }
      }
      
      // Method 4: Load all regular season games and filter for completed games with bowl/playoff characteristics
      try {
        console.log(`🔄 Method 4: loading all games and filtering for postseason characteristics...`);
        const allGames = await gameService.getGames(season, null, 'regular', null, null, null, null, 'fbs', null, useGraphQL);
        const potentialPostseasonGames = allGames.filter(game => {
          // Look for games that might be postseason based on notes, timing, or naming
          const notes = (game.notes || '').toLowerCase();
          const hasPostseasonKeywords = notes.includes('bowl') ||
                                        notes.includes('playoff') ||
                                        notes.includes('championship') ||
                                        notes.includes('cfp') ||
                                        notes.includes('national championship') ||
                                        notes.includes('cotton bowl') ||
                                        notes.includes('orange bowl') ||
                                        notes.includes('sugar bowl') ||
                                        notes.includes('rose bowl') ||
                                        notes.includes('fiesta bowl') ||
                                        notes.includes('peach bowl');
          
          // Check if game is in late December/January (typical bowl season)
          const startDate = game.start_date || game.startDate;
          let isInBowlSeason = false;
          if (startDate) {
            const gameDate = new Date(startDate);
            const month = gameDate.getMonth() + 1; // 0-based months
            isInBowlSeason = month === 12 || month === 1;
          }
          
          return hasPostseasonKeywords || (isInBowlSeason && game.week > 15);
        });
        
        if (potentialPostseasonGames && potentialPostseasonGames.length > 0) {
          console.log(`✅ Method 4 success: Found ${potentialPostseasonGames.length} potential postseason games by filtering`);
          return potentialPostseasonGames;
        }
      } catch (error) {
        console.log(`⚠️ Method 4 failed: ${error.message}`);
      }
      
      // Method 5: Try using 'both' seasonType and filter
      try {
        console.log(`🔄 Method 5: using 'both' seasonType and filtering...`);
        const allGames = await gameService.getGames(season, null, 'both', null, null, null, null, 'fbs', null, useGraphQL);
        const postseasonGames = allGames.filter(game => 
          game.season_type === 'postseason' || 
          game.seasonType === 'postseason' ||
          (game.notes && (
            game.notes.toLowerCase().includes('bowl') ||
            game.notes.toLowerCase().includes('playoff') ||
            game.notes.toLowerCase().includes('championship') ||
            game.notes.toLowerCase().includes('cfp') ||
            game.notes.toLowerCase().includes('national championship')
          ))
        );
        
        if (postseasonGames && postseasonGames.length > 0) {
          console.log(`✅ Method 5 success: Found ${postseasonGames.length} postseason games using 'both' filter`);
          return postseasonGames;
        }
      } catch (error) {
        console.log(`⚠️ Method 5 failed: ${error.message}`);
      }
      
      console.log(`❌ All methods failed: No postseason games found for ${season}`);
      return [];
      
    } catch (error) {
      console.error(`❌ Error loading postseason games for ${season}:`, error);
      return [];
    }
  },
};
