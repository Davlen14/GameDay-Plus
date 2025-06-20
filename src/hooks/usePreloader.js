import { useEffect } from 'react';

const usePreloader = () => {
  useEffect(() => {
    // Preload critical images
    const criticalImages = [
      '/photos/ncaaf.png',
      '/photos/GameDay_processed.png',
      '/photos/GDPLUS.png'
    ];

    const preloadImages = criticalImages.map(src => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve; // Still resolve on error to not block
        img.src = src;
      });
    });

    Promise.all(preloadImages).then(() => {
      console.log('Critical images preloaded');
    });

    // Preload critical components after a delay
    setTimeout(() => {
      // Schedule component
      import('../components/games/Schedule').catch(() => console.log('Schedule component not found'));
      
      // Home page view
      import('../components/layout/HomePageView').catch(() => console.log('HomePageView component not found'));
    }, 2000);

    // Preload secondary components after longer delay
    setTimeout(() => {
      import('../components/games/GamePredictor').catch(() => console.log('GamePredictor component not found'));
      import('../components/teams/AllTeams').catch(() => console.log('AllTeams component not found'));
    }, 5000);

  }, []);
};

export default usePreloader;
