/**
 * weatherCalculations.js - Utility functions for processing and analyzing team weather performance
 */

/**
 * Process games data into a comprehensive dataset with weather and performance metrics
 * @param {Array} games - Raw games data from API
 * @param {Object} weatherData - Weather data keyed by game ID
 * @param {Array} teamStats - Team statistics data 
 * @param {String} teamName - Name of the team being analyzed
 * @returns {Array} Processed games with weather categories and performance metrics
 */
export const processGamesData = (games, weatherData, teamStats, teamName) => {
  const processedGames = [];
  
  for (const game of games) {
    // Determine if team was home or away
    const isHome = game.homeTeam === teamName;
    
    const gameData = {
      game_id: game.id,
      season: game.season,
      week: game.week,
      date: game.startDate,
      venue: game.venue,
      venue_id: game.venueId,
      is_home: isHome,
      opponent: isHome ? game.awayTeam : game.homeTeam,
      team_score: isHome ? game.homePoints : game.awayPoints,
      opponent_score: isHome ? game.awayPoints : game.homePoints,
      attendance: game.attendance,
      neutral_site: game.neutralSite || false,
      conference_game: game.conferenceGame || false,
      season_type: game.seasonType
    };
    
    // Add weather data if available
    if (weatherData[game.id]) {
      const weather = weatherData[game.id];
      gameData.temperature = weather.temperature;
      gameData.dew_point = weather.dewPoint;
      gameData.humidity = weather.humidity;
      gameData.precipitation = weather.precipitation;
      gameData.snow_depth = weather.snowDepth;
      gameData.wind_speed = weather.windSpeed;
      gameData.wind_direction = weather.windDirection;
      gameData.pressure = weather.pressure;
      gameData.weather_condition = weather.weatherCondition;
    }
    
    // Calculate game outcome
    if (gameData.team_score !== null && gameData.opponent_score !== null) {
      gameData.won = gameData.team_score > gameData.opponent_score;
      gameData.point_differential = gameData.team_score - gameData.opponent_score;
    }
    
    // Add team stats if available
    const gameStat = teamStats.find(stat => stat.game_id === game.id);
    if (gameStat) {
      gameData.total_yards = gameStat.totalYards;
      gameData.passing_yards = gameStat.netPassingYards;
      gameData.rushing_yards = gameStat.rushingYards;
      gameData.first_downs = gameStat.firstDowns;
      gameData.third_down_conversions = gameStat.thirdDownConversions;
      gameData.third_down_attempts = gameStat.thirdDownAttempts;
      gameData.turnovers = gameStat.turnovers;
      gameData.time_of_possession = gameStat.possessionTime;
    }
    
    // Parse datetime and extract time features
    const datetime = new Date(gameData.date);
    gameData.year = datetime.getFullYear();
    gameData.month = datetime.getMonth() + 1;
    gameData.day_of_week = datetime.toLocaleDateString('en-US', { weekday: 'long' });
    gameData.hour = datetime.getHours();
    
    // Categorize game times
    if (gameData.hour < 12) {
      gameData.time_category = 'Morning';
    } else if (gameData.hour < 15) {
      gameData.time_category = 'Early Afternoon';
    } else if (gameData.hour < 18) {
      gameData.time_category = 'Late Afternoon';
    } else {
      gameData.time_category = 'Night';
    }
    
    // Categorize weather if temperature is available
    if (gameData.temperature) {
      if (gameData.temperature < 32) {
        gameData.weather_category = 'Freezing';
      } else if (gameData.temperature < 50) {
        gameData.weather_category = 'Cold';
      } else if (gameData.temperature < 70) {
        gameData.weather_category = 'Moderate';
      } else {
        gameData.weather_category = 'Warm';
      }
    }
    
    processedGames.push(gameData);
  }
  
  return processedGames;
};

/**
 * Analyze performance by weather conditions
 * @param {Array} games - Processed games data
 * @returns {Object} Performance metrics grouped by weather category
 */
