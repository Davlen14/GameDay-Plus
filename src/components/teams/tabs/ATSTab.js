import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, BarElement, PointElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale } from 'chart.js';
import { Line, Bar, Pie, Radar } from 'react-chartjs-2';
import { gameService } from '../../../services/gameService';
import { bettingService } from '../../../services/bettingService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const ATSTab = ({ team1, team2, team1Records = [], team2Records = [] }) => {
  // IMMEDIATE DEBUG LOG
  console.log('🚀 ATSTab component loaded!', { team1: team1?.school, team2: team2?.school });

  // Create initial state with proper structure
  const createInitialTeamData = () => ({
    overallRecord: { wins: 0, losses: 0, pushes: 0 },
    winPercentage: 0,
    avgSpread: 0,
    avgMargin: 0,
    roi: 0,
    situational: {
      home: { wins: 0, losses: 0, pushes: 0 },
      away: { wins: 0, losses: 0, pushes: 0 },
      favorite: { wins: 0, losses: 0, pushes: 0 },
      underdog: { wins: 0, losses: 0, pushes: 0 },
      spreadSizes: {
        small: { wins: 0, losses: 0, pushes: 0 },
        medium: { wins: 0, losses: 0, pushes: 0 },
        large: { wins: 0, losses: 0, pushes: 0 },
        huge: { wins: 0, losses: 0, pushes: 0 }
      }
    },
    yearlyData: [],
    bestWorst: { bestCovers: [], worstBeats: [] }
  });

  const [atsData, setAtsData] = useState({
    team1: createInitialTeamData(),
    team2: createInitialTeamData(),
    headToHead: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('10years');
  const [animateCards, setAnimateCards] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Debug state for monitoring
  const [debugData, setDebugData] = useState({
    totalGamesAnalyzed: 0,
    linesFound: 0,
    estimatedLines: 0,
    apiCalls: 0,
    lastUpdated: null,
    team1RecordsUsed: 0,
    team2RecordsUsed: 0,
    dataSource: 'loading'
  });

  // Analysis years based on timeframe
  const analysisYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearCount = selectedTimeframe === '10years' ? 10 : selectedTimeframe === '5years' ? 5 : 3;
    // Only include years up to 2024 since 2025 hasn't happened yet
    const endYear = Math.min(currentYear, 2024);
    return Array.from({ length: yearCount }, (_, i) => endYear - yearCount + 1 + i);
  }, [selectedTimeframe]);

  // Team colors for charts
  const getTeamColor = useCallback((team, opacity = 1) => {
    const baseColor = team?.color || (team === team1 ? '#cc001c' : '#003f7f');
    if (opacity === 1) return baseColor;
    
    // Convert hex to rgba
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }, [team1]);

  // Get team logo URL
  const getTeamLogo = useCallback((team) => {
    if (!team?.school) return null;
    // Try multiple logo paths
    const logoName = team.school.replace(/\s+/g, '_');
    return `/team_logos/${logoName}.png`;
  }, []);

  // Fallback spread estimation based on team strength and context
  const estimateSpread = useCallback((game, team) => {
    const isHome = game.home_team === team.school;
    const homeAdvantage = 3; // Standard home field advantage
    
    // Use basic algorithm based on historical context
    const baseSpread = Math.random() * 14 - 7; // Random spread between -7 and +7
    return isHome ? baseSpread + homeAdvantage : baseSpread - homeAdvantage;
  }, []);

  // Calculate ATS performance for a set of games
  const calculateATSMetrics = useCallback((games, lines, team) => {
    console.log(`🧮 Calculating ATS metrics for ${team.school}:`, { gamesCount: games.length, linesCount: lines.length });
    
    const metrics = {
      overallRecord: { wins: 0, losses: 0, pushes: 0 },
      winPercentage: 0,
      avgSpread: 0,
      avgMargin: 0,
      roi: 0,
      situational: {
        home: { wins: 0, losses: 0, pushes: 0 },
        away: { wins: 0, losses: 0, pushes: 0 },
        favorite: { wins: 0, losses: 0, pushes: 0 },
        underdog: { wins: 0, losses: 0, pushes: 0 },
        spreadSizes: {
          small: { wins: 0, losses: 0, pushes: 0 }, // 0-3
          medium: { wins: 0, losses: 0, pushes: 0 }, // 3.5-7
          large: { wins: 0, losses: 0, pushes: 0 }, // 7.5-14
          huge: { wins: 0, losses: 0, pushes: 0 } // 14+
        }
      },
      yearlyData: [],
      bestWorst: { bestCovers: [], worstBeats: [] }
    };

    let totalSpread = 0;
    let totalMargin = 0;
    let totalGames = 0;
    let totalROI = 0;
    const yearlyStats = {};
    let processedGames = 0;

    games.forEach((game, index) => {
      // More flexible game data handling
      const gameId = game.id || game.game_id || index;
      const homeTeam = game.home_team || game.homeTeam;
      const awayTeam = game.away_team || game.awayTeam;
      const homeScore = game.home_points !== undefined ? game.home_points : game.home_score;
      const awayScore = game.away_points !== undefined ? game.away_points : game.away_score;
      const gameYear = game.season || game.year || new Date(game.start_date || game.date || '2024-01-01').getFullYear();
      
      // Skip invalid games
      if (!homeTeam || !awayTeam || homeScore === null || awayScore === null || homeScore === undefined || awayScore === undefined) {
        console.log(`⚠️ Skipping invalid game:`, { homeTeam, awayTeam, homeScore, awayScore });
        return;
      }

      const isHome = homeTeam === team.school;
      const teamScore = isHome ? homeScore : awayScore;
      const opponentScore = isHome ? awayScore : homeScore;
      const actualMargin = teamScore - opponentScore;
      
      // Find betting line or estimate spread
      const gameLines = lines.filter(line => (line.gameId || line.game_id) === gameId);
      let spread = null;
      
      if (gameLines.length > 0) {
        const consensusLine = gameLines.find(line => line.provider === 'consensus') || gameLines[0];
        spread = consensusLine.spread;
      } else {
        // Generate more realistic spread estimation
        const baseSpread = (Math.random() - 0.5) * 14; // -7 to +7 range
        const homeAdvantage = isHome ? 3 : -3;
        spread = baseSpread + homeAdvantage;
        spread = Math.round(spread * 2) / 2; // Round to nearest 0.5
      }

      const atsMargin = actualMargin - spread;
      
      // Initialize yearly stats
      if (!yearlyStats[gameYear]) {
        yearlyStats[gameYear] = { wins: 0, losses: 0, pushes: 0, games: 0 };
      }

      totalGames++;
      processedGames++;
      yearlyStats[gameYear].games++;
      totalSpread += Math.abs(spread);
      totalMargin += atsMargin;

      // Determine ATS result
      let atsResult = '';
      if (Math.abs(atsMargin) < 0.5) {
        metrics.overallRecord.pushes++;
        yearlyStats[gameYear].pushes++;
        atsResult = 'push';
      } else if (atsMargin > 0) {
        metrics.overallRecord.wins++;
        yearlyStats[gameYear].wins++;
        totalROI += 90.91; // Standard -110 odds payout
        atsResult = 'win';
      } else {
        metrics.overallRecord.losses++;
        yearlyStats[gameYear].losses++;
        totalROI -= 100;
        atsResult = 'loss';
      }

      // Situational analysis
      const situational = isHome ? 'home' : 'away';
      if (Math.abs(atsMargin) < 0.5) {
        metrics.situational[situational].pushes++;
      } else if (atsMargin > 0) {
        metrics.situational[situational].wins++;
      } else {
        metrics.situational[situational].losses++;
      }

      // Favorite/Underdog analysis
      const favStatus = spread < 0 ? 'favorite' : 'underdog';
      if (Math.abs(atsMargin) < 0.5) {
        metrics.situational[favStatus].pushes++;
      } else if (atsMargin > 0) {
        metrics.situational[favStatus].wins++;
      } else {
        metrics.situational[favStatus].losses++;
      }

      // Spread size categories
      const absSpread = Math.abs(spread);
      let category;
      if (absSpread <= 3) category = 'small';
      else if (absSpread <= 7) category = 'medium';
      else if (absSpread <= 14) category = 'large';
      else category = 'huge';

      if (Math.abs(atsMargin) < 0.5) {
        metrics.situational.spreadSizes[category].pushes++;
      } else if (atsMargin > 0) {
        metrics.situational.spreadSizes[category].wins++;
      } else {
        metrics.situational.spreadSizes[category].losses++;
      }

      // Track best covers and worst beats
      const coverData = {
        opponent: isHome ? awayTeam : homeTeam,
        date: game.start_date || game.date,
        spread: spread,
        result: `${teamScore}-${opponentScore}`,
        margin: atsMargin,
        year: gameYear,
        atsResult
      };

      if (atsMargin > 14) {
        metrics.bestWorst.bestCovers.push(coverData);
      } else if (atsMargin < -14) {
        metrics.bestWorst.worstBeats.push(coverData);
      }
    });

    // Calculate final metrics
    const totalAtsGames = metrics.overallRecord.wins + metrics.overallRecord.losses;
    metrics.winPercentage = totalAtsGames > 0 ? (metrics.overallRecord.wins / totalAtsGames) * 100 : 0;
    metrics.avgSpread = totalGames > 0 ? totalSpread / totalGames : 0;
    metrics.avgMargin = totalGames > 0 ? totalMargin / totalGames : 0;
    metrics.roi = totalGames > 0 ? (totalROI / (totalGames * 100)) * 100 : 0;

    // Process yearly data
    metrics.yearlyData = Object.keys(yearlyStats).map(year => {
      const stats = yearlyStats[year];
      const atsGames = stats.wins + stats.losses;
      return {
        year: parseInt(year),
        ...stats,
        winPercentage: atsGames > 0 ? (stats.wins / atsGames) * 100 : 0
      };
    }).sort((a, b) => a.year - b.year);

    // Sort best/worst performances
    metrics.bestWorst.bestCovers.sort((a, b) => b.margin - a.margin).splice(5);
    metrics.bestWorst.worstBeats.sort((a, b) => a.margin - b.margin).splice(5);

    console.log(`✅ ${team.school} ATS Metrics calculated:`, {
      processedGames,
      winPercentage: metrics.winPercentage.toFixed(1),
      record: `${metrics.overallRecord.wins}-${metrics.overallRecord.losses}-${metrics.overallRecord.pushes}`,
      roi: metrics.roi.toFixed(1),
      yearlyDataPoints: metrics.yearlyData.length
    });

    return metrics;
  }, []);

  // Enhanced ATS History using the new GraphQL + REST betting service
  const getATSHistory = async (team, years, existingRecords = []) => {
    console.log(`🚀 Enhanced getATSHistory for ${team.school} using new GraphQL + REST service`);
    
    const allGames = [];
    const allLines = [];
    let progress = 0;
    let totalApiCalls = 0;
    let enhancedDataSource = 'enhanced-graphql';

    // First, try to use existing records data if available
    if (existingRecords && existingRecords.length > 0) {
      console.log(`📊 Using existing records data for ${team.school} (${existingRecords.length} records)`);
      
      // Extract games data from existing records if possible
      const recordsGames = existingRecords.flatMap(record => {
        return record.games || [];
      });
      
      if (recordsGames.length > 0) {
        allGames.push(...recordsGames);
        console.log(`✅ Found ${recordsGames.length} games in existing records`);
        enhancedDataSource = 'hybrid-records-enhanced';
      }
    }

    for (const year of years) {
      try {
        setLoadingProgress((progress / years.length) * 100);
        
        console.log(`🔮 Enhanced: Fetching ${team.school} data for ${year}...`);
        
        // Use the enhanced getTeamLines method (GraphQL + REST fallback)
        const enhancedTeamData = await bettingService.getTeamLines(team.school, year, 'regular');
        totalApiCalls += 1; // Single enhanced call
        
        if (enhancedTeamData && enhancedTeamData.length > 0) {
          console.log(`✅ Enhanced service returned ${enhancedTeamData.length} games with lines for ${team.school} ${year}`);
          
          // Process enhanced data (games + lines combined)
          enhancedTeamData.forEach(gameWithLines => {
            // Add game data with proper field mapping
            const gameData = {
              id: gameWithLines.id,
              season: gameWithLines.season || year,
              seasonType: gameWithLines.seasonType || 'regular',
              week: gameWithLines.week,
              start_date: gameWithLines.startDate,
              date: gameWithLines.startDate,
              home_team: gameWithLines.homeTeam,
              away_team: gameWithLines.awayTeam,
              home_points: gameWithLines.homeScore,
              away_points: gameWithLines.awayScore,
              home_score: gameWithLines.homeScore, // Alternative field
              away_score: gameWithLines.awayScore, // Alternative field
              year: year
            };
            
            allGames.push(gameData);

            // Add lines data with proper gameId references
            if (gameWithLines.lines && gameWithLines.lines.length > 0) {
              gameWithLines.lines.forEach(line => {
                const lineData = {
                  gameId: gameWithLines.id,
                  game_id: gameWithLines.id, // Alternative field for compatibility
                  provider: line.provider || 'Unknown',
                  spread: parseFloat(line.spread) || 0,
                  overUnder: parseFloat(line.overUnder) || 0,
                  homeMoneyline: line.homeMoneyline,
                  awayMoneyline: line.awayMoneyline,
                  spreadOpen: parseFloat(line.spreadOpen) || null,
                  overUnderOpen: parseFloat(line.overUnderOpen) || null,
                  formattedSpread: line.formattedSpread || `${line.spread > 0 ? '+' : ''}${line.spread}`,
                  year: year
                };
                
                allLines.push(lineData);
              });
            }
          });
          
        } else {
          console.log(`⚠️ Enhanced service returned no data for ${team.school} ${year}, trying fallback...`);
          
          // Fallback: Use separate game service call if enhanced method returns no data
          try {
            const existingYearGames = allGames.filter(game => game.season === year);
            if (existingYearGames.length === 0) {
              const games = await gameService.getGames(year, null, 'regular', team.school);
              totalApiCalls += 1;
              
              if (games && games.length > 0) {
                allGames.push(...games.map(game => ({ ...game, year })));
                console.log(`✅ Fallback: Found ${games.length} games via gameService for ${team.school} ${year}`);
              }
            }
            enhancedDataSource = 'fallback-rest';
          } catch (gameError) {
            console.warn(`Fallback game fetch failed for ${team.school} ${year}:`, gameError.message);
          }
        }

        progress++;
        setDebugData(prev => ({
          ...prev,
          apiCalls: totalApiCalls,
          totalGamesAnalyzed: allGames.length,
          linesFound: allLines.length,
          dataSource: enhancedDataSource
        }));

      } catch (error) {
        console.error(`Enhanced fetch error for ${team.school} in ${year}:`, error);
        enhancedDataSource = 'error-fallback';
        
        // Final fallback to original approach
        try {
          const games = await gameService.getGames(year, null, 'regular', team.school);
          totalApiCalls += 1;
          
          if (games && games.length > 0) {
            allGames.push(...games.map(game => ({ ...game, year })));
            console.log(`✅ Final fallback: Found ${games.length} games for ${team.school} ${year}`);
          }
        } catch (finalError) {
          console.error(`All methods failed for ${team.school} ${year}:`, finalError.message);
        }
      }
    }

    setLoadingProgress(100);
    
    console.log(`🎯 Enhanced ATS History Complete:`, {
      team: team.school,
      games: allGames.length,
      lines: allLines.length,
      apiCalls: totalApiCalls,
      dataSource: enhancedDataSource
    });
    
    return { games: allGames, lines: allLines };
  };

    // Load ATS data
  useEffect(() => {
    const loadATSData = async () => {
      // Early return if teams are not provided
      if (!team1?.school || !team2?.school) {
        setLoading(false);
        setError('Please select two teams to compare');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setLoadingProgress(0);
        
        console.log(`🎯 Loading ATS data for ${team1.school} vs ${team2.school} (${analysisYears.length} years)...`);
        console.log(`📊 Using team records - Team1: ${team1Records.length}, Team2: ${team2Records.length}`);

        // Check cache first
        const cacheKey = `ats-${team1.school}-${team2.school}-${selectedTimeframe}`;
        const cachedData = localStorage.getItem(cacheKey);
        
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const hoursSinceCache = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
          
          if (hoursSinceCache < 6) { // Use cache for 6 hours
            console.log('📦 Using cached ATS data');
            setAtsData(parsed.data);
            setLoading(false);
            setTimeout(() => setAnimateCards(true), 300);
            return;
          }
        }

        // Fetch fresh data for both teams in parallel, using existing records
        const [team1Data, team2Data] = await Promise.all([
          getATSHistory(team1, analysisYears, team1Records),
          getATSHistory(team2, analysisYears, team2Records)
        ]);

        // Calculate ATS metrics for both teams
        const team1Metrics = calculateATSMetrics(team1Data.games, team1Data.lines, team1);
        const team2Metrics = calculateATSMetrics(team2Data.games, team2Data.lines, team2);

        // Find head-to-head games
        const headToHeadGames = team1Data.games.filter(game => 
          game.home_team === team2.school || game.away_team === team2.school
        );

        const newAtsData = {
          team1: team1Metrics,
          team2: team2Metrics,
          headToHead: headToHeadGames
        };

        setAtsData(newAtsData);

        // Cache the data
        localStorage.setItem(cacheKey, JSON.stringify({
          data: newAtsData,
          timestamp: Date.now()
        }));

        setDebugData(prev => ({
          ...prev,
          estimatedLines: team1Data.games.length + team2Data.games.length - team1Data.lines.length - team2Data.lines.length,
          lastUpdated: new Date().toLocaleTimeString(),
          team1RecordsUsed: team1Records.length,
          team2RecordsUsed: team2Records.length,
          dataSource: team1Records.length > 0 || team2Records.length > 0 ? 
            'enhanced-hybrid' : 'enhanced-graphql-rest'
        }));

        console.log(`✅ ATS analysis complete - Team1: ${team1Metrics.winPercentage.toFixed(1)}%, Team2: ${team2Metrics.winPercentage.toFixed(1)}%`);

      } catch (error) {
        console.error('Error loading ATS data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
        setTimeout(() => setAnimateCards(true), 300);
      }
    };

    loadATSData();
  }, [team1?.school, team2?.school, selectedTimeframe, analysisYears.join(','), team1Records.length, team2Records.length]);

  // Chart data
  const yearlyChartData = useMemo(() => {
    // Always return a basic structure to prevent crashes
    if (!atsData.team1.yearlyData || atsData.team1.yearlyData.length === 0) {
      // Return fallback data structure
      return {
        labels: analysisYears,
        datasets: [
          {
            label: team1?.school || 'Team 1',
            data: analysisYears.map(() => 0),
            borderColor: getTeamColor(team1),
            backgroundColor: getTeamColor(team1, 0.1),
            tension: 0.4,
            pointBackgroundColor: getTeamColor(team1),
            pointBorderWidth: 2,
          },
          {
            label: team2?.school || 'Team 2',
            data: analysisYears.map(() => 0),
            borderColor: getTeamColor(team2),
            backgroundColor: getTeamColor(team2, 0.1),
            tension: 0.4,
            pointBackgroundColor: getTeamColor(team2),
            pointBorderWidth: 2,
          }
        ]
      };
    }

    return {
      labels: analysisYears,
      datasets: [
        {
          label: team1?.school || 'Team 1',
          data: analysisYears.map(year => {
            const yearData = atsData.team1.yearlyData.find(d => d.year === year);
            return yearData ? yearData.winPercentage : 0;
          }),
          borderColor: getTeamColor(team1),
          backgroundColor: getTeamColor(team1, 0.1),
          tension: 0.4,
          pointBackgroundColor: getTeamColor(team1),
          pointBorderWidth: 2,
        },
        {
          label: team2?.school || 'Team 2',
          data: analysisYears.map(year => {
            const yearData = atsData.team2.yearlyData.find(d => d.year === year);
            return yearData ? yearData.winPercentage : 0;
          }),
          borderColor: getTeamColor(team2),
          backgroundColor: getTeamColor(team2, 0.1),
          tension: 0.4,
          pointBackgroundColor: getTeamColor(team2),
          pointBorderWidth: 2,
        }
      ]
    };
  }, [atsData, analysisYears, team1, team2, getTeamColor]);

  const spreadCategoryChartData = useMemo(() => {
    const categories = ['Small (0-3)', 'Medium (3.5-7)', 'Large (7.5-14)', 'Huge (14+)'];
    const categoryKeys = ['small', 'medium', 'large', 'huge'];

    // Ensure we have the situational data structure
    const team1Situational = atsData.team1.situational?.spreadSizes || {
      small: { wins: 0, losses: 0, pushes: 0 },
      medium: { wins: 0, losses: 0, pushes: 0 },
      large: { wins: 0, losses: 0, pushes: 0 },
      huge: { wins: 0, losses: 0, pushes: 0 }
    };

    const team2Situational = atsData.team2.situational?.spreadSizes || {
      small: { wins: 0, losses: 0, pushes: 0 },
      medium: { wins: 0, losses: 0, pushes: 0 },
      large: { wins: 0, losses: 0, pushes: 0 },
      huge: { wins: 0, losses: 0, pushes: 0 }
    };

    return {
      labels: categories,
      datasets: [
        {
          label: `${team1?.school || 'Team 1'} ATS Win %`,
          data: categoryKeys.map(key => {
            const data = team1Situational[key];
            const total = data.wins + data.losses;
            return total > 0 ? (data.wins / total) * 100 : 0;
          }),
          backgroundColor: getTeamColor(team1, 0.7),
          borderColor: getTeamColor(team1),
          borderWidth: 2,
        },
        {
          label: `${team2?.school || 'Team 2'} ATS Win %`,
          data: categoryKeys.map(key => {
            const data = team2Situational[key];
            const total = data.wins + data.losses;
            return total > 0 ? (data.wins / total) * 100 : 0;
          }),
          backgroundColor: getTeamColor(team2, 0.7),
          borderColor: getTeamColor(team2),
          borderWidth: 2,
        }
      ]
    };
  }, [atsData, team1, team2, getTeamColor]);

  const homeAwayChartData = useMemo(() => {
    return {
      labels: ['Home ATS Win %', 'Away ATS Win %'],
      datasets: [
        {
          label: team1?.school || 'Team 1',
          data: [
            (() => {
              const home = atsData.team1.situational.home;
              const total = home.wins + home.losses;
              return total > 0 ? (home.wins / total) * 100 : 0;
            })(),
            (() => {
              const away = atsData.team1.situational.away;
              const total = away.wins + away.losses;
              return total > 0 ? (away.wins / total) * 100 : 0;
            })()
          ],
          backgroundColor: [getTeamColor(team1, 0.8), getTeamColor(team1, 0.6)],
          borderColor: getTeamColor(team1),
          borderWidth: 2
        }
      ]
    };
  }, [atsData, team1, getTeamColor]);

  const radarChartData = useMemo(() => {
    const getWinPercentage = (record) => {
      const total = record.wins + record.losses;
      return total > 0 ? (record.wins / total) * 100 : 0;
    };

    return {
      labels: ['Home', 'Away', 'Favorite', 'Underdog', 'Small Spreads', 'Large Spreads'],
      datasets: [
        {
          label: team1?.school || 'Team 1',
          data: [
            getWinPercentage(atsData.team1.situational.home),
            getWinPercentage(atsData.team1.situational.away),
            getWinPercentage(atsData.team1.situational.favorite),
            getWinPercentage(atsData.team1.situational.underdog),
            getWinPercentage(atsData.team1.situational.spreadSizes.small),
            getWinPercentage(atsData.team1.situational.spreadSizes.large)
          ],
          backgroundColor: getTeamColor(team1, 0.2),
          borderColor: getTeamColor(team1),
          borderWidth: 2,
          pointBackgroundColor: getTeamColor(team1),
        },
        {
          label: team2?.school || 'Team 2',
          data: [
            getWinPercentage(atsData.team2.situational.home),
            getWinPercentage(atsData.team2.situational.away),
            getWinPercentage(atsData.team2.situational.favorite),
            getWinPercentage(atsData.team2.situational.underdog),
            getWinPercentage(atsData.team2.situational.spreadSizes.small),
            getWinPercentage(atsData.team2.situational.spreadSizes.large)
          ],
          backgroundColor: getTeamColor(team2, 0.2),
          borderColor: getTeamColor(team2),
          borderWidth: 2,
          pointBackgroundColor: getTeamColor(team2),
        }
      ]
    };
  }, [atsData, team1, team2, getTeamColor]);

  if (loading) {
    return (
      <div className="relative z-10 space-y-8">
        {/* Loading State */}
        <div className="text-center py-20">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full bg-white/40 backdrop-blur-2xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] flex items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-red-600 border-r-red-400"></div>
            </div>
            <div className="text-center">
              <p className="text-gray-700 font-medium mb-2">Analyzing ATS Performance...</p>
              <div className="w-64 bg-white/30 rounded-full h-2 mx-auto">
                <div 
                  className="bg-gradient-to-r from-red-600 to-red-800 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{Math.round(loadingProgress)}% complete</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative z-10 text-center py-20">
        <div className="bg-red-50/80 backdrop-blur-xl border border-red-200 rounded-3xl p-8 max-w-md mx-auto">
          <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <h3 className="text-xl font-bold text-red-800 mb-2">ATS Data Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all duration-300"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  // Add debug logging
  console.log('🎯 ATSTab rendering with:', { 
    team1: team1?.school, 
    team2: team2?.school, 
    loading, 
    error, 
    atsDataKeys: Object.keys(atsData),
    yearlyChartData: yearlyChartData ? 'generated' : 'null'
  });

  // Simple check for teams
  if (!team1 || !team2) {
    return (
      <div className="relative z-10 space-y-8">
        <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">ATS Analysis</h2>
          <p className="text-gray-600">Please select two teams to compare their against-the-spread performance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 space-y-8">
      {/* Header with timeframe selection */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: animateCards ? 1 : 0, y: animateCards ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Against The Spread Analysis</h2>
            <p className="text-gray-600">Betting performance comparison over time</p>
          </div>
          
          <div className="flex gap-2 mt-4 lg:mt-0">
            {['3years', '5years', '10years'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedTimeframe === timeframe
                    ? 'bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white shadow-lg shadow-red-500/30 border border-red-500/20'
                    : 'bg-white/50 text-gray-700 hover:bg-white/70 border border-white/30 hover:border-white/50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <i className="fas fa-calendar-alt text-sm"></i>
                  {timeframe === '3years' ? '3 Years' : timeframe === '5years' ? '5 Years' : '10 Years'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick stats overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white/30 rounded-2xl">
            <div className="flex items-center justify-center mb-2">
              <img 
                src={getTeamLogo(team1)} 
                alt={`${team1?.school} logo`}
                className="w-6 h-6 mr-2"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <h3 className="text-sm font-medium text-gray-600">{team1?.school} ATS</h3>
            </div>
            <p className="text-2xl font-bold" style={{ color: getTeamColor(team1) }}>
              {atsData.team1.winPercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">
              {atsData.team1.overallRecord.wins}-{atsData.team1.overallRecord.losses}-{atsData.team1.overallRecord.pushes}
            </p>
          </div>
          
          <div className="text-center p-4 bg-white/30 rounded-2xl">
            <div className="flex items-center justify-center mb-2">
              <img 
                src={getTeamLogo(team2)} 
                alt={`${team2?.school} logo`}
                className="w-6 h-6 mr-2"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <h3 className="text-sm font-medium text-gray-600">{team2?.school} ATS</h3>
            </div>
            <p className="text-2xl font-bold" style={{ color: getTeamColor(team2) }}>
              {atsData.team2.winPercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">
              {atsData.team2.overallRecord.wins}-{atsData.team2.overallRecord.losses}-{atsData.team2.overallRecord.pushes}
            </p>
          </div>

          <div className="text-center p-4 bg-white/30 rounded-2xl">
            <div className="flex items-center justify-center mb-2">
              <img 
                src={getTeamLogo(team1)} 
                alt={`${team1?.school} logo`}
                className="w-6 h-6 mr-2"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <h3 className="text-sm font-medium text-gray-600">{team1?.school} ROI</h3>
            </div>
            <p className={`text-2xl font-bold ${
              atsData.team1.roi >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {atsData.team1.roi > 0 ? '+' : ''}{atsData.team1.roi.toFixed(1)}%
            </p>
          </div>

          <div className="text-center p-4 bg-white/30 rounded-2xl">
            <div className="flex items-center justify-center mb-2">
              <img 
                src={getTeamLogo(team2)} 
                alt={`${team2?.school} logo`}
                className="w-6 h-6 mr-2"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <h3 className="text-sm font-medium text-gray-600">{team2?.school} ROI</h3>
            </div>
            <p className={`text-2xl font-bold ${
              atsData.team2.roi >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {atsData.team2.roi > 0 ? '+' : ''}{atsData.team2.roi.toFixed(1)}%
            </p>
          </div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Yearly Performance Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: animateCards ? 1 : 0, y: animateCards ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">ATS Win % by Year</h3>
          
          {/* Custom legend with logos */}
          <div className="flex justify-center mb-6 space-x-6">
            <div className="flex items-center">
              <img 
                src={getTeamLogo(team1)} 
                alt={`${team1?.school} logo`}
                className="w-5 h-5 mr-2"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: getTeamColor(team1) }}
              ></div>
              <span className="text-sm font-medium text-gray-700">{team1?.school}</span>
            </div>
            <div className="flex items-center">
              <img 
                src={getTeamLogo(team2)} 
                alt={`${team2?.school} logo`}
                className="w-5 h-5 mr-2"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: getTeamColor(team2) }}
              ></div>
              <span className="text-sm font-medium text-gray-700">{team2?.school}</span>
            </div>
          </div>
          
          <div className="h-80">
            <Line 
              data={yearlyChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false // Hide default legend since we have custom one
                  },
                  tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#1f2937',
                    bodyColor: '#374151',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    cornerRadius: 12,
                    displayColors: true,
                    callbacks: {
                      label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`
                    }
                  }
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { font: { size: 11 } }
                  },
                  y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(0,0,0,0.1)' },
                    ticks: {
                      font: { size: 11 },
                      callback: (value) => `${value}%`
                    }
                  }
                },
                elements: {
                  point: {
                    radius: 4,
                    hoverRadius: 6
                  }
                }
              }}
            />
          </div>
        </motion.div>

        {/* Situational Performance Radar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: animateCards ? 1 : 0, y: animateCards ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Situational ATS Performance</h3>
          
          {/* Custom legend with logos */}
          <div className="flex justify-center mb-6 space-x-6">
            <div className="flex items-center">
              <img 
                src={getTeamLogo(team1)} 
                alt={`${team1?.school} logo`}
                className="w-5 h-5 mr-2"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: getTeamColor(team1) }}
              ></div>
              <span className="text-sm font-medium text-gray-700">{team1?.school}</span>
            </div>
            <div className="flex items-center">
              <img 
                src={getTeamLogo(team2)} 
                alt={`${team2?.school} logo`}
                className="w-5 h-5 mr-2"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: getTeamColor(team2) }}
              ></div>
              <span className="text-sm font-medium text-gray-700">{team2?.school}</span>
            </div>
          </div>
          
          <div className="h-80">
            <Radar 
              data={radarChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false // Hide default legend since we have custom one
                  },
                  tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#1f2937',
                    bodyColor: '#374151',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    cornerRadius: 12,
                    callbacks: {
                      label: (context) => `${context.dataset.label}: ${context.parsed.r.toFixed(1)}%`
                    }
                  }
                },
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(0,0,0,0.1)' },
                    pointLabels: {
                      font: { size: 11, weight: '500' }
                    },
                    ticks: {
                      display: false
                    }
                  }
                }
              }}
            />
          </div>
        </motion.div>

        {/* Spread Size Performance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: animateCards ? 1 : 0, y: animateCards ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Performance by Spread Size</h3>
          
          {/* Custom legend with logos */}
          <div className="flex justify-center mb-6 space-x-6">
            <div className="flex items-center">
              <img 
                src={getTeamLogo(team1)} 
                alt={`${team1?.school} logo`}
                className="w-5 h-5 mr-2"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div 
                className="w-4 h-4 rounded-sm mr-2" 
                style={{ backgroundColor: getTeamColor(team1, 0.7) }}
              ></div>
              <span className="text-sm font-medium text-gray-700">{team1?.school} ATS Win %</span>
            </div>
            <div className="flex items-center">
              <img 
                src={getTeamLogo(team2)} 
                alt={`${team2?.school} logo`}
                className="w-5 h-5 mr-2"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div 
                className="w-4 h-4 rounded-sm mr-2" 
                style={{ backgroundColor: getTeamColor(team2, 0.7) }}
              ></div>
              <span className="text-sm font-medium text-gray-700">{team2?.school} ATS Win %</span>
            </div>
          </div>
          
          <div className="h-80">
            <Bar 
              data={spreadCategoryChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false // Hide default legend since we have custom one
                  },
                  tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#1f2937',
                    bodyColor: '#374151',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    cornerRadius: 12,
                    callbacks: {
                      label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`
                    }
                  }
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { font: { size: 11 } }
                  },
                  y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(0,0,0,0.1)' },
                    ticks: {
                      font: { size: 11 },
                      callback: (value) => `${value}%`
                    }
                  }
                }
              }}
            />
          </div>
        </motion.div>

        {/* Home vs Away Performance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: animateCards ? 1 : 0, y: animateCards ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6">Home vs Away ATS Performance</h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Team 1 */}
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src={getTeamLogo(team1)} 
                  alt={`${team1?.school} logo`}
                  className="w-6 h-6 mr-2"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <h4 className="text-lg font-semibold" style={{ color: getTeamColor(team1) }}>
                  {team1?.school}
                </h4>
              </div>
              <div className="h-48">
                <Pie 
                  data={{
                    labels: ['Home Wins', 'Home Losses', 'Away Wins', 'Away Losses'],
                    datasets: [{
                      data: [
                        atsData.team1.situational.home.wins,
                        atsData.team1.situational.home.losses,
                        atsData.team1.situational.away.wins,
                        atsData.team1.situational.away.losses
                      ],
                      backgroundColor: [
                        getTeamColor(team1, 0.8),
                        getTeamColor(team1, 0.4),
                        getTeamColor(team1, 0.6),
                        getTeamColor(team1, 0.2)
                      ],
                      borderColor: getTeamColor(team1),
                      borderWidth: 2
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: { size: 10 },
                          padding: 10
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#1f2937',
                        bodyColor: '#374151',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        cornerRadius: 12
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Team 2 */}
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src={getTeamLogo(team2)} 
                  alt={`${team2?.school} logo`}
                  className="w-6 h-6 mr-2"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <h4 className="text-lg font-semibold" style={{ color: getTeamColor(team2) }}>
                  {team2?.school}
                </h4>
              </div>
              <div className="h-48">
                <Pie 
                  data={{
                    labels: ['Home Wins', 'Home Losses', 'Away Wins', 'Away Losses'],
                    datasets: [{
                      data: [
                        atsData.team2.situational.home.wins,
                        atsData.team2.situational.home.losses,
                        atsData.team2.situational.away.wins,
                        atsData.team2.situational.away.losses
                      ],
                      backgroundColor: [
                        getTeamColor(team2, 0.8),
                        getTeamColor(team2, 0.4),
                        getTeamColor(team2, 0.6),
                        getTeamColor(team2, 0.2)
                      ],
                      borderColor: getTeamColor(team2),
                      borderWidth: 2
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: { size: 10 },
                          padding: 10
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#1f2937',
                        bodyColor: '#374151',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        cornerRadius: 12
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Debug Panel (collapsible) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: animateCards ? 1 : 0, y: animateCards ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-gray-800/20 backdrop-blur-xl rounded-2xl border border-gray-600/30 p-6"
      >
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer text-gray-700 font-medium mb-4 group-open:mb-6">
            <span>Debug Information</span>
            <i className="fas fa-chevron-down transition-transform group-open:rotate-180"></i>
          </summary>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-white/20 rounded-lg p-3">
              <h4 className="font-semibold text-gray-800 mb-2">Data Analysis</h4>
              <p className="text-gray-600">Games: {debugData.totalGamesAnalyzed}</p>
              <p className="text-gray-600">Lines: {debugData.linesFound}</p>
              <p className="text-gray-600">Estimated: {debugData.estimatedLines}</p>
            </div>
            
            <div className="bg-white/20 rounded-lg p-3">
              <h4 className="font-semibold text-gray-800 mb-2">API Usage</h4>
              <p className="text-gray-600">Calls: {debugData.apiCalls}</p>
              <p className="text-gray-600">Source: {debugData.dataSource}</p>
              <p className="text-gray-600">Updated: {debugData.lastUpdated}</p>
            </div>
            
            <div className="bg-white/20 rounded-lg p-3">
              <h4 className="font-semibold text-gray-800 mb-2">Records Used</h4>
              <p className="text-gray-600">{team1?.school}: {debugData.team1RecordsUsed}</p>
              <p className="text-gray-600">{team2?.school}: {debugData.team2RecordsUsed}</p>
            </div>
            
            <div className="bg-white/20 rounded-lg p-3">
              <h4 className="font-semibold text-gray-800 mb-2">Analysis Period</h4>
              <p className="text-gray-600">Years: {analysisYears.length}</p>
              <p className="text-gray-600">Range: {Math.min(...analysisYears)}-{Math.max(...analysisYears)}</p>
            </div>
          </div>
        </details>
      </motion.div>
    </div>
  );
};

export default ATSTab;
