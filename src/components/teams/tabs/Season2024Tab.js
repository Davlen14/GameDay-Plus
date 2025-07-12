import React, { useState, useEffect } from 'react';

const Season2024Tab = ({ team1, team2, team1Records = [], team2Records = [] }) => {
  const [season2024Data, setSeason2024Data] = useState({
    team1: { 
      wins: 0, 
      losses: 0, 
      winPercentage: 0, 
      conferenceWins: 0, 
      conferenceLosses: 0,
      // Offensive stats
      totalYards: 0,
      rushingYards: 0,
      netPassingYards: 0,
      passingTDs: 0,
      rushingTDs: 0,
      // Defensive stats
      totalYardsOpponent: 0,
      sacks: 0,
      interceptions: 0,
      tacklesForLoss: 0
    },
    team2: { 
      wins: 0, 
      losses: 0, 
      winPercentage: 0, 
      conferenceWins: 0, 
      conferenceLosses: 0,
      // Offensive stats
      totalYards: 0,
      rushingYards: 0,
      netPassingYards: 0,
      passingTDs: 0,
      rushingTDs: 0,
      // Defensive stats
      totalYardsOpponent: 0,
      sacks: 0,
      interceptions: 0,
      tacklesForLoss: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    const loadSeason2024Data = async () => {
      if (!team1?.school || !team2?.school) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(`🔍 Processing 2024 Season data for ${team1.school} vs ${team2.school}`);
        console.log(`📊 Team1 Records: ${team1Records.length}, Team2 Records: ${team2Records.length}`);

        // Filter records for 2024 season
        const team1_2024Record = team1Records.find(record => record.year === 2024);
        const team2_2024Record = team2Records.find(record => record.year === 2024);

        console.log(`📈 Found 2024 record for ${team1.school}:`, team1_2024Record);
        console.log(`📈 Found 2024 record for ${team2.school}:`, team2_2024Record);

        // Calculate team stats from records and fetch season stats
        const [team1Stats, team1SeasonStats] = await Promise.all([
          calculate2024Stats(team1_2024Record),
          fetchSeasonStats(team1.school, 2024)
        ]);
        
        const [team2Stats, team2SeasonStats] = await Promise.all([
          calculate2024Stats(team2_2024Record),
          fetchSeasonStats(team2.school, 2024)
        ]);

        // Combine record stats with detailed season stats
        const team1Combined = { ...team1Stats, ...team1SeasonStats };
        const team2Combined = { ...team2Stats, ...team2SeasonStats };

        console.log(`✅ ${team1.school} 2024 Complete Stats:`, team1Combined);
        console.log(`✅ ${team2.school} 2024 Complete Stats:`, team2Combined);

        setSeason2024Data({
          team1: team1Combined,
          team2: team2Combined
        });

        setTimeout(() => setAnimateStats(true), 300);
      } catch (err) {
        console.error('Error processing 2024 season data:', err);
        setError('Failed to process 2024 season data');
      } finally {
        setLoading(false);
      }
    };

    loadSeason2024Data();
  }, [team1?.school, team2?.school, team1Records, team2Records]);

  const fetchSeasonStats = async (teamName, year) => {
    try {
      const response = await fetch(
        `https://api.collegefootballdata.com/stats/season?year=${year}&team=${encodeURIComponent(teamName)}`,
        {
          headers: {
            'Authorization': 'Bearer p5M3+9PK7Kt1CIMox0hgi7zgyWKCeO86buPF+tEH/zPCExymKp+v+IBrl7rKucSq'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const stats = await response.json();
      
      // Convert array of stats to object for easier access
      const statsObject = {};
      stats.forEach(stat => {
        statsObject[stat.statName] = stat.statValue;
      });

      return {
        // Offensive stats
        totalYards: statsObject.totalYards || 0,
        rushingYards: statsObject.rushingYards || 0,
        netPassingYards: statsObject.netPassingYards || 0,
        passingTDs: statsObject.passingTDs || 0,
        rushingTDs: statsObject.rushingTDs || 0,
        // Defensive stats
        totalYardsOpponent: statsObject.totalYardsOpponent || 0,
        sacks: statsObject.sacks || 0,
        interceptions: statsObject.interceptions || 0,
        tacklesForLoss: statsObject.tacklesForLoss || 0
      };
    } catch (error) {
      console.error(`Error fetching season stats for ${teamName}:`, error);
      return {
        totalYards: 0,
        rushingYards: 0,
        netPassingYards: 0,
        passingTDs: 0,
        rushingTDs: 0,
        totalYardsOpponent: 0,
        sacks: 0,
        interceptions: 0,
        tacklesForLoss: 0
      };
    }
  };

  const calculate2024Stats = (record) => {
    return Promise.resolve({
      wins: record?.total?.wins || 0,
      losses: record?.total?.losses || 0,
      winPercentage: record?.total?.wins && record?.total?.losses 
        ? (record.total.wins / (record.total.wins + record.total.losses)) * 100 
        : 0,
      conferenceWins: record?.conferenceGames?.wins || 0,
      conferenceLosses: record?.conferenceGames?.losses || 0
    });
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

  // Modern Comparison Card Component
  const ModernComparisonCard = ({ title, subtitle, icon, value1, value2, team1, team2, animateStats, getTeamColor, getWinner, compareBy = 'value', team1Value, team2Value }) => {
    // Use custom values for comparison if provided, otherwise parse the display values
    const winner = compareBy === 'wins' && team1Value !== undefined && team2Value !== undefined 
      ? getWinner(team1Value, team2Value)
      : getWinner(value1, value2);
    
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
          <h3 className="text-2xl font-bold gradient-text">Loading 2024 Season...</h3>
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
          <i className="fas fa-calendar-day text-4xl gradient-text"></i>
          <h2 className="text-4xl font-black gradient-text">2024 Season</h2>
        </div>
        <p className="text-xl text-gray-600 font-light">
          Current Season Performance Comparison
        </p>
      </div>

      {/* Comparison Cards */}
      <div className="space-y-6">
        {/* Overall Record */}
        <ModernComparisonCard
          title="Overall Record"
          subtitle="2024 Season Wins-Losses"
          icon="chart-line"
          value1={`${season2024Data.team1.wins}-${season2024Data.team1.losses}`}
          value2={`${season2024Data.team2.wins}-${season2024Data.team2.losses}`}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
          compareBy="wins"
          team1Value={season2024Data.team1.wins}
          team2Value={season2024Data.team2.wins}
        />

        {/* Win Percentage */}
        <ModernComparisonCard
          title="Win Percentage"
          subtitle="2024 Season Success Rate"
          icon="percent"
          value1={season2024Data.team1.winPercentage.toFixed(1) + '%'}
          value2={season2024Data.team2.winPercentage.toFixed(1) + '%'}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Conference Record */}
        <ModernComparisonCard
          title="Conference Record"
          subtitle="Conference Play Performance"
          icon="trophy"
          value1={`${season2024Data.team1.conferenceWins}-${season2024Data.team1.conferenceLosses}`}
          value2={`${season2024Data.team2.conferenceWins}-${season2024Data.team2.conferenceLosses}`}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
          compareBy="wins"
          team1Value={season2024Data.team1.conferenceWins}
          team2Value={season2024Data.team2.conferenceWins}
        />

        {/* Total Yards */}
        <ModernComparisonCard
          title="Total Yards"
          subtitle="Total Offensive Production"
          icon="arrows-alt-h"
          value1={season2024Data.team1.totalYards.toLocaleString()}
          value2={season2024Data.team2.totalYards.toLocaleString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Rushing Yards */}
        <ModernComparisonCard
          title="Rushing Yards"
          subtitle="Ground Game Production"
          icon="running"
          value1={season2024Data.team1.rushingYards.toLocaleString()}
          value2={season2024Data.team2.rushingYards.toLocaleString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Passing Yards */}
        <ModernComparisonCard
          title="Passing Yards"
          subtitle="Aerial Attack Production"
          icon="paper-plane"
          value1={season2024Data.team1.netPassingYards.toLocaleString()}
          value2={season2024Data.team2.netPassingYards.toLocaleString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Total Touchdowns */}
        <ModernComparisonCard
          title="Total Touchdowns"
          subtitle="Passing + Rushing TDs"
          icon="football-ball"
          value1={(season2024Data.team1.passingTDs + season2024Data.team1.rushingTDs).toString()}
          value2={(season2024Data.team2.passingTDs + season2024Data.team2.rushingTDs).toString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Sacks */}
        <ModernComparisonCard
          title="Sacks"
          subtitle="Quarterback Pressures"
          icon="shield-alt"
          value1={season2024Data.team1.sacks.toString()}
          value2={season2024Data.team2.sacks.toString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Interceptions */}
        <ModernComparisonCard
          title="Interceptions"
          subtitle="Defensive Takeaways"
          icon="hand-paper"
          value1={season2024Data.team1.interceptions.toString()}
          value2={season2024Data.team2.interceptions.toString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Yards Allowed */}
        <ModernComparisonCard
          title="Yards Allowed"
          subtitle="Total Defensive Yards Allowed (Lower is Better)"
          icon="shield"
          value1={season2024Data.team1.totalYardsOpponent.toLocaleString()}
          value2={season2024Data.team2.totalYardsOpponent.toLocaleString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={(v1, v2) => getWinner(v2, v1)} // Reverse comparison for defensive stat
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
            <h4 className="font-bold text-gray-800 mb-2">Current Season</h4>
            <p className="text-sm">Comprehensive 2024 college football season statistics for both teams.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Metrics Included</h4>
            <p className="text-sm">Overall and conference records, total offensive production, rushing and passing statistics, touchdowns, and key defensive metrics including sacks, interceptions, and yards allowed.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Data Source</h4>
            <p className="text-sm">Statistics sourced from College Football Data API, providing official NCAA game data.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Season2024Tab;