export const analyzeWeatherPerformance = (games) => {
  // Only analyze games with weather data
  const gamesWithWeather = games.filter(game => game.weather_category);
  
  // Group by weather category
  const categories = ['Freezing', 'Cold', 'Moderate', 'Warm'];
  const performance = {};
  
  categories.forEach(category => {
    const categoryGames = gamesWithWeather.filter(game => game.weather_category === category);
    
    if (categoryGames.length > 0) {
      performance[category] = {
        win_rate: categoryGames.filter(game => game.won).length / categoryGames.length,
        avg_points_for: categoryGames.reduce((sum, game) => sum + (game.team_score || 0), 0) / categoryGames.length,
        avg_points_against: categoryGames.reduce((sum, game) => sum + (game.opponent_score || 0), 0) / categoryGames.length,
        avg_point_diff: categoryGames.reduce((sum, game) => sum + (game.point_differential || 0), 0) / categoryGames.length,
        avg_total_yards: categoryGames.reduce((sum, game) => sum + (game.total_yards || 0), 0) / categoryGames.length,
        avg_pass_yards: categoryGames.reduce((sum, game) => sum + (game.passing_yards || 0), 0) / categoryGames.length,
        avg_rush_yards: categoryGames.reduce((sum, game) => sum + (game.rushing_yards || 0), 0) / categoryGames.length,
        avg_turnovers: categoryGames.reduce((sum, game) => sum + (game.turnovers || 0), 0) / categoryGames.length,
        games_played: categoryGames.length
      };
    }
  });
  
  return performance;
};

/**
 * Analyze performance by time of day
 * @param {Array} games - Processed games data
 * @returns {Object} Performance metrics grouped by time category
 */
export const analyzeTimePerformance = (games) => {
  // Group by time category
  const categories = ['Morning', 'Early Afternoon', 'Late Afternoon', 'Night'];
  const performance = {};
  
  categories.forEach(category => {
    const categoryGames = games.filter(game => game.time_category === category);
    
    if (categoryGames.length > 0) {
      performance[category] = {
        win_rate: categoryGames.filter(game => game.won).length / categoryGames.length,
        avg_points_for: categoryGames.reduce((sum, game) => sum + (game.team_score || 0), 0) / categoryGames.length,
        avg_points_against: categoryGames.reduce((sum, game) => sum + (game.opponent_score || 0), 0) / categoryGames.length,
        avg_point_diff: categoryGames.reduce((sum, game) => sum + (game.point_differential || 0), 0) / categoryGames.length,
        avg_total_yards: categoryGames.reduce((sum, game) => sum + (game.total_yards || 0), 0) / categoryGames.length,
        avg_pass_yards: categoryGames.reduce((sum, game) => sum + (game.passing_yards || 0), 0) / categoryGames.length,
        avg_rush_yards: categoryGames.reduce((sum, game) => sum + (game.rushing_yards || 0), 0) / categoryGames.length,
        avg_turnovers: categoryGames.reduce((sum, game) => sum + (game.turnovers || 0), 0) / categoryGames.length,
        games_played: categoryGames.length
      };
    }
  });
  
  return performance;
};

/**
 * Analyze how weather affects play calling strategy
 * @param {Array} games - Processed games data
 * @returns {Object} Strategy metrics grouped by weather category
 */
export const analyzeWeatherStrategy = (games) => {
  // Only analyze games with weather data and offensive stats
  const gamesWithData = games.filter(
    game => game.weather_category && 
    game.passing_yards !== undefined && 
    game.rushing_yards !== undefined
  );
  
  // Group by weather category
  const categories = ['Freezing', 'Cold', 'Moderate', 'Warm'];
  const strategy = {};
  
  categories.forEach(category => {
    const categoryGames = gamesWithData.filter(game => game.weather_category === category);
    
    if (categoryGames.length > 0) {
      strategy[category] = {
        pass_ratio: categoryGames.reduce((sum, game) => {
          const total = (game.passing_yards || 0) + (game.rushing_yards || 0);
          return sum + (total > 0 ? (game.passing_yards || 0) / total : 0);
        }, 0) / categoryGames.length,
        avg_passing_yards: categoryGames.reduce((sum, game) => sum + (game.passing_yards || 0), 0) / categoryGames.length,
        avg_rushing_yards: categoryGames.reduce((sum, game) => sum + (game.rushing_yards || 0), 0) / categoryGames.length,
        avg_turnovers: categoryGames.reduce((sum, game) => sum + (game.turnovers || 0), 0) / categoryGames.length,
        games_played: categoryGames.length
      };
    }
  });
  
  return strategy;
};

/**
 * Analyze home vs away performance
 * @param {Array} games - Processed games data
 * @returns {Object} Performance metrics for home and away games
 */
