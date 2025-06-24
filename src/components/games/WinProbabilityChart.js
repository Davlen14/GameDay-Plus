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
      <div className="bg-gray-50 rounded-xl p-8 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Win Probability</h3>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No play data available to display chart</p>
        </div>
      </div>
    );
  }

  const maxX = Math.max(100, winProbData.length);
  const chartWidth = 100 - 15; // Available width percentage after Y-axis labels (reduced from 40 to 15)

  return (
    <div className="bg-gray-50 rounded-xl p-8 mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Win Probability</h3>
      
      {/* Chart Container */}
      <div className="relative h-[500px] bg-white rounded-lg p-8 mb-6 overflow-hidden border border-gray-200 shadow-sm">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Background Grid - Horizontal lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <g key={`h-${y}`}>
              <line
                x1="8"
                y1={100 - y}
                x2="98"
                y2={100 - y}
                stroke="#e5e7eb"
                strokeWidth="0.2"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x="5"
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
              x1={8 + (chartWidth * playNum) / maxX}
              y1="5"
              x2={8 + (chartWidth * playNum) / maxX}
              y2="95"
              stroke="#f3f4f6"
              strokeWidth="0.1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          
          {/* Home team win probability area fill */}
          <path
            d={`M 8 100 ${winProbData.map((play, index) => {
              const x = 8 + (chartWidth * play.playNumber) / maxX;
              const y = 100 - (play.homeWinProbability * 95);
              return `L ${x} ${y}`;
            }).join(' ')} L ${8 + (chartWidth * winProbData.length) / maxX} 100 Z`}
            fill={`url(#homeGradient)`}
            opacity="0.3"
          />

          {/* Away team win probability area fill */}
          <path
            d={`M 8 0 ${winProbData.map((play, index) => {
              const x = 8 + (chartWidth * play.playNumber) / maxX;
              const y = 100 - ((1 - play.homeWinProbability) * 95);
              return `L ${x} ${y}`;
            }).join(' ')} L ${8 + (chartWidth * winProbData.length) / maxX} 0 Z`}
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
              const x = 8 + (chartWidth * play.playNumber) / maxX;
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
              const x = 8 + (chartWidth * play.playNumber) / maxX;
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
            const x = 8 + (chartWidth * play.playNumber) / maxX;
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
                 left: `${8 + (chartWidth * hoveredPlay.playNumber) / maxX}%`,
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div 
                className="w-6 h-2 rounded"
                style={{ backgroundColor: homeData.primaryColor }}
              ></div>
              <img src={homeData.logo} alt={homeData.name} className="w-5 h-5 object-contain" />
            </div>
            <span className="text-base text-gray-600 font-medium">{homeData.name}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div 
                className="w-6 h-2 border-dashed border-t-2 rounded"
                style={{ borderColor: awayData.primaryColor }}
              ></div>
              <img src={awayData.logo} alt={awayData.name} className="w-5 h-5 object-contain" />
            </div>
            <span className="text-base text-gray-600 font-medium">{awayData.name}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
            <span className="text-base text-gray-600 font-medium">Score Change</span>
          </div>
        </div>
        
        {/* Play Count */}
        <div className="text-base text-gray-600">
          Total Plays: <span className="font-semibold text-gray-900 text-lg">{winProbData.length}</span>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-2">Hover points for details • Click to view on field • Yellow points indicate scoring plays</p>
    </div>
  );
};

export default WinProbabilityChart;
