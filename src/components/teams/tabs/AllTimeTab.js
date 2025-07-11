import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { teamService } from '../../../services/teamService';

const AllTimeTab = ({ team1, team2 }) => {
  const [allTimeData, setAllTimeData] = useState({
    team1: { wins: 0, winPercentage: 0, conferenceChampionships: 0, bowlGames: 0, bowlWins: 0, records: [] },
    team2: { wins: 0, winPercentage: 0, conferenceChampionships: 0, bowlGames: 0, bowlWins: 0, records: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);
  const [animateShine, setAnimateShine] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [chartData, setChartData] = useState({ team1WinsData: [], team2WinsData: [] });

  // Chart years (2014-2024 like Swift)
  const years = useMemo(() => Array.from({ length: 11 }, (_, i) => 2014 + i), []);

  // Utility functions matching Swift implementation
  const calculateAllTimeWins = useCallback((records) => {
    return records.reduce((total, record) => total + (record.total?.wins || 0), 0);
  }, []);

  const calculateWinPercentage = useCallback((records) => {
    const totalWins = records.reduce((sum, record) => sum + (record.total?.wins || 0), 0);
    const totalLosses = records.reduce((sum, record) => sum + (record.total?.losses || 0), 0);
    const totalTies = records.reduce((sum, record) => sum + (record.total?.ties || 0), 0);
    const totalGames = totalWins + totalLosses + totalTies;
    return totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
  }, []);

  const getConferenceChampionships = useCallback((champGamesArray) => {
    return champGamesArray.flat().length;
  }, []);

  const getBowlGameStats = useCallback((bowlGamesArray, teamName) => {
    const allBowlGames = bowlGamesArray.flat();
    const bowlGames = allBowlGames.length;
    
    const bowlWins = allBowlGames.filter(game => {
      const isHomeTeam = game.homeTeam === teamName;
      const teamPoints = isHomeTeam ? game.homePoints : game.awayPoints;
      const opponentPoints = isHomeTeam ? game.awayPoints : game.homePoints;
      return teamPoints > opponentPoints;
    }).length;
    
    return { bowlGames, bowlWins };
  }, []);

  const getTeamColor = useCallback((team) => {
    return team?.color || '#cc001c';
  }, []);

  // Chart helper functions matching Swift ChartHelpers
  const ChartHelpers = useMemo(() => ({
    dataToPoint: (year, wins, maxY, years, geometry) => {
      const index = years.findIndex(y => y === year);
      const x = ChartHelpers.xPosition(index, years.length, geometry.width);
      const y = geometry.height - (wins / maxY) * geometry.height;
      return { x, y };
    },
    xPosition: (index, count, width) => {
      if (count <= 1) return width / 2;
      return (width * index) / (count - 1);
    }
  }), []);

  // Cache key for localStorage
  const cacheKey = useMemo(() => 
    `alltime_${team1?.school}_${team2?.school}`, 
    [team1?.school, team2?.school]
  );

  useEffect(() => {
    const loadAllTimeData = async () => {
      if (!team1?.school || !team2?.school) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          if (Date.now() - cachedData.timestamp < 3600000) { // 1 hour cache
            setAllTimeData(cachedData.data);
            setChartData(cachedData.chartData);
            setTimeout(() => {
              setAnimateCards(true);
              setAnimateShine(true);
            }, 300);
            setLoading(false);
            return;
          }
        }

        console.log(`🔍 Loading comprehensive data for ${team1.school} vs ${team2.school}...`);
        
        // Fetch comprehensive data like Swift implementation
        const [team1Records, team2Records, team1BowlData, team2BowlData, team1ChampData, team2ChampData] = await Promise.all([
          Promise.all(years.map(year => teamService.getTeamRecords(team1.school, year))),
          Promise.all(years.map(year => teamService.getTeamRecords(team2.school, year))),
          // Get actual bowl game data
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
          // Get championship data
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
              return [];
            }
          }))
        ]);

        // Calculate all-time statistics using utility functions
        const team1AllRecords = team1Records.flat();
        const team2AllRecords = team2Records.flat();

        const team1Stats = {
          wins: calculateAllTimeWins(team1AllRecords),
          winPercentage: calculateWinPercentage(team1AllRecords),
          conferenceChampionships: getConferenceChampionships(team1ChampData),
          bowlGames: getBowlGameStats(team1BowlData, team1.school).bowlGames,
          bowlWins: getBowlGameStats(team1BowlData, team1.school).bowlWins,
          records: team1AllRecords
        };

        const team2Stats = {
          wins: calculateAllTimeWins(team2AllRecords),
          winPercentage: calculateWinPercentage(team2AllRecords),
          conferenceChampionships: getConferenceChampionships(team2ChampData),
          bowlGames: getBowlGameStats(team2BowlData, team2.school).bowlGames,
          bowlWins: getBowlGameStats(team2BowlData, team2.school).bowlWins,
          records: team2AllRecords
        };

        // Create chart data like Swift WinData structure
        const team1WinsData = years.map(year => {
          const record = team1AllRecords.find(r => r.year === year);
          return {
            id: `${team1.school}-${year}`,
            year,
            wins: record?.total?.wins || 0,
            team: team1
          };
        });

        const team2WinsData = years.map(year => {
          const record = team2AllRecords.find(r => r.year === year);
          return {
            id: `${team2.school}-${year}`,
            year,
            wins: record?.total?.wins || 0,
            team: team2
          };
        });

        const finalData = { team1: team1Stats, team2: team2Stats };
        const finalChartData = { team1WinsData, team2WinsData };

        setAllTimeData(finalData);
        setChartData(finalChartData);

        // Cache the results
        localStorage.setItem(cacheKey, JSON.stringify({
          data: finalData,
          chartData: finalChartData,
          timestamp: Date.now()
        }));

        console.log(`📈 Final Stats for ${team1.school}:`, team1Stats);
        console.log(`📈 Final Stats for ${team2.school}:`, team2Stats);

        setTimeout(() => {
          setAnimateCards(true);
          setAnimateShine(true);
        }, 300);

      } catch (err) {
        console.error('Error loading all-time data:', err);
        setError('Failed to load all-time data');
      } finally {
        setLoading(false);
      }
    };

    loadAllTimeData();
  }, [team1?.school, team2?.school, years, cacheKey, calculateAllTimeWins, calculateWinPercentage, getConferenceChampionships, getBowlGameStats]);

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

  // Interactive Chart Component (matching Swift modernWinsOverYearsChart)
  const ModernWinsOverYearsChart = () => {
    const maxWins = useMemo(() => {
      const allWins = [...chartData.team1WinsData, ...chartData.team2WinsData].map(d => d.wins);
      return Math.max(15, Math.max(...allWins)); // Minimum 15 like Swift
    }, [chartData]);

    const handleYearClick = useCallback((year) => {
      setSelectedYear(selectedYear === year ? null : year);
    }, [selectedYear]);

    return (
      <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8 transition-all duration-500 ${animateCards ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Card Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center" style={{ background: professionalGradients.blue }}>
            <i className="fas fa-chart-line text-white text-xl"></i>
          </div>
          <div>
            <h3 className="text-2xl font-black gradient-text">Wins Over Years</h3>
            <p className="text-gray-600 text-sm">Historical performance trends (2014-2024)</p>
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative h-80 mb-6">
          <svg className="w-full h-full" viewBox="0 0 800 300">
            {/* Grid Lines */}
            {Array.from({ length: 4 }, (_, i) => (
              <line
                key={i}
                x1="40"
                y1={60 + (i * 60)}
                x2="760"
                y2={60 + (i * 60)}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="1"
              />
            ))}
            {years.map((year, i) => {
              if (i % 2 === 0) {
                const x = 40 + (i * (720 / (years.length - 1)));
                return (
                  <line
                    key={year}
                    x1={x}
                    y1="60"
                    x2={x}
                    y2="240"
                    stroke="rgba(0,0,0,0.1)"
                    strokeWidth="1"
                  />
                );
              }
              return null;
            })}

            {/* Team 1 Line */}
            <path
              d={chartData.team1WinsData.map((data, i) => {
                const x = 40 + (i * (720 / (years.length - 1)));
                const y = 240 - (data.wins / maxWins) * 180;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke={getTeamColor(team1)}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-1000"
              style={{
                filter: `drop-shadow(0 2px 4px ${getTeamColor(team1)}40)`,
                strokeDasharray: animateCards ? 'none' : '10,10',
                animation: animateCards ? 'none' : 'drawLine 2s ease-in-out forwards'
              }}
            />

            {/* Team 2 Line */}
            <path
              d={chartData.team2WinsData.map((data, i) => {
                const x = 40 + (i * (720 / (years.length - 1)));
                const y = 240 - (data.wins / maxWins) * 180;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke={getTeamColor(team2)}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-1000"
              style={{
                filter: `drop-shadow(0 2px 4px ${getTeamColor(team2)}40)`,
                strokeDasharray: animateCards ? 'none' : '10,10',
                animation: animateCards ? 'none' : 'drawLine 2s ease-in-out forwards 0.5s'
              }}
            />

            {/* Interactive Points */}
            {chartData.team1WinsData.map((data, i) => {
              const x = 40 + (i * (720 / (years.length - 1)));
              const y = 240 - (data.wins / maxWins) * 180;
              return (
                <circle
                  key={`team1-${data.year}`}
                  cx={x}
                  cy={y}
                  r={selectedYear === data.year ? "8" : "6"}
                  fill={getTeamColor(team1)}
                  className="cursor-pointer transition-all duration-200 hover:r-8"
                  onClick={() => handleYearClick(data.year)}
                  style={{
                    filter: `drop-shadow(0 2px 4px ${getTeamColor(team1)}60)`
                  }}
                />
              );
            })}

            {chartData.team2WinsData.map((data, i) => {
              const x = 40 + (i * (720 / (years.length - 1)));
              const y = 240 - (data.wins / maxWins) * 180;
              return (
                <circle
                  key={`team2-${data.year}`}
                  cx={x}
                  cy={y}
                  r={selectedYear === data.year ? "8" : "6"}
                  fill={getTeamColor(team2)}
                  className="cursor-pointer transition-all duration-200 hover:r-8"
                  onClick={() => handleYearClick(data.year)}
                  style={{
                    filter: `drop-shadow(0 2px 4px ${getTeamColor(team2)}60)`
                  }}
                />
              );
            })}

            {/* Axis Labels */}
            {years.map((year, i) => {
              if (i % 2 === 0) {
                const x = 40 + (i * (720 / (years.length - 1)));
                return (
                  <text
                    key={year}
                    x={x}
                    y="260"
                    textAnchor="middle"
                    fontSize="12"
                    fill="#666"
                    className="font-medium"
                  >
                    {year}
                  </text>
                );
              }
              return null;
            })}

            {/* Y-axis labels */}
            {[0, 5, 10, 15].map(value => (
              <text
                key={value}
                x="30"
                y={240 - (value / maxWins) * 180 + 5}
                textAnchor="end"
                fontSize="12"
                fill="#666"
                className="font-medium"
              >
                {value}
              </text>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center">
              {team1?.logos?.[0] ? (
                <img src={team1.logos[0]} alt={team1.school} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: getTeamColor(team1) }}>
                  {team1?.school?.[0]}
                </div>
              )}
            </div>
            <div className="w-6 h-1 rounded" style={{ backgroundColor: getTeamColor(team1) }}></div>
            <span className="font-medium text-gray-700">{team1.school}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center">
              {team2?.logos?.[0] ? (
                <img src={team2.logos[0]} alt={team2.school} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: getTeamColor(team2) }}>
                  {team2?.school?.[0]}
                </div>
              )}
            </div>
            <div className="w-6 h-1 rounded" style={{ backgroundColor: getTeamColor(team2) }}></div>
            <span className="font-medium text-gray-700">{team2.school}</span>
          </div>
        </div>

        {/* Selected Year Info */}
        {selectedYear && (
          <div className="bg-gray-50 rounded-2xl p-6 transition-all duration-300">
            <h4 className="text-xl font-bold text-center mb-4">{selectedYear} Season Comparison</h4>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  {team1?.logos?.[0] ? (
                    <img src={team1.logos[0]} alt={team1.school} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: getTeamColor(team1) }}>
                      {team1?.school?.[0]}
                    </div>
                  )}
                </div>
                <div className="font-bold text-2xl" style={{ color: getTeamColor(team1) }}>
                  {chartData.team1WinsData.find(d => d.year === selectedYear)?.wins || 0}
                </div>
                <div className="text-sm text-gray-600">wins</div>
              </div>
              <div className="text-2xl font-bold text-gray-400">VS</div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  {team2?.logos?.[0] ? (
                    <img src={team2.logos[0]} alt={team2.school} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: getTeamColor(team2) }}>
                      {team2?.school?.[0]}
                    </div>
                  )}
                </div>
                <div className="font-bold text-2xl" style={{ color: getTeamColor(team2) }}>
                  {chartData.team2WinsData.find(d => d.year === selectedYear)?.wins || 0}
                </div>
                <div className="text-sm text-gray-600">wins</div>
              </div>
            </div>
          </div>
        )}
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
        @keyframes drawLine {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>

      {/* Modern Header with shine animation */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div 
            className={`w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center ${animateShine ? 'animate-shimmer' : ''}`} 
            style={{ background: professionalGradients.gold }}
          >
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

      {/* Win Percentage with Enhanced Circular Progress */}
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
            {getWinner(allTimeData.team1.winPercentage, allTimeData.team2.winPercentage) !== 'tie' && (
              <i className={`fas fa-arrow-right text-green-500 text-xl transition-all duration-500 ${animateShine ? 'animate-shimmer' : ''}`}></i>
            )}
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

      {/* Enhanced Bowl Games with Win Rate */}
      <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8 transition-all duration-500 ${animateCards ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center" style={{ background: professionalGradients.emerald }}>
            <i className="fas fa-medal text-white text-xl"></i>
          </div>
          <div>
            <h3 className="text-2xl font-black gradient-text">Bowl Games</h3>
            <p className="text-gray-600 text-sm">Postseason appearances and performance</p>
          </div>
        </div>

        <div className="flex items-center">
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
            <div className="mb-2">
              <div className="text-3xl font-black" style={{ color: getTeamColor(team1) }}>
                {allTimeData.team1.bowlGames}
              </div>
              <div className="text-sm text-gray-600">appearances</div>
            </div>
            <div className="mb-4">
              <div className="text-2xl font-bold text-green-600">
                {allTimeData.team1.bowlWins}
              </div>
              <div className="text-sm text-gray-600">wins</div>
            </div>
            {/* Bowl Win Rate Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
                style={{ 
                  width: animateCards ? `${allTimeData.team1.bowlGames > 0 ? (allTimeData.team1.bowlWins / allTimeData.team1.bowlGames) * 100 : 0}%` : '0%' 
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">
              {allTimeData.team1.bowlGames > 0 ? ((allTimeData.team1.bowlWins / allTimeData.team1.bowlGames) * 100).toFixed(1) : 0}% win rate
            </div>
            {getWinner(
              allTimeData.team1.bowlGames > 0 ? allTimeData.team1.bowlWins / allTimeData.team1.bowlGames : 0,
              allTimeData.team2.bowlGames > 0 ? allTimeData.team2.bowlWins / allTimeData.team2.bowlGames : 0
            ) === 'team1' && <WinnerBadge />}
          </div>

          <div className="flex flex-col items-center mx-8">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <span className="text-gray-600 font-bold">VS</span>
            </div>
            <i className={`fas fa-arrow-right text-green-500 text-xl ${animateShine ? 'animate-shimmer' : ''}`}></i>
          </div>

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
            <div className="mb-2">
              <div className="text-3xl font-black" style={{ color: getTeamColor(team2) }}>
                {allTimeData.team2.bowlGames}
              </div>
              <div className="text-sm text-gray-600">appearances</div>
            </div>
            <div className="mb-4">
              <div className="text-2xl font-bold text-green-600">
                {allTimeData.team2.bowlWins}
              </div>
              <div className="text-sm text-gray-600">wins</div>
            </div>
            {/* Bowl Win Rate Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
                style={{ 
                  width: animateCards ? `${allTimeData.team2.bowlGames > 0 ? (allTimeData.team2.bowlWins / allTimeData.team2.bowlGames) * 100 : 0}%` : '0%' 
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">
              {allTimeData.team2.bowlGames > 0 ? ((allTimeData.team2.bowlWins / allTimeData.team2.bowlGames) * 100).toFixed(1) : 0}% win rate
            </div>
            {getWinner(
              allTimeData.team1.bowlGames > 0 ? allTimeData.team1.bowlWins / allTimeData.team1.bowlGames : 0,
              allTimeData.team2.bowlGames > 0 ? allTimeData.team2.bowlWins / allTimeData.team2.bowlGames : 0
            ) === 'team2' && <WinnerBadge />}
          </div>
        </div>
      </div>

      {/* Interactive Wins Over Years Chart */}
      <ModernWinsOverYearsChart />

      {/* Enhanced Info Section */}
      <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-6 transition-all duration-500 ${animateCards ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: professionalGradients.red }}>
            <i className="fas fa-info-circle text-white text-sm"></i>
          </div>
          <h3 className="text-xl font-black gradient-text">About This Data</h3>
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          <div>
            <strong>All-Time Records:</strong> Complete historical data including regular season wins, conference championships, and bowl game performances from 2014-2024.
          </div>
          <div>
            <strong>Performance Metrics:</strong> Comprehensive analysis of win percentages, postseason success rates, and year-over-year performance trends.
          </div>
          <div>
            <strong>Interactive Features:</strong> Click on chart points to explore specific season comparisons. Data sourced from College Football Data API.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTimeTab;
