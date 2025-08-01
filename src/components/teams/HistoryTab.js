import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { gameService } from '../../services/gameService';
import { bettingService } from '../../services/bettingService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const HistoryTab = ({ team, primaryTeamColor }) => {
  const teamRgb = primaryTeamColor ? hexToRgb(primaryTeamColor) : { r: 220, g: 38, b: 38 };
  const teamColorRgb = `${teamRgb.r}, ${teamRgb.g}, ${teamRgb.b}`;

  // State for ATS data
  const [atsData, setAtsData] = useState({
    games: [],
    record: { wins: 0, losses: 0, pushes: 0 },
    winPercentage: 0,
    homeRecord: { wins: 0, losses: 0, pushes: 0 },
    awayRecord: { wins: 0, losses: 0, pushes: 0 },
    favoriteRecord: { wins: 0, losses: 0, pushes: 0 },
    underdogRecord: { wins: 0, losses: 0, pushes: 0 },
    monthlyData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(2024);

  // Convert hex to RGB for CSS
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 220, g: 38, b: 38 };
  }

  // Estimate spread if not available
  const estimateSpread = (game, team) => {
    const isHome = game.home_team === team.school || game.homeTeam === team.school;
    const homeAdvantage = 2.5;
    
    const teamScore = isHome ? (game.home_points || game.home_score) : (game.away_points || game.away_score);
    const oppScore = isHome ? (game.away_points || game.away_score) : (game.home_points || game.home_score);
    
    if (teamScore && oppScore) {
      const actualMargin = teamScore - oppScore;
      const estimatedSpread = actualMargin * 0.7;
      return isHome ? estimatedSpread - homeAdvantage : estimatedSpread + homeAdvantage;
    }
    
    return isHome ? -homeAdvantage : homeAdvantage;
  };

  // Calculate ATS result for a game
  const calculateATSResult = (game, team) => {
    const isHome = game.home_team === team.school || game.homeTeam === team.school;
    const teamScore = isHome ? (game.home_points || game.home_score) : (game.away_points || game.away_score);
    const oppScore = isHome ? (game.away_points || game.away_score) : (game.home_points || game.home_score);
    
    // Fix: Only reject null/undefined scores, allow 0 scores (shutouts are valid)
    if (teamScore == null || oppScore == null || teamScore === undefined || oppScore === undefined) {
      return { result: 'No Score', color: 'gray', margin: 0 };
    }
    
    const actualMargin = teamScore - oppScore; // Positive if team won, negative if team lost
    let spread = game.adjustedSpread || 0;
    
    if (!spread || spread === 0) {
      spread = estimateSpread(game, team);
    }
    
    // CORRECTED ATS LOGIC:
    // If spread is negative (-50.5), team is favored by 50.5 points and must win by MORE than 50.5
    // If spread is positive (+6.5), team is getting 6.5 points and covers if they lose by LESS than 6.5 or win
    // Standard formula: ATS Margin = Actual Margin - Spread
    // Team covers if ATS Margin > 0
    
    // Examples from Ohio State data:
    // Akron: OSU wins 52-6 (+46), spread -50.5 → 46 - (-50.5) = +96.5 → COVER (wrong in screenshot)
    // Wait, this suggests the spread values in screenshot might be flipped or wrong
    // Let me use the opposite logic based on what we manually calculated
    
    // CORRECT INTERPRETATION: The spread shown appears to be what OSU needs to cover
    // So if spread is -50.5, OSU needs to win by 50.5+ to cover, and they only won by 46 → LOSS
    const atsMargin = actualMargin + spread; // FLIP THE SIGN
    
    // Standard push threshold
    if (Math.abs(atsMargin) < 0.5) {
      return { result: 'PUSH', color: 'yellow', margin: atsMargin };
    } else if (atsMargin > 0) {
      return { result: 'COVER', color: 'green', margin: atsMargin };
    } else {
      return { result: 'LOSS', color: 'red', margin: atsMargin };
    }
  };

  // Load team's ATS data for selected season
  useEffect(() => {
    const loadATSData = async () => {
      if (!team?.school) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🏈 Loading ${team.school} ATS history for ${selectedSeason}...`);
        
        // Get ALL games for the season (regular + postseason)
        let allGames = [];
        
        try {
          // First try to get regular season games with betting lines
          const regularSeasonData = await bettingService.getTeamLines(team.school, selectedSeason, 'regular');
          if (regularSeasonData && regularSeasonData.length > 0) {
            allGames = regularSeasonData.map(gameWithLines => ({
              id: gameWithLines.id,
              season: gameWithLines.season || selectedSeason,
              week: gameWithLines.week,
              start_date: gameWithLines.startDate,
              date: gameWithLines.startDate,
              home_team: gameWithLines.homeTeam,
              away_team: gameWithLines.awayTeam,
              home_points: gameWithLines.homeScore,
              away_points: gameWithLines.awayScore,
              home_score: gameWithLines.homeScore,
              away_score: gameWithLines.awayScore,
              adjustedSpread: gameWithLines.lines?.[0]?.spread ? parseFloat(gameWithLines.lines[0].spread) : null,
              provider: gameWithLines.lines?.[0]?.provider || 'Estimated',
              season_type: 'regular'
            }));
          }
          
          // Also get postseason games (bowl games, playoffs)
          try {
            const postSeasonData = await bettingService.getTeamLines(team.school, selectedSeason, 'postseason');
            if (postSeasonData && postSeasonData.length > 0) {
              const postGames = postSeasonData.map(gameWithLines => ({
                id: gameWithLines.id,
                season: gameWithLines.season || selectedSeason,
                week: gameWithLines.week || 99, // High week number for sorting
                start_date: gameWithLines.startDate,
                date: gameWithLines.startDate,
                home_team: gameWithLines.homeTeam,
                away_team: gameWithLines.awayTeam,
                home_points: gameWithLines.homeScore,
                away_points: gameWithLines.awayScore,
                home_score: gameWithLines.homeScore,
                away_score: gameWithLines.awayScore,
                adjustedSpread: gameWithLines.lines?.[0]?.spread ? parseFloat(gameWithLines.lines[0].spread) : null,
                provider: gameWithLines.lines?.[0]?.provider || 'Estimated',
                season_type: 'postseason'
              }));
              allGames = [...allGames, ...postGames];
            }
          } catch (postError) {
            console.log('No postseason data available via betting service');
          }
          
        } catch (bettingError) {
          console.log('Betting service unavailable, using fallback...');
        }
        
        // ALWAYS get games from game service as fallback/supplement to ensure we have ALL games
        try {
          const regularGames = await gameService.getGames(selectedSeason, null, 'regular', team.school);
          const postGames = await gameService.getGames(selectedSeason, null, 'postseason', team.school);
          
          // Merge games, prioritizing betting service data but filling gaps with game service data
          const gameServiceGames = [...(regularGames || []), ...(postGames || [])];
          
          // Add any missing games from game service that aren't in betting service data
          gameServiceGames.forEach(gameServiceGame => {
            const existingGame = allGames.find(game => 
              game.id === gameServiceGame.id || 
              (game.week === gameServiceGame.week && 
               ((game.home_team === gameServiceGame.home_team && game.away_team === gameServiceGame.away_team) ||
                (game.home_team === gameServiceGame.homeTeam && game.away_team === gameServiceGame.awayTeam)))
            );
            
            if (!existingGame) {
              // Add missing game from game service
              allGames.push({
                id: gameServiceGame.id,
                season: gameServiceGame.season || selectedSeason,
                week: gameServiceGame.week,
                start_date: gameServiceGame.start_date || gameServiceGame.date,
                date: gameServiceGame.start_date || gameServiceGame.date,
                home_team: gameServiceGame.home_team || gameServiceGame.homeTeam,
                away_team: gameServiceGame.away_team || gameServiceGame.awayTeam,
                home_points: gameServiceGame.home_points || gameServiceGame.home_score,
                away_points: gameServiceGame.away_points || gameServiceGame.away_score,
                home_score: gameServiceGame.home_points || gameServiceGame.home_score,
                away_score: gameServiceGame.away_points || gameServiceGame.away_score,
                adjustedSpread: null, // No betting line available
                provider: 'Game Service',
                season_type: gameServiceGame.season_type || 'regular'
              });
            }
          });
          
        } catch (fallbackError) {
          console.log('Game service also unavailable:', fallbackError);
          // If betting service had data but game service failed, continue with betting data
          if (allGames.length === 0) {
            console.error('All data sources failed:', fallbackError);
          }
        }
        
        console.log(`📊 Found ${allGames.length} total games for ${team.school} ${selectedSeason} (including postseason)`);
        
        // Debug: Log all games with their week numbers and data sources
        if (team.school === 'Colorado State' && selectedSeason === 2024) {
          console.log('🔍 Raw game data for Colorado State 2024:');
          allGames.forEach((game, index) => {
            const opponent = game.home_team === team.school ? game.away_team : game.home_team;
            const hasLines = game.adjustedSpread !== null;
            console.log(`${index + 1}. Week ${game.week || 'N/A'} vs ${opponent} (${game.season_type || 'regular'}) - Lines: ${hasLines ? 'YES' : 'NO'} - Provider: ${game.provider || 'Unknown'} - Date: ${game.start_date || game.date}`);
          });
        }
        
        // Also debug for any team if there are missing weeks
        if (selectedSeason === 2024) {
          const weekNumbers = allGames.map(g => g.week).filter(w => w && w < 20).sort((a, b) => a - b);
          const uniqueWeeks = [...new Set(weekNumbers)];
          if (uniqueWeeks.length > 0) {
            const expectedWeeks = [];
            for (let i = Math.min(...uniqueWeeks); i <= Math.max(...uniqueWeeks); i++) {
              expectedWeeks.push(i);
            }
            const missingWeeks = expectedWeeks.filter(w => !uniqueWeeks.includes(w));
            if (missingWeeks.length > 0) {
              console.warn(`⚠️ ${team.school} missing weeks: ${missingWeeks.join(', ')}`);
            }
          }
        }
        
        let games = allGames;
        
        // Calculate ATS metrics
        const processedGames = [];
        const metrics = {
          record: { wins: 0, losses: 0, pushes: 0 },
          homeRecord: { wins: 0, losses: 0, pushes: 0 },
          awayRecord: { wins: 0, losses: 0, pushes: 0 },
          favoriteRecord: { wins: 0, losses: 0, pushes: 0 },
          underdogRecord: { wins: 0, losses: 0, pushes: 0 },
          monthlyData: {}
        };
        
        games.forEach(game => {
          const isHome = game.home_team === team.school || game.homeTeam === team.school;
          const teamScore = isHome ? (game.home_points || game.home_score) : (game.away_points || game.away_score);
          const oppScore = isHome ? (game.away_points || game.away_score) : (game.home_points || game.home_score);
          
          const opponent = isHome ? (game.away_team || game.awayTeam) : (game.home_team || game.homeTeam);
          
          // Calculate ATS result only if we have final scores
          // Fix: Allow 0 scores as valid (shutouts happen), just check for null/undefined
          let atsResult;
          if (teamScore == null || oppScore == null || teamScore === undefined || oppScore === undefined) {
            console.log(`⚠️ Game vs ${opponent} - no final score (${teamScore ?? 'null'}-${oppScore ?? 'null'}) - will show in table but not count in ATS record`);
            atsResult = { result: 'No Score', color: 'gray', margin: 0 };
          } else {
            atsResult = calculateATSResult(game, team);
          }
          
          // Debug logging for any team with missing scores
          if (teamScore == null || oppScore == null) {
            console.log(`🔍 Missing score debug for ${team.school} vs ${opponent}:`, {
              week: game.week,
              home_points: game.home_points,
              away_points: game.away_points,
              home_score: game.home_score,
              away_score: game.away_score,
              isHome,
              teamScore,
              oppScore,
              provider: game.provider
            });
          }
          
          // Debug logging for Colorado State 2024 to verify calculations
          if (team.school === 'Colorado State' && selectedSeason === 2024 && (teamScore != null && oppScore != null)) {
            const actualMargin = teamScore - oppScore;
            const spread = game.adjustedSpread || 0;
            const atsMargin = actualMargin + spread;
            const coverResult = atsMargin > 0 ? 'COVER' : 'LOSS';
            console.log(`🏈 Week ${game.week || 'N/A'} vs ${opponent}: Score ${teamScore}-${oppScore} (margin: ${actualMargin > 0 ? '+' : ''}${actualMargin}), Spread: ${spread}, ATS Margin: ${atsMargin > 0 ? '+' : ''}${atsMargin.toFixed(1)} → ${coverResult}`);
          }
          
          const processedGame = {
            ...game,
            isHome,
            opponent,
            atsResult: atsResult.result,
            atsColor: atsResult.color,
            atsMargin: atsResult.margin,
            teamScore,
            oppScore
          };
          
          // ALWAYS add the game to the processed games list for display
          processedGames.push(processedGame);
          
          // Only count games with valid ATS results in metrics (games with final scores)
          if (atsResult.result !== 'No Score') {
            // Update metrics
            const locationKey = isHome ? 'homeRecord' : 'awayRecord';
            const favoriteKey = (game.adjustedSpread || 0) < 0 ? 'favoriteRecord' : 'underdogRecord';
            
            if (atsResult.result === 'COVER') {
              metrics.record.wins++;
              metrics[locationKey].wins++;
              metrics[favoriteKey].wins++;
            } else if (atsResult.result === 'LOSS') {
              metrics.record.losses++;
              metrics[locationKey].losses++;
              metrics[favoriteKey].losses++;
            } else if (atsResult.result === 'PUSH') {
              metrics.record.pushes++;
              metrics[locationKey].pushes++;
              metrics[favoriteKey].pushes++;
            }
            
            // Monthly data
            const gameDate = new Date(game.start_date || game.date);
            const month = gameDate.toLocaleDateString('en-US', { month: 'short' });
            if (!metrics.monthlyData[month]) {
              metrics.monthlyData[month] = { wins: 0, losses: 0, pushes: 0 };
            }
            
            if (atsResult.result === 'COVER') metrics.monthlyData[month].wins++;
            else if (atsResult.result === 'LOSS') metrics.monthlyData[month].losses++;
            else if (atsResult.result === 'PUSH') metrics.monthlyData[month].pushes++;
          }
        });
        
        const totalAtsGames = metrics.record.wins + metrics.record.losses;
        const winPercentage = totalAtsGames > 0 ? (metrics.record.wins / totalAtsGames) * 100 : 0;
        
        setAtsData({
          games: processedGames.sort((a, b) => (a.week || 0) - (b.week || 0)),
          record: metrics.record,
          winPercentage,
          homeRecord: metrics.homeRecord,
          awayRecord: metrics.awayRecord,
          favoriteRecord: metrics.favoriteRecord,
          underdogRecord: metrics.underdogRecord,
          monthlyData: Object.keys(metrics.monthlyData).map(month => ({
            month,
            ...metrics.monthlyData[month]
          }))
        });
        
        // Debug: Log processed games for Colorado State
        if (team.school === 'Colorado State' && selectedSeason === 2024) {
          console.log('🔍 Processed games for Colorado State 2024:');
          processedGames.sort((a, b) => (a.week || 0) - (b.week || 0)).forEach((game, index) => {
            const hasScore = game.teamScore != null && game.oppScore != null;
            console.log(`${index + 1}. Week ${game.week || 'N/A'} vs ${game.opponent} (${game.season_type || 'regular'}) - Score: ${hasScore ? `${game.teamScore}-${game.oppScore}` : 'TBD'} - ATS: ${game.atsResult}`);
          });
        }
        
        console.log(`✅ ${team.school} ${selectedSeason} FINAL ATS: ${metrics.record.wins}-${metrics.record.losses}-${metrics.record.pushes} (${winPercentage.toFixed(1)}%)`);
        console.log(`📈 Total games processed: ${processedGames.length} | ATS eligible: ${totalAtsGames + metrics.record.pushes}`);
        
        // Debug log for Ohio State verification
        if (team.school === 'Ohio State' && selectedSeason === 2024) {
          console.log('🔍 Ohio State 2024 ATS Debug (CORRECTED CALCULATION):');
          console.log(`Expected: 10-4-0 (71.4%) | Actual: ${metrics.record.wins}-${metrics.record.losses}-${metrics.record.pushes} (${winPercentage.toFixed(1)}%)`);
          console.log('Manual verification: OSU covered 10/14 games in 2024');
        }
        
        // Debug log for Texas verification  
        if (team.school === 'Texas' && selectedSeason === 2024) {
          console.log('🔍 Texas 2024 ATS Debug:');
          console.log(`Expected: 7-5-0 (58.3%) | Actual: ${metrics.record.wins}-${metrics.record.losses}-${metrics.record.pushes} (${winPercentage.toFixed(1)}%)`);
        }
        
      } catch (error) {
        console.error('Error loading ATS history:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadATSData();
  }, [team?.school, selectedSeason]);

  // Chart data
  const recordChartData = useMemo(() => ({
    labels: ['Covers', 'Losses', 'Pushes'],
    datasets: [{
      data: [atsData.record.wins, atsData.record.losses, atsData.record.pushes],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(251, 191, 36, 0.8)'
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(239, 68, 68)',
        'rgb(251, 191, 36)'
      ],
      borderWidth: 2
    }]
  }), [atsData.record]);

  const situationalChartData = useMemo(() => {
    const getWinPercentage = (record) => {
      const total = record.wins + record.losses;
      return total > 0 ? (record.wins / total) * 100 : 0;
    };

    return {
      labels: ['Home', 'Away', 'Favorite', 'Underdog'],
      datasets: [{
        label: 'ATS Win %',
        data: [
          getWinPercentage(atsData.homeRecord),
          getWinPercentage(atsData.awayRecord),
          getWinPercentage(atsData.favoriteRecord),
          getWinPercentage(atsData.underdogRecord)
        ],
        backgroundColor: `rgba(${teamColorRgb}, 0.7)`,
        borderColor: primaryTeamColor,
        borderWidth: 2
      }]
    };
  }, [atsData, teamColorRgb, primaryTeamColor]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="relative inline-block">
          <div className="w-16 h-16 rounded-full bg-white/40 backdrop-blur-2xl border border-white/50 shadow-lg flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-transparent border-t-red-600"></div>
          </div>
          <p className="text-gray-700 font-medium">Loading ATS History...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-600 mb-4">
          <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
          <p className="text-lg font-semibold">Error Loading Data</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Season Selector */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-gray-800">
            {team?.school} ATS History
          </h3>
          <div className="flex items-center gap-2">
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
              className="px-3 py-1 rounded-lg border border-gray-300 bg-white shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value={2024}>2024 Season</option>
              <option value={2023}>2023 Season</option>
              <option value={2022}>2022 Season</option>
            </select>
          </div>
        </div>
        
        {/* ATS Record Summary */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: primaryTeamColor }}>
              {atsData.record.wins}-{atsData.record.losses}
              {atsData.record.pushes > 0 && `-${atsData.record.pushes}`}
            </div>
            <div className="text-sm text-gray-600">ATS Record</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {atsData.winPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Win Rate</div>
          </div>
        </div>
      </div>

      {/* Games Table */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800">
            {selectedSeason} Games & ATS Results
          </h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opponent</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Spread</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ATS Result</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ATS Margin</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {atsData.games.map((game, index) => (
                <tr key={game.id || index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span>{game.week || 'N/A'}</span>
                      {game.season_type === 'postseason' && (
                        <span className="px-1 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-bold">
                          POST
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {game.start_date ? new Date(game.start_date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'TBD'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {game.opponent}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      game.isHome 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {game.isHome ? 'HOME' : 'AWAY'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {game.teamScore && game.oppScore ? (
                      <span className={`font-medium ${
                        game.teamScore > game.oppScore ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {game.teamScore}-{game.oppScore}
                      </span>
                    ) : (
                      <span className="text-gray-400">TBD</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {game.adjustedSpread ? (
                      <span className={game.adjustedSpread > 0 ? 'text-red-600' : 'text-green-600'}>
                        {game.adjustedSpread > 0 ? '+' : ''}{game.adjustedSpread.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Est.</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      game.atsResult === 'COVER' ? 'bg-green-100 text-green-800' :
                      game.atsResult === 'LOSS' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {game.atsResult}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {game.atsMargin !== undefined ? (
                      <span className={`font-medium ${
                        game.atsMargin > 0 ? 'text-green-600' : 
                        game.atsMargin < 0 ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {game.atsMargin > 0 ? '+' : ''}{game.atsMargin.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {atsData.games.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No games found for {selectedSeason} season
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ATS Record Pie Chart */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedSeason} ATS Breakdown
          </h4>
          <div className="h-64 flex items-center justify-center">
            <Pie 
              data={recordChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      font: { size: 12 }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                        return `${context.label}: ${context.raw} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Situational Performance Bar Chart */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Situational Performance
          </h4>
          <div className="h-64">
            <Bar 
              data={situationalChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: function(value) {
                        return value + '%';
                      }
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `Win Rate: ${context.raw.toFixed(1)}%`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
          
          {/* Situational Records Detail */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-medium">Home:</span>
              <span style={{ color: primaryTeamColor }}>
                {atsData.homeRecord.wins}-{atsData.homeRecord.losses}
                {atsData.homeRecord.pushes > 0 && `-${atsData.homeRecord.pushes}`}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-medium">Away:</span>
              <span style={{ color: primaryTeamColor }}>
                {atsData.awayRecord.wins}-{atsData.awayRecord.losses}
                {atsData.awayRecord.pushes > 0 && `-${atsData.awayRecord.pushes}`}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-medium">Favorite:</span>
              <span style={{ color: primaryTeamColor }}>
                {atsData.favoriteRecord.wins}-{atsData.favoriteRecord.losses}
                {atsData.favoriteRecord.pushes > 0 && `-${atsData.favoriteRecord.pushes}`}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-medium">Underdog:</span>
              <span style={{ color: primaryTeamColor }}>
                {atsData.underdogRecord.wins}-{atsData.underdogRecord.losses}
                {atsData.underdogRecord.pushes > 0 && `-${atsData.underdogRecord.pushes}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryTab;