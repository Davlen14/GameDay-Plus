import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { rankingsService } from '../../services/rankingsService';
import { teamService } from '../../services/teamService';

// Conditionally import Leaflet components
let MapContainer, TileLayer, Marker, Popup, useMap, L;
let leafletAvailable = true;

try {
  const leafletComponents = require('react-leaflet');
  MapContainer = leafletComponents.MapContainer;
  TileLayer = leafletComponents.TileLayer;
  Marker = leafletComponents.Marker;
  Popup = leafletComponents.Popup;
  useMap = leafletComponents.useMap;
  
  // Clustering functionality removed due to React 19 compatibility issues
  // Using standard markers instead
  console.log('Using standard markers (clustering disabled for React 19 compatibility)');
  
  
  const leaflet = require('leaflet');
  L = leaflet;
  
  // Import CSS
  require('leaflet/dist/leaflet.css');
  
  // Fix for default markers in React-Leaflet
  if (L && L.Icon && L.Icon.Default) {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });
  }
} catch (error) {
  console.warn('Leaflet not available, map functionality will be disabled');
  leafletAvailable = false;
}

/** US bounding box to restrict map view to the continental US. */
const US_BOUNDS = [
  [24.396308, -125.0], // Southwest
  [49.384358, -66.93457] // Northeast
];

