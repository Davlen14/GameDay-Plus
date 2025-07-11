import React, { useState, useEffect } from 'react';
import { teamService } from '../../../services/teamService';

const HeadToHeadTab = ({ team1, team2 }) => {
  const [headToHeadData, setHeadToHeadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    const loadHeadToHeadData = async () => {
      if (!team1?.school || !team2?.school) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get head-to-head matchup data
        const matchupData = await teamService.getTeamMatchup(team1.school, team2.school);
        
        if (matchupData && matchupData.games && matchupData.games.length > 0) {
          setHeadToHeadData(matchupData);
        } else {
          // No head-to-head data available
          setHeadToHeadData(null);
        }

        setTimeout(() => setAnimateStats(true), 300);
      } catch (err) {
        console.error('Error loading head-to-head data:', err);
        setError('Failed to load head-to-head data');
      } finally {
        setLoading(false);
      }
    };

    loadHeadToHeadData();
  }, [team1?.school, team2?.school]);

  const getTeamColor = (team) => {
    return team?.color || '#cc001c';
  };

  const getWinningTeam = (game) => {
    if (game.homeScore > game.awayScore) {
      return game.homeTeam === team1.school ? team1 : team2;
    } else if (game.awayScore > game.homeScore) {
      return game.awayTeam === team1.school ? team1 : team2;
    }
    return null; // Tie
  };

  const removeCommas = (number) => {
    return `${number}`;
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
          <h3 className="text-2xl font-bold gradient-text">Loading Head-to-Head...</h3>
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

  if (!headToHeadData || !headToHeadData.games || headToHeadData.games.length === 0) {
    return (
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center py-20">
          <div className="relative mb-8">
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl mx-auto"></div>
            <div className="relative w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center mx-auto">
              <i className="fas fa-handshake text-gray-400 text-3xl"></i>
            </div>
          </div>
          <h3 className="text-4xl font-black mb-4 gradient-text">No Head-to-Head Data</h3>
          <p className="text-xl text-gray-600 font-light">
            {team1?.school} and {team2?.school} have no recorded matchups in our database
          </p>
        </div>
      </div>
    );
  }

  const total = headToHeadData.team1Wins + headToHeadData.team2Wins + headToHeadData.ties;
  const team1Percentage = total > 0 ? (headToHeadData.team1Wins / total) * 100 : 0;
  const team2Percentage = total > 0 ? (headToHeadData.team2Wins / total) * 100 : 0;
  const recentGames = headToHeadData.games.slice(-5).reverse(); // Last 5 games, most recent first

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

      {/* Overall Record */}
      <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8 transition-all duration-500 ${animateStats ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex items-center justify-between">
          {/* Team 1 */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto flex items-center justify-center">
              {team1?.logos?.[0] ? (
                <img src={team1.logos[0]} alt={team1.school} className="w-full h-full object-contain drop-shadow-sm" />
              ) : (
                <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: getTeamColor(team1) }}>
                  {team1?.school?.[0]}
                </div>
              )}
            </div>
            
            <div className={`text-5xl font-black transition-all duration-600 ${animateStats ? 'opacity-100 scale-100' : 'opacity-60 scale-90'}`} 
                 style={{ color: getTeamColor(team1) }}>
              {headToHeadData.team1Wins}
            </div>
            
            <div className="text-sm font-medium text-gray-600">Wins</div>
          </div>

          {/* VS Section with Ties */}
          <div className="text-center space-y-4 mx-8">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-600 font-bold text-sm">VS</span>
            </div>
            
            <div className={`text-5xl font-black text-gray-500 transition-all duration-600 ${animateStats ? 'opacity-100 scale-100' : 'opacity-60 scale-90'}`}>
              {headToHeadData.ties}
            </div>
            
            <div className="text-sm font-medium text-gray-600">Ties</div>
          </div>

          {/* Team 2 */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto flex items-center justify-center">
              {team2?.logos?.[0] ? (
                <img src={team2.logos[0]} alt={team2.school} className="w-full h-full object-contain drop-shadow-sm" />
              ) : (
                <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: getTeamColor(team2) }}>
                  {team2?.school?.[0]}
                </div>
              )}
            </div>
            
            <div className={`text-5xl font-black transition-all duration-600 ${animateStats ? 'opacity-100 scale-100' : 'opacity-60 scale-90'}`} 
                 style={{ color: getTeamColor(team2) }}>
              {headToHeadData.team2Wins}
            </div>
            
            <div className="text-sm font-medium text-gray-600">Wins</div>
          </div>
        </div>
      </div>

      {/* Win Percentage Bar */}
      <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8 transition-all duration-500 ${animateStats ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="mb-6">
          <h3 className="text-2xl font-black gradient-text mb-2">WIN PERCENTAGE</h3>
        </div>

        <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
          {/* Team 1 Bar */}
          <div 
            className="absolute left-0 top-0 h-full rounded-l-full transition-all duration-1000 ease-out"
            style={{ 
              width: animateStats ? `${team1Percentage}%` : '0%',
              background: `linear-gradient(90deg, ${getTeamColor(team1)}dd, ${getTeamColor(team1)})`
            }}
          />
          
          {/* Team 2 Bar */}
          <div 
            className="absolute right-0 top-0 h-full rounded-r-full transition-all duration-1000 ease-out"
            style={{ 
              width: animateStats ? `${team2Percentage}%` : '0%',
              background: `linear-gradient(90deg, ${getTeamColor(team2)}dd, ${getTeamColor(team2)})`
            }}
          />

          {/* Percentage Labels */}
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              {team1Percentage > 15 && animateStats && team1?.logos?.[0] && (
                <img src={team1.logos[0]} alt={team1.school} className="w-5 h-5 object-contain" />
              )}
              {team1Percentage > 10 && (
                <span className="text-white font-bold text-sm">{team1Percentage.toFixed(1)}%</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {team2Percentage > 10 && (
                <span className="text-white font-bold text-sm">{team2Percentage.toFixed(1)}%</span>
              )}
              {team2Percentage > 15 && animateStats && team2?.logos?.[0] && (
                <img src={team2.logos[0]} alt={team2.school} className="w-5 h-5 object-contain" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Matchups */}
      <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8 transition-all duration-500 ${animateStats ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="mb-6">
          <h3 className="text-2xl font-black gradient-text mb-2">RECENT MATCHUPS</h3>
        </div>

        {/* Column Headers */}
        <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-200/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <span className="w-12">YEAR</span>
          <span className="w-8"></span>
          <span className="flex-1 text-center">MATCHUP</span>
          <span className="w-16 text-center">WINNER</span>
        </div>

        {/* Game Rows */}
        <div className="space-y-2 mt-4">
          {recentGames.map((game, index) => {
            const winningTeam = getWinningTeam(game);
            const isHomeTeam1 = game.homeTeam === team1.school;
            
            return (
              <div key={`${game.season}-${index}`} className="flex items-center gap-4 px-4 py-3 bg-white/30 rounded-xl hover:bg-white/40 transition-colors">
                {/* Year */}
                <span className="w-12 text-sm font-medium text-gray-700">
                  {removeCommas(game.season)}
                </span>

                {/* Home/Away Indicator */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" 
                     style={{ backgroundColor: isHomeTeam1 ? getTeamColor(team1) : getTeamColor(team2) }}>
                  {isHomeTeam1 ? 'H' : 'A'}
                </div>

                {/* Scores */}
                <div className="flex-1 flex items-center justify-center gap-2">
                  {/* Home Team */}
                  <div className="flex items-center gap-2">
                    {(isHomeTeam1 ? team1 : team2)?.logos?.[0] && (
                      <img src={(isHomeTeam1 ? team1 : team2).logos[0]} alt="" className="w-6 h-6 object-contain" />
                    )}
                    <span className="text-lg font-bold" style={{ color: getTeamColor(isHomeTeam1 ? team1 : team2) }}>
                      {game.homeScore}
                    </span>
                  </div>

                  <span className="text-gray-400 font-medium">-</span>

                  {/* Away Team */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold" style={{ color: getTeamColor(isHomeTeam1 ? team2 : team1) }}>
                      {game.awayScore}
                    </span>
                    {(isHomeTeam1 ? team2 : team1)?.logos?.[0] && (
                      <img src={(isHomeTeam1 ? team2 : team1).logos[0]} alt="" className="w-6 h-6 object-contain" />
                    )}
                  </div>
                </div>

                {/* Winner */}
                <div className="w-16 flex justify-center">
                  {winningTeam?.logos?.[0] ? (
                    <img src={winningTeam.logos[0]} alt="Winner" className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="text-gray-400 text-sm">TIE</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HeadToHeadTab;
