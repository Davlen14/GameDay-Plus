import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
const TailgateMapControl = ({ stadiums, onStadiumClick }) => {
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
                    <h4 style="margin: 0 0 12px 0; font-weight: bold; background: linear-gradient(135deg, #ff7f50, #ff6347, #ff4500); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        Stadium Tailgates
                    </h4>
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
                        Click stadiums to find tailgates
                    </p>
                    <div style="font-size: 11px; color: #888;">
                        <div style="margin-bottom: 4px;">🔥 Active tailgates</div>
                        <div style="margin-bottom: 4px;">👥 Fan meetups</div>
                        <div>📍 Check-ins available</div>
                    </div>
                </div>
            `;
            
            return div;
        };
        
        legendControl.addTo(map);
        
        return () => {
            map.removeControl(legendControl);
        };
    }, [stadiums, map, onStadiumClick]);

    return null;
};

// Stadium Navigation Grid Component
const StadiumNavigationGrid = ({ stadiums, selectedStadium1, selectedStadium2, onStadiumClick }) => {
  return (
    <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-6 mb-6">
      <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        <h3 className="text-lg font-bold mb-4" style={{ background: 'linear-gradient(135deg, #ff7f50, #ff6347, #ff4500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Stadium Navigator
        </h3>
        <p className="text-sm text-gray-600 mb-4">Click stadiums to find tailgates and calculate distances</p>
        
        {/* Stadium Grid - 3 rows of 5 stadiums each */}
        <div className="space-y-3">
          {/* Row 1 */}
          <div className="grid grid-cols-5 gap-3">
            {stadiums.slice(0, 5).map((stadium) => {
              const isSelected1 = selectedStadium1?.id === stadium.id;
              const isSelected2 = selectedStadium2?.id === stadium.id;
              const isSelected = isSelected1 || isSelected2;
              
              return (
                <StadiumCard 
                  key={stadium.id}
                  stadium={stadium}
                  isSelected1={isSelected1}
                  isSelected2={isSelected2}
                  isSelected={isSelected}
                  onStadiumClick={onStadiumClick}
                  selectedStadium1={selectedStadium1}
                  selectedStadium2={selectedStadium2}
                />
              );
            })}
          </div>
          
          {/* Row 2 */}
          <div className="grid grid-cols-5 gap-3">
            {stadiums.slice(5, 10).map((stadium) => {
              const isSelected1 = selectedStadium1?.id === stadium.id;
              const isSelected2 = selectedStadium2?.id === stadium.id;
              const isSelected = isSelected1 || isSelected2;
              
              return (
                <StadiumCard 
                  key={stadium.id}
                  stadium={stadium}
                  isSelected1={isSelected1}
                  isSelected2={isSelected2}
                  isSelected={isSelected}
                  onStadiumClick={onStadiumClick}
                  selectedStadium1={selectedStadium1}
                  selectedStadium2={selectedStadium2}
                />
              );
            })}
          </div>
          
          {/* Row 3 */}
          <div className="grid grid-cols-5 gap-3">
            {stadiums.slice(10, 15).map((stadium) => {
              const isSelected1 = selectedStadium1?.id === stadium.id;
              const isSelected2 = selectedStadium2?.id === stadium.id;
              const isSelected = isSelected1 || isSelected2;
              
              return (
                <StadiumCard 
                  key={stadium.id}
                  stadium={stadium}
                  isSelected1={isSelected1}
                  isSelected2={isSelected2}
                  isSelected={isSelected}
                  onStadiumClick={onStadiumClick}
                  selectedStadium1={selectedStadium1}
                  selectedStadium2={selectedStadium2}
                />
              );
            })}
          </div>
        </div>
        
        {/* Selection Status */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {selectedStadium1 && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-orange-100/50 backdrop-blur-sm rounded-lg border border-orange-200/50">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium text-orange-800">{selectedStadium1.team}</span>
              </div>
            )}
            
            {selectedStadium2 && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-red-100/50 backdrop-blur-sm rounded-lg border border-red-200/50">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-red-800">{selectedStadium2.team}</span>
              </div>
            )}
          </div>
          
          {(selectedStadium1 || selectedStadium2) && (
            <button
              onClick={() => {
                onStadiumClick(null); // This will reset selections
              }}
              className="px-3 py-1 text-xs bg-white/40 backdrop-blur-sm border border-white/50 rounded-lg hover:bg-white/50 transition-all duration-300 text-gray-600 hover:text-gray-800"
            >
              <i className="fas fa-times mr-1"></i>
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Stadium Card Component
const StadiumCard = ({ stadium, isSelected1, isSelected2, isSelected, onStadiumClick, selectedStadium1, selectedStadium2 }) => {
  return (
    <div
      onClick={() => onStadiumClick(stadium)}
      className={`relative cursor-pointer transform transition-all duration-300 hover:scale-105 group ${
        isSelected ? 'scale-110' : ''
      }`}
    >
      {/* Stadium Card */}
      <div className={`relative bg-white/30 backdrop-blur-xl rounded-2xl border ${
        isSelected1 ? 'border-orange-500 bg-orange-100/40' : 
        isSelected2 ? 'border-red-500 bg-red-100/40' : 
        'border-white/40 hover:border-white/60'
      } p-4 shadow-[inset_0_1px_4px_rgba(255,255,255,0.2)] hover:shadow-lg transition-all duration-300`}>
        
        {/* Glass highlight */}
        <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
        
        {/* Selection indicator */}
        {isSelected && (
          <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${
            isSelected1 ? 'bg-orange-500' : 'bg-red-500'
          }`}>
            {isSelected1 ? '1' : '2'}
          </div>
        )}
        
        <div className="relative z-10 text-center">
          {/* Team Logo */}
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 flex items-center justify-center overflow-hidden">
            <img 
              src={stadium.logo} 
              alt={stadium.team}
              className="w-10 h-10 object-contain"
              onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
            />
          </div>
          
          {/* Team Name */}
          <h4 className="font-bold text-gray-800 text-xs leading-tight mb-1">
            {stadium.team}
          </h4>
          
          {/* Stadium Name */}
          <p className="text-xs text-gray-600 truncate">
            {stadium.name.split(' ').slice(0, 2).join(' ')}
          </p>
        </div>
        
        {/* Hover effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
      
      {/* Connection arrow to next selected stadium */}
      {isSelected1 && selectedStadium2 && (
        <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
          <div className="flex items-center">
            <div className="w-8 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 animate-pulse"></div>
            <i className="fas fa-chevron-right text-red-500 text-xs animate-bounce ml-1"></i>
          </div>
        </div>
      )}
      
      {isSelected2 && selectedStadium1 && (
        <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 z-20">
          <div className="flex items-center">
            <i className="fas fa-chevron-left text-orange-500 text-xs animate-bounce mr-1"></i>
            <div className="w-8 h-0.5 bg-gradient-to-l from-red-500 to-orange-500 animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Interactive Tailgate Map Component
const TailgateMap = ({ stadiums, onStadiumClick, mapCenter, mapZoom, selectedStadium1, selectedStadium2, calculateDistance }) => {
  // Custom marker icon for stadiums
  const customMarkerIcon = (logoUrl, isSelected = false) => {
    return L.divIcon({
      html: `
        <div style="
          width: 40px;
          height: 40px;
          background: ${isSelected ? 'rgba(255, 127, 80, 0.8)' : 'rgba(255, 255, 255, 0.4)'};
          backdrop-filter: blur(20px);
          border: 2px solid ${isSelected ? 'rgba(255, 127, 80, 1)' : 'rgba(255, 255, 255, 0.6)'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
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

  const distance = selectedStadium1 && selectedStadium2 ? calculateDistance(selectedStadium1, selectedStadium2) : null;

  return (
    <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden">
      <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Distance Display */}
      {distance && (
        <div className="absolute top-4 left-4 z-20 bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 px-4 py-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <i className="fas fa-route text-orange-600"></i>
            <span className="font-bold text-gray-800">{distance} miles</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {selectedStadium1.team} ↔ {selectedStadium2.team}
          </div>
        </div>
      )}
      
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
          <TailgateMapControl stadiums={stadiums} onStadiumClick={onStadiumClick} />
          
          {/* Distance Line */}
          {selectedStadium1 && selectedStadium2 && (
            <Polyline
              positions={[
                [selectedStadium1.lat, selectedStadium1.lon],
                [selectedStadium2.lat, selectedStadium2.lon]
              ]}
              pathOptions={{
                color: '#ff6347',
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 10'
              }}
            />
          )}
          
          {stadiums.map(stadium => {
            const isSelected = selectedStadium1?.id === stadium.id || selectedStadium2?.id === stadium.id;
            return (
              <Marker
                key={stadium.id}
                position={[stadium.lat, stadium.lon]}
                icon={customMarkerIcon(stadium.logo, isSelected)}
                eventHandlers={{
                  click: () => onStadiumClick && onStadiumClick(stadium.id)
                }}
              >
                <Popup className="custom-popup">
                  <div className="bg-white/95 backdrop-blur-xl rounded-xl border border-white/50 p-4 min-w-48">
                    <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center space-x-3 mb-3">
                        <img 
                          src={stadium.logo} 
                          alt={stadium.team}
                          className="w-8 h-8 object-contain"
                          onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                        />
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">{stadium.team}</h3>
                          <p className="text-xs text-gray-600">{stadium.name}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Tailgates:</span>
                          <span className="font-medium text-gray-800">{Math.floor(Math.random() * 50) + 20}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fans Checked In:</span>
                          <span className="font-medium text-gray-800">{Math.floor(Math.random() * 500) + 100}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium text-gray-800">{stadium.city}</span>
                        </div>
                      </div>
                      
                      <button 
                        className="w-full mt-3 px-3 py-2 text-xs text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                        style={{
                          background: 'linear-gradient(135deg, #ff7f50, #ff6347, #ff4500)',
                          boxShadow: '0 2px 8px rgba(255, 127, 80, 0.3)'
                        }}
                      >
                        <i className="fas fa-fire mr-1"></i>
                        Find Tailgates
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

// Tailgate Activity Feed Component
const TailgateActivityFeed = ({ activities }) => {
  return (
    <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-6">
      <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        <h3 className="text-lg font-bold mb-4" style={{ background: 'linear-gradient(135deg, #ff7f50, #ff6347, #ff4500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Live Tailgate Activity
        </h3>
        
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div 
              key={index}
              className="relative bg-white/30 backdrop-blur-xl rounded-xl border border-white/40 p-4 hover:bg-white/40 transition-all duration-300"
            >
              <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="relative z-10 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/60">
                  <img 
                    src={activity.userPhoto} 
                    alt={activity.user}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="w-full h-full flex items-center justify-center text-white"
                    style={{
                      background: 'linear-gradient(135deg, #ff7f50, #ff6347)',
                      display: 'none'
                    }}
                  >
                    <i className="fas fa-user"></i>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-800">{activity.user}</span>
                    <span className="text-gray-600 text-sm">{activity.action}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                    <span><i className="fas fa-map-marker-alt mr-1"></i>{activity.stadium}</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
                
                {activity.type === 'check-in' && (
                  <div className="px-3 py-1 bg-green-100/50 backdrop-blur-sm rounded-lg border border-green-200/50">
                    <span className="text-xs font-medium text-green-800">+{activity.points} pts</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Tailgate Section Component
const TailgateSection = ({ professionalGradients, userPhotos }) => {
  // Stadium data for the 15 most popular teams
  const [stadiums] = useState([
    {
      id: 1,
      name: "Ohio Stadium",
      team: "Ohio State",
      logo: "/team_logos/Ohio_State.png",
      lat: 40.0016,
      lon: -83.0197,
      city: "Columbus, OH",
      address: "411 Woody Hayes Drive, Columbus, OH 43210"
    },
    {
      id: 2,
      name: "Sanford Stadium",
      team: "Georgia",
      logo: "/team_logos/Georgia.png",
      lat: 33.9498,
      lon: -83.3733,
      city: "Athens, GA",
      address: "100 Sanford Drive, Athens, GA 30602"
    },
    {
      id: 3,
      name: "Bryant-Denny Stadium",
      team: "Alabama",
      logo: "/team_logos/Alabama.png",
      lat: 33.2087,
      lon: -87.5504,
      city: "Tuscaloosa, AL",
      address: "920 Paul W Bryant Drive, Tuscaloosa, AL 35401"
    },
    {
      id: 4,
      name: "Darrell K Royal Stadium",
      team: "Texas",
      logo: "/team_logos/Texas.png",
      lat: 30.2837,
      lon: -97.7326,
      city: "Austin, TX",
      address: "2139 San Jacinto Blvd, Austin, TX 78712"
    },
    {
      id: 5,
      name: "Michigan Stadium",
      team: "Michigan",
      logo: "/team_logos/Michigan.png",
      lat: 42.2658,
      lon: -83.7487,
      city: "Ann Arbor, MI",
      address: "1201 S Main St, Ann Arbor, MI 48104"
    },
    {
      id: 6,
      name: "Notre Dame Stadium",
      team: "Notre Dame",
      logo: "/team_logos/Notre_Dame.png",
      lat: 41.6977,
      lon: -86.2335,
      city: "South Bend, IN",
      address: "Notre Dame, IN 46556"
    },
    {
      id: 7,
      name: "Beaver Stadium",
      team: "Penn State",
      logo: "/team_logos/Penn_State.png",
      lat: 40.8122,
      lon: -77.8561,
      city: "State College, PA",
      address: "University Park, PA 16802"
    },
    {
      id: 8,
      name: "Tiger Stadium",
      team: "LSU",
      logo: "/team_logos/LSU.png",
      lat: 30.4120,
      lon: -91.1838,
      city: "Baton Rouge, LA",
      address: "S Stadium Drive, Baton Rouge, LA 70803"
    },
    {
      id: 9,
      name: "Neyland Stadium",
      team: "Tennessee",
      logo: "/team_logos/Tennessee.png",
      lat: 35.9550,
      lon: -83.9250,
      city: "Knoxville, TN",
      address: "1600 Phillip Fulmer Way, Knoxville, TN 37916"
    },
    {
      id: 10,
      name: "Oklahoma Memorial Stadium",
      team: "Oklahoma",
      logo: "/team_logos/Oklahoma.png",
      lat: 35.2058,
      lon: -97.4423,
      city: "Norman, OK",
      address: "1185 Asp Ave, Norman, OK 73019"
    },
    {
      id: 11,
      name: "LA Memorial Coliseum",
      team: "USC",
      logo: "/team_logos/USC.png",
      lat: 34.0141,
      lon: -118.2878,
      city: "Los Angeles, CA",
      address: "3911 S Figueroa St, Los Angeles, CA 90037"
    },
    {
      id: 12,
      name: "Ben Hill Griffin Stadium",
      team: "Florida",
      logo: "/team_logos/Florida.png",
      lat: 29.6500,
      lon: -82.3425,
      city: "Gainesville, FL",
      address: "157 Gale Lemerand Drive, Gainesville, FL 32611"
    },
    {
      id: 13,
      name: "Kyle Field",
      team: "Texas A&M",
      logo: "/team_logos/Texas_AM.png",
      lat: 30.6103,
      lon: -96.3398,
      city: "College Station, TX",
      address: "756 Houston St, College Station, TX 77843"
    },
    {
      id: 14,
      name: "Memorial Stadium",
      team: "Clemson",
      logo: "/team_logos/Clemson.png",
      lat: 34.6787,
      lon: -82.8432,
      city: "Clemson, SC",
      address: "Avenue of Champions, Clemson, SC 29634"
    },
    {
      id: 15,
      name: "Autzen Stadium",
      team: "Oregon",
      logo: "/team_logos/Oregon.png",
      lat: 44.0583,
      lon: -123.0686,
      city: "Eugene, OR",
      address: "2700 Martin Luther King Jr Blvd, Eugene, OR 97401"
    }
  ]);

  const [mapCenter, setMapCenter] = useState([39.8283, -98.5795]); // Center of USA
  const [mapZoom, setMapZoom] = useState(4);
  const [selectedStadium1, setSelectedStadium1] = useState(null);
  const [selectedStadium2, setSelectedStadium2] = useState(null);

  // Calculate distance between two stadiums in miles
  const calculateDistance = (stadium1, stadium2) => {
    if (!stadium1 || !stadium2) return null;
    
    const lat1 = stadium1.lat;
    const lon1 = stadium1.lon;
    const lat2 = stadium2.lat;
    const lon2 = stadium2.lon;
    
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  };

  // Handle stadium navigation clicks
  const handleStadiumNavClick = (stadium) => {
    if (stadium === null) {
      // Clear selection
      setSelectedStadium1(null);
      setSelectedStadium2(null);
      setMapCenter([39.8283, -98.5795]);
      setMapZoom(4);
      return;
    }

    if (!selectedStadium1) {
      setSelectedStadium1(stadium);
      setMapCenter([stadium.lat, stadium.lon]);
      setMapZoom(10);
    } else if (!selectedStadium2) {
      setSelectedStadium2(stadium);
      // Center map between both stadiums
      const centerLat = (selectedStadium1.lat + stadium.lat) / 2;
      const centerLon = (selectedStadium1.lon + stadium.lon) / 2;
      setMapCenter([centerLat, centerLon]);
      
      // Adjust zoom based on distance
      const distance = calculateDistance(selectedStadium1, stadium);
      if (distance < 200) setMapZoom(8);
      else if (distance < 500) setMapZoom(7);
      else if (distance < 1000) setMapZoom(6);
      else setMapZoom(5);
    } else {
      // Reset and select new stadium
      setSelectedStadium1(stadium);
      setSelectedStadium2(null);
      setMapCenter([stadium.lat, stadium.lon]);
      setMapZoom(10);
    }
  };

  const handleStadiumClick = (stadiumId) => {
    const stadium = stadiums.find(s => s.id === stadiumId);
    if (stadium) {
      setMapCenter([stadium.lat, stadium.lon]);
      setMapZoom(12);
    }
  };

  // Mock tailgate activity data
  const [tailgateActivities] = useState([
    {
      user: "@BuckeyeFan22",
      userPhoto: userPhotos[0],
      action: "just checked in",
      stadium: "Ohio Stadium",
      time: "2 min ago",
      type: "check-in",
      points: 10
    },
    {
      user: "@RollTide85",
      userPhoto: userPhotos[1],
      action: "started a tailgate party",
      stadium: "Bryant-Denny Stadium",
      time: "5 min ago",
      type: "tailgate",
      points: 25
    },
    {
      user: "@DawgNation",
      userPhoto: userPhotos[2],
      action: "joined the mega tailgate",
      stadium: "Sanford Stadium",
      time: "12 min ago",
      type: "join",
      points: 15
    },
    {
      user: "@HookEm",
      userPhoto: userPhotos[3],
      action: "is grilling at Lot A",
      stadium: "DKR Stadium",
      time: "20 min ago",
      type: "activity",
      points: 5
    },
    {
      user: "@GoBlue23",
      userPhoto: userPhotos[4],
      action: "hosting pre-game festivities",
      stadium: "Michigan Stadium",
      time: "30 min ago",
      type: "host",
      points: 30
    }
  ]);

  return (
    <div className="py-12 tab-content">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4" style={{ 
          background: professionalGradients.orange, 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent', 
          backgroundClip: 'text' 
        }}>
          Game Day Tailgate Map
        </h2>
        <p className="text-gray-600">Find tailgates, meet fans, and track your squad at stadiums across the country</p>
      </div>

      {/* Stadium Navigation Grid */}
      <StadiumNavigationGrid 
        stadiums={stadiums}
        selectedStadium1={selectedStadium1}
        selectedStadium2={selectedStadium2}
        onStadiumClick={handleStadiumNavClick}
      />

      {/* Interactive Map */}
      <div className="mb-8">
        <TailgateMap 
          stadiums={stadiums}
          onStadiumClick={handleStadiumClick}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          selectedStadium1={selectedStadium1}
          selectedStadium2={selectedStadium2}
          calculateDistance={calculateDistance}
        />
      </div>

      {/* Map Controls */}
      <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-6 mb-8">
        <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-4" style={{ background: 'linear-gradient(135deg, #ff7f50, #ff6347, #ff4500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Quick Navigation
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => {
                setMapCenter([39.8283, -98.5795]);
                setMapZoom(4);
              }}
              className="px-4 py-2 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 text-sm font-medium text-gray-700"
            >
              <i className="fas fa-globe-americas mr-2" />
              Full USA
            </button>
            
            <button
              onClick={() => {
                setMapCenter([33.7490, -84.3880]);
                setMapZoom(6);
              }}
              className="px-4 py-2 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 text-sm font-medium text-gray-700"
            >
              <i className="fas fa-map-marker-alt mr-2" />
              Southeast
            </button>
            
            <button
              onClick={() => {
                setMapCenter([41.8781, -87.6298]);
                setMapZoom(6);
              }}
              className="px-4 py-2 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 text-sm font-medium text-gray-700"
            >
              <i className="fas fa-map-marker-alt mr-2" />
              Midwest
            </button>
            
            <button
              onClick={() => {
                setMapCenter([34.0522, -118.2437]);
                setMapZoom(6);
              }}
              className="px-4 py-2 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 text-sm font-medium text-gray-700"
            >
              <i className="fas fa-map-marker-alt mr-2" />
              West Coast
            </button>
          </div>
        </div>
      </div>

      {/* Live Tailgate Activity Feed */}
      <TailgateActivityFeed activities={tailgateActivities} />

      {/* Features Coming Soon */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-6">
          <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100/50 backdrop-blur-sm border border-orange-200/50 flex items-center justify-center">
              <i className="fas fa-users text-2xl text-orange-600"></i>
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Join Tailgates</h4>
            <p className="text-sm text-gray-600">Connect with fans and join tailgate parties at any stadium</p>
          </div>
        </div>

        <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-6">
          <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100/50 backdrop-blur-sm border border-red-200/50 flex items-center justify-center">
              <i className="fas fa-map-pin text-2xl text-red-600"></i>
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Check In</h4>
            <p className="text-sm text-gray-600">Let your squad know where you are on game day</p>
          </div>
        </div>

        <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-6">
          <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100/50 backdrop-blur-sm border border-yellow-200/50 flex items-center justify-center">
              <i className="fas fa-star text-2xl text-yellow-600"></i>
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Rate Spots</h4>
            <p className="text-sm text-gray-600">Share reviews of the best tailgate locations</p>
          </div>
        </div>
      </div>

      <style jsx>{`
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
    </div>
  );
};

export default TailgateSection;