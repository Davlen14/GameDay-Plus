import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { teamService } from '../../services/teamService';
import { gameService } from '../../services/gameService';
import { rankingsService } from '../../services/rankingsService';

// Fix for marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

// Helper component to update map view with smooth animation
const MapViewUpdater = ({ center, zoom }) => {
    const map = useMap();
    
    useEffect(() => {
        if (center && zoom) {
            map.setView(center, zoom, { animate: true, duration: 1 });
        }
    }, [center, zoom, map]);
    
    return null;
};

// Custom Map Control for modern glass styling
const MapControl = ({ teams, onTeamClick }) => {
    const map = useMap();

    useEffect(() => {
        // Add custom control with glass styling
        const legendControl = L.control({ position: 'topright' });
        
        legendControl.onAdd = function() {
            const div = L.DomUtil.create('div', 'map-legend');
            div.style.cssText = `
                background: rgba(255, 255, 255, 0.4);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.5);
                border-radius: 16px;
                padding: 16px;
                box-shadow: inset 0 2px 10px rgba(255, 255, 255, 0.3), 0 15px 35px rgba(0, 0, 0, 0.1);
                min-width: 200px;
            `;
            
            div.innerHTML = `
                <div style="position: relative; z-index: 10;">
                    <h4 style="margin: 0 0 12px 0; font-weight: bold; background: linear-gradient(135deg, #000000, #555555, #000000); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        Big Ten Teams
                    </h4>
                    <p style="margin: 0; font-size: 12px; color: #666;">
                        Click markers to view team details
                    </p>
                </div>
            `;
            
            return div;
        };
        
        legendControl.addTo(map);
        
        return () => {
            map.removeControl(legendControl);
        };
    }, [teams, map, onTeamClick]);

    return null;
};

// Star Rating Component for recruiting
const StarRating = ({ rating }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars.push(
                <i key={i} className="fas fa-star text-yellow-400 drop-shadow-lg" />
            );
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars.push(
                <i key={i} className="fas fa-star-half-alt text-yellow-400 drop-shadow-lg" />
            );
        } else {
            stars.push(
                <i key={i} className="far fa-star text-gray-300" />
            );
        }
    }
    
    return <div className="flex items-center space-x-1">{stars}</div>;
};

