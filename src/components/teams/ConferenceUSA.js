import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { teamService } from '../../services/teamService';
import { gameService } from '../../services/gameService';
import { rankingsService } from '../../services/rankingsService';
import { newsService } from '../../services/newsService';
import { fetchYouTubeData } from '../../services/core';

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
                    <h4 style="margin: 0 0 12px 0; font-weight: bold; background: linear-gradient(135deg, #002868, #BF0A30, #002868); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        C-USA Teams
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
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)' }}>
                                {rank}
                            </div>
                        )}
                        <div 
                            className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-white/70 transition-all duration-300"
                            onClick={(e) => {
                                e.stopPropagation();
                                localStorage.setItem('selectedTeamData', JSON.stringify(team));
                                window.location.hash = `team-detail-${team.id}`;
                            }}
                        >
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
                                    <span className="text-sm font-medium">{getTeamAbbreviation(game.away_team || game.away_id)}</span>
                                </div>
                                
                                <span className="text-gray-500">@</span>
                                
                                <div className="flex items-center space-x-2">
                                    <img 
                                        src={getTeamLogo(game.home_team || game.home_id)} 
                                        alt="Home Team"
                                        className="w-6 h-6 object-contain"
                                        onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                                    />
                                    <span className="text-sm font-medium">{getTeamAbbreviation(game.home_team || game.home_id)}</span>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <div className="text-sm font-bold">
                                    {game.completed ? 
                                        `${game.away_points || 0}-${game.home_points || 0}` : 
                                        formatGameDate(game.start_date)
                                    }
                                </div>
                                <div className="text-xs text-gray-500">{getGameStatus(game)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Enhanced News Component with YouTube Videos
const ConferenceNews = ({ news, videos }) => {
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'news', 'videos'

    const formatNewsDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (duration) => {
        if (!duration) return '';
        // Parse ISO 8601 duration (PT4M13S) to readable format
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        const hours = (match[1] || '').replace('H', '');
        const minutes = (match[2] || '').replace('M', '');
        const seconds = (match[3] || '').replace('S', '');
        
        if (hours) {
            return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
        }
        return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
    };

    const getVideoId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        return match ? match[1] : null;
    };

    const formatViewCount = (count) => {
        if (!count) return '';
        const num = parseInt(count);
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M views`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K views`;
        }
        return `${num} views`;
    };

    // Combine and sort news and videos by date
    const combinedContent = [];
    
    if (news && news.length > 0) {
        news.forEach(article => {
            combinedContent.push({
                type: 'news',
                data: article,
                date: new Date(article.publishedAt || article.date || Date.now())
            });
        });
    }

    if (videos && videos.length > 0) {
        videos.forEach(video => {
            combinedContent.push({
                type: 'video',
                data: video,
                date: new Date(video.snippet?.publishedAt || Date.now())
            });
        });
    }

    // Sort by date (newest first)
    combinedContent.sort((a, b) => b.date - a.date);

    // Filter based on active tab
    const filteredContent = combinedContent.filter(item => {
        if (activeTab === 'news') return item.type === 'news';
        if (activeTab === 'videos') return item.type === 'video';
        return true; // 'all'
    });

    if (filteredContent.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 flex items-center justify-center">
                    <i className="fas fa-newspaper text-2xl text-gray-400" />
                </div>
                <p className="text-gray-600">No recent content found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="relative bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40 p-2">
                <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="relative z-10 flex space-x-2">
                    {[
                        { key: 'all', label: 'All Content', icon: 'fas fa-globe' },
                        { key: 'news', label: 'News', icon: 'fas fa-newspaper' },
                        { key: 'videos', label: 'Videos', icon: 'fab fa-youtube' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                                activeTab === tab.key
                                    ? 'text-white shadow-lg'
                                    : 'text-gray-700 hover:text-white hover:bg-white/20'
                            }`}
                        >
                            {activeTab === tab.key && (
                                <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)' }}></div>
                            )}
                            <i className={`${tab.icon} relative z-10`}></i>
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Video Player Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
                    <div className="relative bg-white/20 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.2)] max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                        
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedVideo(null)}
                            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                        
                        <div className="relative z-10 p-6">
                            {/* Video Player */}
                            <div className="relative rounded-2xl overflow-hidden mb-6 bg-black/50 backdrop-blur-xl border border-white/30">
                                <div className="aspect-video">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${getVideoId(selectedVideo.snippet?.resourceId?.videoId || selectedVideo.id?.videoId)}?autoplay=1`}
                                        title={selectedVideo.snippet?.title}
                                        className="w-full h-full rounded-2xl"
                                        frameBorder="0"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    ></iframe>
                                </div>
                            </div>
                            
                            {/* Video Info */}
                            <div className="text-white">
                                <h3 className="text-xl font-bold mb-2">{selectedVideo.snippet?.title}</h3>
                                <p className="text-gray-300 text-sm mb-4 line-clamp-3">{selectedVideo.snippet?.description}</p>
                                
                                <div className="flex items-center justify-between text-sm text-gray-400">
                                    <span>{selectedVideo.snippet?.channelTitle}</span>
                                    <span>{formatNewsDate(selectedVideo.snippet?.publishedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Grid */}
            <div className="space-y-4">
                {filteredContent.slice(0, 12).map((item, index) => {
                    if (item.type === 'video') {
                        const video = item.data;
                        const videoId = getVideoId(video.snippet?.resourceId?.videoId || video.id?.videoId);
                        const thumbnailUrl = video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.default?.url;
                        
                        return (
                            <div key={`video-${index}`} className="relative bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40 overflow-hidden hover:bg-white/40 transition-all duration-300 cursor-pointer group" onClick={() => setSelectedVideo(video)}>
                                <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                                
                                <div className="relative z-10 p-4">
                                    <div className="flex space-x-4">
                                        {/* Video Thumbnail */}
                                        <div className="flex-shrink-0 relative">
                                            <div className="w-32 h-20 rounded-xl overflow-hidden bg-black/50 backdrop-blur-sm border border-white/30 relative">
                                                {thumbnailUrl && (
                                                    <img 
                                                        src={thumbnailUrl}
                                                        alt={video.snippet?.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                                
                                                {/* Play Button Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-all duration-300">
                                                    <div className="w-10 h-10 rounded-full bg-red-600/90 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                                                        <i className="fab fa-youtube text-lg"></i>
                                                    </div>
                                                </div>
                                                
                                                {/* Duration Badge */}
                                                {video.contentDetails?.duration && (
                                                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-white text-xs font-medium">
                                                        {formatDuration(video.contentDetails.duration)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Video Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 pr-2">
                                                    {video.snippet?.title}
                                                </h4>
                                                <div className="flex-shrink-0 ml-2">
                                                    <div className="w-6 h-6 rounded-full bg-red-600/20 backdrop-blur-sm border border-red-500/30 flex items-center justify-center">
                                                        <i className="fab fa-youtube text-red-600 text-xs"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                                {video.snippet?.description}
                                            </p>
                                            
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-gray-500">{video.snippet?.channelTitle}</span>
                                                    {video.statistics?.viewCount && (
                                                        <span className="text-gray-400">{formatViewCount(video.statistics.viewCount)}</span>
                                                    )}
                                                </div>
                                                <span className="text-gray-400">{formatNewsDate(video.snippet?.publishedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    } else {
                        const article = item.data;
                        return (
                            <div key={`news-${index}`} className="relative bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40 overflow-hidden hover:bg-white/40 transition-all duration-300 group">
                                <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                                
                                <div className="relative z-10 p-4">
                                    <div className="flex space-x-4">
                                        {/* Article Image */}
                                        {(article.image || article.urlToImage) && (
                                            <div className="flex-shrink-0">
                                                <div className="w-20 h-16 rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm border border-white/30">
                                                    <img 
                                                        src={article.image || article.urlToImage} 
                                                        alt={article.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Article Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 pr-2">
                                                    {article.title}
                                                </h4>
                                                <div className="flex-shrink-0 ml-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-600/20 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center">
                                                        <i className="fas fa-newspaper text-blue-600 text-xs"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {article.description && (
                                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                                    {article.description}
                                                </p>
                                            )}
                                            
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500">{article.source?.name || article.source || 'C-USA Network'}</span>
                                                <span className="text-gray-400">{formatNewsDate(article.publishedAt || article.date)}</span>
                                            </div>
                                            
                                            {/* Read More Button */}
                                            {article.url && (
                                                <a 
                                                    href={article.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center space-x-1 mt-2 text-xs font-medium px-3 py-1 rounded-lg bg-white/30 backdrop-blur-sm border border-white/40 hover:bg-white/50 transition-all duration-300"
                                                    style={{ color: '#002868' }}
                                                >
                                                    <span>Read More</span>
                                                    <i className="fas fa-external-link-alt"></i>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
};

// Interactive Conference Map Component
const ConferenceMap = ({ teams, onTeamClick, mapCenter, mapZoom }) => {
    // Custom marker icon for C-USA teams
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
                                position={[team.location.latitude || 35.0, team.location.longitude || -85.0]}
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
                                                    <h4 className="font-bold text-gray-800">{team.school}</h4>
                                                    <p className="text-sm text-gray-600">{team.mascot}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Location:</span>
                                                    <span className="font-medium text-gray-800">{team.location?.city}, {team.location?.state}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Conference:</span>
                                                    <span className="font-medium text-gray-800">{team.conference}</span>
                                                </div>
                                                {team.division && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Division:</span>
                                                        <span className="font-medium text-gray-800">{team.division}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <button
                                                onClick={() => onTeamClick && onTeamClick(team.id)}
                                                className="w-full mt-4 px-4 py-2 text-white text-sm font-medium rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105"
                                                style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)' }}
                                            >
                                                View Details
                                            </button>
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

// Talent Ratings Component
const TalentRatings = ({ teamTalent, maxTalent }) => {
    if (!teamTalent || teamTalent.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 flex items-center justify-center">
                    <i className="fas fa-star text-2xl text-gray-400" />
                </div>
                <p className="text-gray-600">No talent data available</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamTalent.slice(0, 12).map((team, index) => (
                <div key={team.school} className="relative bg-white/30 backdrop-blur-xl rounded-xl border border-white/40 p-4">
                    <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)' }}>
                                {index + 1}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">{team.school}</h4>
                                <p className="text-xs text-gray-600">Talent Rating</p>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Rating:</span>
                                <span className="font-bold" style={{ color: '#002868' }}>{team.talent?.toFixed(1) || 'N/A'}</span>
                            </div>
                            
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="h-2 rounded-full transition-all duration-1000"
                                    style={{ 
                                        width: `${((team.talent || 0) / maxTalent) * 100}%`,
                                        background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Recruiting Tracker Component
const RecruitingTracker = ({ recruits, teams }) => {
    if (!recruits || recruits.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 flex items-center justify-center">
                    <i className="fas fa-users text-2xl text-gray-400" />
                </div>
                <p className="text-gray-600">No recruiting data available</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recruits.slice(0, 10).map((recruit, index) => (
                <div key={index} className="relative bg-white/30 backdrop-blur-xl rounded-xl border border-white/40 p-4">
                    <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h4 className="font-bold text-gray-800">{recruit.name || recruit.player}</h4>
                                <p className="text-sm text-gray-600">{recruit.position} • {recruit.hometown || recruit.city}</p>
                                <p className="text-sm font-medium" style={{ color: '#002868' }}>{recruit.committedTo || recruit.team}</p>
                            </div>
                            
                            <div className="text-right">
                                <div className="flex items-center space-x-1">
                                    <StarRating rating={recruit.rating || recruit.stars || 3} />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">#{recruit.ranking || index + 1}</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <span className="text-gray-500">Height:</span>
                                <span className="ml-1 font-medium">{recruit.height || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Weight:</span>
                                <span className="ml-1 font-medium">{recruit.weight || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ConferenceUSA = () => {
    const [teams, setTeams] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Map');
    const [mapCenter, setMapCenter] = useState([35.0, -85.0]); // Centered on southeastern US
    const [mapZoom, setMapZoom] = useState(5);
    const [games, setGames] = useState([]);
    const [standings, setStandings] = useState([]);
    const [teamTalent, setTeamTalent] = useState([]);
    const [recruits, setRecruits] = useState([]);
    const [rankings, setRankings] = useState([]);
    const [news, setNews] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const categories = ['Map', 'Standings', 'Talent Rankings', 'Recruiting', 'Games', 'News'];

    // C-USA team names for filtering
    const cusaTeams = [
        'Charlotte', 'FAU', 'FIU', 'Louisiana Tech', 'Marshall', 
        'Middle Tennessee', 'North Texas', 'Old Dominion', 'Rice', 
        'UAB', 'UTEP', 'UTSA', 'Western Kentucky'
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        
        try {
            // Fetch teams
            console.log("Fetching Conference USA teams...");
            const allTeams = await teamService.getTeams();
            
            if (allTeams && allTeams.length > 0) {
                // Filter for C-USA teams
                const cusaTeamData = allTeams.filter(team => 
                    team.conference === 'Conference USA' || 
                    cusaTeams.some(cusaTeam => 
                        team.school?.includes(cusaTeam) || 
                        team.displayName?.includes(cusaTeam)
                    )
                );
                
                console.log("Found C-USA teams:", cusaTeamData.length);
                setTeams(cusaTeamData);
            }

            // Fetch games
            try {
                console.log("Fetching Conference USA games...");
                const gamesData = await gameService.getGames(2024);
                
                if (gamesData && gamesData.length > 0) {
                    // Filter for C-USA games
                    const cusaGames = gamesData.filter(game => 
                        cusaTeams.some(team => 
                            game.home_team?.includes(team) || 
                            game.away_team?.includes(team) ||
                            game.home_team === team ||
                            game.away_team === team
                        )
                    ).slice(0, 20);
                    
                    console.log("C-USA games found:", cusaGames.length);
                    setGames(cusaGames);
                }
            } catch (error) {
                console.error("Error fetching games:", error);
                setGames([]);
            }

            // Fetch talent ratings
            try {
                console.log("Fetching talent ratings...");
                const talentData = await teamService.getTalentRatings();
                
                if (talentData && talentData.length > 0) {
                    const cusaTalent = talentData.filter(team => 
                        cusaTeams.some(cusaTeam => 
                            team.school?.includes(cusaTeam) || 
                            team.team?.includes(cusaTeam)
                        )
                    ).sort((a, b) => (b.talent || 0) - (a.talent || 0));
                    
                    setTeamTalent(cusaTalent);
                }
            } catch (error) {
                console.error("Error fetching talent ratings:", error);
                setTeamTalent([]);
            }

            // Fetch news
            try {
                console.log("Fetching news...");
                const newsData = await newsService.fetchNews();
                
                if (newsData && newsData.articles && newsData.articles.length > 0) {
                    const sortedArticles = [...newsData.articles].sort((a, b) => {
                        if (a.publishedAt && b.publishedAt) {
                            return new Date(b.publishedAt) - new Date(a.publishedAt);
                        }
                        return 0;
                    });
                    setNews(sortedArticles.slice(0, 10));
                }
            } catch (error) {
                console.error("Error fetching news:", error);
                setNews([]);
            }

            // Fetch YouTube videos
            try {
                console.log("Fetching YouTube videos...");
                const videoQueries = [
                    'Conference USA football highlights',
                    'C-USA football 2024',
                    'Conference USA championship',
                    'CUSA football news'
                ];
                
                let allVideos = [];
                
                for (const query of videoQueries) {
                    try {
                        const videoData = await fetchYouTubeData(query, 5);
                        if (videoData && videoData.items && videoData.items.length > 0) {
                            // Transform YouTube API response to match expected format
                            const transformedVideos = videoData.items.map(item => ({
                                id: item.id.videoId,
                                title: item.snippet.title,
                                description: item.snippet.description,
                                thumbnail: item.snippet.thumbnails.medium?.url,
                                publishedAt: item.snippet.publishedAt,
                                channelTitle: item.snippet.channelTitle
                            }));
                            allVideos = [...allVideos, ...transformedVideos];
                        }
                    } catch (videoError) {
                        console.error(`Error fetching videos for query "${query}":`, videoError);
                    }
                }
                
                // Remove duplicates and sort by date
                const uniqueVideos = allVideos.filter((video, index, self) => 
                    index === self.findIndex(v => v.id?.videoId === video.id?.videoId)
                );
                
                const sortedVideos = uniqueVideos.sort((a, b) => {
                    const dateA = new Date(a.snippet?.publishedAt || 0);
                    const dateB = new Date(b.snippet?.publishedAt || 0);
                    return dateB - dateA;
                });
                
                setVideos(sortedVideos.slice(0, 10));
                console.log("YouTube videos found:", sortedVideos.length);
            } catch (error) {
                console.error("Error fetching YouTube videos:", error);
                setVideos([]);
            }

            // Fetch recruiting data
            try {
                console.log("Fetching recruiting data...");
                let recruitsData = await teamService.getAllRecruits();
                
                if (!recruitsData || recruitsData.length === 0) {
                    recruitsData = await rankingsService.getPlayerRecruitingRankings(2024);
                }
                
                if (recruitsData && recruitsData.length > 0) {
                    const cusaRecruits = recruitsData
                        .filter(recruit => 
                            recruit.committedTo && 
                            cusaTeams.some(team => 
                                recruit.committedTo.includes(team) ||
                                recruit.committedTo === team
                            )
                        )
                        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                        .slice(0, 20);
                    
                    setRecruits(cusaRecruits);
                }
            } catch (error) {
                console.error("Error fetching recruits:", error);
                setRecruits([]);
            }

            // Fetch standings/records
            try {
                console.log("Fetching records for C-USA teams...");
                const allRecords = await gameService.getRecords(2024);
                
                if (allRecords && allRecords.length > 0) {
                    const cusaStandings = allRecords.filter(record => 
                        cusaTeams.some(team => 
                            record.team?.includes(team) || 
                            record.team === team
                        )
                    ).sort((a, b) => {
                        const aWinPct = (a.conference?.wins || 0) / Math.max((a.conference?.wins || 0) + (a.conference?.losses || 0), 1);
                        const bWinPct = (b.conference?.wins || 0) / Math.max((b.conference?.wins || 0) + (b.conference?.losses || 0), 1);
                        return bWinPct - aWinPct;
                    });
                    
                    setStandings(cusaStandings);
                }
            } catch (error) {
                console.error("Error fetching records:", error);
                setStandings([]);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTeamClick = (teamId) => {
        console.log("Team clicked:", teamId);
        // Navigate to team detail page
    };

    const getTeamLogo = (teamName) => {
        const team = teams.find(t => 
            t.school === teamName || 
            t.displayName === teamName ||
            t.abbreviation === teamName
        );
        return team?.logos?.[0] || '/photos/ncaaf.png';
    };

    const getTeamAbbreviation = (teamName) => {
        const team = teams.find(t => 
            t.school === teamName || 
            t.displayName === teamName ||
            t.abbreviation === teamName
        );
        return team?.abbreviation || teamName;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 flex items-center justify-center animate-spin">
                        <i className="fas fa-football-ball text-2xl" style={{ color: '#002868' }} />
                    </div>
                    <p className="text-gray-600">Loading Conference USA data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 relative overflow-hidden">
            <style jsx>{`
                .gradient-text {
                  background: linear-gradient(135deg, #002868, #BF0A30, #002868);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                }
                .icon-gradient {
                  background: linear-gradient(135deg, #002868, #BF0A30, #002868);
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

            {/* Floating Orbs Background - C-USA themed */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-5 blur-3xl animate-pulse" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)' }}></div>
                <div className="absolute top-60 right-20 w-48 h-48 rounded-full opacity-3 blur-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)', animationDelay: '1s' }}></div>
                <div className="absolute bottom-40 left-1/4 w-80 h-80 rounded-full opacity-4 blur-3xl animate-pulse" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)', animationDelay: '2s' }}></div>
                <div className="absolute bottom-20 right-1/3 w-56 h-56 rounded-full opacity-3 blur-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)', animationDelay: '3s' }}></div>
            </div>

            <div className="w-[97%] mx-auto relative z-10">
                {/* Enhanced Liquid Glass Header Section */}
                <div className="text-center mb-20 pt-20">
                    <div className="flex items-center justify-center mb-8 relative">
                        {/* Liquid Glass Icon Container */}
                        <div className="relative">
                            {/* Outer glass ring */}
                            <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl animate-pulse"></div>
                            {/* Inner glass container */}
                            <div className="relative w-16 h-16 rounded-full bg-white/40 backdrop-blur-2xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center">
                                {/* Liquid glass highlight */}
                                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/60 via-transparent to-transparent"></div>
                                <i className="fas fa-flag text-3xl relative z-10 drop-shadow-lg" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}></i>
                            </div>
                            {/* Floating particles */}
                            <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full opacity-60 animate-ping" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)' }}></div>
                            <div className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full opacity-40 animate-ping animation-delay-500" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)' }}></div>
                        </div>
                    </div>
                    
                    {/* Enhanced Title with Liquid Glass Effect */}
                    <div className="relative mb-8">
                        <h1 className="text-6xl md:text-7xl font-black mb-6 relative">
                            <span className="drop-shadow-2xl" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Conference</span>
                            <br />
                            <span className="drop-shadow-2xl" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>USA</span>
                            {/* Animated underline */}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 rounded-full opacity-60 animate-pulse" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)' }}></div>
                        </h1>
                    </div>
                    
                    {/* Stats Badge with Liquid Glass */}
                    <div className="inline-flex items-center space-x-4 px-8 py-4 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2),0_15px_35px_rgba(0,0,0,0.1)]">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)' }}></div>
                            <span className="text-lg font-bold" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{teams.length} Teams</span>
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
                                            <div className="absolute inset-0 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)' }}></div>
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
                                    <h2 className="text-2xl font-bold mb-4" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                        Conference USA Map
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
                                        <h3 className="text-lg font-bold mb-4" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                            Quick Navigation
                                        </h3>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            <button
                                                onClick={() => {
                                                    setMapCenter([35.0, -85.0]);
                                                    setMapZoom(5);
                                                }}
                                                className="px-4 py-2 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 text-sm font-medium text-gray-700"
                                            >
                                                <i className="fas fa-globe-americas mr-2" />
                                                Full View
                                            </button>
                                            
                                            <button
                                                onClick={() => {
                                                    setMapCenter([36.0, -82.0]);
                                                    setMapZoom(6);
                                                }}
                                                className="px-4 py-2 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 text-sm font-medium text-gray-700"
                                            >
                                                <i className="fas fa-map-marker-alt mr-2" />
                                                East Region
                                            </button>
                                            
                                            <button
                                                onClick={() => {
                                                    setMapCenter([32.0, -97.0]);
                                                    setMapZoom(6);
                                                }}
                                                className="px-4 py-2 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 text-sm font-medium text-gray-700"
                                            >
                                                <i className="fas fa-map-marker-alt mr-2" />
                                                West Region
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
                                    <h2 className="text-2xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
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
                                    <h2 className="text-2xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
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
                                    <h2 className="text-2xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
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
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {standings.map((team, index) => {
                                                        const confTotal = (team.conference?.wins || 0) + (team.conference?.losses || 0) + (team.conference?.ties || 0);
                                                        const overallTotal = (team.overall?.wins || 0) + (team.overall?.losses || 0) + (team.overall?.ties || 0);
                                                        
                                                        const confWinPct = confTotal > 0 ? (team.conference?.wins || 0) / confTotal : 0;
                                                        const overallWinPct = overallTotal > 0 ? (team.overall?.wins || 0) / overallTotal : 0;
                                                        
                                                        return (
                                                            <tr key={team.team} className="border-b border-gray-200 hover:bg-white/20 transition-colors">
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center space-x-3">
                                                                        <span className="w-6 text-center text-sm font-bold" style={{ color: '#002868' }}>#{index + 1}</span>
                                                                        <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 flex items-center justify-center overflow-hidden">
                                                                            <img 
                                                                                src={getTeamLogo(team.team)} 
                                                                                alt={team.team}
                                                                                className="w-6 h-6 object-contain"
                                                                                onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                                                                            />
                                                                        </div>
                                                                        <span className="font-medium text-gray-800">{team.team}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="text-center py-3 px-4 font-bold text-gray-700">
                                                                    {team.conference ? `${team.conference.wins || 0}-${team.conference.losses || 0}` : '0-0'}
                                                                </td>
                                                                <td className="text-center py-3 px-4">
                                                                    <span className={`font-bold ${confWinPct >= 0.7 ? 'text-green-600' : confWinPct < 0.4 ? 'text-red-600' : 'text-yellow-600'}`}>
                                                                        {confWinPct.toFixed(3)}
                                                                    </span>
                                                                </td>
                                                                <td className="text-center py-3 px-4 font-bold text-gray-700">
                                                                    {team.overall ? `${team.overall.wins || 0}-${team.overall.losses || 0}` : '0-0'}
                                                                </td>
                                                                <td className="text-center py-3 px-4">
                                                                    <span className={`font-bold ${overallWinPct >= 0.7 ? 'text-green-600' : overallWinPct < 0.4 ? 'text-red-600' : 'text-yellow-600'}`}>
                                                                        {overallWinPct.toFixed(3)}
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
                                                <i className="fas fa-trophy text-2xl text-gray-400" />
                                            </div>
                                            <p className="text-gray-600">No standings data available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {selectedCategory === 'Games' && (
                            <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
                                <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                                
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
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

                        {selectedCategory === 'News' && (
                            <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
                                <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                                
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                        Conference News
                                    </h2>
                                    
                                    <ConferenceNews news={news} videos={videos} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            {/* Team Performance Cards */}
                            <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-6">
                                <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                                
                                <div className="relative z-10">
                                    <h3 className="text-lg font-bold mb-4" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                        Featured Teams
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        {teams.slice(0, 6).map((team, index) => (
                                            <TeamPerformanceCard
                                                key={team.id}
                                                team={team}
                                                rank={index + 1}
                                                record={standings.find(s => s.team === team.school)?.overall}
                                                eloRating={team.elo}
                                                talentRating={teamTalent.find(t => t.school === team.school)?.talent}
                                                onTeamClick={handleTeamClick}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-6">
                                <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                                
                                <div className="relative z-10">
                                    <h3 className="text-lg font-bold mb-4" style={{ background: 'linear-gradient(135deg, #002868, #BF0A30, #002868)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                        Quick Stats
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Total Teams:</span>
                                            <span className="font-bold" style={{ color: '#002868' }}>{teams.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Games Tracked:</span>
                                            <span className="font-bold" style={{ color: '#002868' }}>{games.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Recruits Tracked:</span>
                                            <span className="font-bold" style={{ color: '#002868' }}>{recruits.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">News Articles:</span>
                                            <span className="font-bold" style={{ color: '#002868' }}>{news.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Videos:</span>
                                            <span className="font-bold" style={{ color: '#002868' }}>{videos.length}</span>
                                        </div>
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

export default ConferenceUSA;