/** Create a custom marker icon for a given star rating. */
const createStarIcon = (starRating) => {
  if (!leafletAvailable || !L) return null;
  
  const colors = {
    3: "#4287f5", // Blue
    4: "#f5a742", // Orange
    5: "linear-gradient(135deg, #FF6B6B 0%, #E63946 50%, #D32F2F 100%)", // Modern red gradient
  };

  return L.divIcon({
    className: `star-marker star-${starRating}`,
    html: `
      <div style="position: relative; width: 40px; height: 40px;">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 30px;
          height: 30px;
          background-color: ${starRating === 5 ? '#E63946' : colors[starRating] || "#888"};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">
          ${starRating}★
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

/** A small component to set up the map's bounds and constraints. */
let MapControls;
if (leafletAvailable && useMap) {
  MapControls = () => {
    const map = useMap();

    useEffect(() => {
      if (!map) return;
      
      // Fit map to US bounds on load
      map.fitBounds(US_BOUNDS);

      // Prevent zooming too far out
      map.setMinZoom(3);

      // Restrict panning to US area (with some buffer)
      map.setMaxBounds([
        [15, -140], // Southwest buffer
        [55, -50],  // Northeast buffer
      ]);
    }, [map]);

    return null;
  };
} else {
  MapControls = () => null;
}

const Commitments = () => {
  const [commitments, setCommitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [selectedConference, setSelectedConference] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedRating, setSelectedRating] = useState('5');
  const [searchTerm, setSearchTerm] = useState('');

  // Add filters state for the advanced filtering
  const [filters] = useState({
    position: "All",
    stars: 0,
    team: "",
    committed: "all",
    state: "All",
  });

  // State for team data to map to conferences and images
  const [teams, setTeams] = useState([]);

  // Helper function to get state coordinates (simplified for major states)
  const getStateCoordinates = (state) => {
    const stateCoords = {
      'AL': [32.3182, -86.9023], 'AK': [61.2176, -149.8997], 'AZ': [33.7712, -111.3877],
      'AR': [34.9513, -92.3809], 'CA': [36.1162, -119.6816], 'CO': [39.0646, -105.3272],
      'CT': [41.5834, -72.7622], 'DE': [39.318, -75.5071], 'FL': [27.8333, -81.717],
      'GA': [32.9866, -83.6487], 'HI': [21.1098, -157.5311], 'ID': [44.2394, -114.5103],
      'IL': [40.3363, -89.0022], 'IN': [39.8647, -86.2604], 'IA': [42.0046, -93.214],
      'KS': [38.5111, -96.8005], 'KY': [37.669, -84.6514], 'LA': [31.1801, -91.8749],
      'ME': [44.323, -69.765], 'MD': [39.0724, -76.7902], 'MA': [42.2373, -71.5314],
      'MI': [43.3504, -84.5603], 'MN': [45.7326, -93.9196], 'MS': [32.7673, -89.6812],
      'MO': [38.4623, -92.302], 'MT': [47.0527, -110.2181], 'NE': [41.1289, -98.2883],
      'NV': [38.4199, -117.1219], 'NH': [43.4108, -71.5653], 'NJ': [40.314, -74.5089],
      'NM': [34.8375, -106.2371], 'NY': [42.9538, -75.5268], 'NC': [35.630, -79.8064],
      'ND': [47.5362, -99.793], 'OH': [40.3467, -82.7344], 'OK': [35.5376, -96.9247],
      'OR': [44.931, -123.0351], 'PA': [40.5773, -77.264], 'RI': [41.6772, -71.5101],
      'SC': [33.8191, -80.9066], 'SD': [44.2853, -99.4632], 'TN': [35.7449, -86.7489],
      'TX': [31.106, -97.6475], 'UT': [40.1135, -111.8535], 'VT': [44.0407, -72.7093],
      'VA': [37.768, -78.2057], 'WA': [47.3826, -121.5304], 'WV': [38.468, -80.9696],
      'WI': [44.2563, -89.6385], 'WY': [42.7475, -107.2085]
    };
    return stateCoords[state] || [39.8283, -98.5795]; // Default to center of US
  };

  useEffect(() => {
    const fetchCommitments = async () => {
      try {
        setLoading(true);
        setLoadingProgress(0);
        setError(null);

        // Step 1: Start loading (10%)
        setLoadingProgress(10);

        // Step 2: Fetch teams data (40%)
        setLoadingProgress(25);
        const teamsData = await teamService.getAllTeams().catch(() => []);
        setLoadingProgress(40);

        // Step 3: Fetch recruiting data (70%)
        setLoadingProgress(55);
        const recruitsData = await rankingsService.getPlayerRecruitingRankings(2025).catch(() => []);
        setLoadingProgress(70);

        // Step 4: Process teams data (80%)
        setTeams(teamsData || []);
        setLoadingProgress(80);
        
        // Step 5: Transform recruit data (90%) - move transform function here
        setLoadingProgress(90);
        
        // Helper function to get team conference and image
        const getTeamInfo = (teamName) => {
          const team = (teamsData || []).find(t => 
            t.school?.toLowerCase() === teamName?.toLowerCase() ||
            t.mascot?.toLowerCase() === teamName?.toLowerCase()
          );
          return {
            conference: team?.conference || 'Independent',
            image: team?.logos?.[0] || `/photos/${teamName?.replace(/\s+/g, '')}.jpg`
          };
        };

        // Transform recruit data
        const transformedRecruits = (recruitsData || []).map((recruit, index) => {
          const teamInfo = getTeamInfo(recruit.committedTo);
          const coordinates = recruit.stateProvince ? 
            getStateCoordinates(recruit.stateProvince) : 
            [39.8283, -98.5795]; // Default to center of US

          return {
            id: recruit.id || `recruit-${index}`,
            name: `${recruit.name || 'Unknown Recruit'}`,
            position: recruit.position || 'ATH',
            rating: recruit.stars || Math.round(recruit.rating * 5) || 3,
            height: recruit.height ? `${Math.floor(recruit.height / 12)}'${recruit.height % 12}"` : 'N/A',
            weight: recruit.weight ? `${recruit.weight} lbs` : 'N/A',
            school: recruit.committedTo || 'Uncommitted',
            conference: teamInfo.conference,
            highSchool: recruit.school || 'Unknown High School',
            city: recruit.city || 'Unknown',
            state: recruit.stateProvince || 'Unknown',
            coordinates: coordinates,
            committed: recruit.committedTo ? true : false,
            commitDate: new Date().toISOString(),
            recruitingRank: recruit.ranking || index + 1,
            image: teamInfo.image,
            teamLogo: teamInfo.image
          };
        });
        
        // Step 6: Set final data (100%)
        setCommitments(transformedRecruits);
        setLoadingProgress(100);

        // If no real data, provide fallback
        if (!transformedRecruits.length) {
          const fallbackCommitments = [
            {
              id: 'fallback-1',
              name: "Elite Recruit",
              position: "QB",
              rating: 5,
              height: "6'3\"",
              weight: "210",
              school: "Ohio State",
              conference: "Big Ten",
              highSchool: "National Prep Academy",
              city: "Columbus",
              state: "OH",
              coordinates: [39.9612, -82.9988],
              committed: true,
              commitDate: new Date().toISOString(),
              recruitingRank: 1,
              image: "/photos/ncaaf.png"
            }
          ];
          setCommitments(fallbackCommitments);
        }

      } catch (err) {
        console.error('Error fetching commitments:', err);
        setError('Failed to load recruiting commitments data');
        
        // Provide fallback data on error
        const fallbackCommitments = [
          {
            id: 'error-fallback-1',
            name: "Recruiting Data Unavailable",
            position: "N/A",
            rating: 3,
            height: "N/A",
            weight: "N/A",
            school: "Loading...",
            conference: "Unknown",
            highSchool: "Please check back later",
            city: "Unknown",
            state: "US",
            coordinates: [39.8283, -98.5795],
            committed: false,
            commitDate: new Date().toISOString(),
            recruitingRank: 1,
            image: "/photos/ncaaf.png"
          }
        ];
        setCommitments(fallbackCommitments);
      } finally {
        // Small delay to show 100% completion
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    };

    fetchCommitments();
  }, []); // Empty dependency array - only run once on mount

  // Filter commitments based on selected filters
  const filteredCommitments = useMemo(() => {
    return commitments.filter(commitment => {
      const matchesConference = selectedConference === 'all' || commitment.conference === selectedConference;
      const matchesPosition = selectedPosition === 'all' || commitment.position === selectedPosition;
      const matchesRating = selectedRating === 'all' || commitment.rating.toString() === selectedRating;
      const matchesSearch = !searchTerm || 
        commitment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commitment.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commitment.highSchool.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesConference && matchesPosition && matchesRating && matchesSearch;
    });
  }, [commitments, selectedConference, selectedPosition, selectedRating, searchTerm]);

  // Get unique values for filters
  const conferences = [...new Set(commitments.map(c => c.conference))];
  const positions = [...new Set(commitments.map(c => c.position))];
  const ratings = [...new Set(commitments.map(c => c.rating.toString()))];

  const getStarRating = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatCommitDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-800">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-6"></div>
            <p className="text-xl mb-6">Loading commitments data...</p>
            
            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="text-gray-600 text-sm">{loadingProgress}% Complete</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-800">
            <p className="text-xl text-red-600 mb-4">⚠️ {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="w-[97%] max-w-none mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Player Commitments
          </h1>
          <p className="text-xl text-gray-600">
            Track the latest commitments from top recruits across the nation
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">{commitments.length}</div>
              <div className="text-gray-600">Total Commits</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">
                {commitments.filter(c => c.rating === 5).length}
              </div>
              <div className="text-gray-600">5-Star Recruits</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">{conferences.length}</div>
              <div className="text-gray-600">Conferences</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">{positions.length}</div>
              <div className="text-gray-600">Positions</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search players, schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2" style={{
                  focusRingColor: '#E63946'
                }}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Conference</label>
              <select
                value={selectedConference}
                onChange={(e) => setSelectedConference(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2" style={{
                  focusRingColor: '#E63946'
                }}
              >
                <option value="all">All Conferences</option>
                {conferences.map(conf => (
                  <option key={conf} value={conf}>{conf}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Position</label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2" style={{
                  focusRingColor: '#E63946'
                }}
              >
                <option value="all">All Positions</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Rating</label>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2" style={{
                  focusRingColor: '#E63946'
                }}
              >
                <option value="all">All Ratings</option>
                {ratings.sort((a, b) => b - a).map(rating => (
                  <option key={rating} value={rating}>{rating} Star</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedConference('all');
                  setSelectedPosition('all');
                  setSelectedRating('all');
                  setSearchTerm('');
                }}
                className="w-full text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #E63946 50%, #D32F2F 100%)'
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Commitment Map
          </h2>
          <div className="h-96 rounded-lg overflow-hidden">
            {leafletAvailable && MapContainer ? (
              <MapContainer
                center={[39.8283, -98.5795]} // Center of USA
                zoom={4}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapControls />
                {filteredCommitments.map((commitment) => (
                  <Marker
                    key={commitment.id}
                    position={commitment.coordinates}
                    icon={createStarIcon(commitment.stars || commitment.rating || 4)}
                  >
                    <Popup>
                      <div className="p-2 min-w-48">
                        <div className="font-bold text-lg" style={{
                          color: commitment.rating === 5 ? '#E63946' : '#991B1B'
                        }}>{commitment.name}</div>
                        <div className="text-sm text-gray-600 mb-2">
                          {commitment.position} • {getStarRating(commitment.rating)}
                        </div>
                        <div className="text-sm">
                          <div><strong>School:</strong> {commitment.school}</div>
                          <div><strong>High School:</strong> {commitment.highSchool}</div>
                          <div><strong>Size:</strong> {commitment.height}, {commitment.weight}</div>
                          <div><strong>Committed:</strong> {formatCommitDate(commitment.commitDate)}</div>
                          <div><strong>Rank:</strong> #{commitment.recruitingRank}</div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="bg-gray-100 rounded-lg h-full flex items-center justify-center">
                <div className="text-center text-gray-800">
                  <div className="text-4xl mb-4">🗺️</div>
                  <div className="text-lg mb-2">Interactive Map Coming Soon</div>
                  <div className="text-gray-600 text-sm">Map functionality requires additional setup</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Showing {filteredCommitments.length} of {commitments.length} recruits
          </h2>
          <p className="text-gray-600">
            {filteredCommitments.filter(c => c.committed).length} committed • {filteredCommitments.filter(c => !c.committed).length} uncommitted
          </p>
        </div>

        {/* Commitments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommitments.map((commitment) => (
            <div
              key={commitment.id}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-start mb-4">
                {/* Bug logo with checkmark overlay */}
                <div className="relative mr-3 flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {commitment.committed && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{commitment.name}</h3>
                  <div className="text-gray-600 text-sm">
                    {commitment.position} • {commitment.height}, {commitment.weight}
                  </div>
                  <div className="text-yellow-500 text-lg mt-1 font-bold" style={{
                    background: commitment.rating === 5 ? 'linear-gradient(135deg, #FF6B6B 0%, #E63946 50%, #D32F2F 100%)' : '',
                    WebkitBackgroundClip: commitment.rating === 5 ? 'text' : '',
                    WebkitTextFillColor: commitment.rating === 5 ? 'transparent' : '',
                    backgroundClip: commitment.rating === 5 ? 'text' : ''
                  }}>
                    {getStarRating(commitment.rating)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="px-2 py-1 rounded text-xs font-bold text-white" style={{
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #E63946 50%, #D32F2F 100%)'
                  }}>
                    #{commitment.recruitingRank}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Committed To:</span>
                  <div className="flex items-center space-x-2">
                    {commitment.school !== 'Uncommitted' && commitment.teamLogo && (
                      <img 
                        src={commitment.teamLogo} 
                        alt={`${commitment.school} logo`}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <span className={`font-medium ${commitment.school === 'Uncommitted' ? 'text-gray-500' : 'text-gray-800'}`}>
                      {commitment.school}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <span className="text-gray-800 font-medium">{commitment.rating} Star</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">High School:</span>
                  <span className="text-gray-800">{commitment.highSchool}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="text-gray-800">{commitment.city}, {commitment.state}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  {commitment.committed ? (
                    <span className="text-green-600 text-sm font-medium">✓ Committed</span>
                  ) : (
                    <span className="text-orange-600 text-sm font-medium">○ Uncommitted</span>
                  )}
                  <button className="text-sm font-medium text-white px-3 py-1 rounded transition-all duration-200 hover:scale-105" style={{
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #E63946 50%, #D32F2F 100%)'
                  }}>
                    View Profile →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCommitments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-800 text-xl mb-2">No commitments found</div>
            <div className="text-gray-600">Try adjusting your filters to see more results</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Commitments;
