import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { teamService } from '../../services/teamService';
import { gameService } from '../../services/gameService';
import { rankingsService } from '../../services/rankingsService';
import { newsService } from '../../services/newsService';

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
                    <h4 style="margin: 0 0 12px 0; font-weight: bold; background: linear-gradient(135deg, #228B22, #006633, #228B22); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        MAC Teams
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

// Team Performance Card Component
const TeamPerformanceCard = ({ team, rank, record, eloRating, talentRating, onTeamClick }) => {
    return (
        <div 
            className="relative bg-white/30 backdrop-blur-xl rounded-xl border border-white/40 p-4 shadow-[inset_0_1px_4px_rgba(255,255,255,0.2)] cursor-pointer hover:bg-white/40 transition-all duration-300"
            onClick={() => onTeamClick && onTeamClick(team.id)}
        >
            <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        {rank && (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)' }}>
                                {rank}
                            </div>
                        )}
                        <div className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 flex items-center justify-center overflow-hidden">
                            <img 
                                src={team.logos?.[0] || '/photos/ncaaf.png'} 
                                alt={team.school}
                                className="w-8 h-8 object-contain"
                                onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                            />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">{team.school}</h4>
                            <p className="text-xs text-gray-600">{team.abbreviation}</p>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <div className="text-sm font-bold text-gray-800">
                            {record ? `${record.wins}-${record.losses}` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Record</div>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="text-center">
                        <div className="font-semibold text-gray-700">{eloRating?.toFixed(0) || 'N/A'}</div>
                        <div className="text-gray-500">ELO Rating</div>
                    </div>
                    <div className="text-center">
                        <div className="font-semibold text-gray-700">{talentRating?.toFixed(1) || 'N/A'}</div>
                        <div className="text-gray-500">Talent</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Recent Games Component
const RecentGames = ({ games, teams, getTeamLogo, getTeamAbbreviation }) => {
    const formatGameDate = (dateString) => {
        if (!dateString) return 'TBD';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getGameStatus = (game) => {
        if (game.completed) return 'Final';
        if (game.start_date) {
            const gameDate = new Date(game.start_date);
            const now = new Date();
            if (gameDate > now) return 'Upcoming';
            return 'In Progress';
        }
        return 'Scheduled';
    };

    if (!games || games.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 flex items-center justify-center">
                    <i className="fas fa-calendar-alt text-2xl text-gray-400" />
                </div>
                <p className="text-gray-600">No recent games found</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {games.slice(0, 8).map((game, index) => (
                <div key={index} className="relative bg-white/30 backdrop-blur-xl rounded-xl border border-white/40 p-4">
                    <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <img 
                                        src={getTeamLogo(game.away_team || game.away_id)} 
                                        alt="Away Team"
                                        className="w-6 h-6 object-contain"
                                        onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                                    />
                                    <span className="font-medium text-sm text-gray-800">
                                        {getTeamAbbreviation(game.away_team || game.away_id, 'AWAY')}
                                    </span>
                                </div>
                                
                                <span className="text-gray-500 text-sm">@</span>
                                
                                <div className="flex items-center space-x-2">
                                    <img 
                                        src={getTeamLogo(game.home_team || game.home_id)} 
                                        alt="Home Team"
                                        className="w-6 h-6 object-contain"
                                        onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                                    />
                                    <span className="font-medium text-sm text-gray-800">
                                        {getTeamAbbreviation(game.home_team || game.home_id, 'HOME')}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <div className="text-xs font-semibold text-gray-700">
                                    {getGameStatus(game)}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {formatGameDate(game.start_date)}
                                </div>
                            </div>
                        </div>
                        
                        {game.completed && (game.away_points !== undefined || game.home_points !== undefined) && (
                            <div className="flex justify-center space-x-4 text-lg font-bold">
                                <span className="text-gray-800">{game.away_points || 0}</span>
                                <span className="text-gray-500">-</span>
                                <span className="text-gray-800">{game.home_points || 0}</span>
                            </div>
                        )}
                        
                        {game.venue && (
                            <div className="text-xs text-gray-500 text-center mt-2">
                                <i className="fas fa-map-marker-alt mr-1" />
                                {game.venue}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Conference News Component
const ConferenceNews = ({ news }) => {
    const formatNewsDate = (dateString) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleNewsClick = (article) => {
        if (article.url) {
            window.open(article.url, '_blank', 'noopener,noreferrer');
        } else if (article.link) {
            window.open(article.link, '_blank', 'noopener,noreferrer');
        }
    };

    if (!news || news.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 flex items-center justify-center">
                    <i className="fas fa-newspaper text-2xl text-gray-400" />
                </div>
                <p className="text-gray-600">No recent news found</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {news.slice(0, 6).map((article, index) => (
                <div 
                    key={index} 
                    className="relative bg-white/30 backdrop-blur-xl rounded-xl border border-white/40 p-4 cursor-pointer hover:bg-white/40 transition-all duration-300"
                    onClick={() => handleNewsClick(article)}
                >
                    <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-start space-x-4">
                            {(article.image || article.urlToImage) && (
                                <div className="flex-shrink-0">
                                    <img 
                                        src={article.image || article.urlToImage} 
                                        alt={article.title}
                                        className="w-16 h-16 object-cover rounded-lg"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2">
                                    {article.title}
                                </h4>
                                
                                {article.description && (
                                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                        {article.description}
                                    </p>
                                )}
                                
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">{article.source?.name || article.source || 'MAC Network'}</span>
                                    <span className="text-gray-400">{formatNewsDate(article.publishedAt || article.date)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Interactive Conference Map Component
const ConferenceMap = ({ teams, onTeamClick, mapCenter, mapZoom }) => {
    // Custom marker icon for MAC teams
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
                                position={[team.location.latitude || 41.0, team.location.longitude || -84.0]}
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
                                                    <span className="font-medium text-gray-800">MAC</span>
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
const RecruitingTracker = ({ recruits, teams }) => {
    const getPositionIcon = (position) => {
        const pos = position?.toLowerCase() || 'unknown';
        if (pos.includes('qb')) return 'fas fa-crosshairs';
        if (pos.includes('rb') || pos.includes('fb')) return 'fas fa-running';
        if (pos.includes('wr') || pos.includes('te')) return 'fas fa-hands';
        if (pos.includes('ol') || pos.includes('dl')) return 'fas fa-shield-alt';
        if (pos.includes('lb')) return 'fas fa-fist-raised';
        if (pos.includes('db') || pos.includes('cb') || pos.includes('s')) return 'fas fa-eye';
        if (pos.includes('k') || pos.includes('p')) return 'fas fa-bullseye';
        if (pos.includes('class')) return 'fas fa-graduation-cap';
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
        if (pos.includes('class')) return 'text-blue-700';
        return 'text-gray-500';
    };

    const getTeamLogo = (teamName) => {
        const team = teams.find(t => t.school === teamName);
        return team?.logos?.[0] || '/photos/ncaaf.png';
    };

    if (!recruits || recruits.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 flex items-center justify-center">
                    <i className="fas fa-users text-2xl text-gray-400" />
                </div>
                <p className="text-gray-600">No recruiting data found</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {recruits.slice(0, 10).map((recruit, index) => (
                <div key={index} className="relative">
                    <div className="relative bg-white/30 backdrop-blur-xl rounded-xl border border-white/40 p-4 shadow-[inset_0_1px_4px_rgba(255,255,255,0.2)]">
                        <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 flex items-center justify-center overflow-hidden">
                                        <img 
                                            src={getTeamLogo(recruit.team || recruit.committedTo)} 
                                            alt={recruit.team}
                                            className="w-8 h-8 object-contain"
                                            onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                                        />
                                    </div>
                                    
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-sm">
                                            {recruit.name || `${recruit.team || recruit.committedTo} Class`}
                                        </h4>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-medium text-gray-600">{recruit.position}</span>
                                            <span className="text-xs text-gray-500">•</span>
                                            <span className="text-xs text-gray-500">{recruit.team || recruit.committedTo}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <StarRating rating={recruit.rating || 3} />
                                    <p className="text-xs text-gray-500 mt-1">#{recruit.rank}</p>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-600">
                                    {recruit.school || 'Various High Schools'}
                                </span>
                                <span className="text-gray-500">
                                    {recruit.points && `${recruit.points} pts`}
                                </span>
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

    if (!teamTalent || teamTalent.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 flex items-center justify-center">
                    <i className="fas fa-chart-bar text-2xl text-gray-400" />
                </div>
                <p className="text-gray-600">No talent data available</p>
            </div>
        );
    }

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
                                    <h4 className="font-bold text-gray-800 text-sm">{team.team || team.school || 'Unknown Team'}</h4>
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

const MAC = () => {
  // State management - mirroring BigTen component structure
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [standings, setStandings] = useState([]);
  const [news, setNews] = useState([]);
  const [recruits, setRecruits] = useState([]);
  const [teamTalent, setTeamTalent] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Map');
  const [mapCenter, setMapCenter] = useState([41.0, -84.0]); // Great Lakes region for MAC
  const [mapZoom, setMapZoom] = useState(6);

  const categories = ['Map', 'Standings', 'Talent Rankings', 'Recent Games', 'Rankings', 'News', 'Recruiting'];

  useEffect(() => {
    loadMACData();
  }, []);

  const loadMACData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log("Starting MAC data fetch process...");
      
      // Fetch teams using the proper service that filters by conference
      const allTeams = await teamService.getTeams();
      console.log("All teams fetched:", allTeams.length);
      
      const macTeams = allTeams.filter(team => 
        team.conference === "Mid-American Conference" || 
        team.conference === "MAC" ||
        team.conference?.includes("Mid-American") ||
        team.conference?.includes("MAC")
      );
      console.log("MAC teams found:", macTeams.map(t => t.school));
      
      const teamsWithLocations = macTeams.filter(team =>
          team.location && team.location.latitude && team.location.longitude
      );

      if (teamsWithLocations.length === 0) {
          console.warn("No MAC teams with location data found, using all MAC teams");
          setTeams(macTeams);
      } else {
          console.log(`Found ${teamsWithLocations.length} MAC teams with locations`);
          setTeams(teamsWithLocations);
      }

      if (teamsWithLocations.length > 0) {
          const latSum = teamsWithLocations.reduce((sum, team) => sum + team.location.latitude, 0);
          const lngSum = teamsWithLocations.reduce((sum, team) => sum + team.location.longitude, 0);
          setMapCenter([latSum / teamsWithLocations.length, lngSum / teamsWithLocations.length]);
      } else {
          // Use default MAC region center (Great Lakes area)
          setMapCenter([41.0, -84.0]);
      }

      // Fetch team talent data
      try {
          console.log("Fetching team talent data");
          const talentData = await teamService.getTeamTalent();
          
          if (talentData && talentData.length > 0) {
              console.log("Raw talent data:", talentData);
              // Filter for MAC teams and sort by talent score (highest to lowest)
              const macTalent = talentData
                  .filter(talentTeam => {
                      const teamName = talentTeam.team || talentTeam.school;
                      return macTeams.some(t => 
                          t.school === teamName || 
                          t.displayName === teamName ||
                          t.mascot === teamName ||
                          t.abbreviation === teamName
                      );
                  })
                  .map(talentTeam => ({
                      ...talentTeam,
                      team: talentTeam.team || talentTeam.school,
                      school: talentTeam.school || talentTeam.team
                  }))
                  .sort((a, b) => (b.talent || 0) - (a.talent || 0));
              
              setTeamTalent(macTalent);
              console.log("MAC talent data:", macTalent);
          } else {
              console.log("No talent data returned from API");
              setTeamTalent([]);
          }
      } catch (error) {
          console.error("Error fetching talent data:", error);
          setTeamTalent([]);
      }

      // Fetch news using the legacy file approach
      try {
          console.log("Fetching news with fetchNews method...");
          const newsData = await newsService.fetchNews();
          
          if (newsData && newsData.articles && newsData.articles.length > 0) {
              console.log("Successfully fetched news articles:", newsData.articles.length);
              // Sort by published date (newest first) if publishedAt exists
              const sortedArticles = [...newsData.articles].sort((a, b) => {
                  if (a.publishedAt && b.publishedAt) {
                      return new Date(b.publishedAt) - new Date(a.publishedAt);
                  }
                  return 0;
              });
              setNews(sortedArticles.slice(0, 10)); // Show top 10 news articles
          } else {
              console.error("News API returned empty or invalid data:", newsData);
              setNews([]);
          }
      } catch (error) {
          console.error("Error fetching news:", error);
          setNews([]);
      }

      // Fetch actual individual recruits
      try {
          console.log("Fetching individual recruits...");
          let recruitsData = await teamService.getAllRecruits();
          
          if (!recruitsData || recruitsData.length === 0) {
              console.log("No data from teamService, trying rankingsService...");
              recruitsData = await rankingsService.getPlayerRecruitingRankings(2024);
          }
          
          if (recruitsData && recruitsData.length > 0) {
              // Filter for MAC commits and sort by rating
              const macRecruits = recruitsData
                  .filter(recruit => 
                      recruit.committedTo && 
                      macTeams.some(t => 
                          t.school === recruit.committedTo || 
                          t.displayName === recruit.committedTo ||
                          t.mascot === recruit.committedTo
                      )
                  )
                  .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                  .slice(0, 30); // Show top 30 recruits
              
              setRecruits(macRecruits);
              console.log("MAC recruits:", macRecruits);
          } else {
              console.log("No recruit data found, trying team recruiting rankings...");
              // Final fallback to recruiting team rankings if individual recruits fail
              const teamRecruitingData = await teamService.getRecruitingRankings();
              if (teamRecruitingData && teamRecruitingData.length > 0) {
                  const macTeamRecruits = teamRecruitingData
                      .filter(recruit => 
                          macTeams.some(t => 
                              t.school === recruit.team || 
                              t.displayName === recruit.team
                          )
                      )
                      .sort((a, b) => a.rank - b.rank);
                  
                  setRecruits(macTeamRecruits);
              }
          }
      } catch (error) {
          console.error("Error fetching recruits:", error);
          setRecruits([]);
      }

      // Fetch AP Rankings
      try {
          console.log("Fetching AP Rankings...");
          const apRankings = await rankingsService.getAPPoll();
          if (apRankings && apRankings.length > 0) {
              console.log("AP Rankings data:", apRankings);
              setRankings(apRankings);
          } else {
              console.log("No AP rankings data available");
              setRankings([]);
          }
      } catch (error) {
          console.error("Error fetching AP rankings:", error);
          setRankings([]);
      }

      // Fetch team records for standings
      console.log("Fetching records for MAC teams...");
      
      try {
          // First approach - try to get all records at once using gameService
          const allRecords = await gameService.getRecords(2024); // Get all records for 2024 season
          console.log("All records fetched:", allRecords);
          console.log("Sample record structure:", allRecords?.[0]);
          
          // Map MAC teams with their records
          const standingsData = macTeams.map(team => {
              // Find the record for this team using the correct field from API
              const teamRecord = allRecords?.find(r => {
                  return r.team === team.school || 
                         r.team === team.displayName ||
                         r.team === team.abbreviation;
              }) || {};
              
              console.log(`Record for ${team.school}:`, teamRecord);
              
              return {
                  id: team.id,
                  school: team.school,
                  mascot: team.mascot,
                  logo: team.logos?.[0],
                  color: team.color,
                  conference: teamRecord.conferenceGames || { wins: 0, losses: 0, ties: 0 },
                  overall: teamRecord.total || { wins: 0, losses: 0, ties: 0 },
                  expectedWins: teamRecord.expectedWins,
                  homeRecord: teamRecord.homeGames || { wins: 0, losses: 0, ties: 0 },
                  awayRecord: teamRecord.awayGames || { wins: 0, losses: 0, ties: 0 },
                  postseasonRecord: teamRecord.postseason || { wins: 0, losses: 0, ties: 0 }
              };
          });
          
          // Sort by conference win percentage (most wins first)
          const sortedStandings = standingsData.sort((a, b) => {
              const aConfTotal = a.conference.wins + a.conference.losses + (a.conference.ties || 0);
              const bConfTotal = b.conference.wins + b.conference.losses + (b.conference.ties || 0);
              
              const aWinPct = aConfTotal > 0 ? a.conference.wins / aConfTotal : 0;
              const bWinPct = bConfTotal > 0 ? b.conference.wins / bConfTotal : 0;
              
              // First sort by conference win percentage
              if (Math.abs(bWinPct - aWinPct) > 0.001) {
                  return bWinPct - aWinPct;
              }
              
              // If tied in conference percentage, sort by most conference wins
              if (b.conference.wins !== a.conference.wins) {
                  return b.conference.wins - a.conference.wins;
              }
              
              // If still tied, sort by overall win percentage
              const aOverallTotal = a.overall.wins + a.overall.losses + (a.overall.ties || 0);
              const bOverallTotal = b.overall.wins + b.overall.losses + (b.overall.ties || 0);
              
              const aOverallWinPct = aOverallTotal > 0 ? a.overall.wins / aOverallTotal : 0;
              const bOverallWinPct = bOverallTotal > 0 ? b.overall.wins / bOverallTotal : 0;
              
              return bOverallWinPct - aOverallWinPct;
          });
          
          console.log("Sorted standings:", sortedStandings);
          setStandings(sortedStandings);
          
      } catch (error) {
          console.error("Error fetching all records:", error);
          
          // Fallback: Fetch individual team records
          console.log("Falling back to individual record fetching...");
          const fallbackStandings = await Promise.all(
              macTeams.map(async (team) => {
                  try {
                      console.log(`Trying to fetch records for: ${team.school}`);
                      
                      let records = null;
                      
                      try {
                          records = await teamService.getTeamRecords(team.school, 2024);
                          console.log(`Team records for ${team.school}:`, records);
                      } catch (err) {
                          console.log(`Failed with school name, trying display name for ${team.school}`);
                          try {
                              records = await teamService.getTeamRecords(team.displayName, 2024);
                          } catch (err2) {
                              console.log(`Failed with display name, trying abbreviation for ${team.school}`);
                              records = await teamService.getTeamRecords(team.abbreviation, 2024);
                          }
                      }
                      
                      const teamRecord = Array.isArray(records) ? records[0] : records;
                      console.log(`Final record for ${team.school}:`, teamRecord);
                      
                      return {
                          id: team.id,
                          school: team.school,
                          mascot: team.mascot,
                          logo: team.logos?.[0],
                          color: team.color,
                          conference: {
                              wins: teamRecord?.conferenceGames?.wins || 0,
                              losses: teamRecord?.conferenceGames?.losses || 0,
                              ties: teamRecord?.conferenceGames?.ties || 0
                          },
                          overall: {
                              wins: teamRecord?.total?.wins || 0,
                              losses: teamRecord?.total?.losses || 0,
                              ties: teamRecord?.total?.ties || 0
                          },
                          expectedWins: teamRecord?.expectedWins,
                          homeRecord: teamRecord?.homeGames,
                          awayRecord: teamRecord?.awayGames,
                          postseasonRecord: teamRecord?.postseason
                      };
                  } catch (error) {
                      console.error(`Error fetching records for ${team.school}:`, error);
                      return {
                          id: team.id,
                          school: team.school,
                          mascot: team.mascot,
                          logo: team.logos?.[0],
                          color: team.color,
                          conference: { wins: 0, losses: 0, ties: 0 },
                          overall: { wins: 0, losses: 0, ties: 0 }
                      };
                  }
              })
          );
          
          const sortedFallback = fallbackStandings.sort((a, b) => {
              const aConfTotal = a.conference.wins + a.conference.losses + (a.conference.ties || 0);
              const bConfTotal = b.conference.wins + b.conference.losses + (b.conference.ties || 0);
              
              const aWinPct = aConfTotal > 0 ? a.conference.wins / aConfTotal : 0;
              const bWinPct = bConfTotal > 0 ? b.conference.wins / bConfTotal : 0;
              
              if (Math.abs(bWinPct - aWinPct) > 0.001) {
                  return bWinPct - aWinPct;
              }
              
              if (b.conference.wins !== a.conference.wins) {
                  return b.conference.wins - a.conference.wins;
              }
              
              return b.overall.wins - a.overall.wins;
          });
          
          console.log("Fallback sorted standings:", sortedFallback);
          setStandings(sortedFallback);
      }

      // Load recent games for MAC teams
      try {
          const currentYear = 2024;
          const recentGames = await gameService.getGames(currentYear, null, 'regular', null, null, null, 'Mid-American Conference');
          const macGames = recentGames.filter(game => 
              macTeams.some(t => t.school === game.home_team || t.school === game.away_team)
          ).slice(0, 20); // Get the most recent 20 games
          setGames(macGames);
      } catch (error) {
          console.error("Error fetching games:", error);
          setGames([]);
      }

    } catch (error) {
      setErrorMessage(error.message);
      console.error('Error loading MAC data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTeamLogo = (teamId) => {
    let team = teams.find(t => t.id === teamId);
    
    if (!team && typeof teamId === 'string') {
      team = teams.find(t => t.school === teamId || t.mascot === teamId);
    }
    
    return team?.logos?.[0] || '/photos/ncaaf.png';
  };

  const getTeamAbbreviation = (teamId, fallback) => {
    let team = teams.find(t => t.id === teamId);
    
    if (!team && typeof teamId === 'string') {
      team = teams.find(t => t.school === teamId || t.mascot === teamId);
    }
    
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
    const teamStanding = standings.find(s => s.id === teamId || s.school === teamId);
    if (teamStanding) {
      return {
        wins: teamStanding.overall?.wins || teamStanding.wins || 0,
        losses: teamStanding.overall?.losses || teamStanding.losses || 0,
        ties: teamStanding.overall?.ties || teamStanding.ties || 0
      };
    }
    return {
      wins: 0,
      losses: 0,
      ties: 0
    };
  };

  const getTeamElo = (teamSchool) => {
    const talent = teamTalent.find(t => 
      (t.school === teamSchool) || (t.team === teamSchool)
    );
    return talent?.elo || null;
  };

  const getTeamTalent = (teamSchool) => {
    const talent = teamTalent.find(t => 
      (t.school === teamSchool) || (t.team === teamSchool)
    );
    return talent?.talent || null;
  };

  const handleTeamClick = (teamId) => {
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
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent mx-auto" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)' }}></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <div className="mt-6 space-y-2">
              <p className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Loading MAC Conference...
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
              <h3 className="font-bold">Error Loading MAC Data</h3>
              <p className="text-sm mt-2">{errorMessage}</p>
              <button 
                onClick={loadMACData}
                className="mt-4 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)' }}
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
          background: linear-gradient(135deg, #228B22, #006633, #228B22);
        }
        .gradient-text {
          background: linear-gradient(135deg, #228B22, #006633, #228B22);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .icon-gradient {
          background: linear-gradient(135deg, #228B22, #006633, #228B22);
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

      {/* Floating Orbs Background - MAC themed */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-5 blur-3xl animate-pulse" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)' }}></div>
        <div className="absolute top-60 right-20 w-48 h-48 rounded-full opacity-3 blur-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)', animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-80 h-80 rounded-full opacity-4 blur-3xl animate-pulse" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)', animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-56 h-56 rounded-full opacity-3 blur-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)', animationDelay: '3s' }}></div>
      </div>

      <div className="w-[97%] mx-auto relative z-10">
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
                <i className="fas fa-trophy text-3xl relative z-10 drop-shadow-lg" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}></i>
              </div>
              {/* Floating particles */}
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full opacity-60 animate-ping" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)' }}></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full opacity-40 animate-ping animation-delay-500" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)' }}></div>
            </div>
          </div>
          
          {/* Enhanced Title with Liquid Glass Effect */}
          <div className="relative mb-8">
            <h1 className="text-6xl md:text-7xl font-black mb-6 relative">
              <span className="drop-shadow-2xl" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>MAC</span>
              <br />
              <span className="drop-shadow-2xl" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Conference</span>
              {/* Animated underline */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 rounded-full opacity-60 animate-pulse" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)' }}></div>
            </h1>
          </div>
          
          {/* Stats Badge with Liquid Glass */}
          <div className="inline-flex items-center space-x-4 px-8 py-4 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2),0_15px_35px_rgba(0,0,0,0.1)]">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)' }}></div>
              <span className="text-lg font-bold" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{teams.length} Teams</span>
            </div>
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <span className="text-lg text-gray-700 font-medium">2024 Season</span>
          </div>
        </div>

        {/* Liquid Glass Category Controls */}
        <div className="relative mb-8">
          <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
            {/* Highlight overlay */}
            <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
            
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
                      <div className="absolute inset-0 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)' }}></div>
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
                  <h2 className="text-2xl font-bold mb-4" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Mid-American Conference Map
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
                    <h3 className="text-lg font-bold mb-4" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      Quick Navigation
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <button
                        onClick={() => {
                          setMapCenter([41.0, -84.0]);
                          setMapZoom(6);
                        }}
                        className="px-4 py-2 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 text-sm font-medium text-gray-700"
                      >
                        <i className="fas fa-globe-americas mr-2" />
                        Full View
                      </button>
                      
                      <button
                        onClick={() => {
                          setMapCenter([42.0, -84.0]);
                          setMapZoom(7);
                        }}
                        className="px-4 py-2 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 text-sm font-medium text-gray-700"
                      >
                        <i className="fas fa-map-marker-alt mr-2" />
                        East Division
                      </button>
                      
                      <button
                        onClick={() => {
                          setMapCenter([40.0, -84.0]);
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
                  <h2 className="text-2xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Team Talent Rankings
                  </h2>
                  
                  <TalentRatings 
                    teamTalent={teamTalent}
                    maxTalent={teamTalent && teamTalent.length > 0 ? Math.max(...teamTalent.map(t => t.talent || 0)) : 1000}
                  />
                </div>
              </div>
            )}

            {selectedCategory === 'Recruiting' && (
              <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
                <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Top Recruits
                  </h2>
                  
                  <RecruitingTracker recruits={recruits} teams={teams} />
                </div>
              </div>
            )}

            {selectedCategory === 'Standings' && (
              <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
                <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Conference Standings
                  </h2>
                  
                  {standings && standings.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gray-300">
                            <th className="text-left py-3 px-4 font-bold text-gray-800">Team</th>
                            <th className="text-center py-3 px-4 font-bold text-gray-800">Conference</th>
                            <th className="text-center py-3 px-4 font-bold text-gray-800">Pct</th>
                            <th className="text-center py-3 px-4 font-bold text-gray-800">Overall</th>
                            <th className="text-center py-3 px-4 font-bold text-gray-800">Pct</th>
                            <th className="text-center py-3 px-4 font-bold text-gray-800">Home</th>
                            <th className="text-center py-3 px-4 font-bold text-gray-800">Away</th>
                          </tr>
                        </thead>
                        <tbody>
                          {standings.map((team, index) => {
                            const confTotal = (team.conference?.wins || 0) + (team.conference?.losses || 0) + (team.conference?.ties || 0);
                            const overallTotal = (team.overall?.wins || 0) + (team.overall?.losses || 0) + (team.overall?.ties || 0);
                            
                            const confWinPct = confTotal > 0 ? (team.conference?.wins || 0) / confTotal : 0;
                            const overallWinPct = overallTotal > 0 ? (team.overall?.wins || 0) / overallTotal : 0;
                            
                            // Determine trophy icon and colors based on performance
                            const isChampion = index === 0; // First place team - Conference champion
                            
                            // Performance-based color coding for ranks and percentages
                            const isGoodRecord = confWinPct >= 0.7; // 70% or higher - Green
                            const isPoorRecord = confWinPct < 0.4; // Below 40% - Red
                            const isNeutralRecord = confWinPct >= 0.4 && confWinPct < 0.7; // 40-70% - Neutral
                            
                            // Overall performance for additional context
                            const isGoodOverall = overallWinPct >= 0.7;
                            const isPoorOverall = overallWinPct < 0.4;
                            const isNeutralOverall = overallWinPct >= 0.4 && overallWinPct < 0.7;
                            
                            // Modern gradient definitions
                            const greenGradient = 'linear-gradient(135deg, #10B981, #059669, #10B981)'; // Good performance
                            const redGradient = 'linear-gradient(135deg, #EF4444, #DC2626, #EF4444)'; // Poor performance
                            const neutralGradient = 'linear-gradient(135deg, #6B7280, #4B5563, #6B7280)'; // Average performance
                            const championGradient = 'linear-gradient(135deg, #228B22, #006633, #228B22)'; // MAC Conference champion
                            
                            // Trophy and gradient styles as React style objects
                            let trophyIconStyle = {};
                            let confPercentageStyle = {};
                            let overallPercentageStyle = {};
                            let rankStyle = {};
                            let showTrophy = false;
                            
                            // Rank styling based on conference performance
                            if (isGoodRecord) {
                              rankStyle = { background: greenGradient };
                            } else if (isPoorRecord) {
                              rankStyle = { background: redGradient };
                            } else {
                              rankStyle = { background: neutralGradient };
                            }
                            
                            // Conference percentage styling
                            if (isGoodRecord) {
                              confPercentageStyle = { 
                                background: greenGradient, 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent', 
                                backgroundClip: 'text' 
                              };
                            } else if (isPoorRecord) {
                              confPercentageStyle = { 
                                background: redGradient, 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent', 
                                backgroundClip: 'text' 
                              };
                            } else {
                              confPercentageStyle = { 
                                background: neutralGradient, 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent', 
                                backgroundClip: 'text' 
                              };
                            }
                            
                            // Overall percentage styling
                            if (isGoodOverall) {
                              overallPercentageStyle = { 
                                background: greenGradient, 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent', 
                                backgroundClip: 'text' 
                              };
                            } else if (isPoorOverall) {
                              overallPercentageStyle = { 
                                background: redGradient, 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent', 
                                backgroundClip: 'text' 
                              };
                            } else {
                              overallPercentageStyle = { 
                                background: neutralGradient, 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent', 
                                backgroundClip: 'text' 
                              };
                            }
                            
                            // Trophy logic for Conference Champion
                            if (isChampion) {
                              trophyIconStyle = { 
                                background: championGradient, 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent', 
                                backgroundClip: 'text',
                                filter: 'drop-shadow(0 2px 4px rgba(34, 139, 34, 0.4))'
                              };
                              showTrophy = true;
                            }
                            
                            return (
                              <tr key={team.id} className={`border-b border-gray-200 hover:bg-white/20 transition-colors ${index % 2 === 0 ? 'bg-white/10' : ''}`}>
                                <td className="py-3 px-4">
                                  <div className="flex items-center space-x-3">
                                    {/* Dynamic Rank Badge with Trophy */}
                                    <div className="relative flex items-center space-x-2">
                                      <div 
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg" 
                                        style={rankStyle}
                                      >
                                        #{index + 1}
                                      </div>
                                      
                                      {/* Trophy Icon for Conference Champion */}
                                      {showTrophy && (
                                        <i 
                                          className="fas fa-trophy text-lg animate-pulse" 
                                          style={trophyIconStyle}
                                          title={isChampion ? 'Conference Champion' : 'Strong Performance'}
                                        ></i>
                                      )}
                                    </div>
                                    
                                    <img 
                                      src={team.logo || '/photos/ncaaf.png'} 
                                      alt={team.school}
                                      className="w-6 h-6 object-contain"
                                      onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                                    />
                                    <span 
                                      className="font-semibold text-lg text-gray-800"
                                    >
                                      {team.school}
                                    </span>
                                  </div>
                                </td>
                                <td className="text-center py-3 px-4 font-medium">
                                  <span className="text-gray-800">
                                    {(team.conference?.wins || 0)}-{(team.conference?.losses || 0)}{(team.conference?.ties || 0) > 0 ? `-${team.conference.ties}` : ''}
                                  </span>
                                </td>
                                <td className="text-center py-3 px-4 font-bold">
                                  <span style={confPercentageStyle}>
                                    {confTotal > 0 ? (confWinPct * 100).toFixed(1) : '0.0'}%
                                  </span>
                                </td>
                                <td className="text-center py-3 px-4 font-medium">
                                  <span className="text-gray-800">
                                    {(team.overall?.wins || 0)}-{(team.overall?.losses || 0)}{(team.overall?.ties || 0) > 0 ? `-${team.overall.ties}` : ''}
                                  </span>
                                </td>
                                <td className="text-center py-3 px-4 font-bold">
                                  <span style={overallPercentageStyle}>
                                    {overallTotal > 0 ? (overallWinPct * 100).toFixed(1) : '0.0'}%
                                  </span>
                                </td>
                                <td className="text-center py-3 px-4 font-medium">
                                  <span className="text-gray-800">
                                    {team.homeRecord?.wins || 0}-{team.homeRecord?.losses || 0}
                                  </span>
                                </td>
                                <td className="text-center py-3 px-4 font-medium">
                                  <span className="text-gray-800">
                                    {team.awayRecord?.wins || 0}-{team.awayRecord?.losses || 0}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 flex items-center justify-center">
                        <i className="fas fa-table text-2xl text-gray-400" />
                      </div>
                      <p className="text-gray-600 mb-4">No standings data available</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300"
                      >
                        Refresh Data
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedCategory === 'Recent Games' && (
              <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
                <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #228B22, #006633, #228B22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
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
                  
                  {rankings && rankings.length > 0 ? (
                    <div className="space-y-4">
                      {rankings.filter(rank => 
                        teams.some(team => 
                          team.school.toLowerCase().includes(rank.school?.toLowerCase()) ||
                          rank.school?.toLowerCase().includes(team.school.toLowerCase()) ||
                          team.displayName?.toLowerCase().includes(rank.school?.toLowerCase()) ||
                          rank.school?.toLowerCase().includes(team.displayName?.toLowerCase())
                        )
                      ).map((ranking, index) => {
                        const team = teams.find(t => 
                          t.school.toLowerCase().includes(ranking.school?.toLowerCase()) ||
                          ranking.school?.toLowerCase().includes(t.school.toLowerCase()) ||
                          t.displayName?.toLowerCase().includes(ranking.school?.toLowerCase()) ||
                          ranking.school?.toLowerCase().includes(t.displayName?.toLowerCase())
                        );
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
                                <div className="text-sm font-semibold text-gray-700">{ranking.points || ranking.votes || 'N/A'} pts</div>
                                <div className="text-xs text-gray-500">{ranking.firstPlaceVotes || ranking.first_place_votes || 0} first place</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 flex items-center justify-center">
                        <i className="fas fa-trophy text-2xl text-gray-400" />
                      </div>
                      <p className="text-gray-600">No MAC teams in current AP Top 25</p>
                    </div>
                  )}
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
                  src="/photos/Mid-American.png" 
                  alt="Mid-American Conference"
                  className="w-32 h-32 mx-auto mb-4 object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Mid-American Conference</h3>
                <p className="text-gray-600 text-sm">Est. 1946 • 12 Teams</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
              <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
              
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
                      {rankings && rankings.length > 0 ? rankings.filter(rank => 
                        teams.some(team => 
                          team.school.toLowerCase().includes(rank.school?.toLowerCase()) ||
                          rank.school?.toLowerCase().includes(team.school.toLowerCase())
                        )
                      ).length : 0}
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

      {/* Debug information */}
      <div className="hidden">
        {/*
        console.log("=== DEBUG INFO ===");
        console.log("Teams:", teams.length);
        console.log("TeamTalent:", teamTalent.length);
        console.log("Rankings:", rankings.length);
        console.log("News:", news.length);
        console.log("Games:", games.length);
        console.log("Standings:", standings.length);
        if (standings.length > 0) {
          console.log("Sample standing:", standings[0]);
        }
        console.log("==================");
        */}
      </div>
    </div>
  );
};

export default MAC;