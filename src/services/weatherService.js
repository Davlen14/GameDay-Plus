import { fetchCollegeFootballData } from './core';

// Enhanced Weather and Atmospheric Analysis Service
export const weatherService = {
  
  // COLLEGE FOOTBALL DATA API INTEGRATION
  // Real weather data from CFBD API (requires Patreon subscription)
  
  /**
   * Get weather data for team games across multiple years
   * @param {string} team - Team name
   * @param {number[]} years - Array of years to analyze 
   * @param {string} seasonType - 'regular', 'postseason', etc.
   */
  getTeamWeatherHistory: async (team, years = [2021, 2022, 2023, 2024], seasonType = 'regular') => {
    try {
      const weatherData = [];
      
      for (const year of years) {
        try {
          const yearData = await fetchCollegeFootballData(`/games/weather`, {
            year,
            team,
            seasonType
          });
          
          if (yearData && Array.isArray(yearData)) {
            weatherData.push(...yearData);
          }
        } catch (error) {
          console.warn(`Failed to fetch weather data for ${team} ${year}:`, error);
        }
      }
      
      return weatherData;
    } catch (error) {
      console.error('Error fetching team weather history:', error);
      return [];
    }
  },

  /**
   * Get weather data for specific game
   * @param {number} gameId - Game ID
   */
  getGameWeather: async (gameId) => {
    try {
      const weatherData = await fetchCollegeFootballData(`/games/weather`, { gameId });
      return weatherData?.[0] || null;
    } catch (error) {
      console.error('Error fetching game weather:', error);
      return null;
    }
  },

  // ADVANCED WEATHER ANALYSIS METHODS

  /**
   * Calculate weather stress index for game conditions
   * @param {Object} conditions - Weather conditions object
   */
  calculateWeatherStress: (conditions) => {
    const { temperature, humidity, windSpeed, precipitation, pressure } = conditions;
    let stress = 0;
    
    // Temperature stress
    if (temperature < 32) stress += (32 - temperature) * 0.5; // Cold stress
    if (temperature > 85) stress += (temperature - 85) * 0.3; // Heat stress
    
    // Humidity modifier (worse in heat, challenging in cold)
    if (temperature > 70 && humidity > 70) stress += humidity * 0.1;
    if (temperature < 40 && humidity > 80) stress += humidity * 0.05;
    
    // Wind stress
    if (windSpeed > 15) stress += (windSpeed - 15) * 0.2;
    
    // Precipitation stress
    if (precipitation > 0) stress += precipitation * 10;
    
    // Pressure effects (deviation from standard)
    if (pressure && (pressure < 1010 || pressure > 1025)) {
      stress += Math.abs(pressure - 1017.5) * 0.1;
    }
    
    return Math.round(stress * 10) / 10;
  },

  /**
   * Calculate heat index for warm weather games
   * @param {number} temperature - Temperature in Fahrenheit
   * @param {number} humidity - Humidity percentage
   */
  calculateHeatIndex: (temperature, humidity) => {
    if (temperature < 80) return temperature;
    
    const T = temperature;
    const RH = humidity;
    
    let HI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (RH * 0.094));
    
    if (HI >= 80) {
      HI = -42.379 + 2.04901523 * T + 10.14333127 * RH 
         - 0.22475541 * T * RH - 0.00683783 * T * T 
         - 0.05481717 * RH * RH + 0.00122874 * T * T * RH 
         + 0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH;
    }
    
    return Math.round(HI);
  },

  /**
   * Calculate wind chill for cold weather games
   * @param {number} temperature - Temperature in Fahrenheit
   * @param {number} windSpeed - Wind speed in mph
   */
  calculateWindChill: (temperature, windSpeed) => {
    if (temperature > 50 || windSpeed < 3) return temperature;
    
    const T = temperature;
    const V = windSpeed;
    
    const windChill = 35.74 + 0.6215 * T - 35.75 * Math.pow(V, 0.16) + 0.4275 * T * Math.pow(V, 0.16);
    
    return Math.round(windChill);
  },

  /**
   * Categorize weather conditions for analysis
   * @param {Object} conditions - Weather conditions
   */
  categorizeWeatherConditions: (conditions) => {
    const { temperature, humidity, windSpeed, precipitation } = conditions;
    
    const tempCategory = temperature < 45 ? 'cold' : 
                        temperature > 75 ? 'warm' : 'moderate';
    
    const humidityCategory = humidity > 80 ? 'high' :
                            humidity < 40 ? 'low' : 'moderate';
    
    const windCategory = windSpeed > 20 ? 'strong' :
                        windSpeed > 10 ? 'moderate' : 'light';
    
    const precipCategory = precipitation > 0.1 ? 'heavy' :
                          precipitation > 0 ? 'light' : 'none';
    
    return {
      temperature: tempCategory,
      humidity: humidityCategory, 
      wind: windCategory,
      precipitation: precipCategory,
      overall: weatherService.determineOverallConditions(tempCategory, humidityCategory, windCategory, precipCategory)
    };
  },

  /**
   * Determine overall weather condition severity
   */
  determineOverallConditions: (temp, humidity, wind, precip) => {
    const factors = [temp, humidity, wind, precip];
    const extremeFactors = factors.filter(f => ['cold', 'high', 'strong', 'heavy'].includes(f));
    
    if (extremeFactors.length >= 3) return 'extreme';
    if (extremeFactors.length >= 2) return 'challenging';
    if (extremeFactors.length >= 1) return 'moderate';
    return 'favorable';
  },

  // TEAM WEATHER PROFILE ANALYSIS

  /**
   * Analyze team's historical weather performance
   * @param {Array} weatherData - Historical weather data for team
   */
  analyzeTeamWeatherProfile: (weatherData) => {
    if (!weatherData || weatherData.length === 0) return null;
    
    const analysis = {
      totalGames: weatherData.length,
      homeGames: weatherData.filter(g => g.homeTeam === g.team || g.homeTeam === weatherData[0]?.homeTeam).length,
      coldWeatherGames: weatherData.filter(g => g.temperature < 45).length,
      warmWeatherGames: weatherData.filter(g => g.temperature > 75).length,
      windyGames: weatherData.filter(g => g.windSpeed > 15).length,
      wetGames: weatherData.filter(g => g.precipitation > 0).length,
      extremeConditions: weatherData.filter(g => {
        const stress = weatherService.calculateWeatherStress(g);
        return stress > 20;
      }).length
    };
    
    // Calculate percentages
    analysis.percentages = {
      homeGames: (analysis.homeGames / analysis.totalGames * 100).toFixed(1),
      coldWeather: (analysis.coldWeatherGames / analysis.totalGames * 100).toFixed(1),
      warmWeather: (analysis.warmWeatherGames / analysis.totalGames * 100).toFixed(1),
      windy: (analysis.windyGames / analysis.totalGames * 100).toFixed(1),
      wet: (analysis.wetGames / analysis.totalGames * 100).toFixed(1),
      extreme: (analysis.extremeConditions / analysis.totalGames * 100).toFixed(1)
    };
    
    // Temperature analysis
    const temperatures = weatherData.map(g => g.temperature).filter(t => t != null);
    analysis.temperature = {
      avg: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
      min: Math.min(...temperatures),
      max: Math.max(...temperatures),
      range: Math.max(...temperatures) - Math.min(...temperatures)
    };
    
    return analysis;
  },

  /**
   * Compare two teams' weather profiles
   * @param {string} team1 - First team name
   * @param {string} team2 - Second team name
   * @param {number[]} years - Years to analyze
   */
  compareTeamWeatherProfiles: async (team1, team2, years = [2021, 2022, 2023, 2024]) => {
    try {
      console.log(`🌤️ Analyzing weather profiles for ${team1} vs ${team2}...`);
      
      const [team1Data, team2Data] = await Promise.all([
        weatherService.getTeamWeatherHistory(team1, years),
        weatherService.getTeamWeatherHistory(team2, years)
      ]);
      
      const team1Profile = weatherService.analyzeTeamWeatherProfile(team1Data);
      const team2Profile = weatherService.analyzeTeamWeatherProfile(team2Data);
      
      // Calculate comparative advantages
      const comparison = {
        team1: { name: team1, profile: team1Profile, data: team1Data },
        team2: { name: team2, profile: team2Profile, data: team2Data },
        advantages: {
          coldWeather: {
            team1: parseFloat(team1Profile?.percentages?.coldWeather || 0),
            team2: parseFloat(team2Profile?.percentages?.coldWeather || 0),
            advantage: team1Profile && team2Profile ? 
              (parseFloat(team1Profile.percentages.coldWeather) - parseFloat(team2Profile.percentages.coldWeather)).toFixed(1) : 0
          },
          warmWeather: {
            team1: parseFloat(team1Profile?.percentages?.warmWeather || 0),
            team2: parseFloat(team2Profile?.percentages?.warmWeather || 0),
            advantage: team1Profile && team2Profile ?
              (parseFloat(team1Profile.percentages.warmWeather) - parseFloat(team2Profile.percentages.warmWeather)).toFixed(1) : 0
          },
          homeWeatherAdvantage: {
            team1: parseFloat(team1Profile?.percentages?.homeGames || 0),
            team2: parseFloat(team2Profile?.percentages?.homeGames || 0),
            advantage: team1Profile && team2Profile ?
              (parseFloat(team1Profile.percentages.homeGames) - parseFloat(team2Profile.percentages.homeGames)).toFixed(1) : 0
          }
        }
      };
      
      console.log(`✅ Weather comparison complete:`, comparison.advantages);
      
      return comparison;
    } catch (error) {
      console.error('Error comparing team weather profiles:', error);
      return null;
    }
  },

  /**
   * Get weather-based game prediction factors
   * @param {Object} gameConditions - Expected game weather conditions
   * @param {Object} team1Profile - Team 1 weather profile
   * @param {Object} team2Profile - Team 2 weather profile
   */
  calculateWeatherGameAdvantage: (gameConditions, team1Profile, team2Profile) => {
    const stress = weatherService.calculateWeatherStress(gameConditions);
    const conditions = weatherService.categorizeWeatherConditions(gameConditions);
    
    let team1Advantage = 0;
    let team2Advantage = 0;
    
    // Cold weather advantage
    if (conditions.temperature === 'cold') {
      team1Advantage += parseFloat(team1Profile?.percentages?.coldWeather || 0) * 0.1;
      team2Advantage += parseFloat(team2Profile?.percentages?.coldWeather || 0) * 0.1;
    }
    
    // Warm weather advantage  
    if (conditions.temperature === 'warm') {
      team1Advantage += parseFloat(team1Profile?.percentages?.warmWeather || 0) * 0.1;
      team2Advantage += parseFloat(team2Profile?.percentages?.warmWeather || 0) * 0.1;
    }
    
    // Extreme conditions experience
    if (conditions.overall === 'extreme') {
      team1Advantage += parseFloat(team1Profile?.percentages?.extreme || 0) * 0.15;
      team2Advantage += parseFloat(team2Profile?.percentages?.extreme || 0) * 0.15;
    }
    
    return {
      weatherStress: stress,
      conditions: conditions,
      team1Advantage: team1Advantage,
      team2Advantage: team2Advantage,
      netAdvantage: team1Advantage - team2Advantage,
      recommendedStrategy: weatherService.getWeatherStrategy(conditions)
    };
  },

  /**
   * Get recommended strategy based on weather conditions
   */
  getWeatherStrategy: (conditions) => {
    const strategies = [];
    
    if (conditions.temperature === 'cold') {
      strategies.push('Emphasize ground game', 'Shorter passing routes', 'Ball security priority');
    }
    
    if (conditions.wind === 'strong') {
      strategies.push('Limit deep passes', 'Adjust kicking game', 'Field position emphasis');
    }
    
    if (conditions.precipitation !== 'none') {
      strategies.push('Ball handling drills', 'Conservative play calling', 'Special teams caution');
    }
    
    if (conditions.humidity === 'high') {
      strategies.push('Hydration management', 'Rotation strategy', 'Conditioning advantage');
    }
    
    return strategies;
  },

  // VENUE WEATHER CHARACTERISTICS
  
  /**
   * Get venue-specific weather patterns
   * @param {string} venue - Venue name
   */
  getVenueWeatherCharacteristics: (venue) => {
    const venuePatterns = {
      'Camp Randall Stadium': {
        climate: 'continental',
        coldWeatherAdvantage: true,
        windPatterns: 'variable due to stadium design',
        lateSeasonConditions: 'harsh',
        elevation: 'moderate'
      },
      'Beaver Stadium': {
        climate: 'continental', 
        coldWeatherAdvantage: true,
        windPatterns: 'moderate',
        lateSeasonConditions: 'cold',
        elevation: 'moderate'
      },
      'Sun Devil Stadium': {
        climate: 'desert',
        heatAdvantage: true,
        windPatterns: 'light',
        earlySeasonConditions: 'extreme heat',
        elevation: 'high'
      }
      // Add more venues as needed
    };
    
    return venuePatterns[venue] || {
      climate: 'unknown',
      patterns: 'no data available'
    };
  }
};
