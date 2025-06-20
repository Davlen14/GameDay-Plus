import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FaStar,
  FaSearch,
  FaInfoCircle,
  FaMapMarkedAlt,
  FaTrophy,
  FaFootballBall,
  FaSyncAlt,
  FaChartBar
} from "react-icons/fa";
import { rankingsService } from '../../services/rankingsService';
import { teamService } from '../../services/teamService';

// Conditionally import Leaflet components
let MapContainer, TileLayer, Marker, Popup, useMap, Icon, L, MarkerClusterGroup;
let leafletAvailable = true;

try {
  const leafletComponents = require('react-leaflet');
  MapContainer = leafletComponents.MapContainer;
  TileLayer = leafletComponents.TileLayer;
  Marker = leafletComponents.Marker;
  Popup = leafletComponents.Popup;
  useMap = leafletComponents.useMap;
  
  // Try to import clustering (optional)
  try {
    const clusterComponents = require('react-leaflet-cluster');
    MarkerClusterGroup = clusterComponents.default || clusterComponents;
  } catch (clusterError) {
    console.warn('Clustering not available, using standard markers');
    MarkerClusterGroup = null;
  }
  
  const leaflet = require('leaflet');
  Icon = leaflet.Icon;
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
    5: "#f54242", // Red
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
          background-color: ${colors[starRating] || "#888"};
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
  const [error, setError] = useState(null);
  const [selectedConference, setSelectedConference] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Helper function to get team conference and image
  const getTeamInfo = (teamName) => {
    const team = teams.find(t => 
      t.school?.toLowerCase() === teamName?.toLowerCase() ||
      t.mascot?.toLowerCase() === teamName?.toLowerCase()
    );
    return {
      conference: team?.conference || 'Independent',
      image: team?.logos?.[0] || `/photos/${teamName?.replace(/\s+/g, '')}.jpg`
    };
  };

  // Convert API recruit data to component format
  const transformRecruitData = useCallback((recruits) => {
    return recruits.map((recruit, index) => {
      const teamInfo = getTeamInfo(recruit.recruitedBy || recruit.college);
      const coordinates = recruit.stateProvince ? 
        getStateCoordinates(recruit.stateProvince) : 
        [39.8283, -98.5795]; // Default to center of US

      return {
        id: recruit.id || `recruit-${index}`,
        name: `${recruit.name || 'Unknown Recruit'}`,
        position: recruit.position || 'ATH',
        rating: recruit.stars || recruit.rating || 3,
        height: recruit.height || 'N/A',
        weight: recruit.weight || 'N/A',
        school: recruit.recruitedBy || recruit.college || 'Uncommitted',
        conference: teamInfo.conference,
        highSchool: recruit.school || 'Unknown High School',
        city: recruit.city || 'Unknown',
        state: recruit.stateProvince || 'Unknown',
        coordinates: coordinates,
        committed: recruit.recruitedBy ? true : false,
        commitDate: recruit.committedTo || new Date().toISOString(),
        recruitingRank: recruit.ranking || index + 1,
        image: teamInfo.image
      };
    });
  }, [teams]);

  useEffect(() => {
    const fetchCommitments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch teams data for conference mapping and images
        const [teamsData, recruitsData] = await Promise.all([
          teamService.getTeams().catch(() => []),
          rankingsService.getPlayerRecruitingRankings(2024).catch(() => [])
        ]);

        setTeams(teamsData || []);
        
        // Transform and set recruit data
        const transformedRecruits = transformRecruitData(recruitsData || []);
        setCommitments(transformedRecruits);

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
        setLoading(false);
      }
    };

    fetchCommitments();
  }, [transformRecruitData]);

  // Filter commitments based on selected filters
  const filteredCommitments = useMemo(() => {
    return commitments.filter(commitment => {
      const matchesConference = selectedConference === 'all' || commitment.conference === selectedConference;
      const matchesPosition = selectedPosition === 'all' || commitment.position === selectedPosition;
      const matchesRating = selectedRating === 'all' || commitment.rating.toString() === selectedRating;
      const matchesSearch = searchTerm === '' || 
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
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-700 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-xl">Loading commitments data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-700 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <p className="text-xl text-red-200 mb-4">⚠️ {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-white text-red-800 px-6 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-700 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
            🏈 Player Commitments
          </h1>
          <p className="text-xl text-red-200">
            Track the latest commitments from top recruits across the nation
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{commitments.length}</div>
              <div className="text-red-200">Total Commits</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {commitments.filter(c => c.rating === 5).length}
              </div>
              <div className="text-red-200">5-Star Recruits</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{conferences.length}</div>
              <div className="text-red-200">Conferences</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{positions.length}</div>
              <div className="text-red-200">Positions</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-red-200 text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search players, schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <label className="block text-red-200 text-sm font-medium mb-2">Conference</label>
              <select
                value={selectedConference}
                onChange={(e) => setSelectedConference(e.target.value)}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="all">All Conferences</option>
                {conferences.map(conf => (
                  <option key={conf} value={conf} className="text-black">{conf}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-red-200 text-sm font-medium mb-2">Position</label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="all">All Positions</option>
                {positions.map(pos => (
                  <option key={pos} value={pos} className="text-black">{pos}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-red-200 text-sm font-medium mb-2">Rating</label>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="all">All Ratings</option>
                {ratings.sort((a, b) => b - a).map(rating => (
                  <option key={rating} value={rating} className="text-black">{rating} Star</option>
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
                className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors border border-white/30"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">📍 Commitment Map</h2>
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
                <MapBounds commitments={filteredCommitments} />
                {filteredCommitments.map((commitment) => (
                  <Marker
                    key={commitment.id}
                    position={commitment.coordinates}
                    icon={customIcon}
                  >
                    <Popup>
                      <div className="p-2 min-w-48">
                        <div className="font-bold text-lg text-red-800">{commitment.name}</div>
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
              <div className="bg-white/5 rounded-lg h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-4">🗺️</div>
                  <div className="text-lg mb-2">Interactive Map Coming Soon</div>
                  <div className="text-red-200 text-sm">Map functionality requires additional setup</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Showing {filteredCommitments.length} of {commitments.length} commitments
          </h2>
        </div>

        {/* Commitments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommitments.map((commitment) => (
            <div
              key={commitment.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{commitment.name}</h3>
                  <div className="text-red-200 text-sm">
                    {commitment.position} • {commitment.height}, {commitment.weight}
                  </div>
                  <div className="text-yellow-300 text-lg mt-1">
                    {getStarRating(commitment.rating)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                    #{commitment.recruitingRank}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-red-200">School:</span>
                  <span className="text-white font-medium">{commitment.school}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-200">Conference:</span>
                  <span className="text-white">{commitment.conference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-200">High School:</span>
                  <span className="text-white">{commitment.highSchool}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-200">Location:</span>
                  <span className="text-white">{commitment.city}, {commitment.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-200">Committed:</span>
                  <span className="text-white">{formatCommitDate(commitment.commitDate)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-green-300 text-sm font-medium">✓ Committed</span>
                  <button className="text-white hover:text-red-200 transition-colors text-sm">
                    View Profile →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCommitments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white text-xl mb-2">No commitments found</div>
            <div className="text-red-200">Try adjusting your filters to see more results</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Commitments;