// Interactive Conference Map Component
const ConferenceMap = ({ teams, onTeamClick, mapCenter, mapZoom }) => {
    // Custom marker icon for Big Ten teams
    const customMarkerIcon = (logoUrl) => {
        return L.divIcon({
            html: `
                <div style="
                    width: 40px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.4);
                    backdrop-filter: blur(20px);
                    border: 2px solid rgba(255, 255, 255, 0.6);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    transition: all 0.3s ease;
                ">
                    <img src="${logoUrl}" style="width: 24px; height: 24px; object-fit: contain;" onerror="this.src='/photos/ncaaf.png'" />
                </div>
            `,
            className: 'custom-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });
    };

    return (
        <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 h-96">
                <MapContainer 
                    center={mapCenter} 
                    zoom={mapZoom} 
                    style={{ height: '100%', width: '100%', borderRadius: '24px' }}
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    <MapViewUpdater center={mapCenter} zoom={mapZoom} />
                    <MapControl teams={teams} onTeamClick={onTeamClick} />
                    
                    {teams.map(team => (
                        team.location && (
                            <Marker
                                key={team.id}
                                position={[team.location.latitude || 40.0, team.location.longitude || -85.0]}
                                icon={customMarkerIcon(team.logos?.[0] || '/photos/ncaaf.png')}
                                eventHandlers={{
                                    click: () => onTeamClick && onTeamClick(team.id)
                                }}
                            >
                                <Popup className="custom-popup">
                                    <div className="bg-white/95 backdrop-blur-xl rounded-xl border border-white/50 p-4 min-w-48">
                                        <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                                        
                                        <div className="relative z-10">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <img 
                                                    src={team.logos?.[0] || '/photos/ncaaf.png'} 
                                                    alt={team.school}
                                                    className="w-8 h-8 object-contain"
                                                    onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                                                />
                                                <div>
                                                    <h3 className="font-bold text-gray-800 text-sm">{team.school}</h3>
                                                    <p className="text-xs text-gray-600">{team.abbreviation}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Conference:</span>
                                                    <span className="font-medium text-gray-800">Big Ten</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Location:</span>
                                                    <span className="font-medium text-gray-800">{team.location?.city || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

// Enhanced Recruiting Component
const RecruitingTracker = ({ recruits }) => {
    const getPositionIcon = (position) => {
        const pos = position?.toLowerCase() || 'unknown';
        if (pos.includes('qb')) return 'fas fa-crosshairs';
        if (pos.includes('rb') || pos.includes('fb')) return 'fas fa-running';
        if (pos.includes('wr') || pos.includes('te')) return 'fas fa-hands';
        if (pos.includes('ol') || pos.includes('dl')) return 'fas fa-shield-alt';
        if (pos.includes('lb')) return 'fas fa-fist-raised';
        if (pos.includes('db') || pos.includes('cb') || pos.includes('s')) return 'fas fa-eye';
        if (pos.includes('k') || pos.includes('p')) return 'fas fa-bullseye';
        return 'fas fa-football-ball';
    };

    const getPositionColor = (position) => {
        const pos = position?.toLowerCase() || 'unknown';
        if (pos.includes('qb')) return 'text-purple-600';
        if (pos.includes('rb') || pos.includes('fb')) return 'text-green-600';
        if (pos.includes('wr') || pos.includes('te')) return 'text-blue-600';
        if (pos.includes('ol') || pos.includes('dl')) return 'text-red-600';
        if (pos.includes('lb')) return 'text-yellow-600';
        if (pos.includes('db') || pos.includes('cb') || pos.includes('s')) return 'text-indigo-600';
        if (pos.includes('k') || pos.includes('p')) return 'text-gray-600';
        return 'text-gray-500';
    };

    return (
        <div className="space-y-3">
            {recruits.slice(0, 10).map((recruit, index) => (
                <div key={index} className="relative">
                    <div className="relative bg-white/30 backdrop-blur-xl rounded-xl border border-white/40 p-4 shadow-[inset_0_1px_4px_rgba(255,255,255,0.2)]">
                        <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 flex items-center justify-center shadow-lg`}>
                                        <i className={`${getPositionIcon(recruit.position)} ${getPositionColor(recruit.position)} text-sm`} />
                                    </div>
                                    
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-sm">{recruit.name}</h4>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-medium text-gray-600">{recruit.position}</span>
                                            <span className="text-xs text-gray-500">•</span>
                                            <span className="text-xs text-gray-500">{recruit.height} • {recruit.weight}lbs</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <StarRating rating={recruit.rating || 3} />
                                    <p className="text-xs text-gray-500 mt-1">{recruit.city}, {recruit.state}</p>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-600">High School: {recruit.school}</span>
                                <span className="text-gray-500">Class of {recruit.year || '2024'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Talent Ratings Visualization
const TalentRatings = ({ teamTalent, maxTalent }) => {
    const getTalentBarWidth = (talent) => {
        if (!talent || !maxTalent) return 0;
        return Math.min((talent / maxTalent) * 100, 100);
    };

    const getTalentColor = (talent) => {
        if (!talent) return 'bg-gray-400';
        if (talent >= 950) return 'bg-gradient-to-r from-green-500 to-green-600';
        if (talent >= 900) return 'bg-gradient-to-r from-blue-500 to-blue-600';
        if (talent >= 850) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    };

    const getTalentLevel = (talent) => {
        if (!talent) return 'Unrated';
        if (talent >= 950) return 'Elite';
        if (talent >= 900) return 'Strong';
        if (talent >= 850) return 'Good';
        return 'Developing';
    };

    return (
        <div className="space-y-3">
            {teamTalent.slice(0, 18).map((team, index) => (
                <div key={index} className="relative">
                    <div className="relative bg-white/30 backdrop-blur-xl rounded-xl border border-white/40 p-4 shadow-[inset_0_1px_4px_rgba(255,255,255,0.2)]">
                        <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-bold text-gray-700">#{index + 1}</span>
                                    <h4 className="font-bold text-gray-800 text-sm">{team.school}</h4>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-gray-800">{team.talent?.toFixed(1) || 'N/A'}</span>
                                    <p className="text-xs text-gray-600">{getTalentLevel(team.talent)}</p>
                                </div>
                            </div>
                            
                            <div className="w-full bg-gray-200/50 rounded-full h-3 overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${getTalentColor(team.talent)}`}
                                    style={{ width: `${getTalentBarWidth(team.talent)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const BigTen = () => {
  // State management
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [standings, setStandings] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [news, setNews] = useState([]);
  const [recruits, setRecruits] = useState([]);
  const [teamTalent, setTeamTalent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Map');
  const [mapCenter, setMapCenter] = useState([41.0, -85.0]);
  const [mapZoom, setMapZoom] = useState(6);

  // Big Ten team IDs with their approximate locations
  const bigTenTeamIds = [
    2, 130, 135, 158, 193, 213, 239, 253, 254, 269, 275, 294, 329, 331, 356, 371, 405, 419
  ];

  // Big Ten team locations (you can adjust these coordinates)
  const teamLocations = {
    'Michigan': { latitude: 42.2780, longitude: -83.7382, city: 'Ann Arbor, MI' },
    'Ohio State': { latitude: 40.0142, longitude: -83.0309, city: 'Columbus, OH' },
    'Penn State': { latitude: 40.7982, longitude: -77.8599, city: 'University Park, PA' },
    'Wisconsin': { latitude: 43.0759, longitude: -89.4124, city: 'Madison, WI' },
    'Iowa': { latitude: 41.6627, longitude: -91.5566, city: 'Iowa City, IA' },
    'Minnesota': { latitude: 44.9778, longitude: -93.2650, city: 'Minneapolis, MN' },
    'Illinois': { latitude: 40.1020, longitude: -88.2272, city: 'Champaign, IL' },
    'Indiana': { latitude: 39.1754, longitude: -86.5119, city: 'Bloomington, IN' },
    'Purdue': { latitude: 40.4237, longitude: -86.9212, city: 'West Lafayette, IN' },
    'Michigan State': { latitude: 42.7335, longitude: -84.4861, city: 'East Lansing, MI' },
    'Northwestern': { latitude: 42.0564, longitude: -87.6755, city: 'Evanston, IL' },
    'Nebraska': { latitude: 40.8202, longitude: -96.7005, city: 'Lincoln, NE' },
    'Maryland': { latitude: 38.9869, longitude: -76.9426, city: 'College Park, MD' },
    'Rutgers': { latitude: 40.5008, longitude: -74.4474, city: 'Piscataway, NJ' },
    'Oregon': { latitude: 44.0582, longitude: -123.0351, city: 'Eugene, OR' },
    'UCLA': { latitude: 34.0689, longitude: -118.4452, city: 'Los Angeles, CA' },
    'USC': { latitude: 34.0224, longitude: -118.2851, city: 'Los Angeles, CA' },
    'Washington': { latitude: 47.6553, longitude: -122.3035, city: 'Seattle, WA' }
  };

  const categories = ['Map', 'Standings', 'Talent Rankings', 'Recent Games', 'Rankings', 'News', 'Recruiting'];

  useEffect(() => {
    loadBigTenData();
  }, []);

  const loadBigTenData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Load all teams first
      const allTeams = await teamService.getFBSTeams(true);
      const bigTenTeams = allTeams.filter(team => 
        team.conference === 'Big Ten' || bigTenTeamIds.includes(team.id)
      );
      
      // Add location data to teams
      const teamsWithLocations = bigTenTeams.map(team => ({
        ...team,
        location: teamLocations[team.school] || { latitude: 40.0, longitude: -85.0, city: 'Unknown' }
      }));
      
      setTeams(teamsWithLocations);

      // Load recent games for Big Ten teams
      const currentWeek = 1; // You can make this dynamic
      const recentGames = await gameService.getGamesByWeek(2024, currentWeek, 'regular', false);
      const bigTenGames = recentGames.filter(game => 
        bigTenTeamIds.includes(game.home_id || game.homeId) || 
        bigTenTeamIds.includes(game.away_id || game.awayId)
      );
      setGames(bigTenGames);

      // Load rankings
      try {
        const rankingsData = await rankingsService.getHistoricalRankings(2024, null, 'postseason');
        const apPoll = rankingsData.find(week => 
          week.polls?.find(poll => poll.poll === 'AP Top 25')
        );
        if (apPoll) {
          const apRankings = apPoll.polls.find(poll => poll.poll === 'AP Top 25');
          setRankings(apRankings?.ranks || []);
        }
      } catch (error) {
        console.warn('Error loading rankings:', error);
        setRankings([]);
      }

      // Enhanced mock news data
      const mockNews = [
        {
          title: "Big Ten Championship Race Heats Up",
          description: "Multiple teams vie for conference title as season progresses with playoff implications",
          date: new Date().toISOString(),
          source: "Big Ten Network",
          image: "/photos/Big Ten.png"
        },
        {
          title: "Transfer Portal Impact on Big Ten",
          description: "How portal transfers are reshaping conference competition and team dynamics",
          date: new Date(Date.now() - 86400000).toISOString(),
          source: "ESPN",
          image: null
        },
        {
          title: "Big Ten Recruiting Update",
          description: "Latest commitments and recruiting news across the conference for 2024 class",
          date: new Date(Date.now() - 172800000).toISOString(),
          source: "247Sports",
          image: null
        },
        {
          title: "College Football Playoff Expansion Impact",
          description: "How the new 12-team playoff format affects Big Ten championship hopes",
          date: new Date(Date.now() - 259200000).toISOString(),
          source: "The Athletic",
          image: null
        },
        {
          title: "Big Ten Media Days Highlights",
          description: "Key takeaways from coaches and players at Big Ten Media Days",
          date: new Date(Date.now() - 345600000).toISOString(),
          source: "Big Ten Network",
          image: null
        }
      ];
      setNews(mockNews);

      // Enhanced mock recruiting data
      const mockRecruits = [
        {
          name: "Marcus Johnson",
          position: "QB",
          height: "6'3\"",
          weight: 215,
          rating: 4.5,
          city: "Chicago",
          state: "IL",
          school: "Lincoln High School",
          year: 2024,
          committedTo: "Michigan"
        },
        {
          name: "David Rodriguez",
          position: "RB",
          height: "5'11\"",
          weight: 195,
          rating: 4.0,
          city: "Columbus",
          state: "OH",
          school: "Central High School",
          year: 2024,
          committedTo: "Ohio State"
        },
        {
          name: "Tyler Williams",
          position: "WR",
          height: "6'2\"",
          weight: 185,
          rating: 4.2,
          city: "Philadelphia",
          state: "PA",
          school: "Northeast High",
          year: 2024,
          committedTo: "Penn State"
        },
        {
          name: "Anthony Davis",
          position: "OL",
          height: "6'5\"",
          weight: 290,
          rating: 3.8,
          city: "Milwaukee",
          state: "WI",
          school: "North High School",
          year: 2024,
          committedTo: "Wisconsin"
        },
        {
          name: "Cameron Smith",
          position: "DL",
          height: "6'4\"",
          weight: 265,
          rating: 4.1,
          city: "Detroit",
          state: "MI",
          school: "Central Catholic",
          year: 2024,
          committedTo: "Michigan State"
        },
        {
          name: "Jordan Thompson",
          position: "LB",
          height: "6'1\"",
          weight: 225,
          rating: 3.9,
          city: "Indianapolis",
          state: "IN",
          school: "Warren Central",
          year: 2024,
          committedTo: "Indiana"
        },
        {
          name: "Malik Jackson",
          position: "DB",
          height: "6'0\"",
          weight: 180,
          rating: 4.3,
          city: "Minneapolis",
          state: "MN",
          school: "South High School",
          year: 2024,
          committedTo: "Minnesota"
        },
        {
          name: "Robert Wilson",
          position: "TE",
          height: "6'4\"",
          weight: 240,
          rating: 3.7,
          city: "Omaha",
          state: "NE",
          school: "Westside High",
          year: 2024,
          committedTo: "Nebraska"
        }
      ];
      setRecruits(mockRecruits);

      // Enhanced mock talent ratings with more realistic data
      const mockTalent = bigTenTeams.map((team, index) => ({
        school: team.school,
        talent: Math.random() * 150 + 850, // Range 850-1000
        elo: Math.random() * 400 + 1600 // Range 1600-2000
      })).sort((a, b) => b.talent - a.talent); // Sort by talent descending
      
      setTeamTalent(mockTalent);

    } catch (error) {
      setErrorMessage(error.message);
      console.error('Error loading Big Ten data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTeamLogo = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team?.logos?.[0] || '/photos/ncaaf.png';
  };

  const getTeamAbbreviation = (teamId, fallback) => {
    const team = teams.find(t => t.id === teamId);
    if (team?.abbreviation) return team.abbreviation;
    if (team?.school) {
      const words = team.school.split(' ').filter(w => w.length > 0);
      if (words.length === 1) return words[0].substring(0, 4).toUpperCase();
      return words.slice(0, 4).map(w => w[0]).join('').toUpperCase();
    }
    return fallback || 'TBD';
  };

  const getTeamRank = (teamId) => {
    if (!teamId) return null;
    const team = teams.find(t => t.id === teamId);
    if (!team) return null;
    const ranking = rankings.find(r => r.school.toLowerCase() === team.school.toLowerCase());
    return ranking?.rank || null;
  };

  const getTeamRecord = (teamId) => {
    // Mock record data - you can replace with real standings data
    return {
      wins: Math.floor(Math.random() * 10) + 2,
      losses: Math.floor(Math.random() * 4)
    };
  };

  const getTeamElo = (teamSchool) => {
    const talent = teamTalent.find(t => t.school === teamSchool);
    return talent?.elo || null;
  };

  const getTeamTalent = (teamSchool) => {
    const talent = teamTalent.find(t => t.school === teamSchool);
    return talent?.talent || null;
  };

  const handleTeamClick = (teamId) => {
    // Focus map on clicked team
    const team = teams.find(t => t.id === teamId);
    if (team && team.location) {
      setMapCenter([team.location.latitude, team.location.longitude]);
      setMapZoom(10);
    }
    console.log('Team clicked:', teamId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent mx-auto" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)' }}></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <div className="mt-6 space-y-2">
              <p className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Loading Big Ten Conference...
              </p>
              <p className="text-gray-600">Fetching conference data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md mx-auto">
              <h3 className="font-bold">Error Loading Big Ten Data</h3>
              <p className="text-sm mt-2">{errorMessage}</p>
              <button 
                onClick={loadBigTenData}
                className="mt-4 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)' }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Custom CSS Styles */}
      <style jsx>{`
        .gradient-bg {
          background: linear-gradient(135deg, #000000, #555555, #000000);
        }
        .gradient-text {
          background: linear-gradient(135deg, #000000, #555555, #000000);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .icon-gradient {
          background: linear-gradient(135deg, #000000, #555555, #000000);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Custom Leaflet Map Styling */
        .custom-marker {
          transition: all 0.3s ease;
        }
        .custom-marker:hover {
          transform: scale(1.1);
          z-index: 1000;
        }
        
        .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
        }
        
        .map-legend {
          font-family: inherit;
        }
        
        /* Leaflet control styling */
        .leaflet-control-zoom {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .leaflet-control-zoom a {
          background: transparent;
          border: none;
          color: #333;
          font-weight: bold;
        }
        
        .leaflet-control-zoom a:hover {
          background: rgba(255, 255, 255, 0.3);
          color: #000;
        }
      `}</style>

      {/* Floating Orbs Background - Big Ten themed */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-5 blur-3xl animate-pulse" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)' }}></div>
        <div className="absolute top-60 right-20 w-48 h-48 rounded-full opacity-3 blur-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-80 h-80 rounded-full opacity-4 blur-3xl animate-pulse" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-56 h-56 rounded-full opacity-3 blur-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', animationDelay: '3s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Liquid Glass Header Section */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8 relative">
            {/* Liquid Glass Icon Container */}
            <div className="relative">
              {/* Outer glass ring */}
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl animate-pulse"></div>
              {/* Inner glass container */}
              <div className="relative w-16 h-16 rounded-full bg-white/40 backdrop-blur-2xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center">
                {/* Liquid glass highlight */}
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/60 via-transparent to-transparent"></div>
                <i className="fas fa-trophy text-3xl relative z-10 drop-shadow-lg" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}></i>
              </div>
              {/* Floating particles */}
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full opacity-60 animate-ping" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)' }}></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full opacity-40 animate-ping animation-delay-500" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)' }}></div>
            </div>
          </div>
          
          {/* Enhanced Title with Liquid Glass Effect */}
          <div className="relative mb-8">
            <h1 className="text-6xl md:text-7xl font-black mb-6 relative">
              <span className="drop-shadow-2xl" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Big Ten</span>
              <br />
              <span className="drop-shadow-2xl" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Conference</span>
              {/* Animated underline */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 rounded-full opacity-60 animate-pulse" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)' }}></div>
            </h1>
          </div>
          
          {/* Stats Badge with Liquid Glass */}
          <div className="inline-flex items-center space-x-4 px-8 py-4 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2),0_15px_35px_rgba(0,0,0,0.1)]">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)' }}></div>
              <span className="text-lg font-bold" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{teams.length} Teams</span>
            </div>
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <span className="text-lg text-gray-700 font-medium">2024 Season</span>
          </div>
        </div>

        {/* Liquid Glass Category Controls */}
        <div className="relative mb-8">
          <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
            {/* Highlight overlay */}
            <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-4 justify-center">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`relative px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-500 transform hover:scale-105 ${
                      selectedCategory === category
                        ? 'text-white shadow-2xl'
                        : 'text-gray-700 hover:text-white'
                    }`}
                  >
                    {/* Active gradient background */}
                    {selectedCategory === category && (
                      <div className="absolute inset-0 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)' }}></div>
                    )}
                    
                    {/* Inactive glass background */}
                    {selectedCategory !== category && (
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl hover:bg-white/30 transition-all duration-300"></div>
                    )}
                    
                    {/* Glass highlight */}
                    <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                    
                    <span className="relative z-10">{category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedCategory === 'Map' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-4" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Big Ten Conference Map
                  </h2>
                  <ConferenceMap 
                    teams={teams}
                    onTeamClick={handleTeamClick}
                    mapCenter={mapCenter}
                    mapZoom={mapZoom}
                  />
                </div>
                
                {/* Map Controls */}
                <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-6">
                  <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-4" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      Quick Navigation
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <button
                        onClick={() => {
                          setMapCenter([41.0, -85.0]);
                          setMapZoom(6);
                        }}
                        className="px-4 py-2 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 text-sm font-medium text-gray-700"
                      >
                        <i className="fas fa-globe-americas mr-2" />
                        Full View
                      </button>
                      
                      <button
                        onClick={() => {
                          setMapCenter([40.0, -83.0]);
                          setMapZoom(7);
                        }}
                        className="px-4 py-2 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 text-sm font-medium text-gray-700"
                      >
                        <i className="fas fa-map-marker-alt mr-2" />
                        East Division
                      </button>
                      
                      <button
                        onClick={() => {
                          setMapCenter([42.0, -88.0]);
                          setMapZoom(7);
                        }}
                        className="px-4 py-2 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 text-sm font-medium text-gray-700"
                      >
                        <i className="fas fa-map-marker-alt mr-2" />
                        West Division
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === 'Talent Rankings' && (
              <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
                <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Team Talent Rankings
                  </h2>
                  
                  <TalentRatings 
                    teamTalent={teamTalent}
                    maxTalent={teamTalent.length > 0 ? teamTalent[0].talent : 1000}
                  />
                </div>
              </div>
            )}

            {selectedCategory === 'Recruiting' && (
              <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
                <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Top Recruits
                  </h2>
                  
                  <RecruitingTracker recruits={recruits} />
                </div>
              </div>
            )}

            {selectedCategory === 'Standings' && (
              <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
                <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Conference Standings
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {teams.map((team, index) => (
                      <TeamPerformanceCard
                        key={team.id}
                        team={team}
                        rank={getTeamRank(team.id)}
                        record={getTeamRecord(team.id)}
                        eloRating={getTeamElo(team.school)}
                        talentRating={getTeamTalent(team.school)}
                        onTeamClick={handleTeamClick}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === 'Recent Games' && (
              <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
                <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Recent Games
                  </h2>
                  
                  <RecentGames 
                    games={games}
                    teams={teams}
                    getTeamLogo={getTeamLogo}
                    getTeamAbbreviation={getTeamAbbreviation}
                  />
                </div>
              </div>
            )}

            {selectedCategory === 'Rankings' && (
              <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
                <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    AP Top 25 Rankings
                  </h2>
                  
                  <div className="space-y-4">
                    {rankings.filter(rank => 
                      teams.some(team => team.school.toLowerCase() === rank.school.toLowerCase())
                    ).map((ranking, index) => {
                      const team = teams.find(t => t.school.toLowerCase() === ranking.school.toLowerCase());
                      return (
                        <div key={index} className="relative bg-white/30 backdrop-blur-xl rounded-xl border border-white/40 p-4">
                          <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                          
                          <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)' }}>
                                {ranking.rank}
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center overflow-hidden">
                                  <img 
                                    src={team?.logos?.[0] || '/photos/ncaaf.png'} 
                                    alt={ranking.school}
                                    className="w-6 h-6 object-contain"
                                    onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                                  />
                                </div>
                                <span className="font-bold text-gray-800">{ranking.school}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-700">{ranking.points} pts</div>
                              <div className="text-xs text-gray-500">{ranking.firstPlaceVotes || 0} first place</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === 'News' && (
              <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
                <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Conference News
                  </h2>
                  
                  <ConferenceNews news={news} />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Conference Logo */}
            <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8 text-center">
              <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="relative z-10">
                <img 
                  src="/photos/Big Ten.png" 
                  alt="Big Ten Conference"
                  className="w-32 h-32 mx-auto mb-4 object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Big Ten Conference</h3>
                <p className="text-gray-600 text-sm">Est. 1896 • 18 Teams</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
              <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-4" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Quick Stats
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                    <span className="text-sm text-gray-600">Active Teams</span>
                    <span className="font-bold text-gray-800">{teams.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                    <span className="text-sm text-gray-600">Ranked Teams</span>
                    <span className="font-bold text-gray-800">
                      {rankings.filter(rank => 
                        teams.some(team => team.school.toLowerCase() === rank.school.toLowerCase())
                      ).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Recent Games</span>
                    <span className="font-bold text-gray-800">{games.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BigTen;
