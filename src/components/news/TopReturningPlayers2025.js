import React from 'react';
import '../../UI/ComingSoon.css';

const TopReturningPlayers2025 = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Top Returning Players 2025</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The most impactful players returning for the 2025 college football season.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-users text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Full breakdowns, stats, and highlights for the top returning stars in 2025.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-football-ball text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Offensive Standouts</h3>
                <p className="text-gray-600">Quarterbacks, running backs, receivers</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-shield-alt text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Defensive Leaders</h3>
                <p className="text-gray-600">Linebackers, DBs, linemen</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-star text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Breakout Candidates</h3>
                <p className="text-gray-600">Players primed for a big year</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-trophy text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Award Watch</h3>
                <p className="text-gray-600">Heisman, All-American hopefuls</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopReturningPlayers2025;
