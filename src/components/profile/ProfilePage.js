import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faEdit, faSave, faTimes, faUser, faEnvelope, faCalendarAlt, faFootballBall, faTrophy, faChartLine, faFireAlt } from '@fortawesome/free-solid-svg-icons';
import './ProfilePage.css';

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);

  useEffect(() => {
    // Load user profile from localStorage
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      const parsedProfile = JSON.parse(profile);
      setUserProfile(parsedProfile);
      setEditData(parsedProfile);
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...userProfile });
  };

  const handleSave = () => {
    // Update localStorage with new data
    localStorage.setItem('userProfile', JSON.stringify(editData));
    setUserProfile(editData);
    setIsEditing(false);
    
    // Trigger storage event for header update
    window.dispatchEvent(new Event('storage'));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...userProfile });
    setProfilePhotoPreview(null);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhotoUrl = e.target.result;
        setProfilePhotoPreview(newPhotoUrl);
        setEditData({ ...editData, photo: newPhotoUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-white/60 backdrop-blur-lg border border-white/40 flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-transparent" style={{borderTopColor: 'rgb(204,0,28)'}}></div>
          </div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden pt-16 pb-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-red-600/15 to-red-800/15 rounded-full blur-3xl animate-pulse" style={{background: 'radial-gradient(circle, rgba(204,0,28,0.15) 0%, rgba(161,0,20,0.15) 50%, rgba(115,0,13,0.15) 100%)'}}></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-r from-red-600/10 to-red-800/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s', background: 'radial-gradient(circle, rgba(204,0,28,0.10) 0%, rgba(161,0,20,0.10) 50%, rgba(115,0,13,0.10) 100%)' }}></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-r from-red-600/8 to-red-800/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', background: 'radial-gradient(circle, rgba(204,0,28,0.08) 0%, rgba(161,0,20,0.08) 50%, rgba(115,0,13,0.08) 100%)' }}></div>
        <div className="absolute top-1/6 right-1/3 w-20 h-20 bg-gradient-to-r from-red-600/12 to-red-800/12 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s', background: 'radial-gradient(circle, rgba(204,0,28,0.12) 0%, rgba(161,0,20,0.12) 50%, rgba(115,0,13,0.12) 100%)' }}></div>
      </div>

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
                  {(profilePhotoPreview || userProfile.photo) ? (
                    <img 
                      src={profilePhotoPreview || userProfile.photo} 
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
                  <label className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg" style={{background: 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))'}}>
                    <FontAwesomeIcon icon={faCamera} className="text-white text-sm" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload}
                      className="hidden" 
                    />
                  </label>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="text-3xl font-bold bg-white/60 backdrop-blur-lg border border-white/40 rounded-xl px-4 py-2 w-full gradient-text focus:outline-none focus:border-red-500"
                      placeholder="Full Name"
                    />
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="text-gray-600 bg-white/60 backdrop-blur-lg border border-white/40 rounded-xl px-4 py-2 w-full focus:outline-none focus:border-red-500"
                      placeholder="Email"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold gradient-text mb-2">{userProfile.name}</h1>
                    <p className="text-gray-600 mb-4 flex items-center justify-center md:justify-start">
                      <FontAwesomeIcon icon={faEnvelope} className="mr-2" style={{background: 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}} />
                      {userProfile.email}
                    </p>
                  </>
                )}

                {/* Team Affiliation */}
                {userProfile.team && (
                  <div className="flex items-center justify-center md:justify-start mb-4">
                    <FontAwesomeIcon icon={faFootballBall} className="mr-2" style={{background: 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}} />
                    <span className="text-gray-700 font-medium">
                      {userProfile.team.school} {userProfile.team.mascot}
                    </span>
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
                      className="px-6 py-2 gradient-bg text-white rounded-xl hover:shadow-xl transition-all duration-300 font-medium"
                    >
                      <FontAwesomeIcon icon={faSave} className="mr-2" />
                      Save Changes
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

      {/* Decorative glass elements */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-xl animate-pulse" style={{background: 'radial-gradient(circle, rgba(204,0,28,0.20) 0%, rgba(161,0,20,0.20) 50%, rgba(115,0,13,0.20) 100%)'}}></div>
      <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s', background: 'radial-gradient(circle, rgba(204,0,28,0.15) 0%, rgba(161,0,20,0.15) 50%, rgba(115,0,13,0.15) 100%)' }}></div>
      <div className="absolute top-1/2 -right-4 w-12 h-12 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2s', background: 'radial-gradient(circle, rgba(204,0,28,0.25) 0%, rgba(161,0,20,0.25) 50%, rgba(115,0,13,0.25) 100%)' }}></div>
      <div className="absolute top-1/4 -left-4 w-16 h-16 rounded-full blur-lg animate-pulse" style={{ animationDelay: '0.5s', background: 'radial-gradient(circle, rgba(204,0,28,0.18) 0%, rgba(161,0,20,0.18) 50%, rgba(115,0,13,0.18) 100%)' }}></div>
    </div>
  );
};

export default ProfilePage;
