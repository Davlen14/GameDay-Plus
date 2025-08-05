import React, { useState, useEffect } from 'react';
import '../../UI/ComingSoon.css';
import { generateWillHowardQBData } from '../../../data/willHowardRealData';

// Real game data from Will Howard's performance vs Oregon (2024 - Big Ten Showdown)
const generateRealQBData = async () => {
  console.log('🏈 Loading Will Howard data from advanced box score...');
  
  try {
    const willHowardData = await generateWillHowardQBData();
    console.log('✅ Will Howard data loaded:', willHowardData);
  
    return {
      gameId: 401628515,
      playerName: willHowardData.name,
      teamInfo: {
        name: "Ohio State",
        abbreviation: "OSU",
        logoURL: "/team_logos/Ohio_State_dark.png",
        primaryColor: "#cc001c",
        secondaryColor: "#a10014"
      },
      opponentInfo: {
        name: "Oregon",
        abbreviation: "ORE", 
        logoURL: "/team_logos/oregon.png",
        primaryColor: "#154733",
        secondaryColor: "#ffd700"
      },
      stats: willHowardData.stats,
      
      // Summary data for UI display
      summary: {
        completions: willHowardData.stats.completions,
        attempts: willHowardData.stats.attempts,
        completionPercentage: willHowardData.stats.completionPercentage,
        passingYards: willHowardData.stats.passingYards,
        touchdowns: willHowardData.stats.passingTDs,
        qbRating: willHowardData.stats.qbRating,
        avgEPA: 0.41,
        successRate: 64.7,
        avgYardsPerAttempt: 9.3,
        pressureRate: 2.9,
        blitzRate: 0,
        totalDrives: 10,
        scoringDrives: 4,
        avgYardsPerDrive: 35.2
      },
      
      // Convert real pass data to expected format
      plays: willHowardData.passes.slice(0, 5).map(pass => ({
        id: `play-${pass.id}`,
        playId: `401628515-${pass.id}`,
        period: pass.quarter,
        clock: "14:49",
        down: pass.down,
        distance: pass.distance,
        yardsToGoal: 100 - pass.x,
        yardsGained: pass.yards,
        playType: pass.result,
        epa: pass.epa,
        success: pass.yards >= pass.distance,
        fieldPosition: pass.x,
        fieldZone: pass.x <= 20 ? "redzone" : pass.x <= 50 ? "own20to50" : "opp50to20",
        target: pass.receiver,
        playText: pass.playDescription,
        pressure: pass.pressure,
        blitz: false,
        driveNumber: 1
      }))
    };
  } catch (error) {
    console.error('❌ Error loading Will Howard data:', error);
    // Return fallback data if API fails
    return {
      gameId: 401628515,
      playerName: "Will Howard",
      teamInfo: {
        name: "Ohio State",
        abbreviation: "OSU",
        logoURL: "/team_logos/Ohio_State_dark.png",
        primaryColor: "#cc001c",
        secondaryColor: "#a10014"
      },
      opponentInfo: {
        name: "Oregon",
        abbreviation: "ORE", 
        logoURL: "/team_logos/oregon.png",
        primaryColor: "#154733",
        secondaryColor: "#ffd700"
      },
      stats: {
        completions: 15,
        attempts: 25,
        completionPercentage: 60.0,
        passingYards: 200,
        passingTDs: 2,
        qbRating: 85.5
      },
      summary: {
        completions: 15,
        attempts: 25,
        completionPercentage: 60.0,
        passingYards: 200,
        touchdowns: 2,
        qbRating: 85.5,
        avgEPA: 0.41,
        successRate: 64.7,
        avgYardsPerAttempt: 9.3,
        pressureRate: 2.9,
        blitzRate: 0,
        totalDrives: 10,
        scoringDrives: 4,
        avgYardsPerDrive: 35.2
      },
      plays: []
    };
  }
};

