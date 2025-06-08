import fetchData from './core';

// Fan engagement and community-related API functions
export const fanService = {
  getFanForums: async (category = 'general') => {
    return await fetchData('/fan/forums', { category });
  },

  getFanPredictions: async (gameId = null) => {
    return await fetchData('/fan/predictions', { gameId });
  },

  getPolls: async (active = true) => {
    return await fetchData('/fan/polls', { active });
  },

  getSocialFeed: async (hashtag = null, limit = 50) => {
    return await fetchData('/fan/social-feed', { hashtag, limit });
  },

  getFanStats: async (userId) => {
    return await fetchData(`/fan/stats/${userId}`);
  },

  createPost: async (content, category) => {
    return await fetchData('/fan/posts', { content, category });
  },

  votePoll: async (pollId, optionId) => {
    return await fetchData('/fan/polls/vote', { pollId, optionId });
  },

  submitPrediction: async (gameId, prediction) => {
    return await fetchData('/fan/predictions/submit', { gameId, prediction });
  },

  getUserProfile: async (userId) => {
    return await fetchData(`/fan/profile/${userId}`);
  }
};