export const analyzeHomeAwayPerformance = (games) => {
  const homeGames = games.filter(game => game.is_home);
  const awayGames = games.filter(game => !game.is_home);
  
  return {
    home: {
      win_rate: homeGames.length > 0 ? homeGames.filter(game => game.won).length / homeGames.length : 0,
      avg_points_for: homeGames.length > 0 ? homeGames.reduce((sum, game) => sum + (game.team_score || 0), 0) / homeGames.length : 0,
      avg_points_against: homeGames.length > 0 ? homeGames.reduce((sum, game) => sum + (game.opponent_score || 0), 0) / homeGames.length : 0,
      avg_point_diff: homeGames.length > 0 ? homeGames.reduce((sum, game) => sum + (game.point_differential || 0), 0) / homeGames.length : 0,
      games_played: homeGames.length
    },
    away: {
      win_rate: awayGames.length > 0 ? awayGames.filter(game => game.won).length / awayGames.length : 0,
      avg_points_for: awayGames.length > 0 ? awayGames.reduce((sum, game) => sum + (game.team_score || 0), 0) / awayGames.length : 0,
      avg_points_against: awayGames.length > 0 ? awayGames.reduce((sum, game) => sum + (game.opponent_score || 0), 0) / awayGames.length : 0,
      avg_point_diff: awayGames.length > 0 ? awayGames.reduce((sum, game) => sum + (game.point_differential || 0), 0) / awayGames.length : 0,
      games_played: awayGames.length
    }
  };
};

/**
 * Analyze performance by day of week
 * @param {Array} games - Processed games data
 * @returns {Object} Performance metrics grouped by day of week
 */
export const analyzeDayOfWeekPerformance = (games) => {
  // Group by day of week
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const performance = {};
  
  daysOfWeek.forEach(day => {
    const dayGames = games.filter(game => game.day_of_week === day);
    
    if (dayGames.length > 0) {
      performance[day] = {
        win_rate: dayGames.filter(game => game.won).length / dayGames.length,
        avg_points_for: dayGames.reduce((sum, game) => sum + (game.team_score || 0), 0) / dayGames.length,
        avg_points_against: dayGames.reduce((sum, game) => sum + (game.opponent_score || 0), 0) / dayGames.length,
        avg_point_diff: dayGames.reduce((sum, game) => sum + (game.point_differential || 0), 0) / dayGames.length,
        games_played: dayGames.length
      };
    }
  });
  
  return performance;
};

/**
 * Create a combined weather and time heatmap data
 * @param {Array} games - Processed games data
 * @returns {Array} Data formatted for a heatmap visualization
 */
export const createWeatherTimeHeatmapData = (games) => {
  // Only include games with both weather and time data
  const filteredGames = games.filter(game => game.weather_category && game.time_category);
  
  // Weather categories
  const weatherCategories = ['Freezing', 'Cold', 'Moderate', 'Warm'];
  
  // Time categories
  const timeCategories = ['Morning', 'Early Afternoon', 'Late Afternoon', 'Night'];
  
  // Initialize heatmap data
  const heatmapData = [];
  
  // Calculate win rates for each combination
  weatherCategories.forEach(weather => {
    timeCategories.forEach(time => {
      const combinedGames = filteredGames.filter(
        game => game.weather_category === weather && game.time_category === time
      );
      
      if (combinedGames.length > 0) {
        const winRate = combinedGames.filter(game => game.won).length / combinedGames.length;
        
        heatmapData.push({
          weather: weather,
          time: time,
          winRate: winRate,
          gamesPlayed: combinedGames.length
        });
      }
    });
  });
  
  return heatmapData;
};

/**
 * Analyze extreme weather games
 * @param {Array} games - Processed games data
 * @returns {Object} Analysis of performance in extreme weather conditions
 */
export const analyzeExtremeWeather = (games) => {
  // Define extreme weather conditions
  const extremeCold = games.filter(game => game.temperature !== undefined && game.temperature < 32);
  const extremeHot = games.filter(game => game.temperature !== undefined && game.temperature > 85);
  const highWind = games.filter(game => game.wind_speed !== undefined && game.wind_speed > 20);
  const precipitation = games.filter(game => game.precipitation !== undefined && game.precipitation > 0);
  
  return {
    extremeCold: {
      count: extremeCold.length,
      winRate: extremeCold.length > 0 ? extremeCold.filter(game => game.won).length / extremeCold.length : 0,
      avgScore: extremeCold.length > 0 ? extremeCold.reduce((sum, game) => sum + (game.team_score || 0), 0) / extremeCold.length : 0,
      avgOpponentScore: extremeCold.length > 0 ? extremeCold.reduce((sum, game) => sum + (game.opponent_score || 0), 0) / extremeCold.length : 0
    },
    extremeHot: {
      count: extremeHot.length,
      winRate: extremeHot.length > 0 ? extremeHot.filter(game => game.won).length / extremeHot.length : 0,
      avgScore: extremeHot.length > 0 ? extremeHot.reduce((sum, game) => sum + (game.team_score || 0), 0) / extremeHot.length : 0,
      avgOpponentScore: extremeHot.length > 0 ? extremeHot.reduce((sum, game) => sum + (game.opponent_score || 0), 0) / extremeHot.length : 0
    },
    highWind: {
      count: highWind.length,
      winRate: highWind.length > 0 ? highWind.filter(game => game.won).length / highWind.length : 0,
      avgScore: highWind.length > 0 ? highWind.reduce((sum, game) => sum + (game.team_score || 0), 0) / highWind.length : 0,
      avgOpponentScore: highWind.length > 0 ? highWind.reduce((sum, game) => sum + (game.opponent_score || 0), 0) / highWind.length : 0
    },
    precipitation: {
      count: precipitation.length,
      winRate: precipitation.length > 0 ? precipitation.filter(game => game.won).length / precipitation.length : 0,
      avgScore: precipitation.length > 0 ? precipitation.reduce((sum, game) => sum + (game.team_score || 0), 0) / precipitation.length : 0,
      avgOpponentScore: precipitation.length > 0 ? precipitation.reduce((sum, game) => sum + (game.opponent_score || 0), 0) / precipitation.length : 0
    }
  };
};