// Main component for QB heatmap analysis
const QBHeatmapField = () => {
  const [animateField, setAnimateField] = useState(false);
  const [selectedView, setSelectedView] = useState('heatMap');
  const [selectedDrive, setSelectedDrive] = useState(0);
  const [selectedPlay, setSelectedPlay] = useState(null);
  const [showingPlayDetail, setShowingPlayDetail] = useState(false);
  const [showPlayerNames, setShowPlayerNames] = useState(true);
  const [showProgressionArrows, setShowProgressionArrows] = useState(true);
  const [heatmapData] = useState(() => generateRealQBData());

  // Ohio State colors and branding
  const ohioStateData = {
    name: 'OHIO STATE',
    logo: '/team_logos/Ohio_State_dark.png',
    primaryColor: '#cc001c',
    secondaryColor: '#a10014',
    alternateColor: '#666666'
  };

  // Convert hex to RGB for CSS
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 204, g: 0, b: 28 };
  };

  const homeRgb = hexToRgb(ohioStateData.primaryColor);
  const homeColorRgb = `${homeRgb.r}, ${homeRgb.g}, ${homeRgb.b}`;

  // Computed properties
  const filteredPlays = selectedDrive === 0 ? heatmapData.plays : heatmapData.plays.filter(play => play.driveNumber === selectedDrive);
  const uniqueDrives = [...new Set(heatmapData.plays.map(play => play.driveNumber))].sort((a, b) => a - b);

  // Position calculation functions
  const calculateXPosition = (play, containerWidth) => {
    const endzoneWidth = containerWidth * 0.1;
    const fieldWidth = containerWidth * 0.8;
    const percentage = play.fieldPosition / 100;
    return endzoneWidth + (fieldWidth * percentage);
  };

  const calculateYPosition = (play, containerHeight) => {
    // Simulate field width positions based on play type and target
    const baseY = containerHeight * 0.5;
    const variation = (Math.sin(play.fieldPosition * 0.1) * containerHeight * 0.3);
    return baseY + variation;
  };

  const viewTypes = [
    { id: 'heatMap', label: 'Heat Map', icon: 'fa-fire' },
    { id: 'analytics', label: 'Analytics', icon: 'fa-chart-bar' },
    { id: 'timeline', label: 'Timeline', icon: 'fa-clock' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setAnimateField(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen" style={{
      fontFamily: 'Titillium Web, sans-serif'
    }}>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&family=Titillium+Web:wght@200;300;400;600;700;900&display=swap');

        .qb-heatmap-container {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }

        .navigation-bar {
          background: linear-gradient(135deg, rgba(${homeColorRgb}, 0.95) 0%, rgba(${homeColorRgb}, 0.85) 100%);
          color: white;
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .player-stats-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          margin-bottom: 24px;
        }

        .view-selector {
          display: flex;
          background: white;
          border-radius: 12px;
          padding: 4px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }

        .view-button {
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .view-button.active {
          background: linear-gradient(135deg, #cc001c, #a10014);
          color: white;
          transform: scale(1.02);
        }

        .view-button:not(.active) {
          color: #666;
        }

        .view-button:not(.active):hover {
          background: rgba(204, 0, 28, 0.1);
          color: #cc001c;
        }

        .drive-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
          justify-content: center;
        }

        .drive-button {
          padding: 8px 16px;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .drive-button.active {
          background: linear-gradient(135deg, #cc001c, #a10014);
          color: white;
          border-color: #cc001c;
        }

        .drive-button:not(.active):hover {
          border-color: #cc001c;
          color: #cc001c;
        }

        .football-field {
          position: relative;
          border: 3px solid #ffffff;
          border-radius: 8px;
          box-shadow: 
            0 15px 35px rgba(0, 0, 0, 0.2),
            0 5px 15px rgba(0, 0, 0, 0.15),
            inset 0 0 0 2px rgba(255, 255, 255, 0.15);
          display: flex;
          width: clamp(280px, 90vw, 900px);
          height: clamp(180px, 40vw, 400px);
          margin: 0 auto 24px;
          overflow: hidden;
          background: linear-gradient(
            135deg,
            #2d5016 0%,
            #3d6b1f 25%,
            #4a7c26 50%,
            #3d6b1f 75%,
            #2d5016 100%
          );
          transform: ${animateField ? 'scale(1)' : 'scale(0.95)'};
          opacity: ${animateField ? '1' : '0'};
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .main-field {
          flex: 1;
          position: relative;
          background: 
            linear-gradient(
              135deg,
              rgba(45, 80, 22, 0.1) 0%,
              rgba(74, 124, 38, 0.05) 50%,
              rgba(45, 80, 22, 0.1) 100%
            ),
            repeating-linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.02) 1%,
              transparent 2%
            );
        }

        .endzone {
          flex-shrink: 0;
          width: 15%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          box-shadow: 
            inset 0 0 15px rgba(0, 0, 0, 0.3),
            inset 0 0 0 1px rgba(255, 255, 255, 0.08);
          background: 
            linear-gradient(135deg, rgba(${homeColorRgb}, 0.9) 0%, rgba(${homeColorRgb}, 0.7) 50%, rgba(${homeColorRgb}, 0.9) 100%),
            repeating-linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.02) 2%,
              transparent 4%
            );
        }

        .endzone-text {
          font-family: 'Orbitron', monospace;
          font-weight: 900;
          font-size: clamp(0.5rem, 1.2vw, 0.9rem);
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          writing-mode: vertical-rl;
          text-orientation: mixed;
          letter-spacing: 2px;
        }

        .yard-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: rgba(255, 255, 255, 0.8);
          z-index: 2;
        }

        .yard-line.fifty {
          width: 4px;
          background: rgba(255, 255, 255, 0.95);
        }

        .yard-number {
          position: absolute;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          font-size: clamp(0.6rem, 1.4vw, 1rem);
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
          z-index: 3;
          user-select: none;
        }

        .yard-number.top {
          top: 8%;
        }

        .yard-number.bottom {
          bottom: 8%;
        }

        .center-logo {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 4;
        }

        .center-logo img {
          width: clamp(40px, 8vw, 80px);
          height: clamp(40px, 8vw, 80px);
          opacity: 0.4;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .play-marker {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .play-marker:hover {
          transform: scale(1.3);
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
        }

        .play-marker.completion {
          background: #10b981;
        }

        .play-marker.incompletion {
          background: #f59e0b;
        }

        .play-marker.rush {
          background: #3b82f6;
        }

        .play-marker.touchdown {
          background: #059669;
          animation: pulse 2s infinite;
        }

        .play-marker.interception {
          background: #dc2626;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 24px;
        }

        .analytics-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
        }

        .stat-item {
          text-align: center;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #cc001c;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
        }

        .play-timeline {
          max-height: 400px;
          overflow-y: auto;
          background: white;
          border-radius: 12px;
          padding: 16px;
        }

        .play-row {
          display: flex;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          background: #f8fafc;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .play-row:hover {
          background: #e2e8f0;
          transform: translateX(4px);
        }

        .play-row.selected {
          background: rgba(204, 0, 28, 0.1);
          border-left: 4px solid #cc001c;
        }
      `}</style>

      <div className="qb-heatmap-container">
        {/* Navigation Bar */}
        <div className="navigation-bar">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={heatmapData.teamInfo.logoURL} 
                alt={heatmapData.teamInfo.name}
                className="w-12 h-12 rounded-full"
                onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
              />
              <div>
                <h1 className="text-2xl font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
                  QB HEATMAP ANALYSIS
                </h1>
                <p className="text-lg opacity-90">{heatmapData.playerName} - {heatmapData.teamInfo.name}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80">Game ID</div>
              <div className="font-mono">{heatmapData.gameId}</div>
            </div>
          </div>
        </div>

        {/* Player Stats Card */}
        <div className="player-stats-card">
          <h3 className="text-xl font-bold mb-4 text-gray-800" style={{ fontFamily: 'Orbitron, monospace' }}>
            Performance Summary
          </h3>
          <div className="stat-grid">
            <div className="stat-item">
              <div className="stat-value">{heatmapData.summary.completions}/{heatmapData.summary.attempts}</div>
              <div className="stat-label">Completions</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{heatmapData.summary.completionPercentage}%</div>
              <div className="stat-label">Completion %</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{heatmapData.summary.passingYards}</div>
              <div className="stat-label">Pass Yards</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{heatmapData.summary.touchdowns}</div>
              <div className="stat-label">TDs</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{heatmapData.summary.qbRating}</div>
              <div className="stat-label">QB Rating</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{heatmapData.summary.avgEPA}</div>
              <div className="stat-label">Avg EPA</div>
            </div>
          </div>
        </div>

        {/* View Selector */}
        <div className="view-selector">
          {viewTypes.map(view => (
            <button
              key={view.id}
              className={`view-button ${selectedView === view.id ? 'active' : ''}`}
              onClick={() => setSelectedView(view.id)}
            >
              <i className={`fas ${view.icon} mr-2`}></i>
              {view.label}
            </button>
          ))}
        </div>

        {/* Drive Filter */}
        <div className="drive-filter">
          <button
            className={`drive-button ${selectedDrive === 0 ? 'active' : ''}`}
            onClick={() => setSelectedDrive(0)}
          >
            All Drives
          </button>
          {uniqueDrives.map(drive => (
            <button
              key={drive}
              className={`drive-button ${selectedDrive === drive ? 'active' : ''}`}
              onClick={() => setSelectedDrive(drive)}
            >
              Drive {drive}
            </button>
          ))}
        </div>

        {/* Main Content Based on Selected View */}
        {selectedView === 'heatMap' && (
          <HeatMapView 
            data={heatmapData}
            filteredPlays={filteredPlays}
            selectedPlay={selectedPlay}
            setSelectedPlay={setSelectedPlay}
            setShowingPlayDetail={setShowingPlayDetail}
            calculateXPosition={calculateXPosition}
            calculateYPosition={calculateYPosition}
            ohioStateData={ohioStateData}
            homeColorRgb={homeColorRgb}
            animateField={animateField}
          />
        )}

        {selectedView === 'analytics' && (
          <div className="analytics-grid">
            <AnalyticsView data={heatmapData} filteredPlays={filteredPlays} />
          </div>
        )}

        {selectedView === 'timeline' && (
          <div>
            <TimelineView data={heatmapData} filteredPlays={filteredPlays} />
          </div>
        )}
      </div>

      {/* Play Detail Modal */}
      {showingPlayDetail && selectedPlay && (
        <PlayDetailModal 
          play={selectedPlay} 
          onClose={() => setShowingPlayDetail(false)} 
        />
      )}
    </div>
  );
};

// Supporting Components

const HeatMapView = ({ 
  data, 
  filteredPlays, 
  selectedPlay, 
  setSelectedPlay, 
  setShowingPlayDetail,
  calculateXPosition,
  calculateYPosition,
  ohioStateData,
  homeColorRgb,
  animateField 
}) => {
  return (
    <div>
      {/* Field Heat Map */}
      <div className="football-field" id="football-field">
        {/* Away Team End Zone */}
        <div className="endzone">
          <span className="endzone-text">{data.opponentInfo?.name || 'OPPONENT'}</span>
        </div>

        {/* Main Field */}
        <div className="main-field" id="mainField">
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

          {/* Play Markers */}
          {filteredPlays.map((play, index) => {
            const xPos = (play.fieldPosition / 100) * 80 + 10; // 10% endzone, 80% field
            const yPos = 20 + (Math.sin(play.fieldPosition * 0.1 + index) * 30) + 30; // Distribute vertically
            
            return (
              <div
                key={play.id}
                className={`play-marker ${play.playType}`}
                style={{
                  left: `${xPos}%`,
                  top: `${yPos}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => {
                  setSelectedPlay(play);
                  setShowingPlayDetail(true);
                }}
                title={`${play.playText} (${play.yardsGained} yards)`}
              />
            );
          })}

          {/* Ohio State Logo in Center */}
          <div className="center-logo">
            <img
              src={ohioStateData.logo}
              alt="Ohio State logo"
              onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
            />
          </div>
        </div>

        {/* Home Team End Zone */}
        <div className="endzone">
          <span className="endzone-text">{ohioStateData.name}</span>
        </div>
      </div>

      {/* Field Statistics */}
      <div className="analytics-card">
        <h4 className="text-lg font-semibold mb-4">Field Zone Performance</h4>
        <div className="stat-grid">
          {['Own 20', 'Own 40', 'Midfield', 'Opp 40', 'Red Zone'].map(zone => {
            const zonePlays = filteredPlays.filter(play => {
              if (zone === 'Own 20') return play.fieldPosition <= 20;
              if (zone === 'Own 40') return play.fieldPosition > 20 && play.fieldPosition <= 40;
              if (zone === 'Midfield') return play.fieldPosition > 40 && play.fieldPosition <= 60;
              if (zone === 'Opp 40') return play.fieldPosition > 60 && play.fieldPosition <= 80;
              if (zone === 'Red Zone') return play.fieldPosition > 80;
              return false;
            });
            
            const successes = zonePlays.filter(play => play.success).length;
            const successRate = zonePlays.length > 0 ? ((successes / zonePlays.length) * 100).toFixed(1) : '0.0';
            
            return (
              <div key={zone} className="stat-item">
                <div className="stat-value">{zonePlays.length}</div>
                <div className="stat-label">{zone}</div>
                <div className="text-xs text-gray-500">{successRate}% success</div>
              </div>
            );
          })}
        </div>  
      </div>
    </div>
  );
};

