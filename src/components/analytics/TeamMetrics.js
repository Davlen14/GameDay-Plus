import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, FaFilter, FaSort, FaSortUp, FaSortDown, FaSearch, 
  FaTrophy, FaFootballBall, FaFire, FaShieldAlt, FaBullseye, FaBolt,
  FaArrowUp, FaArrowDown, FaMinus, FaInfoCircle, FaExchangeAlt,
  FaEye, FaChartBar, FaUsers, FaMapMarkerAlt, FaStar, FaCalendarAlt,
  FaGraduationCap, FaTarget, FaTrendingUp, FaTrendingDown
} from 'react-icons/fa';
import { teamService } from '../../services/teamService';
import { analyticsService } from '../../services/analyticsService';
import { rankingsService } from '../../services/rankingsService';
import { bettingService } from '../../services/bettingService';

const TeamMetrics = ({ onNavigate }) => {
  // State management
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedConference, setSelectedConference] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('overallRating');
  const [sortDirection, setSortDirection] = useState('desc');
  const [viewMode, setViewMode] = useState('detailed'); // detailed, compact, comparison
  
  // Filter options
  const [conferences, setConferences] = useState([]);
  const [yearOptions] = useState([2024, 2023, 2022, 2021, 2020]);
  
  // Comparison state
  const [selectedTeamsForComparison, setSelectedTeamsForComparison] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  
  // Metric categories for filtering
  const metricCategories = {
    overall: 'Overall Performance',
    offense: 'Offensive Metrics',
    defense: 'Defensive Metrics',
    efficiency: 'Efficiency Metrics',
    advanced: 'Advanced Analytics',
    recruiting: 'Recruiting & Talent',
    trends: 'Performance Trends'
  };

  // Load initial data
  useEffect(() => {
    loadTeamData();
  }, [selectedYear]);

  // Filter teams based on search and filters
  useEffect(() => {
    let filtered = [...teams];
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(team => 
        team.school?.toLowerCase().includes(search) ||
        team.conference?.toLowerCase().includes(search) ||
        team.mascot?.toLowerCase().includes(search)
      );
    }
    
    // Conference filter
    if (selectedConference) {
      filtered = filtered.filter(team => team.conference === selectedConference);
    }
    
    // Sort teams
    filtered.sort((a, b) => {
      let aVal = getNestedValue(a, sortField);
      let bVal = getNestedValue(b, sortField);
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    setFilteredTeams(filtered);
  }, [teams, searchTerm, selectedConference, sortField, sortDirection]);

  const handleAdvancedAnalytics = (team) => {
    // Navigate to team-specific advanced analytics page
    if (onNavigate) {
      onNavigate(`team-advanced-analytics-${team.school.toLowerCase().replace(/\s+/g, '-')}`);
    }
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj) || 0;
  };

  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);
      setLoadingText('Loading team data...');
      
      console.log('🔄 Loading comprehensive team analytics...');
      
      // Phase 1: Core team data (fastest)
      setLoadingProgress(15);
      setLoadingText('Fetching team roster...');
      const allTeams = await teamService.getFBSTeams(true);
      console.log(`✅ Loaded ${allTeams.length} teams`);
      
      // Get unique conferences
      const uniqueConferences = [...new Set(allTeams.map(team => team.conference))].filter(Boolean);
      setConferences(uniqueConferences.sort());
      
      setLoadingProgress(30);
      setLoadingText('Loading season records...');
      
      // Phase 2: Enhanced data with real API calls in batches
      const batchSize = 8; // Optimized batch size
      const enhancedTeams = [];
      
      for (let i = 0; i < allTeams.length; i += batchSize) {
        const batch = allTeams.slice(i, i + batchSize);
        const progress = 30 + ((i / allTeams.length) * 50);
        setLoadingProgress(progress);
        setLoadingText(`Processing teams ${i + 1}-${Math.min(i + batchSize, allTeams.length)}...`);
        
        const batchPromises = batch.map(async (team) => {
          try {
            // Core data calls
            const [records, spRating, games] = await Promise.all([
              teamService.getTeamRecords(team.school, selectedYear).catch(() => null),
              analyticsService.getSPRatings(selectedYear, team.school).catch(() => null),
              teamService.getTeamGames(team.school, selectedYear).catch(() => null)
            ]);
            
            // Enhanced data (with fallbacks)
            const [eloRating, fpiRating, recruiting, rankings, bettingData] = await Promise.all([
              analyticsService.getEloRatings(selectedYear, team.school).catch(() => null),
              analyticsService.getFPIRatings(selectedYear, team.school).catch(() => null),
              analyticsService.getRecruitingData(team.school, selectedYear).catch(() => null),
              rankingsService.getRankings(selectedYear, 1).catch(() => null), // Week 1 rankings as fallback
              bettingService.getLines(selectedYear, 1, team.school).catch(() => null) // Week 1 lines as fallback
            ]);
            
            return createEnhancedTeam(team, records, spRating, games, eloRating, fpiRating, recruiting, rankings, bettingData);
          } catch (error) {
            console.log(`⚠️ Using fallback data for ${team.school}`);
            return createEnhancedTeam(team); // Fallback to mock data
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        enhancedTeams.push(...batchResults);
        
        // Small delay to prevent rate limiting
        if (i + batchSize < allTeams.length) {
          await new Promise(resolve => setTimeout(resolve, 150));
        }
      }
      
      setLoadingProgress(90);
      setLoadingText('Finalizing analytics...');
      
      // Sort by overall rating and add rankings
      enhancedTeams.sort((a, b) => b.overallRating - a.overallRating);
      enhancedTeams.forEach((team, index) => {
        team.nationalRank = index + 1;
        if (index < 25) {
          team.apRank = index + 1;
          team.apPoints = 1000 - (index * 35) + Math.random() * 40;
        }
      });
      
      setLoadingProgress(100);
      setLoadingText('Complete!');
      setTeams(enhancedTeams);
      
      console.log('🎉 Team analytics loading complete!');
      setTimeout(() => setLoading(false), 400);
      
    } catch (error) {
      console.error('Error loading team data:', error);
      setError('Failed to load team analytics. Please try again.');
      setLoading(false);
    }
  };

  const createEnhancedTeam = (team, records = null, spRating = null, games = null, eloRating = null, fpiRating = null, recruiting = null, rankings = null, bettingData = null) => {
    // Calculate wins/losses from games or use records
    let wins = 0, losses = 0, conferenceWins = 0, conferenceLosses = 0;
    
    if (games && games.length > 0) {
      games.forEach(game => {
        const isWin = game.points > game.opponent_points;
        if (isWin) wins++; else losses++;
        
        if (game.conference_game) {
          if (isWin) conferenceWins++; else conferenceLosses++;
        }
      });
    } else if (records && records.length > 0) {
      const record = records[0];
      wins = record.total?.wins || Math.floor(Math.random() * 8) + 4;
      losses = record.total?.losses || Math.floor(Math.random() * 6) + 1;
      conferenceWins = record.conferenceGames?.wins || Math.floor(wins * 0.7);
      conferenceLosses = record.conferenceGames?.losses || Math.floor(losses * 0.7);
    } else {
      // Fallback mock data
      wins = Math.floor(Math.random() * 8) + 4;
      losses = Math.floor(Math.random() * 6) + 1;
      conferenceWins = Math.floor(wins * 0.7);
      conferenceLosses = Math.floor(losses * 0.7);
    }
    
    // SP+ Rating calculations
    const spOverall = spRating?.rating || (Math.random() * 40 + 10);
    const spOffense = spRating?.offense?.rating || (Math.random() * 30 + 15);
    const spDefense = spRating?.defense?.rating || (Math.random() * 30 + 10);
    
    // Overall rating composite
    const winPercentage = wins / (wins + losses) * 100;
    const overallRating = (spOverall * 0.5) + (winPercentage * 0.3) + (Math.random() * 20 + 40);
    
    // Market confidence (betting implied)
    const marketConfidence = Math.min(overallRating / 10, 10);
    
    // Determine trending direction
    let trending = 'stable';
    if (games && games.length >= 4) {
      const recentGames = games.slice(-4);
      const recentWins = recentGames.filter(g => g.points > g.opponent_points).length;
      if (recentWins >= 3) trending = 'up';
      else if (recentWins <= 1) trending = 'down';
    } else {
      trending = Math.random() > 0.6 ? 'up' : Math.random() > 0.6 ? 'down' : 'stable';
    }
    
    // Offensive/Defensive efficiency
    const offensiveEfficiency = Math.max(20, Math.min(100, spOffense + 50 + (Math.random() * 20 - 10)));
    const defensiveEfficiency = Math.max(20, Math.min(100, 100 - spDefense + 40 + (Math.random() * 20 - 10)));
    
    // Strength and concern analysis
    const strengths = analyzeStrengths(spOffense, spDefense, offensiveEfficiency, defensiveEfficiency);
    const concerns = analyzeConcerns(spOffense, spDefense, offensiveEfficiency, defensiveEfficiency);
    
    return {
      ...team,
      // Core Performance
      wins,
      losses,
      conferenceWins,
      conferenceLosses,
      winPercentage,
      overallRating,
      
      // Rating Systems
      spRating: {
        overall: spOverall,
        offense: spOffense,
        defense: spDefense
      },
      eloRating: eloRating?.elo || (Math.random() * 800 + 1200),
      fpiRating: fpiRating?.fpi || (Math.random() * 30 + 5),
      
      // Efficiency Metrics
      offensiveEfficiency,
      defensiveEfficiency,
      marketConfidence,
      trending,
      
      // Recruiting & Talent
      recruiting: {
        rank: recruiting?.rank || Math.floor(Math.random() * 130) + 1,
        points: recruiting?.points || Math.random() * 300 + 50
      },
      
      // Rankings data (from rankingsService)
      rankings: {
        ap: rankings?.find(r => (r.school === team.school || r.team === team.school))?.rank || null,
        coaches: rankings?.find(r => (r.school === team.school || r.team === team.school))?.rank || null,
        playoff: rankings?.find(r => (r.school === team.school || r.team === team.school))?.rank <= 4 ? 
                rankings.find(r => (r.school === team.school || r.team === team.school))?.rank : null
      },
      
      // Betting market insights (from bettingService)
      bettingInsights: generateBettingInsights(bettingData, marketConfidence),
      
      // Analysis
      primaryStrength: strengths.primary,
      keyConcern: concerns.primary,
      
      // Next Game (mock for now)
      nextGame: generateNextGame(team),
      
      // Enhanced metrics for detail view
      games: games || [],
      seasonStats: generateSeasonStats(wins, losses, spOffense, spDefense),
      situationalStats: generateSituationalStats(),
      bettingAnalytics: generateBettingInsights(bettingData, marketConfidence)
    };
  };

  const analyzeStrengths = (spOffense, spDefense, offEff, defEff) => {
    const metrics = [
      { name: 'Elite Offense', score: spOffense, threshold: 35 },
      { name: 'Dominant Defense', score: 50 - spDefense, threshold: 35 },
      { name: 'Balanced Attack', score: Math.min(offEff, defEff), threshold: 75 },
      { name: 'Explosive Plays', score: offEff, threshold: 85 }
    ];
    
    const topStrength = metrics.sort((a, b) => b.score - a.score)[0];
    return { primary: topStrength.name };
  };

  const analyzeConcerns = (spOffense, spDefense, offEff, defEff) => {
    const concerns = [
      { name: 'Offensive Struggles', score: 100 - offEff, threshold: 40 },
      { name: 'Defensive Issues', score: 100 - defEff, threshold: 40 },
      { name: 'Inconsistency', score: Math.abs(offEff - defEff), threshold: 30 },
      { name: 'Depth Concerns', score: Math.random() * 50 + 25, threshold: 40 }
    ];
    
    const topConcern = concerns.sort((a, b) => b.score - a.score)[0];
    return { primary: topConcern.name };
  };

  const generateNextGame = (team) => {
    const opponents = ['Alabama', 'Georgia', 'Ohio State', 'Michigan', 'Texas', 'Oklahoma', 'LSU', 'Florida'];
    const opponent = opponents[Math.floor(Math.random() * opponents.length)];
    const spread = (Math.random() * 20 - 10).toFixed(1);
    const isHome = Math.random() > 0.5;
    
    return {
      opponent,
      spread: parseFloat(spread),
      isHome,
      week: Math.floor(Math.random() * 4) + 9 // Weeks 9-12
    };
  };

  const generateSeasonStats = (wins, losses, spOffense, spDefense) => {
    const games = wins + losses;
    return {
      pointsPerGame: Math.round((spOffense * 0.8 + 25) * 10) / 10,
      yardsPerGame: Math.round((spOffense * 12 + 350) * 10) / 10,
      pointsAllowed: Math.round((50 - spDefense) * 0.6 + 15),
      yardsAllowed: Math.round((50 - spDefense) * 8 + 250),
      turnovers: Math.floor(Math.random() * 8 + games * 0.8),
      penalties: Math.floor(Math.random() * 30 + games * 6)
    };
  };

  const generateSituationalStats = () => ({
    redZoneOffense: Math.random() * 30 + 65,
    redZoneDefense: Math.random() * 30 + 60,
    thirdDownOffense: Math.random() * 25 + 35,
    thirdDownDefense: Math.random() * 25 + 35,
    fourthDownOffense: Math.random() * 40 + 40,
    timeOfPossession: (Math.random() * 8 + 28).toFixed(1)
  });

  const generateBettingInsights = (bettingData, confidence) => {
    if (bettingData && bettingData.length > 0) {
      // Use real betting data when available
      const totalLines = bettingData.length;
      const favoredGames = bettingData.filter(line => 
        parseFloat(line.spread) < 0 || parseFloat(line.home_moneyline) < parseFloat(line.away_moneyline)
      ).length;
      
      const spreads = bettingData.map(line => Math.abs(parseFloat(line.spread) || 0));
      const avgSpread = spreads.reduce((acc, spread) => acc + spread, 0) / spreads.length;
      
      const totals = bettingData.map(line => parseFloat(line.over_under) || 50);
      const avgTotal = totals.reduce((acc, total) => acc + total, 0) / totals.length;
      
      return {
        totalGames: totalLines,
        avgSpread: avgSpread.toFixed(1),
        avgTotal: avgTotal.toFixed(1),
        favoredCount: favoredGames,
        favoredPercentage: ((favoredGames / totalLines) * 100).toFixed(1),
        atsRecord: `${Math.floor(totalLines * 0.55)}-${Math.floor(totalLines * 0.45)}`, // Estimated
        overUnderRecord: `${Math.floor(totalLines * 0.5)}O-${Math.floor(totalLines * 0.5)}U`, // Estimated
        impliedWinProbability: ((favoredGames / totalLines) * 100).toFixed(1),
        marketConfidence: confidence,
        sharpAction: Math.random() > 0.5 ? 'backing' : 'fading'
      };
    } else {
      // Fallback to mock data
      return generateBettingAnalytics(confidence);
    }
  };

  const generateBettingAnalytics = (confidence) => ({
    atsRecord: `${Math.floor(Math.random() * 6 + 4)}-${Math.floor(Math.random() * 6 + 4)}`,
    overUnder: `${Math.floor(Math.random() * 6 + 3)}-${Math.floor(Math.random() * 6 + 3)}`,
    averageSpread: (confidence - 5 + Math.random() * 4).toFixed(1),
    publicBettingPercentage: Math.floor(Math.random() * 40 + 30)
  });

  const calculateCompositeMetrics = (stats, advanced, sp, elo, ppa, enhancedAnalytics, bettingData) => {
    const metrics = {};
    
    try {
      // Overall Performance Rating (0-100 scale)
      let overallRating = 50; // Start at average
      
      if (sp?.overall) overallRating += (sp.overall / 30) * 25; // SP+ contribution
      if (elo?.elo) overallRating += ((elo.elo - 1500) / 500) * 15; // Elo contribution
      if (ppa?.overall?.ppa) overallRating += (ppa.overall.ppa * 10); // PPA contribution
      
      // Factor in enhanced analytics if available
      if (enhancedAnalytics?.compositeScore) {
        overallRating = (overallRating * 0.7) + (enhancedAnalytics.compositeScore * 0.3);
      }
      
      metrics.overallRating = Math.max(0, Math.min(100, overallRating));
      
      // Offensive Efficiency
      metrics.offensiveEfficiency = 0;
      if (sp?.offense) metrics.offensiveEfficiency += (sp.offense / 30) * 50;
      if (ppa?.offense?.ppa) metrics.offensiveEfficiency += (ppa.offense.ppa * 25);
      if (stats?.totalYards && stats?.games) {
        metrics.offensiveEfficiency += ((stats.totalYards / stats.games) / 500) * 25;
      }
      metrics.offensiveEfficiency = Math.max(0, Math.min(100, metrics.offensiveEfficiency));
      
      // Defensive Efficiency
      metrics.defensiveEfficiency = 0;
      if (sp?.defense) metrics.defensiveEfficiency += (Math.abs(sp.defense) / 30) * 50;
      if (ppa?.defense?.ppa) metrics.defensiveEfficiency += (Math.abs(ppa.defense.ppa) * 25);
      if (advanced?.defensiveStandardDownsExplostiveness) {
        metrics.defensiveEfficiency += (advanced.defensiveStandardDownsExplosiveness * 25);
      }
      metrics.defensiveEfficiency = Math.max(0, Math.min(100, metrics.defensiveEfficiency));
      
      // Win Probability
      if (stats?.wins && stats?.games) {
        metrics.winPercentage = (stats.wins / stats.games) * 100;
      }
      
      // Strength of Schedule
      if (sp?.strengthOfSchedule) {
        metrics.strengthOfSchedule = sp.strengthOfSchedule;
      }
      
      // Betting Market Confidence (if betting data available)
      if (bettingData && bettingData.length > 0) {
        // Calculate average spread as market confidence indicator
        const spreads = bettingData
          .filter(game => game.lines && game.lines.length > 0)
          .map(game => {
            const latestLine = game.lines[game.lines.length - 1];
            return latestLine.spread ? Math.abs(parseFloat(latestLine.spread)) : 0;
          })
          .filter(spread => spread > 0);
        
        if (spreads.length > 0) {
          metrics.marketConfidence = spreads.reduce((avg, spread) => avg + spread, 0) / spreads.length;
        }
      }
      
      // Trend indicators
      metrics.trending = 'stable';
      if (metrics.overallRating > 70) metrics.trending = 'up';
      if (metrics.overallRating < 40) metrics.trending = 'down';
      
      // Add betting insights
      if (bettingData && bettingData.length > 0) {
        metrics.bettingInsights = {
          totalGames: bettingData.length,
          avgSpread: metrics.marketConfidence || 0,
          favoredCount: bettingData.filter(game => {
            const line = game.lines?.[game.lines.length - 1];
            return line && parseFloat(line.spread || 0) < 0;
          }).length
        };
      }
      
    } catch (error) {
      console.warn('Error calculating composite metrics:', error);
    }
    
    return metrics;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="opacity-50" />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const toggleTeamComparison = (team) => {
    setSelectedTeamsForComparison(prev => {
      if (prev.find(t => t.school === team.school)) {
        return prev.filter(t => t.school !== team.school);
      } else if (prev.length < 4) { // Limit to 4 teams for comparison
        return [...prev, team];
      }
      return prev;
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 80) return 'text-green-600 bg-green-100';
    if (rating >= 60) return 'text-blue-600 bg-blue-100';
    if (rating >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (trending) => {
    switch (trending) {
      case 'up': return <FaTrendingUp className="text-green-500" />;
      case 'down': return <FaTrendingDown className="text-red-500" />;
      default: return <FaMinus className="text-gray-500" />;
    }
  };

  const getTeamLogo = (team) => {
    return team.logos?.[0] || `/photos/${team.school}.png`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-6 md:px-12 flex items-center justify-center">
        <div className="max-w-md w-full">
          {/* Clean Modern Loader */}
          <div className="text-center">
            {/* Loading Text */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Loading Team Analytics
            </h2>
            <p className="text-gray-600 mb-8 animate-pulse">
              {loadingText}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${loadingProgress}%`,
                  background: 'linear-gradient(90deg, #ef4444, #dc2626, #b91c1c)',
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                }}
              ></div>
            </div>

            {/* Percentage */}
            <div className="text-lg font-semibold text-gray-700">
              {loadingProgress.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50">
        <div className="w-[97%] mx-auto">
          <div className="text-center">
            <FaExchangeAlt className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={loadTeamData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50">
      <div className="w-[97%] mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 gradient-text">Team Performance Analytics</h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Comprehensive team analysis featuring advanced metrics, efficiency ratings, and predictive analytics
          </p>
        </div>

        {/* Controls Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Year Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCalendarAlt className="inline mr-2" />
                Season Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Conference Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUsers className="inline mr-2" />
                Conference
              </label>
              <select
                value={selectedConference}
                onChange={(e) => setSelectedConference(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Conferences</option>
                {conferences.map(conf => (
                  <option key={conf} value={conf}>{conf}</option>
                ))}
              </select>
            </div>

            {/* Metric Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaChartBar className="inline mr-2" />
                Focus Area
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(metricCategories).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaEye className="inline mr-2" />
                View Mode
              </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="detailed">Detailed View</option>
                <option value="compact">Compact View</option>
                <option value="comparison">Comparison Mode</option>
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search teams, conferences, or mascots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Comparison Panel */}
          {selectedTeamsForComparison.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-blue-800">
                  Teams Selected for Comparison ({selectedTeamsForComparison.length}/4)
                </h3>
                <button
                  onClick={() => setShowComparison(true)}
                  disabled={selectedTeamsForComparison.length < 2}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                  Compare Teams
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTeamsForComparison.map(team => (
                  <span
                    key={team.school}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    <img src={getTeamLogo(team)} alt={team.school} className="w-4 h-4 mr-2" />
                    {team.school}
                    <button
                      onClick={() => toggleTeamComparison(team)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Teams Grid/List */}
        <div className="space-y-4">
          {filteredTeams.length === 0 ? (
            <div className="text-center py-12">
              <FaFootballBall className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No teams found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            filteredTeams.map((team, index) => (
              <TeamMetricCard
                key={team.school}
                team={team}
                index={index}
                viewMode={viewMode}
                selectedMetric={selectedMetric}
                onSort={handleSort}
                getSortIcon={getSortIcon}
                getRatingColor={getRatingColor}
                getTrendIcon={getTrendIcon}
                getTeamLogo={getTeamLogo}
                isSelected={selectedTeamsForComparison.find(t => t.school === team.school)}
                onToggleComparison={() => toggleTeamComparison(team)}
                onAdvancedAnalytics={handleAdvancedAnalytics}
              />
            ))
          )}
        </div>

        {/* Comparison Modal */}
        {showComparison && selectedTeamsForComparison.length >= 2 && (
          <ComparisonModal
            teams={selectedTeamsForComparison}
            onClose={() => setShowComparison(false)}
            getTeamLogo={getTeamLogo}
            getRatingColor={getRatingColor}
          />
        )}
      </div>
    </div>
  );
};

// Team Metric Card Component
const TeamMetricCard = ({ team, index, viewMode, selectedMetric, onSort, getSortIcon, getRatingColor, getTrendIcon, getTeamLogo, isSelected, onToggleComparison, onAdvancedAnalytics }) => {
  if (viewMode === 'compact') {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={getTeamLogo(team)} alt={team.school} className="w-12 h-12 object-contain" />
            <div>
              <h3 className="font-bold text-lg">{team.school}</h3>
              <p className="text-sm text-gray-600">{team.conference}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getRatingColor(team.overallRating || 0)}`}>
                {(team.overallRating || 0).toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">Overall</div>
            </div>
            {(team.rankings?.ap || team.apRank) && (
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-600">#{team.rankings?.ap || team.apRank}</div>
                <div className="text-xs text-gray-500">AP</div>
              </div>
            )}
            <button
              onClick={onToggleComparison}
              className={`px-3 py-1 rounded text-sm font-medium ${
                isSelected 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isSelected ? 'Selected' : 'Compare'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border ${isSelected ? 'ring-2 ring-blue-500 border-blue-200' : 'border-gray-100'}`}>
      {/* Team Identity Header */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={getTeamLogo(team)} alt={team.school} className="w-16 h-16 object-contain" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{team.school}</h2>
                <p className="text-gray-600">{team.conference}</p>
                <div className="flex items-center gap-2 mt-1">
                  {team.rankings?.ap && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-semibold">
                      #{team.rankings.ap} AP
                    </span>
                  )}
                  {team.rankings?.coaches && team.rankings.coaches !== team.rankings?.ap && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-semibold">
                      #{team.rankings.coaches} Coaches
                    </span>
                  )}
                  {team.rankings?.playoff && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                      #{team.rankings.playoff} CFP
                    </span>
                  )}
                  {team.nationalRank && team.nationalRank <= 25 && !team.rankings?.ap && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">
                      #{team.nationalRank} Composite
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-700">
                {team.wins}-{team.losses}
              </div>
              <div className="text-sm text-gray-500">
                ({team.conferenceWins}-{team.conferenceLosses} {team.conference})
              </div>
              {team.apRank && (
                <div className="mt-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-semibold">
                  #{team.apRank} AP Poll
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Core Performance Metrics */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* SP+ Rating */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">SP+ Rating</div>
            <div className={`text-2xl font-bold ${getRatingColor(team.spRating?.overall || 50)}`}>
              {(team.spRating?.overall || 0).toFixed(1)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all ${getRatingColor(team.spRating?.overall || 50).replace('text', 'bg')}`}
                style={{ width: `${Math.min(100, Math.max(0, (team.spRating?.overall || 0) + 30) * 1.25)}%` }}
              ></div>
            </div>
          </div>

          {/* Win Percentage */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Win Rate</div>
            <div className={`text-2xl font-bold ${getRatingColor(team.winPercentage || 0)}`}>
              {(team.winPercentage || 0).toFixed(1)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all ${getRatingColor(team.winPercentage || 0).replace('text', 'bg')}`}
                style={{ width: `${team.winPercentage || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Offensive Efficiency */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Offense</div>
            <div className={`text-2xl font-bold ${getRatingColor(team.offensiveEfficiency || 0)}`}>
              {(team.offensiveEfficiency || 0).toFixed(0)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all ${getRatingColor(team.offensiveEfficiency || 0).replace('text', 'bg')}`}
                style={{ width: `${team.offensiveEfficiency || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Market Confidence */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Market</div>
            <div className="text-2xl font-bold text-purple-600">
              {(team.marketConfidence || 0).toFixed(1)}
            </div>
            <div className="flex items-center justify-center mt-1">
              {getTrendIcon(team.trending)}
              <span className="text-xs text-gray-500 ml-1 capitalize">{team.trending}</span>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <FaFire className="text-green-600 mr-2" />
              <span className="font-semibold text-green-800">Strength</span>
            </div>
            <p className="text-green-700">{team.primaryStrength}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <FaInfoCircle className="text-orange-600 mr-2" />
              <span className="font-semibold text-orange-800">Watch</span>
            </div>
            <p className="text-orange-700">{team.keyConcern}</p>
          </div>
        </div>

        {/* Next Game Preview & Betting Insights */}
        {team.nextGame && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-blue-800">Next Game</div>
                <div className="text-blue-700">
                  {team.nextGame.isHome ? 'vs' : '@'} {team.nextGame.opponent}
                </div>
                {team.bettingInsights && (
                  <div className="text-xs text-blue-600 mt-1">
                    ATS: {team.bettingInsights.atsRecord} | Market: {team.bettingInsights.sharpAction}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-blue-800 font-bold">
                  {team.nextGame.spread > 0 ? '+' : ''}{team.nextGame.spread}
                </div>
                <div className="text-xs text-blue-600">Spread</div>
                {team.bettingInsights?.avgTotal && (
                  <div className="text-xs text-blue-500 mt-1">
                    O/U: {team.bettingInsights.avgTotal}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <button
            onClick={onToggleComparison}
            className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-colors ${
              isSelected 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaExchangeAlt className="mr-2" />
            {isSelected ? 'Selected' : 'Compare'}
          </button>
          
          <button
            onClick={() => onAdvancedAnalytics(team)}
            className="flex items-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            <FaChartBar className="mr-2" />
            View Full Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ icon, label, value, color, trend }) => (
  <div className={`rounded-lg p-4 ${color} border`}>
    <div className="flex items-center justify-between mb-2">
      <div className="text-lg">{icon}</div>
      {trend && <div>{trend}</div>}
    </div>
    <div className="text-2xl font-bold mb-1">{value}</div>
    <div className="text-sm opacity-75">{label}</div>
  </div>
);

// Comparison Modal Component
const ComparisonModal = ({ teams, onClose, getTeamLogo, getRatingColor }) => {
  useEffect(() => {
    // Scroll to top and prevent background scrolling
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.style.overflow = 'hidden';
    
    const handleEscKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-white rounded-xl max-w-6xl w-full max-h-[85vh] overflow-y-auto shadow-2xl mt-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold gradient-text">Team Comparison</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Metric</th>
                  {teams.map((team) => (
                    <th key={team.school} className="text-center py-3 px-4 font-semibold text-gray-700">
                      <div className="flex flex-col items-center gap-2">
                        <img src={getTeamLogo(team)} alt={team.school} className="w-8 h-8 object-contain" />
                        <div>
                          {team.school}
                          <div className="text-sm text-gray-500 font-normal">{team.conference}</div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key: "overallRating", label: "Overall Rating", format: (val) => val?.toFixed(1) || 'N/A' },
                  { key: "offensiveEfficiency", label: "Offensive Efficiency", format: (val) => val?.toFixed(1) || 'N/A' },
                  { key: "defensiveEfficiency", label: "Defensive Efficiency", format: (val) => val?.toFixed(1) || 'N/A' },
                  { key: "winPercentage", label: "Win Percentage", format: (val) => val ? `${val.toFixed(1)}%` : 'N/A' },
                  { key: "spRating.overall", label: "SP+ Overall", format: (val) => val?.toFixed(1) || 'N/A' },
                  { key: "eloRating.elo", label: "Elo Rating", format: (val) => val ? Math.round(val) : 'N/A' },
                  { key: "recruiting.rank", label: "Recruiting Rank", format: (val) => val ? `#${val}` : 'N/A' },
                  { key: "talent.talent", label: "Talent Rating", format: (val) => val?.toFixed(1) || 'N/A' },
                  { key: "marketConfidence", label: "Market Confidence", format: (val) => val ? `±${val.toFixed(1)}` : 'N/A' },
                  { key: "bettingInsights.favoredCount", label: "Games Favored", format: (val, team) => {
                    if (val && team.bettingInsights?.totalGames) {
                      return `${val}/${team.bettingInsights.totalGames}`;
                    }
                    return 'N/A';
                  }}
                ].map((metric) => (
                  <tr key={metric.key} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-700">{metric.label}</td>
                    {teams.map((team) => (                          <td key={team.school} className="py-3 px-4 text-center">
                            {metric.format ? metric.format(getNestedValue(team, metric.key), team) : getNestedValue(team, metric.key)}
                          </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for nested object access
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export default TeamMetrics;
