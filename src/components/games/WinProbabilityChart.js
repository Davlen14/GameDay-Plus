import React, { useState } from 'react';

const WinProbabilityChart = ({ 
  winProbData, 
  homeData, 
  awayData, 
  selectedPlay, 
  setSelectedPlay, 
  setSimulationPlay, 
  setShowSimulationModal 
}) => {
  const [hoveredPlay, setHoveredPlay] = useState(null);

  // Helper function for ordinal strings
  const ordinalString = (number) => {
    switch (number) {
      case 1: return "1st";
      case 2: return "2nd";
      case 3: return "3rd";
      case 4: return "4th";
      default: return `${number}th`;
    }
  };

  // Helper function for yard line formatting
  const formatYardLine = (yardLine, homeBall) => {
    if (yardLine <= 50) {
      return `${homeBall ? homeData.name : awayData.name} ${yardLine}`;
    } else {
      return `${!homeBall ? homeData.name : awayData.name} ${100 - yardLine}`;
    }
  };

  if (winProbData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Win Probability Chart</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No play data available to display chart</p>
        </div>
      </div>
    );
  }

  const maxX = Math.max(100, winProbData.length);
  const chartWidth = 85; // Available width percentage after Y-axis labels
  const chartHeight = 80; // Available height percentage

  return (
    <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Win Probability Chart</h3>
      
      {/* Chart Container */}
      <div className="relative h-80 bg-gray-50 rounded-lg p-4 mb-4 overflow-visible">
        <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet">
          {/* Background Grid - Horizontal lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <g key={`h-${y}`}>
              <line
                x1="60"
                y1={350 - (y * 3)}
                x2="970"
                y2={350 - (y * 3)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x="50"
                y={355 - (y * 3)}
                fontSize="12"
                fill="#6b7280"
                textAnchor="end"
                dominantBaseline="middle"
              >
                {y}%
              </text>
            </g>
          ))}

          {/* Background Grid - Vertical lines (every 10 plays) */}
          {Array.from({ length: Math.ceil(winProbData.length / 10) + 1 }, (_, i) => i * 10).map(playNum => (
            playNum <= winProbData.length && (
              <g key={`v-${playNum}`}>
                <line
                  x1={60 + (910 * playNum) / winProbData.length}
                  y1="50"
                  x2={60 + (910 * playNum) / winProbData.length}
                  y2="350"
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
                <text
                  x={60 + (910 * playNum) / winProbData.length}
                  y="370"
                  fontSize="10"
                  fill="#9ca3af"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {playNum}
                </text>
              </g>
            )
          ))}
          
          {/* Home team win probability area fill */}
          <path
            d={`M 60 350 ${winProbData.map((play, index) => {
              const x = 60 + (910 * index) / (winProbData.length - 1);
              const y = 350 - (play.homeWinProbability * 300);
              return `L ${x} ${y}`;
            }).join(' ')} L ${60 + 910} 350 Z`}
            fill={`url(#homeGradient)`}
            opacity="0.2"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="homeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={homeData.primaryColor} stopOpacity="0.4"/>
              <stop offset="100%" stopColor={homeData.primaryColor} stopOpacity="0.1"/>
            </linearGradient>
            <linearGradient id="awayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={awayData.primaryColor} stopOpacity="0.4"/>
              <stop offset="100%" stopColor={awayData.primaryColor} stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          
          {/* Home team win probability line */}
          <path
            d={winProbData.map((play, index) => {
              const x = 60 + (910 * index) / (winProbData.length - 1);
              const y = 350 - (play.homeWinProbability * 300);
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke={homeData.primaryColor}
            strokeWidth="3"
          />

          {/* Away team win probability line */}
          <path
            d={winProbData.map((play, index) => {
              const x = 60 + (910 * index) / (winProbData.length - 1);
              const y = 350 - ((1 - play.homeWinProbability) * 300);
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke={awayData.primaryColor}
            strokeWidth="2"
            strokeDasharray="5,3"
          />
          
          {/* Interactive points with team logos */}
          {winProbData.map((play, index) => {
            const x = 60 + (910 * index) / (winProbData.length - 1);
            const y = 350 - (play.homeWinProbability * 300);
            const isActive = selectedPlay?.playId === play.playId || hoveredPlay?.playId === play.playId;
            const isScoreChange = index > 0 && (play.homeScore !== winProbData[index - 1].homeScore || play.awayScore !== winProbData[index - 1].awayScore);
            
            return (
              <g key={play.playId}>
                {/* Play point */}
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 8 : isScoreChange ? 6 : 4}
                  fill={isActive ? "#fbbf24" : (play.homeBall ? homeData.primaryColor : awayData.primaryColor)}
                  stroke={isActive ? "#f59e0b" : "rgba(255,255,255,0.8)"}
                  strokeWidth={isActive ? 2 : 1}
                  className="cursor-pointer transition-all duration-200 hover:r-6"
                  onClick={() => {
                    setSelectedPlay(play);
                    setSimulationPlay(play);
                  }}
                  onMouseEnter={() => setHoveredPlay(play)}
                  onMouseLeave={() => setHoveredPlay(null)}
                />
                
                {/* Score change indicator */}
                {isScoreChange && (
                  <g>
                    <line
                      x1={x}
                      y1="60"
                      x2={x}
                      y2="340"
                      stroke="#fbbf24"
                      strokeWidth="2"
                      strokeDasharray="5,3"
                      opacity="0.6"
                    />
                    <circle
                      cx={x}
                      cy="40"
                      r="5"
                      fill="#fbbf24"
                      stroke="#f59e0b"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y="45"
                      fontSize="8"
                      fill="white"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontWeight="bold"
                    >
                      ⚡
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredPlay && (
          <div className="absolute pointer-events-none bg-white border-2 rounded-lg shadow-xl p-3 z-20 transform -translate-x-1/2 -translate-y-full transition-all duration-200"
               style={{ 
                 left: `${6 + (91 * winProbData.indexOf(hoveredPlay)) / (winProbData.length - 1)}%`,
                 top: `${15 + (85 - (hoveredPlay.homeWinProbability * 75))}%`,
                 borderColor: hoveredPlay.homeBall ? homeData.primaryColor : awayData.primaryColor,
                 maxWidth: '250px'
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
                <p className="text-xs text-gray-700 leading-relaxed">{hoveredPlay.playText.substring(0, 80)}...</p>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div 
              className="w-6 h-1 rounded"
              style={{ backgroundColor: homeData.primaryColor }}
            ></div>
            <img src={homeData.logo} alt={homeData.name} className="w-4 h-4 object-contain" />
            <span className="text-sm text-gray-600 font-medium">{homeData.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-6 h-1 border-dashed border-t-2 rounded"
              style={{ borderColor: awayData.primaryColor }}
            ></div>
            <img src={awayData.logo} alt={awayData.name} className="w-4 h-4 object-contain" />
            <span className="text-sm text-gray-600 font-medium">{awayData.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-sm text-gray-600 font-medium">Score Change</span>
          </div>
        </div>
        
        {/* Play Count */}
        <div className="text-sm text-gray-600">
          Total Plays: <span className="font-semibold text-gray-900">{winProbData.length}</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">Hover points for details • Click to view on field • ⚡ indicates scoring plays</p>
    </div>
  );
};

export default WinProbabilityChart;
