import React, { useState, useEffect } from 'react';
import {
  AllTimeTab,
  HeadToHeadTab,
  Last5YearsTab,
  Season2024Tab,
  WeatherTab,
  ImpactPlayersTab,
  AdvancedTab
} from './tabs';
import { gameService } from '../../services/gameService';

const CompareTeamsView = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [team1, setTeam1] = useState(null);
  const [team2, setTeam2] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add team records state like Swift implementation
  const [team1Records, setTeam1Records] = useState([]);
  const [team2Records, setTeam2Records] = useState([]);
  const [recordsLoaded, setRecordsLoaded] = useState(false);

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

  // Load team records when teams are set (matches Swift CompareTeamsView architecture)
  useEffect(() => {
    const loadTeamRecords = async () => {
      if (!team1?.school || !team2?.school) return;
      
      try {
        console.log(`🔍 Loading ALL historical records for ${team1.school} vs ${team2.school}...`);
        setRecordsLoaded(false);
        
        // Fetch ALL historical records for both teams in parallel (no year filter)
        const [team1RecordsData, team2RecordsData] = await Promise.all([
          gameService.getAllRecords(team1.school),
          gameService.getAllRecords(team2.school)
        ]);
        
        console.log(`✅ Loaded ${team1RecordsData?.length || 0} historical records for ${team1.school}`);
        console.log(`✅ Loaded ${team2RecordsData?.length || 0} historical records for ${team2.school}`);
        
        // Calculate total wins for verification
        const team1TotalWins = team1RecordsData?.reduce((sum, record) => sum + (record.total?.wins || 0), 0) || 0;
        const team2TotalWins = team2RecordsData?.reduce((sum, record) => sum + (record.total?.wins || 0), 0) || 0;
        
        console.log(`📊 ${team1.school} all-time wins: ${team1TotalWins}`);
        console.log(`📊 ${team2.school} all-time wins: ${team2TotalWins}`);
        
        setTeam1Records(team1RecordsData || []);
        setTeam2Records(team2RecordsData || []);
        setRecordsLoaded(true);
        
      } catch (error) {
        console.error('Error loading team records:', error);
        setRecordsLoaded(true); // Still set to true to show the UI
      }
    };
    
    loadTeamRecords();
  }, [team1?.school, team2?.school]);

  const handleBack = () => {
    // Clear comparison data and go back to teams page
    localStorage.removeItem('compareTeams');
    window.location.hash = 'teams';
  };

  if (isLoading || !recordsLoaded) {
    return (
      <div className="min-h-screen pt-32 px-4 md:px-6 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200"></div>

        <div className="max-w-[97%] mx-auto relative z-10">
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/40 backdrop-blur-2xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-gray-600 border-r-gray-400"></div>
              </div>
              <div className="text-center mt-4">
                <p className="text-gray-600">Loading team records...</p>
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
      
      {/* Team Logo Background Elements - Medium and small logos only */}
      {team1 && team2 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Team 1 logos - left side, varied sizes */}
          {team1.logos?.[0] && (
            <>
              <div className="absolute top-12 left-6 w-12 h-12 opacity-7">
                <img src={team1.logos[0]} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="absolute top-1/3 left-4 w-10 h-10 opacity-6 rotate-12">
                <img src={team1.logos[0]} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="absolute top-2/3 left-8 w-10 h-10 opacity-6 -rotate-6">
                <img src={team1.logos[0]} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="absolute bottom-32 left-2 w-12 h-12 opacity-7">
                <img src={team1.logos[0]} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="absolute bottom-12 left-10 w-8 h-8 opacity-5 rotate-30">
                <img src={team1.logos[0]} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="absolute top-1/4 left-1 w-9 h-9 opacity-5 rotate-45">
                <img src={team1.logos[0]} alt="" className="w-full h-full object-contain" />
              </div>
            </>
          )}
          
          {/* Team 2 logos - right side, varied sizes */}
          {team2.logos?.[0] && (
            <>
              <div className="absolute top-16 right-8 w-12 h-12 opacity-7">
                <img src={team2.logos[0]} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="absolute top-1/2 right-4 w-9 h-9 opacity-6 rotate-15">
                <img src={team2.logos[0]} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="absolute top-1/4 right-2 w-10 h-10 opacity-6 -rotate-20">
                <img src={team2.logos[0]} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="absolute bottom-20 right-6 w-9 h-9 opacity-6">
                <img src={team2.logos[0]} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="absolute bottom-40 right-1 w-8 h-8 opacity-5 -rotate-12">
                <img src={team2.logos[0]} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="absolute bottom-8 right-12 w-10 h-10 opacity-5 rotate-25">
                <img src={team2.logos[0]} alt="" className="w-full h-full object-contain" />
              </div>
            </>
          )}
          
          {/* Center subtle logos - very small and subtle */}
          {team1.logos?.[0] && team2.logos?.[0] && (
            <>
              <div className="absolute top-1/5 left-1/3 w-7 h-7 opacity-4 rotate-45">
                <img src={team1.logos[0]} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="absolute bottom-1/5 right-1/3 w-6 h-6 opacity-3 -rotate-30">
                <img src={team2.logos[0]} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="absolute top-1/2 left-1/4 w-5 h-5 opacity-3 rotate-60">
                <img src={team1.logos[0]} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="absolute top-3/4 right-1/4 w-8 h-8 opacity-4 -rotate-45">
                <img src={team2.logos[0]} alt="" className="w-full h-full object-contain" />
              </div>
            </>
          )}
        </div>
      )}

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
          
          {/* Render the selected tab component with records like Swift implementation */}
          {selectedTab === 0 && <AllTimeTab team1={team1} team2={team2} team1Records={team1Records} team2Records={team2Records} />}
          {selectedTab === 1 && <HeadToHeadTab team1={team1} team2={team2} />}
          {selectedTab === 2 && <Last5YearsTab team1={team1} team2={team2} team1Records={team1Records} team2Records={team2Records} />}
          {selectedTab === 3 && <Season2024Tab team1={team1} team2={team2} />}
          {selectedTab === 4 && <WeatherTab team1={team1} team2={team2} />}
          {selectedTab === 5 && <ImpactPlayersTab team1={team1} team2={team2} />}
          {selectedTab === 6 && <AdvancedTab team1={team1} team2={team2} />}
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
