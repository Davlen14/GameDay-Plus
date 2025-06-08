import React from 'react';

const Videos = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Videos</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Video content hub for college football highlights and analysis
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-video text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Your one-stop destination for college football video content.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-play-circle text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Game Highlights</h3>
                <p className="text-gray-600">Best plays and game summaries</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-chart-line text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Analysis Videos</h3>
                <p className="text-gray-600">Expert breakdowns and insights</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-microphone text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Press Conferences</h3>
                <p className="text-gray-600">Coach and player interviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Videos;
