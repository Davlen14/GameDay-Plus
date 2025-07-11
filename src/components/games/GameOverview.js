import React, { useState, useEffect } from 'react';
import { gameService, teamService } from '../../services';

// Import utility components that exist in Schedule.js
const ExcitementStars = ({ excitementIndex = 0 }) => {
  const stars = Math.min(Math.max(Math.round(excitementIndex / 2), 0), 5);
  const getStarColor = () => {
    if (excitementIndex >= 8) return 'text-yellow-400';
    if (excitementIndex >= 6) return 'text-yellow-400';
    if (excitementIndex >= 4) return 'text-yellow-500';
    return 'text-gray-400';
  };

  return (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <i 
          key={i} 
          className={`fas fa-star text-sm ${i < stars ? getStarColor() : 'text-gray-300'} drop-shadow-lg filter`}
          style={i < stars && excitementIndex >= 4 ? { 
            filter: 'drop-shadow(0 0 4px rgba(234, 179, 8, 0.6))' 
          } : {}}
        />
      ))}
      <span className="text-xs font-bold text-gray-700 ml-2">
        {excitementIndex ? excitementIndex.toFixed(1) : 'N/A'}
      </span>
    </div>
  );
};

const WeatherIcon = ({ condition, temperature }) => {
  const getWeatherIcon = () => {
    if (!condition) return 'fas fa-question-circle';
    const cond = condition.toLowerCase();
    if (cond.includes('clear') || cond.includes('sunny')) return 'fas fa-sun';
    if (cond.includes('cloud')) return 'fas fa-cloud';
    if (cond.includes('rain') || cond.includes('shower')) return 'fas fa-cloud-rain';
    if (cond.includes('snow')) return 'fas fa-snowflake';
    if (cond.includes('storm') || cond.includes('thunder')) return 'fas fa-bolt';
    if (cond.includes('fog') || cond.includes('mist')) return 'fas fa-smog';
    return 'fas fa-cloud-sun';
  };

  const getWeatherColor = () => {
    if (!condition) return 'text-gray-500';
    const cond = condition.toLowerCase();
    if (cond.includes('clear') || cond.includes('sunny')) return 'text-yellow-500';
    if (cond.includes('rain') || cond.includes('storm')) return 'text-blue-500';
    if (cond.includes('snow')) return 'text-blue-200';
    if (cond.includes('cloud')) return 'text-gray-400';
    return 'text-gray-500';
  };

  return (
    <div className="flex items-center space-x-2">
      <i className={`${getWeatherIcon()} ${getWeatherColor()} text-lg`} />
      {temperature && (
        <span className="text-sm font-bold text-gray-800">
          {Math.round(temperature)}°F
        </span>
      )}
    </div>
  );
};

const WinProbabilityChart = ({ homeTeam, awayTeam, homeProb, awayProb }) => {
  if (!homeProb && !awayProb) return null;
  
  const homePct = homeProb ? Math.round(homeProb * 100) : 50;
  const awayPct = awayProb ? Math.round(awayProb * 100) : 50;
  
  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 p-4 shadow-[0_8px_25px_rgba(0,0,0,0.1)]">
      <div className="text-xs font-bold text-gray-700 mb-3 text-center flex items-center justify-center space-x-2">
        <i className="fas fa-chart-line gradient-text"></i>
        <span>Win Probability</span>
      </div>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 flex-1">
          <span className="text-sm font-bold text-gray-800">{awayTeam}</span>
          <span className="text-sm font-bold text-gray-800">{awayPct}%</span>
        </div>
        
        <div className="flex-1 h-3 bg-gray-200/50 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full rounded-full transition-all duration-700 ease-out shadow-lg"
            style={{ 
              width: `${awayPct}%`,
              background: `linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)`
            }}
          />
        </div>
        
        <div className="flex items-center space-x-2 flex-1 justify-end">
          <span className="text-sm font-bold text-gray-800">{homePct}%</span>
          <span className="text-sm font-bold text-gray-800">{homeTeam}</span>
        </div>
      </div>
    </div>
  );
};

