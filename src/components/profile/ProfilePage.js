import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faEdit, faSave, faTimes, faUser, faEnvelope, faCalendarAlt, faFootballBall, faTrophy, faChartLine, faFireAlt, faStar } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { teamService } from '../../services/teamService';
import { showToast } from '../common/Toast';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, userData, updateUserProfile, uploadProfilePhoto } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [teams, setTeams] = useState([]);

  // Load teams for dropdown
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teamsData = await teamService.getAllTeams();
        setTeams(teamsData);
      } catch (error) {
        console.error('Error loading teams:', error);
      }
    };
    loadTeams();
  }, []);

  // Helper function to get team logo
  const getTeamLogo = (teamName) => {
    if (!teamName) return null;
    
    // Convert team name to logo filename format
    const logoName = teamName.replace(/\s+/g, '_').replace(/&/g, '').replace(/'/g, '');
    return `/team_logos/${logoName}.png`;
  };

  // Helper function to get team colors (you can expand this)
  const getTeamColors = (teamName) => {
    const teamColors = {
      'Alabama': { primary: '#9E1B32', secondary: '#FFFFFF' },
      'Auburn': { primary: '#0C2340', secondary: '#DD550C' },
      'Georgia': { primary: '#BA0C2F', secondary: '#000000' },
      'Florida': { primary: '#0021A5', secondary: '#FA4616' },
      'LSU': { primary: '#461D7C', secondary: '#FDD023' },
      'Tennessee': { primary: '#FF8200', secondary: '#FFFFFF' },
      'Texas': { primary: '#BF5700', secondary: '#FFFFFF' },
      'Oklahoma': { primary: '#841617', secondary: '#FDFDFD' },
      'Ohio State': { primary: '#BB0000', secondary: '#FFFFFF' },
      'Michigan': { primary: '#00274C', secondary: '#FFCB05' },
      'Notre Dame': { primary: '#0C2340', secondary: '#C99700' },
      'USC': { primary: '#990000', secondary: '#FFCC00' },
      // Add more teams as needed
    };
    
    return teamColors[teamName] || { primary: '#374151', secondary: '#F3F4F6' };
  };

  useEffect(() => {
    // Load user profile from Firebase Auth
    if (userData) {
      setEditData(userData);
    }
  }, [userData]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...userData });
  };

  const handleSave = async () => {
    // Basic validation
    if (!editData.displayName || editData.displayName.trim() === '') {
      showToast.error('Please enter your display name.');
      return;
    }

    setIsLoading(true);
    try {
      let photoURL = editData.photoURL;
      
      // If user selected a new photo, upload it first
      if (selectedPhotoFile) {
        setUploadProgress(0);
        photoURL = await uploadProfilePhoto(selectedPhotoFile, user.uid, (progress) => {
          setUploadProgress(progress);
        });
      }
      
      // Update profile data
      const updatedData = {
        ...editData,
        displayName: editData.displayName.trim(),
        bio: editData.bio?.trim() || '',
        location: editData.location?.trim() || '',
        photoURL
      };
      
      await updateUserProfile(updatedData);
      setIsEditing(false);
      setProfilePhotoPreview(null);
      setSelectedPhotoFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...userData });
    setProfilePhotoPreview(null);
    setSelectedPhotoFile(null);
    setUploadProgress(0);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast.error('Please select a valid image file.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast.error('Please select an image smaller than 5MB.');
        return;
      }
      
      setSelectedPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-white/60 backdrop-blur-lg border border-white/40 flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-transparent" style={{borderTopColor: 'rgb(204,0,28)'}}></div>
          </div>
          <p className="text-gray-600">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden pt-16 pb-8">
      <div className="relative z-10 max-w-none mx-auto px-4" style={{width: '97%'}}>
        {/* Profile Header */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_25px_50px_rgba(239,68,68,0.15)] overflow-hidden mb-8">
          {/* Gradient overlay for glass effect */}
          <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/40 via-transparent to-red-50/30 pointer-events-none"></div>
          
          <div className="relative z-10 p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Profile Photo */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {(profilePhotoPreview || userData?.photoURL || user?.photoURL) ? (
                    <img 
                      src={profilePhotoPreview || userData?.photoURL || user?.photoURL} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} className="text-gray-400 text-4xl" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <>
                    <label className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg" style={{background: 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))'}}>
                      <FontAwesomeIcon icon={faCamera} className="text-white text-sm" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoUpload}
                        className="hidden" 
                      />
                    </label>
                    
                    {/* Remove photo preview button */}
                    {profilePhotoPreview && (
                      <button
                        onClick={() => {
                          setProfilePhotoPreview(null);
                          setSelectedPhotoFile(null);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors shadow-lg"
                        title="Remove photo"
                      >
                        <FontAwesomeIcon icon={faTimes} className="text-white text-xs" />
                      </button>
                    )}
                  </>
                )}
                
                {/* Upload Progress */}
                {isLoading && uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-white text-sm font-medium mb-2">
                        {uploadProgress}%
                      </div>
                      <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white transition-all duration-300 ease-out" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editData.displayName || ''}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      className="text-3xl font-bold bg-white/60 backdrop-blur-lg border border-white/40 rounded-xl px-4 py-2 w-full gradient-text focus:outline-none focus:border-red-500"
                      placeholder="Full Name"
                    />
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="text-gray-600 bg-white/60 backdrop-blur-lg border border-white/40 rounded-xl px-4 py-2 w-full focus:outline-none focus:border-red-500"
                      placeholder="Email"
                      disabled
                    />
                    <input
                      type="text"
                      value={editData.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="text-gray-600 bg-white/60 backdrop-blur-lg border border-white/40 rounded-xl px-4 py-2 w-full focus:outline-none focus:border-red-500"
                      placeholder="Bio (optional)"
                    />
                    <input
                      type="text"
                      value={editData.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="text-gray-600 bg-white/60 backdrop-blur-lg border border-white/40 rounded-xl px-4 py-2 w-full focus:outline-none focus:border-red-500"
                      placeholder="Location (optional)"
                    />
                    <select
                      value={editData.favoriteTeam?.id || ''}
                      onChange={(e) => {
                        const selectedTeam = teams.find(team => team.id === parseInt(e.target.value));
                        handleInputChange('favoriteTeam', selectedTeam || null);
                      }}
                      className="text-gray-600 bg-white/60 backdrop-blur-lg border border-white/40 rounded-xl px-4 py-2 w-full focus:outline-none focus:border-red-500"
                    >
                      <option value="">Select Favorite Team (optional)</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.school} {team.mascot}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold gradient-text mb-2">{userData?.displayName || user?.displayName}</h1>
                    <p className="text-gray-600 mb-4 flex items-center justify-center md:justify-start">
                      <FontAwesomeIcon icon={faEnvelope} className="mr-2" style={{background: 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}} />
                      {userData?.email || user?.email}
                    </p>
                    {userData?.bio && (
                      <p className="text-gray-700 mb-3 italic">"{userData.bio}"</p>
                    )}
                    {userData?.location && (
                      <p className="text-gray-600 mb-4">📍 {userData.location}</p>
                    )}
                  </>
                )}

                {/* Team Affiliation with Cool Logo Display */}
                {userData?.favoriteTeam && (
                  <div className="relative mb-6">
                    {/* Team Logo Background Effect */}
                    <div className="absolute inset-0 opacity-5">
                      <img 
                        src={getTeamLogo(userData.favoriteTeam.school)} 
                        alt={`${userData.favoriteTeam.school} logo`}
                        className="w-full h-full object-contain"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                    
                    {/* Main Team Display */}
                    <div 
                      className="relative bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${getTeamColors(userData.favoriteTeam.school).primary}15, ${getTeamColors(userData.favoriteTeam.school).secondary}15)`
                      }}
                    >
                      <div className="flex items-center justify-center md:justify-start space-x-4">
                        {/* Animated Team Logo */}
                        <div className="relative group">
                          <div 
                            className="absolute inset-0 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"
                            style={{ background: `linear-gradient(45deg, ${getTeamColors(userData.favoriteTeam.school).primary}, ${getTeamColors(userData.favoriteTeam.school).secondary})` }}
                          ></div>
                          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                            <img 
                              src={getTeamLogo(userData.favoriteTeam.school)} 
                              alt={`${userData.favoriteTeam.school} logo`}
                              className="w-12 h-12 md:w-14 md:h-14 object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentNode.innerHTML = `<FontAwesome icon={faFootballBall} className="text-2xl" style={{color: '${getTeamColors(userData.favoriteTeam.school).primary}'}} />`;
                              }}
                            />
                          </div>
                          
                          {/* Floating Star Effect */}
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                            <FontAwesomeIcon icon={faStar} className="text-white text-xs" />
                          </div>
                        </div>
                        
                        {/* Team Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <FontAwesomeIcon 
                              icon={faFootballBall} 
                              className="text-lg"
                              style={{ color: getTeamColors(userData.favoriteTeam.school).primary }}
                            />
                            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">My Team</span>
                          </div>
                          <h3 
                            className="text-xl md:text-2xl font-bold mb-1"
                            style={{ 
                              background: `linear-gradient(45deg, ${getTeamColors(userData.favoriteTeam.school).primary}, ${getTeamColors(userData.favoriteTeam.school).secondary})`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          >
                            {userData.favoriteTeam.school}
                          </h3>
                          <p className="text-gray-600 font-medium">
                            {userData.favoriteTeam.mascot}
                          </p>
                          
                          {/* Team Stats or Conference (if available) */}
                          {userData.favoriteTeam.conference && (
                            <div className="mt-2 flex items-center space-x-2">
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                {userData.favoriteTeam.conference}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Decorative Elements */}
                      <div className="absolute top-2 right-2 w-8 h-8 opacity-20">
                        <FontAwesomeIcon 
                          icon={faTrophy} 
                          className="text-2xl"
                          style={{ color: getTeamColors(userData.favoriteTeam.school).primary }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Join Date */}
                <div className="flex items-center justify-center md:justify-start text-gray-500 text-sm">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                  Member since August 2025
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="px-6 py-2 gradient-bg text-white rounded-xl hover:shadow-xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <FontAwesomeIcon icon={faSave} className="mr-2" />
                      {isLoading ? (
                        uploadProgress > 0 && uploadProgress < 100 ? 
                          `Uploading photo... ${uploadProgress}%` : 
                          uploadProgress === 100 ?
                          'Saving profile...' :
                          'Saving...'
                      ) : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
                    >
                      <FontAwesomeIcon icon={faTimes} className="mr-2" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="px-6 py-2 gradient-bg text-white rounded-xl hover:shadow-xl transition-all duration-300 font-medium"
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Activity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Fan Stats Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_15px_35px_rgba(239,68,68,0.1)] p-6 relative overflow-hidden">
            <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-white/30 via-transparent to-red-50/20 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold gradient-text">Fan Stats</h3>
                <FontAwesomeIcon icon={faChartLine} className="text-xl" style={{background: 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Games Watched</span>
                  <span className="font-bold text-gray-800">127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Predictions Made</span>
                  <span className="font-bold text-gray-800">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Accuracy Rate</span>
                  <span className="font-bold text-green-600">73%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fan Level</span>
                  <span className="font-bold gradient-text">Elite</span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_15px_35px_rgba(239,68,68,0.1)] p-6 relative overflow-hidden">
            <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-white/30 via-transparent to-red-50/20 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold gradient-text">Achievements</h3>
                <FontAwesomeIcon icon={faTrophy} className="text-xl" style={{background: 'linear-gradient(135deg, rgb(255,193,7), rgb(255,179,0), rgb(255,160,0), rgb(255,179,0), rgb(255,193,7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgb(255,193,7), rgb(255,179,0), rgb(255,160,0), rgb(255,179,0), rgb(255,193,7))'}}>
                    <FontAwesomeIcon icon={faTrophy} className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Prediction Master</p>
                    <p className="text-sm text-gray-600">50+ correct predictions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))'}}>
                    <FontAwesomeIcon icon={faFireAlt} className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Hot Streak</p>
                    <p className="text-sm text-gray-600">10 game win streak</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgb(59,130,246), rgb(37,99,235), rgb(29,78,216), rgb(37,99,235), rgb(59,130,246))'}}>
                    <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Early Adopter</p>
                    <p className="text-sm text-gray-600">Joined in launch week</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_15px_35px_rgba(239,68,68,0.1)] p-6 relative overflow-hidden">
            <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-white/30 via-transparent to-red-50/20 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold gradient-text">Recent Activity</h3>
                <FontAwesomeIcon icon={faFireAlt} className="text-xl" style={{background: 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}} />
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Predicted Texas victory</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Joined FanHub discussion</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Updated team preferences</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Completed profile setup</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_25px_50px_rgba(239,68,68,0.15)] overflow-hidden">
          <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/40 via-transparent to-red-50/30 pointer-events-none"></div>
          <div className="relative z-10 p-8">
            <h2 className="text-2xl font-bold gradient-text mb-6">Preferences & Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Notification Settings</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" style={{accentColor: 'rgb(204,0,28)'}} />
                    <span className="text-gray-700">Game predictions</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" style={{accentColor: 'rgb(204,0,28)'}} />
                    <span className="text-gray-700">Breaking news</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" style={{accentColor: 'rgb(204,0,28)'}} />
                    <span className="text-gray-700">Weekly summaries</span>
                  </label>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Display Settings</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" style={{accentColor: 'rgb(204,0,28)'}} />
                    <span className="text-gray-700">Show team logos</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" style={{accentColor: 'rgb(204,0,28)'}} />
                    <span className="text-gray-700">Live score updates</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" style={{accentColor: 'rgb(204,0,28)'}} />
                    <span className="text-gray-700">Dark mode</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
