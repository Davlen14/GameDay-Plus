import React, { useEffect, useState } from 'react';
import { playService } from '../../services/playService';
import { driveService } from '../../services/driveService';
import FootballField from './FootballField';

const GamePlayByPlay = ({ game, awayTeam, homeTeam }) => {
  const [winProbData, setWinProbData] = useState([]);
  const [plays, setPlays] = useState(null);
  const [drives, setDrives] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlay, setSelectedPlay] = useState(null);
  const [hoveredPlay, setHoveredPlay] = useState(null);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [simulationPlay, setSimulationPlay] = useState(null);

  // Get team data with fallbacks to Whitmer
  const getHomeTeamData = () => {
    if (homeTeam) {
      return {
        name: homeTeam.school || 'WHITMER',
        logo: homeTeam.logos?.[0] || '/photos/Whitmer.png',
        primaryColor: homeTeam.color || '#cc001c',
        secondaryColor: homeTeam.alternateColor || '#a10014'
      };
    }
    return {
      name: 'WHITMER',
      logo: '/photos/Whitmer.png',
      primaryColor: '#cc001c',
      secondaryColor: '#a10014'
    };
  };

  const getAwayTeamData = () => {
    if (awayTeam) {
      return {
        name: awayTeam.school || 'OPPONENT',
        logo: awayTeam.logos?.[0] || '/photos/ncaaf.png',
        primaryColor: awayTeam.color || '#3b82f6',
        secondaryColor: awayTeam.alternateColor || '#1e40af'
      };
    }
    return {
      name: 'OPPONENT',
      logo: '/photos/ncaaf.png',
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af'
    };
  };

  const homeData = getHomeTeamData();
  const awayData = getAwayTeamData();

  // Convert drives data to win probability data
  const processWinProbabilityData = () => {
    if (!drives || drives.length === 0) return [];
    
    let playNumber = 1;
    const winProbDataTemp = [];
    
    drives.forEach(drive => {
      if (drive.plays && drive.plays.length > 0) {
        drive.plays.forEach(play => {
          // Calculate mock win probability based on score differential and field position
          const scoreDiff = (play.homeScore || 0) - (play.awayScore || 0);
          const fieldPosition = play.yardsToGoal || 50;
          
          // Basic win probability calculation (this would normally come from API)
          let baseWinProb = 0.5;
          baseWinProb += (scoreDiff * 0.05); // Adjust for score
          baseWinProb += ((50 - fieldPosition) * 0.002); // Adjust for field position
          baseWinProb = Math.max(0.05, Math.min(0.95, baseWinProb));
          
          winProbDataTemp.push({
            playId: play.id,
            playNumber: playNumber++,
            homeWinProbability: baseWinProb,
            homeScore: play.homeScore || 0,
            awayScore: play.awayScore || 0,
            down: play.down || 1,
            distance: play.distance || 10,
            yardLine: play.yardsToGoal || 50,
            homeBall: play.teamId === (homeTeam?.id || game.homeId),
            playText: play.playText || 'Play description not available',
            period: play.period || 1,
            clock: play.clock || '15:00'
          });
        });
      }
    });
    
    return winProbDataTemp;
  };

  // Helper functions
  const ordinalString = (number) => {
    switch (number) {
      case 1: return "1st";
      case 2: return "2nd";
      case 3: return "3rd";
      case 4: return "4th";
      default: return `${number}th`;
    }
  };

  const formatYardLine = (yardLine, homeBall) => {
    if (yardLine <= 50) {
      return `${homeBall ? homeData.name : awayData.name} ${yardLine}`;
    } else {
      return `${!homeBall ? homeData.name : awayData.name} ${100 - yardLine}`;
    }
  };

  // Update win prob data when drives change
  React.useEffect(() => {
    if (drives) {
      const winProbDataProcessed = processWinProbabilityData();
      setWinProbData(winProbDataProcessed);
      if (winProbDataProcessed.length > 0) {
        setSelectedPlay(winProbDataProcessed[winProbDataProcessed.length - 1]);
      }
    }
  }, [drives]);

  // Debug function to load plays and drives
  const loadPlayByPlayData = async () => {
    if (!game) {
      setError('No game data provided');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading play-by-play data for game:', game);
      
      // Try multiple approaches to get the data
      const results = {
        plays: null,
        drives: null,
        errors: []
      };

      // Method 1: Try with game ID if available
      if (game.id) {
        try {
          console.log('Attempting to load live plays with game ID:', game.id);
          const livePlays = await playService.getLivePlays(game.id);
          results.plays = livePlays;
          console.log('Live plays loaded:', livePlays);
        } catch (err) {
          console.error('Live plays failed:', err);
          results.errors.push(`Live plays error: ${err.message}`);
        }
      }

      // Method 2: Try with year/week/team
      if (!results.plays && game.season && game.week) {
        try {
          console.log('Attempting to load plays with year/week:', game.season, game.week);
          const playsData = await playService.getPlays(
            game.season, 
            game.week,
            homeData.name,
            null,
            null,
            null,
            null,
            null,
            null,
            game.season_type || 'regular'
          );
          results.plays = playsData;
          console.log('Plays loaded:', playsData);
        } catch (err) {
          console.error('Plays by year/week failed:', err);
          results.errors.push(`Plays by year/week error: ${err.message}`);
        }
      }

      // Load drives
      if (game.season && game.week) {
        try {
          console.log('Attempting to load drives:', game.season, game.week);
          const drivesData = await driveService.getDrives(
            game.season,
            game.season_type || 'regular',
            game.week,
            homeData.name
          );
          results.drives = drivesData;
          console.log('Drives loaded:', drivesData);
        } catch (err) {
          console.error('Drives failed:', err);
          results.errors.push(`Drives error: ${err.message}`);
        }
      }

      setPlays(results.plays);
      setDrives(results.drives);
      
      if (results.errors.length > 0 && !results.plays && !results.drives) {
        setError(results.errors.join('\n'));
      }
      
    } catch (error) {
      console.error('Error loading play-by-play data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load data on component mount
  React.useEffect(() => {
    loadPlayByPlayData();
  }, [game]);

  // Game Header Component
  const GameHeader = () => (
    <div className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm mb-6">
      {/* Home Team */}
      <div className="flex flex-col items-center space-y-2 flex-1">
        <img
          src={homeData.logo}
          alt={`${homeData.name} logo`}
          className="w-12 h-12 object-contain"
          onError={(e) => { e.target.src = '/photos/Whitmer.png'; }}
        />
        <span className="text-sm font-medium text-gray-700">{homeData.name}</span>
        <span className="text-2xl font-bold text-gray-900">{game.homePoints || 0}</span>
      </div>

      {/* Game Status */}
      <div className="flex flex-col items-center space-y-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {game.completed ? 'FINAL' : 'LIVE'}
        </span>
        <span className="text-xs text-gray-400">Play-by-Play</span>
      </div>

      {/* Away Team */}
      <div className="flex flex-col items-center space-y-2 flex-1">
        <img
          src={awayData.logo}
          alt={`${awayData.name} logo`}
          className="w-12 h-12 object-contain"
          onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
        />
        <span className="text-sm font-medium text-gray-700">{awayData.name}</span>
        <span className="text-2xl font-bold text-gray-900">{game.awayPoints || 0}</span>
      </div>
    </div>
  );

  // Live Ball Indicator Component
  const LiveBallIndicator = () => {
    if (game.completed || winProbData.length === 0) return null;
    
    const lastPlay = winProbData[winProbData.length - 1];
    
    return (
      <div className="flex items-center space-x-3 px-4 py-3 bg-white rounded-lg border border-red-200 mb-4">
        {/* Live indicator */}
        <div className="relative">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-30"></div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-gray-900">
              {lastPlay.homeScore} - {lastPlay.awayScore}
            </span>
            <div className="flex items-center space-x-1">
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: lastPlay.homeBall ? homeData.primaryColor : awayData.primaryColor }}
              ></div>
              <span 
                className="text-xs font-medium"
                style={{ color: lastPlay.homeBall ? homeData.primaryColor : awayData.primaryColor }}
              >
                {lastPlay.homeBall ? homeData.name : awayData.name}
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-500">
            {ordinalString(lastPlay.down)} & {lastPlay.distance} at {formatYardLine(lastPlay.yardLine, lastPlay.homeBall)}
          </span>
        </div>
      </div>
    );
  };

  // Win Probability Chart Component
  const WinProbabilityChart = () => {
    if (winProbData.length === 0) return null;

    const maxX = Math.max(100, winProbData.length);
    const chartWidth = 100 - 40; // Available width percentage after Y-axis labels

    return (
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Win Probability</h3>
        
        {/* Chart Container */}
        <div className="relative h-64 bg-white rounded-lg p-4 mb-4 overflow-hidden border border-gray-200">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Background Grid - Horizontal lines */}
            {[0, 25, 50, 75, 100].map(y => (
              <g key={`h-${y}`}>
                <line
                  x1="12"
                  y1={100 - y}
                  x2="95"
                  y2={100 - y}
                  stroke="#e5e7eb"
                  strokeWidth="0.2"
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x="8"
                  y={100 - y + 1}
                  fontSize="2"
                  fill="#6b7280"
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {y}%
                </text>
              </g>
            ))}

            {/* Background Grid - Vertical lines */}
            {Array.from({ length: 11 }, (_, i) => i * 10).map(playNum => (
              <line
                key={`v-${playNum}`}
                x1={12 + (chartWidth * playNum) / maxX}
                y1="5"
                x2={12 + (chartWidth * playNum) / maxX}
                y2="95"
                stroke="#f3f4f6"
                strokeWidth="0.1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            
            {/* Home team win probability area fill */}
            <path
              d={`M 12 100 ${winProbData.map((play, index) => {
                const x = 12 + (chartWidth * play.playNumber) / maxX;
                const y = 100 - (play.homeWinProbability * 95);
                return `L ${x} ${y}`;
              }).join(' ')} L ${12 + (chartWidth * winProbData.length) / maxX} 100 Z`}
              fill={`url(#homeGradient)`}
              opacity="0.3"
            />

            {/* Away team win probability area fill */}
            <path
              d={`M 12 0 ${winProbData.map((play, index) => {
                const x = 12 + (chartWidth * play.playNumber) / maxX;
                const y = 100 - ((1 - play.homeWinProbability) * 95);
                return `L ${x} ${y}`;
              }).join(' ')} L ${12 + (chartWidth * winProbData.length) / maxX} 0 Z`}
              fill={`url(#awayGradient)`}
              opacity="0.2"
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="homeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={homeData.primaryColor} stopOpacity="0.6"/>
                <stop offset="100%" stopColor={homeData.primaryColor} stopOpacity="0.1"/>
              </linearGradient>
              <linearGradient id="awayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={awayData.primaryColor} stopOpacity="0.6"/>
                <stop offset="100%" stopColor={awayData.primaryColor} stopOpacity="0.1"/>
              </linearGradient>
            </defs>
            
            {/* Home team win probability line */}
            <path
              d={winProbData.map((play, index) => {
                const x = 12 + (chartWidth * play.playNumber) / maxX;
                const y = 100 - (play.homeWinProbability * 95);
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke={homeData.primaryColor}
              strokeWidth="0.8"
              vectorEffect="non-scaling-stroke"
            />

            {/* Away team win probability line */}
            <path
              d={winProbData.map((play, index) => {
                const x = 12 + (chartWidth * play.playNumber) / maxX;
                const y = 100 - ((1 - play.homeWinProbability) * 95);
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke={awayData.primaryColor}
              strokeWidth="0.6"
              strokeDasharray="1,0.5"
              vectorEffect="non-scaling-stroke"
            />
            
            {/* Interactive points with team logos */}
            {winProbData.map((play, index) => {
              const x = 12 + (chartWidth * play.playNumber) / maxX;
              const y = 100 - (play.homeWinProbability * 95);
              const isActive = selectedPlay?.playId === play.playId || hoveredPlay?.playId === play.playId;
              const isScoreChange = index > 0 && (play.homeScore !== winProbData[index - 1].homeScore || play.awayScore !== winProbData[index - 1].awayScore);
              
              return (
                <g key={play.playId}>
                  {/* Play point */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isActive ? "1.2" : isScoreChange ? "0.8" : "0.4"}
                    fill={isActive ? "#fbbf24" : (play.homeBall ? homeData.primaryColor : awayData.primaryColor)}
                    stroke={isActive ? "#f59e0b" : "rgba(255,255,255,0.8)"}
                    strokeWidth={isActive ? "0.3" : "0.1"}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => {
                      setSelectedPlay(play);
                      setSimulationPlay(play);
                    }}
                    onMouseEnter={() => setHoveredPlay(play)}
                    onMouseLeave={() => setHoveredPlay(null)}
                    vectorEffect="non-scaling-stroke"
                  />
                  
                  {/* Score change indicator */}
                  {isScoreChange && (
                    <g>
                      <line
                        x1={x}
                        y1="8"
                        x2={x}
                        y2="92"
                        stroke="#fbbf24"
                        strokeWidth="0.3"
                        strokeDasharray="1,0.5"
                        vectorEffect="non-scaling-stroke"
                        opacity="0.7"
                      />
                      <circle
                        cx={x}
                        cy="5"
                        r="0.8"
                        fill="#fbbf24"
                        stroke="#f59e0b"
                        strokeWidth="0.2"
                        vectorEffect="non-scaling-stroke"
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover tooltip */}
          {hoveredPlay && (
            <div className="absolute pointer-events-none bg-white border-2 rounded-lg shadow-xl p-4 z-20 transform -translate-x-1/2 -translate-y-full transition-all duration-200"
                 style={{ 
                   left: `${12 + (chartWidth * hoveredPlay.playNumber) / maxX}%`,
                   top: `${100 - (hoveredPlay.homeWinProbability * 95)}%`,
                   borderColor: hoveredPlay.homeBall ? homeData.primaryColor : awayData.primaryColor
                 }}>
              <div className="text-sm space-y-2">
                <div className="flex items-center justify-between space-x-4">
                  <span className="font-semibold text-gray-900">Play #{hoveredPlay.playNumber}</span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: hoveredPlay.homeBall ? homeData.primaryColor : awayData.primaryColor }}
                    ></div>
                    <span 
                      className="font-medium text-sm"
                      style={{ color: hoveredPlay.homeBall ? homeData.primaryColor : awayData.primaryColor }}
                    >
                      {hoveredPlay.homeBall ? homeData.name : awayData.name}
                    </span>
                  </div>
                </div>
                <hr className="border-gray-200" />
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Win%:</span>
                    <span className="font-medium">{Math.round(hoveredPlay.homeWinProbability * 100)}%-{Math.round((1 - hoveredPlay.homeWinProbability) * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Score:</span>
                    <span className="font-medium">{hoveredPlay.homeScore}-{hoveredPlay.awayScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Down:</span>
                    <span className="font-medium">{ordinalString(hoveredPlay.down)} & {hoveredPlay.distance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Period:</span>
                    <span className="font-medium">Q{hoveredPlay.period} {hoveredPlay.clock}</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-700 leading-relaxed">{hoveredPlay.playText.substring(0, 100)}...</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPlay(hoveredPlay);
                    setSimulationPlay(hoveredPlay);
                    setShowSimulationModal(true);
                  }}
                  className="w-full mt-2 px-3 py-1 text-xs font-medium text-white rounded transition-colors"
                  style={{ backgroundColor: hoveredPlay.homeBall ? homeData.primaryColor : awayData.primaryColor }}
                >
                  View on Field
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chart Legend */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div 
                  className="w-4 h-1 rounded"
                  style={{ backgroundColor: homeData.primaryColor }}
                ></div>
                <img src={homeData.logo} alt={homeData.name} className="w-4 h-4 object-contain" />
              </div>
              <span className="text-sm text-gray-600">{homeData.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div 
                  className="w-4 h-1 border-dashed border-t-2 rounded"
                  style={{ borderColor: awayData.primaryColor }}
                ></div>
                <img src={awayData.logo} alt={awayData.name} className="w-4 h-4 object-contain" />
              </div>
              <span className="text-sm text-gray-600">{awayData.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <span className="text-sm text-gray-600">Score Change</span>
            </div>
          </div>
          
          {/* Play Count */}
          <div className="text-sm text-gray-600">
            Total Plays: <span className="font-semibold text-gray-900">{winProbData.length}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500">Hover points for details • Click to view on field • Yellow points indicate scoring plays</p>
      </div>
    );
  };

  // Field Simulator Component
  const FieldSimulator = ({ play, isOpen, onClose }) => {
    if (!play || !isOpen) return null;

    // Calculate field position (0-100, where 0 is away endzone, 100 is home endzone)
    const fieldPosition = play.yardLine || 50;
    const ballPositionPercent = fieldPosition / 100;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-900">Field Simulation</h2>
                <span 
                  className="px-3 py-1 text-sm font-medium rounded-full"
                  style={{ 
                    color: play.homeBall ? homeData.primaryColor : awayData.primaryColor,
                    backgroundColor: play.homeBall ? `${homeData.primaryColor}20` : `${awayData.primaryColor}20`
                  }}
                >
                  Play #{play.playNumber}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Play Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Possession</p>
                  <div className="flex items-center space-x-2">
                    <img 
                      src={play.homeBall ? homeData.logo : awayData.logo} 
                      alt="Team logo" 
                      className="w-6 h-6 object-contain"
                    />
                    <span 
                      className="font-medium"
                      style={{ color: play.homeBall ? homeData.primaryColor : awayData.primaryColor }}
                    >
                      {play.homeBall ? homeData.name : awayData.name}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Down & Distance</p>
                  <p className="font-medium text-gray-900">{ordinalString(play.down)} & {play.distance}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Field Position</p>
                  <p className="font-medium text-gray-900">{formatYardLine(play.yardLine, play.homeBall)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Score</p>
                  <p className="font-medium text-gray-900">{play.homeScore} - {play.awayScore}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Play Description</p>
                <p className="text-sm text-gray-800 leading-relaxed">{play.playText}</p>
              </div>
            </div>

            {/* Interactive Field */}
            <div className="relative bg-gradient-to-r from-green-800 via-green-700 to-green-800 rounded-lg p-6 mb-6" style={{ minHeight: '300px' }}>
              {/* Field Background */}
              <div className="absolute inset-6 bg-gradient-to-r from-green-600 to-green-500 rounded opacity-90"></div>
              
              {/* Yard Lines */}
              <div className="absolute inset-6 flex justify-between items-center">
                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(yard => (
                  <div key={yard} className="relative h-full">
                    <div className={`w-0.5 h-full bg-white ${yard === 0 || yard === 100 ? 'bg-opacity-100' : yard === 50 ? 'bg-opacity-90' : 'bg-opacity-60'}`}></div>
                    {(yard === 20 || yard === 30 || yard === 40 || yard === 50 || yard === 60 || yard === 70 || yard === 80) && (
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm">
                        {yard === 50 ? '50' : yard < 50 ? yard : 100 - yard}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* End Zones */}
              <div className="absolute left-0 top-6 bottom-6 w-6 flex items-center justify-center rounded-l"
                   style={{ backgroundColor: `${awayData.primaryColor}80` }}>
                <img src={awayData.logo} alt={awayData.name} className="w-4 h-4 object-contain" />
              </div>
              <div className="absolute right-0 top-6 bottom-6 w-6 flex items-center justify-center rounded-r"
                   style={{ backgroundColor: `${homeData.primaryColor}80` }}>
                <img src={homeData.logo} alt={homeData.name} className="w-4 h-4 object-contain" />
              </div>

              {/* Ball Position Marker */}
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-10"
                style={{ left: `${6 + (ballPositionPercent * 88)}%` }}
              >
                <div className="relative">
                  {/* Ball */}
                  <div className="w-4 h-6 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full border-2 border-white shadow-lg"></div>
                  
                  {/* Team Logo Marker */}
                  <div 
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                    style={{ backgroundColor: play.homeBall ? homeData.primaryColor : awayData.primaryColor }}
                  >
                    <img 
                      src={play.homeBall ? homeData.logo : awayData.logo} 
                      alt="Possession" 
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  
                  {/* Yard Line Label */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold bg-black bg-opacity-50 px-2 py-1 rounded">
                    {formatYardLine(play.yardLine, play.homeBall)}
                  </div>
                </div>
              </div>

              {/* Down Markers */}
              <div className="absolute top-2 left-6 right-6 flex justify-between text-white text-xs font-medium">
                <span>{awayData.name} Goal</span>
                <span>50</span>
                <span>{homeData.name} Goal</span>
              </div>
            </div>

            {/* Win Probability Meter */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Win Probability at This Play</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 w-24">
                    <img src={homeData.logo} alt={homeData.name} className="w-5 h-5 object-contain" />
                    <span className="text-sm font-medium">{homeData.name}</span>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${play.homeWinProbability * 100}%`,
                        backgroundColor: homeData.primaryColor
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-12 text-right">
                    {Math.round(play.homeWinProbability * 100)}%
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 w-24">
                    <img src={awayData.logo} alt={awayData.name} className="w-5 h-5 object-contain" />
                    <span className="text-sm font-medium">{awayData.name}</span>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(1 - play.homeWinProbability) * 100}%`,
                        backgroundColor: awayData.primaryColor
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-12 text-right">
                    {Math.round((1 - play.homeWinProbability) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Play Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  const currentIndex = winProbData.findIndex(p => p.playId === play.playId);
                  if (currentIndex > 0) {
                    const prevPlay = winProbData[currentIndex - 1];
                    setSimulationPlay(prevPlay);
                    setSelectedPlay(prevPlay);
                  }
                }}
                disabled={winProbData.findIndex(p => p.playId === play.playId) === 0}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous Play
              </button>

              <div className="text-sm text-gray-500">
                Play {winProbData.findIndex(p => p.playId === play.playId) + 1} of {winProbData.length}
              </div>

              <button
                onClick={() => {
                  const currentIndex = winProbData.findIndex(p => p.playId === play.playId);
                  if (currentIndex < winProbData.length - 1) {
                    const nextPlay = winProbData[currentIndex + 1];
                    setSimulationPlay(nextPlay);
                    setSelectedPlay(nextPlay);
                  }
                }}
                disabled={winProbData.findIndex(p => p.playId === play.playId) === winProbData.length - 1}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next Play
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Play Details Component
  const PlayDetails = ({ play }) => {
    if (!play) return null;

    return (
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Play #{play.playNumber}</h3>
          <span 
            className="px-3 py-1 text-xs font-medium rounded-full"
            style={{ 
              color: play.homeBall ? homeData.primaryColor : awayData.primaryColor,
              backgroundColor: play.homeBall ? `${homeData.primaryColor}20` : `${awayData.primaryColor}20`
            }}
          >
            {play.homeBall ? homeData.name : awayData.name}
          </span>
        </div>

        <p className="text-gray-800 mb-4 leading-relaxed">{play.playText}</p>

        {/* Play Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Down & Distance</p>
            <p className="text-sm font-medium text-gray-900">
              {ordinalString(play.down)} & {play.distance}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Field Position</p>
            <p className="text-sm font-medium text-gray-900">
              {formatYardLine(play.yardLine, play.homeBall)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Score</p>
            <p className="text-sm font-medium text-gray-900">
              {play.homeScore} - {play.awayScore}
            </p>
          </div>
        </div>

        {/* Win Probability Bars */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-600 w-12">{homeData.name}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${play.homeWinProbability * 100}%`,
                  backgroundColor: homeData.primaryColor
                }}
              ></div>
            </div>
            <span className="text-xs font-medium text-gray-900 w-10 text-right">
              {Math.round(play.homeWinProbability * 100)}%
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-600 w-12">{awayData.name}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(1 - play.homeWinProbability) * 100}%`,
                  backgroundColor: awayData.primaryColor
                }}
              ></div>
            </div>
            <span className="text-xs font-medium text-gray-900 w-10 text-right">
              {Math.round((1 - play.homeWinProbability) * 100)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Game Statistics Component
  const GameStatistics = () => {
    if (winProbData.length === 0) return null;

    // Calculate statistics from the data
    const homeStats = {
      totalPlays: winProbData.filter(play => play.homeBall).length,
      drives: drives ? drives.filter(drive => drive.isHomeOffense).length : 0,
      avgWinProb: winProbData.filter(play => play.homeBall).reduce((sum, play) => sum + play.homeWinProbability, 0) / winProbData.filter(play => play.homeBall).length || 0
    };

    const awayStats = {
      totalPlays: winProbData.filter(play => !play.homeBall).length,
      drives: drives ? drives.filter(drive => !drive.isHomeOffense).length : 0,
      avgWinProb: winProbData.filter(play => !play.homeBall).reduce((sum, play) => sum + (1 - play.homeWinProbability), 0) / winProbData.filter(play => !play.homeBall).length || 0
    };

    const totalScoreChanges = winProbData.filter((play, index) => {
      if (index === 0) return false;
      const prevPlay = winProbData[index - 1];
      return play.homeScore !== prevPlay.homeScore || play.awayScore !== prevPlay.awayScore;
    }).length;

    return (
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Game Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Home Team Stats */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={homeData.logo}
                alt={`${homeData.name} logo`}
                className="w-8 h-8 object-contain"
                onError={(e) => { e.target.src = '/photos/Whitmer.png'; }}
              />
              <h4 className="font-semibold text-gray-900">{homeData.name}</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Plays</span>
                <span className="font-semibold text-gray-900">{homeStats.totalPlays}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Drives</span>
                <span className="font-semibold text-gray-900">{homeStats.drives}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Win %</span>
                <span className="font-semibold text-gray-900">{Math.round(homeStats.avgWinProb * 100)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Final Score</span>
                <span className="font-semibold text-gray-900">{game.homePoints || 0}</span>
              </div>
            </div>
          </div>

          {/* Game Overview */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-4">Game Overview</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Plays</span>
                <span className="font-semibold text-gray-900">{winProbData.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Drives</span>
                <span className="font-semibold text-gray-900">{drives ? drives.length : 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Score Changes</span>
                <span className="font-semibold text-gray-900">{totalScoreChanges}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Game Status</span>
                <span className={`font-semibold ${game.completed ? 'text-gray-900' : 'text-red-600'}`}>
                  {game.completed ? 'Final' : 'Live'}
                </span>
              </div>
            </div>
          </div>

          {/* Away Team Stats */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={awayData.logo}
                alt={`${awayData.name} logo`}
                className="w-8 h-8 object-contain"
                onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
              />
              <h4 className="font-semibold text-gray-900">{awayData.name}</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Plays</span>
                <span className="font-semibold text-gray-900">{awayStats.totalPlays}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Drives</span>
                <span className="font-semibold text-gray-900">{awayStats.drives}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Win %</span>
                <span className="font-semibold text-gray-900">{Math.round(awayStats.avgWinProb * 100)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Final Score</span>
                <span className="font-semibold text-gray-900">{game.awayPoints || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Play Distribution Chart */}
        <div className="mt-6 bg-white rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-3">Play Distribution</h5>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{homeData.name}</span>
                <span>{homeStats.totalPlays} plays</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(homeStats.totalPlays / winProbData.length) * 100}%`,
                    backgroundColor: homeData.primaryColor
                  }}
                ></div>
              </div>
            </div>
            <div className="text-xs text-gray-500">vs</div>
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{awayData.name}</span>
                <span>{awayStats.totalPlays} plays</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(awayStats.totalPlays / winProbData.length) * 100}%`,
                    backgroundColor: awayData.primaryColor
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto p-4 space-y-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
        {/* Header with team scores */}
        <GameHeader />

        {/* Football Field */}
        <div className="space-y-3">
          <FootballField homeTeam={homeTeam} awayTeam={awayTeam} />
          
          {/* Live game indicator */}
          <LiveBallIndicator />
          
          {/* Game Simulation Button */}
          <button
            onClick={() => {
              if (winProbData.length > 0) {
                setSimulationPlay(selectedPlay || winProbData[winProbData.length - 1]);
                setShowSimulationModal(true);
              }
            }}
            disabled={loading || winProbData.length === 0}
            className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-semibold text-white transition-all ${
              loading || winProbData.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 via-red-700 to-red-600 hover:from-red-700 hover:via-red-800 hover:to-red-700 shadow-lg hover:shadow-xl'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span>View Game Simulation</span>
          </button>
        </div>

        {/* Win Probability Chart */}
        {!loading && winProbData.length > 0 && <WinProbabilityChart />}

        {/* Game Statistics */}
        {!loading && winProbData.length > 0 && <GameStatistics />}

        {/* Selected Play Details */}
        {selectedPlay && <PlayDetails play={selectedPlay} />}

        {/* Loading/Error States */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
              <span className="text-gray-600">Loading game data...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-800">Error</h4>
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Debug Section */}
      <div className="p-8 bg-gray-100 mt-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Play-by-Play Debug</h2>
          
          {/* Game Info */}
          <div className="mb-4 p-4 bg-white rounded shadow">
            <h3 className="font-bold mb-2">Game Information:</h3>
            <pre className="text-sm overflow-auto bg-gray-50 p-2 rounded">
              {JSON.stringify(game, null, 2)}
            </pre>
          </div>

          {/* Load Button */}
          <div className="mb-4">
            <button
              onClick={loadPlayByPlayData}
              disabled={loading}
              className={`px-6 py-3 rounded font-bold text-white transition-colors ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }`}
            >
              {loading ? 'Loading...' : 'Load Play-by-Play Data'}
            </button>
          </div>

          {/* Win Prob Data Display */}
          {winProbData.length > 0 && (
            <div className="mb-4 p-4 bg-white rounded shadow">
              <h3 className="font-bold mb-2">Win Probability Data ({winProbData.length} plays):</h3>
              <pre className="text-sm overflow-auto bg-gray-50 p-2 rounded max-h-96">
                {JSON.stringify(winProbData.slice(0, 5), null, 2)}
                {winProbData.length > 5 && "\n... and more"}
              </pre>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <h3 className="font-bold mb-2">Error:</h3>
              <pre className="whitespace-pre-wrap">{error}</pre>
            </div>
          )}

          {/* Plays Display */}
          {plays && (
            <div className="mb-4 p-4 bg-white rounded shadow">
              <h3 className="font-bold mb-2">Plays Data ({plays.length || 0} plays):</h3>
              <pre className="text-sm overflow-auto bg-gray-50 p-2 rounded max-h-96">
                {JSON.stringify(plays, null, 2)}
              </pre>
            </div>
          )}

          {/* Drives Display */}
          {drives && (
            <div className="mb-4 p-4 bg-white rounded shadow">
              <h3 className="font-bold mb-2">Drives Data ({drives.length || 0} drives):</h3>
              <pre className="text-sm overflow-auto bg-gray-50 p-2 rounded max-h-96">
                {JSON.stringify(drives, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Field Simulator Modal */}
      <FieldSimulator 
        play={simulationPlay} 
        isOpen={showSimulationModal} 
        onClose={() => setShowSimulationModal(false)} 
      />
    </div>
  );
};

export default GamePlayByPlay;