const GameOverview = ({ game, awayTeam, homeTeam }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [headToHeadData, setHeadToHeadData] = useState(null);
  const [impactPlayers, setImpactPlayers] = useState(null);
  const [loadingH2H, setLoadingH2H] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  // Professional gradients system from FanForums
  const professionalGradients = {
    red: `linear-gradient(135deg, 
      rgb(239, 68, 68), 
      rgb(220, 38, 38), 
      rgb(185, 28, 28), 
      rgb(220, 38, 38), 
      rgb(239, 68, 68)
    )`,
    blue: `linear-gradient(135deg, 
      rgb(59, 130, 246), 
      rgb(37, 99, 235), 
      rgb(29, 78, 216), 
      rgb(37, 99, 235), 
      rgb(59, 130, 246)
    )`,
    green: `linear-gradient(135deg, 
      rgb(34, 197, 94), 
      rgb(22, 163, 74), 
      rgb(15, 118, 54), 
      rgb(22, 163, 74), 
      rgb(34, 197, 94)
    )`,
    gold: `linear-gradient(135deg, 
      rgb(250, 204, 21), 
      rgb(245, 158, 11), 
      rgb(217, 119, 6), 
      rgb(245, 158, 11), 
      rgb(250, 204, 21)
    )`,
    silver: `linear-gradient(135deg, 
      rgb(148, 163, 184), 
      rgb(100, 116, 139), 
      rgb(71, 85, 105), 
      rgb(100, 116, 139), 
      rgb(148, 163, 184)
    )`,
    orange: `linear-gradient(135deg, 
      rgb(251, 146, 60), 
      rgb(249, 115, 22), 
      rgb(234, 88, 12), 
      rgb(249, 115, 22), 
      rgb(251, 146, 60)
    )`,
    teal: `linear-gradient(135deg, 
      rgb(20, 184, 166), 
      rgb(13, 148, 136), 
      rgb(15, 118, 110), 
      rgb(13, 148, 136), 
      rgb(20, 184, 166)
    )`,
    bronze: `linear-gradient(135deg, 
      rgb(180, 83, 9), 
      rgb(154, 52, 18), 
      rgb(120, 53, 15), 
      rgb(154, 52, 18), 
      rgb(180, 83, 9)
    )`,
    indigo: `linear-gradient(135deg, 
      rgb(99, 102, 241), 
      rgb(79, 70, 229), 
      rgb(67, 56, 202), 
      rgb(79, 70, 229), 
      rgb(99, 102, 241)
    )`,
    emerald: `linear-gradient(135deg, 
      rgb(16, 185, 129), 
      rgb(5, 150, 105), 
      rgb(4, 120, 87), 
      rgb(5, 150, 105), 
      rgb(16, 185, 129)
    )`,
    purple: `linear-gradient(135deg, 
      rgb(168, 85, 247), 
      rgb(139, 69, 219), 
      rgb(124, 58, 193), 
      rgb(139, 69, 219), 
      rgb(168, 85, 247)
    )`,
    pink: `linear-gradient(135deg, 
      rgb(244, 63, 94), 
      rgb(225, 29, 72), 
      rgb(190, 18, 60), 
      rgb(225, 29, 72), 
      rgb(244, 63, 94)
    )`
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load head-to-head data
  useEffect(() => {
    const loadHeadToHead = async () => {
      if (!game || !awayTeam?.id || !homeTeam?.id) return;
      
      setLoadingH2H(true);
      try {
        // Use the head-to-head endpoint
        const h2hData = await gameService.getHeadToHead(awayTeam.id, homeTeam.id);
        setHeadToHeadData(h2hData);
      } catch (error) {
        console.warn('Error loading head-to-head data:', error);
        setHeadToHeadData(null);
      } finally {
        setLoadingH2H(false);
      }
    };

    loadHeadToHead();
  }, [game, awayTeam?.id, homeTeam?.id]);

  // Load impact players data
  useEffect(() => {
    const loadImpactPlayers = async () => {
      if (!game?.id) return;
      
      setLoadingPlayers(true);
      try {
        // Try to get game impact players first (from stats tab logic)
        const gameStats = await gameService.getGameStats(game.id);
        if (gameStats?.impactPlayers) {
          setImpactPlayers(gameStats.impactPlayers);
        } else {
          // Fallback: Get season stats for key players
          const [awayStats, homeStats] = await Promise.all([
            teamService.getTeamStats(awayTeam?.id, 2024).catch(() => null),
            teamService.getTeamStats(homeTeam?.id, 2024).catch(() => null)
          ]);
          
          // Create mock impact players based on typical positions
          const mockPlayers = {
            away: [
              { 
                name: 'Starting QB', 
                position: 'QB', 
                stats: awayStats?.offense?.passingYards ? `${Math.round(awayStats.offense.passingYards)} pass yds/game` : 'Key passing threat',
                impact: 'high'
              },
              { 
                name: 'Top RB', 
                position: 'RB', 
                stats: awayStats?.offense?.rushingYards ? `${Math.round(awayStats.offense.rushingYards)} rush yds/game` : 'Ground game leader',
                impact: 'medium'
              }
            ],
            home: [
              { 
                name: 'Starting QB', 
                position: 'QB', 
                stats: homeStats?.offense?.passingYards ? `${Math.round(homeStats.offense.passingYards)} pass yds/game` : 'Veteran leader',
                impact: 'high'
              },
              { 
                name: 'Top WR', 
                position: 'WR', 
                stats: homeStats?.offense?.passingYards ? `${Math.round(homeStats.offense.passingYards * 0.3)} rec yds/game` : 'Deep threat receiver',
                impact: 'high'
              }
            ]
          };
          setImpactPlayers(mockPlayers);
        }
      } catch (error) {
        console.warn('Error loading impact players:', error);
        setImpactPlayers(null);
      } finally {
        setLoadingPlayers(false);
      }
    };

    loadImpactPlayers();
  }, [game?.id, awayTeam?.id, homeTeam?.id]);

  // Extract game data with fallbacks
  const excitementIndex = game?.excitement_index || game?.excitementIndex || 0;
  const homePoints = game?.home_points || game?.homePoints;
  const awayPoints = game?.away_points || game?.awayPoints;
  const isCompleted = game?.completed === true;
  const attendance = game?.attendance;
  const venue = game?.venue;
  const temperature = game?.temperature;
  const weatherCondition = game?.weather_condition || game?.weatherCondition;
  const tvOutlet = game?.tv_outlet;
  const homeWinProb = game?.home_postgame_win_probability || game?.homePostgameWinProbability;
  const awayWinProb = game?.away_postgame_win_probability || game?.awayPostgameWinProbability;
  const isConferenceGame = game?.conference_game || game?.conferenceGame;
  const isRivalryGame = game?.rivalry;
  const isNeutralSite = game?.neutral_site || game?.neutralSite;

  // Get team names
  const awayTeamName = awayTeam?.school || awayTeam?.name || game?.away_team || 'Away Team';
  const homeTeamName = homeTeam?.school || homeTeam?.name || game?.home_team || 'Home Team';

  // Format game date
  const formatGameDate = (dateString) => {
    if (!dateString || dateString === 'TBD') return 'TBD';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'TBD';
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return `Today • ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow • ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else {
        return date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });
      }
    } catch (error) {
      return 'TBD';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Custom Styling */}
      <style jsx>{`
        .gradient-bg {
          background: linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c);
        }
        .gradient-text {
          background: linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      {/* Top Section - Game Essentials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Game Status Card */}
        <div className="glass-card rounded-3xl p-6">
          <div className="text-center">
            <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <i className={`fas ${isCompleted ? 'fa-flag-checkered' : 'fa-clock'} text-2xl text-white`}></i>
            </div>
            <h3 className="text-lg font-bold gradient-text mb-2">Game Status</h3>
            <div className={`text-2xl font-black mb-2 ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
              {isCompleted ? 'FINAL' : 'UPCOMING'}
            </div>
            <p className="text-gray-600 text-sm">
              {formatGameDate(game?.start_date || game?.startDate)}
            </p>
            {!isCompleted && game?.start_date && (
              <div className="mt-3 text-xs text-gray-500">
                <i className="fas fa-stopwatch mr-1"></i>
                Live countdown feature
              </div>
            )}
          </div>
        </div>

        {/* Excitement Index Card */}
        {excitementIndex > 0 && (
          <div className="glass-card rounded-3xl p-6">
            <div className="text-center">
              <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-fire text-2xl text-white"></i>
              </div>
              <h3 className="text-lg font-bold gradient-text mb-2">Excitement Level</h3>
              <div className="mb-2">
                <ExcitementStars excitementIndex={excitementIndex} />
              </div>
              <p className="text-gray-600 text-sm">
                {excitementIndex >= 8 ? 'Thriller Expected!' : 
                 excitementIndex >= 6 ? 'Great Matchup' : 
                 excitementIndex >= 4 ? 'Solid Game' : 'Standard Contest'}
              </p>
            </div>
          </div>
        )}

        {/* Weather & Venue Card */}
        <div className="glass-card rounded-3xl p-6">
          <div className="text-center">
            <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-map-marker-alt text-2xl text-white"></i>
            </div>
            <h3 className="text-lg font-bold gradient-text mb-2">Venue</h3>
            <p className="font-bold text-gray-800 mb-2">{venue || 'TBD'}</p>
            
            {(temperature || weatherCondition) && (
              <div className="mb-2">
                <WeatherIcon condition={weatherCondition} temperature={temperature} />
              </div>
            )}
            
            {attendance && (
              <p className="text-gray-600 text-sm">
                <i className="fas fa-users mr-1"></i>
                {attendance.toLocaleString()} expected
              </p>
            )}
            
            {tvOutlet && (
              <p className="text-gray-600 text-xs mt-1">
                <i className="fas fa-tv mr-1"></i>
                {tvOutlet}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Middle Section - Key Matchup Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Win Probability */}
        {(homeWinProb || awayWinProb) && (
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold gradient-text mb-4 text-center">
              <i className="fas fa-chart-line mr-2"></i>
              Win Probability
            </h3>
            <WinProbabilityChart 
              homeTeam={homeTeamName.split(' ').pop()}
              awayTeam={awayTeamName.split(' ').pop()}
              homeProb={homeWinProb}
              awayProb={awayWinProb}
            />
          </div>
        )}

        {/* Game Significance */}
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold gradient-text mb-4 text-center">
            <i className="fas fa-trophy mr-2"></i>
            Game Significance
          </h3>
          <div className="space-y-3">
            {isConferenceGame && (
              <div className="flex items-center text-blue-600">
                <i className="fas fa-trophy mr-2"></i>
                <span className="text-sm font-semibold">Conference Game</span>
              </div>
            )}
            {isRivalryGame && (
              <div className="flex items-center text-red-600">
                <i className="fas fa-fire mr-2"></i>
                <span className="text-sm font-semibold">Rivalry Matchup</span>
              </div>
            )}
            {isNeutralSite && (
              <div className="flex items-center text-purple-600">
                <i className="fas fa-balance-scale mr-2"></i>
                <span className="text-sm font-semibold">Neutral Site</span>
              </div>
            )}
            
            {/* Playoff Implications */}
            <div className="flex items-center text-green-600">
              <i className="fas fa-medal mr-2"></i>
              <span className="text-sm font-semibold">Playoff Implications</span>
            </div>
            
            {/* Head-to-Head History */}
            <div className="mt-4 p-4 rounded-xl" style={{ background: professionalGradients.silver }}>
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs font-bold text-gray-700 mb-2 flex items-center">
                  <i className="fas fa-history mr-2 text-gray-600"></i>
                  Recent Meetings
                </p>
                
                {loadingH2H ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                    <span className="text-sm text-gray-500">Loading history...</span>
                  </div>
                ) : headToHeadData ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-800">
                        All-Time: {headToHeadData.awayWins || 0}-{headToHeadData.homeWins || 0}
                      </span>
                      <span className="text-xs text-gray-600">
                        {headToHeadData.totalGames || 0} games
                      </span>
                    </div>
                    
                    {headToHeadData.recentGames && headToHeadData.recentGames.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-1">Last 3 meetings:</p>
                        {headToHeadData.recentGames.slice(0, 3).map((recentGame, idx) => (
                          <div key={idx} className="text-xs text-gray-700 flex justify-between">
                            <span>{recentGame.year || 'Recent'}</span>
                            <span className="font-semibold">
                              {recentGame.homeScore}-{recentGame.awayScore}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {headToHeadData.averageMargin && (
                      <p className="text-xs text-gray-600 mt-2">
                        Avg margin: {Math.round(headToHeadData.averageMargin)} pts
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No recent history available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Key Players & Storylines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Key Players */}
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold gradient-text mb-4 text-center">
            <i className="fas fa-star mr-2"></i>
            Key Players to Watch
          </h3>
          
          {loadingPlayers ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-red-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading player data...</p>
            </div>
          ) : impactPlayers ? (
            <>
              {/* Away Team Players */}
              <div className="mb-4">
                <h4 className="font-bold text-gray-800 mb-3 text-sm flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ background: professionalGradients.blue }}></div>
                  {awayTeamName}
                </h4>
                <div className="space-y-2">
                  {impactPlayers.away?.map((player, idx) => (
                    <div key={idx} className="p-3 rounded-xl" style={{ background: professionalGradients.blue }}>
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-bold text-gray-800">{player.position}</span>
                            <span className="text-sm text-gray-600 ml-2">- {player.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <i className={`fas ${player.position === 'QB' ? 'fa-football-ball' : player.position === 'RB' ? 'fa-bolt' : 'fa-running'} text-blue-600`}></i>
                            {player.impact === 'high' && (
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{player.stats}</p>
                      </div>
                    </div>
                  )) || (
                    <div className="p-3 rounded-xl" style={{ background: professionalGradients.blue }}>
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                        <span className="text-sm font-semibold text-gray-800">QB - Key Signal Caller</span>
                        <p className="text-xs text-gray-600 mt-1">Impact player to watch</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Home Team Players */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3 text-sm flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ background: professionalGradients.red }}></div>
                  {homeTeamName}
                </h4>
                <div className="space-y-2">
                  {impactPlayers.home?.map((player, idx) => (
                    <div key={idx} className="p-3 rounded-xl" style={{ background: professionalGradients.red }}>
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-bold text-gray-800">{player.position}</span>
                            <span className="text-sm text-gray-600 ml-2">- {player.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <i className={`fas ${player.position === 'QB' ? 'fa-football-ball' : player.position === 'RB' ? 'fa-bolt' : 'fa-running'} text-red-600`}></i>
                            {player.impact === 'high' && (
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{player.stats}</p>
                      </div>
                    </div>
                  )) || (
                    <div className="p-3 rounded-xl" style={{ background: professionalGradients.red }}>
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                        <span className="text-sm font-semibold text-gray-800">QB - Veteran Leader</span>
                        <p className="text-xs text-gray-600 mt-1">Home field advantage</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Fallback display */
            <>
              {/* Away Team Fallback */}
              <div className="mb-4">
                <h4 className="font-bold text-gray-800 mb-2 text-sm">{awayTeamName}</h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl" style={{ background: professionalGradients.teal }}>
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">QB - Key Playmaker</span>
                        <i className="fas fa-football-ball text-teal-600"></i>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: professionalGradients.emerald }}>
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">RB - Explosive Runner</span>
                        <i className="fas fa-bolt text-emerald-600"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Home Team Fallback */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2 text-sm">{homeTeamName}</h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl" style={{ background: professionalGradients.orange }}>
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">QB - Veteran Leader</span>
                        <i className="fas fa-football-ball text-orange-600"></i>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: professionalGradients.purple }}>
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">WR - Deep Threat</span>
                        <i className="fas fa-running text-purple-600"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Key Storylines */}
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold gradient-text mb-4 text-center">
            <i className="fas fa-newspaper mr-2"></i>
            Key Storylines
          </h3>
          
          <div className="space-y-3">
            <div className="p-4 rounded-xl" style={{ background: professionalGradients.blue }}>
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  <i className="fas fa-chart-line mr-2 text-blue-600"></i>
                  Conference Championship Impact
                </p>
                <p className="text-xs text-gray-600">
                  Winner gains significant advantage in conference race
                </p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl" style={{ background: professionalGradients.emerald }}>
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  <i className="fas fa-trophy mr-2 text-emerald-600"></i>
                  Playoff Positioning
                </p>
                <p className="text-xs text-gray-600">
                  Critical game for College Football Playoff hopes
                </p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl" style={{ background: professionalGradients.purple }}>
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  <i className="fas fa-fire mr-2 text-purple-600"></i>
                  Coaching Matchup
                </p>
                <p className="text-xs text-gray-600">
                  Battle of strategic minds on the sidelines
                </p>
              </div>
            </div>

            {excitementIndex >= 6 && (
              <div className="p-4 rounded-xl" style={{ background: professionalGradients.gold }}>
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-sm font-semibold text-gray-800 mb-1">
                    <i className="fas fa-star mr-2 text-yellow-600"></i>
                    Must-Watch Game
                  </p>
                  <p className="text-xs text-gray-600">
                    High excitement rating suggests thriller potential
                  </p>
                </div>
              </div>
            )}

            {headToHeadData?.isRivalry && (
              <div className="p-4 rounded-xl" style={{ background: professionalGradients.pink }}>
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-sm font-semibold text-gray-800 mb-1">
                    <i className="fas fa-fire mr-2 text-pink-600"></i>
                    Historic Rivalry
                  </p>
                  <p className="text-xs text-gray-600">
                    Long-standing rivalry adds extra intensity
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Updates Section (if game is active) */}
      {!isCompleted && homePoints !== null && awayPoints !== null && (
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold gradient-text mb-4 text-center">
            <i className="fas fa-broadcast-tower mr-2"></i>
            Live Game Updates
          </h3>
          <div className="text-center">
            <div className="text-3xl font-black gradient-text mb-2">
              {awayTeamName.split(' ').pop()} {awayPoints} - {homePoints} {homeTeamName.split(' ').pop()}
            </div>
            <p className="text-gray-600">Live updates and key plays will appear here</p>
            <div className="mt-4 flex justify-center space-x-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">LIVE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameOverview;
