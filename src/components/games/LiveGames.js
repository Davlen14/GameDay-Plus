import React, { useState, useEffect } from 'react';
import { gameService } from '../../services';
import { playService } from '../../services/playService';
import { getLiveGameData } from '../../services/graphqlService';

const LiveGames = () => {
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);

  useEffect(() => {
    const fetchLiveGame = async () => {
      const timestamp = new Date().toLocaleTimeString();
      
      try {
        setLoading(true);
        
        // Add debug info
        setDebugInfo(prev => [...prev, `${timestamp}: Starting live game data fetch using EXACT Schedule.js method...`]);
        
        // Use the EXACT same method as Schedule.js for live data fetching
  const gameId = 401756847; // Fresno State vs Kansas
        
        // Step 1: Get general scoreboard data (like Schedule.js does)
        let scoreboardData = [];
        let liveGamesData = new Map();
        let processedGameData = null; // DECLARE VARIABLE AT THE TOP
        
        try {
          // Get general scoreboard
          scoreboardData = await gameService.getScoreboard('fbs');
          setDebugInfo(prev => [...prev, `${timestamp}: Scoreboard data fetched: ${scoreboardData?.length || 0} games`]);
          console.log('Scoreboard data fetched:', scoreboardData);

          // PRIORITIZE SCOREBOARD DATA - it's more reliable than GraphQL for live scores
          const scoreboardGame = scoreboardData.find(sb => {
            if (sb.id === gameId) return true;
            const home = typeof sb.homeTeam === 'string' ? sb.homeTeam.toLowerCase() : '';
            const away = typeof sb.awayTeam === 'string' ? sb.awayTeam.toLowerCase() : '';
            // For Fresno State vs Kansas
            if (home.includes("kansas") && away.includes("fresno state")) return true;
            // For Iowa State vs Kansas State (if you switch back)
            if (home.includes("kansas state") && away.includes("iowa state")) return true;
            return false;
          });

          if (scoreboardGame) {
            setDebugInfo(prev => [...prev, `${timestamp}: ✅ Found live game in scoreboard data - using as PRIMARY source`]);
            console.log('🔴 USING SCOREBOARD AS PRIMARY SOURCE:', scoreboardGame);
            
            // Process scoreboard data first
            processedGameData = {
              ...scoreboardGame,
              id: gameId,
              homeTeam: scoreboardGame.homeTeam || "Kansas State Wildcats",
              awayTeam: scoreboardGame.awayTeam || "Iowa State Cyclones",
              home_points: scoreboardGame.home_points ?? scoreboardGame.homePoints,
              away_points: scoreboardGame.away_points ?? scoreboardGame.awayPoints,
              homePoints: scoreboardGame.homePoints ?? scoreboardGame.home_points,
              awayPoints: scoreboardGame.awayPoints ?? scoreboardGame.away_points,
              // Try to get line scores from scoreboard
              homeLineScores: scoreboardGame.homeLineScores || [],
              awayLineScores: scoreboardGame.awayLineScores || [],
              status: scoreboardGame.status || "live",
              period: scoreboardGame.period || scoreboardGame.currentPeriod || 1,
              clock: scoreboardGame.clock || scoreboardGame.currentClock || "15:00",
              currentPeriod: scoreboardGame.currentPeriod || scoreboardGame.period,
              currentClock: scoreboardGame.currentClock || scoreboardGame.clock,
              completed: scoreboardGame.completed !== undefined ? scoreboardGame.completed : false,
              season: 2024,
              week: 1,
              season_type: 'regular',
              isLiveGame: true
            };

            setDebugInfo(prev => [...prev, `${timestamp}: 🏈 SCOREBOARD SCORES: Away ${processedGameData.awayPoints} - Home ${processedGameData.homePoints}`]);
          }

          // Step 2: ONLY if scoreboard doesn't have the game, try detailed live data sources
          if (!processedGameData) {
            setDebugInfo(prev => [...prev, `${timestamp}: Game not found in scoreboard, trying detailed live data fetch...`]);
          
            console.log(`🔴 ATTEMPTING to fetch live data for game ${gameId}: Iowa State @ Kansas State`);
            
            const [livePlays, liveGameData] = await Promise.all([
              playService.getLivePlays(gameId).catch((err) => {
                console.log(`❌ getLivePlays failed for game ${gameId}:`, err.message);
                setDebugInfo(prev => [...prev, `${timestamp}: getLivePlays failed: ${err.message}`]);
                return null;
              }),
              getLiveGameData(gameId).catch((err) => {
                console.log(`❌ getLiveGameData failed for game ${gameId}:`, err.message);
                setDebugInfo(prev => [...prev, `${timestamp}: getLiveGameData failed: ${err.message}`]);
                return null;
              })
            ]);

            if (livePlays || liveGameData) {
              liveGamesData.set(gameId, { livePlays, liveGameData });
              setDebugInfo(prev => [...prev, `${timestamp}: ✅ Live data retrieved successfully`]);
              console.log(`🔴 LIVE DATA STRUCTURE for game ${gameId}:`, {
                gameTeams: `Iowa State @ Kansas State`,
                livePlays: livePlays,
                liveGameData: liveGameData,
                livePlaysKeys: livePlays ? Object.keys(livePlays) : null,
                liveGameDataKeys: liveGameData ? Object.keys(liveGameData) : null,
                // DEBUG LINE SCORES SPECIFICALLY
                liveGameDataHomeLineScores: liveGameData?.homeLineScores,
                liveGameDataAwayLineScores: liveGameData?.awayLineScores
              });

              // Process live data using Schedule.js logic
              const liveData = liveGamesData.get(gameId);
              if (liveData) {
                const { livePlays, liveGameData } = liveData;
                setDebugInfo(prev => [...prev, `${timestamp}: 🔴 PROCESSING LIVE DATA using Schedule.js logic`]);
                console.log('🔴 PROCESSING LIVE DATA for game:', 'Iowa State vs Kansas State', 'Game ID:', gameId);
                console.log('🔴 Raw livePlays:', livePlays);
                console.log('🔴 Raw liveGameData:', liveGameData);
                
                // Simple score extraction using the EXACT GraphQL field names (Schedule.js logic)
                let homeScore = null;
                let awayScore = null;

                // GraphQL returns: homePoints, awayPoints, currentPeriod, currentClock
                if (liveGameData) {
                  homeScore = liveGameData.homePoints;
                  awayScore = liveGameData.awayPoints;
                  console.log('🔴 EXTRACTING SCORES FROM liveGameData:', {
                    homePoints: liveGameData.homePoints,
                    awayPoints: liveGameData.awayPoints,
                    homeScore,
                    awayScore,
                    rawLiveGameData: liveGameData
                  });
                }

                // Fallback to livePlays if needed
                if ((homeScore === null || homeScore === undefined) && livePlays) {
                  homeScore = livePlays.homeScore;
                }
                if ((awayScore === null || awayScore === undefined) && livePlays) {
                  awayScore = livePlays.awayScore;
                }

                // Ensure we have numbers, not null/undefined
                homeScore = homeScore !== null && homeScore !== undefined ? homeScore : 0;
                awayScore = awayScore !== null && awayScore !== undefined ? awayScore : 0;

                console.log('🔴 FINAL SCORES EXTRACTED:', { 
                  homeScore, 
                  awayScore, 
                  willShowScores: homeScore !== null && awayScore !== null,
                  liveGameDataHomePoints: liveGameData?.homePoints,
                  liveGameDataAwayPoints: liveGameData?.awayPoints
                });

                setDebugInfo(prev => [...prev, `${timestamp}: 🏈 SCORES: Away ${awayScore} - Home ${homeScore}`]);
                setDebugInfo(prev => [...prev, `${timestamp}: 📊 LINE SCORES: Away [${liveGameData?.awayLineScores?.join(',')}] Home [${liveGameData?.homeLineScores?.join(',')}]`]);
                
                // Build processed data using EXACT Schedule.js field mapping
                processedGameData = {
                  id: gameId,
                  homeTeam: liveGameData?.homeTeam || "Kansas State Wildcats",
                  awayTeam: liveGameData?.awayTeam || "Iowa State Cyclones", 
                  home_points: homeScore,
                  away_points: awayScore,
                  homePoints: homeScore, // Also keep GraphQL field names
                  awayPoints: awayScore,
                  // ADD LINE SCORES for quarter-by-quarter display - with fallback logic
                  homeLineScores: liveGameData?.homeLineScores || [],
                  awayLineScores: liveGameData?.awayLineScores || [],
                  status: liveGameData?.status ?? livePlays?.status ?? "live",
                  period: liveGameData?.currentPeriod ?? liveGameData?.period ?? livePlays?.period ?? 1,
                  clock: liveGameData?.currentClock ?? liveGameData?.clock ?? livePlays?.clock ?? "15:00",
                  currentPeriod: liveGameData?.currentPeriod,
                  currentClock: liveGameData?.currentClock,
                  currentPossession: liveGameData?.currentPossession ?? livePlays?.possession,
                  completed: false, // Force live games to not be completed
                  season: 2024,
                  week: 1,
                  season_type: 'regular',
                  isLiveGame: true
                };

                // DEBUG: Log what line scores we actually got
                console.log('🔴 PROCESSED GAME DATA LINE SCORES:', {
                  homeLineScores: processedGameData.homeLineScores,
                  awayLineScores: processedGameData.awayLineScores,
                  homeLineScoresLength: processedGameData.homeLineScores?.length,
                  awayLineScoresLength: processedGameData.awayLineScores?.length
                });
                
                setDebugInfo(prev => [...prev, `${timestamp}: ✅ Using REAL live game data from Schedule.js method`]);
              }
            } else {
              setDebugInfo(prev => [...prev, `${timestamp}: ⚠️ NO live data returned for game ${gameId}`]);
              console.log(`⚠️ NO live data returned for game ${gameId}, will try scoreboard fallback`);
            }
          }
        } catch (error) {
          setDebugInfo(prev => [...prev, `${timestamp}: Error fetching live data: ${error.message}`]);
          console.warn('Failed to fetch live data:', error);
        }

        // Step 3: Use the processed data
        if (processedGameData) {
          setRawResponse({ data: { scoreboard: [processedGameData] } });
          setGameData(processedGameData);
          setError(null);
        } else {
          setError('No live game data found');
          setDebugInfo(prev => [...prev, `${timestamp}: ❌ No live game data found from any source`]);
        }
        
      } catch (err) {
        console.error('Error fetching live game:', err);
        setError(`Failed to load live game data: ${err.message}`);
        setDebugInfo(prev => [...prev, `${timestamp}: ❌ Error: ${err.message}`]);
      } finally {
        setLoading(false);
        setDebugInfo(prev => [...prev, `${timestamp}: Request completed`]);
      }
    };

    fetchLiveGame();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveGame, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Always render with debugger
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* ALWAYS SHOW DEBUG SECTION FIRST */}
        <div className="bg-black text-green-400 rounded-lg p-6 mb-8 font-mono text-sm">
          <h3 className="text-white font-bold text-lg mb-4">🐛 GraphQL Debug Console</h3>
          
          {/* Debug Log */}
          <div className="mb-4">
            <h4 className="text-yellow-400 font-bold mb-2">Debug Log:</h4>
            <div className="bg-gray-900 rounded p-3 max-h-32 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-xs text-green-300 mb-1">{info}</div>
              ))}
              {debugInfo.length === 0 && <div className="text-gray-500">No debug info yet...</div>}
            </div>
          </div>

          {/* Current State */}
          <div className="mb-4">
            <h4 className="text-yellow-400 font-bold mb-2">Component State:</h4>
            <div className="bg-gray-900 rounded p-3 text-xs">
              <div className="text-cyan-300">Loading: {loading ? 'true' : 'false'}</div>
              <div className="text-cyan-300">Has Game Data: {gameData ? 'true' : 'false'}</div>
              <div className="text-cyan-300">Has Error: {error ? 'true' : 'false'}</div>
              <div className="text-cyan-300">Has Raw Response: {rawResponse ? 'true' : 'false'}</div>
            </div>
          </div>

          {/* Raw Response */}
          {rawResponse && (
            <div className="mb-4">
              <h4 className="text-yellow-400 font-bold mb-2">Raw GraphQL Response:</h4>
              <div className="bg-gray-900 rounded p-3 max-h-40 overflow-y-auto">
                <pre className="text-xs text-blue-300 whitespace-pre-wrap">
                  {JSON.stringify(rawResponse, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Parsed Game Data */}
          {gameData && (
            <div className="mb-4">
              <h4 className="text-yellow-400 font-bold mb-2">Parsed Game Data:</h4>
              <div className="bg-gray-900 rounded p-3 max-h-32 overflow-y-auto">
                <pre className="text-xs text-cyan-300 whitespace-pre-wrap">
                  {JSON.stringify(gameData, null, 2)}
                </pre>
              </div>
              {/* SCORE VISUAL INDICATOR */}
              <div className="mt-2 p-2 bg-green-800 rounded text-center">
                <div className="text-yellow-300 font-bold text-lg">
                  🏈 LIVE SCORES: {gameData.awayTeam || "Iowa State"} {gameData.away_points ?? gameData.awayPoints ?? "?"} - {gameData.home_points ?? gameData.homePoints ?? "?"} {gameData.homeTeam || "Kansas State"}
                </div>
                <div className="text-green-300 text-xs">
                  Q{gameData.period ?? gameData.currentPeriod ?? "?"} • {gameData.clock ?? gameData.currentClock ?? "No Clock"}
                </div>
                {/* LINE SCORES DEBUG */}
                {gameData.homeLineScores && gameData.awayLineScores && (
                  <div className="text-blue-300 text-xs mt-1">
                    📊 Line Scores - Away: [{gameData.awayLineScores.join(', ')}] Home: [{gameData.homeLineScores.join(', ')}]
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-4">
              <h4 className="text-red-400 font-bold mb-2">Error:</h4>
              <div className="bg-red-900 rounded p-3 text-red-200 text-xs">
                {error}
              </div>
            </div>
          )}

          <div className="flex space-x-4 mt-4">
            <button 
              onClick={() => window.location.reload()}
              className="bg-green-600 text-white px-4 py-2 rounded text-xs hover:bg-green-700"
            >
              🔄 Refresh Data
            </button>
            <button 
              onClick={() => {setDebugInfo([]); setRawResponse(null);}}
              className="bg-red-600 text-white px-4 py-2 rounded text-xs hover:bg-red-700"
            >
              🗑️ Clear Debug
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">Live Games</span>
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-600 font-bold">LIVE DEBUG MODE</span>
          </div>
        </div>

        {/* Conditional Content */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading live game...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-20">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 text-xl">{error}</p>
          </div>
        )}

        {!gameData && !loading && !error && (
          <div className="text-center py-20">
            <div className="text-gray-400 text-6xl mb-4">📺</div>
            <p className="text-gray-600 text-xl">No live games available</p>
          </div>
        )}

        {/* Game Card - Only show if we have game data */}
        {gameData && !loading && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Game Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏈</span>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">College Football</div>
                    <div className="font-bold text-xl">Big 12 Conference</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="font-bold">LIVE</span>
                </div>
              </div>
            </div>

            {/* Game Content */}
            <div className="p-8">
              {/* Teams and Score */}
              <div className="flex items-center justify-between mb-8">
                {/* Away Team */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">ISU</span>
                  </div>
                  <div>
                    <div className="font-bold text-2xl text-gray-800">{gameData.awayTeam || "Iowa State Cyclones"}</div>
                    <div className="text-gray-500">Cyclones</div>
                  </div>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center mx-8">
                  <div className="text-5xl font-black text-gray-800 mb-2">
                    {/* FORCE DISPLAY OF SCORES - Use ?? for better null handling */}
                    {(gameData.away_points ?? gameData.awayPoints ?? 0)} - {(gameData.home_points ?? gameData.homePoints ?? 0)}
                  </div>
                  <div className="text-center">
                    <div className="text-red-600 font-bold flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">LIVE</span>
                        {/* Use EXACT Schedule.js clock logic */}
                        {(() => {
                          const period = gameData.period ?? gameData.current_period ?? gameData.currentPeriod;
                          const clock = gameData.clock ?? gameData.game_clock ?? gameData.time_remaining ?? gameData.currentClock;
                          return (period || clock) && (
                            <span className="text-xs opacity-75">
                              {period && `Q${period}`} {clock && clock}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Home Team */}
                <div className="flex items-center space-x-4 flex-1 justify-end">
                  <div className="text-right">
                    <div className="font-bold text-2xl text-gray-800">{gameData.homeTeam || "Kansas State Wildcats"}</div>
                    <div className="text-gray-500">Wildcats</div>
                  </div>
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">KSU</span>
                  </div>
                </div>
              </div>

              {/* Game Details */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="font-bold text-red-600">{gameData.status}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Quarter</div>
                    <div className="font-bold">
                      {(() => {
                        const period = gameData.period ?? gameData.current_period ?? gameData.currentPeriod;
                        return period ? `Q${period}` : 'N/A';
                      })()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Clock</div>
                    <div className="font-bold">
                      {(() => {
                        const clock = gameData.clock ?? gameData.game_clock ?? gameData.time_remaining ?? gameData.currentClock;
                        return clock || 'N/A';
                      })()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Game ID</div>
                    <div className="font-bold text-sm">{gameData.id}</div>
                  </div>
                </div>
              </div>

              {/* QUARTER-BY-QUARTER LINE SCORES */}
              {gameData.homeLineScores && gameData.awayLineScores && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">📊 Quarter-by-Quarter Scoring</h3>
                  
                  {/* Quarter Headers */}
                  <div className="grid grid-cols-6 gap-2 mb-2">
                    <div className="text-center font-bold text-gray-600 text-sm">Team</div>
                    {(() => {
                      const currentPeriod = gameData.period ?? gameData.currentPeriod ?? 1;
                      const maxQuarters = Math.max(currentPeriod, 4);
                      return [...Array(Math.min(maxQuarters, 4))].map((_, i) => (
                        <div key={i} className={`text-center font-bold text-sm ${
                          i + 1 === currentPeriod ? 'text-red-600 bg-red-100 rounded px-2 py-1' : 'text-gray-600'
                        }`}>
                          Q{i + 1}
                        </div>
                      ));
                    })()}
                    <div className="text-center font-bold text-gray-800 text-sm bg-gray-200 rounded px-2 py-1">TOTAL</div>
                  </div>

                  {/* Away Team Scores */}
                  <div className="grid grid-cols-6 gap-2 mb-2 bg-red-100 rounded-lg p-2">
                    <div className="text-center font-bold text-red-800 text-sm">
                      {gameData.awayTeam?.replace(' Cyclones', '') || 'ISU'}
                    </div>
                    {(() => {
                      const currentPeriod = gameData.period ?? gameData.currentPeriod ?? 1;
                      const maxQuarters = Math.max(currentPeriod, 4);
                      return [...Array(Math.min(maxQuarters, 4))].map((_, i) => (
                        <div key={i} className={`text-center font-bold text-sm ${
                          i + 1 === currentPeriod ? 'bg-red-200 rounded px-2 py-1' : ''
                        }`}>
                          {gameData.awayLineScores[i] ?? 0}
                        </div>
                      ));
                    })()}
                    <div className="text-center font-black text-red-800 text-lg bg-red-200 rounded px-2 py-1">
                      {gameData.away_points ?? gameData.awayPoints ?? 0}
                    </div>
                  </div>

                  {/* Home Team Scores */}
                  <div className="grid grid-cols-6 gap-2 bg-purple-100 rounded-lg p-2">
                    <div className="text-center font-bold text-purple-800 text-sm">
                      {gameData.homeTeam?.replace(' Wildcats', '') || 'KSU'}
                    </div>
                    {(() => {
                      const currentPeriod = gameData.period ?? gameData.currentPeriod ?? 1;
                      const maxQuarters = Math.max(currentPeriod, 4);
                      return [...Array(Math.min(maxQuarters, 4))].map((_, i) => (
                        <div key={i} className={`text-center font-bold text-sm ${
                          i + 1 === currentPeriod ? 'bg-purple-200 rounded px-2 py-1' : ''
                        }`}>
                          {gameData.homeLineScores[i] ?? 0}
                        </div>
                      ));
                    })()}
                    <div className="text-center font-black text-purple-800 text-lg bg-purple-200 rounded px-2 py-1">
                      {gameData.home_points ?? gameData.homePoints ?? 0}
                    </div>
                  </div>

                  {/* Quarter Summary */}
                  <div className="mt-4 text-center text-sm text-gray-600">
                    {(() => {
                      const currentPeriod = gameData.period ?? gameData.currentPeriod ?? 1;
                      const clock = gameData.clock ?? gameData.currentClock ?? "15:00";
                      if (currentPeriod <= 4) {
                        return `Currently in Q${currentPeriod} • ${clock} remaining`;
                      } else {
                        return `Overtime Period ${currentPeriod - 4} • ${clock}`;
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 mt-8">
                <button 
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-800 text-white py-3 px-6 rounded-lg font-bold hover:opacity-90 transition-all"
                >
                  🔄 Refresh Game
                </button>
                <button className="flex-1 border-2 border-red-600 text-red-600 py-3 px-6 rounded-lg font-bold hover:bg-red-50 transition-all">
                  📊 View Stats
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-500">
          <p>Live data powered by College Football Data GraphQL API</p>
          <p className="text-sm">Game updates automatically refresh every 30 seconds</p>
        </div>
      </div>
    </div>
  );
};

export default LiveGames;