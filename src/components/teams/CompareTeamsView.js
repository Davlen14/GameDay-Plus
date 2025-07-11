import React, { useState, useEffect } from 'react';

const CompareTeamsView = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [team1, setTeam1] = useState(null);
  const [team2, setTeam2] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tabs from your Swift implementation
  const tabs = [
    "All Time", 
    "Head to Head", 
    "Last 5 Years", 
    "2024 Season", 
    "Weather", 
    "Impact Players", 
    "Advanced"
  ];

  useEffect(() => {
    // Get teams from localStorage (set when user selects teams for comparison)
    const compareTeams = localStorage.getItem('compareTeams');
    if (compareTeams) {
      const teams = JSON.parse(compareTeams);
      if (teams.length >= 2) {
        setTeam1(teams[0]);
        setTeam2(teams[1]);
      }
    }
    setIsLoading(false);
  }, []);

  const handleBack = () => {
    // Clear comparison data and go back to teams page
    localStorage.removeItem('compareTeams');
    window.location.hash = 'teams';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 px-4 md:px-6 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200"></div>
        
        {/* Floating Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-5 blur-3xl animate-pulse" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' }}></div>
          <div className="absolute bottom-40 right-20 w-48 h-48 rounded-full opacity-3 blur-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-[97%] mx-auto relative z-10">
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/40 backdrop-blur-2xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent" style={{ borderTopColor: '#cc001c', borderRightColor: '#a10014' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!team1 || !team2) {
    return (
      <div className="min-h-screen pt-32 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200"></div>
        <div className="max-w-[97%] mx-auto relative z-10">
          <div className="text-center py-20">
            <h2 className="text-3xl font-black mb-4 gradient-text">No Teams Selected</h2>
            <p className="text-gray-600 mb-8">Please select two teams to compare</p>
            <button 
              onClick={handleBack}
              className="px-6 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl hover:bg-white/30 transition-all duration-300 text-gray-700 font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 md:px-6 relative overflow-hidden">
      <style>{`
        .gradient-text {
          background: linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .icon-gradient {
          background: linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .metallic-gradient {
          background: linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c);
        }
      `}</style>

      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200"></div>
      
      {/* Floating Orbs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-5 blur-3xl animate-pulse" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' }}></div>
        <div className="absolute top-60 right-20 w-48 h-48 rounded-full opacity-3 blur-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-80 h-80 rounded-full opacity-4 blur-3xl animate-pulse" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-56 h-56 rounded-full opacity-3 blur-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', animationDelay: '3s' }}></div>
      </div>

      <div className="max-w-[97%] mx-auto relative z-10">
        {/* Enhanced Header Section */}
        <div className="mb-12">
          {/* Navigation and Title */}
          <div className="flex items-center justify-between mb-12">
            <button
              onClick={handleBack}
              className="flex items-center gap-3 px-4 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl hover:bg-white/30 transition-all duration-300 text-gray-700 font-medium"
            >
              <i className="fas fa-chevron-left"></i>
              <span>Back</span>
            </button>

            <h1 className="text-4xl md:text-5xl font-black gradient-text text-center">
              Team Comparison
            </h1>

            <div className="w-20"></div> {/* Spacer for balance */}
          </div>

          {/* Team Comparison Header */}
          <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
            {/* Highlight overlay */}
            <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-8 md:gap-16">
                {/* Team 1 */}
                <TeamDisplay team={team1} alignment="right" />
                
                {/* VS Divider */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center">
                    <span className="text-2xl font-black gradient-text">VS</span>
                  </div>
                </div>

                {/* Team 2 */}
                <TeamDisplay team={team2} alignment="left" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="relative mb-8">
          <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-6">
            {/* Highlight overlay */}
            <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="overflow-x-auto">
                <div className="flex gap-3 min-w-max px-2">
                  {tabs.map((tab, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTab(index)}
                      className={`relative flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm md:text-base transition-all duration-500 transform hover:scale-105 whitespace-nowrap ${
                        selectedTab === index
                          ? 'text-white shadow-2xl'
                          : 'text-gray-700 hover:text-white'
                      }`}
                    >
                      {/* Active gradient background */}
                      {selectedTab === index && (
                        <div className="absolute inset-0 rounded-2xl shadow-[0_8px_32px_rgba(204,0,28,0.3)] metallic-gradient"></div>
                      )}
                      
                      {/* Inactive glass background */}
                      {selectedTab !== index && (
                        <div className="absolute inset-0 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl hover:bg-white/30 transition-all duration-300"></div>
                      )}
                      
                      {/* Glass highlight */}
                      <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                      
                      <span className="relative z-10">{tab}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8 min-h-[600px]">
          {/* Highlight overlay */}
          <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center py-20">
              <div className="relative mb-8">
                {/* Outer glass ring */}
                <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl mx-auto"></div>
                {/* Inner glass container */}
                <div className="relative w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center mx-auto">
                  <i className="fas fa-cogs text-gray-400 text-3xl"></i>
                </div>
              </div>
              
              <h3 className="text-4xl font-black mb-4 gradient-text">
                {tabs[selectedTab]}
              </h3>
              <p className="text-xl text-gray-600 font-light mb-8">
                Coming Soon
              </p>
              <div className="inline-flex items-center space-x-4 px-8 py-4 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2)]">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' }}></div>
                <span className="text-lg font-bold gradient-text">Under Development</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Team Display Component
const TeamDisplay = ({ team, alignment }) => {
  const teamLogo = team.logos?.[0];
  
  return (
    <div className={`flex flex-col items-center text-center ${alignment === 'right' ? 'md:items-end md:text-right' : 'md:items-start md:text-left'} flex-1 max-w-xs`}>
      {/* Team Logo */}
      <div className="w-24 h-24 md:w-32 md:h-32 mb-4 flex items-center justify-center">
        {teamLogo ? (
          <img
            src={teamLogo}
            alt={team.school}
            className="w-full h-full object-contain filter drop-shadow-lg transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center">
            <i className="fas fa-university text-gray-400 text-4xl"></i>
          </div>
        )}
      </div>

      {/* Team Info */}
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-black text-gray-800 leading-tight break-words">
          {team.school}
        </h3>
        <p className="text-sm md:text-base text-gray-600 font-medium break-words">
          {team.mascot}
        </p>
        {team.conference && (
          <p className="text-xs md:text-sm text-gray-500 font-medium break-words">
            {team.conference}
          </p>
        )}
      </div>

      {/* Team Colors Accent */}
      <div className="w-16 h-1 rounded-full mt-4" 
           style={{
             background: team.color && team.alternateColor 
               ? `linear-gradient(90deg, ${team.color}, ${team.alternateColor})`
               : 'linear-gradient(90deg, #cc001c, #a10014)'
           }}>
      </div>
    </div>
  );
};

export default CompareTeamsView;
