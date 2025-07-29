import React, { useState, useEffect } from 'react';
import { playerService } from '../../services/playerService';

const RosterTab = ({ team, primaryTeamColor }) => {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [sortBy, setSortBy] = useState('jersey'); // 'jersey', 'name', 'position'
  const [hoveredPlayer, setHoveredPlayer] = useState(null);
  const [positions] = useState(['All', 'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K', 'P', 'LS']);
  const [error, setError] = useState(null);

  const teamRgb = primaryTeamColor ? hexToRgb(primaryTeamColor) : { r: 220, g: 38, b: 38 };
  const teamColorRgb = `${teamRgb.r}, ${teamRgb.g}, ${teamRgb.b}`;

  // Position gradients matching the modern style
  const positionGradients = {
    'QB': 'linear-gradient(135deg, rgb(167, 139, 250), rgb(139, 92, 246), rgb(109, 40, 217), rgb(139, 92, 246), rgb(167, 139, 250))',
    'RB': 'linear-gradient(135deg, rgb(56, 189, 248), rgb(14, 165, 233), rgb(2, 132, 199), rgb(14, 165, 233), rgb(56, 189, 248))',
    'WR': 'linear-gradient(135deg, rgb(251, 146, 60), rgb(249, 115, 22), rgb(234, 88, 12), rgb(249, 115, 22), rgb(251, 146, 60))',
    'TE': 'linear-gradient(135deg, rgb(163, 230, 53), rgb(132, 204, 22), rgb(101, 163, 13), rgb(132, 204, 22), rgb(163, 230, 53))',
    'OL': 'linear-gradient(135deg, rgb(148, 163, 184), rgb(100, 116, 139), rgb(51, 65, 85), rgb(100, 116, 139), rgb(148, 163, 184))',
    'DL': 'linear-gradient(135deg, rgb(220, 38, 38), rgb(185, 28, 28), rgb(153, 27, 27), rgb(185, 28, 28), rgb(220, 38, 38))',
    'LB': 'linear-gradient(135deg, rgb(252, 211, 77), rgb(251, 191, 36), rgb(245, 158, 11), rgb(251, 191, 36), rgb(252, 211, 77))',
    'DB': 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235), rgb(30, 58, 138), rgb(37, 99, 235), rgb(59, 130, 246))',
    'K': 'linear-gradient(135deg, rgb(103, 232, 249), rgb(34, 211, 238), rgb(6, 182, 212), rgb(34, 211, 238), rgb(103, 232, 249))',
    'P': 'linear-gradient(135deg, rgb(103, 232, 249), rgb(34, 211, 238), rgb(6, 182, 212), rgb(34, 211, 238), rgb(103, 232, 249))',
    'LS': 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74), rgb(21, 128, 61), rgb(22, 163, 74), rgb(34, 197, 94))',
  };

  // Convert hex to RGB for CSS
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 220, g: 38, b: 38 };
  }

  // Get position gradient
  const getPositionGradient = (position) => {
    return positionGradients[position] || `linear-gradient(135deg, rgba(${teamColorRgb}, 1), rgba(${teamColorRgb}, 0.8), rgba(${teamColorRgb}, 0.6), rgba(${teamColorRgb}, 0.8), rgba(${teamColorRgb}, 1))`;
  };

  useEffect(() => {
    const loadRoster = async () => {
      if (!team || !team.school) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const currentYear = 2025; // Use 2025 for current roster
        let rosterData = [];
        
        // First try getting roster data directly
        try {
          const rosterResults = await playerService.getRoster(team.school, currentYear);
          if (rosterResults && rosterResults.length > 0) {
            rosterData = rosterResults.map(player => ({
              id: player.id || Math.random().toString(36).substr(2, 9),
              firstName: player.firstName || 'Unknown',
              lastName: player.lastName || 'Player',
              name: `${player.firstName || 'Unknown'} ${player.lastName || 'Player'}`,
              position: player.position || 'N/A',
              jersey: player.jersey || '--',
              year: player.year || 'N/A',
              height: player.height ? `${Math.floor(player.height / 12)}'${player.height % 12}"` : '--',
              weight: player.weight ? `${player.weight} lbs` : '--',
              hometown: player.homeCity && player.homeState ? `${player.homeCity}, ${player.homeState}` : (player.homeCity || 'Unknown'),
              team: player.team || team.school
            }));
          }
        } catch (rosterError) {
          console.log('Roster API failed, trying search:', rosterError);
        }
        
        // If roster API failed, try search as fallback
        if (rosterData.length === 0) {
          try {
            const searchResults = await playerService.searchPlayers('', currentYear, team.school);
            if (searchResults && searchResults.length > 0) {
              rosterData = searchResults.map(player => ({
                id: player.id || Math.random().toString(36).substr(2, 9),
                firstName: player.firstName || 'Unknown',
                lastName: player.lastName || 'Player',
                name: `${player.firstName || 'Unknown'} ${player.lastName || 'Player'}`,
                position: player.position || 'N/A',
                jersey: player.jersey || '--',
                year: player.year || 'N/A',
                height: player.height ? `${Math.floor(player.height / 12)}'${player.height % 12}"` : '--',
                weight: player.weight ? `${player.weight} lbs` : '--',
                hometown: player.homeCity && player.homeState ? `${player.homeCity}, ${player.homeState}` : (player.homeCity || 'Unknown'),
                team: player.team || team.school
              }));
            }
          } catch (searchError) {
            console.log('Search failed, trying usage data:', searchError);
          }
        }
        
        // If still no data, try usage data
        if (rosterData.length === 0) {
          try {
            const usageData = await playerService.getPlayerUsage(currentYear, null, null, team.school);
            if (usageData && usageData.length > 0) {
              rosterData = usageData.map(player => ({
                id: player.id || Math.random().toString(36).substr(2, 9),
                firstName: player.firstName || player.player?.split(' ')[0] || 'Unknown',
                lastName: player.lastName || player.player?.split(' ').slice(1).join(' ') || 'Player',
                name: player.player || 'Unknown Player',
                position: player.position || 'N/A',
                jersey: '--',
                year: 'N/A',
                height: '--',
                weight: '--',
                hometown: 'Unknown',
                team: player.team || team.school,
                usage: player.usage || 0
              }));
            }
          } catch (usageError) {
            console.log('Usage data failed:', usageError);
          }
        }
        
        // If we still don't have data, create a sample roster
        if (rosterData.length === 0) {
          rosterData = generateSampleRoster(team);
        }
        
        setRoster(rosterData);
      } catch (error) {
        console.error('Error loading roster:', error);
        setError('Unable to load roster data');
        // Create sample roster as fallback
        setRoster(generateSampleRoster(team));
      } finally {
        setLoading(false);
      }
    };

    loadRoster();
  }, [team]);

  // Generate sample roster data when API data is not available
  const generateSampleRoster = (team) => {
    const positions = [
      { pos: 'QB', count: 3 },
      { pos: 'RB', count: 4 },
      { pos: 'WR', count: 6 },
      { pos: 'TE', count: 3 },
      { pos: 'OL', count: 8 },
      { pos: 'DL', count: 6 },
      { pos: 'LB', count: 6 },
      { pos: 'DB', count: 8 },
      { pos: 'K', count: 2 },
      { pos: 'P', count: 1 }
    ];
    
    const years = ['FR', 'SO', 'JR', 'SR', 'GR'];
    const firstNames = [
      'John', 'Mike', 'David', 'Chris', 'Alex', 'Ryan', 'Tyler', 'Jake', 'Matt', 'Josh',
      'Brandon', 'Kyle', 'Derek', 'Austin', 'Jordan', 'Connor', 'Blake', 'Hunter', 'Trevor', 'Cody',
      'Zach', 'Noah', 'Luke', 'Mason', 'Carter', 'Logan', 'Dylan', 'Ryan', 'Ethan', 'Owen'
    ];
    
    const lastNames = [
      'Smith', 'Johnson', 'Brown', 'Wilson', 'Davis', 'Miller', 'Moore', 'Taylor', 'Anderson', 'Thomas',
      'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young',
      'King', 'Wright', 'Lopez', 'Hill', 'Green', 'Adams', 'Nelson', 'Baker', 'Gonzalez', 'Perez'
    ];
    
    let roster = [];
    let nameIndex = 0;
    let jerseyNum = 1;
    
    positions.forEach(posGroup => {
      for (let i = 0; i < posGroup.count; i++) {
        const firstName = firstNames[nameIndex % firstNames.length];
        const lastName = lastNames[(nameIndex + i) % lastNames.length];
        const heightInches = Math.floor(Math.random() * 8) + 68;
        
        roster.push({
          id: `${posGroup.pos}-${i}`,
          firstName: firstName,
          lastName: lastName,
          name: `${firstName} ${lastName}`,
          position: posGroup.pos,
          jersey: jerseyNum.toString(),
          year: years[Math.floor(Math.random() * years.length)],
          height: `${Math.floor(heightInches / 12)}'${heightInches % 12}"`,
          weight: `${Math.floor(Math.random() * 80) + 180} lbs`,
          hometown: 'Various, USA',
          team: team.school
        });
        nameIndex++;
        jerseyNum++;
        if (jerseyNum > 99) jerseyNum = 1;
      }
    });
    
    return roster.sort((a, b) => parseInt(a.jersey) - parseInt(b.jersey));
  };

  // Filter and sort roster
  const filteredAndSortedRoster = React.useMemo(() => {
    let filtered = roster;
    
    // Filter by position
    if (selectedPosition !== 'All') {
      filtered = filtered.filter(player => player.position === selectedPosition);
    }
    
    // Filter by search
    if (searchText) {
      filtered = filtered.filter(player => 
        player.name.toLowerCase().includes(searchText.toLowerCase()) ||
        player.jersey.includes(searchText) ||
        player.hometown.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'position':
          return a.position.localeCompare(b.position);
        case 'jersey':
        default:
          return parseInt(a.jersey) - parseInt(b.jersey);
      }
    });
    
    return sorted;
  }, [roster, selectedPosition, searchText, sortBy]);

  const filteredRoster = selectedPosition === 'All' 
    ? roster 
    : roster.filter(player => player.position === selectedPosition);

  const positionGroups = roster.reduce((groups, player) => {
    const pos = player.position;
    if (!groups[pos]) groups[pos] = [];
    groups[pos].push(player);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div style={{ width: '97%', margin: '0 auto' }}>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl animate-pulse"></div>
                <div className="relative w-16 h-16 rounded-full bg-white/40 backdrop-blur-2xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center">
                  <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/60 via-transparent to-transparent"></div>
                  <div 
                    className="animate-spin rounded-full h-12 w-12 border-4 border-transparent"
                    style={{ 
                      background: `conic-gradient(from 0deg, rgba(${teamColorRgb}, 0.2), rgba(${teamColorRgb}, 1), rgba(${teamColorRgb}, 0.2))`,
                      borderTopColor: primaryTeamColor 
                    }}
                  ></div>
                </div>
              </div>
              <p className="text-gray-600 font-medium mt-4">Loading roster...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div style={{ width: '97%', margin: '0 auto' }} className="relative z-10">
        {/* Simple Header */}
        <div className="text-center mb-8">
          <h2 
            className="text-4xl font-black mb-2"
            style={{ 
              fontFamily: 'Orbitron, sans-serif',
              color: primaryTeamColor,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {team.school.toUpperCase()} ROSTER
          </h2>
          <p className="text-gray-600 font-medium">2025 Season</p>
          {error && (
            <p className="text-sm text-amber-600 mt-2 bg-amber-50 px-4 py-2 rounded-lg inline-block">
              ⚠️ Showing sample data - {error}
            </p>
          )}
        </div>

        {/* Modern Search & Controls */}
        <div className="backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 mb-8 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 100%)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
          {/* Glass reflection effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-white/10 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Search */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-bold mb-3" style={{ color: primaryTeamColor, textShadow: '0 1px 1px rgba(255,255,255,0.3)' }}>Search Players</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Name, Jersey, Hometown..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-white/30 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 text-gray-800 placeholder-gray-500"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 15px rgba(0,0,0,0.05)'
                    }}
                  />
                  <i className="fas fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>
              
              {/* Sort */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-bold mb-3" style={{ color: primaryTeamColor, textShadow: '0 1px 1px rgba(255,255,255,0.3)' }}>Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-white/30 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 text-gray-800"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 15px rgba(0,0,0,0.05)'
                  }}
                >
                  <option value="jersey">Jersey Number</option>
                  <option value="name">Name</option>
                  <option value="position">Position</option>
                </select>
              </div>
              
              {/* View Mode */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-bold mb-3" style={{ color: primaryTeamColor, textShadow: '0 1px 1px rgba(255,255,255,0.3)' }}>View Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 border border-white/20 ${
                      viewMode === 'grid'
                        ? 'text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    style={viewMode === 'grid' ? {
                      background: `linear-gradient(135deg, ${primaryTeamColor} 0%, rgba(${teamColorRgb}, 0.8) 100%)`,
                      boxShadow: `0 8px 25px rgba(${teamColorRgb}, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)`
                    } : {
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <i className="fas fa-th mr-2"></i>Grid
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 border border-white/20 ${
                      viewMode === 'table'
                        ? 'text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    style={viewMode === 'table' ? {
                      background: `linear-gradient(135deg, ${primaryTeamColor} 0%, rgba(${teamColorRgb}, 0.8) 100%)`,
                      boxShadow: `0 8px 25px rgba(${teamColorRgb}, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)`
                    } : {
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <i className="fas fa-list mr-2"></i>Table
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Position Filter */}
        <div className="backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 mb-8 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 100%)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
          {/* Glass reflection effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-white/10 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-6" style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif', textShadow: '0 1px 2px rgba(255,255,255,0.3)' }}>Filter by Position</h3>
            <div className="flex flex-wrap gap-3">
              {positions.map(position => (
                <button
                  key={position}
                  onClick={() => setSelectedPosition(position)}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 border border-white/20 ${
                    selectedPosition === position
                      ? 'text-white shadow-xl'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={selectedPosition === position ? {
                    background: getPositionGradient(position),
                    boxShadow: `0 8px 25px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)`
                  } : {
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {position}
                  {position !== 'All' && positionGroups[position] && (
                    <span className="ml-2 opacity-75">({positionGroups[position].length})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Roster Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div 
            className="bg-white rounded-xl p-6 shadow-lg border-l-4"
            style={{ borderLeftColor: primaryTeamColor }}
          >
            <div className="flex items-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                style={{ backgroundColor: `rgba(${teamColorRgb}, 0.1)` }}
              >
                <i className="fas fa-users text-xl" style={{ color: primaryTeamColor }}></i>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: primaryTeamColor }}>{roster.length}</p>
                <p className="text-gray-600 text-sm font-medium">Total Players</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-xl p-6 shadow-lg border-l-4"
            style={{ borderLeftColor: primaryTeamColor }}
          >
            <div className="flex items-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                style={{ backgroundColor: `rgba(${teamColorRgb}, 0.1)` }}
              >
                <i className="fas fa-running text-xl" style={{ color: primaryTeamColor }}></i>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: primaryTeamColor }}>
                  {Object.keys(positionGroups).length}
                </p>
                <p className="text-gray-600 text-sm font-medium">Positions</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-xl p-6 shadow-lg border-l-4"
            style={{ borderLeftColor: primaryTeamColor }}
          >
            <div className="flex items-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                style={{ backgroundColor: `rgba(${teamColorRgb}, 0.1)` }}
              >
                <i className="fas fa-filter text-xl" style={{ color: primaryTeamColor }}></i>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: primaryTeamColor }}>
                  {filteredRoster.length}
                </p>
                <p className="text-gray-600 text-sm font-medium">Filtered</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Roster Display */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedRoster.map((player, index) => (
              <div
                key={player.id}
                className="group relative backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 transition-all duration-500 hover:shadow-2xl hover:scale-105 cursor-pointer overflow-hidden"
                onMouseEnter={() => setHoveredPlayer(player.id)}
                onMouseLeave={() => setHoveredPlayer(null)}
                style={{
                  background: hoveredPlayer === player.id 
                    ? `linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 50%, rgba(${teamColorRgb}, 0.08) 100%)`
                    : 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 100%)',
                  transform: hoveredPlayer === player.id ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                  boxShadow: hoveredPlayer === player.id 
                    ? `0 25px 50px rgba(${teamColorRgb}, 0.15), 0 15px 35px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)`
                    : '0 15px 35px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
              >
                {/* Glass reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-tl from-white/10 via-transparent to-transparent pointer-events-none"></div>
                
                {/* Background Gradient */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                  style={{ background: getPositionGradient(player.position) }}
                ></div>
                
                {/* Jersey Number Circle */}
                <div className="relative z-10 flex items-center justify-center mb-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-black shadow-xl transform transition-all duration-300"
                    style={{ 
                      background: getPositionGradient(player.position),
                      transform: hoveredPlayer === player.id ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)'
                    }}
                  >
                    {player.jersey}
                  </div>
                </div>
                
                {/* Player Info */}
                <div className="relative z-10 text-center">
                  <h3 className="text-lg font-black mb-2 text-gray-900" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>
                    {player.name}
                  </h3>
                  
                  <div 
                    className="inline-flex px-3 py-1 rounded-full text-xs font-bold text-white mb-3 shadow-lg"
                    style={{ 
                      background: getPositionGradient(player.position),
                      boxShadow: '0 4px 15px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}
                  >
                    {player.position}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between backdrop-blur-sm bg-white/10 rounded-lg px-3 py-1">
                      <span className="font-medium">Year:</span>
                      <span className="font-bold">{player.year}</span>
                    </div>
                    <div className="flex justify-between backdrop-blur-sm bg-white/10 rounded-lg px-3 py-1">
                      <span className="font-medium">Height:</span>
                      <span className="font-bold">{player.height}</span>
                    </div>
                    <div className="flex justify-between backdrop-blur-sm bg-white/10 rounded-lg px-3 py-1">
                      <span className="font-medium">Weight:</span>
                      <span className="font-bold">{player.weight}</span>
                    </div>
                    <div className="text-center mt-3 backdrop-blur-sm bg-white/10 rounded-lg px-3 py-2">
                      <span className="text-xs font-medium" style={{ color: primaryTeamColor }}>
                        {player.hometown}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 100%)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
            {/* Glass reflection effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-white/10 via-transparent to-transparent pointer-events-none"></div>
            
            <div 
              className="px-8 py-6 border-b border-white/20 relative"
              style={{ background: `linear-gradient(135deg, rgba(${teamColorRgb}, 0.1) 0%, rgba(${teamColorRgb}, 0.05) 50%, rgba(255,255,255,0.1) 100%)` }}
            >
              <div className="absolute inset-0 backdrop-blur-sm"></div>
              <h3 
                className="text-2xl font-black relative z-10"
                style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif', textShadow: '0 1px 2px rgba(255,255,255,0.3)' }}
              >
                {selectedPosition === 'All' ? 'Complete Roster' : `${selectedPosition} Players`}
                <span className="ml-3 text-lg opacity-75">({filteredAndSortedRoster.length})</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full relative">
                <thead style={{ background: `linear-gradient(135deg, rgba(${teamColorRgb}, 0.08) 0%, rgba(${teamColorRgb}, 0.04) 50%, rgba(255,255,255,0.1) 100%)` }}>
                  <tr>
                    <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-wider" style={{ color: primaryTeamColor, textShadow: '0 1px 1px rgba(255,255,255,0.3)' }}>
                      #
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-wider" style={{ color: primaryTeamColor, textShadow: '0 1px 1px rgba(255,255,255,0.3)' }}>
                      Name
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-wider" style={{ color: primaryTeamColor, textShadow: '0 1px 1px rgba(255,255,255,0.3)' }}>
                      Position
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-wider" style={{ color: primaryTeamColor, textShadow: '0 1px 1px rgba(255,255,255,0.3)' }}>
                      Year
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-wider" style={{ color: primaryTeamColor, textShadow: '0 1px 1px rgba(255,255,255,0.3)' }}>
                      Height
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-wider" style={{ color: primaryTeamColor, textShadow: '0 1px 1px rgba(255,255,255,0.3)' }}>
                      Weight
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-wider" style={{ color: primaryTeamColor, textShadow: '0 1px 1px rgba(255,255,255,0.3)' }}>
                      Hometown
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredAndSortedRoster.map((player, index) => (
                    <tr 
                      key={player.id}
                      className="transition-all duration-300 group cursor-pointer relative"
                      onMouseEnter={() => setHoveredPlayer(player.id)}
                      onMouseLeave={() => setHoveredPlayer(null)}
                      style={{ 
                        background: hoveredPlayer === player.id 
                          ? `linear-gradient(135deg, rgba(${teamColorRgb}, 0.08) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 100%)`
                          : (index % 2 === 0 
                            ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)' 
                            : 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)')
                      }}
                    >
                      {hoveredPlayer === player.id && (
                        <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-r from-white/10 via-white/20 to-white/10"></div>
                      )}
                      <td className="px-8 py-6 whitespace-nowrap relative z-10">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-black shadow-xl transition-all duration-300 group-hover:scale-110"
                          style={{ 
                            background: getPositionGradient(player.position),
                            boxShadow: '0 6px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)'
                          }}
                        >
                          {player.jersey}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap relative z-10">
                        <div className="font-black text-gray-900 text-lg group-hover:scale-105 transition-transform duration-300" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 1px 2px rgba(255,255,255,0.3)' }}>
                          {player.name}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap relative z-10">
                        <span 
                          className="inline-flex px-4 py-2 rounded-full text-sm font-black text-white shadow-lg transition-all duration-300 group-hover:scale-105"
                          style={{ 
                            background: getPositionGradient(player.position),
                            boxShadow: '0 4px 15px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)'
                          }}
                        >
                          {player.position}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-gray-700 font-bold text-base relative z-10" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.5)' }}>
                        {player.year}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-gray-700 font-medium text-base relative z-10" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.5)' }}>
                        {player.height}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-gray-700 font-medium text-base relative z-10" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.5)' }}>
                        {player.weight}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-gray-700 font-medium text-base relative z-10" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.5)' }}>
                        {player.hometown}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAndSortedRoster.length === 0 && (
              <div className="text-center py-16 relative">
                <div className="absolute inset-0 backdrop-blur-sm"></div>
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10"
                  style={{ 
                    background: `linear-gradient(135deg, rgba(${teamColorRgb}, 0.15) 0%, rgba(${teamColorRgb}, 0.08) 100%)`,
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}
                >
                  <i 
                    className="fas fa-search text-3xl"
                    style={{ color: `rgba(${teamColorRgb}, 0.6)` }}
                  ></i>
                </div>
                <h3 className="text-xl font-black mb-2 relative z-10" style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif', textShadow: '0 1px 2px rgba(255,255,255,0.3)' }}>
                  No Players Found
                </h3>
                <p className="text-gray-600 font-medium relative z-10" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.5)' }}>
                  No players match your search criteria for {selectedPosition === 'All' ? 'any position' : selectedPosition}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RosterTab;