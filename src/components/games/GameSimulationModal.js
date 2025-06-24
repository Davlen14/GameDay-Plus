import React, { useState, useEffect } from 'react';
import FootballField from './FootballField';
import WinProbabilityChart from './WinProbabilityChart';

const GameSimulationModal = ({ 
  isOpen, 
  onClose, 
  homeTeam, 
  awayTeam, 
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
    if (isPlaying && currentPlayIndex < plays.length - 1) {
      interval = setInterval(() => {
        setCurrentPlayIndex(prev => {
          if (prev >= plays.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentPlayIndex, plays.length, playbackSpeed]);

  const currentPlay = plays[currentPlayIndex];
  const currentWinProb = winProbabilityData[currentPlayIndex];

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
    if (currentPlayIndex < plays.length - 1) {
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

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl w-full max-w-7xl h-full max-h-[95vh] flex flex-col transform transition-transform duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-white">Game Simulation</h2>
            <div className="flex items-center space-x-2 text-gray-300">
              <span className="text-sm">Play {currentPlayIndex + 1} of {plays.length}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Panel - Football Field and Controls */}
          <div className="lg:w-2/3 flex flex-col">
            
            {/* Football Field */}
            <div className="flex-1 p-4">
              <div className="h-full bg-gradient-to-br from-green-900 to-green-800 rounded-lg">
                <FootballField homeTeam={homeTeam} awayTeam={awayTeam} />
              </div>
            </div>

            {/* Playback Controls */}
            <div className="p-6 border-t border-gray-700">
              <div className="flex items-center justify-center space-x-6">
                
                {/* Previous Button */}
                <button
                  onClick={handlePrevious}
                  disabled={currentPlayIndex === 0}
                  className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Play/Pause Button */}
                <button
                  onClick={handlePlayPause}
                  className="p-4 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors"
                >
                  {isPlaying ? (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {/* Next Button */}
                <button
                  onClick={handleNext}
                  disabled={currentPlayIndex === plays.length - 1}
                  className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Speed Controls */}
              <div className="flex items-center justify-center space-x-4 mt-4">
                <span className="text-gray-400 text-sm">Speed:</span>
                {[0.5, 1, 1.5, 2].map(speed => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      playbackSpeed === speed 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentPlayIndex + 1) / plays.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Game Info and Charts */}
          <div className="lg:w-1/3 flex flex-col border-l border-gray-700">
            
            {/* Current Play Info */}
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Current Play</h3>
              
              {currentPlay && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getPlayTypeIcon(currentPlay.type)}</span>
                    <div>
                      <div className="text-white font-medium">{currentPlay.type || 'Play'}</div>
                      <div className="text-gray-400 text-sm">
                        {currentPlay.period && `Q${currentPlay.period}`} {formatTime(currentPlay.clock)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-gray-300 text-sm">
                    <div>{currentPlay.down && `${currentPlay.down} & ${currentPlay.distance}`}</div>
                    <div>{currentPlay.yardLine && `${currentPlay.yardLine}`}</div>
                  </div>
                  
                  {currentPlay.text && (
                    <div className="text-gray-300 text-sm bg-gray-800 p-3 rounded">
                      {currentPlay.text}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Win Probability Chart */}
            <div className="flex-1 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Win Probability</h3>
              
              {currentWinProb && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">{awayTeam?.school || 'Away'}</span>
                    <span className="text-gray-400">{homeTeam?.school || 'Home'}</span>
                  </div>
                  <div className="flex h-8 bg-gray-700 rounded overflow-hidden">
                    <div 
                      className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(1 - (currentWinProb.homeWinPercentage || 0.5)) * 100}%` }}
                    >
                      {Math.round((1 - (currentWinProb.homeWinPercentage || 0.5)) * 100)}%
                    </div>
                    <div 
                      className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(currentWinProb.homeWinPercentage || 0.5) * 100}%` }}
                    >
                      {Math.round((currentWinProb.homeWinPercentage || 0.5) * 100)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Mini Win Probability Chart */}
              <div className="h-64 bg-gray-800 rounded p-2">
                {winProbabilityData.length > 0 && (
                  <WinProbabilityChart 
                    data={winProbabilityData.slice(0, currentPlayIndex + 1)}
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                    currentPlayIndex={currentPlayIndex}
                  />
                )}
              </div>
            </div>

            {/* Game Score */}
            <div className="p-6 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="text-gray-400 text-sm">{awayTeam?.school || 'Away'}</div>
                  <div className="text-2xl font-bold text-white">
                    {currentPlay?.awayScore || 0}
                  </div>
                </div>
                <div className="text-gray-500">vs</div>
                <div className="text-center">
                  <div className="text-gray-400 text-sm">{homeTeam?.school || 'Home'}</div>
                  <div className="text-2xl font-bold text-white">
                    {currentPlay?.homeScore || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSimulationModal;
