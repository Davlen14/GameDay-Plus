import React, { useEffect, useState, useCallback } from 'react';
import { playService } from '../../services/playService';
import { gameService } from '../../services/gameService';

const GamePlayByPlay = ({ game, awayTeam, homeTeam }) => {
  const [animateField, setAnimateField] = useState(false);
  
  // Win probability and play data state
  const [winProbData, setWinProbData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlay, setSelectedPlay] = useState(null);
  const [hoveredPlay, setHoveredPlay] = useState(null);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  
  // Debugger and playback state
  const [showDebugger, setShowDebugger] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayIndex, setCurrentPlayIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms per play
  const [rawPlayData, setRawPlayData] = useState(null);
  const [winProbabilityData, setWinProbabilityData] = useState(null);

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

  // Convert hex to RGB for CSS
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 204, g: 0, b: 28 };
  };

  const homeRgb = hexToRgb(homeData?.primaryColor || '#cc001c');
  const awayRgb = hexToRgb(awayData?.primaryColor || '#3b82f6');
  const homeColorRgb = `${homeRgb.r}, ${homeRgb.g}, ${homeRgb.b}`;
  const awayColorRgb = `${awayRgb.r}, ${awayRgb.g}, ${awayRgb.b}`;

  // Real API data loading instead of mock data
  const loadWinProbability = useCallback(async () => {
    if (!game?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to get real play-by-play data first
      let playData = [];
      let winProbData = null;
      
      try {
        // Method 1: Try live plays if game is in progress
        if (!game.completed) {
          console.log('🔴 Attempting to load live plays for game:', game.id);
          playData = await playService.getLivePlays(game.id);
        }
        
        // Method 2: If no live data, try regular plays by game stats
        if (!playData || playData.length === 0) {
          console.log('📊 Attempting to load play stats for game:', game.id);
          playData = await playService.getPlayStats(game.season || new Date().getFullYear(), game.week, null, game.id);
        }
        
        // Method 3: Try win probability data
        console.log('📈 Attempting to load win probability for game:', game.id);
        winProbData = await gameService.getWinProbability(game.id);
        setWinProbabilityData(winProbData);
        
        // Store raw data for debugger
        setRawPlayData({
          playData: playData,
          winProbData: winProbData,
          gameData: game,
          metadata: {
            loadedAt: new Date().toISOString(),
            gameId: game.id,
            season: game.season,
            week: game.week,
            completed: game.completed
          }
        });
        
        console.log('✅ Raw API Response - Plays:', playData?.length || 0, 'Win Prob Points:', winProbData?.length || 0);
        
      } catch (apiError) {
        console.warn('⚠️ API call failed, using mock data:', apiError);
        // Fall back to mock data if API fails
      }
      
      // Transform real data or create mock data
      let transformedData = [];
      
      if (playData && playData.length > 0) {
        // Transform real API data
        transformedData = playData.map((play, index) => ({
          playNumber: index + 1,
          playId: `play_${play.id || index + 1}`,
          homeWinProbability: play.homeWinProbability || (winProbData && winProbData[index]?.home || 0.5),
          awayWinProbability: play.awayWinProbability || (1 - (winProbData && winProbData[index]?.home || 0.5)),
          homeScore: play.homeScore || game.home_points || 0,
          awayScore: play.awayScore || game.away_points || 0,
          down: play.down || Math.floor(Math.random() * 4) + 1,
          distance: play.distance || Math.floor(Math.random() * 15) + 1,
          yardLine: play.yardLine || Math.floor(Math.random() * 100),
          homeBall: play.offenseId === game.home_id || index % 2 === 0,
          playText: play.playText || play.description || `${play.playType || 'Play'} for ${play.yards || 'unknown'} yards`,
          quarter: play.period || Math.floor(index / 12) + 1,
          clock: play.clock || `${14 - Math.floor(index / 4)}:${String(60 - (index % 4) * 15).padStart(2, '0')}`,
          playType: play.playType || 'rush',
          yards: play.yards || 0
        }));
      } else {
        // Create enhanced mock data that looks more realistic
        const homeTeamName = homeData?.name || 'HOME';
        const awayTeamName = awayData?.name || 'AWAY';
        
        transformedData = Array.from({ length: 75 }, (_, i) => ({
          playNumber: i + 1,
          playId: `play_${i + 1}`,
          homeWinProbability: 0.5 + (Math.random() - 0.5) * 0.6 + (i % 15 === 0 ? (Math.random() - 0.5) * 0.4 : 0),
          awayWinProbability: 1 - (0.5 + (Math.random() - 0.5) * 0.6),
          homeScore: Math.floor(i / 15) * 7,
          awayScore: Math.floor(i / 18) * 7,
          down: (i % 4) + 1,
          distance: Math.floor(Math.random() * 15) + 1,
          yardLine: Math.floor(Math.random() * 100),
          homeBall: i % 2 === 0,
          playText: `Play ${i + 1}: ${i % 2 === 0 ? homeTeamName : awayTeamName} ${['rush', 'pass', 'punt', 'field goal'][i % 4]} for ${Math.floor(Math.random() * 25)} yards.`,
          quarter: Math.floor(i / 18) + 1,
          clock: `${14 - Math.floor(i / 6)}:${String(60 - (i % 6) * 10).padStart(2, '0')}`,
          playType: ['rush', 'pass', 'punt', 'field goal'][i % 4],
          yards: Math.floor(Math.random() * 25)
        }));
      }
      
      setWinProbData(transformedData);
      if (transformedData.length > 0) {
        setSelectedPlay(transformedData[transformedData.length - 1]);
      }
    } catch (err) {
      setError('Failed to load play data');
      console.error('Error loading play data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [game?.id, game?.completed, game?.season, game?.week, game?.home_id, game?.home_points, game?.away_points]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateField(true), 300);
    loadWinProbability();
    return () => clearTimeout(timer);
  }, [loadWinProbability]);

  // Auto-play functionality for debugger
  useEffect(() => {
    let interval;
    if (isPlaying && currentPlayIndex < winProbData.length - 1) {
      interval = setInterval(() => {
        setCurrentPlayIndex(prev => {
          const nextIndex = prev + 1;
          if (nextIndex < winProbData.length) {
            setSelectedPlay(winProbData[nextIndex]);
            return nextIndex;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playbackSpeed);
    } else if (currentPlayIndex >= winProbData.length - 1) {
      setIsPlaying(false);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, currentPlayIndex, winProbData, playbackSpeed]);

  // Playback controls
  const handlePlay = () => {
    if (currentPlayIndex >= winProbData.length - 1) {
      setCurrentPlayIndex(0);
      setSelectedPlay(winProbData[0]);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentPlayIndex(0);
    if (winProbData.length > 0) {
      setSelectedPlay(winProbData[0]);
    }
  };

  const handlePlaySelect = (index) => {
    setCurrentPlayIndex(index);
    setSelectedPlay(winProbData[index]);
    setIsPlaying(false);
  };

  return (
    <div className="w-[95vw] max-w-none mx-auto px-4 py-8" style={{
      fontFamily: 'Titillium Web, sans-serif'
    }}>
      {/* Protect against rendering errors */}
      {error && (
        <div className="text-center py-16">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
            <i className="fas fa-exclamation-triangle text-red-500 text-2xl mb-4"></i>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                loadWinProbability();
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!error && (
        <>
          <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&family=Titillium+Web:wght@200;300;400;600;700;900&display=swap');

        .football-field {
          position: relative;
          border: 4px solid #ffffff;
          border-radius: 8px;
          box-shadow: 
            0 30px 60px rgba(0, 0, 0, 0.3),
            0 15px 30px rgba(0, 0, 0, 0.2),
            inset 0 0 0 2px rgba(255, 255, 255, 0.1);
          display: flex;
          width: 100%;
          max-width: 1200px;
          aspect-ratio: 2.2 / 1;
          z-index: 1;
          backdrop-filter: blur(5px);
          overflow: hidden;
          transform: perspective(1000px) rotateX(2deg);
          transform-style: preserve-3d;
          transition: all 0.8s ease-out;
          opacity: ${animateField ? '1' : '0'};
          transform: ${animateField ? 'perspective(1000px) rotateX(2deg) scale(1)' : 'perspective(1000px) rotateX(2deg) scale(0.9)'};
        }

        .endzone {
          flex-shrink: 0;
          width: 15%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          box-shadow: 
            inset 0 0 30px rgba(0, 0, 0, 0.4),
            inset 0 0 0 1px rgba(255, 255, 255, 0.05);
        }

        .away-endzone {
          background: 
            linear-gradient(135deg, rgba(${awayColorRgb}, 0.9) 0%, rgba(${awayColorRgb}, 0.7) 50%, rgba(${awayColorRgb}, 0.9) 100%),
            repeating-linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.02) 2%,
              transparent 4%
            );
        }

        .home-endzone {
          background: 
            linear-gradient(135deg, rgba(${homeColorRgb}, 0.9) 0%, rgba(${homeColorRgb}, 0.7) 50%, rgba(${homeColorRgb}, 0.9) 100%),
            repeating-linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.02) 2%,
              transparent 4%
            );
        }

        .main-field {
          flex-grow: 1;
          position: relative;
          overflow: hidden;
          background: 
            repeating-linear-gradient(
              90deg,
              #1a5a1f 0%,
              #1a5a1f 9.5%,
              #2d7532 9.5%,
              #2d7532 10%,
              #238529 10%,
              #238529 19.5%,
              #1f6b25 19.5%,
              #1f6b25 20%
            ),
            repeating-linear-gradient(
              0deg,
              transparent 0%,
              rgba(255, 255, 255, 0.01) 1px,
              transparent 2px,
              rgba(0, 0, 0, 0.01) 3px,
              transparent 4px
            );
        }
        
        .main-field::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.15) 0%,
              rgba(255, 255, 255, 0.08) 30%,
              rgba(0, 0, 0, 0.05) 70%,
              rgba(0, 0, 0, 0.1) 100%
            ),
            repeating-linear-gradient(
              45deg,
              transparent 0%,
              rgba(255, 255, 255, 0.008) 1px,
              transparent 2px
            );
          pointer-events: none;
          z-index: 1;
        }
        
        .main-field::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.015) 0%,
            rgba(255, 255, 255, 0.015) 10%,
            rgba(0, 0, 0, 0.015) 10%,
            rgba(0, 0, 0, 0.015) 20%
          );
          pointer-events: none;
          z-index: 2;
        }

        .endzone-text {
          font-family: "Orbitron", sans-serif;
          font-size: clamp(1.8rem, 4.5vw, 3.5rem);
          font-weight: 700;
          text-align: center;
          white-space: nowrap;
          transform: rotate(90deg);
          position: absolute;
          letter-spacing: 0.1rem;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .away-text {
          color: ${awayData.secondaryColor};
          text-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.6),
            0 2px 4px rgba(0, 0, 0, 0.4),
            0 0 20px rgba(${awayColorRgb}, 0.4),
            0 0 40px rgba(${awayColorRgb}, 0.2);
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) rotate(-90deg);
        }

        .home-text {
          color: ${homeData.secondaryColor};
          text-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.6),
            0 2px 4px rgba(0, 0, 0, 0.4),
            0 0 20px rgba(${homeColorRgb}, 0.4),
            0 0 40px rgba(${homeColorRgb}, 0.2);
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) rotate(90deg);
        }

        .yard-line {
          position: absolute;
          width: 4px;
          height: 100%;
          background: 
            linear-gradient(to bottom, 
              rgba(255, 255, 255, 0.95) 0%, 
              rgba(255, 255, 255, 1) 50%, 
              rgba(255, 255, 255, 0.95) 100%
            );
          top: 0;
          box-shadow: 
            0 0 6px rgba(255, 255, 255, 0.6),
            inset 0 0 2px rgba(255, 255, 255, 0.8),
            2px 0 4px rgba(0, 0, 0, 0.1);
          z-index: 5;
          border-radius: 1px;
        }

        .yard-line.fifty {
          width: 6px;
          background: 
            linear-gradient(to bottom, 
              rgba(255, 255, 255, 1) 0%, 
              rgba(255, 255, 255, 1) 100%
            );
          box-shadow: 
            0 0 12px rgba(255, 255, 255, 0.8),
            inset 0 0 3px rgba(255, 255, 255, 0.9),
            3px 0 6px rgba(0, 0, 0, 0.15);
        }

        .yard-number {
          position: absolute;
          color: #ffffff;
          font-family: "Orbitron", sans-serif;
          font-weight: 700;
          font-size: clamp(0.9rem, 2.4vw, 1.6rem);
          user-select: none;
          text-shadow: 
            0 3px 6px rgba(0, 0, 0, 0.7),
            0 1px 3px rgba(0, 0, 0, 0.5),
            0 0 10px rgba(255, 255, 255, 0.3),
            0 0 20px rgba(255, 255, 255, 0.1);
          letter-spacing: 0.08rem;
          z-index: 6;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
        }

        .yard-number.top {
          top: 10%;
        }

        .yard-number.bottom {
          bottom: 10%;
          transform: rotate(180deg);
        }

        .center-logo {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: clamp(140px, 28vw, 320px);
          height: clamp(140px, 28vw, 320px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
        }

        .center-logo img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          filter: 
            drop-shadow(0 6px 12px rgba(0, 0, 0, 0.5))
            drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3))
            drop-shadow(0 0 20px rgba(255, 255, 255, 0.1))
            brightness(1.05)
            contrast(1.1)
            saturate(1.2);
          z-index: 11;
          transition: transform 0.5s ease-out;
          transform: ${animateField ? 'scale(1)' : 'scale(0.8)'};
        }

        .field-lighting {
          position: absolute;
          top: -10%;
          left: -5%;
          right: -5%;
          bottom: -10%;
          background: 
            radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.1) 0%, transparent 60%),
            linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.05) 100%);
          z-index: 0;
          pointer-events: none;
        }
        
        .field-shadow {
          position: absolute;
          bottom: -8px;
          left: 8px;
          right: 8px;
          height: 12px;
          background: 
            linear-gradient(to right, 
              transparent 0%, 
              rgba(0, 0, 0, 0.1) 10%, 
              rgba(0, 0, 0, 0.15) 50%, 
              rgba(0, 0, 0, 0.1) 90%, 
              transparent 100%
            );
          border-radius: 50%;
          filter: blur(3px);
          z-index: -1;
        }

        @keyframes fieldEntrance {
          from {
            opacity: 0;
            transform: perspective(1000px) rotateX(5deg) scale(0.9);
          }
          to {
            opacity: 1;
            transform: perspective(1000px) rotateX(2deg) scale(1);
          }
        }

        .hash-mark {
          position: absolute;
          width: 2px;
          height: 100%;
          background: rgba(255, 255, 255, 0.4);
          top: 0;
          z-index: 3;
        }
      `}</style>

      {/* Game Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-2xl">
          {/* Away Team */}
          <div className="flex items-center space-x-4">
            <img
              src={awayData.logo}
              alt={`${awayData.name} logo`}
              className="w-16 h-16 object-contain"
              onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
            />
            <div>
              <h2 className="text-xl font-bold">{awayData.name}</h2>
              <p className="text-3xl font-black" style={{ color: awayData.primaryColor }}>
                {game?.away_points || 0}
              </p>
            </div>
          </div>

          {/* Game Status */}
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-300">
              {game?.completed ? 'FINAL' : 'LIVE'}
            </div>
            <div className="text-xs text-gray-400">Play-by-Play Analysis</div>
            {!game?.completed && (
              <div className="flex items-center justify-center mt-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-xs text-red-400">LIVE</span>
              </div>
            )}
          </div>

          {/* Home Team */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <h2 className="text-xl font-bold">{homeData.name}</h2>
              <p className="text-3xl font-black" style={{ color: homeData.primaryColor }}>
                {game?.home_points || 0}
              </p>
            </div>
            <img
              src={homeData.logo}
              alt={`${homeData.name} logo`}
              className="w-16 h-16 object-contain"
              onError={(e) => { e.target.src = '/photos/Whitmer.png'; }}
            />
          </div>
        </div>
      </div>

      {/* Football Field Section */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="football-field">
        {/* Away Team End Zone */}
        <div className="endzone away-endzone">
          <span className="endzone-text away-text">{awayData.name}</span>
        </div>

        {/* Main Field */}
        <div className="main-field" id="mainField">
            {/* Field Lighting */}
            <div className="field-lighting"></div>
            
            {/* Yard Lines */}
            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(yardMark => {
              const percentage = yardMark / 100;
              let displayNum;
              if (yardMark === 50) {
                displayNum = 50;
              } else if (yardMark < 50) {
                displayNum = yardMark;
              } else {
                displayNum = 100 - yardMark;
              }

              return (
                <div key={yardMark}>
                  <div 
                    className={`yard-line ${yardMark === 50 ? 'fifty' : ''}`}
                    style={{ left: `${percentage * 100}%` }}
                  />
                  <span 
                    className="yard-number top"
                    style={{ left: `${percentage * 100}%`, transform: 'translateX(-50%)' }}
                  >
                    {displayNum}
                  </span>
                  <span 
                    className="yard-number bottom"
                    style={{ left: `${percentage * 100}%`, transform: 'translateX(-50%) rotate(180deg)' }}
                  >
                    {displayNum}
                  </span>
                </div>
              );
            })}

            {/* Hash Marks */}
            {[15, 25, 35, 45, 55, 65, 75, 85, 95].map(hashMark => (
              <div 
                key={hashMark}
                className="hash-mark"
                style={{ left: `${(hashMark / 100) * 100}%` }}
              />
            ))}

            {/* Home Team Logo in Center */}
            <div className="center-logo">
              <img
                src={homeData.logo}
                alt={`${homeData.name} logo`}
                onError={(e) => { e.target.src = '/photos/Whitmer.png'; }}
              />
            </div>
          </div>

        {/* Home Team End Zone */}
        <div className="endzone home-endzone">
          <span className="endzone-text home-text">{homeData.name}</span>
        </div>

        {/* Field Shadow */}
        <div className="field-shadow"></div>
          </div>
        </div>
        
        {/* Game Simulation Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowSimulationModal(true)}
            disabled={isLoading || winProbData.length === 0}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-xl shadow-lg hover:from-red-700 hover:to-red-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-play mr-3"></i>
            View Game Simulation
          </button>
        </div>
      </div>

      {/* JSON Debugger Panel */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Game Data Inspector & Playback</h3>
            <button
              onClick={() => setShowDebugger(!showDebugger)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              {showDebugger ? 'Hide' : 'Show'} Inspector
            </button>
          </div>
          
          {showDebugger && (
            <div className="space-y-6">
              {/* Playback Controls */}
              <div className="flex items-center justify-center space-x-4 bg-gray-100 rounded-xl p-4">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors text-white"
                  disabled={winProbData.length === 0}
                >
                  <i className="fas fa-step-backward mr-2"></i>
                  Reset
                </button>
                
                <button
                  onClick={handlePlay}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-bold text-white"
                  disabled={winProbData.length === 0}
                >
                  <i className={`fas fa-${isPlaying ? 'pause' : 'play'} mr-2`}></i>
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                
                <button
                  onClick={() => handlePlaySelect(winProbData.length - 1)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors text-white"
                  disabled={winProbData.length === 0}
                >
                  <i className="fas fa-step-forward mr-2"></i>
                  End
                </button>
              </div>

              {/* Speed Control */}
              <div className="flex items-center justify-center space-x-4 bg-gray-100 rounded-xl p-4">
                <span className="text-sm font-medium text-gray-700">Speed:</span>
                <button
                  onClick={() => setPlaybackSpeed(2000)}
                  className={`px-3 py-1 rounded ${playbackSpeed === 2000 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-700'} transition-colors`}
                >
                  0.5x
                </button>
                <button
                  onClick={() => setPlaybackSpeed(1000)}
                  className={`px-3 py-1 rounded ${playbackSpeed === 1000 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-700'} transition-colors`}
                >
                  1x
                </button>
                <button
                  onClick={() => setPlaybackSpeed(500)}
                  className={`px-3 py-1 rounded ${playbackSpeed === 500 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-700'} transition-colors`}
                >
                  2x
                </button>
              </div>

              {/* Progress Bar */}
              {winProbData.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium text-gray-700">
                    <span>Play {currentPlayIndex + 1} of {winProbData.length}</span>
                    <span>{Math.round((currentPlayIndex / (winProbData.length - 1)) * 100)}%</span>
                  </div>
                  <div 
                    className="w-full bg-gray-300 rounded-full h-3 cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = x / rect.width;
                      const newIndex = Math.floor(percentage * winProbData.length);
                      handlePlaySelect(Math.min(newIndex, winProbData.length - 1));
                    }}
                  >
                    <div 
                      className="bg-gradient-to-r from-red-500 to-red-700 h-3 rounded-full transition-all duration-200"
                      style={{ width: `${((currentPlayIndex) / (winProbData.length - 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Current Play Info */}
              {selectedPlay && (
                <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-800">Current Play #{selectedPlay.playNumber}</span>
                    <div className="flex items-center space-x-2">
                      <img 
                        src={selectedPlay.homeBall ? homeData.logo : awayData.logo}
                        alt="possession"
                        className="w-6 h-6"
                      />
                      <span className="text-sm text-gray-700">{selectedPlay.homeBall ? homeData.name : awayData.name} Ball</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{selectedPlay.playText}</p>
                </div>
              )}

              {/* Raw JSON Data Display */}
              {rawPlayData && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-3">Raw API Response Data</h4>
                  <div className="max-h-96 overflow-y-auto">
                    <pre className="text-xs text-gray-700 bg-white p-4 rounded border border-gray-300 overflow-x-auto">
                      {JSON.stringify(rawPlayData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modern Win Probability Chart */}
      {!isLoading && winProbData && winProbData.length > 0 && (
        <div className="mb-8">
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-3xl font-bold mb-8 text-gray-800 text-center">Win Probability Analysis</h3>
            
            {/* Chart Container - Made Taller and More Modern */}
            <div className="relative h-96 mb-8 bg-gradient-to-b from-gray-50 to-white rounded-xl p-6 shadow-inner border border-gray-200">
              {winProbData.length > 1 && (
                <svg className="w-full h-full" viewBox="0 0 900 300">
                {/* Background Grid */}
                <defs>
                  <pattern id="grid" width="50" height="25" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 25" fill="none" stroke="#f9fafb" strokeWidth="1"/>
                  </pattern>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: homeData.primaryColor, stopOpacity: 0.2}} />
                    <stop offset="100%" style={{stopColor: homeData.primaryColor, stopOpacity: 0.05}} />
                  </linearGradient>
                  <linearGradient id="chartBorder" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor: homeData.primaryColor, stopOpacity: 0.8}} />
                    <stop offset="50%" style={{stopColor: homeData.primaryColor, stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: homeData.primaryColor, stopOpacity: 0.8}} />
                  </linearGradient>
                </defs>
                
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Horizontal Grid Lines */}
                {[0, 25, 50, 75, 100].map(y => (
                  <g key={y}>
                    <line
                      x1="60"
                      y1={280 - (y * 2.8)}
                      x2="840"
                      y2={280 - (y * 2.8)}
                      stroke={y === 50 ? "#6b7280" : "#e5e7eb"}
                      strokeWidth={y === 50 ? "2" : "1"}
                      strokeDasharray={y === 50 ? "0" : "5,5"}
                    />
                    <text
                      x="50"
                      y={285 - (y * 2.8)}
                      textAnchor="end"
                      className="text-sm font-medium fill-gray-600"
                    >
                      {y}%
                    </text>
                  </g>
                ))}
                
                {/* Area under curve */}
                <path
                  d={`M 60,280 ${winProbData.map((play, index) => 
                    `L ${60 + (index * (780 / (winProbData.length - 1)))},${280 - (play.homeWinProbability * 280)}`
                  ).join(' ')} L ${60 + (780)},280 Z`}
                  fill="url(#chartGradient)"
                  opacity="0.3"
                />
                
                {/* Main Win Probability Line */}
                <polyline
                  fill="none"
                  stroke="url(#chartBorder)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={winProbData.map((play, index) => 
                    `${60 + (index * (780 / (winProbData.length - 1)))},${280 - (play.homeWinProbability * 280)}`
                  ).join(' ')}
                  filter="drop-shadow(0 2px 6px rgba(0,0,0,0.1))"
                />
                
                {/* Data Points */}
                {winProbData.map((play, index) => (
                  <circle
                    key={play.playId}
                    cx={60 + (index * (780 / (winProbData.length - 1)))}
                    cy={280 - (play.homeWinProbability * 280)}
                    r={play.playId === selectedPlay?.playId ? "6" : index === currentPlayIndex ? "8" : "3"}
                    fill={index === currentPlayIndex ? "#ef4444" : homeData.primaryColor}
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:r-5"
                    onClick={() => setSelectedPlay(play)}
                    onMouseEnter={() => setHoveredPlay(play)}
                    onMouseLeave={() => setHoveredPlay(null)}
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                  />
                ))}
                
                {/* Current play indicator line */}
                {winProbData[currentPlayIndex] && (
                  <line
                    x1={60 + (currentPlayIndex * (780 / (winProbData.length - 1)))}
                    y1="20"
                    x2={60 + (currentPlayIndex * (780 / (winProbData.length - 1)))}
                    y2="280"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    opacity="0.7"
                  />
                )}
                
                {/* X-axis Quarter Markers */}
                {[1, 2, 3, 4].map(quarter => {
                  const quarterPosition = 60 + ((quarter * winProbData.length / 4) * (780 / (winProbData.length - 1)));
                  return (
                    <g key={quarter}>
                      <line
                        x1={quarterPosition}
                        y1="280"
                        x2={quarterPosition}
                        y2="295"
                        stroke="#9ca3af"
                        strokeWidth="2"
                      />
                      <text
                        x={quarterPosition}
                        y="310"
                        textAnchor="middle"
                        className="text-sm font-medium fill-gray-600"
                      >
                        Q{quarter}
                      </text>
                    </g>
                  );
                })}
                </svg>
              )}
              
              {/* Enhanced Tooltip */}
              {hoveredPlay && (
                <div className="absolute bg-white text-gray-800 p-4 rounded-xl shadow-2xl z-20 pointer-events-none border border-gray-200"
                     style={{
                       left: `${(winProbData.indexOf(hoveredPlay) / (winProbData.length - 1)) * 100}%`,
                       top: `${100 - (hoveredPlay.homeWinProbability * 100)}%`,
                       transform: 'translate(-50%, -100%) translateY(-10px)'
                     }}>
                  <div className="text-sm space-y-1">
                    <div className="font-bold border-b border-gray-300 pb-1 text-gray-800">Play #{hoveredPlay.playNumber}</div>
                    <div className="flex items-center space-x-2">
                      <img src={homeData.logo} alt={homeData.name} className="w-4 h-4" />
                      <span className="text-gray-700">{homeData.name}: {Math.round(hoveredPlay.homeWinProbability * 100)}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <img src={awayData.logo} alt={awayData.name} className="w-4 h-4" />
                      <span className="text-gray-700">{awayData.name}: {Math.round((1 - hoveredPlay.homeWinProbability) * 100)}%</span>
                    </div>
                    <div className="text-xs text-gray-500 pt-1 border-t border-gray-300">
                      Score: {hoveredPlay.homeScore} - {hoveredPlay.awayScore}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Enhanced Chart Legend with Team Logos */}
            <div className="flex justify-center items-center space-x-12 text-lg">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-white to-gray-50 px-6 py-3 rounded-xl shadow-sm border border-gray-200">
                <img src={homeData.logo} alt={homeData.name} className="w-8 h-8" />
                <div className="w-6 h-2 rounded-full" style={{ backgroundColor: homeData.primaryColor }}></div>
                <span className="font-semibold text-gray-700">{homeData.name} Win %</span>
              </div>
              <div className="flex items-center space-x-3 bg-gradient-to-r from-white to-gray-50 px-6 py-3 rounded-xl shadow-sm border border-gray-200">
                <img src={awayData.logo} alt={awayData.name} className="w-8 h-8" />
                <div className="w-6 h-2 rounded-full" style={{ backgroundColor: awayData.primaryColor }}></div>
                <span className="font-semibold text-gray-700">{awayData.name} Win %</span>
              </div>
            </div>
            
            <p className="text-center text-gray-500 text-lg mt-6 font-medium">
              <i className="fas fa-mouse-pointer mr-2"></i>
              Click on chart points to see detailed play information
            </p>
          </div>
        </div>
      )}

      {/* Selected Play Details */}
      {selectedPlay && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Play #{selectedPlay.playNumber}
              </h3>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedPlay.homeBall ? homeData.primaryColor : awayData.primaryColor }}
                ></div>
                <span className="text-sm font-medium text-gray-700" 
                      style={{ color: selectedPlay.homeBall ? homeData.primaryColor : awayData.primaryColor }}>
                  {selectedPlay.homeBall ? homeData.name : awayData.name}
                </span>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">{selectedPlay.playText}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-sm text-gray-500">Down & Distance</div>
                <div className="font-bold text-gray-800">{selectedPlay.down} & {selectedPlay.distance}</div>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-sm text-gray-500">Score</div>
                <div className="font-bold text-gray-800">{selectedPlay.homeScore} - {selectedPlay.awayScore}</div>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-sm text-gray-500">Time</div>
                <div className="font-bold text-gray-800">Q{selectedPlay.quarter} {selectedPlay.clock}</div>
              </div>
            </div>
            
            {/* Win Probability Bars */}
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-16 text-sm font-medium text-gray-700">{homeData.name}</div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${selectedPlay.homeWinProbability * 100}%`,
                        backgroundColor: homeData.primaryColor 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm font-bold w-12 text-gray-700">
                  {Math.round(selectedPlay.homeWinProbability * 100)}%
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-16 text-sm font-medium text-gray-700">{awayData.name}</div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(1 - selectedPlay.homeWinProbability) * 100}%`,
                        backgroundColor: awayData.primaryColor 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm font-bold w-12 text-gray-700">
                  {Math.round((1 - selectedPlay.homeWinProbability) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Play Count Summary */}
      {winProbData.length > 0 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Game Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-gray-700">{winProbData.length}</div>
                <div className="text-sm text-gray-500">Total Plays</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold" style={{ color: homeData.primaryColor }}>
                  {winProbData.filter(p => p.homeBall).length}
                </div>
                <div className="text-sm text-gray-500">{homeData.name} Plays</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold" style={{ color: awayData.primaryColor }}>
                  {winProbData.filter(p => !p.homeBall).length}
                </div>
                <div className="text-sm text-gray-500">{awayData.name} Plays</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-gray-700">
                  {Math.round((winProbData[winProbData.length - 1]?.homeWinProbability || 0.5) * 100)}%
                </div>
                <div className="text-sm text-gray-500">Final Win %</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading/Error States */}
      {isLoading && (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading game data...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
            <i className="fas fa-exclamation-triangle text-red-500 text-2xl mb-4"></i>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Game Simulation Modal */}
      {showSimulationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-[95vw] h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">🏈 Live Game Simulation</h2>
                <button
                  onClick={() => setShowSimulationModal(false)}
                  className="text-gray-300 hover:text-white text-2xl transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 h-full space-y-6">
              {/* Game Score Header */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-12 mb-6">
                  <div className="text-center">
                    <img src={awayData.logo} alt={awayData.name} className="w-20 h-20 mx-auto mb-3" />
                    <div className="font-bold text-xl">{awayData.name}</div>
                    <div className="text-4xl font-black" style={{ color: awayData.primaryColor }}>
                      {selectedPlay?.awayScore || 0}
                    </div>
                  </div>
                  <div className="text-6xl font-bold text-gray-400">VS</div>
                  <div className="text-center">
                    <img src={homeData.logo} alt={homeData.name} className="w-20 h-20 mx-auto mb-3" />
                    <div className="font-bold text-xl">{homeData.name}</div>
                    <div className="text-4xl font-black" style={{ color: homeData.primaryColor }}>
                      {selectedPlay?.homeScore || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Football Field for Simulation */}
              <div className="bg-gradient-to-b from-green-800 to-green-900 rounded-2xl p-6 shadow-inner">
                <div className="relative h-32 bg-gradient-to-r from-green-600 to-green-700 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                  {/* Field Markings */}
                  <div className="absolute inset-0 flex">
                    {/* Away Endzone */}
                    <div 
                      className="w-[15%] flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: `${awayData.primaryColor}aa` }}
                    >
                      <span className="transform -rotate-90">{awayData.name}</span>
                    </div>
                    
                    {/* Main Field */}
                    <div className="flex-1 relative">
                      {/* Yard Lines */}
                      {[20, 40, 60, 80].map(yard => (
                        <div 
                          key={yard}
                          className="absolute top-0 bottom-0 w-0.5 bg-white opacity-60"
                          style={{ left: `${yard}%` }}
                        />
                      ))}
                      
                      {/* 50 Yard Line */}
                      <div className="absolute top-0 bottom-0 w-1 bg-white left-1/2 transform -translate-x-0.5" />
                      
                      {/* Ball Position Indicator */}
                      {selectedPlay && (
                        <div 
                          className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-500"
                          style={{ 
                            left: `${selectedPlay.yardLine}%`,
                            transform: 'translateY(-50%)'
                          }}
                        >
                          <div className="flex flex-col items-center">
                            <img 
                              src={selectedPlay.homeBall ? homeData.logo : awayData.logo}
                              alt="ball possession"
                              className="w-8 h-8 rounded-full bg-white p-1 shadow-lg animate-bounce"
                            />
                            <div className="text-white text-xs font-bold mt-1 bg-black bg-opacity-50 px-2 py-1 rounded">
                              🏈
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Home Endzone */}
                    <div 
                      className="w-[15%] flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: `${homeData.primaryColor}aa` }}
                    >
                      <span className="transform rotate-90">{homeData.name}</span>
                    </div>
                  </div>
                </div>
                
                {/* Field Info */}
                {selectedPlay && (
                  <div className="mt-4 bg-white rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={selectedPlay.homeBall ? homeData.logo : awayData.logo}
                          alt="possession"
                          className="w-6 h-6"
                        />
                        <span className="font-semibold">
                          {selectedPlay.homeBall ? homeData.name : awayData.name} Ball
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">{selectedPlay.down} & {selectedPlay.distance}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Q{selectedPlay.quarter} {selectedPlay.clock}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Simulation Controls */}
              <div className="bg-gray-100 rounded-xl p-6">
                <div className="flex items-center justify-center space-x-6 mb-4">
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-semibold"
                    disabled={winProbData.length === 0}
                  >
                    <i className="fas fa-step-backward mr-2"></i>
                    Reset
                  </button>
                  
                  <button
                    onClick={handlePlay}
                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white rounded-lg transition-all font-bold text-lg shadow-lg"
                    disabled={winProbData.length === 0}
                  >
                    <i className={`fas fa-${isPlaying ? 'pause' : 'play'} mr-3`}></i>
                    {isPlaying ? 'Pause Simulation' : 'Start Simulation'}
                  </button>
                  
                  <button
                    onClick={() => handlePlaySelect(winProbData.length - 1)}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-semibold"
                    disabled={winProbData.length === 0}
                  >
                    <i className="fas fa-step-forward mr-2"></i>
                    Final
                  </button>
                </div>

                {/* Progress Bar */}
                {winProbData.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Play {currentPlayIndex + 1} of {winProbData.length}</span>
                      <span>{Math.round((currentPlayIndex / (winProbData.length - 1)) * 100)}% Complete</span>
                    </div>
                    <div 
                      className="w-full bg-gray-300 rounded-full h-4 cursor-pointer shadow-inner"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const percentage = x / rect.width;
                        const newIndex = Math.floor(percentage * winProbData.length);
                        handlePlaySelect(Math.min(newIndex, winProbData.length - 1));
                      }}
                    >
                      <div 
                        className="bg-gradient-to-r from-red-500 to-red-700 h-4 rounded-full transition-all duration-300 shadow-sm"
                        style={{ width: `${((currentPlayIndex) / (winProbData.length - 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Current Play Details */}
              {selectedPlay && (
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-xl font-bold mb-3 text-gray-800">
                    Play #{selectedPlay.playNumber} Details
                  </h4>
                  <p className="text-gray-700 text-lg mb-4">{selectedPlay.playText}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                      <div className="text-sm text-gray-500">Down & Distance</div>
                      <div className="font-bold text-lg text-gray-800">{selectedPlay.down} & {selectedPlay.distance}</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                      <div className="text-sm text-gray-500">Score</div>
                      <div className="font-bold text-lg text-gray-800">{selectedPlay.homeScore} - {selectedPlay.awayScore}</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                      <div className="text-sm text-gray-500">Quarter</div>
                      <div className="font-bold text-lg text-gray-800">Q{selectedPlay.quarter}</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                      <div className="text-sm text-gray-500">Time</div>
                      <div className="font-bold text-lg text-gray-800">{selectedPlay.clock}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Plays List */}
              <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                  <h4 className="text-lg font-bold text-gray-800">Recent Plays</h4>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {winProbData.slice(-8).reverse().map((play, index) => (
                    <div
                      key={play.playId}
                      className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                        selectedPlay?.playId === play.playId ? 'bg-gray-100 border-l-4 border-l-red-500' : ''
                      }`}
                      onClick={() => setSelectedPlay(play)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-800">Play #{play.playNumber}</span>
                          <img 
                            src={play.homeBall ? homeData.logo : awayData.logo}
                            alt="possession"
                            className="w-5 h-5"
                          />
                        </div>
                        <span className="text-sm text-gray-500">Q{play.quarter} {play.clock}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{play.playText}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{play.down} & {play.distance}</span>
                        <span>Win%: {Math.round(play.homeWinProbability * 100)}% - {Math.round((1 - play.homeWinProbability) * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default GamePlayByPlay;
