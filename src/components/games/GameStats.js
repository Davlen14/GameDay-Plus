import React from 'react';

const GameStats = ({ game, awayTeam, homeTeam }) => {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
        <i className="fas fa-chart-bar text-3xl text-white"></i>
      </div>
      <h3 className="text-2xl font-bold gradient-text mb-4">Live Statistics</h3>
      <p className="text-gray-600 max-w-md mx-auto">
        In-depth team and player statistics, analytics, and performance metrics.
      </p>
      <div className="mt-8">
        <div className="inline-flex items-center px-6 py-3 gradient-bg text-white rounded-full">
          <i className="fas fa-rocket mr-2"></i>
          Coming Soon
        </div>
      </div>
    </div>
  );
};

export default GameStats;
