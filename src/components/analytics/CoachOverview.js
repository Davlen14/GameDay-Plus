import React, { useState, useEffect } from "react";
import { 
  FaUserTie, FaSort, FaSortUp, FaSortDown, FaFilter, FaInfoCircle, 
  FaTrophy, FaExclamationTriangle, FaTachometerAlt, FaStar, FaSearch,
  FaChartLine, FaUsers, FaFire, FaCheckCircle
} from "react-icons/fa";
import { teamService } from "../../services/teamService";
import newsService from "../../services/newsService";

// Helper to aggregate season data for a coach
const aggregateCoachData = (seasons) => {
  return seasons.reduce(
    (acc, season) => {
      acc.games += season.games || 0;
      acc.wins += season.wins || 0;
      acc.losses += season.losses || 0;
      acc.ties += season.ties || 0;
      acc.srs += season.srs || 0;
      acc.spOverall += season.spOverall || 0;
      acc.spOffense += season.spOffense || 0;
      acc.spDefense += season.spDefense || 0;
      acc.count++;
      return acc;
    },
    {
      games: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      srs: 0,
      spOverall: 0,
      spOffense: 0,
      spDefense: 0,
      count: 0,
    }
  );
};

// Program tier mapping
const PROGRAM_TIERS = {
  // Elite Programs (9-10 scale)
  "alabama": { tier: "Elite Program", value: 9.5 },
  "ohio state": { tier: "Elite Program", value: 9.5 },
  "georgia": { tier: "Elite Program", value: 9.5 },
  "clemson": { tier: "Elite Program", value: 9.0 },

  // Strong Programs (7-8 scale)
  "auburn": { tier: "Strong Program", value: 7.8 },
  "boise state": { tier: "Strong Program", value: 7.0 },
  "florida": { tier: "Strong Program", value: 7.5 },
  "florida state": { tier: "Strong Program", value: 7.3 },
  "lsu": { tier: "Strong Program", value: 8.5 },
  "miami": { tier: "Strong Program", value: 7.2 },
  "michigan": { tier: "Strong Program", value: 8.5 },
  "notre dame": { tier: "Strong Program", value: 8.0 },
  "oklahoma": { tier: "Strong Program", value: 8.3 },
  "oregon": { tier: "Strong Program", value: 7.8 },
  "penn state": { tier: "Strong Program", value: 7.5 },
  "tennessee": { tier: "Strong Program", value: 7.2 },
  "texas": { tier: "Strong Program", value: 8.0 },
  "texas a&m": { tier: "Strong Program", value: 7.4 },
  "usc": { tier: "Strong Program", value: 8.2 },
  "washington": { tier: "Strong Program", value: 7.2 },
  "wisconsin": { tier: "Strong Program", value: 7.2 }
};

// Function to get program tier and strength
const getProgramTierAndStrength = (school) => {
  const schoolLower = school?.toLowerCase() || "";
  return schoolLower in PROGRAM_TIERS 
    ? PROGRAM_TIERS[schoolLower] 
    : { tier: "Average Program", value: 5.0 };
};

// Enhanced coach evaluation system
const getCoachStatus = (coach, metrics) => {
  const MIN_GAMES_THRESHOLD = 18;
  const { winPct, composite, trend, games, programStrength, expectations } = metrics;
  
  if (games < MIN_GAMES_THRESHOLD) {
    return {
      text: "Unproven",
      color: "slate",
      icon: <FaInfoCircle />,
      className: "status-unproven"
    };
  }
  
  const performanceVsExpectations = composite - (expectations * 0.8);
  const trendAdjustedScore = composite + (trend * 3);
  const premiereThreshold = 35 + (programStrength * 0.3);
  const hotSeatThreshold = 25 + (programStrength * 0.2);
  
  if (trendAdjustedScore >= premiereThreshold || performanceVsExpectations > 8) {
    return {
      text: "Premiere",
      color: "emerald",
      icon: <FaTrophy />,
      className: "status-premiere"
    };
  } else if (
    (trendAdjustedScore < hotSeatThreshold && performanceVsExpectations < -7) || 
    (winPct < 35 && games > 36) || 
    (trend < -2 && games > 30 && winPct < 45)
  ) {
    return {
      text: "Hot Seat",
      color: "red",
      icon: <FaFire />,
      className: "status-hotseat"
    };
  } else {
    return {
      text: "Average",
      color: "blue",
      icon: <FaTachometerAlt />,
      className: "status-average"
    };
  }
};

