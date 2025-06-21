import React, { useState, useEffect } from 'react';
import gameStatsService from '../../../services/gameStatsService';

const KeyTeamStats = ({ 
  game, 
  teamStats, 
  awayColor, 
  homeColor, 
  animateCards 
}) => {
  const [animateValues, setAnimateValues] = useState(false);
  const [shimmer, setShimmer] = useState(false);

  useEffect(() => {
    if (animateCards) {
      setTimeout(() => setAnimateValues(true), 200);
      setShimmer(true);
    }
  }, [animateCards]);

  // Get team statistics for this specific game
  const getGameTeams = () => {
    if (!teamStats || !game) return [];
    
    // Filter by exact game ID first
    const gameSpecificStats = teamStats.filter(stat => 
      stat.game_id === game.id
    );
    
    if (gameSpecificStats.length >= 2) {
      // Sort by home/away to ensure consistent order
      return gameSpecificStats.sort((a, b) => {
        // Away team first, then home team
        if (a.home_away === 'away' && b.home_away === 'home') return -1;
        if (a.home_away === 'home' && b.home_away === 'away') return 1;
        return 0;
      }).slice(0, 2);
    }

    // Fallback to team name matching
    const awayTeamStats = teamStats.find(stat => 
      stat.school === game.away_team
    );
    const homeTeamStats = teamStats.find(stat => 
      stat.school === game.home_team
    );

    if (awayTeamStats && homeTeamStats) {
      return [awayTeamStats, homeTeamStats];
    }

    return [];
  };

  const gameTeams = getGameTeams();

  // Helper functions
  const calculateYardsPerPlay = (team) => {
    const totalYards = team.total_yards || 0;
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
    unit = '' 
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
                  color: awayHasAdvantage ? awayColor : homeColor 
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
            style={{ color: awayColor }}
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
                  background: `linear-gradient(to right, ${awayColor}, ${awayColor}80)`
                }}
              />
              
              {/* Home team bar (right side) */}
              <div
                className="absolute right-0 top-0 h-full transition-all duration-1000 ease-out rounded-r-full"
                style={{
                  width: animateValues ? `${homeWidth}%` : '0%',
                  background: `linear-gradient(to left, ${homeColor}, ${homeColor}80)`
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
            style={{ color: homeColor }}
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

  const [awayTeam, homeTeam] = gameTeams;

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
          <span 
            className="font-bold text-lg"
            style={{ color: awayColor }}
          >
            {awayTeam.school}
          </span>
          <span className="text-gray-400 font-medium">VS</span>
          <span 
            className="font-bold text-lg"
            style={{ color: homeColor }}
          >
            {homeTeam.school}
          </span>
        </div>
      </div>

      {/* Statistics Comparison */}
      <div className="px-6 py-6">
        <div className="space-y-1">
          {/* Total Yards */}
          <StatRow
            label="Total Yards"
            awayValue={awayTeam.total_yards || 0}
            homeValue={homeTeam.total_yards || 0}
            isHigherBetter={true}
            icon="chart-bar"
          />

          {/* Yards per Play */}
          <StatRow
            label="Yards per Play"
            awayValue={calculateYardsPerPlay(awayTeam)}
            homeValue={calculateYardsPerPlay(homeTeam)}
            isHigherBetter={true}
            icon="tachometer-alt"
          />

          {/* Third Down Efficiency */}
          <StatRow
            label="3rd Down Efficiency"
            awayValue={parseThirdDownEfficiency(awayTeam.third_down_eff).display}
            homeValue={parseThirdDownEfficiency(homeTeam.third_down_eff).display}
            isHigherBetter={true}
            icon="percentage"
          />

          {/* Rushing Yards */}
          <StatRow
            label="Rushing Yards"
            awayValue={awayTeam.rushing_yards || 0}
            homeValue={homeTeam.rushing_yards || 0}
            isHigherBetter={true}
            icon="running"
          />

          {/* Passing Yards */}
          <StatRow
            label="Passing Yards"
            awayValue={awayTeam.net_passing_yards || 0}
            homeValue={homeTeam.net_passing_yards || 0}
            isHigherBetter={true}
            icon="paper-plane"
          />

          {/* Turnovers */}
          <StatRow
            label="Turnovers"
            awayValue={awayTeam.turnovers || 0}
            homeValue={homeTeam.turnovers || 0}
            isHigherBetter={false}
            icon="exclamation-triangle"
          />

          {/* First Downs */}
          <StatRow
            label="First Downs"
            awayValue={awayTeam.first_downs || 0}
            homeValue={homeTeam.first_downs || 0}
            isHigherBetter={true}
            icon="flag-checkered"
          />
        </div>
      </div>
    </div>
  );
};

export default KeyTeamStats;
