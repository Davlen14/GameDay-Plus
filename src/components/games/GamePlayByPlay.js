import React from 'react';

const GamePlayByPlay = ({ game, awayTeam, homeTeam }) => {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
        <i className="fas fa-play-circle text-3xl text-white"></i>
      </div>
      <h3 className="text-2xl font-bold gradient-text mb-4">Play-by-Play</h3>
      <p className="text-gray-600 max-w-md mx-auto">
        Real-time play-by-play updates, drive charts, and momentum tracking.
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

export default GamePlayByPlay;
