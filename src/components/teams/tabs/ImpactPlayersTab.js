import React, { useState, useEffect } from 'react';

const ImpactPlayersTab = ({ team1, team2 }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animateStats, setAnimateStats] = useState(false);
  
  // Player data states
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [team1Roster, setTeam1Roster] = useState([]);
  const [team2Roster, setTeam2Roster] = useState([]);
  const [positionMatchups, setPositionMatchups] = useState({});
  const [team1HonorableMentions, setTeam1HonorableMentions] = useState([]);
  const [team2HonorableMentions, setTeam2HonorableMentions] = useState([]);
  
  // Impact threshold for players (PPA based)
  const IMPACT_THRESHOLD = 15.0;
  
  useEffect(() => {
    loadPlayerData();
  }, [team1?.school, team2?.school]);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setAnimateStats(true), 300);
    }
  }, [loading]);

  const loadPlayerData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const currentYear = 2024;
      console.log(`🏈 Fetching Impact Players data for ${team1.school} vs ${team2.school} (${currentYear})`);
      
      // Fetch PPA data and roster simultaneously using Promise.allSettled for better error handling
      const [team1PlayersData, team2PlayersData, team1RosterData, team2RosterData] = await Promise.allSettled([
        fetchPPAPlayers(currentYear, team1.school),
        fetchPPAPlayers(currentYear, team2.school),
        fetchTeamRoster(currentYear, team1.school),
        fetchTeamRoster(currentYear, team2.school)
      ]);
      
      // Extract results, defaulting to empty arrays if promises were rejected
      const team1PlayersResult = team1PlayersData.status === 'fulfilled' ? team1PlayersData.value : [];
      const team2PlayersResult = team2PlayersData.status === 'fulfilled' ? team2PlayersData.value : [];
      const team1RosterResult = team1RosterData.status === 'fulfilled' ? team1RosterData.value : [];
      const team2RosterResult = team2RosterData.status === 'fulfilled' ? team2RosterData.value : [];
      
      console.log(`📊 Data loaded:`, {
        team1Players: team1PlayersResult.length,
        team2Players: team2PlayersResult.length,
        team1Roster: team1RosterResult.length,
        team2Roster: team2RosterResult.length
      });
      
      setTeam1Players(team1PlayersResult);
      setTeam2Players(team2PlayersResult);
      setTeam1Roster(team1RosterResult);
      setTeam2Roster(team2RosterResult);
      
      // Create position matchups and honorable mentions
      createPositionMatchups(team1PlayersResult, team2PlayersResult);
      
    } catch (err) {
      console.error('❌ Critical error loading player data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPPAPlayers = async (year, teamName) => {
    try {
      // Try to fetch real PPA data first
      const response = await fetch(`/api/college-football?endpoint=ppa/players&year=${year}&team=${encodeURIComponent(teamName)}`);
      
      if (response.ok) {
        const data = await response.json();
        return (data || []).map(player => ({
          id: player.id || `${player.name}-${Math.random()}`,
          name: player.name || 'Unknown Player',
          position: player.position || 'N/A',
          totalPPA: {
            all: player.totalPPA?.all || 0
          },
          averagePPA: {
            all: player.averagePPA?.all || 0
          }
        }));
      } else {
        throw new Error(`API returned ${response.status}`);
      }
    } catch (error) {
      console.warn(`PPA API unavailable for ${teamName}, using mock data:`, error.message);
      
      // Generate realistic mock PPA data based on typical college football positions
      return generateMockPPAData(teamName);
    }
  };

  const fetchTeamRoster = async (year, teamName) => {
    try {
      // Try to fetch real roster data first
      const response = await fetch(`/api/college-football?endpoint=roster&year=${year}&team=${encodeURIComponent(teamName)}`);
      
      if (response.ok) {
        const data = await response.json();
        return (data || []).map(player => ({
          id: player.id || `${player.name}-${Math.random()}`,
          fullName: player.full_name || player.name || 'Unknown',
          lastName: player.last_name || '',
          jersey: player.jersey || null,
          position: player.position || ''
        }));
      } else {
        throw new Error(`API returned ${response.status}`);
      }
    } catch (error) {
      console.warn(`Roster API unavailable for ${teamName}, using mock data:`, error.message);
      
      // Generate realistic mock roster data
      return generateMockRosterData(teamName);
    }
  };

  // Generate realistic mock PPA data for development/demo
  const generateMockPPAData = (teamName) => {
    const positions = ['QB', 'RB', 'WR', 'TE', 'DL', 'LB', 'DB', 'K'];
    const mockPlayers = [];
    
    // Generate mock players for each position
    positions.forEach((position, posIndex) => {
      const playersPerPosition = position === 'WR' ? 3 : position === 'DB' ? 4 : position === 'DL' ? 3 : position === 'LB' ? 3 : 2;
      
      for (let i = 0; i < playersPerPosition; i++) {
        const playerNum = i + 1;
        const basePPA = position === 'QB' ? 25 : position === 'RB' ? 20 : position === 'WR' ? 18 : 
                      position === 'TE' ? 15 : position === 'K' ? 12 : 16;
        
        // Add some randomness but keep it realistic
        const totalPPA = basePPA + (Math.random() * 10) - 5;
        const avgPPA = totalPPA > 0 ? (totalPPA / 12) + (Math.random() * 0.5) - 0.25 : 0;
        
        // Only include players above threshold or make some just below for realism
        if (totalPPA >= IMPACT_THRESHOLD - 5) {
          mockPlayers.push({
            id: `${teamName}-${position}-${playerNum}`,
            name: `${generateMockName()} ${generateMockLastName()}`,
            position: position,
            totalPPA: {
              all: Math.max(0, totalPPA)
            },
            averagePPA: {
              all: Math.max(0, avgPPA)
            }
          });
        }
      }
    });
    
    return mockPlayers.sort((a, b) => b.totalPPA.all - a.totalPPA.all);
  };

  const generateMockRosterData = (teamName) => {
    const mockRoster = [];
    const usedJerseys = new Set();
    
    // Generate corresponding roster entries for our mock players
    const positions = ['QB', 'RB', 'WR', 'TE', 'DL', 'LB', 'DB', 'K'];
    
    positions.forEach((position) => {
      const playersPerPosition = position === 'WR' ? 3 : position === 'DB' ? 4 : position === 'DL' ? 3 : position === 'LB' ? 3 : 2;
      
      for (let i = 0; i < playersPerPosition; i++) {
        let jersey;
        do {
          jersey = Math.floor(Math.random() * 99) + 1;
        } while (usedJerseys.has(jersey));
        usedJerseys.add(jersey);
        
        const firstName = generateMockName();
        const lastName = generateMockLastName();
        
        mockRoster.push({
          id: `${teamName}-roster-${position}-${i}`,
          fullName: `${firstName} ${lastName}`,
          lastName: lastName,
          jersey: jersey,
          position: position
        });
      }
    });
    
    return mockRoster;
  };

  const generateMockName = () => {
    const names = [
      'Michael', 'James', 'David', 'John', 'Robert', 'William', 'Richard', 'Thomas',
      'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul',
      'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald',
      'Jason', 'Edward', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric'
    ];
    return names[Math.floor(Math.random() * names.length)];
  };

  const generateMockLastName = () => {
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
      'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
      'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young'
    ];
    return lastNames[Math.floor(Math.random() * lastNames.length)];
  };

  const createPositionMatchups = (team1PlayersData, team2PlayersData) => {
    console.log(`🏈 Creating position matchups with threshold PPA ≥ ${IMPACT_THRESHOLD}`);
    
    // Filter impact players above threshold
    const impactTeam1Players = team1PlayersData.filter(p => p.totalPPA.all >= IMPACT_THRESHOLD);
    const impactTeam2Players = team2PlayersData.filter(p => p.totalPPA.all >= IMPACT_THRESHOLD);
    
    console.log(`⭐ Impact players found:`, {
      team1: `${impactTeam1Players.length}/${team1PlayersData.length}`,
      team2: `${impactTeam2Players.length}/${team2PlayersData.length}`
    });
    
    // Group by position (like Swift implementation)
    const team1ByPosition = {};
    const team2ByPosition = {};
    
    impactTeam1Players.forEach(player => {
      const normalizedPosition = normalizePosition(player.position);
      if (!team1ByPosition[normalizedPosition]) team1ByPosition[normalizedPosition] = [];
      team1ByPosition[normalizedPosition].push(player);
    });
    
    impactTeam2Players.forEach(player => {
      const normalizedPosition = normalizePosition(player.position);
      if (!team2ByPosition[normalizedPosition]) team2ByPosition[normalizedPosition] = [];
      team2ByPosition[normalizedPosition].push(player);
    });
    
    // Sort players by Total PPA within each position (primary), then by Average PPA (secondary)
    Object.keys(team1ByPosition).forEach(pos => {
      team1ByPosition[pos].sort((a, b) => {
        if (Math.abs(a.totalPPA.all - b.totalPPA.all) < 0.1) {
          return b.averagePPA.all - a.averagePPA.all; // Secondary sort by average PPA
        }
        return b.totalPPA.all - a.totalPPA.all; // Primary sort by total PPA
      });
    });
    
    Object.keys(team2ByPosition).forEach(pos => {
      team2ByPosition[pos].sort((a, b) => {
        if (Math.abs(a.totalPPA.all - b.totalPPA.all) < 0.1) {
          return b.averagePPA.all - a.averagePPA.all;
        }
        return b.totalPPA.all - a.totalPPA.all;
      });
    });
    
    // Create matchups (following Swift logic exactly)
    const matchups = {};
    const allPositions = new Set([...Object.keys(team1ByPosition), ...Object.keys(team2ByPosition)]);
    
    console.log(`🎯 Creating matchups for positions:`, Array.from(allPositions));
    
    allPositions.forEach(position => {
      const team1BestPlayer = team1ByPosition[position]?.[0] || null;
      const team2BestPlayer = team2ByPosition[position]?.[0] || null;
      
      // Only create matchup if at least one team has a player for this position
      if (team1BestPlayer || team2BestPlayer) {
        matchups[position] = { team1Player: team1BestPlayer, team2Player: team2BestPlayer };
        
        console.log(`🏃 ${getPositionFullName(position)} matchup:`, {
          team1: team1BestPlayer ? `${team1BestPlayer.name} (${team1BestPlayer.totalPPA.all.toFixed(1)} PPA)` : 'No player',
          team2: team2BestPlayer ? `${team2BestPlayer.name} (${team2BestPlayer.totalPPA.all.toFixed(1)} PPA)` : 'No player'
        });
      }
    });
    
    setPositionMatchups(matchups);
    
    // Create honorable mentions (like Swift implementation)
    const usedTeam1Players = new Set();
    const usedTeam2Players = new Set();
    
    Object.values(matchups).forEach(matchup => {
      if (matchup.team1Player) usedTeam1Players.add(matchup.team1Player.id);
      if (matchup.team2Player) usedTeam2Players.add(matchup.team2Player.id);
    });
    
    const team1Honorable = impactTeam1Players.filter(p => !usedTeam1Players.has(p.id));
    const team2Honorable = impactTeam2Players.filter(p => !usedTeam2Players.has(p.id));
    
    console.log(`🏆 Honorable mentions:`, {
      team1: team1Honorable.length,
      team2: team2Honorable.length
    });
    
    setTeam1HonorableMentions(team1Honorable);
    setTeam2HonorableMentions(team2Honorable);
  };

  const normalizePosition = (position) => {
    const pos = position.toUpperCase().trim();
    
    switch (pos) {
      case 'QUARTERBACK':
      case 'QBA':
      case 'QBB':
        return 'QB';
      case 'RUNNING BACK':
      case 'HALFBACK':
      case 'FULLBACK':
      case 'HB':
      case 'FB':
        return 'RB';
      case 'WIDE RECEIVER':
      case 'WIDEOUT':
      case 'SLOT':
        return 'WR';
      case 'TIGHT END':
        return 'TE';
      case 'DEFENSIVE LINEMAN':
      case 'DEFENSIVE LINE':
      case 'DLINE':
      case 'D-LINE':
      case 'DT':
      case 'DE':
        return 'DL';
      case 'LINEBACKER':
      case 'OLB':
      case 'ILB':
      case 'MLB':
        return 'LB';
      case 'DEFENSIVE BACK':
      case 'CORNERBACK':
      case 'SAFETY':
      case 'CB':
      case 'FS':
      case 'SS':
        return 'DB';
      case 'KICKER':
      case 'PUNTER':
      case 'PK':
      case 'P':
        return 'K';
      default:
        return pos;
    }
  };

  const getPositionOrder = () => {
    const positionOrder = ['QB', 'RB', 'WR', 'TE', 'DL', 'LB', 'DB', 'K'];
    const availablePositions = Object.keys(positionMatchups);
    return positionOrder.filter(pos => availablePositions.includes(pos));
  };

  const getPositionFullName = (position) => {
    const names = {
      'QB': 'Quarterback',
      'RB': 'Running Back', 
      'WR': 'Wide Receiver',
      'TE': 'Tight End',
      'DL': 'Defensive Line',
      'LB': 'Linebacker',
      'DB': 'Defensive Back',
      'K': 'Kicker'
    };
    return names[position] || position;
  };

  const determineWinner = (player1, player2) => {
    if (!player1) return player2 ? 'team2' : 'unknown';
    if (!player2) return 'team1';
    
    if (Math.abs(player1.totalPPA.all - player2.totalPPA.all) < 0.1) {
      if (player1.averagePPA.all > player2.averagePPA.all) return 'team1';
      if (player2.averagePPA.all > player1.averagePPA.all) return 'team2';
      return 'tie';
    } else {
      return player1.totalPPA.all > player2.totalPPA.all ? 'team1' : 'team2';
    }
  };

  const getJerseyNumber = (player, roster) => {
    if (!player || !roster.length) return null;
    
    // Try full name match first (case-insensitive, trimmed)
    const playerFullName = player.name.toLowerCase().trim();
    const fullNameMatch = roster.find(r => {
      const rosterFullName = r.fullName.toLowerCase().trim();
      return rosterFullName === playerFullName;
    });
    
    if (fullNameMatch) return fullNameMatch.jersey;
    
    // Try last name + position match if full name doesn't work
    const playerNameParts = playerFullName.split(' ');
    const playerLastName = playerNameParts[playerNameParts.length - 1];
    
    const lastNameMatch = roster.find(r => {
      const rosterLastName = r.lastName.toLowerCase().trim();
      const positionMatch = r.position?.toLowerCase() === player.position.toLowerCase();
      return rosterLastName === playerLastName && positionMatch;
    });
    
    return lastNameMatch?.jersey || null;
  };

  const getTeamColor = (team) => {
    return team?.color || '#cc001c';
  };

  // Loading View Component
  const LoadingView = () => (
    <div className="relative z-10 flex items-center justify-center h-full">
      <div className="text-center py-20">
        <div className="flex justify-center space-x-12 mb-12">
          {/* Team 1 Logo */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/40 backdrop-blur-xl border border-white/50 shadow-xl flex items-center justify-center animate-pulse">
              {team1?.logos?.[0] ? (
                <img src={team1.logos[0]} alt={team1.school} className="w-16 h-16 object-contain" />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                     style={{ backgroundColor: getTeamColor(team1) }}>
                  {team1?.school?.[0]}
                </div>
              )}
            </div>
          </div>
          
          {/* VS Badge */}
          <div className="w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center">
            <span className="text-gray-600 font-bold text-sm">VS</span>
          </div>
          
          {/* Team 2 Logo */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/40 backdrop-blur-xl border border-white/50 shadow-xl flex items-center justify-center animate-pulse">
              {team2?.logos?.[0] ? (
                <img src={team2.logos[0]} alt={team2.school} className="w-16 h-16 object-contain" />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                     style={{ backgroundColor: getTeamColor(team2) }}>
                  {team2?.school?.[0]}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <h3 className="text-4xl font-black mb-4 gradient-text">
          Analyzing Impact Players
        </h3>
        <p className="text-xl text-gray-600 font-light mb-8">
          Loading PPA statistics and creating matchups...
        </p>
        <div className="inline-flex items-center space-x-4 px-8 py-4 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2)]">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
          <span className="text-lg font-bold gradient-text">Processing Data</span>
        </div>
      </div>
    </div>
  );

  // Error View Component
  const ErrorView = () => (
    <div className="relative z-10 flex items-center justify-center h-full">
      <div className="text-center py-20">
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-full bg-red-100/60 backdrop-blur-xl border border-red-200/50 shadow-xl flex items-center justify-center mx-auto">
            <i className="fas fa-exclamation-triangle text-red-500 text-3xl"></i>
          </div>
        </div>
        
        <h3 className="text-4xl font-black mb-4 text-red-600">
          Unable to Load Impact Players
        </h3>
        <p className="text-xl text-gray-600 font-light mb-8">
          {error?.message || 'Failed to fetch player data'}
        </p>
        <button
          onClick={loadPlayerData}
          className="inline-flex items-center space-x-4 px-8 py-4 rounded-full bg-red-500/20 backdrop-blur-xl border border-red-300/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2)] hover:bg-red-500/30 transition-all duration-300"
        >
          <i className="fas fa-redo text-red-600"></i>
          <span className="text-lg font-bold text-red-600">Try Again</span>
        </button>
      </div>
    </div>
  );

  // No Data View Component
  const NoDataView = () => (
    <div className="relative z-10 flex items-center justify-center h-full">
      <div className="text-center py-20">
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-full bg-yellow-100/60 backdrop-blur-xl border border-yellow-200/50 shadow-xl flex items-center justify-center mx-auto">
            <i className="fas fa-search text-yellow-600 text-3xl"></i>
          </div>
        </div>
        
        <h3 className="text-4xl font-black mb-4 text-yellow-600">
          No Impact Players Found
        </h3>
        <p className="text-xl text-gray-600 font-light mb-8">
          No players found above the impact threshold (PPA ≥ {IMPACT_THRESHOLD})
        </p>
        <button
          onClick={loadPlayerData}
          className="inline-flex items-center space-x-4 px-8 py-4 rounded-full bg-yellow-500/20 backdrop-blur-xl border border-yellow-300/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2)] hover:bg-yellow-500/30 transition-all duration-300"
        >
          <i className="fas fa-redo text-yellow-600"></i>
          <span className="text-lg font-bold text-yellow-600">Retry</span>
        </button>
      </div>
    </div>
  );

  // Modern Header Component
  const ModernHeader = () => (
    <div className={`text-center mb-8 transition-all duration-1000 ${animateStats ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <div className="relative mb-8">
        <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl mx-auto"></div>
        <div className="relative w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center mx-auto">
          <i className="fas fa-star text-red-500 text-3xl"></i>
        </div>
      </div>
      
      <h2 className="text-5xl font-black mb-4 gradient-text">
        Impact Players Analysis
      </h2>
      <p className="text-xl text-gray-600 font-light mb-4">
        Head-to-Head Position Matchups
      </p>
      <div className="flex items-center justify-center space-x-4 text-lg text-gray-500">
        <span className="font-bold" style={{ color: getTeamColor(team1) }}>{team1?.school}</span>
        <span>vs</span>
        <span className="font-bold" style={{ color: getTeamColor(team2) }}>{team2?.school}</span>
      </div>
    </div>
  );

  // Teams Header Component
  const TeamsHeader = () => (
    <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8 mb-8 transition-all duration-1000 delay-200 ${animateStats ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <div className="flex items-center justify-between">
        {/* Team 1 */}
        <div className="text-center space-y-4 flex-1">
          <div className="w-20 h-20 mx-auto flex items-center justify-center">
            {team1?.logos?.[0] ? (
              <img src={team1.logos[0]} alt={team1.school} className="w-full h-full object-contain drop-shadow-sm" />
            ) : (
              <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                   style={{ backgroundColor: getTeamColor(team1) }}>
                {team1?.school?.[0]}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-black" style={{ color: getTeamColor(team1) }}>
              {team1?.school}
            </h3>
            <p className="text-sm text-gray-600 font-medium">{team1?.conference}</p>
          </div>
        </div>

        {/* VS Badge */}
        <div className="text-center space-y-2 mx-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">VS</span>
          </div>
        </div>

        {/* Team 2 */}
        <div className="text-center space-y-4 flex-1">
          <div className="w-20 h-20 mx-auto flex items-center justify-center">
            {team2?.logos?.[0] ? (
              <img src={team2.logos[0]} alt={team2.school} className="w-full h-full object-contain drop-shadow-sm" />
            ) : (
              <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                   style={{ backgroundColor: getTeamColor(team2) }}>
                {team2?.school?.[0]}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-black" style={{ color: getTeamColor(team2) }}>
              {team2?.school}
            </h3>
            <p className="text-sm text-gray-600 font-medium">{team2?.conference}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Position Matchup Row Component
  const PositionMatchupRow = ({ position, matchup, index }) => {
    const { team1Player, team2Player } = matchup;
    const winner = determineWinner(team1Player, team2Player);
    
    return (
      <div className={`transition-all duration-700 delay-${index * 100} ${animateStats ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Position Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-lg">
            <i className="fas fa-football-ball text-white text-lg"></i>
            <h3 className="text-xl font-black text-white">
              {getPositionFullName(position)}
            </h3>
          </div>
        </div>

        {/* Players Comparison */}
        <div className="flex items-center space-x-0">
          {/* Team 1 Player */}
          <div className="flex-1">
            {team1Player ? (
              <PlayerCard 
                player={team1Player} 
                team={team1} 
                roster={team1Roster}
                isWinner={winner === 'team1'}
              />
            ) : (
              <EmptyPlayerCard team={team1} position={position} />
            )}
          </div>

          {/* Center VS with Winner Arrow */}
          <div className="flex flex-col items-center mx-6">
            {winner !== 'unknown' && winner !== 'tie' && (
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg animate-pulse">
                <i className={`fas fa-arrow-${winner === 'team1' ? 'left' : 'right'} text-white text-lg`}></i>
              </div>
            )}
            {(winner === 'tie' || winner === 'unknown') && (
              <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xs">VS</span>
              </div>
            )}
          </div>

          {/* Team 2 Player */}
          <div className="flex-1">
            {team2Player ? (
              <PlayerCard 
                player={team2Player} 
                team={team2} 
                roster={team2Roster}
                isWinner={winner === 'team2'}
              />
            ) : (
              <EmptyPlayerCard team={team2} position={position} />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Player Card Component
  const PlayerCard = ({ player, team, roster, isWinner }) => {
    const jerseyNumber = getJerseyNumber(player, roster);
    
    return (
      <div className={`bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-6 ${isWinner ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}>
        {/* Team Logo and Jersey */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 flex items-center justify-center">
            {team?.logos?.[0] ? (
              <img src={team.logos[0]} alt={team.school} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full rounded-lg flex items-center justify-center text-white font-bold text-sm"
                   style={{ backgroundColor: getTeamColor(team) }}>
                {team?.school?.[0]}
              </div>
            )}
          </div>
          
          {jerseyNumber && (
            <div className="flex items-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-1 rounded-lg shadow-lg">
              <span className="text-sm font-bold">#</span>
              <span className="text-lg font-black">{jerseyNumber}</span>
            </div>
          )}
        </div>

        {/* Winner Badge */}
        {isWinner && (
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-100 border border-green-200">
              <i className="fas fa-star text-green-600 text-sm"></i>
              <span className="text-xs font-bold text-green-700">WINNER</span>
            </div>
          </div>
        )}

        {/* Player Info */}
        <div className="text-center space-y-3">
          <h4 className="text-lg font-bold text-gray-900 leading-tight">
            {player.name}
          </h4>
          
          <div className="inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-md">
            <span className="text-sm font-bold text-black">{player.position}</span>
          </div>

          {/* PPA Stats */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total PPA:</span>
              <span className="text-lg font-bold" style={{ color: getTeamColor(team) }}>
                {player.totalPPA.all.toFixed(1)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Avg PPA:</span>
              <span className="text-lg font-bold" style={{ color: getTeamColor(team) }}>
                {player.averagePPA.all.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Empty Player Card Component
  const EmptyPlayerCard = ({ team, position }) => (
    <div className="bg-gray-100/60 backdrop-blur-2xl rounded-2xl border border-gray-200/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 flex items-center justify-center opacity-50">
          {team?.logos?.[0] ? (
            <img src={team.logos[0]} alt={team.school} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full rounded-lg flex items-center justify-center text-white font-bold text-sm"
                 style={{ backgroundColor: getTeamColor(team) }}>
              {team?.school?.[0]}
            </div>
          )}
        </div>
        
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          <i className="fas fa-question text-gray-500 text-sm"></i>
        </div>
      </div>

      <div className="text-center space-y-3">
        <span className="inline-block px-3 py-1 bg-gray-200 text-gray-600 text-sm font-bold rounded">
          NO PLAYER
        </span>
        
        <h4 className="text-lg font-bold text-gray-500">
          {team?.school}
        </h4>
        
        <div className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-200">
          <span className="text-sm font-bold text-gray-600">{position}</span>
        </div>

        <p className="text-sm text-gray-500">
          No impact player available for position
        </p>
      </div>
    </div>
  );

  // Honorable Mentions Section Component
  const HonorableMentionsSection = () => {
    if (team1HonorableMentions.length === 0 && team2HonorableMentions.length === 0) {
      return null;
    }

    return (
      <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8 transition-all duration-1000 delay-1000 ${animateStats ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg">
            <i className="fas fa-medal text-white text-lg"></i>
            <h3 className="text-2xl font-black text-white">Honorable Mentions</h3>
          </div>
          <p className="text-gray-600 mt-4">Other impact players above the PPA threshold</p>
        </div>

        <div className="space-y-8">
          {team1HonorableMentions.length > 0 && (
            <div>
              <h4 className="text-xl font-bold mb-4" style={{ color: getTeamColor(team1) }}>
                {team1.school}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team1HonorableMentions.map((player, index) => (
                  <HonorableMentionCard 
                    key={player.id} 
                    player={player} 
                    team={team1} 
                    roster={team1Roster}
                  />
                ))}
              </div>
            </div>
          )}

          {team2HonorableMentions.length > 0 && (
            <div>
              <h4 className="text-xl font-bold mb-4" style={{ color: getTeamColor(team2) }}>
                {team2.school}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team2HonorableMentions.map((player, index) => (
                  <HonorableMentionCard 
                    key={player.id} 
                    player={player} 
                    team={team2} 
                    roster={team2Roster}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Honorable Mention Card Component
  const HonorableMentionCard = ({ player, team, roster }) => {
    const jerseyNumber = getJerseyNumber(player, roster);
    
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 shadow-lg p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center">
            {team?.logos?.[0] ? (
              <img src={team.logos[0]} alt={team.school} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full rounded-lg flex items-center justify-center text-white font-bold text-xs"
                   style={{ backgroundColor: getTeamColor(team) }}>
                {team?.school?.[0]}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            {jerseyNumber && (
              <div className="flex items-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-2 py-1 rounded-md shadow-sm mb-1 w-fit">
                <span className="text-xs font-bold">#</span>
                <span className="text-sm font-black">{jerseyNumber}</span>
              </div>
            )}
            
            <h5 className="font-bold text-gray-900 text-sm leading-tight">
              {player.name}
            </h5>
            
            <span className="inline-block px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold rounded mt-1">
              {player.position}
            </span>
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <div>
            <span className="text-gray-600">Total PPA:</span>
            <div className="font-bold" style={{ color: getTeamColor(team) }}>
              {player.totalPPA.all.toFixed(1)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-gray-600">Avg PPA:</span>
            <div className="font-bold" style={{ color: getTeamColor(team) }}>
              {player.averagePPA.all.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Legend Component
  const Legend = () => (
    <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-6 transition-all duration-1000 delay-1200 ${animateStats ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <div className="flex items-center space-x-3 mb-4">
        <i className="fas fa-info-circle text-blue-500 text-xl"></i>
        <h3 className="text-xl font-black gradient-text">Legend</h3>
      </div>
      
      <div className="space-y-3 text-sm">
        <div>
          <strong className="text-gray-800">PPA (Predicted Points Added):</strong>
          <p className="text-gray-600">Measures a player's contribution to their team's scoring potential. Higher values indicate greater impact.</p>
        </div>
        <div>
          <strong className="text-gray-800">Impact Threshold:</strong>
          <p className="text-gray-600">Players with Total PPA ≥ {IMPACT_THRESHOLD} are considered impact players.</p>
        </div>
        <div>
          <strong className="text-gray-800">Position Matchups:</strong>
          <p className="text-gray-600">Head-to-head comparison of the best impact player at each position between teams.</p>
        </div>
      </div>
    </div>
  );

  // Main render logic
  if (loading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView />;
  }

  if (Object.keys(positionMatchups).length === 0) {
    return <NoDataView />;
  }

  return (
    <div className="relative z-10 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        <ModernHeader />
        <TeamsHeader />
        
        {/* Position Matchups */}
        <div className="space-y-12">
          {getPositionOrder().map((position, index) => (
            <PositionMatchupRow
              key={position}
              position={position}
              matchup={positionMatchups[position]}
              index={index}
            />
          ))}
        </div>

        <HonorableMentionsSection />
        <Legend />
      </div>
    </div>
  );
};

export default ImpactPlayersTab;
