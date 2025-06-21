import React from 'react';
import gameStatsService from '../../../services/gameStatsService';

const GameSummarySection = ({ 
  game, 
  gameStats, 
  expandedSection, 
  setExpandedSection, 
  awayColor, 
  homeColor, 
  animateCards 
}) => {
  
  const AnalysisSection = ({ title, icon, children, sectionKey }) => {
    const isExpanded = expandedSection === sectionKey || expandedSection === null;
    
    return (
      <div 
        className={`
          bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden
          transition-all duration-700 ease-out delay-200
          ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        {/* Section Header */}
        <button
          onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
          className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${awayColor}, ${homeColor})`
                }}
              >
                <i className={`fas fa-${icon} text-white`}></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            </div>
            
            <div className="flex items-center space-x-2">
              <i 
                className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-400 transition-transform duration-200`}
              ></i>
            </div>
          </div>
        </button>

        {/* Section Content */}
        {isExpanded && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <div className="pt-4">
              {children}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Game Summary Content
  const GameSummaryContent = () => {
    const outcome = gameStatsService.logic.getGameOutcome(game, gameStats.teamStats);
    const homeTeam = game.home_team || 'Home Team';
    const awayTeam = game.away_team || 'Away Team';
    const winner = outcome.winner === 'home' ? homeTeam : awayTeam;
    const loser = outcome.winner === 'home' ? awayTeam : homeTeam;

    // Generate outcome indicator
    const OutcomeIndicator = () => {
      const scoreDifference = outcome.scoreDifference;
      const winnerColor = outcome.winner === 'home' ? homeColor : awayColor;
      const progressWidth = Math.min((scoreDifference / 40) * 100, 100);

      return (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Game Outcome</span>
            <span className="text-sm text-gray-500">
              {scoreDifference} point margin
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${progressWidth}%`,
                backgroundColor: winnerColor
              }}
            />
          </div>
        </div>
      );
    };

    // Generate game result text
    const getGameResultText = () => {
      const { gameType, margin } = outcome;
      
      switch (gameType) {
        case 'blowout':
          return `${winner} dominated in a lopsided ${outcome.homeScore}-${outcome.awayScore} victory over ${loser} in Week ${game.week} of the ${game.season} season.`;
        case 'decisive':
          return `${winner} secured a convincing ${outcome.homeScore}-${outcome.awayScore} win against ${loser} in Week ${game.week} of the ${game.season} season.`;
        case 'close':
          return `${winner} claimed a solid ${outcome.homeScore}-${outcome.awayScore} victory over ${loser} in Week ${game.week} of the ${game.season} season.`;
        default:
          return `In a tightly contested matchup, ${winner} edged out ${loser} ${outcome.homeScore}-${outcome.awayScore} in Week ${game.week} of the ${game.season} season.`;
      }
    };

    // Statistical overview
    const homeStats = gameStatsService.logic.getTeamStats(true, game, gameStats.teamStats);
    const awayStats = gameStatsService.logic.getTeamStats(false, game, gameStats.teamStats);

    return (
      <div className="space-y-6">
        <OutcomeIndicator />
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed">
            {getGameResultText()}
          </p>
          
          {homeStats && awayStats && (
            <p className="text-gray-700 leading-relaxed mt-4">
              The game statistics reflect the {outcome.scoreDifference > 14 ? 'significant' : 'relative'} difference in performance. 
              <strong className="text-gray-900"> {homeTeam}</strong> generated <strong>{homeStats.total_yards || 0}</strong> total yards 
              ({homeStats.net_passing_yards || 0} passing, {homeStats.rushing_yards || 0} rushing) while 
              <strong className="text-gray-900"> {awayTeam}</strong> accumulated <strong>{awayStats.total_yards || 0}</strong> yards 
              ({awayStats.net_passing_yards || 0} passing, {awayStats.rushing_yards || 0} rushing).
            </p>
          )}
        </div>
      </div>
    );
  };

  // Key Players Content
  const KeyPlayersContent = () => {
    if (!gameStats.playerStats || gameStats.playerStats.length === 0) {
      return (
        <div className="text-center py-8">
          <i className="fas fa-user-friends text-3xl text-gray-300 mb-3"></i>
          <p className="text-gray-500">Player statistics not available for this game.</p>
        </div>
      );
    }

    const PlayerCard = ({ player, teamColor, statLabel }) => {
      if (!player) return null;

      return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: teamColor }}
              ></div>
              <span className="font-medium text-gray-900">{player.name}</span>
            </div>
            <span className="text-sm bg-gray-200 px-2 py-1 rounded">
              {player.position || 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{statLabel}</span>
            <span className="font-bold text-lg" style={{ color: teamColor }}>
              {player.stat || 0}
            </span>
          </div>
        </div>
      );
    };

    const topPassers = {
      home: gameStatsService.logic.getTopPassers(true, game, gameStats.playerStats)[0],
      away: gameStatsService.logic.getTopPassers(false, game, gameStats.playerStats)[0]
    };

    const topRushers = {
      home: gameStatsService.logic.getTopRushers(true, game, gameStats.playerStats)[0],
      away: gameStatsService.logic.getTopRushers(false, game, gameStats.playerStats)[0]
    };

    const topReceivers = {
      home: gameStatsService.logic.getTopReceivers(true, game, gameStats.playerStats)[0],
      away: gameStatsService.logic.getTopReceivers(false, game, gameStats.playerStats)[0]
    };

    return (
      <div className="space-y-6">
        {/* Quarterback Battle */}
        {(topPassers.home || topPassers.away) && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <i className="fas fa-football-ball mr-2 text-gray-600"></i>
              Quarterback Battle
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PlayerCard 
                player={topPassers.away} 
                teamColor={awayColor} 
                statLabel="Passing Yards" 
              />
              <PlayerCard 
                player={topPassers.home} 
                teamColor={homeColor} 
                statLabel="Passing Yards" 
              />
            </div>
          </div>
        )}

        {/* Ground Game */}
        {(topRushers.home || topRushers.away) && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <i className="fas fa-running mr-2 text-gray-600"></i>
              Ground Game
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PlayerCard 
                player={topRushers.away} 
                teamColor={awayColor} 
                statLabel="Rushing Yards" 
              />
              <PlayerCard 
                player={topRushers.home} 
                teamColor={homeColor} 
                statLabel="Rushing Yards" 
              />
            </div>
          </div>
        )}

        {/* Receiving Corps */}
        {(topReceivers.home || topReceivers.away) && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <i className="fas fa-hands-catching mr-2 text-gray-600"></i>
              Receiving Corps
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PlayerCard 
                player={topReceivers.away} 
                teamColor={awayColor} 
                statLabel="Receiving Yards" 
              />
              <PlayerCard 
                player={topReceivers.home} 
                teamColor={homeColor} 
                statLabel="Receiving Yards" 
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Game Impact Content
  const GameImpactContent = () => {
    const homeStats = gameStatsService.logic.getTeamStats(true, game, gameStats.teamStats);
    const awayStats = gameStatsService.logic.getTeamStats(false, game, gameStats.teamStats);
    
    if (!homeStats || !awayStats) {
      return (
        <div className="text-center py-8">
          <i className="fas fa-chart-line text-3xl text-gray-300 mb-3"></i>
          <p className="text-gray-500">Impact analysis not available.</p>
        </div>
      );
    }

    const impactFactors = [
      {
        label: 'Turnover Margin',
        awayValue: -(awayStats.turnovers || 0),
        homeValue: -(homeStats.turnovers || 0),
        icon: 'exchange-alt',
        description: 'Teams that protect the ball typically win games'
      },
      {
        label: 'Time of Possession',
        awayValue: gameStatsService.logic.parsePossessionTime(awayStats.possession_time) || 0,
        homeValue: gameStatsService.logic.parsePossessionTime(homeStats.possession_time) || 0,
        icon: 'clock',
        description: 'Controlling the clock can wear down opposing defenses'
      },
      {
        label: 'Third Down Success',
        awayValue: gameStatsService.logic.parseEfficiency(awayStats.third_down_eff)?.percentage || 0,
        homeValue: gameStatsService.logic.parseEfficiency(homeStats.third_down_eff)?.percentage || 0,
        icon: 'percentage',
        description: 'Sustaining drives is crucial for maintaining momentum'
      }
    ];

    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {impactFactors.map((factor, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <i className={`fas fa-${factor.icon} text-gray-600`}></i>
                  <span className="font-medium text-gray-900">{factor.label}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span style={{ color: awayColor }} className="font-bold">
                  {typeof factor.awayValue === 'number' ? factor.awayValue.toFixed(1) : factor.awayValue}
                </span>
                <span style={{ color: homeColor }} className="font-bold">
                  {typeof factor.homeValue === 'number' ? factor.homeValue.toFixed(1) : factor.homeValue}
                </span>
              </div>
              
              <p className="text-sm text-gray-600">{factor.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <AnalysisSection
        title="Game Summary"
        icon="chart-bar"
        sectionKey="summary"
      >
        <GameSummaryContent />
      </AnalysisSection>

      <AnalysisSection
        title="Key Players"
        icon="star"
        sectionKey="players"
      >
        <KeyPlayersContent />
      </AnalysisSection>

      <AnalysisSection
        title="Game Impact"
        icon="bolt"
        sectionKey="impact"
      >
        <GameImpactContent />
      </AnalysisSection>
    </div>
  );
};

export default GameSummarySection;
