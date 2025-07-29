import React from 'react';

const HistoryTab = ({ team, primaryTeamColor }) => {
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
    <div className="text-center py-20">
      <div className="mb-8">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          style={{ 
            background: `linear-gradient(135deg, rgba(${teamColorRgb}, 0.15) 0%, rgba(${teamColorRgb}, 0.05) 100%)`,
            border: `2px solid rgba(${teamColorRgb}, 0.2)`
          }}
        >
          <i 
            className="fas fa-history text-3xl font-bold filter drop-shadow-sm"
            style={{ color: primaryTeamColor }}
          ></i>
        </div>
        
        <h2 
          className="text-xl font-black mb-3"
          style={{ 
            fontFamily: 'Orbitron, sans-serif',
            color: primaryTeamColor,
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          COMING SOON
        </h2>
        
        <p className="text-sm font-medium text-gray-600 mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          In Development
        </p>
        
        <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
          {`We're working hard to bring you comprehensive history data for ${team.school}. Stay tuned for an amazing experience!`}
        </p>
      </div>
    </div>
  );
};

export default HistoryTab;