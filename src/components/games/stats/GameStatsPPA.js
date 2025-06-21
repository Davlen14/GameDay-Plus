import React, { useState, useEffect } from 'react';

const GameStatsPPA = ({ 
  game, 
  gamePPA, 
  playerGamePPA, 
  selectedPPASection, 
  setSelectedPPASection, 
  awayColor, 
  homeColor,
  awayColorRgb,
  homeColorRgb,
  animateCards 
}) => {
  const [showingHome, setShowingHome] = useState(true);
  const [animateChart, setAnimateChart] = useState(false);
  const [showingPPAInfo, setShowingPPAInfo] = useState(false);

  useEffect(() => {
    if (animateCards) {
      setTimeout(() => setAnimateChart(true), 300);
    }
  }, [animateCards]);

  // Extract team-specific PPA data
  const getTeamPPA = (isHome) => {
    if (!gamePPA || !gamePPA.offense || !gamePPA.defense) return null;
    
    const teamName = isHome ? game.home_team : game.away_team;
    
    // Look for team-specific PPA data in the response
    if (Array.isArray(gamePPA)) {
      return gamePPA.find(ppa => ppa.team === teamName);
    }
    
    // If single object, assume it contains data for both teams
    return gamePPA;
  };

  const currentTeamPPA = getTeamPPA(showingHome);

  // PPA performance assessment
  const getPerformanceColor = (value) => {
    if (value >= 1.0) return '#10B981'; // Green - Excellent
    if (value >= 0.5) return '#F59E0B'; // Yellow - Good  
    if (value >= -0.5) return '#F97316'; // Orange - Average
    if (value >= -1.0) return '#EF4444'; // Red - Poor
    return '#7C2D12'; // Dark Red - Very Poor
  };

  const getPerformanceRating = (value) => {
    if (value >= 1.0) return 'ELITE';
    if (value >= 0.5) return 'GOOD'; 
    if (value >= -0.5) return 'AVERAGE';
    if (value >= -1.0) return 'POOR';
    return 'VERY POOR';
  };

  const getPerformanceAssessment = (stats) => {
    if (!stats) return '';
    
    const overallPPA = stats.overall || 0;
    const teamAbbr = showingHome ? (game.home_team || 'HOME') : (game.away_team || 'AWAY');
    
    if (overallPPA >= 1.0) {
      return `${teamAbbr} had an elite ${selectedPPASection.toLowerCase()} performance`;
    } else if (overallPPA >= 0.5) {
      return `${teamAbbr} played well on ${selectedPPASection.toLowerCase()}`;
    } else if (overallPPA >= -0.5) {
      return `${teamAbbr} had an average ${selectedPPASection.toLowerCase()} showing`;
    } else {
      return `${teamAbbr} struggled on ${selectedPPASection.toLowerCase()}`;
    }
  };

  // Modern Team Toggle
  const TeamToggle = () => (
    <div className="flex space-x-3">
      <button
        onClick={() => setShowingHome(false)}
        className={`
          flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2
          ${!showingHome 
            ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }
        `}
      >
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: awayColor }}
        ></div>
        <span>{game.away_team}</span>
      </button>
      
      <button
        onClick={() => setShowingHome(true)}
        className={`
          flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2
          ${showingHome 
            ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }
        `}
      >
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: homeColor }}
        ></div>
        <span>{game.home_team}</span>
      </button>
    </div>
  );

  // Performance Type Toggle
  const PerformanceToggle = () => (
    <div className="flex space-x-3">
      {['overall', 'passing', 'rushing'].map((section) => (
        <button
          key={section}
          onClick={() => setSelectedPPASection(section)}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all duration-200 capitalize
            ${selectedPPASection === section 
              ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
        >
          {section}
        </button>
      ))}
    </div>
  );

  // PPA Metric Card
  const PPAMetricCard = ({ title, value, icon, description }) => {
    const color = getPerformanceColor(value);
    const rating = getPerformanceRating(value);
    
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <i className={`fas fa-${icon} text-gray-600`}></i>
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          <div 
            className="px-2 py-1 rounded text-xs font-medium text-white"
            style={{ backgroundColor: color }}
          >
            {rating}
          </div>
        </div>
        
        <div className="flex items-baseline space-x-2 mb-2">
          <span 
            className="text-2xl font-bold"
            style={{ color }}
          >
            {value >= 0 ? '+' : ''}{value.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">PPA</span>
        </div>
        
        <p className="text-xs text-gray-600">{description}</p>
        
        {/* Visual indicator */}
        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: animateChart ? `${Math.min(Math.max((value + 2) / 4 * 100, 0), 100)}%` : '0%',
              backgroundColor: color
            }}
          />
        </div>
      </div>
    );
  };

  // Top PPA Players
  const TopPPAPlayers = () => {
    if (!playerGamePPA || playerGamePPA.length === 0) return null;

    const teamName = showingHome ? game.home_team : game.away_team;
    const teamPlayers = playerGamePPA
      .filter(player => player.team === teamName)
      .sort((a, b) => (b.averagePPA?.all || 0) - (a.averagePPA?.all || 0))
      .slice(0, 3);

    if (teamPlayers.length === 0) return null;

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <i className="fas fa-star mr-2 text-yellow-500"></i>
          Top PPA Performers
        </h4>
        
        <div className="space-y-3">
          {teamPlayers.map((player, index) => (
            <div key={player.id || index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: showingHome ? homeColor : awayColor }}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{player.name}</p>
                  <p className="text-sm text-gray-500">{player.position}</p>
                </div>
              </div>
              
              <div className="text-right">
                <span 
                  className="font-bold"
                  style={{ 
                    color: getPerformanceColor(player.averagePPA?.all || 0) 
                  }}
                >
                  {(player.averagePPA?.all || 0) >= 0 ? '+' : ''}
                  {(player.averagePPA?.all || 0).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // PPA Info Modal Content
  const PPAInfoContent = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">About PPA</h3>
          <button
            onClick={() => setShowingPPAInfo(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold mb-2">What is PPA?</h4>
            <p>
              Predicted Points Added (PPA) measures the value of individual plays by calculating 
              how much they increase or decrease a team's expected points on a drive.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Performance Scale</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>+1.0 and above: Elite</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>+0.5 to +1.0: Good</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>-0.5 to +0.5: Average</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Below -0.5: Poor</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Why It Matters</h4>
            <p>
              PPA provides context beyond traditional stats by measuring efficiency and 
              impact in game situations. Higher PPA indicates more effective play calling and execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!currentTeamPPA && (!playerGamePPA || playerGamePPA.length === 0)) {
    return (
      <div 
        className={`
          bg-white rounded-2xl shadow-lg border border-gray-100 p-8
          transition-all duration-700 ease-out delay-400
          ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        <div className="text-center">
          <i className="fas fa-chart-line text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            PPA Analytics Unavailable
          </h3>
          <p className="text-gray-500">
            Advanced analytics data not found for this game.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className={`
          bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg border border-gray-200 overflow-hidden
          transition-all duration-700 ease-out delay-400
          ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-brain text-lg"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold">Advanced Analytics</h3>
                <p className="text-blue-100 text-sm">Predicted Points Added (PPA)</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowingPPAInfo(true)}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <i className="fas fa-info text-sm"></i>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Team Selection */}
          <div className="mb-6">
            <TeamToggle />
          </div>

          {/* Performance Type Selection */}
          <div className="mb-6">
            <PerformanceToggle />
          </div>

          {/* Performance Assessment */}
          {currentTeamPPA && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 font-medium">
                {getPerformanceAssessment(currentTeamPPA[selectedPPASection] || currentTeamPPA.offense)}
              </p>
            </div>
          )}

          {/* PPA Metrics */}
          {currentTeamPPA && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <PPAMetricCard
                title="Overall"
                value={currentTeamPPA.offense?.overall || 0}
                icon="chart-line"
                description="Total predicted points added per play"
              />
              <PPAMetricCard
                title="Passing"
                value={currentTeamPPA.offense?.passing || 0}
                icon="paper-plane"
                description="Efficiency in the passing game"
              />
              <PPAMetricCard
                title="Rushing"
                value={currentTeamPPA.offense?.rushing || 0}
                icon="running"
                description="Ground game effectiveness"
              />
            </div>
          )}

          {/* Top Performers */}
          <TopPPAPlayers />
        </div>
      </div>

      {/* PPA Info Modal */}
      {showingPPAInfo && <PPAInfoContent />}
    </>
  );
};

export default GameStatsPPA;
