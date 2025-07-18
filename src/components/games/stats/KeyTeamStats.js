import React, { useState, useEffect } from 'react';
import gameStatsService from '../../../services/gameStatsService';

const KeyTeamStats = ({ 
  game, 
  teamStats, 
  awayColor, 
  homeColor, 
  getTeamLogo,
  animateCards,
  awayTeam,
  homeTeam
}) => {
  const [animateValues, setAnimateValues] = useState(false);
  const [shimmer, setShimmer] = useState(false);

  useEffect(() => {
    if (animateCards) {
      setTimeout(() => setAnimateValues(true), 200);
      setShimmer(true);
    }
  }, [animateCards]);

  // Helper function to get team logo
  const getTeamLogoUrl = (isHome) => {
    // Check multiple possible ID field names
    let teamId = null;
    
    if (isHome) {
      teamId = game?.home_id || game?.homeId || game?.home_team_id;
    } else {
      teamId = game?.away_id || game?.awayId || game?.away_team_id;
    }
    
    // Debug logging
    console.log(`🏈 Logo lookup for ${isHome ? 'home' : 'away'}:`, {
      teamId,
      game_home_id: game?.home_id,
      game_away_id: game?.away_id,
      hasGetTeamLogo: !!getTeamLogo
    });
    
    // Use the passed getTeamLogo function if available and we have an ID
    if (getTeamLogo && teamId) {
      const logoUrl = getTeamLogo(teamId);
      if (logoUrl && logoUrl !== '/photos/ncaaf.png') {
        return logoUrl;
      }
    }
    
    // Fallback: Try to construct URL from team name
    const teamData = isHome ? homeTeamData : awayTeamData;
    if (teamData?.school) {
      const teamNameUrl = `/team_logos/${teamData.school.replace(/\s+/g, '_')}.png`;
      console.log(`🔄 Trying team name fallback: ${teamNameUrl}`);
      return teamNameUrl;
    }
    
    // Default fallback
    return '/photos/ncaaf.png';
  };

  // Get team statistics for this specific game
  const getGameTeams = () => {
    if (!teamStats) return [];
    
    console.log('🔍 Looking for teams in game:', game?.id);
    console.log('🔍 Available team stats:', teamStats);
    
    // Look for teams by homeAway property first (most reliable)
    const homeTeamStat = teamStats.find(stat => stat.homeAway === 'home');
    const awayTeamStat = teamStats.find(stat => stat.homeAway === 'away');
    
    const teams = [];
    if (awayTeamStat) teams.push(awayTeamStat);
    if (homeTeamStat) teams.push(homeTeamStat);
    
    if (teams.length >= 2) {
      console.log('✅ Found teams by homeAway:', teams);
      return teams;
    }

    // Fallback to team name matching using props or game object
    const awayTeamName = awayTeam || game?.away_team;
    const homeTeamName = homeTeam || game?.home_team;
    
    if (awayTeamName && homeTeamName) {
      const awayTeamStats = teamStats.find(stat => 
        stat.school === awayTeamName || stat.team === awayTeamName
      );
      const homeTeamStats = teamStats.find(stat => 
        stat.school === homeTeamName || stat.team === homeTeamName
      );

      const fallbackTeams = [];
      if (awayTeamStats) fallbackTeams.push(awayTeamStats);
      if (homeTeamStats) fallbackTeams.push(homeTeamStats);

      if (fallbackTeams.length >= 2) {
        console.log('✅ Found teams by name matching:', fallbackTeams);
        return fallbackTeams;
      }
    }

    // Final fallback: just use first two teams if we have them
    if (teamStats.length >= 2) {
      console.log('✅ Using first two teams as fallback:', teamStats.slice(0, 2));
      return teamStats.slice(0, 2);
    }

    return [];
  };

  const gameTeams = getGameTeams();

  // Helper functions
  const calculateYardsPerPlay = (team) => {
    const totalYards = team.totalYards || 0;
    const estimatedPlays = Math.max(50, Math.min(100, totalYards / 6));
    return (totalYards / estimatedPlays).toFixed(1);
  };

  const parseThirdDownEfficiency = (efficiency) => {
    if (!efficiency) return { percentage: 0, display: '0%' };
    
    const parsed = gameStatsService.logic.parseEfficiency(efficiency);
    if (!parsed) return { percentage: 0, display: '0%' };
    
    return {
      percentage: parsed.percentage,
      display: `${parsed.percentage.toFixed(0)}%`
    };
  };

  const StatRow = ({ 
    label, 
    awayValue, 
    homeValue, 
    isHigherBetter, 
    icon,
    unit = '',
    awayTeamColor = awayColor,
    homeTeamColor = homeColor
  }) => {
    // Parse values for comparison
    const awayNum = parseFloat(String(awayValue).replace(/[^0-9.-]/g, '')) || 0;
    const homeNum = parseFloat(String(homeValue).replace(/[^0-9.-]/g, '')) || 0;
    
    // Determine which team has the advantage
    const awayHasAdvantage = isHigherBetter ? (awayNum > homeNum) : (awayNum < homeNum);
    const homeHasAdvantage = isHigherBetter ? (homeNum > awayNum) : (homeNum < awayNum);
    const isTie = awayNum === homeNum;

    // Calculate bar widths
    const total = Math.max(awayNum + homeNum, 1);
    const awayWidth = (awayNum / total) * 100;
    const homeWidth = (homeNum / total) * 100;

    return (
      <div className="py-4">
        {/* Header row with label and icon */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <i className={`fas fa-${icon} text-gray-500 mr-2`}></i>
            <span className="font-medium text-gray-700">{label}</span>
          </div>
          
          {/* Winner indicator */}
          {!isTie && (
            <div className="flex items-center">
              <i 
                className="fas fa-crown text-xs"
                style={{ 
                  color: awayHasAdvantage ? awayTeamColor : homeTeamColor 
                }}
              ></i>
            </div>
          )}
        </div>

        {/* Data row with values and bar */}
        <div className="flex items-center justify-between">
          {/* Away team value */}
          <div 
            className="font-bold text-lg"
            style={{ color: awayTeamColor }}
          >
            {awayValue}{unit}
          </div>

          {/* Progress bar container */}
          <div className="flex-1 mx-6">
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              {/* Away team bar (left side) */}
              <div
                className="absolute left-0 top-0 h-full transition-all duration-1000 ease-out rounded-l-full"
                style={{
                  width: animateValues ? `${awayWidth}%` : '0%',
                  background: `linear-gradient(to right, ${awayTeamColor}, ${awayTeamColor}80)`
                }}
              />
              
              {/* Home team bar (right side) */}
              <div
                className="absolute right-0 top-0 h-full transition-all duration-1000 ease-out rounded-r-full"
                style={{
                  width: animateValues ? `${homeWidth}%` : '0%',
                  background: `linear-gradient(to left, ${homeTeamColor}, ${homeTeamColor}80)`
                }}
              />

              {/* Center divider for close values */}
              {Math.abs(awayWidth - homeWidth) < 10 && (
                <div className="absolute left-1/2 top-0 w-0.5 h-full bg-white transform -translate-x-0.5" />
              )}
            </div>
          </div>

          {/* Home team value */}
          <div 
            className="font-bold text-lg"
            style={{ color: homeTeamColor }}
          >
            {homeValue}{unit}
          </div>
        </div>
      </div>
    );
  };

  if (gameTeams.length < 2) {
    return (
      <div 
        className={`
          bg-white rounded-2xl shadow-lg border border-gray-100 p-6
          transition-all duration-700 ease-out delay-100
          ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        <div className="text-center py-8">
          <i className="fas fa-chart-bar text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Team Statistics Unavailable
          </h3>
          <p className="text-gray-500">
            Team comparison data not found for this game.
          </p>
        </div>
      </div>
    );
  }

  const [awayTeamData, homeTeamData] = gameTeams;

  return (
    <div 
      className={`
        bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden
        transition-all duration-700 ease-out delay-100
        ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Team Statistics</h3>
          
          {/* Live indicator */}
          <div className="flex items-center space-x-2 px-3 py-1 bg-white rounded-full shadow-sm">
            <div 
              className={`w-2 h-2 bg-green-500 rounded-full ${shimmer ? 'animate-pulse' : ''}`}
            ></div>
            <span className="text-xs font-medium text-gray-600">LIVE</span>
          </div>
        </div>
      </div>

      {/* Team Names Header */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={getTeamLogoUrl(false)}
              alt={`${awayTeamData.school} logo`}
              className="w-8 h-8 object-contain"
              onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
            />
            <span 
              className="font-bold text-lg"
              style={{ color: awayColor }}
            >
              {awayTeamData.school}
            </span>
          </div>
          <span className="text-gray-400 font-medium">VS</span>
          <div className="flex items-center space-x-3">
            <span 
              className="font-bold text-lg"
              style={{ color: homeColor }}
            >
              {homeTeamData.school}
            </span>
            <img
              src={getTeamLogoUrl(true)}
              alt={`${homeTeamData.school} logo`}
              className="w-8 h-8 object-contain"
              onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
            />
          </div>
        </div>
      </div>

      {/* Statistics Comparison */}
      <div className="px-6 py-6">
        <div className="space-y-1">
          {/* Total Yards */}
          <StatRow
            label="Total Yards"
            awayValue={awayTeamData.totalYards || 0}
            homeValue={homeTeamData.totalYards || 0}
            isHigherBetter={true}
            icon="chart-bar"
            awayTeamColor={awayColor}
            homeTeamColor={homeColor}
          />

          {/* Yards per Play */}
          <StatRow
            label="Yards per Play"
            awayValue={calculateYardsPerPlay(awayTeamData)}
            homeValue={calculateYardsPerPlay(homeTeamData)}
            isHigherBetter={true}
            icon="tachometer-alt"
            awayTeamColor={awayColor}
            homeTeamColor={homeColor}
          />

          {/* Third Down Efficiency */}
          <StatRow
            label="3rd Down Efficiency"
            awayValue={parseThirdDownEfficiency(awayTeamData.thirdDownEff).display}
            homeValue={parseThirdDownEfficiency(homeTeamData.thirdDownEff).display}
            isHigherBetter={true}
            icon="percentage"
            awayTeamColor={awayColor}
            homeTeamColor={homeColor}
          />

          {/* Rushing Yards */}
          <StatRow
            label="Rushing Yards"
            awayValue={awayTeamData.rushingYards || 0}
            homeValue={homeTeamData.rushingYards || 0}
            isHigherBetter={true}
            icon="running"
            awayTeamColor={awayColor}
            homeTeamColor={homeColor}
          />

          {/* Passing Yards */}
          <StatRow
            label="Passing Yards"
            awayValue={awayTeamData.netPassingYards || 0}
            homeValue={homeTeamData.netPassingYards || 0}
            isHigherBetter={true}
            icon="paper-plane"
            awayTeamColor={awayColor}
            homeTeamColor={homeColor}
          />

          {/* Turnovers */}
          <StatRow
            label="Turnovers"
            awayValue={awayTeamData.turnovers || 0}
            homeValue={homeTeamData.turnovers || 0}
            isHigherBetter={false}
            icon="exclamation-triangle"
            awayTeamColor={awayColor}
            homeTeamColor={homeColor}
          />

          {/* First Downs */}
          <StatRow
            label="First Downs"
            awayValue={awayTeamData.firstDowns || 0}
            homeValue={homeTeamData.firstDowns || 0}
            isHigherBetter={true}
            icon="flag-checkered"
            awayTeamColor={awayColor}
            homeTeamColor={homeColor}
          />
        </div>
      </div>
    </div>
  );
};

export default KeyTeamStats;
