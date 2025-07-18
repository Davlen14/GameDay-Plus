import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faApple, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
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
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [teamSearch, setTeamSearch] = useState('');
  const [signupStep, setSignupStep] = useState(1); // 1 = basic info, 2 = team selection
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  
  // Enhanced FBS teams data with more teams and better logos
  const fbsTeams = [
    { id: 1, school: 'Alabama', mascot: 'Crimson Tide', conference: 'SEC', logo: '/team_logos/alabama.png', color: '#9E1B32', altColor: '#FFFFFF' },
    { id: 2, school: 'Georgia', mascot: 'Bulldogs', conference: 'SEC', logo: '/team_logos/georgia.png', color: '#BA0C2F', altColor: '#000000' },
    { id: 3, school: 'Ohio State', mascot: 'Buckeyes', conference: 'Big Ten', logo: '/team_logos/ohio-state.png', color: '#BB0000', altColor: '#FFFFFF' },
    { id: 4, school: 'Michigan', mascot: 'Wolverines', conference: 'Big Ten', logo: '/team_logos/michigan.png', color: '#00274C', altColor: '#FFCB05' },
    { id: 5, school: 'Texas', mascot: 'Longhorns', conference: 'Big 12', logo: '/team_logos/texas.png', color: '#BF5700', altColor: '#FFFFFF' },
    { id: 6, school: 'Oklahoma', mascot: 'Sooners', conference: 'Big 12', logo: '/team_logos/oklahoma.png', color: '#841617', altColor: '#FDF5E6' },
    { id: 7, school: 'Clemson', mascot: 'Tigers', conference: 'ACC', logo: '/team_logos/clemson.png', color: '#F56600', altColor: '#522D80' },
    { id: 8, school: 'Florida State', mascot: 'Seminoles', conference: 'ACC', logo: '/team_logos/florida-state.png', color: '#782F40', altColor: '#CEB888' },
    { id: 9, school: 'USC', mascot: 'Trojans', conference: 'Pac-12', logo: '/team_logos/usc.png', color: '#990000', altColor: '#FFCC00' },
    { id: 10, school: 'Oregon', mascot: 'Ducks', conference: 'Pac-12', logo: '/team_logos/oregon.png', color: '#154734', altColor: '#FEE123' },
    { id: 11, school: 'Notre Dame', mascot: 'Fighting Irish', conference: 'FBS Independents', logo: '/team_logos/notre-dame.png', color: '#0C2340', altColor: '#C99700' },
    { id: 12, school: 'LSU', mascot: 'Tigers', conference: 'SEC', logo: '/team_logos/lsu.png', color: '#461D7C', altColor: '#FDD023' },
    { id: 13, school: 'Florida', mascot: 'Gators', conference: 'SEC', logo: '/team_logos/florida.png', color: '#0021A5', altColor: '#FA4616' },
    { id: 14, school: 'Penn State', mascot: 'Nittany Lions', conference: 'Big Ten', logo: '/team_logos/penn-state.png', color: '#041E42', altColor: '#FFFFFF' },
    { id: 15, school: 'Miami', mascot: 'Hurricanes', conference: 'ACC', logo: '/team_logos/miami.png', color: '#F47321', altColor: '#005030' },
    // Add more teams as needed
  ];

  const handleSocialLogin = (provider) => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      console.log(`Logging in with ${provider}`);
      // Here you would implement actual social authentication
      // For testing, simulate successful login
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userProfile', JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        photo: null,
        team: null
      }));
      window.location.hash = 'home-page';
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Test credentials for easy testing
    const testEmail = 'test@gameday.com';
    const testPassword = 'password123';
    
    // Simulate form submission
    setTimeout(() => {
      setIsLoading(false);
      
      if (!isSignUp) {
        // Sign in logic
        if (email === testEmail && password === testPassword) {
          console.log('Login successful');
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userProfile', JSON.stringify({
            name: 'Test User',
            email: testEmail,
            photo: '/photos/default-avatar.png',
            team: selectedTeam || { school: 'Alabama', mascot: 'Crimson Tide' }
          }));
          window.location.hash = 'home-page';
        } else {
          alert('Invalid credentials. Use test@gameday.com / password123');
        }
      } else {
        // Sign up - go to team selection step
        if (signupStep === 1) {
          setSignupStep(2);
        } else {
          // Complete signup
          console.log('Sign up data:', { 
            firstName, 
            lastName, 
            email, 
            password, 
            profilePhoto,
            selectedTeam 
          });
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userProfile', JSON.stringify({
            name: `${firstName} ${lastName}`,
            email: email,
            photo: profilePhotoPreview,
            team: selectedTeam
          }));
          window.location.hash = 'home-page';
        }
      }
    }, 1500);
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

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
  };

  const nextTeam = () => {
    setCurrentTeamIndex((prev) => (prev + 1) % fbsTeams.length);
  };

  const prevTeam = () => {
    setCurrentTeamIndex((prev) => (prev - 1 + fbsTeams.length) % fbsTeams.length);
  };

  const goToTeam = (index) => {
    setCurrentTeamIndex(index);
  };

  const skipTeamSelection = () => {
    setSelectedTeam(null);
    setSignupStep(1);
    // Complete signup without team
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userProfile', JSON.stringify({
      name: `${firstName} ${lastName}`,
      email: email,
      photo: profilePhotoPreview,
      team: null
    }));
    window.location.hash = 'home-page';
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
                <div className="mb-8">
                  <h2 className="text-3xl font-bold gradient-text mb-2">Pick Your Affiliation</h2>
                  <p className="text-gray-600 text-sm">Choose your favorite college football team</p>
                  <div className="flex justify-center mt-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-600 to-red-800"></div>
                    </div>
                  </div>
                </div>

                {/* Team Slider */}
                <div className="relative mb-8">
                  {/* Main Team Display */}
                  <div className="relative h-80 overflow-hidden rounded-2xl">
                    <div 
                      className="flex transition-transform duration-500 ease-in-out h-full"
                      style={{ transform: `translateX(-${currentTeamIndex * 100}%)` }}
                    >
                      {fbsTeams.map((team, index) => (
                        <div
                          key={team.id}
                          className="min-w-full h-full flex flex-col items-center justify-center p-8 relative"
                          style={{
                            background: `linear-gradient(135deg, ${team.color}15, ${team.altColor}10)`
                          }}
                        >
                          {/* Team Logo */}
                          <div className="w-32 h-32 mb-6 flex items-center justify-center">
                            <img
                              src={team.logo}
                              alt={team.school}
                              className="w-full h-full object-contain filter drop-shadow-2xl"
                              onError={(e) => {
                                e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="${encodeURIComponent(team.color)}" rx="16"/><text x="64" y="70" font-family="Arial" font-size="20" fill="white" text-anchor="middle">${team.school.charAt(0)}</text></svg>`;
                              }}
                            />
                          </div>
                          
                          {/* Team Info */}
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">{team.school}</h3>
                          <p className="text-lg text-gray-600 mb-1">{team.mascot}</p>
                          <p className="text-sm font-medium" style={{ color: team.color }}>{team.conference}</p>
                          
                          {/* Team Colors Bar */}
                          <div 
                            className="w-20 h-1 rounded-full mt-4"
                            style={{
                              background: `linear-gradient(90deg, ${team.color}, ${team.altColor})`
                            }}
                          />
                        </div>
                      ))}
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
                <div className="flex justify-center mb-8 space-x-2 overflow-x-auto px-4">
                  {fbsTeams.map((_, index) => (
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
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleTeamSelect(fbsTeams[currentTeamIndex])}
                    className="w-full h-12 gradient-bg text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                  >
                    <span className="relative z-10">Choose {fbsTeams[currentTeamIndex].school}</span>
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
