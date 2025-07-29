import React from 'react';

const OverviewTab = ({ team, primaryTeamColor }) => {
  const teamRgb = primaryTeamColor ? hexToRgb(primaryTeamColor) : { r: 220, g: 38, b: 38 };
  const teamColorRgb = `${teamRgb.r}, ${teamRgb.g}, ${teamRgb.b}`;

  // Convert hex to RGB for CSS
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 220, g: 38, b: 38 };
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <h2 
          className="text-3xl font-black mb-2"
          style={{ 
            fontFamily: 'Orbitron, sans-serif',
            color: primaryTeamColor,
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {team.school.toUpperCase()} OVERVIEW
        </h2>
        <p className="text-gray-600 font-medium">Team Information & Quick Stats</p>
      </div>

      {/* Team Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* School Info */}
        <div 
          className="bg-white rounded-xl p-6 shadow-lg border-l-4"
          style={{ borderLeftColor: primaryTeamColor }}
        >
          <div className="flex items-center mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
              style={{ backgroundColor: `rgba(${teamColorRgb}, 0.1)` }}
            >
              <i className="fas fa-university text-xl" style={{ color: primaryTeamColor }}></i>
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: primaryTeamColor }}>School</h3>
            </div>
          </div>
          <p className="text-gray-700 font-medium">{team.school}</p>
          {team.mascot && (
            <p className="text-gray-600 text-sm mt-1">Mascot: {team.mascot}</p>
          )}
        </div>

        {/* Conference */}
        <div 
          className="bg-white rounded-xl p-6 shadow-lg border-l-4"
          style={{ borderLeftColor: primaryTeamColor }}
        >
          <div className="flex items-center mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
              style={{ backgroundColor: `rgba(${teamColorRgb}, 0.1)` }}
            >
              <i className="fas fa-trophy text-xl" style={{ color: primaryTeamColor }}></i>
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: primaryTeamColor }}>Conference</h3>
            </div>
          </div>
          <p className="text-gray-700 font-medium">{team.conference || 'Independent'}</p>
        </div>

        {/* Location */}
        <div 
          className="bg-white rounded-xl p-6 shadow-lg border-l-4"
          style={{ borderLeftColor: primaryTeamColor }}
        >
          <div className="flex items-center mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
              style={{ backgroundColor: `rgba(${teamColorRgb}, 0.1)` }}
            >
              <i className="fas fa-map-marker-alt text-xl" style={{ color: primaryTeamColor }}></i>
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: primaryTeamColor }}>Location</h3>
            </div>
          </div>
          <p className="text-gray-700 font-medium">{team.location || 'Unknown'}</p>
        </div>
      </div>

      {/* Team Colors */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: primaryTeamColor }}>Team Colors</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div 
              className="w-8 h-8 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: team.color || primaryTeamColor }}
            ></div>
            <span className="text-sm font-medium text-gray-700">Primary: {team.color || primaryTeamColor}</span>
          </div>
          {team.alternateColor && (
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: team.alternateColor }}
              ></div>
              <span className="text-sm font-medium text-gray-700">Alternate: {team.alternateColor}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Placeholder */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: primaryTeamColor }}>Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: primaryTeamColor }}>--</div>
            <div className="text-sm text-gray-600">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: primaryTeamColor }}>--</div>
            <div className="text-sm text-gray-600">Losses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: primaryTeamColor }}>--</div>
            <div className="text-sm text-gray-600">Ranking</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: primaryTeamColor }}>--</div>
            <div className="text-sm text-gray-600">Bowl Games</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;