import React from 'react';

const PressConferences = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Press Conferences</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Latest press conferences from coaches and players
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-microphone text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Access to press conferences, interviews, and media availability sessions.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-user-tie text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Coach Interviews</h3>
                <p className="text-gray-600">Post-game and weekly pressers</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-running text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Player Interviews</h3>
                <p className="text-gray-600">Player media availability</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-calendar text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Media Days</h3>
                <p className="text-gray-600">Conference and team media days</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-trophy text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Award Ceremonies</h3>
                <p className="text-gray-600">Player and coach award presentations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PressConferences;
