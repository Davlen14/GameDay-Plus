import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, FaFilter, FaSort, FaSortUp, FaSortDown, FaSearch, 
  FaTrophy, FaFootballBall, FaFire, FaShieldAlt, FaTarget, FaBolt,
  FaArrowUp, FaArrowDown, FaMinus, FaInfoCircle, FaExchangeAlt,
  FaEye, FaChartBar, FaUsers, FaMapMarkerAlt, FaStar, FaCalendarAlt
} from 'react-icons/fa';
import { teamService } from '../../services/teamService';
import { analyticsService } from '../../services/analyticsService';
import { rankingsService } from '../../services/rankingsService';
import { bettingService } from '../../services/bettingService';

const TeamMetrics = () => {
  // State management
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj) || 0;
  };

  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading comprehensive team analytics...');
      
      // Load base team data and conferences
      const [allTeams, conferenceData] = await Promise.all([
        teamService.getFBSTeams(true),
        teamService.getConferences()
      ]);
      
      console.log(`✅ Loaded ${allTeams.length} teams and ${conferenceData.length} conferences`);
      
      // Get unique conferences from teams
      const uniqueConferences = [...new Set(allTeams.map(team => team.conference))].filter(Boolean);
      setConferences(uniqueConferences.sort());
      
      // Load comprehensive analytics for each team (in batches to avoid API limits)
      const enhancedTeams = [];
      const batchSize = 10;
      
      for (let i = 0; i < allTeams.length; i += batchSize) {
        const batch = allTeams.slice(i, i + batchSize);
        const batchPromises = batch.map(async (team) => {
          try {
            // Get comprehensive team analytics including betting data
            const [
              teamStats,
              advancedStats,
              spRatings,
              eloRatings,
              fpiRatings,
              ppaData,
              recruitingData,
              talentData,
              enhancedAnalytics,
              bettingData
            ] = await Promise.all([
              teamService.getTeamStats(selectedYear, team.school).catch(() => null),
              teamService.getAdvancedTeamStats(selectedYear, team.school).catch(() => null),
              teamService.getSPRatings(selectedYear, team.school).catch(() => null),
              teamService.getEloRatings(selectedYear, null, team.school).catch(() => null),
              teamService.getFPIRatings(selectedYear, team.school).catch(() => null),
              teamService.getTeamPPA(selectedYear, team.school).catch(() => null),
              teamService.getRecruitingRankings(selectedYear, team.school).catch(() => null),
              teamService.getTalentRatings(selectedYear).then(data => 
                data?.find(t => t.school === team.school)
              ).catch(() => null),
              analyticsService.getEnhancedTeamMetrics(team, selectedYear).catch(() => null),
              bettingService.getTeamLines(team.school, selectedYear).catch(() => null)
            ]);
            
            // Calculate composite metrics
            const enhancedTeam = {
              ...team,
              // Basic stats
              stats: teamStats?.[0] || {},
              advancedStats: advancedStats?.[0] || {},
              
              // Ratings
              spRating: spRatings?.[0] || {},
              eloRating: eloRatings?.[0] || {},
              fpiRating: fpiRatings?.[0] || {},
              ppa: ppaData?.[0] || {},
              
              // Recruiting and talent
              recruiting: recruitingData?.[0] || {},
              talent: talentData || {},
              
              // Enhanced analytics and betting
              enhancedAnalytics: enhancedAnalytics || {},
              bettingLines: bettingData || [],
              
              // Calculated metrics
              ...calculateCompositeMetrics(teamStats?.[0], advancedStats?.[0], spRatings?.[0], eloRatings?.[0], ppaData?.[0], enhancedAnalytics, bettingData)
            };
            
            return enhancedTeam;
          } catch (error) {
            console.warn(`Failed to load analytics for ${team.school}:`, error);
            return { ...team, error: true };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        enhancedTeams.push(...batchResults);
        
        // Progress update
        console.log(`📊 Processed ${enhancedTeams.length}/${allTeams.length} teams...`);
        
        // Small delay to be nice to the API
        if (i + batchSize < allTeams.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Load rankings data
      const [apPoll, coachesPoll] = await Promise.all([
        rankingsService.getAPPoll(selectedYear).catch(() => []),
        rankingsService.getCoachesPoll(selectedYear).catch(() => [])
      ]);
      
      // Merge ranking data
      const latestAPPoll = apPoll[apPoll.length - 1];
      const latestCoachesPoll = coachesPoll[coachesPoll.length - 1];
      
      enhancedTeams.forEach(team => {
        // Add AP ranking
        const apRank = latestAPPoll?.ranks?.find(r => r.school === team.school);
        if (apRank) {
          team.apRank = apRank.rank;
          team.apPoints = apRank.points;
        }
        
        // Add Coaches ranking
        const coachesRank = latestCoachesPoll?.ranks?.find(r => r.school === team.school);
        if (coachesRank) {
          team.coachesRank = coachesRank.rank;
          team.coachesPoints = coachesRank.points;
        }
      });
      
      setTeams(enhancedTeams);
      console.log('🎉 Team analytics loading complete!');
      
    } catch (error) {
      console.error('Error loading team data:', error);
      setError('Failed to load team analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      case 'up': return <FaArrowUp className="text-green-500" />;
      case 'down': return <FaArrowDown className="text-red-500" />;
      default: return <FaMinus className="text-gray-500" />;
    }
  };

  const getTeamLogo = (team) => {
    return team.logos?.[0] || `/photos/${team.school}.png`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Team Analytics</h2>
            <p className="text-gray-600">Gathering comprehensive performance data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 gradient-text">Team Performance Analytics</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
const TeamMetricCard = ({ team, index, viewMode, selectedMetric, onSort, getSortIcon, getRatingColor, getTrendIcon, getTeamLogo, isSelected, onToggleComparison }) => {
  const [expanded, setExpanded] = useState(false);

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
            {team.apRank && (
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-600">#{team.apRank}</div>
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
    <div className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Team Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <img src={getTeamLogo(team)} alt={team.school} className="w-16 h-16 object-contain" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{team.school}</h2>
            <p className="text-lg text-gray-600">{team.mascot}</p>
            <p className="text-sm text-gray-500">{team.conference}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {team.apRank && (
            <div className="text-center bg-yellow-100 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-800">#{team.apRank}</div>
              <div className="text-sm text-yellow-600">AP Poll</div>
            </div>
          )}
          {team.coachesRank && (
            <div className="text-center bg-purple-100 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-800">#{team.coachesRank}</div>
              <div className="text-sm text-purple-600">Coaches</div>
            </div>
          )}
          <button
            onClick={onToggleComparison}
            className={`px-4 py-2 rounded-lg font-semibold ${
              isSelected 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isSelected ? 'Selected' : 'Compare'}
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <MetricCard
          icon={<FaTrophy />}
          label="Overall Rating"
          value={(team.overallRating || 0).toFixed(1)}
          color={getRatingColor(team.overallRating || 0)}
          trend={getTrendIcon(team.trending)}
        />
        <MetricCard
          icon={<FaBolt />}
          label="Offensive Efficiency"
          value={(team.offensiveEfficiency || 0).toFixed(1)}
          color={getRatingColor(team.offensiveEfficiency || 0)}
        />
        <MetricCard
          icon={<FaShieldAlt />}
          label="Defensive Efficiency"
          value={(team.defensiveEfficiency || 0).toFixed(1)}
          color={getRatingColor(team.defensiveEfficiency || 0)}
        />
        <MetricCard
          icon={<FaTarget />}
          label="Win Rate"
          value={`${(team.winPercentage || 0).toFixed(1)}%`}
          color={getRatingColor(team.winPercentage || 0)}
        />
        {team.marketConfidence && (
          <MetricCard
            icon={<FaChartLine />}
            label="Market Confidence"
            value={`±${team.marketConfidence.toFixed(1)}`}
            color="text-purple-600 bg-purple-100"
          />
        )}
      </div>

      {/* Advanced Metrics (Expandable) */}
      <div className="border-t pt-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full text-left font-semibold text-gray-700 hover:text-gray-900"
        >
          <span>Advanced Analytics</span>
          <FaChartLine className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        
        {expanded && (
          <div className="mt-4 space-y-4">
            {/* Traditional Advanced Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {team.spRating?.overall && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">SP+ Overall</div>
                  <div className="text-xl font-bold">{team.spRating.overall.toFixed(1)}</div>
                </div>
              )}
              {team.eloRating?.elo && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Elo Rating</div>
                  <div className="text-xl font-bold">{Math.round(team.eloRating.elo)}</div>
                </div>
              )}
              {team.fpiRating?.fpi && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">FPI</div>
                  <div className="text-xl font-bold">{team.fpiRating.fpi.toFixed(1)}</div>
                </div>
              )}
              {team.recruiting?.rank && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Recruiting Rank</div>
                  <div className="text-xl font-bold">#{team.recruiting.rank}</div>
                </div>
              )}
              {team.talent?.talent && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Talent Rating</div>
                  <div className="text-xl font-bold">{team.talent.talent.toFixed(1)}</div>
                </div>
              )}
              {team.strengthOfSchedule && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">SOS</div>
                  <div className="text-xl font-bold">{team.strengthOfSchedule.toFixed(1)}</div>
                </div>
              )}
            </div>

            {/* Betting Market Insights */}
            {team.bettingInsights && team.bettingInsights.totalGames > 0 && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                  <FaChartLine className="mr-2" />
                  Betting Market Analysis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-800">
                      {team.bettingInsights.totalGames}
                    </div>
                    <div className="text-sm text-purple-600">Games with Lines</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-800">
                      ±{team.bettingInsights.avgSpread.toFixed(1)}
                    </div>
                    <div className="text-sm text-purple-600">Avg Point Spread</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-800">
                      {((team.bettingInsights.favoredCount / team.bettingInsights.totalGames) * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-purple-600">Favored Games</div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Analytics */}
            {team.enhancedAnalytics && Object.keys(team.enhancedAnalytics).length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <FaChartBar className="mr-2" />
                  Enhanced Analytics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {team.enhancedAnalytics.compositeScore && (
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-800">
                        {team.enhancedAnalytics.compositeScore.toFixed(1)}
                      </div>
                      <div className="text-sm text-blue-600">Composite Score</div>
                    </div>
                  )}
                  {team.enhancedAnalytics.efficiency && (
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-800">
                        {team.enhancedAnalytics.efficiency.toFixed(1)}%
                      </div>
                      <div className="text-sm text-blue-600">Overall Efficiency</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
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
