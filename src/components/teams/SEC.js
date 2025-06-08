import React from 'react';

const SEC = () => {
  return (
    <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6 gradient-text">SEC Conference</h1>
        <div className="bg-white rounded-xl p-12 shadow-lg">
          <i className="fas fa-football-ball text-6xl icon-gradient mb-6"></i>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Coming Soon</h2>
          <p className="text-xl text-gray-600 mb-8">
            In-depth coverage of all SEC teams, standings, and conference-specific analytics.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2 gradient-text">Conference Standings</h3>
              <p className="text-gray-600">Real-time SEC standings and rankings</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2 gradient-text">Team Comparisons</h3>
              <p className="text-gray-600">Head-to-head SEC team analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEC;
