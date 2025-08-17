import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faApple, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { teamService } from '../../services/teamService';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { 
    signIn, 
    signUp, 
    signInWithGoogle, 
    signInWithFacebook, 
    signInWithApple,
    loading: authLoading,
    authError 
  } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Additional signup fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [signupStep, setSignupStep] = useState(1); // 1 = basic info, 2 = team selection
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [fbsTeams, setFbsTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Load real FBS teams data
  useEffect(() => {
    const loadTeams = async () => {
      if (signupStep === 2 && fbsTeams.length === 0) {
        setTeamsLoading(true);
        try {
          const realTeams = await teamService.getFBSTeams(true);
          const filteredTeams = realTeams.filter(team => team.school);
          setFbsTeams(filteredTeams);
          setFilteredTeams(filteredTeams); // Initialize filtered teams
        } catch (error) {
          console.error('Error loading teams:', error);
          // Fallback to a few basic teams if API fails
          setFbsTeams([
            { id: 1, school: 'Alabama', mascot: 'Crimson Tide', conference: 'SEC', logos: ['/team_logos/alabama.png'], color: '#9E1B32', alternateColor: '#FFFFFF' },
            { id: 2, school: 'Georgia', mascot: 'Bulldogs', conference: 'SEC', logos: ['/team_logos/georgia.png'], color: '#BA0C2F', alternateColor: '#000000' },
            { id: 3, school: 'Ohio State', mascot: 'Buckeyes', conference: 'Big Ten', logos: ['/team_logos/ohio-state.png'], color: '#BB0000', alternateColor: '#FFFFFF' },
          ]);
        } finally {
          setTeamsLoading(false);
        }
      }
    };
    loadTeams();
  }, [signupStep, fbsTeams.length]);

  // Filter teams based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTeams(fbsTeams);
      setShowSearchResults(false);
    } else {
      const filtered = fbsTeams.filter(team => 
        team.school?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.mascot?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.conference?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTeams(filtered);
      setShowSearchResults(true);
    }
  }, [searchQuery, fbsTeams]);

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    
    try {
      let user;
      
      switch (provider) {
        case 'google':
          user = await signInWithGoogle();
          break;
        case 'facebook':
          user = await signInWithFacebook();
          break;
        case 'apple':
          user = await signInWithApple();
          break;
        default:
          throw new Error('Unknown provider');
      }

      if (user) {
        navigate('/profile');
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      // Error is already handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!isSignUp) {
        // Sign in with Firebase
        const user = await signIn(email, password);
        if (user) {
          navigate('/profile');
        }
      } else {
        // Sign up logic - only handle step 1 (account details)
        if (signupStep === 1) {
          // Validate first step
          if (!firstName || !lastName || !email || !password) {
            alert('Please fill in all required fields');
            setIsLoading(false);
            return;
          }
          if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            setIsLoading(false);
            return;
          }
          setSignupStep(2);
          setIsLoading(false);
        }
        // Step 2 (team selection) is handled by handleTeamSelect or skipTeamSelection
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // Error is already handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTeamSelect = async (team) => {
    setSelectedTeam(team);
    setIsLoading(true);
    
    try {
      // Complete signup with selected team
      const displayName = `${firstName} ${lastName}`;
      const additionalData = {
        firstName,
        lastName,
        displayName,
        favoriteTeam: team,
        profileSetupComplete: true,
        photoURL: profilePhotoPreview || null
      };

      const user = await signUp(email, password, additionalData);
      if (user) {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Team selection signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextTeam = () => {
    setCurrentTeamIndex((prev) => 
      prev < fbsTeams.length - 1 ? prev + 1 : 0
    );
  };

  const prevTeam = () => {
    setCurrentTeamIndex((prev) => 
      prev > 0 ? prev - 1 : fbsTeams.length - 1
    );
  };

  const goToTeam = (index) => {
    setCurrentTeamIndex(index);
  };

  const handleSearchSelect = (team) => {
    const teamIndex = fbsTeams.findIndex(t => t.id === team.id);
    setCurrentTeamIndex(teamIndex);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      clearSearch();
    } else if (e.key === 'Enter' && filteredTeams.length > 0) {
      handleSearchSelect(filteredTeams[0]);
    }
  };

  const skipTeamSelection = async () => {
    setSelectedTeam(null);
    setIsLoading(true);
    
    try {
      // Complete signup without team
      const displayName = `${firstName} ${lastName}`;
      const additionalData = {
        firstName,
        lastName,
        displayName,
        favoriteTeam: null,
        profileSetupComplete: true,
        photoURL: profilePhotoPreview || null
      };

      const user = await signUp(email, password, additionalData);
      if (user) {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Skip team signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex items-center justify-center relative overflow-hidden pt-8 pb-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        {/* Floating gradient orbs with modern red gradient */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-red-600/15 to-red-800/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-r from-red-600/10 to-red-800/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-r from-red-600/8 to-red-800/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/6 right-1/3 w-20 h-20 bg-gradient-to-r from-red-600/12 to-red-800/12 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Login Modal */}
      <div className="relative w-full max-w-md mx-4 animate-fade-in z-10">
        {/* Glass Container */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_25px_50px_rgba(239,68,68,0.15)] overflow-hidden">
          {/* Gradient overlay for glass effect */}
          <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/40 via-transparent to-red-50/30 pointer-events-none"></div>
          
          {/* Content */}
          <div className="relative z-10 p-8">
            {/* Team Affiliation Step */}
            {isSignUp && signupStep === 2 ? (
              <div className="text-center">
                {/* Step Header */}
                <div className="mb-6">
                  <h2 className="text-3xl font-bold gradient-text mb-2">Pick Your Affiliation</h2>
                  <p className="text-gray-600 text-sm">Choose your favorite college football team</p>
                  <div className="flex justify-center mt-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-600 to-red-800"></div>
                    </div>
                  </div>
                </div>

                {/* Modern Search Bar */}
                <div className="relative mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Search teams, mascots, or conferences..."
                      className="w-full h-12 pl-12 pr-10 bg-white/60 backdrop-blur-lg border border-white/40 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600/50 transition-all duration-300 shadow-lg"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <i className="fas fa-search text-gray-400 text-lg"></i>
                    </div>
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center transition-colors duration-200"
                      >
                        <i className="fas fa-times text-gray-600 text-xs"></i>
                      </button>
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {showSearchResults && filteredTeams.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-lg border border-white/40 rounded-xl shadow-xl max-h-64 overflow-y-auto z-50">
                      {filteredTeams.slice(0, 8).map((team) => {
                        const teamLogo = team.logos?.[0];
                        const teamColor = team.color || '#cc001c';
                        
                        return (
                          <button
                            key={team.id}
                            onClick={() => handleSearchSelect(team)}
                            className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-white/50 transition-colors duration-200 border-b border-gray-100/50 last:border-b-0"
                          >
                            <div className="w-8 h-8 flex-shrink-0">
                              {teamLogo ? (
                                <img
                                  src={teamLogo}
                                  alt={team.school}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="${encodeURIComponent(teamColor)}" rx="4"/><text x="16" y="20" font-family="Arial" font-size="12" fill="white" text-anchor="middle">${team.school.charAt(0)}</text></svg>`;
                                  }}
                                />
                              ) : (
                                <div 
                                  className="w-full h-full rounded flex items-center justify-center text-white text-xs font-bold"
                                  style={{ backgroundColor: teamColor }}
                                >
                                  {team.school.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium text-gray-800 text-sm">{team.school}</div>
                              <div className="text-xs text-gray-500">{team.mascot} • {team.conference}</div>
                            </div>
                          </button>
                        );
                      })}
                      {filteredTeams.length > 8 && (
                        <div className="px-4 py-2 text-center text-xs text-gray-500 border-t border-gray-100/50">
                          +{filteredTeams.length - 8} more teams match your search
                        </div>
                      )}
                    </div>
                  )}

                  {/* No Results Message */}
                  {showSearchResults && filteredTeams.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-lg border border-white/40 rounded-xl shadow-xl p-4 z-50">
                      <div className="text-center text-gray-500">
                        <i className="fas fa-search text-2xl mb-2"></i>
                        <p className="text-sm">No teams found matching "{searchQuery}"</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Loading State */}
                {teamsLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-white/60 backdrop-blur-lg border border-white/40 flex items-center justify-center mx-auto mb-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-transparent border-t-red-600"></div>
                      </div>
                      <p className="text-gray-600">Loading teams...</p>
                    </div>
                  </div>
                ) : fbsTeams.length > 0 ? (
                  <>
                    {/* Search Hint */}
                    {!showSearchResults && (
                      <div className="text-center mb-4">
                        <p className="text-gray-500 text-xs">
                          💡 Use the search above or browse through the carousel below
                        </p>
                      </div>
                    )}

                    {/* Team Slider */}
                    <div className="relative mb-8"
                         style={{ display: showSearchResults ? 'none' : 'block' }}
                    >
                      {/* Main Team Display */}
                      <div className="relative h-80 overflow-hidden rounded-2xl">
                        <div 
                          className="flex transition-transform duration-500 ease-in-out h-full"
                          style={{ transform: `translateX(-${currentTeamIndex * 100}%)` }}
                        >
                          {fbsTeams.map((team, index) => {
                            const teamLogo = team.logos?.[0];
                            const teamColor = team.color || '#cc001c';
                            const teamAltColor = team.alternateColor || '#ffffff';
                            
                            return (
                              <div
                                key={team.id}
                                className="min-w-full h-full flex flex-col items-center justify-center p-8 relative"
                                style={{
                                  background: `linear-gradient(135deg, ${teamColor}15, ${teamAltColor}10)`
                                }}
                              >
                                {/* Team Logo */}
                                <div className="w-32 h-32 mb-6 flex items-center justify-center">
                                  {teamLogo ? (
                                    <img
                                      src={teamLogo}
                                      alt={team.school}
                                      className="w-full h-full object-contain filter drop-shadow-2xl"
                                      onError={(e) => {
                                        e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="${encodeURIComponent(teamColor)}" rx="16"/><text x="64" y="70" font-family="Arial" font-size="20" fill="white" text-anchor="middle">${team.school.charAt(0)}</text></svg>`;
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <i className="fas fa-university text-gray-400 text-6xl"></i>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Team Info */}
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">{team.school}</h3>
                                <p className="text-lg text-gray-600 mb-1">{team.mascot}</p>
                                <p className="text-sm font-medium" style={{ color: teamColor }}>{team.conference}</p>
                                
                                {/* Team Colors Bar */}
                                <div 
                                  className="w-20 h-1 rounded-full mt-4"
                                  style={{
                                    background: `linear-gradient(90deg, ${teamColor}, ${teamAltColor})`
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Navigation Arrows */}
                      <button
                        onClick={prevTeam}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-lg rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 flex items-center justify-center z-10"
                      >
                        <i className="fas fa-chevron-left text-gray-700"></i>
                      </button>
                      
                      <button
                        onClick={nextTeam}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-lg rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 flex items-center justify-center z-10"
                      >
                        <i className="fas fa-chevron-right text-gray-700"></i>
                      </button>
                    </div>

                    {/* Team Dots Indicator */}
                    <div className="flex justify-center mb-8 space-x-2 overflow-x-auto px-4 max-h-8"
                         style={{ display: showSearchResults ? 'none' : 'flex' }}
                    >
                      {fbsTeams.slice(0, Math.min(fbsTeams.length, 20)).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToTeam(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentTeamIndex 
                              ? 'bg-gradient-to-r from-red-600 to-red-800 scale-125' 
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                      {fbsTeams.length > 20 && (
                        <span className="text-gray-500 text-sm ml-2">+{fbsTeams.length - 20} more</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => handleTeamSelect(fbsTeams[currentTeamIndex])}
                        className="w-full h-12 gradient-bg text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                      >
                        <span className="relative z-10">Choose {fbsTeams[currentTeamIndex]?.school}</span>
                        <div className="absolute inset-0 -top-full group-hover:top-0 bg-gradient-to-b from-white/20 to-transparent transition-all duration-500"></div>
                      </button>
                      
                      <button
                        onClick={skipTeamSelection}
                        className="w-full h-12 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300"
                      >
                        Skip for now
                      </button>
                      
                      <button
                        onClick={() => setSignupStep(1)}
                        className="w-full text-gray-500 hover:text-gray-700 transition-colors text-sm"
                      >
                        ← Back to account details
                      </button>
                    </div>
                  </>
                ) : (
                  /* Error State */
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-white/60 backdrop-blur-lg border border-white/40 flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-exclamation-triangle text-yellow-500 text-2xl"></i>
                      </div>
                      <p className="text-gray-600 mb-4">Unable to load teams</p>
                      <button
                        onClick={skipTeamSelection}
                        className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Continue without team selection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Regular Sign In / Sign Up Form */
              <>
                {/* Welcome text */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold gradient-text mb-2">
                    {isSignUp ? 'Join the Game' : 'Welcome Back'}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {isSignUp 
                      ? 'Create your account to access premium features' 
                      : 'Sign in to continue your journey'
                    }
                  </p>
                  {isSignUp && (
                    <div className="flex justify-center mt-4">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-600 to-red-800"></div>
                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Social login buttons */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => handleSocialLogin('Google')}
                    disabled={isLoading}
                    className="social-btn w-full h-12 bg-white/60 backdrop-blur-lg border border-white/40 rounded-xl flex items-center justify-center space-x-3 hover:bg-white/80 hover:border-white/60 transition-all duration-300 group disabled:opacity-50 shadow-lg"
                  >
                    <FontAwesomeIcon 
                      icon={faGoogle} 
                      className="text-gray-700 text-lg group-hover:scale-110 transition-transform duration-300" 
                    />
                    <span className="text-gray-700 font-medium">Continue with Google</span>
                  </button>

                  <button
                    onClick={() => handleSocialLogin('Apple')}
                    disabled={isLoading}
                    className="social-btn w-full h-12 bg-white/60 backdrop-blur-lg border border-white/40 rounded-xl flex items-center justify-center space-x-3 hover:bg-white/80 hover:border-white/60 transition-all duration-300 group disabled:opacity-50 shadow-lg"
                  >
                    <FontAwesomeIcon 
                      icon={faApple} 
                      className="text-gray-700 text-lg group-hover:scale-110 transition-transform duration-300" 
                    />
                    <span className="text-gray-700 font-medium">Continue with Apple</span>
                  </button>

                  <button
                    onClick={() => handleSocialLogin('Facebook')}
                    disabled={isLoading}
                    className="social-btn w-full h-12 bg-white/60 backdrop-blur-lg border border-white/40 rounded-xl flex items-center justify-center space-x-3 hover:bg-white/80 hover:border-white/60 transition-all duration-300 group disabled:opacity-50 shadow-lg"
                  >
                    <FontAwesomeIcon 
                      icon={faFacebook} 
                      className="text-gray-700 text-lg group-hover:scale-110 transition-transform duration-300" 
                    />
                    <span className="text-gray-700 font-medium">Continue with Facebook</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="px-4 text-gray-500 text-sm">or</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                {/* Email/Password form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Sign Up Extra Fields */}
                  {isSignUp && (
                    <>
                      {/* Profile Photo Upload */}
                      <div className="text-center mb-6">
                        <div className="relative inline-block">
                          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                            {profilePhotoPreview ? (
                              <img src={profilePhotoPreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <i className="fas fa-user text-gray-400 text-2xl"></i>
                              </div>
                            )}
                          </div>
                          <label className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg">
                            <i className="fas fa-camera text-white text-sm"></i>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handlePhotoUpload}
                              className="hidden" 
                            />
                          </label>
                        </div>
                        <p className="text-gray-500 text-xs mt-2">Add your profile photo</p>
                      </div>

                      {/* Name Fields */}
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="First name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="h-12 bg-white/60 backdrop-blur-lg border border-white/40 rounded-xl px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/80 transition-all duration-300 shadow-lg"
                        />
                        <input
                          type="text"
                          placeholder="Last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="h-12 bg-white/60 backdrop-blur-lg border border-white/40 rounded-xl px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/80 transition-all duration-300 shadow-lg"
                        />
                      </div>
                    </>
                  )}

                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full h-12 bg-white/60 backdrop-blur-lg border border-white/40 rounded-xl px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/80 transition-all duration-300 shadow-lg"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full h-12 bg-white/60 backdrop-blur-lg border border-white/40 rounded-xl px-4 pr-12 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/80 transition-all duration-300 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>

                  {/* Forgot password link (only for sign in) */}
                  {!isSignUp && (
                    <>
                      <div className="text-right">
                        <button
                          type="button"
                          className="gradient-text hover:opacity-80 text-sm transition-all duration-300"
                        >
                          Forgot password?
                        </button>
                      </div>
                      {/* Test credentials note */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-700 text-xs font-medium mb-1">Test Credentials:</p>
                        <p className="text-blue-600 text-xs">Email: test@gameday.com</p>
                        <p className="text-blue-600 text-xs">Password: password123</p>
                      </div>
                    </>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 gradient-bg text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                  >
                    <span className="relative z-10">
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Please wait...</span>
                        </div>
                      ) : (
                        isSignUp ? 'Continue' : 'Sign In'
                      )}
                    </span>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -top-full group-hover:top-0 bg-gradient-to-b from-white/20 to-transparent transition-all duration-500"></div>
                  </button>
                </form>

                {/* Toggle between sign in/sign up */}
                <div className="text-center mt-6">
                  <span className="text-gray-600 text-sm">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  </span>
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setSignupStep(1);
                    }}
                    className="ml-2 gradient-text hover:opacity-80 text-sm font-medium transition-all duration-300"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </div>

                {/* Terms text for sign up */}
                {isSignUp && (
                  <p className="text-center text-gray-500 text-xs mt-4 leading-relaxed">
                    By creating an account, you agree to our{' '}
                    <button className="gradient-text hover:opacity-80 transition-all duration-300">
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button className="gradient-text hover:opacity-80 transition-all duration-300">
                      Privacy Policy
                    </button>
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Decorative glass elements */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-r from-red-600/15 to-red-800/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 -right-4 w-12 h-12 bg-gradient-to-r from-red-600/25 to-red-800/25 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/4 -left-4 w-16 h-16 bg-gradient-to-r from-red-600/18 to-red-800/18 rounded-full blur-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );
};

export default LoginPage;
