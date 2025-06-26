import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { teamService } from "../../services";
import { newsService } from "../../services";

const TransferPortal = () => {
  // State for portal data
  const [transfers, setTransfers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters - Default to "Big Ten" conference to start with filtered data
  const [filters, setFilters] = useState({
    position: "All",
    destinationStatus: "all", // "committed", "uncommitted", "all"
    stars: 0,                 // 0 => show all stars
    conference: "Big Ten",    // default to Big Ten to limit initial load
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
    
    fetchData();
    fetchNewsData();
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
  
  // Clear filters => everything set to "All" or "0"
  const clearFilters = () => {
    setFilters({
      position: "All",
      destinationStatus: "all",
      stars: 0,
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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-gray-800 text-white py-16 mb-8">
        <motion.div 
          className="container mx-auto px-4 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold mb-4">Transfer Portal</h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            Track player movement, commitments and opportunities
          </p>
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
          <motion.div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg p-6 shadow-lg" variants={itemVariants}>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Players</h3>
            <div className="text-3xl font-bold text-red-600">{stats.totalTransfers}</div>
          </motion.div>
          
          <motion.div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg p-6 shadow-lg" variants={itemVariants}>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Committed</h3>
            <div className="text-3xl font-bold text-green-600">{stats.committedCount}</div>
          </motion.div>
          
          <motion.div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg p-6 shadow-lg" variants={itemVariants}>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Uncommitted</h3>
            <div className="text-3xl font-bold text-orange-600">{stats.uncommittedCount}</div>
          </motion.div>
          
          <motion.div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg p-6 shadow-lg" variants={itemVariants}>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Most Active Position</h3>
            <div className="text-3xl font-bold text-blue-600">
              {Object.entries(stats.positionStats).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
            </div>
          </motion.div>
        </motion.div>
        
        {/* Filter Section */}
        <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg p-6 shadow-lg mb-8">
          <div className="mb-6">
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search by name, school..."
                value={filters.searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
              {filters.searchTerm && (
                <button 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => handleFilterChange("searchTerm", "")}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
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
            {(filters.position !== "All" || 
              filters.destinationStatus !== "all" || 
              filters.stars !== 0 || 
              filters.conference !== "Big Ten" || 
              filters.searchTerm) && (
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onClick={clearFilters}
              >
                Clear Filters
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
                        className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                          selectedTransfer?.firstName === transfer.firstName &&
                          selectedTransfer?.lastName === transfer.lastName
                            ? 'ring-2 ring-red-500 bg-red-50'
                            : 'hover:border-red-300'
                        }`}
                        variants={itemVariants}
                        layoutId={`${transfer.firstName}-${transfer.lastName}-${index}`}
                        onClick={() => handlePlayerClick(transfer)}
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <i className="fas fa-user-graduate text-gray-500 text-lg"></i>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">
                                {transfer.firstName} {transfer.lastName}
                              </h3>
                              <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full inline-block">
                                {transfer.position || "N/A"}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {renderStars(transfer.stars)}
                            {transfer.rating && (
                              <div className="text-xs text-gray-500 mt-1">
                                {parseFloat(transfer.rating).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 flex-1">
                            <img 
                              src={getTeamLogo(transfer.origin)} 
                              alt={transfer.origin || "Origin"} 
                              className="w-8 h-8 object-contain"
                            />
                            <span className="text-sm font-medium text-gray-700 truncate">
                              {transfer.origin || "Unknown"}
                            </span>
                          </div>
                          
                          <div className="mx-4">
                            <i className="fas fa-arrow-right text-red-500"></i>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            {transfer.destination ? (
                              <>
                                <span className="text-sm font-medium text-gray-700 truncate">
                                  {transfer.destination}
                                </span>
                                <img 
                                  src={getTeamLogo(transfer.destination)} 
                                  alt={transfer.destination} 
                                  className="w-8 h-8 object-contain"
                                />
                              </>
                            ) : (
                              <div className="text-sm text-gray-500 italic">Undecided</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <i className="fas fa-calendar-alt"></i>
                            <span>{formatDate(transfer.transferDate)}</span>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transfer.eligibility === 'Immediate' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transfer.eligibility}
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
          
          {/* Side content - News and Conference Activity */}
          <div className="lg:col-span-1 space-y-6">
            {/* Transfer News */}
            <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Transfer News</h2>
              
              {newsLoading ? (
                <div className="text-center py-4">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading news...</p>
                </div>
              ) : news.length > 0 ? (
                <div className="space-y-4">
                  {news.slice(0, 5).map((article, index) => (
                    <a 
                      href={article.url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      key={index}
                      className="block group"
                    >
                      <div className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                        {article.image && (
                          <div className="w-full h-24 mb-3 overflow-hidden rounded-md">
                            <img 
                              src={article.image} 
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <h4 className="font-medium text-sm text-gray-800 group-hover:text-red-600 transition-colors line-clamp-2">
                          {article.title}
                        </h4>
                        <div className="text-xs text-gray-500 mt-2">
                          {article.source.name}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No transfer news available.</p>
                </div>
              )}
            </div>
            
            {/* Conference Transfer Activity */}
            <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Conference Activity</h3>
              <div className="space-y-3">
                {Object.entries(stats.conferenceStats)
                  .filter(([_, cStats]) => cStats.gained > 0 || cStats.lost > 0)
                  .sort((a, b) => 
                    (b[1].gained - b[1].lost) - 
                    (a[1].gained - a[1].lost)
                  )
                  .slice(0, 5)
                  .map(([conference, cStats]) => (
                    <div key={conference} className="border border-gray-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-800 mb-2">{conference}</div>
                      <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                          style={{ 
                            width: `${(cStats.gained / (cStats.gained + cStats.lost)) * 100}%`,
                          }}
                        >
                          {cStats.gained > 0 && `+${cStats.gained}`}
                        </div>
                        <div 
                          className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                          style={{ 
                            width: `${(cStats.lost / (cStats.gained + cStats.lost)) * 100}%`,
                          }}
                        >
                          {cStats.lost > 0 && `-${cStats.lost}`}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        Net: {cStats.gained - cStats.lost > 0 ? '+' : ''}
                        {cStats.gained - cStats.lost}
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
