// Main API module - imports all service modules
import {
  teamService,
  playerService,
  gameService,
  bettingService,
  newsService,
  analyticsService,
  fanService,
  rankingsService,
  fetchData
} from './index';

// Export individual services
export {
  teamService,
  playerService,
  gameService,
  bettingService,
  newsService,
  analyticsService,
  fanService,
  rankingsService,
  fetchData
};

// Legacy API object for backward compatibility
export const api = {
  // Team-related endpoints
  getAllTeams: teamService.getAllTeams,
  getTeamById: teamService.getTeamById,
  getTeamRoster: teamService.getTeamRoster,
  getTeamSchedule: teamService.getTeamSchedule,
  getTeamStats: teamService.getTeamStats,
  getConferenceTeams: teamService.getConferenceTeams,
  getTeamRankings: teamService.getTeamRankings,
  getTeamOutlook: teamService.getTeamOutlook,

  // Player-related endpoints
  getPlayer: playerService.getPlayer,
  getPlayerStats: playerService.getPlayerStats,
  getPlayerGrades: playerService.getPlayerGrades,
  getTopPlayers: playerService.getTopPlayers,
  getPlayersByTeam: playerService.getPlayersByTeam,
  getDraftEligiblePlayers: playerService.getDraftEligiblePlayers,
  getPlayerComparisons: playerService.getPlayerComparisons,
  getInjuryReports: playerService.getInjuryReports,
  getTransferPortal: playerService.getTransferPortal,

  // Game-related endpoints
  getUpcomingGames: gameService.getUpcomingGames,
  getGame: gameService.getGame,
  getGameStats: gameService.getGameStats,
  getGameHighlights: gameService.getGameHighlights,
  getScores: gameService.getScores,
  getSchedule: gameService.getSchedule,
  getGamePredictions: gameService.getGamePredictions,
  getWeeklyGames: gameService.getWeeklyGames,

  // Betting-related endpoints
  getOdds: bettingService.getOdds,
  getSpreadAnalysis: bettingService.getSpreadAnalysis,
  getOverUnderAnalysis: bettingService.getOverUnderAnalysis,
  getBettingModels: bettingService.getBettingModels,
  getArbitrageOpportunities: bettingService.getArbitrageOpportunities,
  getExpectedValue: bettingService.getExpectedValue,
  getBettingSuggestions: bettingService.getBettingSuggestions,
  getLineMovements: bettingService.getLineMovements,
  getPublicBetting: bettingService.getPublicBetting,

  // News-related endpoints
  getLatestNews: newsService.getLatestNews,
  getNewsByCategory: newsService.getNewsByCategory,
  getDraftNews: newsService.getDraftNews,
  getCoachingChanges: newsService.getCoachingChanges,
  getRecruitingNews: newsService.getRecruitingNews,
  getAnalysis: newsService.getAnalysis,
  getPressConferences: newsService.getPressConferences,
  getVideos: newsService.getVideos,
  getCommitments: newsService.getCommitments,

  // Analytics-related endpoints
  getTeamMetrics: analyticsService.getTeamMetrics,
  getPlayerMetrics: analyticsService.getPlayerMetrics,
  getGamedayGPT: analyticsService.getGamedayGPT,
  getAIInsights: analyticsService.getAIInsights,
  predictOutcomes: analyticsService.predictOutcomes,
  getCoachAnalysis: analyticsService.getCoachAnalysis,
  getPerformanceMetrics: analyticsService.getPerformanceMetrics,
  getAdvancedStats: analyticsService.getAdvancedStats,
  getWeatherImpact: analyticsService.getWeatherImpact,

  // Fan-related endpoints
  getFanForums: fanService.getFanForums,
  getFanPredictions: fanService.getFanPredictions,
  getPolls: fanService.getPolls,
  getSocialFeed: fanService.getSocialFeed,
  getFanStats: fanService.getFanStats,
  createPost: fanService.createPost,
  votePoll: fanService.votePoll,
  submitPrediction: fanService.submitPrediction,
  getUserProfile: fanService.getUserProfile,

  // Rankings-related endpoints
  getCFPRankings: rankingsService.getCFPRankings,
  getAPPoll: rankingsService.getAPPoll,
  getCoachesPoll: rankingsService.getCoachesPoll,
  getConferenceStandings: rankingsService.getConferenceStandings,
  getPlayerRankings: rankingsService.getPlayerRankings,
  getRecruitingRankings: rankingsService.getRecruitingRankings,
  getDraftRankings: rankingsService.getDraftRankings,
  getCoachRankings: rankingsService.getCoachRankings,
  getStrengthOfSchedule: rankingsService.getStrengthOfSchedule
};

// Default export for backward compatibility
export default api;
