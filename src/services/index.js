// Central export for all service modules
export { teamService } from './teamService';
export { playerService } from './playerService';
export { gameService } from './gameService';
export { bettingService } from './bettingService';
export { newsService } from './newsService';
export { analyticsService } from './analyticsService';
export { fanService } from './fanService';
export { rankingsService } from './rankingsService';
export { driveService } from './driveService';
export { playService } from './playService';
export { miscService } from './miscService';
export { default as graphqlService } from './graphqlService';
export { default as fetchData, fetchCollegeFootballData, fetchNewsData, fetchYouTubeData } from './core';

// Combined service object for backward compatibility
export const apiService = {
  teams: async () => {
    const { teamService } = await import('./teamService');
    return teamService;
  },
  
  players: async () => {
    const { playerService } = await import('./playerService');
    return playerService;
  },
  
  games: async () => {
    const { gameService } = await import('./gameService');
    return gameService;
  },
  
  betting: async () => {
    const { bettingService } = await import('./bettingService');
    return bettingService;
  },
  
  news: async () => {
    const { newsService } = await import('./newsService');
    return newsService;
  },
  
  analytics: async () => {
    const { analyticsService } = await import('./analyticsService');
    return analyticsService;
  },
  
  fan: async () => {
    const { fanService } = await import('./fanService');
    return fanService;
  },
  
  rankings: async () => {
    const { rankingsService } = await import('./rankingsService');
    return rankingsService;
  }
};
