import React, { useState, useEffect } from 'react';

const Schedule = () => {
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
              <i className="fas fa-calendar-check text-3xl icon-gradient"></i>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">College Football Schedule</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Stay up-to-date with all college football games, matchups, and key dates throughout the season.
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-12" data-aos="fade-up" data-aos-delay="200">
          <div className="relative p-12 text-white gradient-bg">
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
                  <i className="fas fa-calendar-plus text-4xl text-white"></i>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Coming Soon</h2>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Interactive Schedule Platform
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                  <i className="fas fa-calendar-week text-3xl mb-4"></i>
                  <h3 className="font-bold text-lg mb-2">Weekly View</h3>
                  <p className="text-sm opacity-80">Complete weekly game schedules</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                  <i className="fas fa-tv text-3xl mb-4"></i>
                  <h3 className="font-bold text-lg mb-2">TV Schedule</h3>
                  <p className="text-sm opacity-80">Know where to watch every game</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                  <i className="fas fa-bell text-3xl mb-4"></i>
                  <h3 className="font-bold text-lg mb-2">Game Alerts</h3>
                  <p className="text-sm opacity-80">Never miss your team's games</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Game Times & Dates */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="300">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 metallic-3d-logo gradient-bg">
              <i className="fas fa-clock text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Game Times & Dates</h3>
            <p className="text-gray-600 mb-6">
              Complete schedule with kickoff times, time zones, and important game information for planning your viewing.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle gradient-text mr-2"></i>
                All game times & dates
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle gradient-text mr-2"></i>
                Time zone conversions
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle gradient-text mr-2"></i>
                Schedule updates
              </div>
            </div>
          </div>

          {/* TV Coverage & Streaming */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="400">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 metallic-3d-logo gradient-bg">
              <i className="fas fa-broadcast-tower text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">TV Coverage & Streaming</h3>
            <p className="text-gray-600 mb-6">
              Find out which network is broadcasting each game and available streaming options for cord-cutters.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle gradient-text mr-2"></i>
                TV network coverage
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle gradient-text mr-2"></i>
                Streaming platforms
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle gradient-text mr-2"></i>
                Regional availability
              </div>
            </div>
          </div>

          {/* Matchup Analysis */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="500">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 metallic-3d-logo gradient-bg">
              <i className="fas fa-vs text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Matchup Analysis</h3>
            <p className="text-gray-600 mb-6">
              Deep dive into upcoming matchups with team stats, historical data, and key storylines to watch.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle gradient-text mr-2"></i>
                Head-to-head records
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle gradient-text mr-2"></i>
                Key player matchups
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle gradient-text mr-2"></i>
                Injury reports
              </div>
            </div>
          </div>

          {/* Conference Schedules */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="600">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 metallic-3d-logo gradient-bg">
              <i className="fas fa-sitemap text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Conference Schedules</h3>
            <p className="text-gray-600 mb-6">
              Track conference games and standings implications with dedicated views for each conference.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle gradient-text mr-2"></i>
                Conference-only view
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle gradient-text mr-2"></i>
                Standings impact
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle gradient-text mr-2"></i>
                Rivalry games
              </div>
            </div>
          </div>

          {/* Playoff Implications */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="700">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 metallic-3d-logo gradient-bg">
              <i className="fas fa-trophy text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Playoff Implications</h3>
            <p className="text-gray-600 mb-6">
              Understand which games matter most for College Football Playoff positioning and conference championships.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle gradient-text mr-2"></i>
                Playoff impact ratings
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle gradient-text mr-2"></i>
                Championship scenarios
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle gradient-text mr-2"></i>
                Elimination games
              </div>
            </div>
          </div>

          {/* Weather & Conditions */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="800">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 metallic-3d-logo gradient-bg">
              <i className="fas fa-cloud-sun text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Weather & Conditions</h3>
            <p className="text-gray-600 mb-6">
              Game day weather forecasts and stadium conditions that could impact gameplay and strategies.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle gradient-text mr-2"></i>
                Weather forecasts
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle gradient-text mr-2"></i>
                Field conditions
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle gradient-text mr-2"></i>
                Impact analysis
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center" data-aos="fade-up" data-aos-delay="900">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <h2 className="text-3xl font-bold mb-4 gradient-text">Never Miss a Game</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Get ready for the most comprehensive college football schedule experience. 
              Set your calendar and get notified when it launches!
            </p>
            <button className="gradient-bg text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
              <i className="fas fa-bell mr-2"></i>
              Notify Me When Ready
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
