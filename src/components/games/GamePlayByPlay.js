import React, { useEffect, useState } from 'react';
import { playService } from '../../services/playService';
import { driveService } from '../../services/driveService';
import FootballField from './FootballField';
import WinProbabilityChart from './WinProbabilityChart';

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
  const [showAllPlays, setShowAllPlays] = useState(false);
  const [playFilter, setPlayFilter] = useState('all'); // 'all', 'home', 'away', 'scoring'

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

  // Convert plays or drives data to win probability data
  const processWinProbabilityData = () => {
    console.log('Processing data - Plays:', plays, 'Drives:', drives);
    
    // First try to use plays data directly (includes flattened plays from drives)
    if (plays && plays.length > 0) {
      console.log('Using plays data:', plays.length, 'plays');
      return plays.map((play, index) => {
        // Calculate mock win probability based on score differential and field position
        const scoreDiff = (play.homeScore || 0) - (play.awayScore || 0);
        const fieldPosition = play.yardsToGoal || 50;
        
        // Basic win probability calculation
        let baseWinProb = 0.5;
        baseWinProb += (scoreDiff * 0.05); // Adjust for score
        baseWinProb += ((50 - fieldPosition) * 0.002); // Adjust for field position
        baseWinProb = Math.max(0.05, Math.min(0.95, baseWinProb));
        
        return {
          playId: play.id || index,
          playNumber: index + 1,
          homeWinProbability: baseWinProb,
          homeScore: play.homeScore || 0,
          awayScore: play.awayScore || 0,
          down: play.down || 1,
          distance: play.distance || 10,
          yardLine: play.yardsToGoal || 50,
          homeBall: play.offense === homeData.name || play.teamId === (homeTeam?.id || game.homeId),
          playText: play.playText || play.text || 'Play description not available',
          period: play.period || play.quarter || 1,
          clock: play.clock || '15:00'
        };
      });
    }
    
    // Fall back to extracting plays from drives data if plays is not available
    if (drives && drives.length > 0) {
      console.log('Extracting plays from drives data:', drives.length, 'drives');
      let playNumber = 1;
      const winProbDataTemp = [];
      
      drives.forEach(drive => {
        if (drive.plays && drive.plays.length > 0) {
          drive.plays.forEach(play => {
            // Calculate mock win probability based on score differential and field position
            const scoreDiff = (play.homeScore || 0) - (play.awayScore || 0);
            const fieldPosition = play.yardsToGoal || 50;
            
            // Basic win probability calculation
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
      
      console.log('Extracted', winProbDataTemp.length, 'plays from drives');
      return winProbDataTemp;
    }
    
    console.log('No data available for processing');
    return [];
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

  // Debug function to load plays and drives - Updated to match Swift logic
  const loadPlayByPlayData = async () => {
    if (!game) {
      setError('No game data provided');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading play-by-play data for game:', game);
      console.log('🏈 Game structure:', {
        id: game.id,
        homeId: game.home_id || game.homeId,
        awayId: game.away_id || game.awayId,
        season: game.season,
        week: game.week,
        season_type: game.season_type
      });
      
      // Primary method: Try to get win probability data directly (like Swift does)
      if (game.id) {
        try {
          console.log('Attempting to load win probability data with game ID:', game.id);
          // This matches your Swift TeamService.shared.fetchWinProbability(gameId: game.id)
          const winProbData = await playService.getWinProbability(game.id);
          console.log('Win probability data loaded:', winProbData);
          
          if (winProbData && winProbData.length > 0) {
            // Process the win probability data directly
            const processedData = winProbData.map((play, index) => ({
              playId: play.id || play.playId || index,
              playNumber: play.playNumber || index + 1,
              homeWinProbability: play.homeWinProbability || play.winProbability || 0.5,
              homeScore: play.homeScore || 0,
              awayScore: play.awayScore || 0,
              down: play.down || 1,
              distance: play.distance || 10,
              yardLine: play.yardLine || play.yardsToGoal || 50,
              homeBall: play.homeBall || false,
              playText: play.playText || play.text || 'Play description not available',
              period: play.period || play.quarter || 1,
              clock: play.clock || '15:00'
            }));
            
            setWinProbData(processedData);
            if (processedData.length > 0) {
              setSelectedPlay(processedData[processedData.length - 1]);
            }
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Win probability API failed:', err);
        }
      }
      
      // Fallback methods for when win probability API is not available
      const results = {
        plays: null,
        drives: null,
        errors: []
      };

      // Method 1: Try with game ID if available
      if (game.id) {
        try {
          console.log('Attempting to load live plays with game ID:', game.id);
          const liveData = await playService.getLivePlays(game.id);
          console.log('Live data structure:', liveData);
          
          // Check if we got drives data (which contains nested plays)
          if (liveData && liveData.drives && Array.isArray(liveData.drives)) {
            console.log('Found drives data, extracting plays from', liveData.drives.length, 'drives');
            
            // Flatten all plays from all drives
            const allPlays = [];
            liveData.drives.forEach(drive => {
              if (drive.plays && Array.isArray(drive.plays)) {
                allPlays.push(...drive.plays);
              }
            });
            
            console.log('Extracted', allPlays.length, 'plays from drives');
            results.plays = allPlays;
            results.drives = liveData.drives;
          } else if (liveData && Array.isArray(liveData)) {
            // If it's already a flat array of plays
            results.plays = liveData;
            console.log('Live plays loaded (flat array):', liveData.length, 'plays');
          } else {
            console.log('Live data format not recognized:', liveData);
          }
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
      
      // Process fallback data
      const winProbDataProcessed = processWinProbabilityData();
      console.log('Processed win prob data from fallback:', winProbDataProcessed.length, 'plays');
      setWinProbData(winProbDataProcessed);
      if (winProbDataProcessed.length > 0) {
        setSelectedPlay(winProbDataProcessed[winProbDataProcessed.length - 1]);
      }
      
      if (results.errors.length > 0 && !results.plays && !results.drives && winProbDataProcessed.length === 0) {
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
    console.log('🎯 GamePlayByPlay component mounted with props:', {
      game: game,
      awayTeam: awayTeam,
      homeTeam: homeTeam
    });
    
    // For testing: Always create mock data to demonstrate the functionality
    const createMockData = () => {
      console.log('🏈 Creating mock data for testing');
      
      // Create mock data based on the API structure we fetched
      const mockPlays = [
        {
          id: "401643696101849903",
          homeScore: 0,
          awayScore: 0,
          period: 1,
          clock: "15:00",
          teamId: 2567,
          team: "SMU",
          down: 0,
          distance: 0,
          yardsToGoal: 65,
          yardsGained: 0,
          playType: "Kickoff",
          playText: "Collin Rogers kickoff for 65 yds for a touchback"
        },
        {
          id: "401643696101849905",
          homeScore: 0,
          awayScore: 0,
          period: 1,
          clock: "14:45",
          teamId: 2440,
          team: "Nevada",
          down: 1,
          distance: 10,
          yardsToGoal: 75,
          yardsGained: -4,
          playType: "Fumble Recovery (Own)",
          playText: "Kitan Crawford run for a loss of 4 yards to the NEV 26 Kitan Crawford fumbled, recovered by NEV return for 5 yds"
        },
        {
          id: "401643696101849906",
          homeScore: 0,
          awayScore: 0,
          period: 1,
          clock: "14:20",
          teamId: 2440,
          team: "Nevada",
          down: 2,
          distance: 9,
          yardsToGoal: 74,
          yardsGained: 4,
          playType: "Rush",
          playText: "Brendon Lewis run for 4 yds to the NEV 30"
        },
        {
          id: "401643696101849907",
          homeScore: 0,
          awayScore: 0,
          period: 1,
          clock: "13:55",
          teamId: 2440,
          team: "Nevada",
          down: 3,
          distance: 5,
          yardsToGoal: 70,
          yardsGained: 0,
          playType: "Pass Incompletion",
          playText: "Brendon Lewis incomplete pass to Marcus Grant"
        },
        {
          id: "401643696101849908",
          homeScore: 0,
          awayScore: 0,
          period: 1,
          clock: "13:30",
          teamId: 2440,
          team: "Nevada",
          down: 4,
          distance: 5,
          yardsToGoal: 70,
          yardsGained: 35,
          playType: "Punt",
          playText: "Matt Ray punt for 35 yds"
        },
        {
          id: "401643696101849909",
          homeScore: 0,
          awayScore: 7,
          period: 1,
          clock: "10:30",
          teamId: 2567,
          team: "SMU",
          down: 1,
          distance: 10,
          yardsToGoal: 25,
          yardsGained: 25,
          playType: "Pass Reception",
          playText: "Kevin Jennings 25 yard touchdown pass to Jordan Hudson. Collin Rogers extra point good."
        }
      ];
      
      console.log('🔧 Mock data created:', mockPlays.length, 'plays');
      setPlays(mockPlays);
      
      // Process the mock data directly
      const winProbDataProcessed = mockPlays.map((play, index) => {
        // Calculate mock win probability based on score differential and field position
        const scoreDiff = (play.homeScore || 0) - (play.awayScore || 0);
        const fieldPosition = play.yardsToGoal || 50;
        
        // Basic win probability calculation
        let baseWinProb = 0.5;
        baseWinProb += (scoreDiff * 0.05); // Adjust for score
        baseWinProb += ((50 - fieldPosition) * 0.002); // Adjust for field position
        baseWinProb = Math.max(0.05, Math.min(0.95, baseWinProb));
        
        return {
          playId: play.id || index,
          playNumber: index + 1,
          homeWinProbability: baseWinProb,
          homeScore: play.homeScore || 0,
          awayScore: play.awayScore || 0,
          down: play.down || 1,
          distance: play.distance || 10,
          yardLine: play.yardsToGoal || 50,
          homeBall: play.teamId === 2440, // Nevada is home
          playText: play.playText || 'Play description not available',
          period: play.period || 1,
          clock: play.clock || '15:00'
        };
      });
      
      console.log('🎮 Processed win prob data from mock:', winProbDataProcessed.length, 'plays');
      setWinProbData(winProbDataProcessed);
      if (winProbDataProcessed.length > 0) {
        setSelectedPlay(winProbDataProcessed[winProbDataProcessed.length - 1]);
      }
      setLoading(false);
    };
    
    // If no game data or if this is the Nevada vs SMU game, use mock data
    if (!game || game.id === 401643696) {
      createMockData();
      return;
    }
    
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

  // WinProbabilityChart component is now imported from ./WinProbabilityChart.js

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

  // All Plays List Component (mirroring Swift functionality)
  const AllPlaysList = () => {
    if (winProbData.length === 0) return null;

    const filteredPlays = winProbData.filter(play => {
      if (playFilter === 'home') return play.homeBall;
      if (playFilter === 'away') return !play.homeBall;
      if (playFilter === 'scoring') {
        const index = winProbData.indexOf(play);
        if (index === 0) return false;
        const prevPlay = winProbData[index - 1];
        return play.homeScore !== prevPlay.homeScore || play.awayScore !== prevPlay.awayScore;
      }
      return true;
    });

    return (
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">All Plays</h3>
          <div className="flex items-center space-x-4">
            {/* Filter Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setPlayFilter('all')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  playFilter === 'all' 
                    ? 'bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All ({winProbData.length})
              </button>
              <button
                onClick={() => setPlayFilter('home')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  playFilter === 'home' 
                    ? 'text-white' 
                    : 'text-gray-700 hover:bg-gray-300'
                }`}
                style={{ 
                  backgroundColor: playFilter === 'home' ? homeData.primaryColor : '#e5e7eb'
                }}
              >
                {homeData.name} ({winProbData.filter(p => p.homeBall).length})
              </button>
              <button
                onClick={() => setPlayFilter('away')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  playFilter === 'away' 
                    ? 'text-white' 
                    : 'text-gray-700 hover:bg-gray-300'
                }`}
                style={{ 
                  backgroundColor: playFilter === 'away' ? awayData.primaryColor : '#e5e7eb'
                }}
              >
                {awayData.name} ({winProbData.filter(p => !p.homeBall).length})
              </button>
              <button
                onClick={() => setPlayFilter('scoring')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  playFilter === 'scoring' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Scoring ({winProbData.filter((play, index) => {
                  if (index === 0) return false;
                  const prevPlay = winProbData[index - 1];
                  return play.homeScore !== prevPlay.homeScore || play.awayScore !== prevPlay.awayScore;
                }).length})
              </button>
            </div>
            
            <button
              onClick={() => setShowAllPlays(!showAllPlays)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:via-red-800 hover:to-red-700 transition-all"
            >
              <span>{showAllPlays ? 'Show Less' : 'Show All Plays'}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showAllPlays ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">{filteredPlays.length}</div>
            <div className="text-xs text-gray-600">Filtered Plays</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(filteredPlays.reduce((sum, play) => sum + play.homeWinProbability, 0) / filteredPlays.length * 100) || 0}%
            </div>
            <div className="text-xs text-gray-600">Avg {homeData.name} Win %</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {filteredPlays.length > 0 ? `${filteredPlays[filteredPlays.length - 1].homeScore} - ${filteredPlays[filteredPlays.length - 1].awayScore}` : '0 - 0'}
            </div>
            <div className="text-xs text-gray-600">Current Score</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">
              Q{filteredPlays.length > 0 ? filteredPlays[filteredPlays.length - 1].period : 1}
            </div>
            <div className="text-xs text-gray-600">Quarter</div>
          </div>
        </div>

        {/* Plays List */}
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {(showAllPlays ? filteredPlays : filteredPlays.slice(0, 10)).map((play, index) => {
              const isScoreChange = index > 0 && filteredPlays[index - 1] && 
                (play.homeScore !== filteredPlays[index - 1].homeScore || play.awayScore !== filteredPlays[index - 1].awayScore);
              
              return (
                <div 
                  key={play.playId}
                  className={`border-b border-gray-100 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedPlay?.playId === play.playId ? 'bg-red-50 border-red-200' : ''
                  } ${isScoreChange ? 'bg-yellow-50' : ''}`}
                  onClick={() => setSelectedPlay(play)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold text-gray-900">#{play.playNumber}</span>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: play.homeBall ? homeData.primaryColor : awayData.primaryColor }}
                        ></div>
                        <span 
                          className="text-xs font-medium"
                          style={{ color: play.homeBall ? homeData.primaryColor : awayData.primaryColor }}
                        >
                          {play.homeBall ? homeData.name : awayData.name}
                        </span>
                      </div>
                      {isScoreChange && (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-200 text-yellow-800 rounded-full">
                          SCORE
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {play.homeScore} - {play.awayScore}
                      </div>
                      <div className="text-xs text-gray-500">
                        Win%: {Math.round(play.homeWinProbability * 100)}% - {Math.round((1 - play.homeWinProbability) * 100)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-800 mb-2 leading-relaxed">
                    {play.playText}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {ordinalString(play.down)} & {play.distance} at {formatYardLine(play.yardLine, play.homeBall)}
                    </span>
                    <span>Q{play.period} {play.clock}</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {!showAllPlays && filteredPlays.length > 10 && (
            <div className="p-4 bg-gray-50 text-center">
              <span className="text-sm text-gray-600">
                Showing 10 of {filteredPlays.length} plays
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="w-full space-y-8" style={{ fontFamily: 'Orbitron, sans-serif' }}>
        {/* Header with team scores */}
        <div className="px-4">
          <GameHeader />
        </div>

        {/* Football Field */}
        <div className="px-4 space-y-3">
          <FootballField homeTeam={homeTeam} awayTeam={awayTeam} />
          
          {/* Live game indicator */}
          <LiveBallIndicator />
          
          {/* Game Simulation Button */}
          <button
            onClick={() => setShowSimulationModal(true)}
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

        {/* Win Probability Chart - NO PADDING to allow full width */}
        <WinProbabilityChart 
          winProbData={winProbData}
          homeData={homeData}
          awayData={awayData}
          selectedPlay={selectedPlay}
          setSelectedPlay={setSelectedPlay}
          setSimulationPlay={setSimulationPlay}
          setShowSimulationModal={setShowSimulationModal}
        />

        {/* Selected Play Details */}
        <div className="px-4">
          {selectedPlay && <PlayDetails play={selectedPlay} />}
        </div>

        {/* Game Statistics */}
        <div className="px-4">
          {winProbData.length > 0 && <GameStatistics />}
        </div>

        {/* All Plays List */}
        <div className="px-4">
          {winProbData.length > 0 && <AllPlaysList />}
        </div>

        {/* Loading/Error States */}
        <div className="px-4">

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

        {/* Debug Information */}
        <div className="bg-gray-100 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded">
              <h4 className="font-semibold mb-2">Data Status</h4>
              <p>Win Prob Data: <span className="font-mono">{winProbData.length} items</span></p>
              <p>Plays (fallback): <span className="font-mono">{plays ? `${plays.length} items` : 'null'}</span></p>
              <p>Drives (fallback): <span className="font-mono">{drives ? `${drives.length} items` : 'null'}</span></p>
              <p>Loading: <span className="font-mono">{loading ? 'Yes' : 'No'}</span></p>
              <p>Selected Play: <span className="font-mono">{selectedPlay ? `#${selectedPlay.playNumber}` : 'None'}</span></p>
            </div>
            <div className="bg-white p-3 rounded">
              <h4 className="font-semibold mb-2">Game Info</h4>
              <p>ID: <span className="font-mono">{game?.id || 'N/A'}</span></p>
              <p>Season: <span className="font-mono">{game?.season || 'N/A'}</span></p>
              <p>Week: <span className="font-mono">{game?.week || 'N/A'}</span></p>
              <p>Home: <span className="font-mono">{homeData.name}</span></p>
              <p>Away: <span className="font-mono">{awayData.name}</span></p>
              <p>Score: <span className="font-mono">{game?.homePoints || 0} - {game?.awayPoints || 0}</span></p>
            </div>
            <div className="bg-white p-3 rounded">
              <h4 className="font-semibold mb-2">Win Probability Sample</h4>
              {winProbData.length > 0 ? (
                <div className="space-y-1">
                  <p>Play #{winProbData[0].playNumber}</p>
                  <p>Win%: {Math.round(winProbData[0].homeWinProbability * 100)}%</p>
                  <p>Score: {winProbData[0].homeScore}-{winProbData[0].awayScore}</p>
                  <p>Down: {winProbData[0].down} & {winProbData[0].distance}</p>
                  <p className="text-xs text-gray-600 mt-2">
                    {winProbData[0].playText.substring(0, 50)}...
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No processed data</p>
              )}
            </div>
          </div>
          <button
            onClick={loadPlayByPlayData}
            disabled={loading}
            className={`mt-4 px-4 py-2 rounded font-medium text-white transition-all ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-600 via-red-700 to-red-600 hover:from-red-700 hover:via-red-800 hover:to-red-700'
            }`}
          >
            {loading ? 'Loading...' : 'Reload Data'}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default GamePlayByPlay;