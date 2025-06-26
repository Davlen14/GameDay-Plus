import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { teamService } from "../../services";
import { newsService } from "../../services";

const TransferPortal = () => {
  // State for portal data and recruits
  const [transfers, setTransfers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [news, setNews] = useState([]);
  const [recruits, setRecruits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [recruitsLoading, setRecruitsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters - Default to high-value players (5-star QBs) to prevent page freeze
  const [filters, setFilters] = useState({
    position: "QB",           // Start with QBs only
    destinationStatus: "all", // "committed", "uncommitted", "all"
    stars: 5,                 // Start with 5-star players only
    conference: "All",        // Allow all conferences but filtered by position/stars
    searchTerm: ""
  });
  
  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: "transferDate",
    direction: "desc"
  });
  
  // Detail view
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  
  // Stats counters
  const [stats, setStats] = useState({
    totalTransfers: 0,
    committedCount: 0,
    uncommittedCount: 0,
    conferenceStats: {},
    positionStats: {}
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch both transfers and teams in parallel
        const [transferData, teamsData] = await Promise.all([
          teamService.getPlayerPortal(2025),
          teamService.getTeams()
        ]);

        console.log('Transfer data received:', transferData?.length || 0, 'transfers');
        console.log('Teams data received:', teamsData?.length || 0, 'teams');
        
        setTransfers(transferData || []);
        setTeams(teamsData || []);
        
        // Calculate stats
        if (transferData && transferData.length > 0) {
          calculateStats(transferData);
        }
      } catch (err) {
        console.error("Error fetching transfer data:", err);
        setError(err.message || "Failed to load transfer portal data");
      } finally {
        setLoading(false);
      }
    };
    
    const fetchNewsData = async () => {
      try {
        setNewsLoading(true);
        const newsData = await newsService.fetchTransferPortalNews();
        setNews(newsData?.articles || []);
      } catch (err) {
        console.error("Error fetching transfer news:", err);
      } finally {
        setNewsLoading(false);
      }
    };

    const fetchRecruitsData = async () => {
      try {
        setRecruitsLoading(true);
        const recruitsData = await newsService.getCommitments(2025);
        console.log('Recruits data received:', recruitsData?.length || 0, 'recruits');
        setRecruits(recruitsData?.slice(0, 50) || []); // Limit to top 50 recruits
      } catch (err) {
        console.error("Error fetching recruits data:", err);
      } finally {
        setRecruitsLoading(false);
      }
    };
    
    fetchData();
    fetchNewsData();
    fetchRecruitsData();
  }, []);
  
  // Calculate stats from fetched data
  const calculateStats = (data) => {
    if (!data || data.length === 0) {
      setStats({
        totalTransfers: 0,
        committedCount: 0,
        uncommittedCount: 0,
        conferenceStats: {},
        positionStats: {}
      });
      return;
    }

    const committedCount = data.filter(t => t.destination).length;
    const uncommittedCount = data.length - committedCount;
    
    // Conference stats
    const conferenceStats = {};
    teams.forEach(team => {
      const teamName = team.school;
      const conference = team.conference;
      
      if (conference && !conferenceStats[conference]) {
        conferenceStats[conference] = { gained: 0, lost: 0 };
      }
      
      data.forEach(transfer => {
        if (transfer.origin === teamName && conference) {
          conferenceStats[conference].lost++;
        }
        if (transfer.destination === teamName && conference) {
          conferenceStats[conference].gained++;
        }
      });
    });
    
    // Position stats
    const positionStats = {};
    data.forEach(transfer => {
      const position = transfer.position || "Unknown";
      if (!positionStats[position]) {
        positionStats[position] = 0;
      }
      positionStats[position]++;
    });
    
    setStats({
      totalTransfers: data.length,
      committedCount,
      uncommittedCount,
      conferenceStats,
      positionStats
    });
  };

  // Helpers to get team data
  const getTeamLogo = (schoolName) => {
    if (!schoolName) return "/photos/football.avif";
    
    const team = teams.find(t => 
      t.school?.toLowerCase() === schoolName.toLowerCase()
    );
    
    return team?.logos?.[0] || "/photos/football.avif";
  };
  
  const getTeamConference = (schoolName) => {
    if (!schoolName) return "";
    
    const team = teams.find(t => 
      t.school?.toLowerCase() === schoolName.toLowerCase()
    );
    
    return team?.conference || "";
  };
  
  // Filter handlers
  const handleFilterChange = (filter, value) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };
  
  const handleSearchChange = (e) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: e.target.value
    }));
  };
  
  // Clear filters => reset to high-value defaults
  const clearFilters = () => {
    setFilters({
      position: "QB",
      destinationStatus: "all",
      stars: 5,
      conference: "All",
      searchTerm: ""
    });
  };
  
  // Sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };
  
  // Filtered and sorted transfers
  const filteredTransfers = useMemo(() => {
    let result = [...transfers];
    
    // Filter by position
    if (filters.position !== "All") {
      result = result.filter(t => t.position === filters.position);
    }
    
    // Filter by committed/uncommitted
    if (filters.destinationStatus !== "all") {
      if (filters.destinationStatus === "committed") {
        result = result.filter(t => t.destination);
      } else {
        result = result.filter(t => !t.destination);
      }
    }
    
    // Filter by exact stars if > 0
    if (filters.stars > 0) {
      result = result.filter(t => t.stars === filters.stars);
    }
    
    // Filter by conference if not "All"
    if (filters.conference !== "All") {
      result = result.filter(t => 
        getTeamConference(t.origin) === filters.conference || 
        getTeamConference(t.destination) === filters.conference
      );
    }
    
    // Filter by search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(t => 
        t.firstName?.toLowerCase().includes(term) || 
        t.lastName?.toLowerCase().includes(term) ||
        t.origin?.toLowerCase().includes(term) ||
        t.destination?.toLowerCase().includes(term) ||
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(term)
      );
    }
    
    // Sorting
    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Special case: "name"
      if (sortConfig.key === "name") {
        aValue = `${a.firstName} ${a.lastName}`;
        bValue = `${b.firstName} ${b.lastName}`;
      }
      
      // Null checks
      if (!aValue) return 1;
      if (!bValue) return -1;
      
      // Sort by date if "transferDate"
      if (sortConfig.key === "transferDate") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    
    return result;
  }, [transfers, filters, sortConfig, teams]);
  
  // Available positions
  const availablePositions = useMemo(() => {
    const positions = new Set();
    transfers.forEach(t => {
      if (t.position) positions.add(t.position);
    });
    return [...positions].sort();
  }, [transfers]);
  
  // Available conferences
  const availableConferences = useMemo(() => {
    const conferences = new Set();
    teams.forEach(t => {
      if (t.conference) conferences.add(t.conference);
    });
    return [...conferences].sort();
  }, [teams]);
  
  // Card click => expand/collapse
  const handlePlayerClick = (transfer) => {
    setSelectedTransfer(prev => 
      prev?.firstName === transfer.firstName && prev?.lastName === transfer.lastName
        ? null
        : transfer
    );
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Star rendering (exact 5 stars) with animations
  const starVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1 }
  };

  const renderStars = (count) => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          variants={starVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: i * 0.1, duration: 0.2 }}
        >
          <i className={`fas fa-star text-sm ${i < count ? 'text-yellow-400' : 'text-gray-300'}`} />
        </motion.div>
      ))}
    </div>
  );

  // Animation variants for container and items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transfer portal data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      {/* Hero Section with White Background and Red Gradient Text */}
      <div className="bg-white py-20 mb-8">
        <motion.div 
          className="container mx-auto px-4 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mr-4 shadow-lg">
              <i className="fas fa-exchange-alt text-2xl text-white"></i>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-red-700 bg-clip-text text-transparent">
              Transfer Portal
            </h1>
          </div>
          <p className="text-xl max-w-3xl mx-auto text-gray-600 leading-relaxed">
            Track elite player movement, commitments and opportunities across college football
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <i className="fas fa-star text-yellow-500"></i>
              <span>Premium Players</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-1">
              <i className="fas fa-clock text-red-500"></i>
              <span>Real-time Updates</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-1">
              <i className="fas fa-chart-line text-red-500"></i>
              <span>Advanced Analytics</span>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="container mx-auto px-4">
        {/* Statistics Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="bg-white/90 backdrop-blur-lg border border-red-100 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300" variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Players</h3>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-red-600"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-red-600">{stats.totalTransfers.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-2">In the portal</p>
          </motion.div>
          
          <motion.div className="bg-white/90 backdrop-blur-lg border border-green-100 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300" variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Committed</h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.committedCount.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-2">Found new homes</p>
          </motion.div>
          
          <motion.div className="bg-white/90 backdrop-blur-lg border border-orange-100 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300" variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Available</h3>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-hourglass-half text-orange-600"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-600">{stats.uncommittedCount.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-2">Still deciding</p>
          </motion.div>
          
          <motion.div className="bg-white/90 backdrop-blur-lg border border-blue-100 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300" variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Top Position</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-trophy text-blue-600"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {Object.entries(stats.positionStats).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
            </div>
            <p className="text-xs text-gray-500 mt-2">Most active</p>
          </motion.div>
        </motion.div>
        
        {/* Filter Section */}
        <div className="bg-white/90 backdrop-blur-lg border border-gray-200 rounded-xl p-6 shadow-xl mb-8">
          <div className="mb-6">
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"></i>
              <input
                type="text"
                placeholder="Search by name, school..."
                value={filters.searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all font-medium placeholder-gray-500"
              />
              {filters.searchTerm && (
                <button 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                  onClick={() => handleFilterChange("searchTerm", "")}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                <i className="fas fa-info-circle text-blue-500 mr-1"></i>
                Starting with <span className="font-semibold text-red-600">5-star QBs</span> to ensure fast loading. 
                Adjust filters to see more players.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <select 
                value={filters.position}
                onChange={(e) => handleFilterChange("position", e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="All">All Positions</option>
                {availablePositions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
            
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select 
                value={filters.destinationStatus}
                onChange={(e) => handleFilterChange("destinationStatus", e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Players</option>
                <option value="committed">Committed</option>
                <option value="uncommitted">Uncommitted</option>
              </select>
            </div>
            
            {/* Stars */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stars</label>
              <select 
                value={filters.stars}
                onChange={(e) => handleFilterChange("stars", parseInt(e.target.value))}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value={0}>All Stars</option>
                <option value={1}>1 Star</option>
                <option value={2}>2 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={5}>5 Stars</option>
              </select>
            </div>
            
            {/* Conference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Conference</label>
              <select 
                value={filters.conference}
                onChange={(e) => handleFilterChange("conference", e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="All">All Conferences</option>
                {availableConferences.map(conf => (
                  <option key={conf} value={conf}>{conf}</option>
                ))}
              </select>
            </div>
            
            {/* Clear Filters */}
            {(filters.position !== "QB" || 
              filters.destinationStatus !== "all" || 
              filters.stars !== 5 || 
              filters.conference !== "All" || 
              filters.searchTerm) && (
              <button 
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                onClick={clearFilters}
              >
                <i className="fas fa-undo mr-2"></i>
                Reset to Premium Defaults
              </button>
            )}
          </div>
        </div>
        
        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Transfer Data */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg shadow-lg p-6">
              <div className="mb-6">
                <p className="text-gray-600">
                  Showing {filteredTransfers.length} of {transfers.length} transfers
                </p>
              </div>
              
              {/* Transfer Cards Grid */}
              {filteredTransfers.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence>
                    {filteredTransfers.map((transfer, index) => (
                      <motion.div 
                        key={`${transfer.firstName}-${transfer.lastName}-${index}`}
                        className={`bg-white border-2 border-gray-100 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden relative ${
                          selectedTransfer?.firstName === transfer.firstName &&
                          selectedTransfer?.lastName === transfer.lastName
                            ? 'ring-2 ring-red-500 bg-red-50 border-red-200'
                            : 'hover:border-red-200 hover:bg-red-50/30'
                        }`}
                        variants={itemVariants}
                        layoutId={`${transfer.firstName}-${transfer.lastName}-${index}`}
                        onClick={() => handlePlayerClick(transfer)}
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Premium Badge for 4-5 star players */}
                        {transfer.stars >= 4 && (
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            <i className="fas fa-crown mr-1"></i>
                            ELITE
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg">
                                <i className="fas fa-user-graduate text-red-600 text-xl"></i>
                              </div>
                              {transfer.stars >= 4 && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                  <i className="fas fa-star text-white text-xs"></i>
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-800 leading-tight">
                                {transfer.firstName} {transfer.lastName}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">
                                  {transfer.position || "N/A"}
                                </div>
                                {transfer.eligibility === 'Immediate' && (
                                  <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                    <i className="fas fa-bolt mr-1"></i>
                                    Immediate
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {renderStars(transfer.stars)}
                            {transfer.rating && (
                              <div className="text-sm text-gray-600 mt-2 font-semibold">
                                {parseFloat(transfer.rating).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="relative group">
                              <img 
                                src={getTeamLogo(transfer.origin)} 
                                alt={transfer.origin || "Origin"} 
                                className="w-10 h-10 object-contain rounded-lg bg-white p-1 shadow-md group-hover:scale-110 transition-transform"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-bold text-gray-800 truncate block">
                                {transfer.origin || "Unknown"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {getTeamConference(transfer.origin) || ""}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mx-4 flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                              <i className="fas fa-arrow-right text-white text-sm"></i>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 flex-1 justify-end">
                            {transfer.destination ? (
                              <>
                                <div className="flex-1 min-w-0 text-right">
                                  <span className="text-sm font-bold text-gray-800 truncate block">
                                    {transfer.destination}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {getTeamConference(transfer.destination) || ""}
                                  </span>
                                </div>
                                <div className="relative group">
                                  <img 
                                    src={getTeamLogo(transfer.destination)} 
                                    alt={transfer.destination} 
                                    className="w-10 h-10 object-contain rounded-lg bg-white p-1 shadow-md group-hover:scale-110 transition-transform"
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="text-center flex-1">
                                <div className="text-sm text-gray-500 italic font-medium">Available</div>
                                <div className="w-10 h-10 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                  <i className="fas fa-question text-gray-400"></i>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <i className="fas fa-calendar-alt text-red-500"></i>
                            <span className="font-medium">{formatDate(transfer.transferDate)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Click for details</span>
                            <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                          </div>
                        </div>
                        
                        {/* Expanded Content */}
                        {selectedTransfer?.firstName === transfer.firstName &&
                         selectedTransfer?.lastName === transfer.lastName && (
                          <motion.div 
                            className="mt-4 pt-4 border-t border-gray-200"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Transfer Date:</span>
                                <div className="font-medium">{formatDate(transfer.transferDate)}</div>
                              </div>
                              
                              <div>
                                <span className="text-gray-500">Origin Conference:</span>
                                <div className="font-medium">{getTeamConference(transfer.origin) || "N/A"}</div>
                              </div>
                              
                              {transfer.destination && (
                                <div>
                                  <span className="text-gray-500">Destination Conference:</span>
                                  <div className="font-medium">{getTeamConference(transfer.destination) || "N/A"}</div>
                                </div>
                              )}
                              
                              <div>
                                <span className="text-gray-500">Eligibility:</span>
                                <div className="font-medium">{transfer.eligibility}</div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : transfers.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-database text-4xl text-gray-400 mb-4"></i>
                  <p className="text-gray-600 mb-4">No transfer portal data available for the 2025 season yet.</p>
                  <p className="text-sm text-gray-500">Check back later as the transfer portal opens.</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
                  <p className="text-gray-600 mb-6">No transfers match your filters.</p>
                  <button 
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Side content - Recruits, News and Conference Activity */}
          <div className="lg:col-span-1 space-y-6">
            {/* High School Recruits */}
            <div className="bg-white/90 backdrop-blur-lg border border-gray-200 rounded-xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-graduation-cap text-blue-600"></i>
                  </div>
                  Top Recruits
                </h2>
                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  Class of 2025
                </div>
              </div>
              
              {recruitsLoading ? (
                <div className="text-center py-6">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading recruits...</p>
                </div>
              ) : recruits.length > 0 ? (
                <div className="space-y-3">
                  {recruits.slice(0, 8).map((recruit, index) => (
                    <div 
                      key={`recruit-${index}`}
                      className="border border-gray-100 rounded-lg p-3 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                            <i className="fas fa-user-graduate text-blue-600 text-sm"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">
                              {recruit.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                {recruit.position}
                              </span>
                              {recruit.stars && (
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <i key={i} className={`fas fa-star text-xs ${i < recruit.stars ? 'text-yellow-400' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {recruit.rating && (
                          <div className="text-xs font-bold text-gray-600">
                            {parseFloat(recruit.rating).toFixed(2)}
                          </div>
                        )}
                      </div>
                      
                      {recruit.committedTo && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                          <img 
                            src={getTeamLogo(recruit.committedTo)} 
                            alt={recruit.committedTo}
                            className="w-5 h-5 object-contain"
                          />
                          <span className="font-medium">Committed to {recruit.committedTo}</span>
                        </div>
                      )}
                      
                      {recruit.stateProvince && (
                        <div className="text-xs text-gray-500 mt-1">
                          <i className="fas fa-map-marker-alt mr-1"></i>
                          {recruit.city}, {recruit.stateProvince}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <i className="fas fa-graduation-cap text-2xl text-gray-400 mb-2"></i>
                  <p className="text-sm text-gray-500">No recruit data available.</p>
                </div>
              )}
            </div>

            {/* Transfer News */}
            <div className="bg-white/90 backdrop-blur-lg border border-gray-200 rounded-xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-newspaper text-red-600"></i>
                  </div>
                  Transfer News
                </h2>
                <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                  Latest
                </div>
              </div>
              
              {newsLoading ? (
                <div className="text-center py-6">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading news...</p>
                </div>
              ) : news.length > 0 ? (
                <div className="space-y-4">
                  {news.slice(0, 6).map((article, index) => (
                    <a 
                      href={article.url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      key={index}
                      className="block group"
                    >
                      <div className="border border-gray-100 rounded-xl p-4 hover:bg-red-50 transition-all duration-300 hover:border-red-200 hover:shadow-md">
                        {article.image && (
                          <div className="w-full h-32 mb-3 overflow-hidden rounded-lg">
                            <img 
                              src={article.image} 
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <h4 className="font-semibold text-sm text-gray-800 group-hover:text-red-600 transition-colors line-clamp-3 leading-relaxed mb-2">
                          {article.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="font-medium">{article.source.name}</span>
                          <div className="flex items-center gap-1">
                            <i className="fas fa-external-link-alt"></i>
                            <span>Read more</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <i className="fas fa-newspaper text-2xl text-gray-400 mb-2"></i>
                  <p className="text-sm text-gray-500">No transfer news available.</p>
                </div>
              )}
            </div>
            
            {/* Conference Transfer Activity */}
            <div className="bg-white/90 backdrop-blur-lg border border-gray-200 rounded-xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-bar text-purple-600"></i>
                  </div>
                  Conference Activity
                </h3>
              </div>
              <div className="space-y-4">
                {Object.entries(stats.conferenceStats)
                  .filter(([_, cStats]) => cStats.gained > 0 || cStats.lost > 0)
                  .sort((a, b) => 
                    (b[1].gained - b[1].lost) - 
                    (a[1].gained - a[1].lost)
                  )
                  .slice(0, 6)
                  .map(([conference, cStats]) => (
                    <div key={conference} className="border border-gray-100 rounded-xl p-4 hover:bg-purple-50 transition-colors group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                          {conference}
                        </div>
                        <div className="text-xs font-bold text-gray-600">
                          Net: {cStats.gained - cStats.lost > 0 ? '+' : ''}
                          {cStats.gained - cStats.lost}
                        </div>
                      </div>
                      
                      <div className="flex h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-xs text-white font-bold transition-all"
                          style={{ 
                            width: `${(cStats.gained / (cStats.gained + cStats.lost)) * 100}%`,
                          }}
                        >
                          {cStats.gained > 0 && `+${cStats.gained}`}
                        </div>
                        <div 
                          className="bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center text-xs text-white font-bold transition-all"
                          style={{ 
                            width: `${(cStats.lost / (cStats.gained + cStats.lost)) * 100}%`,
                          }}
                        >
                          {cStats.lost > 0 && `-${cStats.lost}`}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-arrow-down text-green-500"></i>
                          {cStats.gained} gained
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-arrow-up text-red-500"></i>
                          {cStats.lost} lost
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferPortal;
