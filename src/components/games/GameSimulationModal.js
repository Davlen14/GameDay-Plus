import React, { useState, useEffect } from 'react';
import FootballField from './FootballField';
import WinProbabilityChart from './WinProbabilityChart';

const GameSimulationModal = ({ 
  isOpen, 
  onClose, 
  homeTeam, 
  awayTeam,
  homeData,
  awayData, 
  plays = [], 
  drives = [],
  winProbabilityData = []
}) => {
  const [currentPlayIndex, setCurrentPlayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentPlayIndex(0);
      setIsPlaying(false);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval;
    if (isPlaying && plays && currentPlayIndex < plays.length - 1) {
      interval = setInterval(() => {
        setCurrentPlayIndex(prev => {
          if (!plays || prev >= plays.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentPlayIndex, plays, playbackSpeed]);

  const currentPlay = plays && plays.length > 0 ? plays[currentPlayIndex] : null;
  const currentWinProb = winProbabilityData && winProbabilityData.length > 0 ? winProbabilityData[currentPlayIndex] : null;

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    if (currentPlayIndex > 0) {
      setCurrentPlayIndex(currentPlayIndex - 1);
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (plays && currentPlayIndex < plays.length - 1) {
      setCurrentPlayIndex(currentPlayIndex + 1);
      setIsPlaying(false);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
  };

  const formatTime = (clock) => {
    if (!clock) return '--:--';
    const minutes = Math.floor(clock.minutes || 0);
    const seconds = Math.floor(clock.seconds || 0);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPlayTypeIcon = (playType) => {
    switch (playType?.toLowerCase()) {
      case 'rush':
      case 'rushing':
        return '🏃';
      case 'pass':
      case 'passing':
        return '🏈';
      case 'punt':
        return '🦶';
      case 'field goal':
      case 'fieldgoal':
        return '🥅';
      case 'kickoff':
        return '⚡';
      default:
        return '🏈';
    }
  };

  // Determine possession for logo display
  const getPossessingTeam = () => {
    if (!currentPlay) return null;
    // Check various possession indicators
    if (currentPlay.offense === homeTeam?.school || currentPlay.offense_team === homeTeam?.school) {
      return 'home';
    } else if (currentPlay.offense === awayTeam?.school || currentPlay.offense_team === awayTeam?.school) {
      return 'away';
    }
    // Default based on play direction or other indicators
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white rounded-xl shadow-2xl w-full max-w-6xl flex flex-col transform transition-transform duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`} style={{ maxHeight: '90vh' }}>
        
        {/* Compact Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">Game Simulation</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Play {currentPlayIndex + 1} of {plays ? plays.length : 0}</span>
              <span className="text-lg font-semibold">
                {currentPlay?.awayScore || 0} - {currentPlay?.homeScore || 0}
              </span>
              <span>{currentPlay?.period && `Q${currentPlay.period}`} {formatTime(currentPlay.clock)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            
            {/* Football Field with Possession Logo */}
            <div className="relative">
              <FootballField 
                homeTeam={homeTeam} 
                awayTeam={awayTeam}
                currentPlay={currentPlay}
                possessingTeam={getPossessingTeam()}
              />
              
              {/* Overlay Play Info */}
              <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{getPlayTypeIcon(currentPlay?.playType || currentPlay?.type)}</span>
                  <div>
                    <div className="text-sm font-medium">{currentPlay?.playType || currentPlay?.type || 'Play'}</div>
                    <div className="text-xs text-gray-600">
                      {currentPlay?.down && `${currentPlay.down} & ${currentPlay.distance}`} • {currentPlay?.yardLine}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Play Controls - Directly under field */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handlePrevious}
                disabled={currentPlayIndex === 0}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={handlePlayPause}
                className="p-3 rounded-full bg-gradient-to-r from-red-600 via-red-700 to-red-600 hover:from-red-700 hover:via-red-800 hover:to-red-700 transition-all"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleNext}
                disabled={!plays || currentPlayIndex === plays.length - 1}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Speed Controls */}
              <div className="flex items-center space-x-2 ml-4">
                <span className="text-gray-400 text-sm">Speed:</span>
                {[0.5, 1, 1.5, 2].map(speed => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      playbackSpeed === speed 
                        ? 'bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${plays && plays.length > 0 ? ((currentPlayIndex + 1) / plays.length) * 100 : 0}%` }}
              ></div>
            </div>

            {/* Win Probability Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Win Probability</h3>
                {currentWinProb && (
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <img 
                        src={awayTeam?.logos?.[0]?.href || '/api/placeholder/30/30'} 
                        alt={awayTeam?.school}
                        className="w-6 h-6 object-contain"
                      />
                      <span style={{ color: awayTeam?.color || '#000' }} className="font-medium">
                        {Math.round((1 - (currentWinProb.homeWinProbability || 0.5)) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <img 
                        src={homeTeam?.logos?.[0]?.href || '/api/placeholder/30/30'} 
                        alt={homeTeam?.school}
                        className="w-6 h-6 object-contain"
                      />
                      <span style={{ color: homeTeam?.color || '#000' }} className="font-medium">
                        {Math.round((currentWinProb.homeWinProbability || 0.5) * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Win Probability Bar */}
              {currentWinProb && (
                <div className="flex h-8 bg-gray-200 rounded overflow-hidden mb-4">
                  <div 
                    className="flex items-center justify-center text-white text-xs font-medium transition-all duration-300"
                    style={{ 
                      width: `${(1 - (currentWinProb.homeWinProbability || 0.5)) * 100}%`,
                      backgroundColor: awayTeam?.color || '#4B5563'
                    }}
                  >
                    {Math.round((1 - (currentWinProb.homeWinProbability || 0.5)) * 100)}%
                  </div>
                  <div 
                    className="flex items-center justify-center text-white text-xs font-medium transition-all duration-300"
                    style={{ 
                      width: `${(currentWinProb.homeWinProbability || 0.5) * 100}%`,
                      backgroundColor: homeTeam?.color || '#DC2626'
                    }}
                  >
                    {Math.round((currentWinProb.homeWinProbability || 0.5) * 100)}%
                  </div>
                </div>
              )}

              {/* Win Probability Chart */}
              <div className="h-48 bg-white rounded p-2">
                {winProbabilityData && winProbabilityData.length > 0 && (
                  <WinProbabilityChart 
                    winProbData={winProbabilityData.slice(0, currentPlayIndex + 1)}
                    homeData={homeData}
                    awayData={awayData}
                    homeColor={homeTeam?.color}
                    awayColor={awayTeam?.color}
                    homeLogos={homeTeam?.logos}
                    awayLogos={awayTeam?.logos}
                    selectedPlay={currentPlay}
                    setSelectedPlay={() => {}}
                    setSimulationPlay={() => {}}
                    setShowSimulationModal={() => {}}
                    compact={true}
                  />
                )}
              </div>
            </div>

            {/* Play Description */}
            {(currentPlay?.playText || currentPlay?.text) && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-700">{currentPlay.playText || currentPlay.text}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSimulationModal;