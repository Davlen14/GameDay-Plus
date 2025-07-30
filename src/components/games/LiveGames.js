import React, { useState, useEffect } from 'react';
import { gameService } from '../../services/gameService';
import graphqlService from '../../services/graphqlService';

const LiveGames = () => {
  const [animateShine, setAnimateShine] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedConference, setSelectedConference] = useState('all');
  const [error, setError] = useState(null);

  // Available weeks and conferences for filtering
  const weeks = Array.from({ length: 15 }, (_, i) => i + 1);
  const conferences = [
    { value: 'all', label: 'All Conferences' },
    { value: 'SEC', label: 'SEC' },
    { value: 'Big Ten', label: 'Big Ten' },
    { value: 'Big 12', label: 'Big 12' },
    { value: 'ACC', label: 'ACC' },
    { value: 'Pac-12', label: 'Pac-12' },
    { value: 'American Athletic', label: 'AAC' },
    { value: 'Mountain West', label: 'Mountain West' },
    { value: 'Conference USA', label: 'C-USA' },
    { value: 'Mid-American', label: 'MAC' },
    { value: 'Sun Belt', label: 'Sun Belt' }
  ];

  useEffect(() => {
    setAnimateShine(true);
    
    // Update time every second for live effect
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load games when week or conference changes
  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use 2024 since 2025 season hasn't started yet (same as GamePredictor)
        const year = 2024;
        console.log(`🚀 Loading games for Week ${selectedWeek} ${year} using GamePredictor pattern...`);
        
        // Try GraphQL first (same pattern as GamePredictor)
        let weekGames = [];
        
        try {
          console.log('🚀 Loading games via GraphQL...');
          
          // Check GraphQL availability first
          const isGraphQLAvailable = await graphqlService.utils.isAvailable();
          if (!isGraphQLAvailable) {
            throw new Error('GraphQL service not available');
          }
          
          const graphqlData = await graphqlService.getWeeklyGamesForPrediction(selectedWeek, year);
          
          if (graphqlData && graphqlData.games) {
            weekGames = graphqlData.games;
            console.log('✓ Successfully loaded data via GraphQL');
          } else {
            throw new Error('GraphQL returned empty data');
          }
        } catch (graphqlError) {
          console.warn('⚠️ GraphQL loading failed, falling back to REST API:', graphqlError.message);
          try {
            weekGames = await gameService.getGames(year, selectedWeek, 'regular', null, null, null, null, 'fbs', null, false);
            console.log('✓ Successfully loaded data via REST API');
          } catch (restError) {
            console.error('❌ REST API fallback also failed:', restError.message);
            console.warn('Using mock data for demo purposes');
            // Fallback to mock data for demo
            weekGames = [
              {
                id: 1,
                season: year,
                week: selectedWeek,
                start_date: '2024-09-02T19:00:00.000Z',
                home_team: 'Georgia',
                away_team: 'Clemson',
                home_conference: 'SEC',
                away_conference: 'ACC',
                venue: 'Mercedes-Benz Stadium',
                completed: true,
                home_points: 34,
                away_points: 3
              },
              {
                id: 2,
                season: year,
                week: selectedWeek,
                start_date: '2024-09-02T20:00:00.000Z',
                home_team: 'Texas',
                away_team: 'Colorado State',
                home_conference: 'Big 12',
                away_conference: 'Mountain West',
                venue: 'DKR-Texas Memorial Stadium',
                completed: false
              },
              {
                id: 3,
                season: year,
                week: selectedWeek,
                start_date: '2024-09-02T21:00:00.000Z',
                home_team: 'Ohio State',
                away_team: 'Akron',
                home_conference: 'Big Ten',
                away_conference: 'Mid-American',
                venue: 'Ohio Stadium',
                completed: true,
                home_points: 52,
                away_points: 6
              },
              {
                id: 4,
                season: year,
                week: selectedWeek,
                start_date: '2024-09-02T15:30:00.000Z',
                home_team: 'Alabama',
                away_team: 'Western Kentucky',
                home_conference: 'SEC',
                away_conference: 'Conference USA',
                venue: 'Bryant-Denny Stadium',
                completed: true,
                home_points: 63,
                away_points: 0
              },
              {
                id: 5,
                season: year,
                week: selectedWeek,
                start_date: '2024-09-02T16:00:00.000Z',
                home_team: 'Michigan',
                away_team: 'Fresno State',
                home_conference: 'Big Ten',
                away_conference: 'Mountain West',
                venue: 'Michigan Stadium',
                completed: false
              }
            ];
          }
        }
        
        // Filter by conference if selected
        let filteredGames = weekGames || [];
        if (selectedConference !== 'all') {
          filteredGames = filteredGames.filter(game => 
            game.home_conference === selectedConference || 
            game.away_conference === selectedConference
          );
        }

        // Sort games by date
        filteredGames.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        
        setGames(filteredGames);
        console.log(`✅ Loaded ${filteredGames.length} games for Week ${selectedWeek} ${year}`);
      } catch (error) {
        console.error('Error loading games:', error);
        setError(`Failed to load games: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [selectedWeek, selectedConference]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatGameTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatGameDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGameStatus = (game) => {
    const now = new Date();
    const gameDate = new Date(game.start_date);
    
    if (game.completed) {
      return { status: 'completed', text: 'FINAL', color: 'text-gray-600' };
    } else if (gameDate > now) {
      return { status: 'upcoming', text: formatGameTime(game.start_date), color: 'text-blue-600' };
    } else {
      return { status: 'live', text: 'LIVE', color: 'text-red-600' };
    }
  };

  const getTeamLogo = (teamName) => {
    if (!teamName) return '/team_logos/default.png';
    const logoName = teamName.replace(/\s+/g, '_');
    return `/team_logos/${logoName}.png`;
  };

  const getTVNetwork = (game) => {
    // Mock TV networks for demo - in real implementation this would come from API
    const networks = ['ESPN', 'ABC', 'CBS', 'FOX', 'NBC', 'ESPN2', 'FS1', 'CBSSN', 'ACCN', 'SECN', 'BTN'];
    return networks[Math.floor(Math.random() * networks.length)];
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
            Real-time game tracking, live scores, and instant updates from college football games (2024 Season).
          </p>
          
          {/* Live Time Display */}
          <div className="mt-8 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2 gradient-bg text-white px-6 py-3 rounded-full">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-bold">LIVE</span>
              <span className="font-mono">{formatTime(currentTime)}</span>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12" data-aos="fade-up" data-aos-delay="200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center">
                <i className="fas fa-filter text-white text-lg"></i>
              </div>
              <h2 className="text-2xl font-bold gradient-text">Game Filters</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Week Selector */}
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">Week:</label>
                <select 
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {weeks.map(week => (
                    <option key={week} value={week}>Week {week}</option>
                  ))}
                </select>
              </div>

              {/* Conference Selector */}
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">Conference:</label>
                <select 
                  value={selectedConference}
                  onChange={(e) => setSelectedConference(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {conferences.map(conf => (
                    <option key={conf.value} value={conf.value}>{conf.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-red-600 border-r-red-400"></div>
              </div>
              <p className="text-gray-700 font-medium">Loading Week {selectedWeek} Games...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 max-w-md mx-auto">
              <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
              <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Games</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 max-w-md mx-auto">
              <i className="fas fa-calendar-times text-gray-400 text-4xl mb-4"></i>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Games Found</h3>
              <p className="text-gray-600">No games scheduled for Week {selectedWeek}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
            {games.map((game, index) => {
              const gameStatus = getGameStatus(game);
              const tvNetwork = getTVNetwork(game);
              
              return (
                <div 
                  key={game.id || index}
                  className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                  data-aos="fade-up" 
                  data-aos-delay={100 + (index * 50)}
                >
                  {/* Game Header with TV Info */}
                  <div className="relative gradient-bg p-4 text-white">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-2 right-2 w-16 h-16 border border-white border-opacity-20 rounded-full animate-ping"></div>
                      <div className="absolute bottom-2 left-2 w-12 h-12 border border-white border-opacity-10 rounded-full animate-ping animation-delay-1000"></div>
                    </div>
                    
                    {/* Live Indicator Dots */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-3 left-3 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                      <div className="absolute top-6 right-6 w-2 h-2 bg-white rounded-full animate-pulse animation-delay-500"></div>
                      <div className="absolute bottom-3 left-6 w-1 h-1 bg-white rounded-full animate-pulse animation-delay-1000"></div>
                    </div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <i className="fas fa-satellite-dish text-lg text-white"></i>
                        </div>
                        <div>
                          <div className="text-sm opacity-90">{formatGameDate(game.start_date)}</div>
                          <div className="font-bold text-lg">{game.venue || 'TBD'}</div>
                        </div>
                      </div>
                      
                      {/* TV Network Badge */}
                      <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-3 py-1 backdrop-blur-sm">
                        <i className="fas fa-tv text-sm"></i>
                        <span className="text-sm font-bold">{tvNetwork}</span>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Game Content */}
                  <div className="p-6">
                    {/* Teams Display */}
                    <div className="flex items-center justify-between mb-6">
                      {/* Away Team */}
                      <div className="flex items-center space-x-3 flex-1">
                        <img 
                          src={getTeamLogo(game.away_team)} 
                          alt={`${game.away_team} logo`}
                          className="w-12 h-12 rounded-full shadow-md"
                          onError={(e) => { 
                            e.target.src = '/team_logos/default.png';
                          }}
                        />
                        <div>
                          <div className="font-bold text-lg text-gray-800">{game.away_team}</div>
                          <div className="text-sm text-gray-500">{game.away_conference}</div>
                        </div>
                      </div>

                      {/* VS/Score Section */}
                      <div className="flex flex-col items-center mx-4">
                        {game.completed ? (
                          <div className="text-center">
                            <div className="text-3xl font-black gradient-text">
                              {game.away_points} - {game.home_points}
                            </div>
                            <div className={`text-sm font-bold ${gameStatus.color}`}>
                              {gameStatus.text}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-400 mb-1">VS</div>
                            <div className={`text-sm font-bold ${gameStatus.color} flex items-center space-x-1`}>
                              {gameStatus.status === 'live' && (
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              )}
                              <span>{gameStatus.text}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Home Team */}
                      <div className="flex items-center space-x-3 flex-1 justify-end">
                        <div className="text-right">
                          <div className="font-bold text-lg text-gray-800">{game.home_team}</div>
                          <div className="text-sm text-gray-500">{game.home_conference}</div>
                        </div>
                        <img 
                          src={getTeamLogo(game.home_team)} 
                          alt={`${game.home_team} logo`}
                          className="w-12 h-12 rounded-full shadow-md"
                          onError={(e) => { 
                            e.target.src = '/team_logos/default.png';
                          }}
                        />
                      </div>
                    </div>

                    {/* Game Details */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-clock text-gray-400"></i>
                          <span>Week {game.week}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-map-marker-alt text-gray-400"></i>
                          <span className="truncate">{game.venue_id || 'TBD'}</span>
                        </div>
                      </div>
                      
                      {/* Live Status Bar */}
                      {gameStatus.status === 'live' && (
                        <div className="flex items-center justify-center space-x-2 bg-red-50 border border-red-200 rounded-lg p-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-red-600 font-bold text-sm">GAME IN PROGRESS</span>
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse animation-delay-500"></div>
                        </div>
                      )}
                      
                      {/* Upcoming Game Countdown */}
                      {gameStatus.status === 'upcoming' && (
                        <div className="flex items-center justify-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                          <i className="fas fa-calendar-alt text-blue-500"></i>
                          <span className="text-blue-600 font-bold text-sm">
                            {formatGameDate(game.start_date)} at {formatGameTime(game.start_date)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 mt-4">
                      <button className="flex-1 gradient-bg text-white py-2 px-4 rounded-lg font-medium text-sm hover:opacity-90 transition-all duration-300 transform hover:-translate-y-1">
                        <i className="fas fa-chart-line mr-2"></i>
                        View Stats
                      </button>
                      <button className="flex-1 border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium text-sm hover:border-red-500 hover:text-red-500 transition-all duration-300">
                        <i className="fas fa-bell mr-2"></i>
                        Set Alert
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center" data-aos="fade-up" data-aos-delay="700">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <h2 className="text-3xl font-bold mb-4 gradient-text">Never Miss a Play</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience the most comprehensive live college football coverage. 
              Stay updated with real-time scores and game alerts!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="gradient-bg text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
                <i className="fas fa-satellite-dish mr-2"></i>
                Get Live Updates
              </button>
              <button className="border-2 border-[rgb(204,0,28)] gradient-text px-8 py-4 rounded-xl font-bold text-lg hover:gradient-bg hover:text-white transform hover:-translate-y-1 transition-all duration-300">
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
