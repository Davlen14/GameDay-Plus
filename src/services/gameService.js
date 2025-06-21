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

  // GET /ppa/players/games - Get player game PPA data
  getPlayerGamePPA: async (year = new Date().getFullYear(), week = null, team = null, position = null, playerId = null, gameId = null, excludeGarbageTime = true) => {
    const params = { year, excludeGarbageTime };
    if (week) params.week = week;
    if (team) params.team = team;
    if (position) params.position = position;
    if (playerId) params.playerId = playerId;
    if (gameId) params.gameId = gameId;
    return await fetchCollegeFootballData('/ppa/players/games', params);
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

  // Enhanced GET /games/media - Get game media information with caching
  getEnhancedGameMedia: async (year, week = null, seasonType = 'regular', team = null, conference = null, classification = 'fbs', mediaType = null) => {
    const params = { year, seasonType };
    if (classification) params.classification = classification;
    if (week) params.week = week;
    if (team) params.team = team;
    if (conference) params.conference = conference;
    if (mediaType) params.mediaType = mediaType;
    
    try {
      const mediaData = await fetchCollegeFootballData('/games/media', params);
      
      // Transform and enrich media data for easier consumption
      const enrichedMedia = mediaData.map(media => ({
        id: media.id,
        season: media.season,
        week: media.week,
        seasonType: media.seasonType,
        startTime: media.startTime,
        homeTeam: media.homeTeam,
        homeConference: media.homeConference,
        awayTeam: media.awayTeam,
        awayConference: media.awayConference,
        mediaType: media.mediaType,
        outlet: media.outlet,
        // Enhanced fields for UI
        displayOutlet: media.outlet || 'TBD',
        mediaIcon: gameService.getMediaIcon(media.mediaType, media.outlet),
        isStreamingOnly: media.mediaType === 'web' || media.mediaType === 'mobile'
      }));
      
      return enrichedMedia;
    } catch (error) {
      console.warn('Enhanced media fetch failed:', error);
      return [];
    }
  },

  // Enhanced GET /games/weather - Get game weather data with analysis
  getEnhancedGameWeather: async (gameId = null, year = null, week = null, seasonType = 'regular', team = null, conference = null) => {
    const params = {};
    if (gameId) params.gameId = gameId;
    if (year) params.year = year;
    if (week) params.week = week;
    if (seasonType) params.seasonType = seasonType;
    if (team) params.team = team;
    if (conference) params.conference = conference;
    
    try {
      const weatherData = await fetchCollegeFootballData('/games/weather', params);
      
      // Transform and enrich weather data for UI display
      const enrichedWeather = weatherData.map(weather => ({
        id: weather.id,
        season: weather.season,
        week: weather.week,
        seasonType: weather.seasonType,
        startTime: weather.startTime,
        gameIndoors: weather.gameIndoors,
        homeTeam: weather.homeTeam,
        homeConference: weather.homeConference,
        awayTeam: weather.awayTeam,
        awayConference: weather.awayConference,
        venueId: weather.venueId,
        venue: weather.venue,
        temperature: weather.temperature,
        dewPoint: weather.dewPoint,
        humidity: weather.humidity,
        precipitation: weather.precipitation,
        snowfall: weather.snowfall,
        windDirection: weather.windDirection,
        windSpeed: weather.windSpeed,
        pressure: weather.pressure,
        weatherConditionCode: weather.weatherConditionCode,
        weatherCondition: weather.weatherCondition,
        // Enhanced fields for UI
        displayTemp: weather.temperature ? `${Math.round(weather.temperature)}°F` : 'N/A',
        weatherIcon: gameService.getWeatherIcon(weather.weatherConditionCode, weather.weatherCondition, weather.gameIndoors),
        conditionSummary: gameService.getWeatherSummary(weather),
        gameImpact: gameService.analyzeWeatherImpact(weather)
      }));
      
      return enrichedWeather;
    } catch (error) {
      console.warn('Enhanced weather fetch failed:', error);
      return [];
    }
  },

  // Helper function to get media icon based on type and outlet
  getMediaIcon: (mediaType, outlet) => {
    if (mediaType === 'tv') {
      if (outlet?.includes('ESPN')) return 'fab fa-espn';
      if (outlet?.includes('FOX')) return 'fas fa-tv';
      if (outlet?.includes('CBS')) return 'fas fa-eye';
      if (outlet?.includes('ABC')) return 'fas fa-tv';
      if (outlet?.includes('NBC')) return 'fas fa-tv';
      if (outlet?.includes('SEC Network')) return 'fas fa-tv';
      if (outlet?.includes('Big Ten Network')) return 'fas fa-tv';
      if (outlet?.includes('ACC Network')) return 'fas fa-tv';
      return 'fas fa-tv';
    }
    if (mediaType === 'web') return 'fas fa-globe';
    if (mediaType === 'radio') return 'fas fa-radio';
    if (mediaType === 'mobile') return 'fas fa-mobile-alt';
    return 'fas fa-broadcast-tower';
  },

  // Helper function to get weather icon
  getWeatherIcon: (conditionCode, condition, gameIndoors) => {
    if (gameIndoors) return 'fas fa-building';
    
    if (condition) {
      const lowerCondition = condition.toLowerCase();
      if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) return 'fas fa-cloud-rain';
      if (lowerCondition.includes('thunderstorm') || lowerCondition.includes('storm')) return 'fas fa-bolt';
      if (lowerCondition.includes('snow') || lowerCondition.includes('blizzard')) return 'fas fa-snowflake';
      if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) return 'fas fa-smog';
      if (lowerCondition.includes('wind')) return 'fas fa-wind';
      if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) return 'fas fa-cloud';
      if (lowerCondition.includes('clear') || lowerCondition.includes('fair') || lowerCondition.includes('sunny')) return 'fas fa-sun';
      if (lowerCondition.includes('partly') || lowerCondition.includes('scattered')) return 'fas fa-cloud-sun';
    }
    
    // Fallback based on condition code
    switch (conditionCode) {
      case 0: case 1: case 2: return 'fas fa-sun'; // Clear/Fair
      case 3: case 4: return 'fas fa-cloud-sun'; // Partly Cloudy
      case 5: case 6: return 'fas fa-cloud'; // Cloudy/Overcast
      case 7: case 8: case 9: return 'fas fa-cloud-rain'; // Rain/Showers
      case 10: case 11: return 'fas fa-bolt'; // Thunderstorms
      case 12: case 13: case 14: return 'fas fa-snowflake'; // Snow/Sleet
      case 15: case 16: return 'fas fa-smog'; // Fog/Mist
      case 17: return 'fas fa-wind'; // Windy
      case 18: return 'fas fa-cloud-rain'; // Drizzle
      default: return 'fas fa-cloud-sun';
    }
  },

  // Helper function to get weather summary
  getWeatherSummary: (weather) => {
    if (weather.gameIndoors) return 'Indoor Game';
    
    const conditions = [];
    
    // Temperature description
    if (weather.temperature !== null && weather.temperature !== undefined) {
      if (weather.temperature < 32) conditions.push('Freezing');
      else if (weather.temperature < 45) conditions.push('Cold');
      else if (weather.temperature < 60) conditions.push('Cool');
      else if (weather.temperature < 75) conditions.push('Mild');
      else if (weather.temperature < 85) conditions.push('Warm');
      else conditions.push('Hot');
    }
    
    // Wind conditions
    if (weather.windSpeed && weather.windSpeed > 25) conditions.push('Very Windy');
    else if (weather.windSpeed && weather.windSpeed > 15) conditions.push('Windy');
    else if (weather.windSpeed && weather.windSpeed > 10) conditions.push('Breezy');
    
    // Precipitation
    if (weather.precipitation && weather.precipitation > 0.5) conditions.push('Heavy Rain');
    else if (weather.precipitation && weather.precipitation > 0.1) conditions.push('Light Rain');
    
    // Snow
    if (weather.snowfall && weather.snowfall > 0) conditions.push('Snow');
    
    // Weather condition override
    if (weather.weatherCondition && weather.weatherCondition !== 'null' && weather.weatherCondition !== null) {
      const condition = weather.weatherCondition.trim();
      if (condition.length > 0) {
        // Replace generic temperature with specific condition if available
        const tempIndex = conditions.findIndex(c => ['Freezing', 'Cold', 'Cool', 'Mild', 'Warm', 'Hot'].includes(c));
        if (tempIndex >= 0) {
          conditions[tempIndex] = condition;
        } else {
          conditions.unshift(condition);
        }
      }
    }
    
    return conditions.length > 0 ? conditions.join(', ') : 'Fair Conditions';
  },

  // Helper function to analyze weather impact on game
  analyzeWeatherImpact: (weather) => {
    if (weather.gameIndoors) return 'neutral';
    
    let impactScore = 0;
    
    if (weather.temperature) {
      if (weather.temperature < 25 || weather.temperature > 95) impactScore += 2;
      else if (weather.temperature < 35 || weather.temperature > 85) impactScore += 1;
    }
    
    if (weather.windSpeed && weather.windSpeed > 20) impactScore += 2;
    else if (weather.windSpeed && weather.windSpeed > 15) impactScore += 1;
    
    if (weather.precipitation && weather.precipitation > 0.1) impactScore += 2;
    
    if (weather.weatherCondition && weather.weatherCondition.toLowerCase().includes('storm')) impactScore += 2;
    
    if (impactScore >= 4) return 'high';
    if (impactScore >= 2) return 'moderate';
    return 'low';
  },
};
