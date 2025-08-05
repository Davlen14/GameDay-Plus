import React, { useState, useEffect } from 'react';
import { teamService } from '../../services/teamService';

const OverviewTab = ({ team, primaryTeamColor }) => {
  const [teamData, setTeamData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nationalAverages, setNationalAverages] = useState({});

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

  // Helper to aggregate coach career data (similar to CoachOverview)
  const aggregateCoachData = (seasons) => {
    if (!seasons || seasons.length === 0) return { games: 0, wins: 0, losses: 0, ties: 0 };
    
    return seasons.reduce(
      (acc, season) => {
        acc.games += season.games || 0;
        acc.wins += season.wins || 0;
        acc.losses += season.losses || 0;
        acc.ties += season.ties || 0;
        return acc;
      },
      { games: 0, wins: 0, losses: 0, ties: 0 }
    );
  };

  // Get position gradient - metallic team color effect (from RosterTab)
  const getPositionGradient = () => {
    const darkerRgb = `${Math.max(0, teamRgb.r - 40)}, ${Math.max(0, teamRgb.g - 40)}, ${Math.max(0, teamRgb.b - 40)}`;
    const lighterRgb = `${Math.min(255, teamRgb.r + 60)}, ${Math.min(255, teamRgb.g + 60)}, ${Math.min(255, teamRgb.b + 60)}`;
    return `linear-gradient(135deg, 
      rgba(${lighterRgb}, 0.95) 0%, 
      rgba(${teamColorRgb}, 1) 15%, 
      rgba(${darkerRgb}, 1) 35%, 
      rgba(${teamColorRgb}, 0.9) 50%, 
      rgba(${darkerRgb}, 1) 65%, 
      rgba(${teamColorRgb}, 1) 85%, 
      rgba(${lighterRgb}, 0.95) 100%)`;
  };

  // Get rating color based on comparison to national average
  const getRatingColor = (value, average, isDefensive = false) => {
    const comparison = teamService.getRatingComparison(value, average, isDefensive);
    return {
      green: '#10b981',
      yellow: '#f59e0b', 
      red: '#ef4444',
      gray: '#6b7280'
    }[comparison.color];
  };

  // Get rating indicator
  const getRatingIndicator = (value, average, isDefensive = false) => {
    const comparison = teamService.getRatingComparison(value, average, isDefensive);
    const icons = {
      green: '📈',
      yellow: '➖', 
      red: '📉',
      gray: '❓'
    };
    return {
      icon: icons[comparison.color],
      status: comparison.status,
      difference: comparison.difference
    };
  };

  // Check if logo needs colored background (for light/white logos)
  const needsColoredBackground = (logoUrl, index) => {
    // Secondary logo (index 1) gets colored background for better visibility
    // You can also add logic here to detect light colors in the future
    return index === 1;
  };

  // Load comprehensive team data
  useEffect(() => {
    const loadTeamData = async () => {
      if (!team?.school) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log(`🏈 Loading overview data for ${team.school}`);
        const overviewData = await teamService.getTeamOverviewData(team.school, 2024);
        const averages = teamService.getNationalAverages();
        setTeamData(overviewData);
        setNationalAverages(averages);
        console.log('✅ Overview data loaded:', overviewData);
      } catch (err) {
        console.error('❌ Error loading team overview data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [team]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div style={{ width: '97%', margin: '0 auto' }}>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl animate-pulse"></div>
                <div className="relative w-16 h-16 rounded-full bg-white/40 backdrop-blur-2xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center">
                  <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/60 via-transparent to-transparent"></div>
                  <div 
                    className="animate-spin rounded-full h-12 w-12 border-4 border-transparent"
                    style={{ 
                      background: `conic-gradient(from 0deg, rgba(${teamColorRgb}, 0.2), rgba(${teamColorRgb}, 1), rgba(${teamColorRgb}, 0.2))`,
                      borderTopColor: primaryTeamColor 
                    }}
                  ></div>
                </div>
              </div>
              <p className="text-gray-600 font-medium mt-4">Loading team overview...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div style={{ width: '97%', margin: '0 auto' }}>
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">⚠️ Error loading team data</div>
            <div className="text-gray-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div style={{ width: '97%', margin: '0 auto' }} className="relative z-10">
        
        {/* Modern Header */}
        <div className="text-center mb-8">
          <h2 
            className="text-4xl font-black mb-2"
            style={{ 
              fontFamily: 'Orbitron, sans-serif',
              color: primaryTeamColor,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {team.school.toUpperCase()} OVERVIEW
          </h2>
          <p className="text-gray-600 font-medium">2024 Season • Team Information & Performance</p>
          {error && (
            <p className="text-sm text-amber-600 mt-2 bg-amber-50 px-4 py-2 rounded-lg inline-block">
              ⚠️ Some data may be incomplete - {error}
            </p>
          )}
        </div>

        {/* Team Info Cards with Gradient Styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* School Info */}
          <div 
            className="group relative backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 transition-all duration-500 hover:shadow-2xl hover:scale-105 cursor-pointer overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 100%)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}
          >
            {/* Glass reflection effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-white/10 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mr-4 text-white shadow-xl"
                  style={{ background: getPositionGradient() }}
                >
                  <i className="fas fa-university text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}>School</h3>
                </div>
              </div>
              <p className="text-gray-700 font-medium text-lg">{team.school}</p>
              <p className="text-gray-600 text-sm mt-1">
                Mascot: {teamData.basicInfo?.mascot || team.mascot || 'N/A'}
              </p>
              {teamData.basicInfo?.abbreviation && (
                <p className="text-gray-600 text-sm">
                  Abbreviation: {teamData.basicInfo.abbreviation}
                </p>
              )}
            </div>
          </div>

          {/* Conference */}
          <div 
            className="group relative backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 transition-all duration-500 hover:shadow-2xl hover:scale-105 cursor-pointer overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 100%)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-white/10 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mr-4 text-white shadow-xl"
                  style={{ background: getPositionGradient() }}
                >
                  <i className="fas fa-trophy text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}>Conference</h3>
                </div>
              </div>
              <p className="text-gray-700 font-medium text-lg">
                {teamData.basicInfo?.conference || team.conference || 'Independent'}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Classification: {teamData.basicInfo?.classification?.toUpperCase() || 'FBS'}
              </p>
            </div>
          </div>

          {/* Location */}
          <div 
            className="group relative backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 transition-all duration-500 hover:shadow-2xl hover:scale-105 cursor-pointer overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 100%)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-white/10 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mr-4 text-white shadow-xl"
                  style={{ background: getPositionGradient() }}
                >
                  <i className="fas fa-map-marker-alt text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}>Location</h3>
                </div>
              </div>
              <p className="text-gray-700 font-medium text-lg">
                {teamData.basicInfo?.location?.city || team?.location?.city || 'Unknown'}, {' '}
                {teamData.basicInfo?.location?.state || team?.location?.state || 'Unknown'}
              </p>
              {teamData.basicInfo?.twitter && (
                <p className="text-gray-600 text-sm mt-1">
                  <i className="fab fa-twitter mr-1"></i>
                  {teamData.basicInfo.twitter}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Team Colors with Enhanced Display */}
        <div 
          className="backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 mb-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 100%)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-white/10 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-6" style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}>Team Identity</h3>
            <div className="flex items-center space-x-6 flex-wrap">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full border-4 border-white/30 shadow-xl"
                  style={{ backgroundColor: teamData.basicInfo?.color || team.color || primaryTeamColor }}
                ></div>
                <div>
                  <span className="text-sm font-bold text-gray-700">Primary Color</span>
                  <div className="text-xs text-gray-600">{teamData.basicInfo?.color || team.color || primaryTeamColor}</div>
                </div>
              </div>
              {(teamData.basicInfo?.alternateColor || team.alternateColor) && (
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-full border-4 border-white/30 shadow-xl"
                    style={{ backgroundColor: teamData.basicInfo?.alternateColor || team.alternateColor }}
                  ></div>
                  <div>
                    <span className="text-sm font-bold text-gray-700">Alternate Color</span>
                    <div className="text-xs text-gray-600">{teamData.basicInfo?.alternateColor || team.alternateColor}</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Team Logos if available */}
            {teamData.basicInfo?.logos && teamData.basicInfo.logos.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="text-sm font-bold text-gray-700 mb-4">Official Logos:</div>
                <div className="flex space-x-4">
                  {teamData.basicInfo.logos.slice(0, 2).map((logo, index) => {
                    const isSecondary = index === 1;
                    return (
                      <div 
                        key={index}
                        className={`backdrop-blur-sm rounded-2xl p-4 border transition-all duration-300 hover:scale-105 ${
                          isSecondary 
                            ? 'border-white/40 shadow-xl' 
                            : 'bg-white/10 border-white/20'
                        }`}
                        style={isSecondary ? {
                          background: getPositionGradient()
                        } : {}}
                      >
                        <img 
                          src={logo} 
                          alt={`${team.school} logo ${index === 0 ? 'primary' : 'secondary'}`}
                          className="w-16 h-16 object-contain"
                          onError={(e) => e.target.style.display = 'none'}
                          style={isSecondary ? {
                            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.25))',
                          } : {}}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2024 Season Record */}
        <div 
          className="backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 mb-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 100%)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-white/10 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-6" style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}>2024 Season Record</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-xl font-black shadow-xl"
                  style={{ background: getPositionGradient() }}
                >
                  {teamData.records?.total?.wins || '--'}
                </div>
                <div className="text-sm text-gray-600 font-bold">Wins</div>
              </div>
              <div className="text-center">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-xl font-black shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)' }}
                >
                  {teamData.records?.total?.losses || '--'}
                </div>
                <div className="text-sm text-gray-600 font-bold">Losses</div>
              </div>
              <div className="text-center">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-sm font-black shadow-xl"
                  style={{ background: getPositionGradient() }}
                >
                  {teamData.records?.conferenceGames ? 
                    `${teamData.records.conferenceGames.wins}-${teamData.records.conferenceGames.losses}` : '--'}
                </div>
                <div className="text-sm text-gray-600 font-bold">Conference</div>
              </div>
              <div className="text-center">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-sm font-black shadow-xl"
                  style={{ background: getPositionGradient() }}
                >
                  {teamData.records?.postseason ? 
                    `${teamData.records.postseason.wins}-${teamData.records.postseason.losses}` : '--'}
                </div>
                <div className="text-sm text-gray-600 font-bold">Postseason</div>
              </div>
            </div>
            
            {/* Additional record details */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { 
                    label: 'Home Record', 
                    value: teamData.records?.homeGames ? `${teamData.records.homeGames.wins}-${teamData.records.homeGames.losses}` : '--',
                    icon: 'fas fa-home'
                  },
                  { 
                    label: 'Away Record', 
                    value: teamData.records?.awayGames ? `${teamData.records.awayGames.wins}-${teamData.records.awayGames.losses}` : '--',
                    icon: 'fas fa-plane'
                  },
                  { 
                    label: 'Expected Wins', 
                    value: teamData.records?.expectedWins ? Math.round(teamData.records.expectedWins * 10) / 10 : '--',
                    icon: 'fas fa-chart-line'
                  }
                ].map((stat, index) => (
                  <div key={index} className="backdrop-blur-sm bg-white/10 rounded-xl px-4 py-3 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <i className={`${stat.icon} mr-3`} style={{ color: primaryTeamColor }}></i>
                        <span className="text-sm font-bold text-gray-700">{stat.label}</span>
                      </div>
                      <span className="font-black text-lg" style={{ color: primaryTeamColor }}>{stat.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Current Rankings */}
        {(teamData.rankings?.ap || teamData.rankings?.coaches || teamData.rankings?.cfp) && (
          <div 
            className="backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 mb-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 100%)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-white/10 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-6" style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}>Current Rankings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'College Football Playoff', short: 'CFP', rank: teamData.rankings?.cfp },
                  { label: 'Associated Press', short: 'AP Poll', rank: teamData.rankings?.ap, points: teamData.rankings?.apPoints },
                  { label: 'Coaches Poll', short: 'Coaches', rank: teamData.rankings?.coaches, points: teamData.rankings?.coachesPoints }
                ].map((poll, index) => (
                  <div 
                    key={index}
                    className="backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20 text-center"
                  >
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-black shadow-xl"
                      style={{ background: getPositionGradient() }}
                    >
                      #{poll.rank || '--'}
                    </div>
                    <div className="text-sm font-bold text-gray-700">{poll.short}</div>
                    {poll.points && (
                      <div className="text-xs text-gray-600 mt-1">{poll.points} points</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Head Coach Information */}
        {teamData.coach?.firstName && (
          <div 
            className="backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 mb-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 100%)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-white/10 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-6" style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}>Head Coach</h3>
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mr-6 text-white shadow-xl"
                    style={{ background: getPositionGradient() }}
                  >
                    <i className="fas fa-user-tie text-2xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-black" style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}>
                      {teamData.coach.firstName} {teamData.coach.lastName}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Hired: {teamData.coach.hireDate ? new Date(teamData.coach.hireDate).getFullYear() : 'N/A'}
                    </div>
                    {(() => {
                      const careerStats = aggregateCoachData(teamData.coach.seasons);
                      const winPct = careerStats.games > 0 ? ((careerStats.wins / careerStats.games) * 100).toFixed(1) : 0;
                      return careerStats.games > 0 ? (
                        <div className="text-sm text-gray-500 mt-1">
                          Career Record: {careerStats.wins}-{careerStats.losses} ({winPct}%)
                        </div>
                      ) : null;
                    })()}
                    {teamData.allTimeRecord && (
                      <div className="text-sm text-gray-500 mt-1">
                        All-Time Program Wins: {teamData.allTimeRecord.totalWins}
                      </div>
                    )}
                  </div>
                </div>
                {(() => {
                  const currentSeason = teamData.coach.seasons?.[0];
                  return currentSeason ? (
                    <div className="text-right">
                      <div 
                        className="text-3xl font-black mb-2"
                        style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}
                      >
                        {currentSeason.wins}-{currentSeason.losses}
                      </div>
                      <div className="text-sm text-gray-600 font-bold">2024 Record</div>
                      {currentSeason.postseasonRank && (
                        <div className="text-xs text-gray-500 mt-1">Final Rank: #{currentSeason.postseasonRank}</div>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Advanced Analytics with National Comparison */}
        {teamData.coach?.seasons?.[0] && (
          <div 
            className="backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 mb-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 100%)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-white/10 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-6" style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}>Advanced Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { 
                    label: 'SP+ Overall', 
                    value: teamData.coach.seasons[0].spOverall, 
                    average: nationalAverages.spOverall,
                    isDefensive: false,
                    icon: 'fas fa-chart-bar'
                  },
                  { 
                    label: 'SP+ Offense', 
                    value: teamData.coach.seasons[0].spOffense, 
                    average: nationalAverages.spOffense,
                    isDefensive: false,
                    icon: 'fas fa-running'
                  },
                  { 
                    label: 'SP+ Defense', 
                    value: teamData.coach.seasons[0].spDefense, 
                    average: nationalAverages.spDefense,
                    isDefensive: true,
                    icon: 'fas fa-shield-alt'
                  }
                ].map((stat, index) => {
                  const indicator = getRatingIndicator(stat.value, stat.average, stat.isDefensive);
                  const color = getRatingColor(stat.value, stat.average, stat.isDefensive);
                  
                  return (
                    <div 
                      key={index}
                      className="backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <i className={`${stat.icon} text-2xl`} style={{ color: primaryTeamColor }}></i>
                        <span className="text-2xl">{indicator.icon}</span>
                      </div>
                      <div className="text-center">
                        <div 
                          className="text-3xl font-black mb-2"
                          style={{ color: color, fontFamily: 'Orbitron, sans-serif' }}
                        >
                          {stat.value?.toFixed(1) || '--'}
                        </div>
                        <div className="text-sm font-bold text-gray-700 mb-2">{stat.label}</div>
                        <div className="text-xs font-medium" style={{ color: color }}>
                          {indicator.status}
                        </div>
                        {indicator.difference && (
                          <div className="text-xs text-gray-600 mt-1">
                            {stat.isDefensive ? 
                              (indicator.difference > 0 ? `+${indicator.difference}` : indicator.difference) :
                              (indicator.difference > 0 ? `+${indicator.difference}` : indicator.difference)
                            } vs National Avg
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex items-center justify-center space-x-8 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-gray-700">Above Average</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-gray-700">Average</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-gray-700">Below Average</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stadium Information */}
        <div 
          className="backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 mb-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 100%)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-white/10 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-6" style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}>Stadium Information</h3>
            <div className="flex items-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mr-6 text-white text-2xl shadow-xl"
                style={{ background: getPositionGradient() }}
              >
                <i className="fas fa-building"></i>
              </div>
              <div className="flex-1">
                <div className="text-2xl font-black mb-2" style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}>
                  {teamData.stadium?.name || team?.location?.name || 'Stadium Name N/A'}
                </div>
                <div className="text-gray-600 text-lg font-medium">
                  {teamData.stadium?.city || team?.location?.city || 'City'}, {teamData.stadium?.state || team?.location?.state || 'State'}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20 text-center">
                <div className="text-2xl font-black" style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}>
                  {(teamData.stadium?.capacity || team?.location?.capacity)?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-sm text-gray-600 font-bold">Capacity</div>
              </div>
              <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20 text-center">
                <div className="text-2xl font-black" style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}>
                  {teamData.stadium?.constructionYear || team?.location?.constructionYear || 'N/A'}
                </div>
                <div className="text-sm text-gray-600 font-bold">Built</div>
              </div>
              <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20 text-center">
                <div className="text-2xl font-black" style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}>
                  {(teamData.stadium?.grass ?? team?.location?.grass) !== undefined ? 
                    ((teamData.stadium?.grass ?? team?.location?.grass) ? 'Grass' : 'Turf') : 'N/A'}
                </div>
                <div className="text-sm text-gray-600 font-bold">Surface</div>
              </div>
            </div>
          </div>
        </div>

        {/* Program Excellence */}
        <div 
          className="backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 mb-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 100%)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-white/10 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-6" style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}>Program Excellence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20 text-center">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-black shadow-xl"
                  style={{ background: getPositionGradient() }}
                >
                  #{teamData.recruiting?.rank || '--'}
                </div>
                <div className="text-sm text-gray-600 font-bold mb-2">Recruiting Rank</div>
                {teamData.recruiting?.points && (
                  <div className="text-xs text-gray-600">{teamData.recruiting.points.toFixed(1)} points</div>
                )}
                {teamData.recruiting?.rank && (
                  <div className="mt-2">
                    <span 
                      className="text-xs font-bold px-2 py-1 rounded-full text-white"
                      style={{ 
                        backgroundColor: getRatingColor(teamData.recruiting.rank, nationalAverages.recruitingRank, true)
                      }}
                    >
                      {getRatingIndicator(teamData.recruiting.rank, nationalAverages.recruitingRank, true).status}
                    </span>
                  </div>
                )}
              </div>
              <div className="backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20 text-center">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-black shadow-xl"
                  style={{ background: getPositionGradient() }}
                >
                  {teamData.records?.total?.games || '--'}
                </div>
                <div className="text-sm text-gray-600 font-bold">Games Played</div>
                <div className="text-xs text-gray-600 mt-2">2024 Season</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OverviewTab;