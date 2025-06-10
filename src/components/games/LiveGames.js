import React, { useState, useEffect } from 'react';

const LiveGames = () => {
  const [animateShine, setAnimateShine] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setAnimateShine(true);
    
    // Update time every second for live effect
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16" data-aos="fade-up">
          <div className="flex items-center justify-center mb-6">
            <div className={`w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center ${animateShine ? 'metallic-3d-logo-enhanced' : ''}`}>
              <i className="fas fa-broadcast-tower text-3xl icon-gradient"></i>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Live Games</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real-time game tracking, live scores, and instant updates from college football games in progress.
          </p>
          
          {/* Live Time Display */}
          <div className="mt-8 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-full">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-bold">LIVE</span>
              <span className="font-mono">{formatTime(currentTime)}</span>
            </div>
          </div>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-12" data-aos="fade-up" data-aos-delay="200">
          <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-12 text-white">
            {/* Live Wave Animation */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-20 left-10 w-32 h-32 border-4 border-white border-opacity-20 rounded-full animate-ping"></div>
                <div className="absolute bottom-20 right-20 w-24 h-24 border-4 border-white border-opacity-30 rounded-full animate-ping animation-delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-4 border-white border-opacity-10 rounded-full animate-ping animation-delay-2000"></div>
              </div>
            </div>
            
            {/* Live Indicator Dots */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-16 left-16 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-24 right-24 w-3 h-3 bg-white rounded-full animate-pulse animation-delay-500"></div>
              <div className="absolute bottom-24 left-24 w-2 h-2 bg-white rounded-full animate-pulse animation-delay-1000"></div>
              <div className="absolute bottom-16 right-16 w-3 h-3 bg-white rounded-full animate-pulse animation-delay-1500"></div>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center mb-8">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm relative">
                  <i className="fas fa-satellite-dish text-4xl text-white"></i>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Real-Time Coverage</h2>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Live Game Tracking & Updates
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                  <i className="fas fa-stopwatch text-3xl mb-4"></i>
                  <h3 className="font-bold text-lg mb-2">Live Scoring</h3>
                  <p className="text-sm opacity-80">Real-time score updates</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                  <i className="fas fa-chart-line text-3xl mb-4"></i>
                  <h3 className="font-bold text-lg mb-2">Live Stats</h3>
                  <p className="text-sm opacity-80">In-game statistics</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                  <i className="fas fa-bell text-3xl mb-4"></i>
                  <h3 className="font-bold text-lg mb-2">Instant Alerts</h3>
                  <p className="text-sm opacity-80">Key play notifications</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Live Scoreboard */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="300">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mb-6 metallic-3d-logo relative">
              <i className="fas fa-tv text-white text-2xl"></i>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Live Scoreboard</h3>
            <p className="text-gray-600 mb-6">
              Real-time scores, quarters, time remaining, and possession indicators for all active games.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Real-time score updates
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Game clock tracking
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Possession indicators
              </div>
            </div>
          </div>

          {/* Play-by-Play */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="400">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mb-6 metallic-3d-logo">
              <i className="fas fa-list text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Play-by-Play</h3>
            <p className="text-gray-600 mb-6">
              Live play-by-play updates with drive charts, key plays, and momentum tracking throughout the game.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Live play descriptions
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Drive progression
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Key play highlights
              </div>
            </div>
          </div>

          {/* Live Analytics */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="500">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mb-6 metallic-3d-logo">
              <i className="fas fa-chart-area text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Live Analytics</h3>
            <p className="text-gray-600 mb-6">
              Real-time win probability, efficiency metrics, and advanced analytics updating with every play.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Win probability tracking
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Efficiency metrics
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Momentum indicators
              </div>
            </div>
          </div>
        </div>

        {/* Live Game Sample */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16" data-aos="fade-up" data-aos-delay="600">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text">Sample Live Game Interface</h2>
            <div className="flex items-center space-x-2 text-red-600">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="font-bold text-sm">LIVE PREVIEW</span>
            </div>
          </div>
          
          {/* Mock Game Card */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">SEC Championship • Atlanta, GA</div>
              <div className="text-sm font-bold text-red-600">Q4 2:47</div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">#3 Georgia</div>
                <div className="text-4xl font-black gradient-text">24</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">#5 Alabama</div>
                <div className="text-4xl font-black gradient-text">21</div>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-600 mb-4">
              Georgia ball • 1st & 10 at ALA 35
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-bold">Win Probability</div>
                <div className="text-red-600">UGA 67%</div>
              </div>
              <div>
                <div className="font-bold">Total Yards</div>
                <div>UGA 412 | ALA 386</div>
              </div>
              <div>
                <div className="font-bold">Turnovers</div>
                <div>UGA 1 | ALA 2</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center" data-aos="fade-up" data-aos-delay="700">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <h2 className="text-3xl font-bold mb-4 gradient-text">Never Miss a Play</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience the most comprehensive live college football coverage. 
              Be the first to access our real-time game tracking platform!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-red-700 hover:to-red-800 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
                <i className="fas fa-satellite-dish mr-2"></i>
                Get Live Access
              </button>
              <button className="border-2 border-red-600 text-red-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-600 hover:text-white transform hover:-translate-y-1 transition-all duration-300">
                <i className="fas fa-bell mr-2"></i>
                Set Game Alerts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveGames;
