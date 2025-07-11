import React, { useState, useEffect } from 'react';
import { teamService } from '../../../services/teamService';

const AllTimeTab = ({ team1, team2 }) => {
  const [allTimeData, setAllTimeData] = useState({
    team1: { wins: 0, winPercentage: 0, conferenceChampionships: 0, bowlGames: 0, bowlWins: 0, records: [] },
    team2: { wins: 0, winPercentage: 0, conferenceChampionships: 0, bowlGames: 0, bowlWins: 0, records: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    const loadAllTimeData = async () => {
      if (!team1?.school || !team2?.school) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get comprehensive historical data for both teams (like Swift version)
        const years = Array.from({ length: 15 }, (_, i) => 2024 - i); // Last 15 years for more data
        
        // Fetch real historical data including bowl games and championships
        console.log(`🔍 Loading comprehensive data for ${team1.school} vs ${team2.school}...`);
        
        const [team1Records, team2Records, team1BowlData, team2BowlData, team1ChampData, team2ChampData] = await Promise.all([
          Promise.all(years.map(year => teamService.getTeamRecords(team1.school, year))),
          Promise.all(years.map(year => teamService.getTeamRecords(team2.school, year))),
          // Get actual bowl game data for both teams
          Promise.all(years.map(async year => {
            try {
              const games = await teamService.getTeamGames(team1.school, year);
              const bowlGames = games?.filter(game => game.seasonType === 'postseason') || [];
              console.log(`📊 ${team1.school} ${year}: ${bowlGames.length} bowl games`);
              return bowlGames;
            } catch (err) {
              console.warn(`⚠️ Failed to get ${team1.school} games for ${year}:`, err.message);
              return [];
            }
          })),
          Promise.all(years.map(async year => {
            try {
              const games = await teamService.getTeamGames(team2.school, year);
              const bowlGames = games?.filter(game => game.seasonType === 'postseason') || [];
              console.log(`📊 ${team2.school} ${year}: ${bowlGames.length} bowl games`);
              return bowlGames;
            } catch (err) {
              console.warn(`⚠️ Failed to get ${team2.school} games for ${year}:`, err.message);
              return [];
            }
          })),
          // Get actual championship game data
          Promise.all(years.map(async year => {
            try {
              const games = await teamService.getTeamGames(team1.school, year);
              const champGames = games?.filter(game => 
                game.notes && (
                  game.notes.toLowerCase().includes('championship') ||
                  game.notes.toLowerCase().includes('conference championship') ||
                  game.notes.toLowerCase().includes('title')
                )
              ) || [];
              if (champGames.length > 0) {
                console.log(`🏆 ${team1.school} ${year}: ${champGames.length} championship games`);
              }
              return champGames;
            } catch (err) {
              console.warn(`⚠️ Failed to get ${team1.school} championship data for ${year}:`, err.message);
              return [];
            }
          })),
          Promise.all(years.map(async year => {
            try {
              const games = await teamService.getTeamGames(team2.school, year);
              const champGames = games?.filter(game => 
                game.notes && (
                  game.notes.toLowerCase().includes('championship') ||
                  game.notes.toLowerCase().includes('conference championship') ||
                  game.notes.toLowerCase().includes('title')
                )
              ) || [];
              if (champGames.length > 0) {
                console.log(`🏆 ${team2.school} ${year}: ${champGames.length} championship games`);
              }
              return champGames;
            } catch (err) {
              console.warn(`⚠️ Failed to get ${team2.school} championship data for ${year}:`, err.message);
              return [];
            }
          }))
        ]);

        // Calculate comprehensive totals (like Swift totalWins function)
        const calculateAllTimeTotals = (recordsArray) => {
          const flattened = recordsArray.flat().filter(record => record && record.total);
          return flattened.reduce((acc, record) => {
            acc.wins += record.total.wins || 0;
            acc.losses += record.total.losses || 0;
            acc.ties += record.total.ties || 0;
            acc.gamesPlayed += record.gamesPlayed || 0;
            acc.conferenceWins += record.conferenceGames?.wins || 0;
            return acc;
          }, { wins: 0, losses: 0, ties: 0, gamesPlayed: 0, conferenceWins: 0 });
        };

        // Calculate real bowl game statistics
        const calculateBowlStats = (bowlGamesArray, teamName) => {
          const allBowlGames = bowlGamesArray.flat();
          const bowlGames = allBowlGames.length;
          
          const bowlWins = allBowlGames.filter(game => {
            const isHomeTeam = game.homeTeam === teamName;
            const teamPoints = isHomeTeam ? game.homePoints : game.awayPoints;
            const opponentPoints = isHomeTeam ? game.awayPoints : game.homePoints;
            return teamPoints > opponentPoints;
          }).length;
          
          return { bowlGames, bowlWins };
        };

        // Calculate real championship statistics
        const calculateChampionshipStats = (champGamesArray, teamName) => {
          const allChampGames = champGamesArray.flat();
          
          const championships = allChampGames.filter(game => {
            const isHomeTeam = game.homeTeam === teamName;
            const teamPoints = isHomeTeam ? game.homePoints : game.awayPoints;
            const opponentPoints = isHomeTeam ? game.awayPoints : game.homePoints;
            return teamPoints > opponentPoints; // Won the championship game
          }).length;
          
          return championships;
        };

        const team1Totals = calculateAllTimeTotals(team1Records);
        const team2Totals = calculateAllTimeTotals(team2Records);

        // Calculate win percentages (like Swift winPercentage function)
        const calculateWinPercentage = (totals) => {
          const totalGames = totals.wins + totals.losses + totals.ties;
          return totalGames > 0 ? (totals.wins / totalGames) * 100 : 0;
        };

        const team1WinPct = calculateWinPercentage(team1Totals);
        const team2WinPct = calculateWinPercentage(team2Totals);

        // Get real bowl and championship data
        const team1BowlStats = calculateBowlStats(team1BowlData, team1.school);
        const team2BowlStats = calculateBowlStats(team2BowlData, team2.school);
        
        const team1Championships = calculateChampionshipStats(team1ChampData, team1.school);
        const team2Championships = calculateChampionshipStats(team2ChampData, team2.school);

        // Log final statistics
        console.log(`📈 Final Stats for ${team1.school}:`, {
          wins: team1Totals.wins,
          winPct: team1WinPct.toFixed(1) + '%',
          bowlGames: team1BowlStats.bowlGames,
          bowlWins: team1BowlStats.bowlWins,
          championships: team1Championships
        });
        
        console.log(`📈 Final Stats for ${team2.school}:`, {
          wins: team2Totals.wins,
          winPct: team2WinPct.toFixed(1) + '%',
          bowlGames: team2BowlStats.bowlGames,
          bowlWins: team2BowlStats.bowlWins,
          championships: team2Championships
        });

        setAllTimeData({
          team1: {
            wins: team1Totals.wins,
            winPercentage: team1WinPct,
            conferenceChampionships: team1Championships,
            bowlGames: team1BowlStats.bowlGames,
            bowlWins: team1BowlStats.bowlWins,
            records: team1Records.flat(),
            totalGames: team1Totals.wins + team1Totals.losses + team1Totals.ties
          },
          team2: {
            wins: team2Totals.wins,
            winPercentage: team2WinPct,
            conferenceChampionships: team2Championships,
            bowlGames: team2BowlStats.bowlGames,
            bowlWins: team2BowlStats.bowlWins,
            records: team2Records.flat(),
            totalGames: team2Totals.wins + team2Totals.losses + team2Totals.ties
          }
        });

        setTimeout(() => setAnimateCards(true), 300);
      } catch (err) {
        console.error('Error loading all-time data:', err);
        setError('Failed to load all-time data');
      } finally {
        setLoading(false);
      }
    };

    loadAllTimeData();
  }, [team1?.school, team2?.school]);

  const getTeamColor = (team) => {
    return team?.color || '#cc001c';
  };

  const getWinner = (value1, value2) => {
    if (value1 > value2) return 'team1';
    if (value2 > value1) return 'team2';
    return 'tie';
  };

  const WinnerBadge = () => (
    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full border border-green-300">
      <i className="fas fa-star text-green-600 text-xs"></i>
      <span className="text-green-700 font-bold text-xs">WINNER</span>
    </div>
  );

  const ModernStatsCard = ({ title, subtitle, icon, value1, value2, animateCards, gradientColor }) => {
    const winner = getWinner(parseFloat(value1), parseFloat(value2));
    
    return (
      <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8 transition-all duration-500 ${animateCards ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Card Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center" style={{ background: gradientColor }}>
            <i className={`${icon} text-white text-xl`}></i>
          </div>
          <div>
            <h3 className="text-2xl font-black gradient-text">{title}</h3>
            <p className="text-gray-600 text-sm">{subtitle}</p>
          </div>
        </div>

        {/* Team Comparison */}
        <div className="flex items-center">
          {/* Team 1 */}
          <div className="flex-1 text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              {team1?.logos?.[0] ? (
                <img src={team1.logos[0]} alt={team1.school} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-2xl" style={{ backgroundColor: getTeamColor(team1) }}>
                  {team1?.school?.[0]}
                </div>
              )}
            </div>
            <div className="text-4xl font-black mb-2" style={{ color: getTeamColor(team1) }}>
              {value1}
            </div>
            {winner === 'team1' && <WinnerBadge />}
          </div>

          {/* VS Section */}
          <div className="flex flex-col items-center mx-8">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <span className="text-gray-600 font-bold">VS</span>
            </div>
            <i className="fas fa-arrow-right text-green-500 text-xl"></i>
          </div>

          {/* Team 2 */}
          <div className="flex-1 text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              {team2?.logos?.[0] ? (
                <img src={team2.logos[0]} alt={team2.school} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-2xl" style={{ backgroundColor: getTeamColor(team2) }}>
                  {team2?.school?.[0]}
                </div>
              )}
            </div>
            <div className="text-4xl font-black mb-2" style={{ color: getTeamColor(team2) }}>
              {value2}
            </div>
            {winner === 'team2' && <WinnerBadge />}
          </div>
        </div>
      </div>
    );
  };

  const CircularProgress = ({ percentage, color, size = 120 }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={animateCards ? strokeDashoffset : circumference}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {percentage.toFixed(1)}%
          </span>
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
          <h3 className="text-2xl font-bold gradient-text">Loading All-Time Stats...</h3>
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

  // Professional gradient system from FanForums
  const professionalGradients = {
    red: `linear-gradient(135deg, 
      rgb(239, 68, 68), 
      rgb(220, 38, 38), 
      rgb(185, 28, 28), 
      rgb(220, 38, 38), 
      rgb(239, 68, 68)
    )`,
    blue: `linear-gradient(135deg, 
      rgb(59, 130, 246), 
      rgb(37, 99, 235), 
      rgb(29, 78, 216), 
      rgb(37, 99, 235), 
      rgb(59, 130, 246)
    )`,
    green: `linear-gradient(135deg, 
      rgb(34, 197, 94), 
      rgb(22, 163, 74), 
      rgb(15, 118, 54), 
      rgb(22, 163, 74), 
      rgb(34, 197, 94)
    )`,
    gold: `linear-gradient(135deg, 
      rgb(250, 204, 21), 
      rgb(245, 158, 11), 
      rgb(217, 119, 6), 
      rgb(245, 158, 11), 
      rgb(250, 204, 21)
    )`,
    emerald: `linear-gradient(135deg, 
      rgb(16, 185, 129), 
      rgb(5, 150, 105), 
      rgb(4, 120, 87), 
      rgb(5, 150, 105), 
      rgb(16, 185, 129)
    )`,
    purple: `linear-gradient(135deg, 
      rgb(168, 85, 247), 
      rgb(139, 69, 219), 
      rgb(124, 58, 193), 
      rgb(139, 69, 219), 
      rgb(168, 85, 247)
    )`
  };

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
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center" style={{ background: professionalGradients.red }}>
            <i className="fas fa-chart-bar text-white text-xl"></i>
          </div>
          <div>
            <h2 className="text-4xl font-black gradient-text">All Time Stats</h2>
            <p className="text-gray-600">Complete Historical Performance Analysis</p>
          </div>
        </div>
      </div>

      {/* All-time Wins */}
      <ModernStatsCard 
        title="All-Time Wins"
        subtitle="Total victories in program history"
        icon="fas fa-trophy"
        value1={allTimeData.team1.wins}
        value2={allTimeData.team2.wins}
        animateCards={animateCards}
        gradientColor={professionalGradients.gold}
      />

      {/* Win Percentage with Circular Progress */}
      <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8 transition-all duration-500 ${animateCards ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center" style={{ background: professionalGradients.blue }}>
            <i className="fas fa-percentage text-white text-xl"></i>
          </div>
          <div>
            <h3 className="text-2xl font-black gradient-text">Win Percentage</h3>
            <p className="text-gray-600 text-sm">Historical winning rate</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-16">
          <div className="text-center">
            <CircularProgress 
              percentage={allTimeData.team1.winPercentage} 
              color={getTeamColor(team1)}
            />
            <div className="mt-4">
              <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                {team1?.logos?.[0] ? (
                  <img src={team1.logos[0]} alt={team1.school} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: getTeamColor(team1) }}>
                    {team1?.school?.[0]}
                  </div>
                )}
              </div>
              {getWinner(allTimeData.team1.winPercentage, allTimeData.team2.winPercentage) === 'team1' && <WinnerBadge />}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <span className="text-gray-600 font-bold">VS</span>
            </div>
            <i className="fas fa-arrow-right text-green-500 text-xl"></i>
          </div>

          <div className="text-center">
            <CircularProgress 
              percentage={allTimeData.team2.winPercentage} 
              color={getTeamColor(team2)}
            />
            <div className="mt-4">
              <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                {team2?.logos?.[0] ? (
                  <img src={team2.logos[0]} alt={team2.school} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: getTeamColor(team2) }}>
                    {team2?.school?.[0]}
                  </div>
                )}
              </div>
              {getWinner(allTimeData.team1.winPercentage, allTimeData.team2.winPercentage) === 'team2' && <WinnerBadge />}
            </div>
          </div>
        </div>
      </div>

      {/* Conference Championships */}
      <ModernStatsCard 
        title="Conference Championships"
        subtitle="Conference titles won"
        icon="fas fa-crown"
        value1={allTimeData.team1.conferenceChampionships}
        value2={allTimeData.team2.conferenceChampionships}
        animateCards={animateCards}
        gradientColor={professionalGradients.purple}
      />

      {/* Bowl Games */}
      <ModernStatsCard 
        title="Bowl Games"
        subtitle={`Appearances / Wins`}
        icon="fas fa-medal"
        value1={`${allTimeData.team1.bowlGames} / ${allTimeData.team1.bowlWins}`}
        value2={`${allTimeData.team2.bowlGames} / ${allTimeData.team2.bowlWins}`}
        animateCards={animateCards}
        gradientColor={professionalGradients.emerald}
      />

      {/* Info Section */}
      <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-6 transition-all duration-500 ${animateCards ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: professionalGradients.red }}>
            <i className="fas fa-info-circle text-white text-sm"></i>
          </div>
          <h3 className="text-xl font-black gradient-text">About This Data</h3>
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          <p><strong>Data Sources:</strong> Statistics compiled from recent seasons (2015-2024)</p>
          <p><strong>Note:</strong> Some historical data may be estimates. Bowl game and championship data are approximations based on available records.</p>
        </div>
      </div>
    </div>
  );
};

export default AllTimeTab;
