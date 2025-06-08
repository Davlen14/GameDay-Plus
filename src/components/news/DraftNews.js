import React from 'react';

const DraftNews = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Draft News</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Latest NFL Draft news and college player evaluations
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-football-ball text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Stay updated with the latest NFL Draft news, prospect evaluations, and draft projections.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-star text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Prospect Rankings</h3>
                <p className="text-gray-600">Top NFL Draft prospects by position</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-clipboard-list text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Mock Drafts</h3>
                <p className="text-gray-600">Updated draft predictions and scenarios</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-chart-line text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Stock Watch</h3>
                <p className="text-gray-600">Rising and falling prospect values</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-calendar text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Draft Timeline</h3>
                <p className="text-gray-600">Key dates and events leading to draft</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftNews;
