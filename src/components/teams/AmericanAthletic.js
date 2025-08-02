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
                <h4 style="margin: 0 0 12px 0; color: #002F5F; font-weight: 700; font-size: 14px;">AAC Teams</h4>
                <div style="font-size: 12px; color: #666;">Click markers to view team details</div>
            `;
            
            return div;
        };
        
        legendControl.addTo(map);
        
        return () => {
            map.removeControl(legendControl);
        };
    }, [map]);

    return null;
};

// Conference Map Component
const ConferenceMap = ({ teams, selectedTeam, onTeamClick }) => {
    // AAC region center (roughly covering the eastern and central US)
    const mapCenter = [35.0, -85.0];
    const mapZoom = 5;

    // AAC team locations with approximate coordinates
    const teamLocations = {
        'Cincinnati': [39.1031, -84.5120],
        'Houston': [29.7604, -95.3698],
        'UCF': [28.6024, -81.2001],
        'Memphis': [35.1495, -90.0490],
        'SMU': [32.8407, -96.7845],
        'Temple': [39.9812, -75.1551],
        'Tulane': [29.9311, -90.1172],
        'Tulsa': [36.1540, -95.9928],
        'East Carolina': [35.6066, -77.3679],
        'Navy': [38.9827, -76.4951],
        'South Florida': [28.0587, -82.4127],
        'Wichita State': [37.7203, -97.2930] // Basketball only
    };

    return (
        <div style={{ 
            height: '600px', 
            borderRadius: '24px', 
            overflow: 'hidden',
            border: '2px solid rgba(0, 47, 95, 0.3)',
            boxShadow: '0 25px 50px rgba(0, 47, 95, 0.3)'
        }}>
            <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <MapViewUpdater 
                    center={selectedTeam ? teamLocations[selectedTeam] : mapCenter} 
                    zoom={selectedTeam ? 8 : mapZoom} 
                />
                
                <MapControl teams={teams} onTeamClick={onTeamClick} />
                
                {Object.entries(teamLocations).map(([teamName, coordinates]) => (
                    <Marker
                        key={teamName}
                        position={coordinates}
                        eventHandlers={{
                            click: () => onTeamClick(teamName),
                        }}
                    >
                        <Popup>
                            <div style={{ padding: '8px', minWidth: '200px' }}>
                                <h3 style={{ 
                                    margin: '0 0 8px 0', 
                                    color: '#002F5F',
                                    fontSize: '16px',
                                    fontWeight: '700'
                                }}>
                                    {teamName}
                                </h3>
                                <p style={{ 
                                    margin: '0', 
                                    color: '#666',
                                    fontSize: '12px'
                                }}>
                                    American Athletic Conference
                                </p>
                                <button 
                                    onClick={() => onTeamClick(teamName)}
                                    style={{
                                        marginTop: '8px',
                                        padding: '6px 12px',
                                        background: 'linear-gradient(135deg, #002F5F, #C21A21)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    View Details
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

// Enhanced News Component with Video Integration
const ConferenceNews = () => {
    const [news, setNews] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('news');
    const [selectedVideo, setSelectedVideo] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                // Fetch AAC-related news
                const newsData = await newsService.getCollegeFootballNews();
                const aacNews = newsData.filter(article => 
                    article.title?.toLowerCase().includes('american athletic') ||
                    article.title?.toLowerCase().includes('aac') ||
                    article.content?.toLowerCase().includes('american athletic') ||
                    ['cincinnati', 'houston', 'ucf', 'memphis', 'smu', 'temple', 'tulane', 'tulsa', 'east carolina', 'navy', 'south florida'].some(team => 
                        article.title?.toLowerCase().includes(team.toLowerCase())
                    )
                ).slice(0, 8);
                
                setNews(aacNews);

                // Fetch AAC-related videos
                const videoQueries = [
                    'American Athletic Conference football',
                    'AAC football highlights',
                    'Cincinnati Bearcats football',
                    'Houston Cougars football',
                    'UCF Knights football',
                    'Memphis Tigers football'
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
                
                // Remove duplicates and limit to 12 videos
                const uniqueVideos = allVideos.filter((video, index, self) => 
                    index === self.findIndex(v => v.id === video.id)
                ).slice(0, 12);
                
                setVideos(uniqueVideos);
                
            } catch (error) {
                console.error('Error fetching AAC content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    const VideoModal = ({ video, onClose }) => {
        if (!video) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">
                            {video.title}
                        </h3>
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                        >
                            ×
                        </button>
                    </div>
                    <div className="aspect-video">
                        <iframe
                            src={`https://www.youtube.com/embed/${video.id}`}
                            title={video.title}
                            className="w-full h-full"
                            frameBorder="0"
                            allowFullScreen
                        />
                    </div>
                    <div className="p-4">
                        <p className="text-sm text-gray-600 mb-2">
                            {video.channelTitle} • {new Date(video.publishedAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-800 line-clamp-3">
                            {video.description}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading AAC content...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Tab Navigation */}
            <div className="flex mb-8 bg-white/40 backdrop-blur-lg rounded-xl p-2 border border-white/50">
                <button
                    onClick={() => setActiveTab('news')}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                        activeTab === 'news'
                            ? 'bg-gradient-to-r from-blue-900 to-red-700 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-white/50'
                    }`}
                >
                    Latest News
                </button>
                <button
                    onClick={() => setActiveTab('videos')}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                        activeTab === 'videos'
                            ? 'bg-gradient-to-r from-blue-900 to-red-700 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-white/50'
                    }`}
                >
                    Videos
                </button>
            </div>

            {/* Content */}
            {activeTab === 'news' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {news.map((article, index) => (
                        <div 
                            key={index}
                            className="bg-white/40 backdrop-blur-lg rounded-xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/50"
                        >
                            {article.image && (
                                <img 
                                    src={article.image} 
                                    alt={article.title}
                                    className="w-full h-48 object-cover rounded-lg mb-4"
                                />
                            )}
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                {article.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                {article.description || article.content}
                            </p>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                    {new Date(article.publishedAt || article.date).toLocaleDateString()}
                                </span>
                                <a 
                                    href={article.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-900 hover:text-red-700 font-semibold text-sm transition-colors"
                                >
                                    Read More →
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'videos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video, index) => (
                        <div 
                            key={index}
                            className="bg-white/40 backdrop-blur-lg rounded-xl overflow-hidden border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/50 cursor-pointer"
                            onClick={() => setSelectedVideo(video)}
                        >
                            <div className="relative">
                                <img 
                                    src={video.thumbnail} 
                                    alt={video.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <div className="bg-red-600 rounded-full p-3">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M8 5v10l8-5z"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                                    {video.title}
                                </h3>
                                <p className="text-xs text-gray-600 mb-2">
                                    {video.channelTitle}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {new Date(video.publishedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <VideoModal 
                video={selectedVideo} 
                onClose={() => setSelectedVideo(null)} 
            />
        </div>
    );
};

// Talent Ratings Component
const TalentRatings = () => {
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                // Mock AAC talent ratings data
                const mockRatings = [
                    { team: 'Cincinnati', rating: 88.5, rank: 1, change: '+2' },
                    { team: 'Houston', rating: 85.2, rank: 2, change: '+1' },
                    { team: 'UCF', rating: 83.8, rank: 3, change: '-1' },
                    { team: 'Memphis', rating: 81.5, rank: 4, change: '0' },
                    { team: 'SMU', rating: 80.2, rank: 5, change: '+3' },
                    { team: 'Navy', rating: 78.9, rank: 6, change: '-2' },
                    { team: 'Temple', rating: 77.1, rank: 7, change: '+1' },
                    { team: 'Tulane', rating: 76.8, rank: 8, change: '-1' },
                    { team: 'East Carolina', rating: 75.3, rank: 9, change: '0' },
                    { team: 'South Florida', rating: 74.1, rank: 10, change: '+1' },
                    { team: 'Tulsa', rating: 72.5, rank: 11, change: '-2' }
                ];
                setRatings(mockRatings);
            } catch (error) {
                console.error('Error fetching talent ratings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRatings();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    return (
        <div className="bg-white/40 backdrop-blur-lg rounded-xl p-6 border border-white/50">
            <h3 className="text-xl font-bold text-gray-900 mb-6">AAC Talent Ratings</h3>
            <div className="space-y-4">
                {ratings.map((team, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                        <div className="flex items-center space-x-4">
                            <span className="text-lg font-bold text-gray-700 w-8">#{team.rank}</span>
                            <span className="font-semibold text-gray-900">{team.team}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-lg font-bold text-blue-900">{team.rating}</span>
                            <span className={`text-sm font-semibold px-2 py-1 rounded ${
                                team.change.startsWith('+') ? 'text-green-700 bg-green-100' :
                                team.change.startsWith('-') ? 'text-red-700 bg-red-100' :
                                'text-gray-700 bg-gray-100'
                            }`}>
                                {team.change !== '0' ? team.change : '—'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Recruiting Tracker Component
const RecruitingTracker = () => {
    const [recruits, setRecruits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecruits = async () => {
            try {
                // Mock recruiting data
                const mockRecruits = [
                    { 
                        name: 'Marcus Thompson', 
                        position: 'QB', 
                        rating: '4★', 
                        team: 'Cincinnati',
                        status: 'Committed',
                        date: '2024-01-15'
                    },
                    { 
                        name: 'David Rodriguez', 
                        position: 'RB', 
                        rating: '4★', 
                        team: 'Houston',
                        status: 'Committed',
                        date: '2024-01-12'
                    },
                    { 
                        name: 'Tyler Johnson', 
                        position: 'WR', 
                        rating: '3★', 
                        team: 'UCF',
                        status: 'Committed',
                        date: '2024-01-10'
                    },
                    { 
                        name: 'Anthony Davis', 
                        position: 'DE', 
                        rating: '4★', 
                        team: 'Memphis',
                        status: 'Committed',
                        date: '2024-01-08'
                    },
                    { 
                        name: 'Michael Brown', 
                        position: 'OL', 
                        rating: '3★', 
                        team: 'SMU',
                        status: 'Committed',
                        date: '2024-01-05'
                    }
                ];
                setRecruits(mockRecruits);
            } catch (error) {
                console.error('Error fetching recruiting data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecruits();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    return (
        <div className="bg-white/40 backdrop-blur-lg rounded-xl p-6 border border-white/50">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Commitments</h3>
            <div className="space-y-4">
                {recruits.map((recruit, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                        <div>
                            <div className="flex items-center space-x-3">
                                <span className="font-semibold text-gray-900">{recruit.name}</span>
                                <span className="text-sm text-blue-900 font-semibold">{recruit.rating}</span>
                                <span className="text-sm text-gray-600">{recruit.position}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                {recruit.team} • {new Date(recruit.date).toLocaleDateString()}
                            </div>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                            {recruit.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Team Performance Card Component  
const TeamPerformanceCard = ({ team, stats }) => {
    return (
        <div className="bg-white/40 backdrop-blur-lg rounded-xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{team}</h3>
                <span className="text-2xl font-bold text-blue-900">{stats.rank}</span>
            </div>
            
            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-gray-600">Record</span>
                    <span className="font-semibold text-gray-900">{stats.record}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Conference</span>
                    <span className="font-semibold text-gray-900">{stats.confRecord}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Points Per Game</span>
                    <span className="font-semibold text-blue-900">{stats.ppg}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Yards Per Game</span>
                    <span className="font-semibold text-blue-900">{stats.ypg}</span>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                        stats.trend === 'up' ? 'bg-green-500' : 
                        stats.trend === 'down' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-sm text-gray-600">
                        {stats.trend === 'up' ? 'Trending Up' : 
                         stats.trend === 'down' ? 'Trending Down' : 'Stable'}
                    </span>
                </div>
            </div>
        </div>
    );
};

const AmericanAthletic = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teams, setTeams] = useState([]);
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);

    // AAC team data
    const aacTeams = [
        'Cincinnati', 'Houston', 'UCF', 'Memphis', 'SMU', 
        'Temple', 'Tulane', 'Tulsa', 'East Carolina', 'Navy', 'South Florida'
    ];

    // Mock team performance data
    const teamStats = {
        'Cincinnati': { rank: '#1', record: '11-1', confRecord: '8-0', ppg: '35.2', ypg: '448', trend: 'up' },
        'Houston': { rank: '#2', record: '10-2', confRecord: '7-1', ppg: '32.8', ypg: '421', trend: 'up' },
        'UCF': { rank: '#3', record: '9-3', confRecord: '6-2', ppg: '30.5', ypg: '398', trend: 'stable' },
        'Memphis': { rank: '#4', record: '8-4', confRecord: '5-3', ppg: '28.9', ypg: '376', trend: 'down' },
        'SMU': { rank: '#5', record: '7-5', confRecord: '4-4', ppg: '27.1', ypg: '354', trend: 'stable' },
        'Navy': { rank: '#6', record: '6-6', confRecord: '4-4', ppg: '25.8', ypg: '342', trend: 'up' },
        'Temple': { rank: '#7', record: '5-7', confRecord: '3-5', ppg: '24.2', ypg: '318', trend: 'down' },
        'Tulane': { rank: '#8', record: '4-8', confRecord: '2-6', ppg: '22.6', ypg: '294', trend: 'down' },
        'East Carolina': { rank: '#9', record: '4-8', confRecord: '2-6', ppg: '21.8', ypg: '287', trend: 'stable' },
        'South Florida': { rank: '#10', record: '3-9', confRecord: '1-7', ppg: '20.4', ypg: '265', trend: 'down' },
        'Tulsa': { rank: '#11', record: '2-10', confRecord: '0-8', ppg: '18.9', ypg: '248', trend: 'down' }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Simulate API calls
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                setTeams(aacTeams);
                setStandings(Object.entries(teamStats).map(([team, stats]) => ({
                    team,
                    ...stats
                })));
            } catch (error) {
                console.error('Error loading AAC data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleTeamClick = (teamName) => {
        setSelectedTeam(teamName === selectedTeam ? null : teamName);
    };

    // AAC Colors: Navy Blue (#002F5F) and Red (#C21A21)
    const tabStyle = "flex-1 py-4 px-6 text-center font-semibold rounded-lg transition-all duration-300";
    const activeTabStyle = "bg-gradient-to-r from-blue-900 to-red-700 text-white shadow-lg transform scale-105";
    const inactiveTabStyle = "bg-white/20 text-gray-700 hover:bg-white/30 backdrop-blur-sm";

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mb-4"></div>
                    <p className="text-lg text-gray-600">Loading American Athletic Conference data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-blue-900 to-red-700 text-white py-20">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
                        American Athletic Conference
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
                        Power of Athletic Excellence - Comprehensive coverage of AAC teams, analytics, and championship pursuits
                    </p>
                    <div className="flex justify-center space-x-4">
                        <div className="bg-white/20 backdrop-blur-lg rounded-lg px-6 py-3 border border-white/30">
                            <span className="text-3xl font-bold">11</span>
                            <p className="text-sm opacity-90">Teams</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-lg rounded-lg px-6 py-3 border border-white/30">
                            <span className="text-3xl font-bold">2013</span>
                            <p className="text-sm opacity-90">Founded</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-lg rounded-lg px-6 py-3 border border-white/30">
                            <span className="text-3xl font-bold">CFP</span>
                            <p className="text-sm opacity-90">Playoff Eligible</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-4 mb-12 p-2 bg-white/40 backdrop-blur-lg rounded-xl border border-white/50">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`${tabStyle} ${activeTab === 'overview' ? activeTabStyle : inactiveTabStyle}`}
                    >
                        <i className="fas fa-home mr-2"></i>Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('map')}
                        className={`${tabStyle} ${activeTab === 'map' ? activeTabStyle : inactiveTabStyle}`}
                    >
                        <i className="fas fa-map-marked-alt mr-2"></i>Team Map
                    </button>
                    <button
                        onClick={() => setActiveTab('standings')}
                        className={`${tabStyle} ${activeTab === 'standings' ? activeTabStyle : inactiveTabStyle}`}
                    >
                        <i className="fas fa-trophy mr-2"></i>Standings
                    </button>
                    <button
                        onClick={() => setActiveTab('news')}
                        className={`${tabStyle} ${activeTab === 'news' ? activeTabStyle : inactiveTabStyle}`}
                    >
                        <i className="fas fa-newspaper mr-2"></i>News & Videos
                    </button>
                    <button
                        onClick={() => setActiveTab('recruiting')}
                        className={`${tabStyle} ${activeTab === 'recruiting' ? activeTabStyle : inactiveTabStyle}`}
                    >
                        <i className="fas fa-user-graduate mr-2"></i>Recruiting
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-12">
                        {/* Team Performance Grid */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Team Performance</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Object.entries(teamStats).map(([team, stats]) => (
                                    <TeamPerformanceCard key={team} team={team} stats={stats} />
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <TalentRatings />
                            <RecruitingTracker />
                        </div>
                    </div>
                )}

                {activeTab === 'map' && (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">AAC Team Locations</h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Explore the geographic footprint of American Athletic Conference teams across the United States
                            </p>
                        </div>
                        <ConferenceMap 
                            teams={teams} 
                            selectedTeam={selectedTeam} 
                            onTeamClick={handleTeamClick} 
                        />
                        {selectedTeam && (
                            <div className="mt-8 bg-white/40 backdrop-blur-lg rounded-xl p-6 border border-white/50">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedTeam}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-2">2024 Record</h4>
                                        <p className="text-xl font-bold text-blue-900">{teamStats[selectedTeam]?.record}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-2">Conference Record</h4>
                                        <p className="text-xl font-bold text-blue-900">{teamStats[selectedTeam]?.confRecord}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-2">Points Per Game</h4>
                                        <p className="text-xl font-bold text-blue-900">{teamStats[selectedTeam]?.ppg}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'standings' && (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">2024 AAC Standings</h2>
                            <p className="text-lg text-gray-600">Current conference standings and team performance metrics</p>
                        </div>
                        <div className="bg-white/40 backdrop-blur-lg rounded-xl overflow-hidden border border-white/50">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-blue-900 to-red-700 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold">Rank</th>
                                            <th className="px-6 py-4 text-left font-semibold">Team</th>
                                            <th className="px-6 py-4 text-center font-semibold">Overall</th>
                                            <th className="px-6 py-4 text-center font-semibold">Conference</th>
                                            <th className="px-6 py-4 text-center font-semibold">PPG</th>
                                            <th className="px-6 py-4 text-center font-semibold">YPG</th>
                                            <th className="px-6 py-4 text-center font-semibold">Trend</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {standings.map((team, index) => (
                                            <tr key={team.team} className="hover:bg-white/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-900">{team.rank}</td>
                                                <td className="px-6 py-4 font-semibold text-gray-900">{team.team}</td>
                                                <td className="px-6 py-4 text-center font-semibold text-blue-900">{team.record}</td>
                                                <td className="px-6 py-4 text-center font-semibold text-blue-900">{team.confRecord}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{team.ppg}</td>
                                                <td className="px-6 py-4 text-center text-gray-700">{team.ypg}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                                        team.trend === 'up' ? 'bg-green-100 text-green-800' :
                                                        team.trend === 'down' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        <div className={`w-2 h-2 rounded-full ${
                                                            team.trend === 'up' ? 'bg-green-500' :
                                                            team.trend === 'down' ? 'bg-red-500' :
                                                            'bg-yellow-500'
                                                        }`}></div>
                                                        <span className="capitalize">{team.trend === 'up' ? 'Rising' : team.trend === 'down' ? 'Falling' : 'Stable'}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'news' && (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest AAC News & Videos</h2>
                            <p className="text-lg text-gray-600">Stay updated with the latest American Athletic Conference news and video content</p>
                        </div>
                        <ConferenceNews />
                    </div>
                )}

                {activeTab === 'recruiting' && (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">AAC Recruiting Central</h2>
                            <p className="text-lg text-gray-600">Track the latest commitments and recruiting battles across the American Athletic Conference</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <TalentRatings />
                            <RecruitingTracker />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AmericanAthletic;
