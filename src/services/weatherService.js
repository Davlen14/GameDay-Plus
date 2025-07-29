// Centralized weather data service for WeatherPerformanceTab
// Provides wrappers for all weather-related endpoints
import axios from 'axios';

const BASE_URL = '/api';

export const getTeamGames = async (teamId, years) => {
  // Fetch games for a team over a range of years
  try {
    const response = await axios.get(`${BASE_URL}/team/${teamId}/games`, {
      params: { years }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGameWeather = async (gameId) => {
  // Fetch weather data for a specific game
  try {
    const response = await axios.get(`${BASE_URL}/game/${gameId}/weather`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTeamStats = async (teamId, gameIds) => {
  // Fetch stats for a team for a set of games
  try {
    const response = await axios.get(`${BASE_URL}/team/${teamId}/stats`, {
      params: { gameIds }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add any additional weather-related endpoints here

const weatherService = {
  getTeamGames,
  getGameWeather,
  getTeamStats
};

export default weatherService;
