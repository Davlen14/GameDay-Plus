import React, { useState, useEffect } from 'react';

const Last5YearsTab = ({ team1, team2, team1Records = [], team2Records = [] }) => {
  const [last5YearsData, setLast5YearsData] = useState({
    team1: { wins: 0, winPercentage: 0, bowlGames: 0, confTitles: 'N/A' },
    team2: { wins: 0, winPercentage: 0, bowlGames: 0, confTitles: 'N/A' }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    const loadLast5YearsData = () => {
      if (!team1?.school || !team2?.school) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(`🔍 Processing Last 5 Years data for ${team1.school} vs ${team2.school}`);
        console.log(`📊 Team1 Records: ${team1Records.length}, Team2 Records: ${team2Records.length}`);

        const currentYear = new Date().getFullYear();
        const last5Years = Array.from({ length: 5 }, (_, i) => currentYear - i);
        
        console.log(`📅 Analyzing years: ${last5Years.join(', ')}`);

        // Filter records for the last 5 years
        const team1Last5Records = team1Records.filter(record => 
          last5Years.includes(record.year)
        );
        
        const team2Last5Records = team2Records.filter(record => 
          last5Years.includes(record.year)
        );

        console.log(`📈 Found ${team1Last5Records.length} records for ${team1.school} in last 5 years`);
        console.log(`📈 Found ${team2Last5Records.length} records for ${team2.school} in last 5 years`);

        // Calculate team stats
        const team1Stats = calculateLast5YearsStats(team1Last5Records);
        const team2Stats = calculateLast5YearsStats(team2Last5Records);

        console.log(`✅ ${team1.school} Last 5 Years Stats:`, team1Stats);
        console.log(`✅ ${team2.school} Last 5 Years Stats:`, team2Stats);

        setLast5YearsData({
          team1: team1Stats,
          team2: team2Stats
        });

        setTimeout(() => setAnimateStats(true), 300);
      } catch (err) {
        console.error('Error processing last 5 years data:', err);
        setError('Failed to process last 5 years data');
      } finally {
        setLoading(false);
      }
    };

    loadLast5YearsData();
  }, [team1?.school, team2?.school, team1Records, team2Records]);

  const calculateLast5YearsStats = (records) => {
    if (!records || records.length === 0) {
      return { wins: 0, winPercentage: 0, bowlGames: 0, confTitles: 'N/A' };
    }

    const totalWins = records.reduce((sum, record) => sum + (record.total?.wins || 0), 0);
    const totalGames = records.reduce((sum, record) => {
      const wins = record.total?.wins || 0;
      const losses = record.total?.losses || 0;
      const ties = record.total?.ties || 0;
      return sum + wins + losses + ties;
    }, 0);

    const winPercentage = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
    
    // Estimate bowl games based on winning seasons (>= 6 wins or > .500 win percentage)
    const bowlEligibleSeasons = records.filter(record => {
      const wins = record.total?.wins || 0;
      const winPct = record.winPercentage || 0;
      return wins >= 6 || winPct > 0.500;
    }).length;

    return {
      wins: totalWins,
      winPercentage,
      bowlGames: bowlEligibleSeasons, // Approximation
      confTitles: 'N/A' // Would need additional API data
    };
  };

  const getTeamColor = (team) => {
    return team?.color || '#cc001c';
  };

  const getWinner = (value1, value2) => {
    const num1 = parseFloat(value1);
    const num2 = parseFloat(value2);
    if (num1 > num2) return 'team1';
    if (num2 > num1) return 'team2';
    return 'tie';
  };

  if (loading) {
    return (
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center py-20">
          <div className="relative mb-8">
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl mx-auto"></div>
            <div className="relative w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center mx-auto">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-gray-600"></div>
            </div>
          </div>
          <h3 className="text-2xl font-bold gradient-text">Loading Last 5 Years...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center py-20">
          <div className="relative mb-8">
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl mx-auto"></div>
            <div className="relative w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center mx-auto">
              <i className="fas fa-exclamation-triangle text-red-500 text-3xl"></i>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <style>{`
        .gradient-text {
          background: linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Header */}
      <div className={`text-center space-y-4 transition-all duration-500 ${animateStats ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex items-center justify-center space-x-4 mb-6">
          <i className="fas fa-calendar-badge-clock text-4xl gradient-text"></i>
          <h2 className="text-4xl font-black gradient-text">Last 5 Years</h2>
        </div>
        <p className="text-xl text-gray-600 font-light">
          Performance Comparison (2020-2024)
        </p>
      </div>

      {/* Comparison Cards */}
      <div className="space-y-6">
        {/* Total Wins */}
        <ModernComparisonCard
          title="Total Wins"
          subtitle="Last 5 Years Performance"
          icon="trophy"
          value1={last5YearsData.team1.wins.toString()}
          value2={last5YearsData.team2.wins.toString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Win Percentage */}
        <ModernComparisonCard
          title="Win Percentage"
          subtitle="Success Rate Over 5 Years"
          icon="percent"
          value1={last5YearsData.team1.winPercentage.toFixed(1) + '%'}
          value2={last5YearsData.team2.winPercentage.toFixed(1) + '%'}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Conference Titles */}
        <ModernComparisonCard
          title="Conference Titles"
          subtitle="Championships Won"
          icon="crown"
          value1={last5YearsData.team1.confTitles}
          value2={last5YearsData.team2.confTitles}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Bowl Eligible Seasons */}
        <ModernComparisonCard
          title="Bowl Eligible Seasons"
          subtitle="Postseason Qualification"
          icon="star-circle"
          value1={last5YearsData.team1.bowlGames.toString()}
          value2={last5YearsData.team2.bowlGames.toString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />
      </div>

      {/* Legend */}
      <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8 transition-all duration-500 ${animateStats ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex items-center space-x-4 mb-6">
          <i className="fas fa-info-circle text-2xl gradient-text"></i>
          <h3 className="text-2xl font-black gradient-text">About This Data</h3>
        </div>
        
        <div className="space-y-4 text-gray-700">
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Performance Window</h4>
            <p className="text-sm">Data covers the 2020-2024 seasons, providing a comprehensive 5-year performance comparison.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Metrics Included</h4>
            <p className="text-sm">Total wins, win percentage, conference championships, and bowl eligibility over the last 5 seasons.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modern Comparison Card Component
const ModernComparisonCard = ({ title, subtitle, icon, value1, value2, team1, team2, animateStats, getTeamColor, getWinner }) => {
  const winner = getWinner(value1, value2);
  
  return (
    <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8 transition-all duration-500 ${animateStats ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      {/* Card Header */}
      <div className="flex items-center space-x-4 mb-8">
        <i className={`fas fa-${icon} text-3xl gradient-text`}></i>
        <div>
          <h3 className="text-2xl font-black gradient-text">{title}</h3>
          <p className="text-sm text-gray-600 font-medium">{subtitle}</p>
        </div>
      </div>

      {/* Team Comparison */}
      <div className="flex items-center justify-between">
        {/* Team 1 */}
        <div className="text-center space-y-4 flex-1">
          <div className="w-16 h-16 mx-auto flex items-center justify-center">
            {team1?.logos?.[0] ? (
              <img src={team1.logos[0]} alt={team1.school} className="w-full h-full object-contain drop-shadow-sm" />
            ) : (
              <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: getTeamColor(team1) }}>
                {team1?.school?.[0]}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-bold" style={{ color: getTeamColor(team1) }}>
              {team1?.school}
            </p>
            <div className={`text-4xl font-black transition-all duration-600 ${animateStats ? 'opacity-100 scale-100' : 'opacity-60 scale-90'}`} 
                 style={{ color: getTeamColor(team1) }}>
              {value1}
            </div>
          </div>

          {/* Winner Badge */}
          {winner === 'team1' && (
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-100 border border-green-200">
              <i className="fas fa-star text-green-600 text-sm"></i>
              <span className="text-xs font-bold text-green-700">WINNER</span>
            </div>
          )}
        </div>

        {/* VS Section with Winner Arrow */}
        <div className="text-center space-y-4 mx-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-600 font-bold text-sm">VS</span>
          </div>
          
          {/* Winner Arrow */}
          {winner !== 'tie' && (
            <i className={`fas fa-arrow-${winner === 'team1' ? 'left' : 'right'} text-green-500 text-2xl ${animateStats ? 'animate-pulse' : ''}`}></i>
          )}
        </div>

        {/* Team 2 */}
        <div className="text-center space-y-4 flex-1">
          <div className="w-16 h-16 mx-auto flex items-center justify-center">
            {team2?.logos?.[0] ? (
              <img src={team2.logos[0]} alt={team2.school} className="w-full h-full object-contain drop-shadow-sm" />
            ) : (
              <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: getTeamColor(team2) }}>
                {team2?.school?.[0]}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-bold" style={{ color: getTeamColor(team2) }}>
              {team2?.school}
            </p>
            <div className={`text-4xl font-black transition-all duration-600 ${animateStats ? 'opacity-100 scale-100' : 'opacity-60 scale-90'}`} 
                 style={{ color: getTeamColor(team2) }}>
              {value2}
            </div>
          </div>

          {/* Winner Badge */}
          {winner === 'team2' && (
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-100 border border-green-200">
              <i className="fas fa-star text-green-600 text-sm"></i>
              <span className="text-xs font-bold text-green-700">WINNER</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Last5YearsTab;
