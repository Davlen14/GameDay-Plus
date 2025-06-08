import React from 'react';

const Highlights = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Highlights</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Best plays and moments from college football games
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-play-circle text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Watch the best highlights from college football games and top plays.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-football-ball text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Game Highlights</h3>
                <p className="text-gray-600">Complete game recap videos</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-star text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Top Plays</h3>
                <p className="text-gray-600">Weekly best plays compilation</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-running text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Player Highlights</h3>
                <p className="text-gray-600">Individual player showcases</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-trophy text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Championship Moments</h3>
                <p className="text-gray-600">Historic game-winning plays</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Highlights;
