import React from 'react';

const CoachOverview = () => {
  return (
    <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6 gradient-text">Coach Overview</h1>
        <div className="bg-white rounded-xl p-12 shadow-lg">
          <i className="fas fa-user-tie text-6xl icon-gradient mb-6"></i>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Coming Soon</h2>
          <p className="text-xl text-gray-600 mb-8">
            Comprehensive coaching staff profiles, records, and strategic analysis for all college football teams.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2 gradient-text">Coaching Records</h3>
              <p className="text-gray-600">Win-loss records and career achievements</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2 gradient-text">Strategic Analysis</h3>
              <p className="text-gray-600">Play-calling tendencies and game planning</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2 gradient-text">Recruiting Impact</h3>
              <p className="text-gray-600">Recruiting success and player development</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachOverview;