const AnalyticsView = ({ data, filteredPlays }) => {
  return (
    <>
      {/* EPA by Down Chart */}
      <div className="analytics-card">
        <h4 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
          EPA by Down
        </h4>
        <div className="stat-grid">
          {[1, 2, 3, 4].map(down => {
            const downPlays = filteredPlays.filter(play => play.down === down);
            const avgEPA = downPlays.length > 0 ? 
              (downPlays.reduce((sum, play) => sum + (play.epa || 0), 0) / downPlays.length).toFixed(2) : 
              '0.00';
            
            return (
              <div key={down} className="stat-item">
                <div className="stat-value" style={{ color: avgEPA >= 0 ? '#10b981' : '#dc2626' }}>
                  {avgEPA}
                </div>
                <div className="stat-label">Down {down}</div>
                <div className="text-xs text-gray-500">{downPlays.length} plays</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pressure Analysis */}
      <div className="analytics-card">
        <h4 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
          Pressure Analysis
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="stat-item" style={{ background: 'rgba(220, 38, 38, 0.1)' }}>
            <div className="stat-value" style={{ color: '#dc2626' }}>
              {filteredPlays.filter(play => play.pressure).length}
            </div>
            <div className="stat-label">Under Pressure</div>
            <div className="text-xs text-gray-500">
              {filteredPlays.length > 0 ? 
                ((filteredPlays.filter(play => play.pressure && play.success).length / 
                  filteredPlays.filter(play => play.pressure).length) * 100).toFixed(1) : 0}% success
            </div>
          </div>
          <div className="stat-item" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <div className="stat-value" style={{ color: '#10b981' }}>
              {filteredPlays.filter(play => !play.pressure).length}
            </div>
            <div className="stat-label">Clean Pocket</div>
            <div className="text-xs text-gray-500">
              {filteredPlays.length > 0 ? 
                ((filteredPlays.filter(play => !play.pressure && play.success).length / 
                  filteredPlays.filter(play => !play.pressure).length) * 100).toFixed(1) : 0}% success
            </div>
          </div>
        </div>
      </div>

      {/* Down & Distance Analysis */}
      <div className="analytics-card">
        <h4 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
          Down & Distance Analysis
        </h4>
        <div className="stat-grid">
          {[1, 2, 3, 4].map(down => {
            const downPlays = filteredPlays.filter(play => play.down === down);
            const successes = downPlays.filter(play => play.success).length;
            const successRate = downPlays.length > 0 ? ((successes / downPlays.length) * 100).toFixed(0) : '0';
            
            return (
              <div key={down} className="stat-item">
                <div className="stat-value">{downPlays.length}</div>
                <div className="stat-label">Down {down}</div>
                <div className="text-xs" style={{ color: successRate > 50 ? '#10b981' : '#dc2626' }}>
                  {successRate}% success
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

const TimelineView = ({ data, filteredPlays }) => {
  return (
    <div className="analytics-card">
      <h4 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
        Play Timeline
      </h4>
      <div className="play-timeline">
        {filteredPlays.map((play, index) => (
          <div key={play.id} className="play-row">
            <div className="flex items-center space-x-4 w-full">
              <div className="text-sm font-mono">
                Q{play.period} {play.clock}
              </div>
              <div className={`w-3 h-3 rounded-full ${play.playType}`} style={{
                backgroundColor: 
                  play.playType === 'completion' ? '#10b981' :
                  play.playType === 'incompletion' ? '#f59e0b' :
                  play.playType === 'rush' ? '#3b82f6' :
                  play.playType === 'touchdown' ? '#059669' :
                  play.playType === 'interception' ? '#dc2626' : '#6b7280'
              }}></div>
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {play.down}{play.down === 1 ? 'st' : play.down === 2 ? 'nd' : play.down === 3 ? 'rd' : 'th'} & {play.distance}
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {play.playText}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold" style={{ 
                  color: play.yardsGained > 0 ? '#10b981' : play.yardsGained < 0 ? '#dc2626' : '#6b7280' 
                }}>
                  {play.yardsGained > 0 ? '+' : ''}{play.yardsGained}
                </div>
                {play.epa && (
                  <div className="text-xs" style={{ 
                    color: play.epa > 0 ? '#10b981' : '#dc2626' 
                  }}>
                    EPA: {play.epa.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlayDetailModal = ({ play, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
            Play Details
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="font-medium">Situation:</span>
            <span>Q{play.period} {play.clock} - {play.down}{play.down === 1 ? 'st' : play.down === 2 ? 'nd' : play.down === 3 ? 'rd' : 'th'} & {play.distance}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Field Position:</span>
            <span>{play.fieldPosition} yard line</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Play Type:</span>
            <span className="capitalize">{play.playType}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Yards Gained:</span>
            <span style={{ color: play.yardsGained > 0 ? '#10b981' : play.yardsGained < 0 ? '#dc2626' : '#6b7280' }}>
              {play.yardsGained > 0 ? '+' : ''}{play.yardsGained}
            </span>
          </div>
          
          {play.target && (
            <div className="flex justify-between">
              <span className="font-medium">Target:</span>
              <span>{play.target}</span>
            </div>
          )}
          
          {play.epa && (
            <div className="flex justify-between">
              <span className="font-medium">EPA:</span>
              <span style={{ color: play.epa > 0 ? '#10b981' : '#dc2626' }}>
                {play.epa.toFixed(2)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="font-medium">Success:</span>
            <span style={{ color: play.success ? '#10b981' : '#dc2626' }}>
              {play.success ? 'Yes' : 'No'}
            </span>
          </div>
          
          <div className="pt-2 border-t">
            <span className="font-medium">Play Description:</span>
            <p className="text-sm text-gray-600 mt-1">{play.playText}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Export Component
const Heatmaps = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black mb-4 drop-shadow-lg">
            <span style={{ 
              background: 'linear-gradient(135deg, #cc001c, #a10014, #cc001c)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              QB Heatmaps
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Visualize quarterback performance zones across the football field with Ohio State precision.
          </p>
        </div>

        {/* QB Heatmap Field */}
        <QBHeatmapField />

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <i className="fas fa-check-circle text-4xl mb-4 text-green-500"></i>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Completion Rate</h3>
              <p className="text-gray-600">Track pass completion percentage by field zone</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <i className="fas fa-football-ball text-4xl mb-4 text-blue-500"></i>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Pass Attempts</h3>
              <p className="text-gray-600">Visualize target distribution across the field</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <i className="fas fa-chart-line text-4xl mb-4 text-yellow-500"></i>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Yards per Attempt</h3>
              <p className="text-gray-600">Analyze efficiency and big play potential</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <i className="fas fa-star text-4xl mb-4 text-red-500"></i>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Touchdowns</h3>
              <p className="text-gray-600">Identify red zone and scoring patterns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heatmaps;