/**
 * Generate comprehensive insights from weather analysis
 * @param {Array} games - Processed games data
 * @param {Object} weatherPerformance - Weather performance analysis
 * @param {Object} timePerformance - Time performance analysis
 * @param {Object} homeAwayPerformance - Home/away performance analysis
 * @returns {Array} Array of insight strings
 */
export const generateInsights = (games, weatherPerformance, timePerformance, homeAwayPerformance) => {
  const insights = [];
  
  // Overall performance
  const overallWinRate = games.filter(game => game.won).length / games.filter(game => game.won !== undefined).length;
  insights.push(`Overall Win Rate: ${(overallWinRate * 100).toFixed(1)}% (${games.filter(game => game.won).length}-${games.filter(game => !game.won && game.won !== undefined).length})`);
  
  // Time-based insights
  if (Object.keys(timePerformance).length > 0) {
    const bestTime = Object.keys(timePerformance).reduce((a, b) => 
      timePerformance[a].win_rate > timePerformance[b].win_rate ? a : b
    );
    insights.push(`Best Performance Time: ${bestTime} games (${(timePerformance[bestTime].win_rate * 100).toFixed(1)}% win rate)`);
  }
  
  // Weather-based insights
  if (Object.keys(weatherPerformance).length > 0) {
    const bestWeather = Object.keys(weatherPerformance).reduce((a, b) => 
      weatherPerformance[a].win_rate > weatherPerformance[b].win_rate ? a : b
    );
    insights.push(`Best Weather Condition: ${bestWeather} (${(weatherPerformance[bestWeather].win_rate * 100).toFixed(1)}% win rate)`);
    
    // Temperature insights
    const gamesWithTemp = games.filter(game => game.temperature !== undefined);
    if (gamesWithTemp.length > 0) {
      const avgTemp = gamesWithTemp.reduce((sum, game) => sum + game.temperature, 0) / gamesWithTemp.length;
      insights.push(`Average Game Temperature: ${avgTemp.toFixed(1)}°F`);
    }
  }
  
  // Home vs Away
  if (homeAwayPerformance.home && homeAwayPerformance.away) {
    insights.push(`Home Win Rate: ${(homeAwayPerformance.home.win_rate * 100).toFixed(1)}% | Away Win Rate: ${(homeAwayPerformance.away.win_rate * 100).toFixed(1)}%`);
  }
  
  // Scoring patterns
  const gamesWithScore = games.filter(game => game.team_score !== undefined && game.opponent_score !== undefined);
  if (gamesWithScore.length > 0) {
    const avgPointsFor = gamesWithScore.reduce((sum, game) => sum + game.team_score, 0) / gamesWithScore.length;
    const avgPointsAgainst = gamesWithScore.reduce((sum, game) => sum + game.opponent_score, 0) / gamesWithScore.length;
    insights.push(`Average Score: ${avgPointsFor.toFixed(1)} - ${avgPointsAgainst.toFixed(1)}`);
  }
  
  return insights;
};

/**
 * Format data for chart visualization
 * @param {Object} weatherPerformance - Weather performance analysis
 * @returns {Array} Formatted data for charts
 */
export const formatChartData = (weatherPerformance) => {
  const chartData = [];
  
  // Convert nested object to array format for charts
  Object.keys(weatherPerformance).forEach(category => {
    chartData.push({
      category: category,
      winRate: weatherPerformance[category].win_rate,
      pointsFor: weatherPerformance[category].avg_points_for,
      pointsAgainst: weatherPerformance[category].avg_points_against,
      pointDiff: weatherPerformance[category].avg_point_diff,
      totalYards: weatherPerformance[category].avg_total_yards,
      passYards: weatherPerformance[category].avg_pass_yards,
      rushYards: weatherPerformance[category].avg_rush_yards,
      turnovers: weatherPerformance[category].avg_turnovers,
      gamesPlayed: weatherPerformance[category].games_played
    });
  });
  
  return chartData;
};