const CoachOverview = () => {
  const [coaches, setCoaches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [filteredCoaches, setFilteredCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("composite");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedCoaches, setSelectedCoaches] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  // Helper: Get team logo based on school name
  const getTeamLogo = (school) => {
    const team = teams.find(
      (t) => t.school && t.school.toLowerCase() === school?.toLowerCase()
    );
    return team?.logos?.[0] || "/photos/default_team.png";
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch teams and coaches data in parallel
        const [teamsData, coachesData] = await Promise.all([
          teamService.getAllTeams(),
          teamService.getCoaches()
        ]);

        setTeams(teamsData);

        // Filter to only active coaches (with recent seasons)
        const activeCoaches = coachesData.filter((coach) =>
          coach.seasons && coach.seasons.some((season) => season.year >= 2022)
        );

        // Process coach data
        const processedCoaches = activeCoaches.map((coach) => {
          const agg = aggregateCoachData(coach.seasons);
          const winPct = agg.games > 0 ? ((agg.wins / agg.games) * 100) : 0;
          const avgSrs = agg.count > 0 ? (agg.srs / agg.count) : 0;
          const avgSpOverall = agg.count > 0 ? (agg.spOverall / agg.count) : 0;
          const avgSpOffense = agg.count > 0 ? (agg.spOffense / agg.count) : 0;
          const avgSpDefense = agg.count > 0 ? (agg.spDefense / agg.count) : 0;

          // Calculate trend over last 3 seasons
          let trend = 0;
          const sortedSeasons = [...coach.seasons].sort((a, b) => b.year - a.year);
          if (sortedSeasons.length >= 3) {
            const recentSrsTrend = ((sortedSeasons[0].srs || 0) - (sortedSeasons[2].srs || 0)) / 3;
            const recentSpTrend = ((sortedSeasons[0].spOverall || 0) - (sortedSeasons[2].spOverall || 0)) / 3;
            const recentWinPctTrend = (
              ((sortedSeasons[0].wins || 0) / Math.max(1, (sortedSeasons[0].games || 1))) -
              ((sortedSeasons[2].wins || 0) / Math.max(1, (sortedSeasons[2].games || 1)))
            ) * 100 / 3;
            trend = (recentSrsTrend + recentSpTrend + recentWinPctTrend) / 3;
          }

          // Get current team (most recent season)
          const currentTeam = sortedSeasons.length > 0 ? sortedSeasons[0].school : "";
          
          // Get team data for conference info
          const teamData = teamsData.find(
            (t) => t.school && t.school.toLowerCase() === currentTeam.toLowerCase()
          );
          const conference = teamData ? teamData.conference : "";

          const programInfo = getProgramTierAndStrength(currentTeam);
          
          // Calculate composite score
          const normalizedSrs = avgSrs === 0 ? 0 : Math.min(100, Math.max(0, avgSrs * 2));
          const normalizedSpOverall = avgSpOverall === 0 ? 0 : Math.min(100, Math.max(0, avgSpOverall * 2));
          const composite = (normalizedSrs + normalizedSpOverall + winPct) / 3;
          const expectations = programInfo.value * 5;

          const metrics = {
            winPct,
            composite,
            trend,
            games: agg.games,
            programStrength: programInfo.value,
            expectations
          };

          return {
            ...coach,
            school: currentTeam,
            conference,
            winPct,
            avgSrs,
            avgSpOverall,
            avgSpOffense,
            avgSpDefense,
            composite,
            trend,
            programTier: programInfo.tier,
            status: getCoachStatus(coach, metrics),
            games: agg.games,
            wins: agg.wins,
            losses: agg.losses
          };
        });

        setCoaches(processedCoaches);
        setFilteredCoaches(processedCoaches);
      } catch (error) {
        console.error("Error fetching coach data:", error);
        // Fall back to mock data if API fails
        setCoaches([]);
        setFilteredCoaches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Handle modal scroll behavior
  useEffect(() => {
    if (showComparison) {
      // Prevent background scrolling when modal is open
      document.body.style.overflow = 'hidden';
      
      // Handle ESC key to close modal
      const handleEscKey = (event) => {
        if (event.key === 'Escape') {
          setShowComparison(false);
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      
      // Ensure modal is visible by scrolling to top of modal content
      setTimeout(() => {
        const modalElement = document.querySelector('[data-modal="comparison"]');
        if (modalElement) {
          modalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    } else {
      // Restore background scrolling when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling if component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showComparison]);

  // Filter and sort coaches
  useEffect(() => {
    let filtered = [...coaches];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        coach => 
          coach.firstName.toLowerCase().includes(search) ||
          coach.lastName.toLowerCase().includes(search) ||
          coach.school.toLowerCase().includes(search) ||
          coach.conference.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(coach => 
        coach.status.className === `status-${statusFilter}`
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case "name":
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case "school":
          aValue = a.school.toLowerCase();
          bValue = b.school.toLowerCase();
          break;
        case "winPct":
          aValue = a.winPct;
          bValue = b.winPct;
          break;
        case "composite":
          aValue = a.composite;
          bValue = b.composite;
          break;
        default:
          aValue = a[sortField] || 0;
          bValue = b[sortField] || 0;
      }

      if (typeof aValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });

    setFilteredCoaches(filtered);
  }, [coaches, searchTerm, statusFilter, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortDirection === "asc" ? 
      <FaSortUp className="text-red-600" /> : 
      <FaSortDown className="text-red-600" />;
  };

  const toggleCoachSelection = (coach) => {
    const coachId = `${coach.firstName}-${coach.lastName}`;
    const isSelected = selectedCoaches.some(c => `${c.firstName}-${c.lastName}` === coachId);
    
    if (isSelected) {
      setSelectedCoaches(selectedCoaches.filter(c => `${c.firstName}-${c.lastName}` !== coachId));
    } else {
      setSelectedCoaches([...selectedCoaches, coach]);
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5";
    
    switch (status.className) {
      case "status-premiere":
        return `${baseClasses} bg-gradient-to-br from-green-400 via-green-500 to-green-700 shadow-green-200 border border-green-300`;
      case "status-hotseat":
        return `${baseClasses} bg-gradient-to-br from-red-400 via-red-500 to-red-800 shadow-red-200 border border-red-300`;
      case "status-average":
        return `${baseClasses} bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-yellow-200 border border-yellow-300`;
      case "status-unproven":
        return `${baseClasses} bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 shadow-gray-200 border border-gray-300`;
      default:
        return `${baseClasses} bg-gray-500 text-white`;
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 1) return <FaSortUp className="text-emerald-500" />;
    if (trend < -1) return <FaSortDown className="text-red-500" />;
    return <FaSort className="text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-4 md:px-6 bg-gray-50">
        <div className="w-full max-w-[97%] mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading coach data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4 md:px-6 bg-gray-50">
      <div className="w-full max-w-[97%] mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text">
            Coach Overview
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive analytics and insights on college football coaches. Compare performance, 
            analyze trends, and discover the strategic minds shaping college football.
          </p>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search coaches, schools, or conferences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-3 flex-wrap">
              {[
                { key: "all", label: "All", icon: <FaUsers />, gradient: "bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700" },
                { key: "premiere", label: "Premiere", icon: <FaTrophy />, gradient: "bg-gradient-to-br from-green-400 via-green-500 to-green-700" },
                { key: "average", label: "Average", icon: <FaTachometerAlt />, gradient: "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600" },
                { key: "hotseat", label: "Hot Seat", icon: <FaFire />, gradient: "bg-gradient-to-br from-red-400 via-red-500 to-red-800" },
                { key: "unproven", label: "Unproven", icon: <FaInfoCircle />, gradient: "bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600" }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg border ${
                    statusFilter === filter.key
                      ? `${filter.gradient} text-white shadow-lg border-white/20 transform hover:-translate-y-0.5`
                      : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  {filter.icon}
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="composite">Overall Rating</option>
                <option value="winPct">Win Percentage</option>
                <option value="name">Name</option>
                <option value="school">School</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Showing {filteredCoaches.length} of {coaches.length} coaches
              {selectedCoaches.length > 0 && (
                <span className="ml-4 text-red-600 font-medium">
                  {selectedCoaches.length} selected for comparison
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Selected Coaches Bar */}
        {selectedCoaches.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-8 border-l-4 border-red-600">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-semibold text-gray-700">Selected Coaches:</span>
              <div className="flex flex-wrap gap-2">
                {selectedCoaches.map((coach) => (
                  <div
                    key={`${coach.firstName}-${coach.lastName}`}
                    className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    <span>{coach.firstName} {coach.lastName}</span>
                    <button
                      onClick={() => toggleCoachSelection(coach)}
                      className="text-red-600 hover:text-red-800 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {selectedCoaches.length >= 2 && (
                <button
                  onClick={() => setShowComparison(true)}
                  className="gradient-bg text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium"
                >
                  Compare Coaches
                </button>
              )}
            </div>
          </div>
        )}

        {/* Coach Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
          {filteredCoaches.map((coach) => {
            const isSelected = selectedCoaches.some(c => 
              `${c.firstName}-${c.lastName}` === `${coach.firstName}-${coach.lastName}`
            );

            return (
              <div
                key={`${coach.firstName}-${coach.lastName}`}
                className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 ${
                  isSelected ? "ring-2 ring-red-500 border-red-500" : ""
                }`}
              >
                {/* Card Header */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 relative">
                  <div className="absolute top-4 right-4 z-10">
                    <div className={getStatusBadge(coach.status)}>
                      {coach.status.icon}
                      {coach.status.text}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 mb-6 pr-32">
                    {/* Team Logo */}
                    <div className="w-16 h-16 flex-shrink-0">
                      <img 
                        src={getTeamLogo(coach.school)} 
                        alt={coach.school}
                        className="w-full h-full object-contain rounded-lg shadow-md"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                        {coach.firstName} {coach.lastName}
                      </h3>
                      <p className="text-gray-600 font-medium text-base truncate">{coach.school}</p>
                      <p className="text-sm text-gray-500 truncate">{coach.conference}</p>
                    </div>
                  </div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-text">
                        {coach.winPct.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-text">
                        {coach.wins}-{coach.losses}
                      </div>
                      <div className="text-sm text-gray-500">Record</div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-4 text-base">
                      <div className="flex justify-between">
                        <span className="text-gray-600">SRS:</span>
                        <span className="font-semibold">{coach.avgSrs.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">SP Overall:</span>
                        <span className="font-semibold">{coach.avgSpOverall.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">SP Offense:</span>
                        <span className="font-semibold">{coach.avgSpOffense.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">SP Defense:</span>
                        <span className="font-semibold">{coach.avgSpDefense.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Trend Indicator */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-base text-gray-600">Trend:</span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(coach.trend)}
                        <span className={`text-base font-medium ${
                          coach.trend > 1 ? "text-emerald-600" :
                          coach.trend < -1 ? "text-red-600" : "text-gray-600"
                        }`}>
                          {coach.trend > 1 ? "Improving" :
                           coach.trend < -1 ? "Declining" : "Stable"}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => toggleCoachSelection(coach)}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 text-base ${
                        isSelected
                          ? "gradient-bg text-white hover:opacity-90"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <FaCheckCircle className="inline mr-2" />
                          Selected
                        </>
                      ) : (
                        "Select for Comparison"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Modal */}
        {showComparison && selectedCoaches.length >= 2 && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={(e) => {
              // Close modal when clicking the backdrop
              if (e.target === e.currentTarget) {
                setShowComparison(false);
              }
            }}
          >
            <div 
              data-modal="comparison"
              className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto my-8 mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold gradient-text">Coach Comparison</h2>
                <button
                  onClick={() => setShowComparison(false)}
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
                        {selectedCoaches.map((coach) => (
                          <th key={`${coach.firstName}-${coach.lastName}`} className="text-center py-3 px-4 font-semibold text-gray-700">
                            <div className="flex flex-col items-center gap-2">
                              <img 
                                src={getTeamLogo(coach.school)} 
                                alt={coach.school}
                                className="w-8 h-8 object-contain"
                              />
                              <div>
                                {coach.firstName} {coach.lastName}
                                <div className="text-sm text-gray-500 font-normal">{coach.school}</div>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: "winPct", label: "Win Percentage", format: (val) => `${val.toFixed(1)}%` },
                        { key: "wins", label: "Total Wins", format: (val) => val },
                        { key: "losses", label: "Total Losses", format: (val) => val },
                        { key: "avgSrs", label: "Avg SRS", format: (val) => val.toFixed(1) },
                        { key: "avgSpOverall", label: "Avg SP Overall", format: (val) => val.toFixed(1) },
                        { key: "avgSpOffense", label: "Avg SP Offense", format: (val) => val.toFixed(1) },
                        { key: "avgSpDefense", label: "Avg SP Defense", format: (val) => val.toFixed(1) },
                        { key: "composite", label: "Overall Rating", format: (val) => val.toFixed(1) }
                      ].map((metric) => (
                        <tr key={metric.key} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium text-gray-700">{metric.label}</td>
                          {selectedCoaches.map((coach) => (
                            <td key={`${coach.firstName}-${coach.lastName}`} className="py-3 px-4 text-center">
                              {metric.format(coach[metric.key])}
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
        )}

        {/* Empty State */}
        {filteredCoaches.length === 0 && (
          <div className="text-center py-12">
            <FaUserTie className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No coaches found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachOverview;
