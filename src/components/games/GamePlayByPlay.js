import React, { useEffect, useState, useRef } from 'react';
import { playService } from '../../services/playService';
import { driveService } from '../../services/driveService';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const GamePlayByPlay = ({ game, awayTeam, homeTeam }) => {
  const [animateField, setAnimateField] = useState(false);
  const [winProbData, setWinProbData] = useState([]);
  const [selectedPlay, setSelectedPlay] = useState(null);
  const [hoveredPlay, setHoveredPlay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  
  const chartRef = useRef(null);

  // Get team data with fallbacks
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

  const homeRgb = hexToRgb(homeData.primaryColor);
  const awayRgb = hexToRgb(awayData.primaryColor);
  const homeColorRgb = `${homeRgb.r}, ${homeRgb.g}, ${homeRgb.b}`;
  const awayColorRgb = `${awayRgb.r}, ${awayRgb.g}, ${awayRgb.b}`;

  useEffect(() => {
    const timer = setTimeout(() => setAnimateField(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    loadWinProbability();
  }, [game]);

  const loadWinProbability = async () => {
    if (!game) {
      setError('No game data provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Load win probability data - adjust this based on your API
      const data = await playService.getWinProbability(game.id);
      setWinProbData(data || []);
      
      if (data && data.length > 0) {
        setSelectedPlay(data[data.length - 1]); // Select last play by default
      }
    } catch (error) {
      console.error('Error loading win probability data:', error);
      setError('Failed to load play data');
    } finally {
      setLoading(false);
    }
  };

  const ordinalString = (number) => {
    switch (number) {
      case 1: return '1st';
      case 2: return '2nd';
      case 3: return '3rd';
      case 4: return '4th';
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

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false, // We'll use custom tooltip
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          },
          font: {
            size: 10,
          },
        },
      },
    },
    onHover: (event, activeElements) => {
      if (activeElements.length > 0) {
        const dataIndex = activeElements[0].index;
        setHoveredPlay(winProbData[dataIndex]);
      } else {
        setHoveredPlay(null);
      }
    },
    onClick: (event, activeElements) => {
      if (activeElements.length > 0) {
        const dataIndex = activeElements[0].index;
        setSelectedPlay(winProbData[dataIndex]);
      }
    },
  };

  const chartData = {
    labels: winProbData.map(play => play.playNumber),
    datasets: [
      {
        label: homeData.name,
        data: winProbData.map(play => play.homeWinProbability * 100),
        borderColor: homeData.primaryColor,
        backgroundColor: homeData.primaryColor + '20',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        tension: 0.1,
      },
    ],
  };

  // Get last play for live indicator
  const lastPlay = winProbData[winProbData.length - 1];

  return (
    <div className="w-full">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&family=Titillium+Web:wght@200;300;400;600;700;900&display=swap');

        .orbitron-font {
          font-family: 'Orbitron', sans-serif;
        }

        .football-field {
          position: relative;
          border: 4px solid #ffffff;
          border-radius: 16px;
          box-shadow: 
            0 30px 60px rgba(0, 0, 0, 0.3),
            0 15px 30px rgba(0, 0, 0, 0.2),
            inset 0 0 0 2px rgba(255, 255, 255, 0.1);
          display: flex;
          width: 100%;
          max-width: 1200px;
          aspect-ratio: 16 / 9;
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
          width: 10%;
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

        .yard-line {
          position: absolute;
          width: 2px;
          height: 100%;
          background: rgba(255, 255, 255, 0.8);
          top: 0;
          box-shadow: 
            0 0 6px rgba(255, 255, 255, 0.6),
            inset 0 0 2px rgba(255, 255, 255, 0.8);
          z-index: 5;
        }

        .yard-number {
          position: absolute;
          color: #ffffff;
          font-family: "Orbitron", sans-serif;
          font-weight: 600;
          font-size: 13px;
          user-select: none;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
          z-index: 6;
        }

        .yard-number.top {
          top: 15%;
        }

        .yard-number.bottom {
          bottom: 15%;
          transform: rotate(180deg);
        }

        .center-logo {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: min(18vw, 90px);
          height: min(18vw, 90px);
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
        }

        .center-logo img {
          width: 75%;
          height: 75%;
          object-fit: contain;
          padding: 5px;
        }

        .hash-mark {
          position: absolute;
          width: 1px;
          height: 5px;
          background: rgba(255, 255, 255, 0.8);
          z-index: 3;
        }

        .hash-mark.top {
          top: 30%;
        }

        .hash-mark.bottom {
          bottom: 30%;
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

        .win-prob-tooltip {
          position: absolute;
          background: white;
          border-radius: 8px;
          padding: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          pointer-events: none;
          z-index: 1000;
          min-width: 200px;
        }

        .simulation-button {
          background: linear-gradient(
            to right,
            rgba(204, 0, 28, 1),
            rgba(161, 0, 20, 1),
            rgba(115, 0, 13, 1),
            rgba(161, 0, 20, 1),
            rgba(204, 0, 28, 1)
          );
          transition: all 0.3s ease;
        }

        .simulation-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(204, 0, 28, 0.3);
        }
      `}</style>

      <div className="flex flex-col gap-6 p-4 orbitron-font">
        {/* Game Header */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-4 flex-1">
            <img 
              src={homeData.logo} 
              alt={homeData.name} 
              className="w-12 h-12 object-contain"
              onError={(e) => { e.target.src = '/photos/Whitmer.png'; }}
            />
            <div className="text-center">
              <p className="text-sm font-medium">{homeData.name}</p>
              <p className="text-2xl font-bold">{game.home_points || 0}</p>
            </div>
          </div>
          
          <div className="text-center px-4">
            <p className="text-xs font-semibold text-gray-500">
              {game.status === 'completed' ? 'FINAL' : 'LIVE'}
            </p>
            <p className="text-xs text-gray-400">Play-by-Play</p>
          </div>
          
          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="text-center">
              <p className="text-sm font-medium">{awayData.name}</p>
              <p className="text-2xl font-bold">{game.away_points || 0}</p>
            </div>
            <img 
              src={awayData.logo} 
              alt={awayData.name} 
              className="w-12 h-12 object-contain"
              onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
            />
          </div>
        </div>

        {/* Football Field */}
        <div className="flex flex-col items-center gap-3">
          <div className="football-field">
            {/* Away Team End Zone */}
            <div className="endzone away-endzone">
              <img 
                src={awayData.logo} 
                alt={awayData.name}
                className="w-3/4 h-3/4 object-contain opacity-30"
                onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
              />
            </div>

            {/* Main Field */}
            <div className="main-field" id="mainField">
              {/* Yard Lines and Numbers */}
              {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(yardMark => {
                const percentage = yardMark / 100;
                let displayNum = yardMark <= 50 ? yardMark : 100 - yardMark;

                return (
                  <div key={yardMark}>
                    <div 
                      className="yard-line"
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
              {Array.from({ length: 21 }, (_, i) => i * 5).map(hashMark => (
                <React.Fragment key={hashMark}>
                  <div 
                    className="hash-mark top"
                    style={{ left: `${hashMark}%` }}
                  />
                  <div 
                    className="hash-mark bottom"
                    style={{ left: `${hashMark}%` }}
                  />
                </React.Fragment>
              ))}

              {/* Center Logo */}
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
              <img 
                src={homeData.logo} 
                alt={homeData.name}
                className="w-3/4 h-3/4 object-contain opacity-30"
                onError={(e) => { e.target.src = '/photos/Whitmer.png'; }}
              />
            </div>

            {/* Field Shadow */}
            <div className="field-shadow"></div>
          </div>

          {/* Live Game Indicator */}
          {game.status !== 'completed' && lastPlay && (
            <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-2 shadow-sm">
              <div className="relative">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-bold">{lastPlay.homeScore} - {lastPlay.awayScore}</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: lastPlay.homeBall ? homeData.primaryColor : awayData.primaryColor }}
                  ></div>
                  <span className="text-gray-600">
                    {lastPlay.homeBall ? homeData.name : awayData.name}
                  </span>
                </div>
                <span className="text-gray-500">
                  {ordinalString(lastPlay.down)} & {lastPlay.distance} at {formatYardLine(lastPlay.yardLine, lastPlay.homeBall)}
                </span>
              </div>
            </div>
          )}

          {/* View Game Simulation Button */}
          <button
            onClick={() => setShowSimulationModal(true)}
            disabled={loading || winProbData.length === 0}
            className="simulation-button w-full max-w-md py-3 px-6 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
            </svg>
            View Game Simulation
          </button>
        </div>

        {/* Win Probability Chart */}
        {!loading && winProbData.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Win Probability</h2>
            
            <div className="relative h-64 mb-4">
              <Line ref={chartRef} options={chartOptions} data={chartData} />
              
              {/* Custom Tooltip */}
              {hoveredPlay && (
                <div 
                  className="win-prob-tooltip"
                  style={{
                    // Position tooltip near the hovered point
                    left: '50%',
                    top: '20px',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">Play #{hoveredPlay.playNumber}</span>
                      <div className="flex items-center gap-1">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: hoveredPlay.homeBall ? homeData.primaryColor : awayData.primaryColor }}
                        ></div>
                        <span style={{ color: hoveredPlay.homeBall ? homeData.primaryColor : awayData.primaryColor }}>
                          {hoveredPlay.homeBall ? homeData.name : awayData.name}
                        </span>
                      </div>
                    </div>
                    <div className="border-t pt-1 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Win%:</span>
                        <span className="font-medium">
                          {Math.round(hoveredPlay.homeWinProbability * 100)}% - {Math.round((1 - hoveredPlay.homeWinProbability) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Score:</span>
                        <span className="font-medium">{hoveredPlay.homeScore} - {hoveredPlay.awayScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Down:</span>
                        <span className="font-medium">{ordinalString(hoveredPlay.down)} & {hoveredPlay.distance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chart Legend */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: homeData.primaryColor }}
                ></div>
                <span className="text-gray-600">{homeData.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: awayData.primaryColor }}
                ></div>
                <span className="text-gray-600">{awayData.name}</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">Tap or hover on chart to see play details</p>
          </div>
        )}

        {/* Selected Play Details */}
        {selectedPlay && (
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">Play #{selectedPlay.playNumber}</h3>
              <span 
                className="text-xs px-2 py-1 rounded-full"
                style={{ 
                  backgroundColor: selectedPlay.homeBall ? homeData.primaryColor + '20' : awayData.primaryColor + '20',
                  color: selectedPlay.homeBall ? homeData.primaryColor : awayData.primaryColor
                }}
              >
                {selectedPlay.homeBall ? homeData.name : awayData.name}
              </span>
            </div>
            
            <p className="text-gray-700 mb-4">{selectedPlay.playText}</p>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Down & Distance</p>
                <p className="text-sm font-medium">{ordinalString(selectedPlay.down)} & {selectedPlay.distance}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Field Position</p>
                <p className="text-sm font-medium">{formatYardLine(selectedPlay.yardLine, selectedPlay.homeBall)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Score</p>
                <p className="text-sm font-medium">{selectedPlay.homeScore} - {selectedPlay.awayScore}</p>
              </div>
            </div>
            
            {/* Win probability bars */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs w-16">{homeData.name}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${selectedPlay.homeWinProbability * 100}%`,
                      backgroundColor: homeData.primaryColor
                    }}
                  ></div>
                </div>
                <span className="text-xs font-medium w-10 text-right">
                  {Math.round(selectedPlay.homeWinProbability * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs w-16">{awayData.name}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${(1 - selectedPlay.homeWinProbability) * 100}%`,
                      backgroundColor: awayData.primaryColor
                    }}
                  ></div>
                </div>
                <span className="text-xs font-medium w-10 text-right">
                  {Math.round((1 - selectedPlay.homeWinProbability) * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading game data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        )}
      </div>

      {/* Game Simulation Modal */}
      {showSimulationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Game Simulation</h2>
                <button
                  onClick={() => setShowSimulationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Add your game simulation content here */}
              <p className="text-gray-600">Game simulation feature coming soon...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePlayByPlay;