import React, { useState, useEffect } from "react";
import { 
  FaUserTie, FaSort, FaSortUp, FaSortDown, FaFilter, FaInfoCircle, 
  FaTrophy, FaExclamationTriangle, FaTachometerAlt, FaStar, FaSearch,
  FaChartLine, FaUsers, FaFire, FaCheckCircle
} from "react-icons/fa";

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

// Mock data for demonstration
const mockCoachData = [
  {
    firstName: "Kirby",
    lastName: "Smart",
    school: "Georgia",
    conference: "SEC",
    hireDate: "2015-12-06",
    seasons: [
      { year: 2024, games: 15, wins: 13, losses: 2, srs: 18.5, spOverall: 22.1, spOffense: 18.7, spDefense: 5.2 },
      { year: 2023, games: 14, wins: 13, losses: 1, srs: 20.2, spOverall: 24.3, spOffense: 20.1, spDefense: 4.8 },
      { year: 2022, games: 15, wins: 15, losses: 0, srs: 22.8, spOverall: 26.5, spOffense: 22.3, spDefense: 3.9 },
      { year: 2021, games: 15, wins: 14, losses: 1, srs: 19.7, spOverall: 23.1, spOffense: 19.8, spDefense: 5.1 }
    ]
  },
  {
    firstName: "Nick",
    lastName: "Saban",
    school: "Alabama", 
    conference: "SEC",
    hireDate: "2007-01-03",
    seasons: [
      { year: 2024, games: 14, wins: 10, losses: 4, srs: 12.3, spOverall: 15.7, spOffense: 14.2, spDefense: 8.1 },
      { year: 2023, games: 15, wins: 12, losses: 3, srs: 16.8, spOverall: 19.4, spOffense: 17.1, spDefense: 6.3 },
      { year: 2022, games: 13, wins: 11, losses: 2, srs: 18.2, spOverall: 21.6, spOffense: 19.3, spDefense: 5.7 },
      { year: 2021, games: 15, wins: 13, losses: 2, srs: 20.1, spOverall: 23.8, spOffense: 21.4, spDefense: 4.9 }
    ]
  },
  {
    firstName: "Ryan",
    lastName: "Day",
    school: "Ohio State",
    conference: "Big Ten", 
    hireDate: "2019-01-02",
    seasons: [
      { year: 2024, games: 13, wins: 11, losses: 2, srs: 17.4, spOverall: 20.8, spOffense: 24.1, spDefense: 7.2 },
      { year: 2023, games: 14, wins: 11, losses: 3, srs: 15.9, spOverall: 18.6, spOffense: 22.3, spDefense: 8.9 },
      { year: 2022, games: 13, wins: 11, losses: 2, srs: 19.2, spOverall: 22.7, spOffense: 26.4, spDefense: 6.1 },
      { year: 2021, games: 13, wins: 11, losses: 2, srs: 18.6, spOverall: 21.9, spOffense: 25.2, spDefense: 6.8 }
    ]
  },
  {
    firstName: "Dabo",
    lastName: "Swinney", 
    school: "Clemson",
    conference: "ACC",
    hireDate: "2008-10-13",
    seasons: [
      { year: 2024, games: 13, wins: 9, losses: 4, srs: 8.7, spOverall: 11.2, spOffense: 9.8, spDefense: 12.1 },
      { year: 2023, games: 14, wins: 9, losses: 5, srs: 6.3, spOverall: 8.9, spOffense: 7.2, spDefense: 14.3 },
      { year: 2022, games: 14, wins: 11, losses: 3, srs: 14.1, spOverall: 17.6, spOffense: 15.3, spDefense: 9.2 },
      { year: 2021, games: 13, wins: 10, losses: 3, srs: 12.8, spOverall: 16.1, spOffense: 13.9, spDefense: 10.7 }
    ]
  },
  {
    firstName: "Lincoln",
    lastName: "Riley",
    school: "USC",
    conference: "Pac-12",
    hireDate: "2021-11-28", 
    seasons: [
      { year: 2024, games: 13, wins: 8, losses: 5, srs: 5.2, spOverall: 7.8, spOffense: 12.4, spDefense: 16.7 },
      { year: 2023, games: 14, wins: 8, losses: 6, srs: 3.1, spOverall: 5.6, spOffense: 10.9, spDefense: 18.2 },
      { year: 2022, games: 14, wins: 11, losses: 3, srs: 11.7, spOverall: 14.3, spOffense: 18.1, spDefense: 13.4 }
    ]
  },
  {
    firstName: "Marcus",
    lastName: "Freeman",
    school: "Notre Dame",
    conference: "Independent",
    hireDate: "2021-12-06",
    seasons: [
      { year: 2024, games: 14, wins: 12, losses: 2, srs: 16.8, spOverall: 19.7, spOffense: 17.2, spDefense: 7.8 },
      { year: 2023, games: 13, wins: 10, losses: 3, srs: 13.4, spOverall: 16.1, spOffense: 14.7, spDefense: 9.3 },
      { year: 2022, games: 13, wins: 9, losses: 4, srs: 9.6, spOverall: 12.1, spOffense: 11.3, spDefense: 11.8 }
    ]
  }
];

