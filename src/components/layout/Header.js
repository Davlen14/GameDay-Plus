import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faBars } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdowns, setActiveDropdowns] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Check login status on component mount and when localStorage changes
  React.useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const profile = localStorage.getItem('userProfile');
      setIsLoggedIn(loggedIn);
      if (loggedIn && profile) {
        setUserProfile(JSON.parse(profile));
      }
    };

    checkLoginStatus();
    
    // Listen for storage changes (in case user logs in/out in another tab)
    window.addEventListener('storage', checkLoginStatus);
    
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleMobileDropdown = (index) => {
    if (activeDropdowns.includes(index)) {
      setActiveDropdowns(activeDropdowns.filter(i => i !== index));
    } else {
      setActiveDropdowns([...activeDropdowns, index]);
    }
  };

  const navigateTo = (page) => {
    window.location.hash = page;
    setMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const openLoginModal = () => {
    navigateTo('login');
    setMobileMenuOpen(false); // Close mobile menu if open
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userProfile');
    setIsLoggedIn(false);
    setUserProfile(null);
    navigateTo('home');
  };

  const openProfile = () => {
    navigateTo('profile');
    setMobileMenuOpen(false);
  };

  const openSettings = () => {
    navigateTo('settings');
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white bg-opacity-95 shadow-lg z-50 py-4 px-8 border-b border-gray-200 backdrop-filter backdrop-blur-md">
      <nav className="flex items-center justify-between w-full max-w-none">
        {/* Logo - Far Left */}
        <div className="flex items-center pr-4">
          <button 
            onClick={() => navigateTo('home')} 
            className="text-3xl header-logo gradient-text hover:opacity-80 transition duration-300 cursor-pointer bg-transparent border-none p-0"
          >
            GAMEDAY+
          </button>
        </div>
        
        {/* Desktop Navigation - Centered and Spread */}
        <div className="hidden lg:flex space-x-8 text-sm font-bold flex-1 justify-center">
          <button 
            onClick={() => navigateTo('home-page')} 
            className="gradient-text hover:opacity-80 transition duration-300 font-extrabold bg-transparent border-none p-0 cursor-pointer"
          >
            Home
          </button>
          
          <button 
            onClick={() => navigateTo('fanhub-central')} 
            className="gradient-text hover:opacity-80 transition duration-300 font-extrabold bg-transparent border-none p-0 cursor-pointer"
          >
            FanHub
          </button>
          
          {/* Teams & Conferences Dropdown */}
          <div className="dropdown">
            <button className="dropdown-button gradient-text hover:opacity-80 transition duration-300">
              Teams & Conferences <FontAwesomeIcon icon={faChevronDown} className="text-xs icon-gradient" />
            </button>
            <div className="dropdown-content">
              <a href="#teams"><i className="fas fa-users icon-gradient"></i> <span>All Teams</span></a>
              <a href="#sec">
                <img src="/photos/SEC.png" alt="SEC" className="w-6 h-6 object-contain" />
                <span>SEC</span>
              </a>
              <a href="#big-ten">
                <img src="/photos/Big Ten.png" alt="Big Ten" className="w-6 h-6 object-contain" />
                <span>Big Ten</span>
              </a>
              <a href="#acc">
                <img src="/photos/ACC.png" alt="ACC" className="w-6 h-6 object-contain" />
                <span>ACC</span>
              </a>
              <a href="#big-12">
                <img src="/photos/Big 12.png" alt="Big 12" className="w-6 h-6 object-contain" />
                <span>Big 12</span>
              </a>
              <a href="#pac-12">
                <img src="/photos/Pac-12.png" alt="Pac-12" className="w-6 h-6 object-contain" />
                <span>Pac-12</span>
              </a>
              <a href="#american-athletic">
                <img src="/photos/American Athletic.png" alt="American Athletic" className="w-6 h-6 object-contain" />
                <span>American Athletic</span>
              </a>
              <a href="#conference-usa">
                <img src="/photos/Conference USA.png" alt="Conference USA" className="w-6 h-6 object-contain" />
                <span>Conference USA</span>
              </a>
              <a href="#mid-american">
                <img src="/photos/Mid-American.png" alt="Mid-American" className="w-6 h-6 object-contain" />
                <span>Mid-American</span>
              </a>
              <a href="#mountain-west">
                <img src="/photos/Mountain West.png" alt="Mountain West" className="w-6 h-6 object-contain" />
                <span>Mountain West</span>
              </a>
              <a href="#fbs-independents">
                <img src="/photos/FBS Independents.png" alt="FBS Independents" className="w-6 h-6 object-contain" />
                <span>FBS Independents</span>
              </a>
              <a href="#team-outlook"><i className="fas fa-chart-line icon-gradient"></i> <span>2025 Team Outlook</span></a>
            </div>
          </div>

          {/* Games Dropdown */}
          <div className="dropdown">
            <button className="dropdown-button gradient-text hover:opacity-80 transition duration-300">
              Games <FontAwesomeIcon icon={faChevronDown} className="text-xs icon-gradient" />
            </button>
            <div className="dropdown-content">
              <a href="#schedule"><i className="fas fa-calendar-check icon-gradient"></i> <span>Schedule</span></a>
              <a href="#schedule-2024-recap"><i className="fas fa-calendar-alt icon-gradient"></i> <span>2024 Season Recap</span></a>
              <a href="#game-predictor"><i className="fas fa-brain icon-gradient"></i> <span>Game Predictor</span></a>
              <a href="#live-games"><i className="fas fa-broadcast-tower icon-gradient"></i> <span>Live Games</span> <span className="ml-auto text-xs gradient-text">●</span></a>
            </div>
          </div>

          {/* Analytics Dropdown */}
          <div className="dropdown">
            <button className="dropdown-button gradient-text hover:opacity-80 transition duration-300">
              Analytics <FontAwesomeIcon icon={faChevronDown} className="text-xs icon-gradient" />
            </button>
            <div className="dropdown-content">
              <a href="#graphql-demo"><i className="fas fa-code icon-gradient"></i> <span>GraphQL Demo</span> <span className="ml-auto text-xs text-green-600">Live</span></a>
              <a href="#team-metrics"><i className="fas fa-chart-bar icon-gradient"></i> <span>Team Metrics</span></a>
              <a href="#player-metrics"><i className="fas fa-running icon-gradient"></i> <span>Player Metrics</span></a>
              <a href="#coach-overview"><i className="fas fa-user-tie icon-gradient"></i> <span>Coach Overview</span></a>
              <a href="#player-grade"><i className="fas fa-star icon-gradient"></i> <span>Player Grade</span></a>
              <div className="sub-dropdown">
                <a href="#"><i className="fas fa-flask icon-gradient"></i> <span>Advanced</span></a>
                <div className="sub-dropdown-content">
                  <a href="#efficiency"><i className="fas fa-tachometer-alt icon-gradient"></i> <span>Efficiency</span></a>
                  <a href="#explosiveness"><i className="fas fa-bolt icon-gradient"></i> <span>Explosiveness</span></a>
                  <a href="#situational"><i className="fas fa-layer-group icon-gradient"></i> <span>Situational</span></a>
                  <a href="#drive-analysis"><i className="fas fa-road icon-gradient"></i> <span>Drive Analysis</span></a>
                  <a href="#player-impact"><i className="fas fa-user-shield icon-gradient"></i> <span>Player Impact</span></a>
                  <a href="#heatmaps"><i className="fas fa-thermometer-half icon-gradient"></i> <span>Heatmaps</span></a>
                </div>
              </div>
              <div className="sub-dropdown">
                <a href="#stats"><i className="fas fa-chart-bar icon-gradient"></i> <span>Stats</span></a>
                <div className="sub-dropdown-content">
                  <a href="#player-stats"><i className="fas fa-running icon-gradient"></i> <span>Player Stats</span></a>
                  <a href="#team-stats"><i className="fas fa-users icon-gradient"></i> <span>Team Stats</span></a>
                </div>
              </div>
              <div className="sub-dropdown">
                <a href="#gameday-gpt"><i className="fas fa-robot icon-gradient"></i> <span>GamedayGPT</span></a>
                <div className="sub-dropdown-content">
                  <a href="#predict-outcomes"><i className="fas fa-crystal-ball icon-gradient"></i> <span>Predict Outcomes</span></a>
                  <a href="#ask-questions"><i className="fas fa-question-circle icon-gradient"></i> <span>Ask Questions</span></a>
                  <a href="#ai-insights"><i className="fas fa-lightbulb icon-gradient"></i> <span>AI Insights</span></a>
                </div>
              </div>
            </div>
          </div>

          {/* Betting Dropdown */}
          <div className="dropdown">
            <button className="dropdown-button gradient-text hover:opacity-80 transition duration-300">
              Betting <FontAwesomeIcon icon={faChevronDown} className="text-xs icon-gradient" />
            </button>
            <div className="dropdown-content">
              <a href="#betting-models"><i className="fas fa-chart-line icon-gradient"></i> <span>Betting Models</span></a>
              <a href="#spread-analysis"><i className="fas fa-chart-area icon-gradient"></i> <span>Spread Analysis</span></a>
              <a href="#arbitrage-ev"><i className="fas fa-dollar-sign icon-gradient"></i> <span>Arbitrage EV</span></a>
              <a href="#over-under-metrics"><i className="fas fa-balance-scale icon-gradient"></i> <span>Over/Under Metrics</span></a>
              <a href="#betting-suggestions"><i className="fas fa-lightbulb icon-gradient"></i> <span>Betting Suggestions</span></a>
            </div>
          </div>

          {/* News & Media Dropdown */}
          <div className="dropdown">
            <button className="dropdown-button gradient-text hover:opacity-80 transition duration-300">
              News & Media <FontAwesomeIcon icon={faChevronDown} className="text-xs icon-gradient" />
            </button>
            <div className="dropdown-content">
              <a href="#top-returning-players-2025"><i className="fas fa-users icon-gradient"></i> <span>Top 100 Players 2025</span></a>
              <a href="#draft-news"><i className="fas fa-football-ball icon-gradient"></i> <span>Draft News</span></a>
              <a href="#latest-news"><i className="fas fa-newspaper icon-gradient"></i> <span>Latest News</span></a>
              <a href="#injury-reports"><i className="fas fa-hospital icon-gradient"></i> <span>Injury Reports</span></a>
              <a href="#rankings"><i className="fas fa-list-ol icon-gradient"></i> <span>Rankings</span></a>
              <a href="#coaching-changes"><i className="fas fa-users-cog icon-gradient"></i> <span>Coaching Changes</span></a>
              <a href="#top-prospects"><i className="fas fa-star icon-gradient"></i> <span>Top Prospects</span></a>
              <a href="#commitments"><i className="fas fa-pen-fancy icon-gradient"></i> <span>Commitments</span></a>
              <a href="#transfer-portal"><i className="fas fa-exchange-alt icon-gradient"></i> <span>Transfer Portal</span></a>
              <div className="sub-dropdown">
                <a href="#videos"><i className="fas fa-video icon-gradient"></i> <span>Videos</span></a>
                <div className="sub-dropdown-content">
                  <a href="#highlights"><i className="fas fa-play-circle icon-gradient"></i> <span>Highlights</span></a>
                  <a href="#analysis"><i className="fas fa-chart-line icon-gradient"></i> <span>Analysis</span></a>
                  <a href="#press-conferences"><i className="fas fa-microphone icon-gradient"></i> <span>Press Conferences</span></a>
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* Right Side Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              {/* Profile Button with Avatar */}
              <button 
                onClick={openProfile} 
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-300 bg-transparent border-none cursor-pointer"
              >
                {userProfile?.photo ? (
                  <img src={userProfile.photo} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <i className="fas fa-user text-gray-600 text-sm"></i>
                  </div>
                )}
                <span className="gradient-text font-medium">Profile</span>
              </button>
              
              {/* Settings Button */}
              <button 
                onClick={openSettings}
                className="px-6 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition duration-300 font-bold"
              >
                Settings
              </button>
              
              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 transition duration-300 bg-transparent border-none cursor-pointer"
              >
                <i className="fas fa-sign-out-alt text-lg"></i>
              </button>
            </>
          ) : (
            <>
              <button onClick={openLoginModal} className="login-button bg-transparent border-none cursor-pointer">
                <span className="login-text">Login</span>
              </button>
              <button onClick={() => navigateTo('pricing')} className="px-6 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition duration-300 font-bold">Try for Free</button>
            </>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button onClick={toggleMobileMenu} className="gradient-text focus:outline-none">
            <FontAwesomeIcon icon={faBars} className="w-8 h-8" />
          </button>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      <div className={`lg:hidden mt-4 space-y-2 text-base bg-white bg-opacity-95 rounded-lg py-4 px-2 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <button 
          onClick={() => navigateTo('home-page')} 
          className="block gradient-text py-2 px-4 w-full text-left bg-transparent border-none cursor-pointer"
        >
          Home
        </button>
        
        <button 
          onClick={() => navigateTo('fanhub-central')} 
          className="block gradient-text py-2 px-4 w-full text-left bg-transparent border-none cursor-pointer"
        >
          FanHub
        </button>
        
        {/* Mobile Teams & Conferences */}
        <div className={`mobile-dropdown ${activeDropdowns.includes(0) ? 'active' : ''}`}>
          <button onClick={() => toggleMobileDropdown(0)} className="mobile-dropdown-toggle w-full text-left gradient-text py-2 px-4 flex items-center justify-between">
            Teams & Conferences <i className="fas fa-chevron-down text-xs icon-gradient"></i>
          </button>
          <div className="mobile-dropdown-content px-4">
            <a href="#teams" className="block text-gray-600 hover:gradient-text py-1 px-4 flex items-center gap-2">
              <i className="fas fa-users"></i>
              All Teams
            </a>
            <a href="#sec" className="block text-gray-600 hover:gradient-text py-1 px-4 flex items-center gap-2">
              <img src="/photos/SEC.png" alt="SEC" className="w-4 h-4 object-contain" />
              SEC
            </a>
            <a href="#big-ten" className="block text-gray-600 hover:gradient-text py-1 px-4 flex items-center gap-2">
              <img src="/photos/Big Ten.png" alt="Big Ten" className="w-4 h-4 object-contain" />
              Big Ten
            </a>
            <a href="#acc" className="block text-gray-600 hover:gradient-text py-1 px-4 flex items-center gap-2">
              <img src="/photos/ACC.png" alt="ACC" className="w-4 h-4 object-contain" />
              ACC
            </a>
            <a href="#big-12" className="block text-gray-600 hover:gradient-text py-1 px-4 flex items-center gap-2">
              <img src="/photos/Big 12.png" alt="Big 12" className="w-4 h-4 object-contain" />
              Big 12
            </a>
            <a href="#pac-12" className="block text-gray-600 hover:gradient-text py-1 px-4 flex items-center gap-2">
              <img src="/photos/Pac-12.png" alt="Pac-12" className="w-4 h-4 object-contain" />
              Pac-12
            </a>
            <a href="#american-athletic" className="block text-gray-600 hover:gradient-text py-1 px-4 flex items-center gap-2">
              <img src="/photos/American Athletic.png" alt="American Athletic" className="w-4 h-4 object-contain" />
              American Athletic
            </a>
            <a href="#conference-usa" className="block text-gray-600 hover:gradient-text py-1 px-4 flex items-center gap-2">
              <img src="/photos/Conference USA.png" alt="Conference USA" className="w-4 h-4 object-contain" />
              Conference USA
            </a>
            <a href="#mid-american" className="block text-gray-600 hover:gradient-text py-1 px-4 flex items-center gap-2">
              <img src="/photos/Mid-American.png" alt="Mid-American" className="w-4 h-4 object-contain" />
              Mid-American
            </a>
            <a href="#mountain-west" className="block text-gray-600 hover:gradient-text py-1 px-4 flex items-center gap-2">
              <img src="/photos/Mountain West.png" alt="Mountain West" className="w-4 h-4 object-contain" />
              Mountain West
            </a>
            <a href="#fbs-independents" className="block text-gray-600 hover:gradient-text py-1 px-4 flex items-center gap-2">
              <img src="/photos/FBS Independents.png" alt="FBS Independents" className="w-4 h-4 object-contain" />
              FBS Independents
            </a>
            <a href="#team-outlook" className="block text-gray-600 hover:gradient-text py-1 px-4 flex items-center gap-2">
              <i className="/photos/Sun Belt.png"></i>
              2025 Team Outlook
            </a>
          </div>
        </div>

        {/* Mobile Games */}
        <div className={`mobile-dropdown ${activeDropdowns.includes(1) ? 'active' : ''}`}>
          <button onClick={() => toggleMobileDropdown(1)} className="mobile-dropdown-toggle w-full text-left gradient-text py-2 px-4 flex items-center justify-between">
            Games <i className="fas fa-chevron-down text-xs icon-gradient"></i>
          </button>
          <div className="mobile-dropdown-content px-4">
            <a href="#schedule" className="block text-gray-600 hover:gradient-text py-1 px-4">Schedule</a>
            <a href="#schedule-2024-recap" className="block text-gray-600 hover:gradient-text py-1 px-4">2024 Season Recap</a>
            <a href="#game-predictor" className="block text-gray-600 hover:gradient-text py-1 px-4">Game Predictor</a>
            <a href="#live-games" className="block text-gray-600 hover:gradient-text py-1 px-4">Live Games</a>
          </div>
        </div>

        {/* Mobile Analytics */}
        <div className={`mobile-dropdown ${activeDropdowns.includes(2) ? 'active' : ''}`}>
          <button onClick={() => toggleMobileDropdown(2)} className="mobile-dropdown-toggle w-full text-left gradient-text py-2 px-4 flex items-center justify-between">
            Analytics <i className="fas fa-chevron-down text-xs icon-gradient"></i>
          </button>
          <div className="mobile-dropdown-content px-4">
            <a href="#graphql-demo" className="block text-gray-600 hover:gradient-text py-1 px-4">GraphQL Demo <span className="ml-auto text-xs text-green-600">Live</span></a>
            <a href="#team-metrics" className="block text-gray-600 hover:gradient-text py-1 px-4">Team Metrics</a>
            <a href="#player-metrics" className="block text-gray-600 hover:gradient-text py-1 px-4">Player Metrics</a>
            <a href="#coach-overview" className="block text-gray-600 hover:gradient-text py-1 px-4">Coach Overview</a>
            <a href="#player-grade" className="block text-gray-600 hover:gradient-text py-1 px-4">Player Grade</a>
            <div className={`mobile-sub-dropdown ${activeDropdowns.includes('stats-sub') ? 'active' : ''}`}>
              <button onClick={() => toggleMobileDropdown('stats-sub')} className="mobile-sub-dropdown-toggle w-full text-left text-gray-600 hover:gradient-text py-1 px-4 flex items-center justify-between">
                Stats <i className="fas fa-chevron-down text-xs icon-gradient"></i>
              </button>
              <div className="mobile-sub-dropdown-content px-4">
                <a href="#player-stats" className="block text-gray-500 hover:gradient-text py-1 px-6">Player Stats</a>
                <a href="#team-stats" className="block text-gray-500 hover:gradient-text py-1 px-6">Team Stats</a>
              </div>
            </div>
            <div className={`mobile-sub-dropdown ${activeDropdowns.includes('analytics-sub') ? 'active' : ''}`}>
              <button onClick={() => toggleMobileDropdown('analytics-sub')} className="mobile-sub-dropdown-toggle w-full text-left text-gray-600 hover:gradient-text py-1 px-4 flex items-center justify-between">
                GamedayGPT <i className="fas fa-chevron-down text-xs icon-gradient"></i>
              </button>
              <div className="mobile-sub-dropdown-content px-4">
                <a href="#predict-outcomes" className="block text-gray-500 hover:gradient-text py-1 px-6">Predict Outcomes</a>
                <a href="#ask-questions" className="block text-gray-500 hover:gradient-text py-1 px-6">Ask Questions</a>
                <a href="#ai-insights" className="block text-gray-500 hover:gradient-text py-1 px-6">AI Insights</a>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Betting */}
        <div className={`mobile-dropdown ${activeDropdowns.includes(3) ? 'active' : ''}`}>
          <button onClick={() => toggleMobileDropdown(3)} className="mobile-dropdown-toggle w-full text-left gradient-text py-2 px-4 flex items-center justify-between">
            Betting <i className="fas fa-chevron-down text-xs icon-gradient"></i>
          </button>
          <div className="mobile-dropdown-content px-4">
            <a href="#betting-models" className="block text-gray-600 hover:gradient-text py-1 px-4">Betting Models</a>
            <a href="#spread-analysis" className="block text-gray-600 hover:gradient-text py-1 px-4">Spread Analysis</a>
            <a href="#arbitrage-ev" className="block text-gray-600 hover:gradient-text py-1 px-4">Arbitrage EV</a>
            <a href="#over-under-metrics" className="block text-gray-600 hover:gradient-text py-1 px-4">Over/Under Metrics</a>
            <a href="#betting-suggestions" className="block text-gray-600 hover:gradient-text py-1 px-4">Betting Suggestions</a>
          </div>
        </div>

        {/* Mobile News & Media */}
        <div className={`mobile-dropdown ${activeDropdowns.includes(4) ? 'active' : ''}`}>
          <button onClick={() => toggleMobileDropdown(4)} className="mobile-dropdown-toggle w-full text-left gradient-text py-2 px-4 flex items-center justify-between">
            News & Media <i className="fas fa-chevron-down text-xs icon-gradient"></i>
          </button>
          <div className="mobile-dropdown-content px-4">
            <a href="#draft-news" className="block text-gray-600 hover:gradient-text py-1 px-4">Draft News</a>
            <a href="#latest-news" className="block text-gray-600 hover:gradient-text py-1 px-4">Latest News</a>
            <a href="#injury-reports" className="block text-gray-600 hover:gradient-text py-1 px-4">Injury Reports</a>
            <a href="#rankings" className="block text-gray-600 hover:gradient-text py-1 px-4">Rankings</a>
            <a href="#coaching-changes" className="block text-gray-600 hover:gradient-text py-1 px-4">Coaching Changes</a>
            <a href="#top-prospects" className="block text-gray-600 hover:gradient-text py-1 px-4">Top Prospects</a>
            <a href="#commitments" className="block text-gray-600 hover:gradient-text py-1 px-4">Commitments</a>
            <a href="#transfer-portal" className="block text-gray-600 hover:gradient-text py-1 px-4">Transfer Portal</a>
            <div className={`mobile-sub-dropdown ${activeDropdowns.includes('news-sub') ? 'active' : ''}`}>
              <button onClick={() => toggleMobileDropdown('news-sub')} className="mobile-sub-dropdown-toggle w-full text-left text-gray-600 hover:gradient-text py-1 px-4 flex items-center justify-between">
                Videos <i className="fas fa-chevron-down text-xs icon-gradient"></i>
              </button>
              <div className="mobile-sub-dropdown-content px-4">
                <a href="#highlights" className="block text-gray-500 hover:gradient-text py-1 px-6">Highlights</a>
                <a href="#analysis" className="block text-gray-500 hover:gradient-text py-1 px-6">Analysis</a>
                <a href="#press-conferences" className="block text-gray-500 hover:gradient-text py-1 px-6">Press Conferences</a>
              </div>
            </div>
          </div>
        </div>



        {/* Mobile Login/Signup */}
        <div className="border-t pt-4 mt-4 space-y-2">
          {isLoggedIn ? (
            <>
              <button onClick={openProfile} className="mx-4 bg-transparent border-none cursor-pointer w-full flex items-center justify-center space-x-2 py-2">
                {userProfile?.photo ? (
                  <img src={userProfile.photo} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                    <i className="fas fa-user text-gray-600 text-xs"></i>
                  </div>
                )}
                <span className="gradient-text font-medium">Profile</span>
              </button>
              <button onClick={openSettings} className="block mx-4 px-6 py-2 gradient-bg text-white text-center rounded-lg hover:opacity-90 transition duration-300 font-bold w-full">Settings</button>
              <button onClick={handleLogout} className="mx-4 text-red-600 hover:text-red-700 transition duration-300 bg-transparent border-none cursor-pointer w-full py-2">
                <i className="fas fa-sign-out-alt mr-2"></i>Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={openLoginModal} className="login-button mx-4 bg-transparent border-none cursor-pointer w-full">
                <span className="login-text">Login</span>
              </button>
              <button onClick={() => navigateTo('pricing')} className="block mx-4 px-6 py-2 gradient-bg text-white text-center rounded-lg hover:opacity-90 transition duration-300 font-bold">Try for Free</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
