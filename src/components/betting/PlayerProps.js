import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import PlayerChartsSection from './PlayerChartsSection';

const PlayerProps = () => {
  const [selectedPlayer, setSelectedPlayer] = useState('jeremiah-smith');
  const [selectedMetric, setSelectedMetric] = useState('receiving-yards');
  const [activeTab, setActiveTab] = useState('Stats');

  // Modern red gradient theme colors
  const modernRedGradient = `linear-gradient(135deg, 
    rgb(255, 46, 74), 
    rgb(204, 0, 28), 
    rgb(161, 0, 20), 
    rgb(204, 0, 28), 
    rgb(255, 46, 74)
  )`;
  
  const modernGreenGradient = `linear-gradient(135deg, 
    rgb(34, 197, 94), 
    rgb(22, 163, 74), 
    rgb(15, 118, 54), 
    rgb(22, 163, 74), 
    rgb(34, 197, 94)
  )`;

  const accentColor = 'rgb(204, 0, 28)';
  const positiveColor = 'rgb(34, 197, 94)';
  
  const modernGoldGradient = `linear-gradient(135deg, 
    rgb(251, 191, 36), 
    rgb(245, 158, 11), 
    rgb(217, 119, 6), 
    rgb(245, 158, 11), 
    rgb(251, 191, 36)
  )`;

  // Jeremiah Smith 2024 game data (Regular Season + Playoffs)
  const smithGameData = [
    // Regular Season (Weeks 1-12)
    { week: 1, opponent: 'Akron', yards: 92, receptions: 6, tds: 1, target: 8, isPlayoff: false },
    { week: 2, opponent: 'Western Michigan', yards: 93, receptions: 6, tds: 1, target: 7, isPlayoff: false },
    { week: 3, opponent: 'Marshall', yards: 90, receptions: 4, tds: 2, target: 6, isPlayoff: false },
    { week: 4, opponent: 'Notre Dame', yards: 149, receptions: 9, tds: 2, target: 11, isPlayoff: false },
    { week: 5, opponent: 'Michigan State', yards: 89, receptions: 6, tds: 1, target: 8, isPlayoff: false },
    { week: 6, opponent: 'Iowa', yards: 88, receptions: 4, tds: 1, target: 6, isPlayoff: false },
    { week: 7, opponent: 'Oregon', yards: 123, receptions: 7, tds: 1, target: 9, isPlayoff: false },
    { week: 8, opponent: 'Nebraska', yards: 80, receptions: 5, tds: 0, target: 7, isPlayoff: false },
    { week: 9, opponent: 'Penn State', yards: 113, receptions: 4, tds: 2, target: 6, isPlayoff: false },
    { week: 10, opponent: 'Purdue', yards: 92, receptions: 6, tds: 0, target: 8, isPlayoff: false },
    { week: 11, opponent: 'Northwestern', yards: 54, receptions: 5, tds: 1, target: 7, isPlayoff: false },
    { week: 12, opponent: 'Michigan', yards: 35, receptions: 5, tds: 0, target: 6, isPlayoff: false },
    // College Football Playoff (Weeks 13-16)
    { week: 13, opponent: 'Tennessee', yards: 103, receptions: 6, tds: 1, target: 8, isPlayoff: true },
    { week: 14, opponent: 'Oregon', yards: 187, receptions: 7, tds: 2, target: 10, isPlayoff: true },
    { week: 15, opponent: 'Texas', yards: 3, receptions: 1, tds: 0, target: 3, isPlayoff: true },
    { week: 16, opponent: 'Notre Dame', yards: 88, receptions: 5, tds: 1, target: 7, isPlayoff: true }
  ];

  // Hit rate data for different lines
  const hitRateData = [
    { line: '60.5', over: 87.5, under: 12.5 },
    { line: '70.5', over: 75.0, under: 25.0 },
    { line: '80.5', over: 62.5, under: 37.5 },
    { line: '90.5', over: 43.8, under: 56.2 },
    { line: '100.5', over: 25.0, under: 75.0 }
  ];

  // Texas defense data
  const texasDefenseData = [
    { category: 'vs Unranked', yards: 140.8, games: 11 },
    { category: 'vs Ranked', yards: 246.4, games: 5 },
    { category: 'December/Jan', yards: 264.3, games: 4 }
  ];

  // Week 1 projections
  const week1Projections = [
    { scenario: 'Conservative', yards: 65, probability: 30 },
    { scenario: 'Projected', yards: 90, probability: 45 },
    { scenario: 'Aggressive', yards: 110, probability: 25 }
  ];

  const tabs = ['Overview', 'News', 'Stats', 'Bio', 'Splits', 'Game Log'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <style jsx>{`
        .gradient-text {
          background: ${modernRedGradient};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .green-gradient-text {
          background: ${modernGreenGradient};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .active-dot {
          position: relative;
        }
        .active-dot::before {
          content: '';
          position: absolute;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          background: ${modernGreenGradient};
          border-radius: 50%;
          box-shadow: 0 0 4px rgba(34, 197, 94, 0.5);
        }
      `}</style>

      {/* Compact Header Section */}
      <div 
        className="relative bg-white/90 backdrop-blur-lg shadow-sm overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.9))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        <div className="container mx-auto px-6 py-4 relative">
          <div className="flex items-center gap-6">
            {/* Compact Player Photo */}
            <div className="relative group">
              <div 
                className="w-24 h-24 rounded-xl overflow-hidden relative shadow-lg transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(249, 250, 251, 0.1))'
                }}
              >
                {/* Ohio State Logo Background */}
                <img 
                  src="/team_logos/Ohio_State.png" 
                  alt="Ohio State" 
                  className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-sm"
                />
                {/* Player Photo */}
                <img 
                  src="/SportsbookLogos/JJSmith.png" 
                  alt="Jeremiah Smith" 
                  className="relative z-20 w-full h-full object-cover"
                  style={{
                    filter: 'contrast(1.1) brightness(1.05)'
                  }}
                />
              </div>
              
              {/* Team logo badge */}
              <div 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-white/95 backdrop-blur-sm shadow flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.9))'
                }}
              >
                <img src="/team_logos/Ohio_State.png" alt="Ohio State" className="w-4 h-4" />
              </div>
            </div>

            {/* Compact Player Info */}
            <div className="flex-1">
              <div className="mb-3">
                <h1 className="text-3xl font-black gradient-text mb-1 tracking-tight">JEREMIAH SMITH</h1>
                <div className="flex items-center gap-4 text-gray-700">
                  <div className="flex items-center gap-2">
                    <img src="/team_logos/Ohio_State.png" alt="Ohio State" className="w-4 h-4" />
                    <span className="font-semibold text-sm">Ohio State Buckeyes</span>
                  </div>
                  <span className="text-lg font-bold gradient-text">#4</span>
                  <span className="font-semibold text-sm">Wide Receiver</span>
                </div>
              </div>

              {/* Compact Player Details Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-gray-500 uppercase text-xs font-semibold mb-1">CLASS</div>
                  <div className="font-bold text-gray-800 text-sm">Sophomore</div>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-gray-500 uppercase text-xs font-semibold mb-1">HT/WT</div>
                  <div className="font-bold text-gray-800 text-sm">6' 3", 215 lbs</div>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-gray-500 uppercase text-xs font-semibold mb-1">BIRTHPLACE</div>
                  <div className="font-bold text-gray-800 text-sm">Miami Gardens, FL</div>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-gray-500 uppercase text-xs font-semibold mb-1">STATUS</div>
                  <div className="font-bold text-gray-800 text-sm active-dot">Active</div>
                </div>
              </div>
            </div>

            {/* Minimized 2024 Season Stats Box */}
            <div 
              className="rounded-lg p-3 min-w-[240px] bg-white/70 backdrop-blur-sm shadow-sm border border-gray-200"
            >
              <div className="text-center text-xs uppercase font-medium mb-2 text-gray-600 tracking-wider">
                2024 Season Stats
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center bg-gray-50 rounded-md p-2">
                  <div className="text-lg font-semibold mb-1 text-gray-800">76</div>
                  <div className="text-xs text-gray-600 font-medium">REC</div>
                </div>
                <div className="text-center bg-gray-50 rounded-md p-2">
                  <div className="text-lg font-semibold mb-1 text-gray-800">1,315</div>
                  <div className="text-xs text-gray-600 font-medium">YDS</div>
                </div>
                <div className="text-center bg-gray-50 rounded-md p-2">
                  <div className="text-lg font-semibold mb-1 text-gray-800">15</div>
                  <div className="text-xs text-gray-600 font-medium">TD</div>
                </div>
                <div className="text-center bg-gray-50 rounded-md p-2">
                  <div className="text-lg font-black mb-1 text-black">17.3</div>
                  <div className="text-xs text-gray-600 font-medium">AVG</div>
                </div>
              </div>
            </div>

            {/* Compact Follow Button */}
            <button 
              className="text-white px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 hover:shadow-lg hover:scale-105 transform"
              style={{
                background: modernRedGradient
              }}
            >
              <i className="fas fa-star mr-1"></i>
              Follow
            </button>
          </div>
        </div>
      </div>

      {/* Compact Navigation Tabs */}
      <div 
        className="bg-white/80 backdrop-blur-lg shadow-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.8))',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-semibold transition-all duration-300 relative ${
                  activeTab === tab
                    ? 'gradient-text transform scale-105'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={{
                  borderBottomColor: activeTab === tab ? accentColor : 'transparent',
                  borderBottomWidth: activeTab === tab ? '2px' : '2px'
                }}
              >
                {activeTab === tab && (
                  <div 
                    className="absolute inset-x-0 -bottom-px h-0.5 rounded-t-full"
                    style={{ background: modernRedGradient }}
                  />
                )}
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Compact Next Game Section */}
      <div 
        className="bg-white/85 backdrop-blur-lg shadow-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(249, 250, 251, 0.75))',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                <i className="fas fa-calendar mr-1"></i>
                Next Game
              </span>
              <div className="flex items-center gap-4 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2">
                <img src="/team_logos/Texas.png" alt="Texas" className="w-8 h-8 rounded-lg" />
                <span className="font-bold text-gray-800">Texas</span>
                <span 
                  className="font-black text-lg"
                  style={{
                    background: modernRedGradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  VS
                </span>
                <img src="/team_logos/Ohio_State.png" alt="Ohio State" className="w-8 h-8 rounded-lg" />
                <span className="font-bold text-gray-800">Ohio State</span>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                <div className="font-bold text-gray-800">SAT</div>
                <div className="font-bold gradient-text">8/30</div>
                <div className="text-xs text-gray-600 font-medium">10:00 AM</div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <button 
                className="block text-sm font-semibold transition-colors duration-200 hover:scale-105 transform"
                style={{ color: accentColor }}
              >
                <i className="fas fa-chart-bar mr-1"></i>
                Full Splits
              </button>
              <button 
                className="block text-sm font-semibold transition-colors duration-200 hover:scale-105 transform"
                style={{ color: accentColor }}
              >
                <i className="fas fa-video mr-1"></i>
                Latest Videos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Stats Cards */}
      <div 
        className="bg-white/85 backdrop-blur-lg shadow-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(249, 250, 251, 0.75))',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      >
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-4 gap-4 max-w-3xl">
            <div 
              className="text-center p-4 rounded-xl relative overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 46, 74, 0.1), rgba(204, 0, 28, 0.05))',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="relative z-10">
                <div className="text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: accentColor }}>
                  <i className="fas fa-star mr-1"></i>
                  REC YARDS
                </div>
                <div className="text-2xl font-black gradient-text">17.3</div>
              </div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 transform">
              <div className="text-xs text-gray-600 font-bold mb-1 uppercase tracking-wider">
                <i className="fas fa-chart-line mr-1"></i>
                REC YARDS
              </div>
              <div className="text-2xl font-black text-gray-800">1,315</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 transform">
              <div className="text-xs text-gray-600 font-bold mb-1 uppercase tracking-wider">
                <i className="fas fa-football-ball mr-1"></i>
                RECEPTIONS
              </div>
              <div className="text-2xl font-black text-gray-800">76</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 transform">
              <div className="text-xs text-gray-600 font-bold mb-1 uppercase tracking-wider">
                <i className="fas fa-target mr-1"></i>
                REC TDS
              </div>
              <div className="text-2xl font-black text-gray-800">15</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Modern Analysis Grid */}
        <div className="max-w-7xl mx-auto">
          <PlayerChartsSection 
            smithGameData={smithGameData}
            hitRateData={hitRateData}
            texasDefenseData={texasDefenseData}
            week1Projections={week1Projections}
            modernRedGradient={modernRedGradient}
            modernGreenGradient={modernGreenGradient}
            accentColor={accentColor}
            positiveColor={positiveColor}
          />

          {/* Modern Analysis Tables */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            
            {/* Modern Performance vs Defense Quality Table */}
            <div 
              className="rounded-3xl shadow-2xl border overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.9))',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <div className="p-8">
                <h3 className="text-xl font-medium text-gray-700 mb-6">
                  Smith vs Defense Quality
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr 
                        className="border-b-2"
                        style={{ borderColor: accentColor }}
                      >
                        <th className="text-left py-4 font-medium text-gray-600 uppercase tracking-wide text-xs">Defense Rank</th>
                        <th className="text-center py-4 font-medium text-gray-600 uppercase tracking-wide text-xs">Games</th>
                        <th className="text-center py-4 font-medium text-gray-600 uppercase tracking-wide text-xs">Avg Yards</th>
                        <th className="text-center py-4 font-medium text-gray-600 uppercase tracking-wide text-xs">O/U 75</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 hover:bg-white/50 transition-colors duration-200">
                        <td className="py-4 text-gray-700 font-medium">Top 10</td>
                        <td className="text-center py-4 font-medium">3</td>
                        <td className="text-center py-4 font-semibold text-lg">68.3</td>
                        <td className="text-center py-4">
                          <span 
                            className="px-3 py-2 rounded-xl text-xs font-black text-white"
                            style={{ background: modernRedGradient }}
                          >
                            67%
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-white/50 transition-colors duration-200">
                        <td className="py-4 text-gray-700 font-medium">Ranked 11-25</td>
                        <td className="text-center py-4 font-medium">4</td>
                        <td className="text-center py-4 font-semibold text-lg">85.5</td>
                        <td className="text-center py-4">
                          <span className="px-3 py-2 bg-yellow-500 text-white rounded-xl text-xs font-black">
                            75%
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-white/50 transition-colors duration-200">
                        <td className="py-4 text-gray-700 font-medium">Ranked 26-50</td>
                        <td className="text-center py-4 font-medium">5</td>
                        <td className="text-center py-4 font-semibold text-lg">92.8</td>
                        <td className="text-center py-4">
                          <span 
                            className="px-3 py-2 rounded-xl text-xs font-black text-white"
                            style={{ background: modernGreenGradient }}
                          >
                            80%
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-white/50 transition-colors duration-200">
                        <td className="py-4 text-gray-700 font-medium">50+</td>
                        <td className="text-center py-4 font-medium">4</td>
                        <td className="text-center py-4 font-semibold text-lg">96.2</td>
                        <td className="text-center py-4">
                          <span 
                            className="px-3 py-2 rounded-xl text-xs font-black text-white"
                            style={{ background: modernGreenGradient }}
                          >
                            100%
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modern Betting Lines Analysis Table */}
            <div 
              className="rounded-3xl shadow-2xl border overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.9))',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <div className="p-8">
                <h3 className="text-xl font-medium text-gray-700 mb-6">
                  Betting Lines Analysis
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr 
                        className="border-b-2"
                        style={{ borderColor: accentColor }}
                      >
                        <th className="text-left py-4 font-medium text-gray-600 uppercase tracking-wide text-xs">Line</th>
                        <th className="text-center py-4 font-medium text-gray-600 uppercase tracking-wide text-xs">Rec</th>
                        <th className="text-center py-4 font-medium text-gray-600 uppercase tracking-wide text-xs">Confidence</th>
                        <th className="text-center py-4 font-medium text-gray-600 uppercase tracking-wide text-xs">Hit Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 hover:bg-white/50 transition-colors duration-200">
                        <td className="py-4 text-gray-700 font-medium">O/U 70.5</td>
                        <td className="text-center py-4">
                          <span 
                            className="px-3 py-2 rounded-xl text-xs font-black text-white"
                            style={{ background: modernGreenGradient }}
                          >
                            OVER
                          </span>
                        </td>
                        <td className="text-center py-4">
                          <span 
                            className="px-3 py-2 rounded-xl text-xs font-black text-white"
                            style={{ background: modernGreenGradient }}
                          >
                            HIGH
                          </span>
                        </td>
                        <td className="text-center py-4 font-black text-lg green-gradient-text">75%</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-white/50 transition-colors duration-200">
                        <td className="py-4 text-gray-700 font-medium">O/U 75.5</td>
                        <td className="text-center py-4">
                          <span 
                            className="px-3 py-2 rounded-xl text-xs font-black text-white"
                            style={{ background: modernGreenGradient }}
                          >
                            OVER
                          </span>
                        </td>
                        <td className="text-center py-4">
                          <span className="px-3 py-2 bg-blue-500 text-white rounded-xl text-xs font-black">
                            MED
                          </span>
                        </td>
                        <td className="text-center py-4 font-black text-lg text-blue-600">62%</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-white/50 transition-colors duration-200">
                        <td className="py-4 text-gray-700 font-medium">O/U 80.5</td>
                        <td className="text-center py-4">
                          <span 
                            className="px-3 py-2 rounded-xl text-xs font-black text-white"
                            style={{ background: modernGreenGradient }}
                          >
                            OVER
                          </span>
                        </td>
                        <td className="text-center py-4">
                          <span className="px-3 py-2 bg-yellow-500 text-white rounded-xl text-xs font-black">
                            LOW
                          </span>
                        </td>
                        <td className="text-center py-4 font-black text-lg text-yellow-600">56%</td>
                      </tr>
                      <tr className="hover:bg-white/50 transition-colors duration-200">
                        <td className="py-4 text-gray-700 font-medium">O/U 85.5</td>
                        <td className="text-center py-4">
                          <span 
                            className="px-3 py-2 rounded-xl text-xs font-black text-white"
                            style={{ background: modernRedGradient }}
                          >
                            UNDER
                          </span>
                        </td>
                        <td className="text-center py-4">
                          <span className="px-3 py-2 bg-blue-500 text-white rounded-xl text-xs font-black">
                            MED
                          </span>
                        </td>
                        <td className="text-center py-4 font-black text-lg gradient-text">44%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Key Insights Section */}
          <div 
            className="rounded-3xl shadow-2xl border overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.9))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="p-10">
              <h3 className="text-2xl font-medium text-gray-700 mb-8 text-center">
                Week 1 vs Texas - Key Insights
              </h3>
              
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <h4 className="text-lg font-medium text-green-600 mb-6">
                    Positive Factors
                  </h4>
                  <ul className="space-y-4 text-gray-700">
                    <li className="flex items-start bg-green-50 rounded-xl p-4 border border-green-200">
                      <i className="fas fa-bullseye green-gradient-text mr-3 text-xl"></i>
                      <span className="font-medium">Texas struggled vs ranked WRs (246.4 YPG allowed)</span>
                    </li>
                    <li className="flex items-start bg-green-50 rounded-xl p-4 border border-green-200">
                      <i className="fas fa-chart-line green-gradient-text mr-3 text-xl"></i>
                      <span className="font-medium">Smith averaged 88+ yards in biggest games</span>
                    </li>
                    <li className="flex items-start bg-green-50 rounded-xl p-4 border border-green-200">
                      <i className="fas fa-home green-gradient-text mr-3 text-xl"></i>
                      <span className="font-medium">Ohio Stadium home crowd advantage</span>
                    </li>
                    <li className="flex items-start bg-green-50 rounded-xl p-4 border border-green-200">
                      <i className="fas fa-fist-raised green-gradient-text mr-3 text-xl"></i>
                      <span className="font-medium">Revenge game motivation factor</span>
                    </li>
                    <li className="flex items-start bg-green-50 rounded-xl p-4 border border-green-200">
                      <i className="fas fa-trophy green-gradient-text mr-3 text-xl"></i>
                      <span className="font-medium">Previous success: 85 yards vs Texas in CFP</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-red-600 mb-6">
                    Risk Factors
                  </h4>
                  <ul className="space-y-4 text-gray-700">
                    <li className="flex items-start bg-red-50 rounded-xl p-4 border border-red-200">
                      <i className="fas fa-shield-alt gradient-text mr-3 text-xl"></i>
                      <span className="font-medium">Texas top-10 pass defense nationally</span>
                    </li>
                    <li className="flex items-start bg-red-50 rounded-xl p-4 border border-red-200">
                      <i className="fas fa-clock gradient-text mr-3 text-xl"></i>
                      <span className="font-medium">Potential for early lead reducing pass attempts</span>
                    </li>
                    <li className="flex items-start bg-red-50 rounded-xl p-4 border border-red-200">
                      <i className="fas fa-calendar-week gradient-text mr-3 text-xl"></i>
                      <span className="font-medium">Season opener timing/chemistry issues</span>
                    </li>
                    <li className="flex items-start bg-red-50 rounded-xl p-4 border border-red-200">
                      <i className="fas fa-crosshairs gradient-text mr-3 text-xl"></i>
                      <span className="font-medium">Texas likely game-planning specifically for Smith</span>
                    </li>
                    <li className="flex items-start bg-red-50 rounded-xl p-4 border border-red-200">
                      <i className="fas fa-users gradient-text mr-3 text-xl"></i>
                      <span className="font-medium">Elite secondary with NFL-caliber DBs</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Enhanced Final Recommendation */}
              <div 
                className="mt-12 p-8 rounded-3xl relative overflow-hidden bg-white/60 backdrop-blur-sm border border-gray-200"
              >
                <div className="relative z-10 text-center">
                  <h4 className="text-xl font-medium text-gray-700 mb-4 flex items-center justify-center">
                    Primary Recommendation
                  </h4>
                  <p className="text-3xl font-semibold mb-6 text-gray-800">
                    Jeremiah Smith OVER 75.5 Receiving Yards
                  </p>
                  <div className="flex justify-center items-center gap-6 text-sm flex-wrap">
                    <div 
                      className="px-6 py-3 rounded-2xl font-black text-white shadow-lg"
                      style={{ background: modernRedGradient }}
                    >
                      <i className="fas fa-target mr-1"></i>
                      Confidence: 7/10
                    </div>
                    <div 
                      className="px-6 py-3 rounded-2xl font-black text-white shadow-lg"
                      style={{ background: modernGreenGradient }}
                    >
                      <i className="fas fa-chart-bar mr-1"></i>
                      Projection: 90.2 yards
                    </div>
                    <div 
                      className="px-6 py-3 rounded-2xl font-black text-white shadow-lg"
                      style={{ background: modernGoldGradient }}
                    >
                      <i className="fas fa-bolt mr-1"></i>
                      Expected Hit Rate: 62%
                    </div>
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

export default PlayerProps;
