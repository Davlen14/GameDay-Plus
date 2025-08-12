import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faBell, faEye, faPalette, faLock, faTrash, faSignOutAlt, faSave } from '@fortawesome/free-solid-svg-icons';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    notifications: {
      gameAlerts: true,
      breakingNews: true,
      weeklyReports: false,
      emailNotifications: true,
      pushNotifications: true,
    },
    display: {
      darkMode: false,
      showTeamLogos: true,
      liveUpdates: true,
      animations: true,
    },
    privacy: {
      profileVisibility: 'public',
      showActivityStatus: true,
      dataSharing: false,
    }
  });

  const [saved, setSaved] = useState(false);

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSave = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userSettings');
    window.location.hash = 'home';
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmed) {
      localStorage.clear();
      window.location.hash = 'home';
    }
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden pt-16 pb-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full blur-3xl animate-pulse" style={{background: 'radial-gradient(circle, rgba(204,0,28,0.15) 0%, rgba(161,0,20,0.15) 50%, rgba(115,0,13,0.15) 100%)'}}></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s', background: 'radial-gradient(circle, rgba(204,0,28,0.10) 0%, rgba(161,0,20,0.10) 50%, rgba(115,0,13,0.10) 100%)' }}></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', background: 'radial-gradient(circle, rgba(204,0,28,0.08) 0%, rgba(161,0,20,0.08) 50%, rgba(115,0,13,0.08) 100%)' }}></div>
      </div>

      <div className="relative z-10 max-w-none mx-auto px-4" style={{width: '97%'}}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Settings</h1>
          <p className="text-gray-600">Customize your GAMEDAY+ experience</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_15px_35px_rgba(239,68,68,0.1)] p-6 relative overflow-hidden">
            <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-white/30 via-transparent to-red-50/20 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <FontAwesomeIcon icon={faBell} className="text-xl mr-3" style={{background: 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}} />
                <h2 className="text-xl font-bold gradient-text">Notifications</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-gray-700">Game Alerts</span>
                    <input
                      type="checkbox"
                      checked={settings.notifications.gameAlerts}
                      onChange={(e) => handleSettingChange('notifications', 'gameAlerts', e.target.checked)}
                      style={{accentColor: 'rgb(204,0,28)'}}
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-gray-700">Breaking News</span>
                    <input
                      type="checkbox"
                      checked={settings.notifications.breakingNews}
                      onChange={(e) => handleSettingChange('notifications', 'breakingNews', e.target.checked)}
                      style={{accentColor: 'rgb(204,0,28)'}}
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-gray-700">Weekly Reports</span>
                    <input
                      type="checkbox"
                      checked={settings.notifications.weeklyReports}
                      onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
                      style={{accentColor: 'rgb(204,0,28)'}}
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-gray-700">Email Notifications</span>
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                      style={{accentColor: 'rgb(204,0,28)'}}
                    />
                  </label>
              </div>
            </div>
          </div>

          {/* Display */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_15px_35px_rgba(239,68,68,0.1)] p-6 relative overflow-hidden">
            <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-white/30 via-transparent to-red-50/20 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <FontAwesomeIcon icon={faEye} className="text-xl mr-3" style={{background: 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}} />
                <h2 className="text-xl font-bold gradient-text">Display & Appearance</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-700">Dark Mode</span>
                  <input
                    type="checkbox"
                    checked={settings.display.darkMode}
                    onChange={(e) => handleSettingChange('display', 'darkMode', e.target.checked)}
                    style={{accentColor: 'rgb(204,0,28)'}}
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-700">Show Team Logos</span>
                  <input
                    type="checkbox"
                    checked={settings.display.showTeamLogos}
                    onChange={(e) => handleSettingChange('display', 'showTeamLogos', e.target.checked)}
                    style={{accentColor: 'rgb(204,0,28)'}}
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-700">Live Updates</span>
                  <input
                    type="checkbox"
                    checked={settings.display.liveUpdates}
                    onChange={(e) => handleSettingChange('display', 'liveUpdates', e.target.checked)}
                    style={{accentColor: 'rgb(204,0,28)'}}
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-700">Animations</span>
                  <input
                    type="checkbox"
                    checked={settings.display.animations}
                    onChange={(e) => handleSettingChange('display', 'animations', e.target.checked)}
                    style={{accentColor: 'rgb(204,0,28)'}}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_15px_35px_rgba(239,68,68,0.1)] p-6 relative overflow-hidden">
            <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-white/30 via-transparent to-red-50/20 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <FontAwesomeIcon icon={faLock} className="text-xl mr-3" style={{background: 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}} />
                <h2 className="text-xl font-bold gradient-text">Privacy & Security</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Profile Visibility</label>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                    className="w-full p-3 bg-white/60 backdrop-blur-lg border border-white/40 rounded-xl focus:outline-none" style={{borderColor: 'rgba(204,0,28,0.3)', focusBorderColor: 'rgb(204,0,28)'}}
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-700">Show Activity Status</span>
                  <input
                    type="checkbox"
                    checked={settings.privacy.showActivityStatus}
                    onChange={(e) => handleSettingChange('privacy', 'showActivityStatus', e.target.checked)}
                    style={{accentColor: 'rgb(204,0,28)'}}
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-700">Allow Data Sharing for Analytics</span>
                  <input
                    type="checkbox"
                    checked={settings.privacy.dataSharing}
                    onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.checked)}
                    style={{accentColor: 'rgb(204,0,28)'}}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_15px_35px_rgba(239,68,68,0.1)] p-6 relative overflow-hidden">
            <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-white/30 via-transparent to-red-50/20 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      saved 
                        ? 'bg-green-500 text-white' 
                        : 'gradient-bg text-white hover:shadow-xl transform hover:scale-[1.02]'
                    }`}
                  >
                    <FontAwesomeIcon icon={faSave} className="mr-2" style={{background: 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}} />
                    {saved ? 'Saved!' : 'Save Settings'}
                  </button>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" style={{background: 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}} />
                    Logout
                  </button>
                  
                  <button
                    onClick={handleDeleteAccount}
                    className="px-6 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-300 font-medium"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-2" style={{background: 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}} />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
