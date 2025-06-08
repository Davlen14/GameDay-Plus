import React from 'react';

const LatestNews = () => {
  return (
    <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6 gradient-text">Latest News</h1>
        <div className="bg-white rounded-xl p-12 shadow-lg">
          <i className="fas fa-newspaper text-6xl icon-gradient mb-6"></i>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Coming Soon</h2>
          <p className="text-xl text-gray-600 mb-8">
            Breaking news, updates, and comprehensive coverage of college football from all major sources.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2 gradient-text">Breaking News</h3>
              <p className="text-gray-600">Real-time updates on major developments</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2 gradient-text">Game Recaps</h3>
              <p className="text-gray-600">Detailed analysis of recent games</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2 gradient-text">Injury Reports</h3>
              <p className="text-gray-600">Player injury updates and impact analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestNews;
