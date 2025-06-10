import React, { useState, useEffect } from 'react';

const Schedule2024Recap = () => {
  const [animateShine, setAnimateShine] = useState(false);

  useEffect(() => {
    setAnimateShine(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16" data-aos="fade-up">
          <div className="flex items-center justify-center mb-6">
            <div className={`w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center ${animateShine ? 'metallic-3d-logo-enhanced' : ''}`}>
              <i className="fas fa-calendar-alt text-3xl icon-gradient"></i>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">2024 Season Recap</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Relive the most memorable moments, games, and storylines from the 2024 college football season.
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-12" data-aos="fade-up" data-aos-delay="200">
          <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-12 text-white">
            {/* Particle Effect Overlay */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full animate-ping"></div>
              <div className="absolute bottom-20 left-20 w-3 h-3 bg-white rounded-full animate-pulse delay-1000"></div>
              <div className="absolute bottom-10 right-10 w-2 h-2 bg-white rounded-full animate-ping delay-500"></div>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center mb-8">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <i className="fas fa-trophy text-4xl text-white"></i>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Coming Soon</h2>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Comprehensive 2024 Season Analysis
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                  <i className="fas fa-chart-line text-3xl mb-4"></i>
                  <h3 className="font-bold text-lg mb-2">Season Statistics</h3>
                  <p className="text-sm opacity-80">Complete statistical breakdowns</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                  <i className="fas fa-fire text-3xl mb-4"></i>
                  <h3 className="font-bold text-lg mb-2">Key Moments</h3>
                  <p className="text-sm opacity-80">Memorable games and plays</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                  <i className="fas fa-crown text-3xl mb-4"></i>
                  <h3 className="font-bold text-lg mb-2">Championship Path</h3>
                  <p className="text-sm opacity-80">Playoff journey analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Season Highlights */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="300">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mb-6 metallic-3d-logo">
              <i className="fas fa-star text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Season Highlights</h3>
            <p className="text-gray-600 mb-6">
              Interactive timeline of the most exciting moments, upsets, and record-breaking performances.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Game-changing moments
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Record performances
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Upset alerts
              </div>
            </div>
          </div>

          {/* Conference Championships */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="400">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mb-6 metallic-3d-logo">
              <i className="fas fa-medal text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Conference Championships</h3>
            <p className="text-gray-600 mb-6">
              Complete breakdown of all conference championship games and their impact on the playoff picture.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                All conference results
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Playoff implications
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Championship analysis
              </div>
            </div>
          </div>

          {/* Bowl & Playoff Games */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="500">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mb-6 metallic-3d-logo">
              <i className="fas fa-trophy text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Bowl & Playoff Games</h3>
            <p className="text-gray-600 mb-6">
              Comprehensive coverage of all bowl games and the complete College Football Playoff journey.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                All bowl game results
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Playoff bracket analysis
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Championship game recap
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center" data-aos="fade-up" data-aos-delay="600">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <h2 className="text-3xl font-bold mb-4 gradient-text">Stay Tuned</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              We're working hard to bring you the most comprehensive 2024 season recap experience. 
              Get notified when it launches!
            </p>
            <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-red-700 hover:to-red-800 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
              <i className="fas fa-bell mr-2"></i>
              Notify Me When Ready
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule2024Recap;