const CoachOverview = () => {
  const [coaches, setCoaches] = useState([]);
  const [filteredCoaches, setFilteredCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("composite");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedCoaches, setSelectedCoaches] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    // Simulate loading and process mock data
    const processCoaches = () => {
      const processedCoaches = mockCoachData.map((coach) => {
        const agg = aggregateCoachData(coach.seasons);
        const winPct = agg.games > 0 ? ((agg.wins / agg.games) * 100) : 0;
        const avgSrs = agg.count > 0 ? (agg.srs / agg.count) : 0;
        const avgSpOverall = agg.count > 0 ? (agg.spOverall / agg.count) : 0;
        const avgSpOffense = agg.count > 0 ? (agg.spOffense / agg.count) : 0;
        const avgSpDefense = agg.count > 0 ? (agg.spDefense / agg.count) : 0;

        // Calculate trend
        let trend = 0;
        const sortedSeasons = [...coach.seasons].sort((a, b) => b.year - a.year);
        if (sortedSeasons.length >= 3) {
          const recentSrsTrend = ((sortedSeasons[0].srs || 0) - (sortedSeasons[2].srs || 0)) / 3;
          const recentSpTrend = ((sortedSeasons[0].spOverall || 0) - (sortedSeasons[2].spOverall || 0)) / 3;
          trend = (recentSrsTrend + recentSpTrend) / 2;
        }

        const programInfo = getProgramTierAndStrength(coach.school);
        const composite = (avgSrs + avgSpOverall + winPct * 0.5) / 3;
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
      setLoading(false);
    };

    setTimeout(processCoaches, 1000); // Simulate API delay
  }, []);

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
    const baseClasses = "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-lg transition-all duration-300";
    
    switch (status.className) {
      case "status-premiere":
        return `${baseClasses} bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-200`;
      case "status-hotseat":
        return `${baseClasses} bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-200`;
      case "status-average":
        return `${baseClasses} bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-200`;
      case "status-unproven":
        return `${baseClasses} bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-slate-200`;
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
      <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
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
    <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
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
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
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
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "all", label: "All", icon: <FaUsers /> },
                { key: "premiere", label: "Premiere", icon: <FaTrophy /> },
                { key: "average", label: "Average", icon: <FaTachometerAlt /> },
                { key: "hotseat", label: "Hot Seat", icon: <FaFire /> },
                { key: "unproven", label: "Unproven", icon: <FaInfoCircle /> }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    statusFilter === filter.key
                      ? "bg-red-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                >
                  Compare Coaches
                </button>
              )}
            </div>
          </div>
        )}

        {/* Coach Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredCoaches.map((coach) => {
            const isSelected = selectedCoaches.some(c => 
              `${c.firstName}-${c.lastName}` === `${coach.firstName}-${coach.lastName}`
            );

            return (
              <div
                key={`${coach.firstName}-${coach.lastName}`}
                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 ${
                  isSelected ? "ring-2 ring-red-500 border-red-500" : ""
                }`}
              >
                {/* Card Header */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 relative">
                  <div className="absolute top-4 right-4">
                    <div className={getStatusBadge(coach.status)}>
                      {coach.status.icon}
                      {coach.status.text}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {coach.firstName} {coach.lastName}
                    </h3>
                    <p className="text-gray-600 font-medium">{coach.school}</p>
                    <p className="text-sm text-gray-500">{coach.conference}</p>
                  </div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-text">
                        {coach.winPct.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-text">
                        {coach.wins}-{coach.losses}
                      </div>
                      <div className="text-xs text-gray-500">Record</div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
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
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Trend:</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(coach.trend)}
                        <span className={`text-sm font-medium ${
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
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                        isSelected
                          ? "bg-red-600 text-white hover:bg-red-700"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold gradient-text">Coach Comparison</h2>
                <button
                  onClick={() => setShowComparison(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
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
                            {coach.firstName} {coach.lastName}
                            <div className="text-sm text-gray-500 font-normal">{coach.school}</div>
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
