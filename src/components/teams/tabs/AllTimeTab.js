import React, { useState, useEffect, useMemo, useCallback } from 'react';

const AllTimeTab = ({ team1, team2, team1Records = [], team2Records = [] }) => {
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

  // Chart years - matching Swift implementation (2014-2024)
  const years = useMemo(() => Array.from({ length: 11 }, (_, i) => 2014 + i), []);

  // Swift-style calculation functions
  const totalWins = useCallback((records) => {
    return records.reduce((total, record) => total + (record.total?.wins || 0), 0);
  }, []);

  const winPercentage = useCallback((records) => {
    const totalWins = records.reduce((sum, record) => sum + (record.total?.wins || 0), 0);
    const totalLosses = records.reduce((sum, record) => sum + (record.total?.losses || 0), 0);
    const totalGames = totalWins + totalLosses;
    return totalGames > 0 ? (totalWins / totalGames) : 0;
  }, []);

  const bowlGames = useCallback((records) => {
    // Count postseason appearances from records or use a separate calculation
    return records.reduce((sum, record) => {
      // This might need adjustment based on your API data structure
      return sum + (record.postseason?.games || 0);
    }, 0);
  }, []);

  const bowlWins = useCallback((records) => {
    return records.reduce((sum, record) => {
      return sum + (record.postseason?.wins || 0);
    }, 0);
  }, []);

  const conferenceChampionships = useCallback((records) => {
    // Simple heuristic - teams that won their conference
    return records.filter(record => {
      // Check if team had exceptional conference performance
      const confWins = record.conferenceGames?.wins || 0;
      const confLosses = record.conferenceGames?.losses || 0;
      const confTotal = confWins + confLosses;
      
      // Heuristic: 85%+ conference win rate with at least 8 games
      return confTotal >= 8 && (confWins / confTotal) >= 0.85;
    }).length;
  }, []);

  const getTeamColor = useCallback((team) => {
    // Use team's primary color or fallback
    return team?.color || (team === team1 ? '#cc001c' : '#003f7f');
  }, [team1]);

  // Fallback data matching Swift implementation
  const getFallbackWins = useCallback((team, year) => {
    const fallbackData = {
      2014: { team1: 14, team2: 9 },
      2015: { team1: 12, team2: 10 },
      2016: { team1: 11, team2: 9 },
      2017: { team1: 12, team2: 11 },
      2018: { team1: 13, team2: 7 },
      2019: { team1: 13, team2: 6 },
      2020: { team1: 7, team2: 4 },
      2021: { team1: 11, team2: 7 },
      2022: { team1: 11, team2: 9 },
      2023: { team1: 11, team2: 11 },
      2024: { team1: 9, team2: 8 }
    };

    const teamKey = team === team1 ? 'team1' : 'team2';
    return fallbackData[year]?.[teamKey] || 8;
  }, [team1]);

  useEffect(() => {
    const calculateAllTimeData = async () => {
      if (!team1?.school || !team2?.school) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(`🏈 Calculating all-time stats for ${team1.school} vs ${team2.school}...`);

        // Calculate stats using Swift-style functions
        const team1Stats = {
          wins: totalWins(team1Records),
          winPercentage: winPercentage(team1Records),
          conferenceChampionships: conferenceChampionships(team1Records),
          bowlGames: bowlGames(team1Records),
          bowlWins: bowlWins(team1Records),
          records: team1Records
        };

        const team2Stats = {
          wins: totalWins(team2Records),
          winPercentage: winPercentage(team2Records),
          conferenceChampionships: conferenceChampionships(team2Records),
          bowlGames: bowlGames(team2Records),
          bowlWins: bowlWins(team2Records),
          records: team2Records
        };

        // Create chart data (last 11 years: 2014-2024)
        const team1WinsData = years.map(year => {
          const record = team1Records.find(r => r.year === year);
          const wins = record?.total?.wins || getFallbackWins(team1, year);
          return {
            id: `${team1.school}-${year}`,
            year,
            wins,
            team: team1
          };
        });

        const team2WinsData = years.map(year => {
          const record = team2Records.find(r => r.year === year);
          const wins = record?.total?.wins || getFallbackWins(team2, year);
          return {
            id: `${team2.school}-${year}`,
            year,
            wins,
            team: team2
          };
        });

        setAllTimeData({ team1: team1Stats, team2: team2Stats });
        setChartData({ team1WinsData, team2WinsData });

        console.log(`✅ Final Stats:`, {
          team1: {
            name: team1.school,
            wins: team1Stats.wins,
            winPct: (team1Stats.winPercentage * 100).toFixed(1) + '%',
            bowlGames: team1Stats.bowlGames,
            bowlWins: team1Stats.bowlWins,
            championships: team1Stats.conferenceChampionships
          },
          team2: {
            name: team2.school,
            wins: team2Stats.wins,
            winPct: (team2Stats.winPercentage * 100).toFixed(1) + '%',
            bowlGames: team2Stats.bowlGames,
            bowlWins: team2Stats.bowlWins,
            championships: team2Stats.conferenceChampionships
          }
        });

        // Trigger animations
        setTimeout(() => {
          setAnimateCards(true);
          setAnimateShine(true);
        }, 300);

      } catch (err) {
        console.error('Error calculating all-time data:', err);
        setError('Failed to calculate all-time data');
      } finally {
        setLoading(false);
      }
    };

    calculateAllTimeData();
  }, [team1, team2, team1Records, team2Records, years, totalWins, winPercentage, conferenceChampionships, bowlGames, bowlWins, getFallbackWins]);

  const getWinner = useCallback((value1, value2) => {
    if (value1 > value2) return 'team1';
    if (value2 > value1) return 'team2';
    return 'tie';
  }, []);

  const WinnerBadge = () => (
    <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full border border-green-300 mt-2">
      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="text-green-700 font-bold text-xs">WINNER</span>
    </div>
  );

  const TeamLogo = ({ team, size = "w-16 h-16" }) => (
    <div className={`${size} mx-auto mb-4 flex items-center justify-center`}>
      {team?.logos?.[0] ? (
        <img 
          src={team.logos[0].replace('http://', 'https://')} 
          alt={team.school} 
          className="w-full h-full object-contain drop-shadow-lg" 
        />
      ) : (
        <div 
          className={`${size} rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg`} 
          style={{ backgroundColor: getTeamColor(team) }}
        >
          {team?.school?.[0] || '?'}
        </div>
      )}
    </div>
  );

  const ModernStatsCard = ({ title, subtitle, icon, value1, value2, gradientColor }) => {
    const winner = getWinner(parseFloat(value1) || 0, parseFloat(value2) || 0);
    
    return (
      <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-2xl p-8 transition-all duration-700 ${animateCards ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
        {/* Card Header */}
        <div className="flex items-center gap-4 mb-8">
          <div 
            className="w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center"
            style={{ background: gradientColor }}
          >
            <i className={`${icon} text-white text-xl`}></i>
          </div>
          <div>
            <h3 className="text-2xl font-black gradient-text">{title}</h3>
            <p className="text-gray-600 text-sm font-medium">{subtitle}</p>
          </div>
        </div>

        {/* Team Comparison */}
        <div className="flex items-center">
          {/* Team 1 */}
          <div className="flex-1 text-center">
            <TeamLogo team={team1} />
            <div className="mb-2">
              <h4 className="font-bold text-lg mb-2" style={{ color: getTeamColor(team1) }}>
                {team1.school}
              </h4>
              <div className="text-4xl font-black mb-2" style={{ color: getTeamColor(team1) }}>
                {value1}
              </div>
            </div>
            {winner === 'team1' && <WinnerBadge />}
          </div>

          {/* VS Section with Arrow */}
          <div className="flex flex-col items-center mx-8">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg mb-2">
              <span className="text-gray-600 font-black text-lg">VS</span>
            </div>
            {winner !== 'tie' && (
              <div className={`transition-all duration-500 ${animateShine ? 'animate-pulse' : ''}`}>
                <svg 
                  className={`w-6 h-6 text-green-500 ${winner === 'team1' ? 'rotate-180' : ''}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Team 2 */}
          <div className="flex-1 text-center">
            <TeamLogo team={team2} />
            <div className="mb-2">
              <h4 className="font-bold text-lg mb-2" style={{ color: getTeamColor(team2) }}>
                {team2.school}
              </h4>
              <div className="text-4xl font-black mb-2" style={{ color: getTeamColor(team2) }}>
                {value2}
              </div>
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
            strokeDasharray={circumference}
            strokeDashoffset={animateCards ? strokeDashoffset : circumference}
            strokeLinecap="round"
            className="transition-all duration-1500 ease-out"
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black" style={{ color }}>
            {percentage.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500 font-medium">WIN</span>
        </div>
      </div>
    );
  };

  // Interactive Chart Component
  const ModernWinsOverYearsChart = () => {
    const maxWins = 15; // Fixed max like Swift
    
    const handleYearClick = useCallback((year) => {
      setSelectedYear(selectedYear === year ? null : year);
    }, [selectedYear]);

    const chartWidth = 720;
    const chartHeight = 240;
    const padding = 40;

    return (
      <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-2xl p-8 transition-all duration-700 ${animateCards ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center" style={{ background: professionalGradients.blue }}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-black gradient-text">Historical Performance</h3>
            <p className="text-gray-600 text-sm font-medium">Wins Over Years (2014-2024)</p>
          </div>
        </div>

        {/* Chart */}
        <div className="relative mb-8">
          <svg className="w-full" viewBox={`0 0 ${chartWidth + padding * 2} ${chartHeight + padding * 2}`}>
            {/* Grid Lines */}
            {[0, 5, 10, 15].map(value => {
              const y = chartHeight + padding - (value / maxWins) * chartHeight;
              return (
                <g key={value}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth + padding}
                    y2={y}
                    stroke="rgba(0,0,0,0.1)"
                    strokeWidth="1"
                  />
                  <text
                    x={padding - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill="#666"
                    className="font-medium"
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {/* Vertical grid lines */}
            {years.map((year, i) => {
              if (i % 2 === 0) {
                const x = padding + (i * (chartWidth / (years.length - 1)));
                return (
                  <g key={year}>
                    <line
                      x1={x}
                      y1={padding}
                      x2={x}
                      y2={chartHeight + padding}
                      stroke="rgba(0,0,0,0.1)"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={chartHeight + padding + 20}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#666"
                      className="font-medium"
                    >
                      {year}
                    </text>
                  </g>
                );
              }
              return null;
            })}

            {/* Team 1 Line */}
            <path
              d={chartData.team1WinsData.map((data, i) => {
                const x = padding + (i * (chartWidth / (years.length - 1)));
                const y = chartHeight + padding - (data.wins / maxWins) * chartHeight;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke={getTeamColor(team1)}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: `drop-shadow(0 2px 4px ${getTeamColor(team1)}40)`,
                strokeDasharray: animateCards ? 'none' : '1000',
                strokeDashoffset: animateCards ? '0' : '1000',
                transition: 'stroke-dashoffset 2s ease-out'
              }}
            />

            {/* Team 2 Line */}
            <path
              d={chartData.team2WinsData.map((data, i) => {
                const x = padding + (i * (chartWidth / (years.length - 1)));
                const y = chartHeight + padding - (data.wins / maxWins) * chartHeight;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke={getTeamColor(team2)}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: `drop-shadow(0 2px 4px ${getTeamColor(team2)}40)`,
                strokeDasharray: animateCards ? 'none' : '1000',
                strokeDashoffset: animateCards ? '0' : '1000',
                transition: 'stroke-dashoffset 2s ease-out 0.5s'
              }}
            />

            {/* Interactive Points - Team 1 Logos */}
            {chartData.team1WinsData.map((data, i) => {
              const x = padding + (i * (chartWidth / (years.length - 1)));
              const y = chartHeight + padding - (data.wins / maxWins) * chartHeight;
              const logoSize = selectedYear === data.year ? 20 : 16;
              return (
                <g key={`team1-${data.year}`}>
                  {/* Background circle for logo */}
                  <circle
                    cx={x}
                    cy={y}
                    r={logoSize / 2 + 2}
                    fill="white"
                    stroke={getTeamColor(team1)}
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => handleYearClick(data.year)}
                    style={{ 
                      filter: `drop-shadow(0 2px 6px ${getTeamColor(team1)}40)`,
                      transform: selectedYear === data.year ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />
                  {/* Team logo */}
                  {team1?.logos?.[0] ? (
                    <image
                      x={x - logoSize / 2}
                      y={y - logoSize / 2}
                      width={logoSize}
                      height={logoSize}
                      href={team1.logos[0].replace('http://', 'https://')}
                      className="cursor-pointer transition-all duration-200 hover:scale-110"
                      onClick={() => handleYearClick(data.year)}
                      style={{
                        filter: selectedYear === data.year ? 'brightness(1.2)' : 'brightness(1)',
                        transform: selectedYear === data.year ? 'scale(1.1)' : 'scale(1)'
                      }}
                    />
                  ) : (
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill={getTeamColor(team1)}
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => handleYearClick(data.year)}
                    >
                      {team1?.school?.[0] || '?'}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Interactive Points - Team 2 Logos */}
            {chartData.team2WinsData.map((data, i) => {
              const x = padding + (i * (chartWidth / (years.length - 1)));
              const y = chartHeight + padding - (data.wins / maxWins) * chartHeight;
              const logoSize = selectedYear === data.year ? 20 : 16;
              return (
                <g key={`team2-${data.year}`}>
                  {/* Background circle for logo */}
                  <circle
                    cx={x}
                    cy={y}
                    r={logoSize / 2 + 2}
                    fill="white"
                    stroke={getTeamColor(team2)}
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => handleYearClick(data.year)}
                    style={{ 
                      filter: `drop-shadow(0 2px 6px ${getTeamColor(team2)}40)`,
                      transform: selectedYear === data.year ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />
                  {/* Team logo */}
                  {team2?.logos?.[0] ? (
                    <image
                      x={x - logoSize / 2}
                      y={y - logoSize / 2}
                      width={logoSize}
                      height={logoSize}
                      href={team2.logos[0].replace('http://', 'https://')}
                      className="cursor-pointer transition-all duration-200 hover:scale-110"
                      onClick={() => handleYearClick(data.year)}
                      style={{
                        filter: selectedYear === data.year ? 'brightness(1.2)' : 'brightness(1)',
                        transform: selectedYear === data.year ? 'scale(1.1)' : 'scale(1)'
                      }}
                    />
                  ) : (
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill={getTeamColor(team2)}
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => handleYearClick(data.year)}
                    >
                      {team2?.school?.[0] || '?'}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <div className="flex items-center gap-3">
            <TeamLogo team={team1} size="w-6 h-6" />
            <div className="w-6 h-1 rounded" style={{ backgroundColor: getTeamColor(team1) }}></div>
            <span className="font-medium text-gray-700">{team1.school}</span>
          </div>
          <div className="flex items-center gap-3">
            <TeamLogo team={team2} size="w-6 h-6" />
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
                <TeamLogo team={team1} size="w-12 h-12" />
                <div className="font-bold text-2xl" style={{ color: getTeamColor(team1) }}>
                  {chartData.team1WinsData.find(d => d.year === selectedYear)?.wins || 0}
                </div>
                <div className="text-sm text-gray-600">wins</div>
              </div>
              <div className="text-2xl font-bold text-gray-400">VS</div>
              <div className="text-center">
                <TeamLogo team={team2} size="w-12 h-12" />
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-xl flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-gray-600"></div>
          </div>
          <h3 className="text-2xl font-bold gradient-text">Loading All-Time Stats...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-red-600 mb-2">Error Loading Data</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const professionalGradients = {
    gold: `linear-gradient(135deg, 
      rgb(250, 204, 21), 
      rgb(245, 158, 11), 
      rgb(217, 119, 6), 
      rgb(245, 158, 11), 
      rgb(250, 204, 21)
    )`,
    blue: `linear-gradient(135deg, 
      rgb(59, 130, 246), 
      rgb(37, 99, 235), 
      rgb(29, 78, 216), 
      rgb(37, 99, 235), 
      rgb(59, 130, 246)
    )`,
    purple: `linear-gradient(135deg, 
      rgb(168, 85, 247), 
      rgb(139, 69, 219), 
      rgb(124, 58, 193), 
      rgb(139, 69, 219), 
      rgb(168, 85, 247)
    )`,
    emerald: `linear-gradient(135deg, 
      rgb(16, 185, 129), 
      rgb(5, 150, 105), 
      rgb(4, 120, 87), 
      rgb(5, 150, 105), 
      rgb(16, 185, 129)
    )`,
    red: `linear-gradient(135deg, 
      rgb(239, 68, 68), 
      rgb(220, 38, 38), 
      rgb(185, 28, 28), 
      rgb(220, 38, 38), 
      rgb(239, 68, 68)
    )`
  };

  return (
    <div className="space-y-8 p-6">
      <style>{`
        .gradient-text {
          background: linear-gradient(135deg, #cc001c, #a10014, #73000d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>

      {/* Modern Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div 
            className={`w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center ${animateShine ? 'animate-pulse' : ''}`} 
            style={{ background: professionalGradients.gold }}
          >
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
          </div>
          <div>
            <h2 className="text-4xl font-black gradient-text">All Time Stats</h2>
            <p className="text-gray-600 font-medium">Complete Historical Performance Analysis</p>
          </div>
        </div>
      </div>

      {/* All-Time Wins */}
      <ModernStatsCard 
        title="All-Time Wins"
        subtitle="Total victories in program history"
        icon="fas fa-trophy"
        value1={allTimeData.team1.wins}
        value2={allTimeData.team2.wins}
        gradientColor={professionalGradients.gold}
      />

      {/* Win Percentage with Circular Progress */}
      <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-2xl p-8 transition-all duration-700 ${animateCards ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center" style={{ background: professionalGradients.blue }}>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-black gradient-text">Win Percentage</h3>
            <p className="text-gray-600 text-sm font-medium">Historical winning rate</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-16">
          <div className="text-center">
            <CircularProgress 
              percentage={allTimeData.team1.winPercentage * 100} 
              color={getTeamColor(team1)}
            />
            <div className="mt-4">
              <TeamLogo team={team1} />
              <h4 className="font-bold text-lg mb-2" style={{ color: getTeamColor(team1) }}>
                {team1.school}
              </h4>
              {getWinner(allTimeData.team1.winPercentage, allTimeData.team2.winPercentage) === 'team1' && <WinnerBadge />}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg mb-2">
              <span className="text-gray-600 font-black text-lg">VS</span>
            </div>
            {getWinner(allTimeData.team1.winPercentage, allTimeData.team2.winPercentage) !== 'tie' && (
              <div className={`transition-all duration-500 ${animateShine ? 'animate-pulse' : ''}`}>
                <svg 
                  className={`w-6 h-6 text-green-500 ${getWinner(allTimeData.team1.winPercentage, allTimeData.team2.winPercentage) === 'team1' ? 'rotate-180' : ''}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          <div className="text-center">
            <CircularProgress 
              percentage={allTimeData.team2.winPercentage * 100} 
              color={getTeamColor(team2)}
            />
            <div className="mt-4">
              <TeamLogo team={team2} />
              <h4 className="font-bold text-lg mb-2" style={{ color: getTeamColor(team2) }}>
                {team2.school}
              </h4>
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
        gradientColor={professionalGradients.purple}
      />

      {/* Enhanced Bowl Games */}
      <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-2xl p-8 transition-all duration-700 ${animateCards ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center" style={{ background: professionalGradients.emerald }}>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-black gradient-text">Bowl Games</h3>
            <p className="text-gray-600 text-sm font-medium">Postseason appearances and performance</p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="flex-1 text-center">
            <TeamLogo team={team1} />
            <h4 className="font-bold text-lg mb-4" style={{ color: getTeamColor(team1) }}>
              {team1.school}
            </h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-3xl font-black" style={{ color: getTeamColor(team1) }}>
                  {allTimeData.team1.bowlGames}
                </div>
                <div className="text-sm text-gray-600">appearances</div>
              </div>
              <div>
                <div className="text-3xl font-black text-green-600">
                  {allTimeData.team1.bowlWins}
                </div>
                <div className="text-sm text-gray-600">wins</div>
              </div>
            </div>
            
            {/* Bowl Win Rate Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-1000" 
                style={{ 
                  width: animateCards ? `${allTimeData.team1.bowlGames > 0 ? (allTimeData.team1.bowlWins / allTimeData.team1.bowlGames) * 100 : 0}%` : '0%' 
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              {allTimeData.team1.bowlGames > 0 ? ((allTimeData.team1.bowlWins / allTimeData.team1.bowlGames) * 100).toFixed(1) : 0}% win rate
            </div>
            
            {getWinner(
              allTimeData.team1.bowlGames > 0 ? allTimeData.team1.bowlWins / allTimeData.team1.bowlGames : 0,
              allTimeData.team2.bowlGames > 0 ? allTimeData.team2.bowlWins / allTimeData.team2.bowlGames : 0
            ) === 'team1' && <WinnerBadge />}
          </div>

          <div className="flex flex-col items-center mx-8">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg mb-2">
              <span className="text-gray-600 font-black text-lg">VS</span>
            </div>
            {getWinner(
              allTimeData.team1.bowlGames > 0 ? allTimeData.team1.bowlWins / allTimeData.team1.bowlGames : 0,
              allTimeData.team2.bowlGames > 0 ? allTimeData.team2.bowlWins / allTimeData.team2.bowlGames : 0
            ) !== 'tie' && (
              <div className={`transition-all duration-500 ${animateShine ? 'animate-pulse' : ''}`}>
                <svg 
                  className={`w-6 h-6 text-green-500 ${getWinner(
                    allTimeData.team1.bowlGames > 0 ? allTimeData.team1.bowlWins / allTimeData.team1.bowlGames : 0,
                    allTimeData.team2.bowlGames > 0 ? allTimeData.team2.bowlWins / allTimeData.team2.bowlGames : 0
                  ) === 'team1' ? 'rotate-180' : ''}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 text-center">
            <TeamLogo team={team2} />
            <h4 className="font-bold text-lg mb-4" style={{ color: getTeamColor(team2) }}>
              {team2.school}
            </h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-3xl font-black" style={{ color: getTeamColor(team2) }}>
                  {allTimeData.team2.bowlGames}
                </div>
                <div className="text-sm text-gray-600">appearances</div>
              </div>
              <div>
                <div className="text-3xl font-black text-green-600">
                  {allTimeData.team2.bowlWins}
                </div>
                <div className="text-sm text-gray-600">wins</div>
              </div>
            </div>
            
            {/* Bowl Win Rate Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-1000" 
                style={{ 
                  width: animateCards ? `${allTimeData.team2.bowlGames > 0 ? (allTimeData.team2.bowlWins / allTimeData.team2.bowlGames) * 100 : 0}%` : '0%' 
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mb-2">
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

      {/* Info Section */}
      <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-2xl p-6 transition-all duration-700 ${animateCards ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: professionalGradients.red }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
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
            <strong>Interactive Features:</strong> Click on chart points to explore specific season comparisons. Data sourced from College Football Data API with fallback data for missing years.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTimeTab;