import React from 'react';

const GameOverview = ({ game, awayTeam, homeTeam }) => {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
        <i className="fas fa-file-alt text-3xl text-white"></i>
      </div>
      <h3 className="text-2xl font-bold gradient-text mb-4">Game Overview</h3>
      <p className="text-gray-600 max-w-md mx-auto">
        Comprehensive game details, key plays, and real-time updates will be available here.
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

export default GameOverview;
