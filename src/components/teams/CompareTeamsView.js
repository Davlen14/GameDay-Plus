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
  
  // Team records state matching Swift implementation
  const [team1Records, setTeam1Records] = useState([]);
  const [team2Records, setTeam2Records] = useState([]);
  const [headToHead, setHeadToHead] = useState(null);
  const [recordsLoaded, setRecordsLoaded] = useState(false);

  // Tabs matching Swift implementation exactly
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

  // Load comparison data matching Swift's loadComparisonData() function
  useEffect(() => {
    const loadComparisonData = async () => {
      if (!team1?.school || !team2?.school) return;
      
      try {
        console.log(`🔍 Loading comparison data for ${team1.school} vs ${team2.school}...`);
        setRecordsLoaded(false);
        
        // Match Swift implementation: parallel async calls
        const [records1, records2, matchup] = await Promise.all([
          fetchTeamRecords(team1.school),
          fetchTeamRecords(team2.school),
          fetchTeamMatchup(team1.school, team2.school)
        ]);
        
        console.log(`✅ Loaded ${records1.length} records for ${team1.school}`);
        console.log(`✅ Loaded ${records2.length} records for ${team2.school}`);
        
        setTeam1Records(records1);
        setTeam2Records(records2);
        setHeadToHead(matchup);
        setRecordsLoaded(true);
        
      } catch (error) {
        console.error('Error loading comparison data:', error);
        setRecordsLoaded(true); // Still show UI with empty data
      }
    };
    
    loadComparisonData();
  }, [team1?.school, team2?.school]);

  // Helper function matching Swift's TeamService.fetchTeamRecords
  const fetchTeamRecords = async (teamName) => {
    try {
      // Check if your gameService has a method that fetches all records at once
      if (gameService.fetchTeamRecords) {
        return await gameService.fetchTeamRecords(teamName);
      }
      
      // Otherwise, batch the year-by-year calls more efficiently
      const currentYear = new Date().getFullYear();
      const startYear = 2000; // Match your AllTimeTab years range
      const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
      
      console.log(`📅 Fetching records for ${teamName} from ${startYear} to ${currentYear}...`);
      
      // Batch requests in chunks to avoid overwhelming the API
      const chunkSize = 5;
      const allRecords = [];
      
      for (let i = 0; i < years.length; i += chunkSize) {
        const yearChunk = years.slice(i, i + chunkSize);
        
        const chunkResults = await Promise.allSettled(
          yearChunk.map(async (year) => {
            try {
              const records = await gameService.getRecords(year, teamName);
              return records || [];
            } catch (error) {
              console.warn(`Failed to get ${teamName} records for ${year}:`, error.message);
              return [];
            }
          })
        );
        
        // Process results and flatten
        chunkResults.forEach((result) => {
          if (result.status === 'fulfilled' && result.value) {
            allRecords.push(...result.value);
          }
        });
        
        // Small delay between chunks to be API-friendly
        if (i + chunkSize < years.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log(`📊 Total records fetched for ${teamName}: ${allRecords.length}`);
      return allRecords;
      
    } catch (error) {
      console.error(`Error fetching records for ${teamName}:`, error);
      return [];
    }
  };

  // Helper function matching Swift's TeamService.fetchTeamMatchup
  const fetchTeamMatchup = async (team1Name, team2Name) => {
    try {
      // This would call your head-to-head endpoint
      if (gameService.fetchTeamMatchup) {
        return await gameService.fetchTeamMatchup(team1Name, team2Name);
      }
      
      // Fallback: try to find head-to-head games
      if (gameService.getHeadToHeadGames) {
        return await gameService.getHeadToHeadGames(team1Name, team2Name);
      }
      
      console.warn('No head-to-head matchup method available');
      return null;
    } catch (error) {
      console.error('Error fetching team matchup:', error);
      return null;
    }
  };

  const handleBack = () => {
    // Clear comparison data and go back to teams page
    localStorage.removeItem('compareTeams');
    window.location.hash = 'teams';
  };

  // Loading view matching Swift's LoadingView
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
                <p className="text-gray-600 font-medium">Loading Comparison Data...</p>
                {team1 && team2 && (
                  <p className="text-sm text-gray-500 mt-2">
                    {team1.school} vs {team2.school}
                  </p>
                )}
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
        .metallic-gradient {
          background: linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c);
        }
      `}</style>

      {/* Background matching Swift design */}
      <div className="absolute inset-0 bg-white"></div>
      
      {/* Team Logo Background Elements - matching Swift's subtle background */}
      {team1 && team2 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          {/* Subtle background logos */}
          {team1.logos?.[0] && (
            <>
              <div className="absolute top-20 left-6 w-8 h-8 opacity-20">
                <img src={team1.logos[0].replace('http://', 'https://')} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="absolute bottom-32 left-4 w-6 h-6 opacity-15 rotate-12">
                <img src={team1.logos[0].replace('http://', 'https://')} alt="" className="w-full h-full object-contain" />
              </div>
            </>
          )}
          
          {team2.logos?.[0] && (
            <>
              <div className="absolute top-32 right-8 w-8 h-8 opacity-20">
                <img src={team2.logos[0].replace('http://', 'https://')} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="absolute bottom-20 right-6 w-6 h-6 opacity-15 -rotate-15">
                <img src={team2.logos[0].replace('http://', 'https://')} alt="" className="w-full h-full object-contain" />
              </div>
            </>
          )}
        </div>
      )}

      <div className="max-w-[97%] mx-auto relative z-10">
        {/* Header Section - matching Swift headerView */}
        <div className="mb-8">
          {/* Navigation and Title */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 text-gray-700 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>

            <h1 className="text-2xl font-bold gradient-text">
              Team Comparison
            </h1>

            <div className="w-16"></div> {/* Spacer for balance */}
          </div>

          {/* Team Comparison Header - matching Swift teamDisplay */}
          <div className="flex items-center justify-center gap-8 mb-8">
            {/* Team 1 */}
            <TeamDisplay team={team1} alignment="right" />
            
            {/* VS Divider - matching Swift's metallic VS */}
            <div className="w-15 h-15 rounded-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center shadow-lg">
              <span className="text-lg font-black text-gray-700">VS</span>
            </div>

            {/* Team 2 */}
            <TeamDisplay team={team2} alignment="left" />
          </div>
        </div>

        {/* Tab Selector - matching Swift metalicTabSelector */}
        <div className="mb-6">
          <div className="overflow-x-auto">
            <div className="flex gap-3 min-w-max px-2">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTab(index)}
                  className={`px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                    selectedTab === index
                      ? 'text-white shadow-lg metallic-gradient'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area - matching Swift TabView structure */}
        <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[600px]">
          {/* Render the selected tab component with proper data passing */}
          {selectedTab === 0 && (
            <AllTimeTab 
              team1={team1} 
              team2={team2} 
              team1Records={team1Records} 
              team2Records={team2Records} 
            />
          )}
          {selectedTab === 1 && (
            <HeadToHeadTab 
              team1={team1} 
              team2={team2} 
              headToHead={headToHead}
            />
          )}
          {selectedTab === 2 && (
            <Last5YearsTab 
              team1={team1} 
              team2={team2} 
              team1Records={team1Records} 
              team2Records={team2Records} 
            />
          )}
          {selectedTab === 3 && (
            <Season2024Tab 
              team1={team1} 
              team2={team2} 
            />
          )}
          {selectedTab === 4 && (
            <WeatherTab 
              team1={team1} 
              team2={team2} 
            />
          )}
          {selectedTab === 5 && (
            <ImpactPlayersTab 
              team1={team1} 
              team2={team2} 
            />
          )}
          {selectedTab === 6 && (
            <AdvancedTab 
              team1={team1} 
              team2={team2} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Team Display Component - matching Swift's teamDisplay function
const TeamDisplay = ({ team, alignment }) => {
  const teamLogo = team.logos?.[0]?.replace('http://', 'https://');
  
  return (
    <div className={`flex flex-col items-center text-center max-w-xs`}>
      {/* Team Logo - matching Swift's logo styling */}
      <div className="w-20 h-20 mb-4 flex items-center justify-center">
        {teamLogo ? (
          <img
            src={teamLogo}
            alt={team.school}
            className="w-full h-full object-contain filter drop-shadow-lg transition-transform duration-300 hover:scale-110"
            style={{
              filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))'
            }}
          />
        ) : (
          // Fallback logo matching Swift's defaultMetallicLogo
          <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">
              {team.school?.[0] || '?'}
            </span>
          </div>
        )}
      </div>

      {/* Team Info - matching Swift's text styling */}
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-gray-800 leading-tight">
          {team.school}
        </h3>
        {team.conference && (
          <p className="text-sm text-gray-600">
            {team.conference}
          </p>
        )}
      </div>
    </div>
  );
};

export default CompareTeamsView;