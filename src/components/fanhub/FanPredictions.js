import React from 'react';

const FanPredictions = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold gradient-text mb-8">Fan Predictions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Make your predictions, compete with other fans, and track your accuracy throughout the season.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-magic text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Game Predictions</h3>
            <p className="text-gray-600 mb-6">Predict winners, scores, and key stats for upcoming games.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-trophy text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Season Predictions</h3>
            <p className="text-gray-600 mb-6">Predict playoff teams, conference champions, and award winners.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-chart-line text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Accuracy Tracking</h3>
            <p className="text-gray-600 mb-6">Track your prediction accuracy and climb the leaderboards.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-users text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Fan Leagues</h3>
            <p className="text-gray-600 mb-6">Create private leagues and compete with friends.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-medal text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Prediction Contests</h3>
            <p className="text-gray-600 mb-6">Enter weekly and monthly prediction contests with prizes.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-brain text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Comparison</h3>
            <p className="text-gray-600 mb-6">See how your predictions compare to our AI models.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-8 mt-16">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">How Fan Predictions Work</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Make Predictions</h4>
                <p className="text-sm text-gray-600">Submit your predictions before games begin</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Track Results</h4>
                <p className="text-sm text-gray-600">Monitor game outcomes and scoring</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Earn Points</h4>
                <p className="text-sm text-gray-600">Score points based on accuracy</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">4</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Climb Leaderboards</h4>
                <p className="text-sm text-gray-600">Compete for top prediction rankings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FanPredictions;
