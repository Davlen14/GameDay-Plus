import React, { useState, useEffect } from 'react';

const Season2024Tab = ({ team1, team2, team1Records = [], team2Records = [] }) => {
  const [season2024Data, setSeason2024Data] = useState({
    team1: { 
      wins: 0, 
      losses: 0, 
      winPercentage: 0, 
      conferenceWins: 0, 
      conferenceLosses: 0,
      // Offensive stats
      totalYards: 0,
      rushingYards: 0,
      netPassingYards: 0,
      passingTDs: 0,
      rushingTDs: 0,
      rushingAttempts: 0,
      passCompletions: 0,
      passAttempts: 0,
      firstDowns: 0,
      thirdDowns: 0,
      thirdDownConversions: 0,
      fourthDowns: 0,
      fourthDownConversions: 0,
      turnovers: 0,
      fumblesLost: 0,
      passesIntercepted: 0,
      penalties: 0,
      penaltyYards: 0,
      possessionTime: 0,
      kickReturns: 0,
      kickReturnYards: 0,
      kickReturnTDs: 0,
      puntReturns: 0,
      puntReturnYards: 0,
      puntReturnTDs: 0,
      // Defensive stats
      totalYardsOpponent: 0,
      rushingYardsOpponent: 0,
      netPassingYardsOpponent: 0,
      passingTDsOpponent: 0,
      rushingTDsOpponent: 0,
      sacks: 0,
      interceptions: 0,
      interceptionYards: 0,
      interceptionTDs: 0,
      tacklesForLoss: 0,
      fumblesRecovered: 0,
      firstDownsOpponent: 0,
      thirdDownsOpponent: 0,
      thirdDownConversionsOpponent: 0,
      fourthDownsOpponent: 0,
      fourthDownConversionsOpponent: 0,
      turnoversOpponent: 0,
      sacksOpponent: 0,
      tacklesForLossOpponent: 0,
      penaltiesOpponent: 0,
      penaltyYardsOpponent: 0,
      possessionTimeOpponent: 0
    },
    team2: { 
      wins: 0, 
      losses: 0, 
      winPercentage: 0, 
      conferenceWins: 0, 
      conferenceLosses: 0,
      // Offensive stats
      totalYards: 0,
      rushingYards: 0,
      netPassingYards: 0,
      passingTDs: 0,
      rushingTDs: 0,
      rushingAttempts: 0,
      passCompletions: 0,
      passAttempts: 0,
      firstDowns: 0,
      thirdDowns: 0,
      thirdDownConversions: 0,
      fourthDowns: 0,
      fourthDownConversions: 0,
      turnovers: 0,
      fumblesLost: 0,
      passesIntercepted: 0,
      penalties: 0,
      penaltyYards: 0,
      possessionTime: 0,
      kickReturns: 0,
      kickReturnYards: 0,
      kickReturnTDs: 0,
      puntReturns: 0,
      puntReturnYards: 0,
      puntReturnTDs: 0,
      // Defensive stats
      totalYardsOpponent: 0,
      rushingYardsOpponent: 0,
      netPassingYardsOpponent: 0,
      passingTDsOpponent: 0,
      rushingTDsOpponent: 0,
      sacks: 0,
      interceptions: 0,
      interceptionYards: 0,
      interceptionTDs: 0,
      tacklesForLoss: 0,
      fumblesRecovered: 0,
      firstDownsOpponent: 0,
      thirdDownsOpponent: 0,
      thirdDownConversionsOpponent: 0,
      fourthDownsOpponent: 0,
      fourthDownConversionsOpponent: 0,
      turnoversOpponent: 0,
      sacksOpponent: 0,
      tacklesForLossOpponent: 0,
      penaltiesOpponent: 0,
      penaltyYardsOpponent: 0,
      possessionTimeOpponent: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    const loadSeason2024Data = async () => {
      if (!team1?.school || !team2?.school) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(`🔍 Processing 2024 Season data for ${team1.school} vs ${team2.school}`);
        console.log(`📊 Team1 Records: ${team1Records.length}, Team2 Records: ${team2Records.length}`);

        // Filter records for 2024 season
        const team1_2024Record = team1Records.find(record => record.year === 2024);
        const team2_2024Record = team2Records.find(record => record.year === 2024);

        console.log(`📈 Found 2024 record for ${team1.school}:`, team1_2024Record);
        console.log(`📈 Found 2024 record for ${team2.school}:`, team2_2024Record);

        // Calculate team stats from records and fetch season stats
        const [team1Stats, team1SeasonStats] = await Promise.all([
          calculate2024Stats(team1_2024Record),
          fetchSeasonStats(team1.school, 2024)
        ]);
        
        const [team2Stats, team2SeasonStats] = await Promise.all([
          calculate2024Stats(team2_2024Record),
          fetchSeasonStats(team2.school, 2024)
        ]);

        // Combine record stats with detailed season stats
        const team1Combined = { ...team1Stats, ...team1SeasonStats };
        const team2Combined = { ...team2Stats, ...team2SeasonStats };

        console.log(`✅ ${team1.school} 2024 Complete Stats:`, team1Combined);
        console.log(`✅ ${team2.school} 2024 Complete Stats:`, team2Combined);

        setSeason2024Data({
          team1: team1Combined,
          team2: team2Combined
        });

        setTimeout(() => setAnimateStats(true), 300);
      } catch (err) {
        console.error('Error processing 2024 season data:', err);
        setError('Failed to process 2024 season data');
      } finally {
        setLoading(false);
      }
    };

    loadSeason2024Data();
  }, [team1?.school, team2?.school, team1Records, team2Records]);

  const fetchSeasonStats = async (teamName, year) => {
    try {
      const response = await fetch(
        `https://api.collegefootballdata.com/stats/season?year=${year}&team=${encodeURIComponent(teamName)}`,
        {
          headers: {
            'Authorization': 'Bearer p5M3+9PK7Kt1CIMox0hgi7zgyWKCeO86buPF+tEH/zPCExymKp+v+IBrl7rKucSq'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const stats = await response.json();
      
      // Convert array of stats to object for easier access
      const statsObject = {};
      stats.forEach(stat => {
        statsObject[stat.statName] = stat.statValue;
      });

      return {
        // Offensive stats
        totalYards: parseFloat(statsObject.totalYards) || 0,
        rushingYards: parseFloat(statsObject.rushingYards) || 0,
        netPassingYards: parseFloat(statsObject.netPassingYards) || 0,
        passingTDs: parseInt(statsObject.passingTDs) || 0,
        rushingTDs: parseInt(statsObject.rushingTDs) || 0,
        rushingAttempts: parseInt(statsObject.rushingAttempts) || 0,
        passAttempts: parseInt(statsObject.passAttempts) || 0,
        passCompletions: parseInt(statsObject.passCompletions) || 0,
        firstDowns: parseInt(statsObject.firstDowns) || 0,
        thirdDowns: parseInt(statsObject.thirdDowns) || 0,
        thirdDownConversions: parseInt(statsObject.thirdDownConversions) || 0,
        fourthDowns: parseInt(statsObject.fourthDowns) || 0,
        fourthDownConversions: parseInt(statsObject.fourthDownConversions) || 0,
        penalties: parseInt(statsObject.penalties) || 0,
        penaltyYards: parseFloat(statsObject.penaltyYards) || 0,
        turnovers: parseInt(statsObject.turnovers) || 0,
        fumblesLost: parseInt(statsObject.fumblesLost) || 0,
        passesIntercepted: parseInt(statsObject.passesIntercepted) || 0,
        possessionTime: parseFloat(statsObject.possessionTime) || 0,
        // Return game
        kickReturns: parseInt(statsObject.kickReturns) || 0,
        kickReturnYards: parseFloat(statsObject.kickReturnYards) || 0,
        kickReturnTDs: parseInt(statsObject.kickReturnTDs) || 0,
        puntReturns: parseInt(statsObject.puntReturns) || 0,
        puntReturnYards: parseFloat(statsObject.puntReturnYards) || 0,
        puntReturnTDs: parseInt(statsObject.puntReturnTDs) || 0,
        // Defensive stats (what opponent did against this team)
        totalYardsOpponent: parseFloat(statsObject.totalYardsOpponent) || 0,
        rushingYardsOpponent: parseFloat(statsObject.rushingYardsOpponent) || 0,
        netPassingYardsOpponent: parseFloat(statsObject.netPassingYardsOpponent) || 0,
        passingTDsOpponent: parseInt(statsObject.passingTDsOpponent) || 0,
        rushingTDsOpponent: parseInt(statsObject.rushingTDsOpponent) || 0,
        rushingAttemptsOpponent: parseInt(statsObject.rushingAttemptsOpponent) || 0,
        passAttemptsOpponent: parseInt(statsObject.passAttemptsOpponent) || 0,
        passCompletionsOpponent: parseInt(statsObject.passCompletionsOpponent) || 0,
        firstDownsOpponent: parseInt(statsObject.firstDownsOpponent) || 0,
        thirdDownsOpponent: parseInt(statsObject.thirdDownsOpponent) || 0,
        thirdDownConversionsOpponent: parseInt(statsObject.thirdDownConversionsOpponent) || 0,
        fourthDownsOpponent: parseInt(statsObject.fourthDownsOpponent) || 0,
        fourthDownConversionsOpponent: parseInt(statsObject.fourthDownConversionsOpponent) || 0,
        penaltiesOpponent: parseInt(statsObject.penaltiesOpponent) || 0,
        penaltyYardsOpponent: parseFloat(statsObject.penaltyYardsOpponent) || 0,
        turnoversOpponent: parseInt(statsObject.turnoversOpponent) || 0,
        fumblesLostOpponent: parseInt(statsObject.fumblesLostOpponent) || 0,
        passesInterceptedOpponent: parseInt(statsObject.passesInterceptedOpponent) || 0,
        possessionTimeOpponent: parseFloat(statsObject.possessionTimeOpponent) || 0,
        // Opponent return stats (what this team allowed in returns)
        kickReturnsOpponent: parseInt(statsObject.kickReturnsOpponent) || 0,
        kickReturnYardsOpponent: parseFloat(statsObject.kickReturnYardsOpponent) || 0,
        kickReturnTDsOpponent: parseInt(statsObject.kickReturnTDsOpponent) || 0,
        puntReturnsOpponent: parseInt(statsObject.puntReturnsOpponent) || 0,
        puntReturnYardsOpponent: parseFloat(statsObject.puntReturnYardsOpponent) || 0,
        puntReturnTDsOpponent: parseInt(statsObject.puntReturnTDsOpponent) || 0,
        // Defensive stats (what this team did on defense)
        sacks: parseInt(statsObject.sacks) || 0,
        interceptions: parseInt(statsObject.interceptions) || 0,
        interceptionYards: parseFloat(statsObject.interceptionYards) || 0,
        interceptionTDs: parseInt(statsObject.interceptionTDs) || 0,
        tacklesForLoss: parseInt(statsObject.tacklesForLoss) || 0,
        fumblesRecovered: parseInt(statsObject.fumblesRecovered) || 0,
        sacksOpponent: parseInt(statsObject.sacksOpponent) || 0,
        tacklesForLossOpponent: parseInt(statsObject.tacklesForLossOpponent) || 0,
        interceptionsOpponent: parseInt(statsObject.interceptionsOpponent) || 0,
        interceptionYardsOpponent: parseFloat(statsObject.interceptionYardsOpponent) || 0,
        interceptionTDsOpponent: parseInt(statsObject.interceptionTDsOpponent) || 0
      };
    } catch (error) {
      console.error(`Error fetching season stats for ${teamName}:`, error);
      return {
        // Offensive stats
        totalYards: 0,
        rushingYards: 0,
        netPassingYards: 0,
        passingTDs: 0,
        rushingTDs: 0,
        rushingAttempts: 0,
        passAttempts: 0,
        passCompletions: 0,
        firstDowns: 0,
        thirdDowns: 0,
        thirdDownConversions: 0,
        fourthDowns: 0,
        fourthDownConversions: 0,
        penalties: 0,
        penaltyYards: 0,
        turnovers: 0,
        fumblesLost: 0,
        passesIntercepted: 0,
        possessionTime: 0,
        // Return game
        kickReturns: 0,
        kickReturnYards: 0,
        kickReturnTDs: 0,
        puntReturns: 0,
        puntReturnYards: 0,
        puntReturnTDs: 0,
        // Defensive stats
        totalYardsOpponent: 0,
        rushingYardsOpponent: 0,
        netPassingYardsOpponent: 0,
        passingTDsOpponent: 0,
        rushingTDsOpponent: 0,
        rushingAttemptsOpponent: 0,
        passAttemptsOpponent: 0,
        passCompletionsOpponent: 0,
        firstDownsOpponent: 0,
        thirdDownsOpponent: 0,
        thirdDownConversionsOpponent: 0,
        fourthDownsOpponent: 0,
        fourthDownConversionsOpponent: 0,
        penaltiesOpponent: 0,
        penaltyYardsOpponent: 0,
        turnoversOpponent: 0,
        fumblesLostOpponent: 0,
        passesInterceptedOpponent: 0,
        possessionTimeOpponent: 0,
        kickReturnsOpponent: 0,
        kickReturnYardsOpponent: 0,
        kickReturnTDsOpponent: 0,
        puntReturnsOpponent: 0,
        puntReturnYardsOpponent: 0,
        puntReturnTDsOpponent: 0,
        sacks: 0,
        interceptions: 0,
        interceptionYards: 0,
        interceptionTDs: 0,
        tacklesForLoss: 0,
        fumblesRecovered: 0,
        sacksOpponent: 0,
        tacklesForLossOpponent: 0,
        interceptionsOpponent: 0,
        interceptionYardsOpponent: 0,
        interceptionTDsOpponent: 0
      };
    }
  };

  const calculate2024Stats = (record) => {
    return Promise.resolve({
      wins: record?.total?.wins || 0,
      losses: record?.total?.losses || 0,
      winPercentage: record?.total?.wins && record?.total?.losses 
        ? (record.total.wins / (record.total.wins + record.total.losses)) * 100 
        : 0,
      conferenceWins: record?.conferenceGames?.wins || 0,
      conferenceLosses: record?.conferenceGames?.losses || 0
    });
  };

  const getTeamColor = (team) => {
    return team?.color || '#cc001c';
  };

  const getWinner = (value1, value2) => {
    const num1 = parseFloat(value1);
    const num2 = parseFloat(value2);
    if (num1 > num2) return 'team1';
    if (num2 > num1) return 'team2';
    return 'tie';
  };

  // Modern Comparison Card Component
  const ModernComparisonCard = ({ title, subtitle, icon, value1, value2, team1, team2, animateStats, getTeamColor, getWinner, compareBy = 'value', team1Value, team2Value }) => {
    // Use custom values for comparison if provided, otherwise parse the display values
    const winner = compareBy === 'wins' && team1Value !== undefined && team2Value !== undefined 
      ? getWinner(team1Value, team2Value)
      : getWinner(value1, value2);
    
    return (
      <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8 transition-all duration-500 ${animateStats ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Card Header */}
        <div className="flex items-center space-x-4 mb-8">
          <i className={`fas fa-${icon} text-3xl gradient-text`}></i>
          <div>
            <h3 className="text-2xl font-black gradient-text">{title}</h3>
            <p className="text-sm text-gray-600 font-medium">{subtitle}</p>
          </div>
        </div>

        {/* Team Comparison */}
        <div className="flex items-center justify-between">
          {/* Team 1 */}
          <div className="text-center space-y-4 flex-1">
            <div className="w-16 h-16 mx-auto flex items-center justify-center">
              {team1?.logos?.[0] ? (
                <img src={team1.logos[0]} alt={team1.school} className="w-full h-full object-contain drop-shadow-sm" />
              ) : (
                <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: getTeamColor(team1) }}>
                  {team1?.school?.[0]}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-bold" style={{ color: getTeamColor(team1) }}>
                {team1?.school}
              </p>
              <div className={`text-4xl font-black transition-all duration-600 ${animateStats ? 'opacity-100 scale-100' : 'opacity-60 scale-90'}`} 
                   style={{ color: getTeamColor(team1) }}>
                {value1}
              </div>
            </div>

            {/* Winner Badge */}
            {winner === 'team1' && (
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-100 border border-green-200">
                <i className="fas fa-star text-green-600 text-sm"></i>
                <span className="text-xs font-bold text-green-700">WINNER</span>
              </div>
            )}
          </div>

          {/* VS Section with Winner Arrow */}
          <div className="text-center space-y-4 mx-8">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-600 font-bold text-sm">VS</span>
            </div>
            
            {/* Winner Arrow */}
            {winner !== 'tie' && (
              <i className={`fas fa-arrow-${winner === 'team1' ? 'left' : 'right'} text-green-500 text-2xl ${animateStats ? 'animate-pulse' : ''}`}></i>
            )}
          </div>

          {/* Team 2 */}
          <div className="text-center space-y-4 flex-1">
            <div className="w-16 h-16 mx-auto flex items-center justify-center">
              {team2?.logos?.[0] ? (
                <img src={team2.logos[0]} alt={team2.school} className="w-full h-full object-contain drop-shadow-sm" />
              ) : (
                <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: getTeamColor(team2) }}>
                  {team2?.school?.[0]}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-bold" style={{ color: getTeamColor(team2) }}>
                {team2?.school}
              </p>
              <div className={`text-4xl font-black transition-all duration-600 ${animateStats ? 'opacity-100 scale-100' : 'opacity-60 scale-90'}`} 
                   style={{ color: getTeamColor(team2) }}>
                {value2}
              </div>
            </div>

            {/* Winner Badge */}
            {winner === 'team2' && (
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-100 border border-green-200">
                <i className="fas fa-star text-green-600 text-sm"></i>
                <span className="text-xs font-bold text-green-700">WINNER</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Team Grading System - Calculate letter grades based on performance metrics
  const calculateTeamGrades = (teamData) => {
    // Offensive Grade Calculation (0-100 scale)
    const offensiveScore = Math.min(100, Math.max(0,
      // Total yards per game (normalized to 0-25 points, 500+ yards = 25)
      Math.min(25, (teamData.totalYards / 13) / 500 * 25) +
      // Yards per play (normalized to 0-20 points, 7+ YPP = 20)
      Math.min(20, ((teamData.rushingAttempts + teamData.passAttempts) > 0 ? 
        (teamData.totalYards / (teamData.rushingAttempts + teamData.passAttempts)) / 7 * 20 : 0)) +
      // Third down conversion rate (normalized to 0-15 points, 50%+ = 15)
      Math.min(15, teamData.thirdDowns > 0 ? 
        ((teamData.thirdDownConversions / teamData.thirdDowns) / 0.5 * 15) : 0) +
      // Total TDs (normalized to 0-15 points, 40+ TDs = 15)
      Math.min(15, (teamData.passingTDs + teamData.rushingTDs) / 40 * 15) +
      // Passing efficiency (normalized to 0-15 points, 65%+ completion = 15)
      Math.min(15, teamData.passAttempts > 0 ? 
        ((teamData.passCompletions / teamData.passAttempts) / 0.65 * 15) : 0) +
      // Penalty reduction bonus (0-10 points, fewer penalties = higher score)
      Math.min(10, Math.max(0, 10 - (teamData.penalties / 13 * 2)))
    ));

    // Defensive Grade Calculation (0-100 scale)
    const defensiveScore = Math.min(100, Math.max(0,
      // Yards allowed per game (normalized to 0-25 points, <300 yards = 25)
      Math.min(25, Math.max(0, 25 - ((teamData.totalYardsOpponent / 13) - 300) / 10)) +
      // Yards per play allowed (normalized to 0-20 points, <4.5 YPP = 20)
      Math.min(20, ((teamData.rushingAttemptsOpponent + teamData.passAttemptsOpponent) > 0 ? 
        Math.max(0, 20 - ((teamData.totalYardsOpponent / (teamData.rushingAttemptsOpponent + teamData.passAttemptsOpponent)) - 4.5) * 4) : 0)) +
      // Turnovers forced (normalized to 0-20 points, 25+ turnovers = 20)
      Math.min(20, teamData.turnoversOpponent / 25 * 20) +
      // Sacks (normalized to 0-15 points, 40+ sacks = 15)
      Math.min(15, teamData.sacks / 40 * 15) +
      // Third down defense (normalized to 0-15 points, <35% allowed = 15)
      Math.min(15, teamData.thirdDownsOpponent > 0 ? 
        Math.max(0, 15 - (teamData.thirdDownConversionsOpponent / teamData.thirdDownsOpponent) / 0.35 * 15) : 0) +
      // Tackles for loss bonus (normalized to 0-5 points, 80+ TFL = 5)
      Math.min(5, teamData.tacklesForLoss / 80 * 5)
    ));

    // Overall Grade (weighted average: 40% offense, 35% defense, 25% special factors)
    const specialFactors = Math.min(25, Math.max(0,
      // Win percentage (0-15 points)
      (teamData.winPercentage / 100 * 15) +
      // Turnover differential bonus (0-10 points)
      Math.min(10, Math.max(-5, (teamData.turnoversOpponent - teamData.turnovers) + 5))
    ));

    const overallScore = (offensiveScore * 0.4) + (defensiveScore * 0.35) + (specialFactors * 0.25);

    // Convert scores to letter grades
    const getLetterGrade = (score) => {
      if (score >= 90) return 'A+';
      if (score >= 85) return 'A';
      if (score >= 80) return 'A-';
      if (score >= 77) return 'B+';
      if (score >= 73) return 'B';
      if (score >= 70) return 'B-';
      if (score >= 67) return 'C+';
      if (score >= 63) return 'C';
      if (score >= 60) return 'C-';
      if (score >= 57) return 'D+';
      if (score >= 53) return 'D';
      if (score >= 50) return 'D-';
      return 'F';
    };

    const getGradeColor = (grade) => {
      if (grade.startsWith('A')) return '#22c55e'; // Green
      if (grade.startsWith('B')) return '#3b82f6'; // Blue
      if (grade.startsWith('C')) return '#f59e0b'; // Yellow
      if (grade.startsWith('D')) return '#f97316'; // Orange
      return '#ef4444'; // Red for F
    };

    return {
      offense: {
        grade: getLetterGrade(offensiveScore),
        score: offensiveScore.toFixed(1),
        color: getGradeColor(getLetterGrade(offensiveScore))
      },
      defense: {
        grade: getLetterGrade(defensiveScore),
        score: defensiveScore.toFixed(1),
        color: getGradeColor(getLetterGrade(defensiveScore))
      },
      overall: {
        grade: getLetterGrade(overallScore),
        score: overallScore.toFixed(1),
        color: getGradeColor(getLetterGrade(overallScore))
      }
    };
  };

  // Calculate grades for both teams (only if data is loaded)
  const team1Grades = !loading && !error ? calculateTeamGrades(season2024Data.team1) : null;
  const team2Grades = !loading && !error ? calculateTeamGrades(season2024Data.team2) : null;

  // Determine which team has the edge
  const getTeamEdge = () => {
    if (!team1Grades || !team2Grades) return { winner: 'tie', message: 'Loading...' };
    
    const team1Overall = parseFloat(team1Grades.overall.score);
    const team2Overall = parseFloat(team2Grades.overall.score);
    
    if (Math.abs(team1Overall - team2Overall) < 2) {
      return {
        winner: 'tie',
        message: "It's a dead heat! Both teams are evenly matched - may the best team win!"
      };
    } else if (team1Overall > team2Overall) {
      return {
        winner: 'team1',
        message: `${team1?.school} has the edge! Argue with your mom, stats don't lie! 📊🔥`
      };
    } else {
      return {
        winner: 'team2',
        message: `${team2?.school} has the edge! Argue with your mom, stats don't lie! 📊🔥`
      };
    }
  };

  const teamEdge = getTeamEdge();

  // Grade Card Component
  const GradeCard = ({ title, grade, score, color, teamColor }) => (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 p-4 text-center shadow-lg">
      <h4 className="text-sm font-bold text-gray-700 mb-2">{title}</h4>
      <div className="text-3xl font-black mb-1" style={{ color }}>
        {grade}
      </div>
      <div className="text-xs text-gray-500">
        {score}/100
      </div>
    </div>
  );

  // Team Report Card Component
  const TeamReportCard = ({ team, grades, isWinner }) => (
    <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 p-6 ${isWinner ? 'ring-4 ring-green-400 ring-opacity-50' : ''} transition-all duration-300`}>
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 flex items-center justify-center">
          {team?.logos?.[0] ? (
            <img src={team.logos[0]} alt={team.school} className="w-full h-full object-contain drop-shadow-sm" />
          ) : (
            <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: getTeamColor(team) }}>
              {team?.school?.[0]}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-black" style={{ color: getTeamColor(team) }}>
            {team?.school}
          </h3>
          <p className="text-sm text-gray-600">2024 Season Report Card</p>
          {isWinner && (
            <div className="inline-flex items-center space-x-2 mt-2 px-3 py-1 rounded-full bg-green-100 border border-green-200">
              <i className="fas fa-crown text-green-600 text-sm"></i>
              <span className="text-xs font-bold text-green-700">STATISTICAL ADVANTAGE</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <GradeCard 
          title="Offense" 
          grade={grades.offense.grade} 
          score={grades.offense.score} 
          color={grades.offense.color}
          teamColor={getTeamColor(team)}
        />
        <GradeCard 
          title="Defense" 
          grade={grades.defense.grade} 
          score={grades.defense.score} 
          color={grades.defense.color}
          teamColor={getTeamColor(team)}
        />
        <GradeCard 
          title="Overall" 
          grade={grades.overall.grade} 
          score={grades.overall.score} 
          color={grades.overall.color}
          teamColor={getTeamColor(team)}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center py-20">
          <div className="relative mb-8">
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl mx-auto"></div>
            <div className="relative w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center mx-auto">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-gray-600"></div>
            </div>
          </div>
          <h3 className="text-2xl font-bold gradient-text">Loading 2024 Season...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center py-20">
          <div className="relative mb-8">
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl mx-auto"></div>
            <div className="relative w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center mx-auto">
              <i className="fas fa-exclamation-triangle text-red-500 text-3xl"></i>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <style>{`
        .gradient-text {
          background: linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Header */}
      <div className={`text-center space-y-4 transition-all duration-500 ${animateStats ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex items-center justify-center space-x-4 mb-6">
          <i className="fas fa-calendar-day text-4xl gradient-text"></i>
          <h2 className="text-4xl font-black gradient-text">2024 Season</h2>
        </div>
        <p className="text-xl text-gray-600 font-light">
          Current Season Performance Comparison
        </p>
      </div>

      {/* Team Report Cards */}
      {!loading && !error && team1Grades && team2Grades && (
        <div className={`space-y-6 transition-all duration-500 ${animateStats ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          {/* Statistical Edge Banner */}
          <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-3xl border border-red-400/50 p-6 text-center shadow-2xl">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <i className="fas fa-chart-line text-white text-3xl"></i>
              <h3 className="text-2xl font-black text-white">STATISTICAL ANALYSIS</h3>
              <i className="fas fa-chart-line text-white text-3xl"></i>
            </div>
            <p className="text-xl font-bold text-white mb-2">
              {teamEdge.message}
            </p>
            <p className="text-sm text-red-100 font-medium">
              Based on comprehensive offensive, defensive, and overall performance metrics
            </p>
          </div>

          {/* Report Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <TeamReportCard 
              team={team1} 
              grades={team1Grades} 
              isWinner={teamEdge.winner === 'team1'}
            />
            <TeamReportCard 
              team={team2} 
              grades={team2Grades} 
              isWinner={teamEdge.winner === 'team2'}
            />
          </div>

          {/* Grading Methodology */}
          <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <i className="fas fa-calculator text-2xl gradient-text"></i>
              <h3 className="text-xl font-black gradient-text">How We Calculate Grades</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-700">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">🏈 Offense (40%)</h4>
                <p>Total yards, efficiency metrics, third down conversions, touchdowns, completion %, and penalties</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">🛡️ Defense (35%)</h4>
                <p>Yards allowed, takeaways, sacks, tackles for loss, third down stops, and defensive efficiency</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">⭐ Overall (25%)</h4>
                <p>Win percentage, turnover differential, and clutch performance factors</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Cards */}
      <div className="space-y-6">
        {/* Section Header */}
        <div className={`text-center space-y-2 transition-all duration-500 ${animateStats ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <h3 className="text-2xl font-black gradient-text">Detailed Statistical Breakdown</h3>
          <p className="text-gray-600">Head-to-head comparison of all 2024 season metrics</p>
        </div>

        {/* Overall Record */}
        <ModernComparisonCard
          title="Overall Record"
          subtitle="2024 Season Wins-Losses"
          icon="chart-line"
          value1={`${season2024Data.team1.wins}-${season2024Data.team1.losses}`}
          value2={`${season2024Data.team2.wins}-${season2024Data.team2.losses}`}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
          compareBy="wins"
          team1Value={season2024Data.team1.wins}
          team2Value={season2024Data.team2.wins}
        />

        {/* Win Percentage */}
        <ModernComparisonCard
          title="Win Percentage"
          subtitle="2024 Season Success Rate"
          icon="percent"
          value1={season2024Data.team1.winPercentage.toFixed(1) + '%'}
          value2={season2024Data.team2.winPercentage.toFixed(1) + '%'}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Conference Record */}
        <ModernComparisonCard
          title="Conference Record"
          subtitle="Conference Play Performance"
          icon="trophy"
          value1={`${season2024Data.team1.conferenceWins}-${season2024Data.team1.conferenceLosses}`}
          value2={`${season2024Data.team2.conferenceWins}-${season2024Data.team2.conferenceLosses}`}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
          compareBy="wins"
          team1Value={season2024Data.team1.conferenceWins}
          team2Value={season2024Data.team2.conferenceWins}
        />

        {/* Total Yards */}
        <ModernComparisonCard
          title="Total Yards"
          subtitle="Total Offensive Production"
          icon="arrows-alt-h"
          value1={season2024Data.team1.totalYards.toLocaleString()}
          value2={season2024Data.team2.totalYards.toLocaleString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Rushing Yards */}
        <ModernComparisonCard
          title="Rushing Yards"
          subtitle="Ground Game Production"
          icon="running"
          value1={season2024Data.team1.rushingYards.toLocaleString()}
          value2={season2024Data.team2.rushingYards.toLocaleString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Passing Yards */}
        <ModernComparisonCard
          title="Passing Yards"
          subtitle="Aerial Attack Production"
          icon="paper-plane"
          value1={season2024Data.team1.netPassingYards.toLocaleString()}
          value2={season2024Data.team2.netPassingYards.toLocaleString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Total Touchdowns */}
        <ModernComparisonCard
          title="Total Touchdowns"
          subtitle="Passing + Rushing TDs"
          icon="football-ball"
          value1={(season2024Data.team1.passingTDs + season2024Data.team1.rushingTDs).toString()}
          value2={(season2024Data.team2.passingTDs + season2024Data.team2.rushingTDs).toString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Sacks */}
        <ModernComparisonCard
          title="Sacks"
          subtitle="Quarterback Pressures"
          icon="shield-alt"
          value1={season2024Data.team1.sacks.toString()}
          value2={season2024Data.team2.sacks.toString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Interceptions */}
        <ModernComparisonCard
          title="Interceptions"
          subtitle="Defensive Takeaways"
          icon="hand-paper"
          value1={season2024Data.team1.interceptions.toString()}
          value2={season2024Data.team2.interceptions.toString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Yards Allowed */}
        <ModernComparisonCard
          title="Yards Allowed"
          subtitle="Total Defensive Yards Allowed (Lower is Better)"
          icon="shield"
          value1={season2024Data.team1.totalYardsOpponent.toLocaleString()}
          value2={season2024Data.team2.totalYardsOpponent.toLocaleString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={(v1, v2) => getWinner(v2, v1)} // Reverse comparison for defensive stat
        />

        {/* === EXPANDED OFFENSIVE STATISTICS === */}
        
        {/* Passing Efficiency */}
        <ModernComparisonCard
          title="Passing Efficiency"
          subtitle="Completion Percentage"
          icon="bullseye"
          value1={season2024Data.team1.passAttempts > 0 ? ((season2024Data.team1.passCompletions / season2024Data.team1.passAttempts) * 100).toFixed(1) + '%' : '0%'}
          value2={season2024Data.team2.passAttempts > 0 ? ((season2024Data.team2.passCompletions / season2024Data.team2.passAttempts) * 100).toFixed(1) + '%' : '0%'}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
          compareBy="percentage"
          team1Value={season2024Data.team1.passAttempts > 0 ? (season2024Data.team1.passCompletions / season2024Data.team1.passAttempts) * 100 : 0}
          team2Value={season2024Data.team2.passAttempts > 0 ? (season2024Data.team2.passCompletions / season2024Data.team2.passAttempts) * 100 : 0}
        />

        {/* Rushing Attempts */}
        <ModernComparisonCard
          title="Rushing Attempts"
          subtitle="Total Ground Game Carries"
          icon="running"
          value1={season2024Data.team1.rushingAttempts.toLocaleString()}
          value2={season2024Data.team2.rushingAttempts.toLocaleString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Yards Per Carry */}
        <ModernComparisonCard
          title="Yards Per Carry"
          subtitle="Rushing Efficiency"
          icon="tachometer-alt"
          value1={season2024Data.team1.rushingAttempts > 0 ? (season2024Data.team1.rushingYards / season2024Data.team1.rushingAttempts).toFixed(1) : '0.0'}
          value2={season2024Data.team2.rushingAttempts > 0 ? (season2024Data.team2.rushingYards / season2024Data.team2.rushingAttempts).toFixed(1) : '0.0'}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
          compareBy="efficiency"
          team1Value={season2024Data.team1.rushingAttempts > 0 ? season2024Data.team1.rushingYards / season2024Data.team1.rushingAttempts : 0}
          team2Value={season2024Data.team2.rushingAttempts > 0 ? season2024Data.team2.rushingYards / season2024Data.team2.rushingAttempts : 0}
        />

        {/* Yards Per Pass */}
        <ModernComparisonCard
          title="Yards Per Pass"
          subtitle="Passing Efficiency"
          icon="paper-plane"
          value1={season2024Data.team1.passAttempts > 0 ? (season2024Data.team1.netPassingYards / season2024Data.team1.passAttempts).toFixed(1) : '0.0'}
          value2={season2024Data.team2.passAttempts > 0 ? (season2024Data.team2.netPassingYards / season2024Data.team2.passAttempts).toFixed(1) : '0.0'}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
          compareBy="efficiency"
          team1Value={season2024Data.team1.passAttempts > 0 ? season2024Data.team1.netPassingYards / season2024Data.team1.passAttempts : 0}
          team2Value={season2024Data.team2.passAttempts > 0 ? season2024Data.team2.netPassingYards / season2024Data.team2.passAttempts : 0}
        />

        {/* First Downs */}
        <ModernComparisonCard
          title="First Downs"
          subtitle="Drive Sustainability"
          icon="arrow-right"
          value1={season2024Data.team1.firstDowns.toLocaleString()}
          value2={season2024Data.team2.firstDowns.toLocaleString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Third Down Conversion Rate */}
        <ModernComparisonCard
          title="Third Down Conversion Rate"
          subtitle="Clutch Performance"
          icon="percentage"
          value1={season2024Data.team1.thirdDowns > 0 ? ((season2024Data.team1.thirdDownConversions / season2024Data.team1.thirdDowns) * 100).toFixed(1) + '%' : '0%'}
          value2={season2024Data.team2.thirdDowns > 0 ? ((season2024Data.team2.thirdDownConversions / season2024Data.team2.thirdDowns) * 100).toFixed(1) + '%' : '0%'}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
          compareBy="percentage"
          team1Value={season2024Data.team1.thirdDowns > 0 ? (season2024Data.team1.thirdDownConversions / season2024Data.team1.thirdDowns) * 100 : 0}
          team2Value={season2024Data.team2.thirdDowns > 0 ? (season2024Data.team2.thirdDownConversions / season2024Data.team2.thirdDowns) * 100 : 0}
        />

        {/* Fourth Down Conversion Rate */}
        <ModernComparisonCard
          title="Fourth Down Conversion Rate"
          subtitle="High-Risk Situations"
          icon="exclamation-triangle"
          value1={season2024Data.team1.fourthDowns > 0 ? ((season2024Data.team1.fourthDownConversions / season2024Data.team1.fourthDowns) * 100).toFixed(1) + '%' : '0%'}
          value2={season2024Data.team2.fourthDowns > 0 ? ((season2024Data.team2.fourthDownConversions / season2024Data.team2.fourthDowns) * 100).toFixed(1) + '%' : '0%'}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
          compareBy="percentage"
          team1Value={season2024Data.team1.fourthDowns > 0 ? (season2024Data.team1.fourthDownConversions / season2024Data.team1.fourthDowns) * 100 : 0}
          team2Value={season2024Data.team2.fourthDowns > 0 ? (season2024Data.team2.fourthDownConversions / season2024Data.team2.fourthDowns) * 100 : 0}
        />

        {/* Time of Possession */}
        <ModernComparisonCard
          title="Time of Possession"
          subtitle="Ball Control (Minutes)"
          icon="clock"
          value1={season2024Data.team1.possessionTime.toFixed(1)}
          value2={season2024Data.team2.possessionTime.toFixed(1)}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Turnovers */}
        <ModernComparisonCard
          title="Turnovers"
          subtitle="Offensive Mistakes (Lower is Better)"
          icon="exclamation-circle"
          value1={season2024Data.team1.turnovers.toString()}
          value2={season2024Data.team2.turnovers.toString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={(v1, v2) => getWinner(v2, v1)} // Reverse comparison - fewer turnovers is better
        />

        {/* Penalties */}
        <ModernComparisonCard
          title="Penalties"
          subtitle="Discipline Issues (Lower is Better)"
          icon="flag"
          value1={season2024Data.team1.penalties.toString()}
          value2={season2024Data.team2.penalties.toString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={(v1, v2) => getWinner(v2, v1)} // Reverse comparison - fewer penalties is better
        />

        {/* Penalty Yards */}
        <ModernComparisonCard
          title="Penalty Yards"
          subtitle="Yardage Lost to Penalties (Lower is Better)"
          icon="flag"
          value1={season2024Data.team1.penaltyYards.toLocaleString()}
          value2={season2024Data.team2.penaltyYards.toLocaleString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={(v1, v2) => getWinner(v2, v1)} // Reverse comparison - fewer penalty yards is better
        />

        {/* === DEFENSIVE STATISTICS === */}

        {/* Rushing Defense */}
        <ModernComparisonCard
          title="Rushing Defense"
          subtitle="Rushing Yards Allowed (Lower is Better)"
          icon="shield-alt"
          value1={season2024Data.team1.rushingYardsOpponent.toLocaleString()}
          value2={season2024Data.team2.rushingYardsOpponent.toLocaleString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={(v1, v2) => getWinner(v2, v1)} // Reverse comparison for defensive stat
        />

        {/* Passing Defense */}
        <ModernComparisonCard
          title="Passing Defense"
          subtitle="Passing Yards Allowed (Lower is Better)"
          icon="shield"
          value1={season2024Data.team1.netPassingYardsOpponent.toLocaleString()}
          value2={season2024Data.team2.netPassingYardsOpponent.toLocaleString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={(v1, v2) => getWinner(v2, v1)} // Reverse comparison for defensive stat
        />

        {/* Tackles for Loss */}
        <ModernComparisonCard
          title="Tackles for Loss"
          subtitle="Disruptive Defensive Plays"
          icon="hand-rock"
          value1={season2024Data.team1.tacklesForLoss.toString()}
          value2={season2024Data.team2.tacklesForLoss.toString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Forced Turnovers */}
        <ModernComparisonCard
          title="Forced Turnovers"
          subtitle="Defensive Takeaways"
          icon="hand-paper"
          value1={season2024Data.team1.turnoversOpponent.toString()}
          value2={season2024Data.team2.turnoversOpponent.toString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Interception Return Yards */}
        <ModernComparisonCard
          title="Interception Return Yards"
          subtitle="Pick-Six Potential"
          icon="hand-scissors"
          value1={season2024Data.team1.interceptionYards.toLocaleString()}
          value2={season2024Data.team2.interceptionYards.toLocaleString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Fumbles Recovered */}
        <ModernComparisonCard
          title="Fumbles Recovered"
          subtitle="Opportunistic Defense"
          icon="football-ball"
          value1={season2024Data.team1.fumblesRecovered.toString()}
          value2={season2024Data.team2.fumblesRecovered.toString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* Opponent Third Down Defense */}
        <ModernComparisonCard
          title="Third Down Defense"
          subtitle="Third Down Stop Rate"
          icon="hand-paper"
          value1={season2024Data.team1.thirdDownsOpponent > 0 ? (100 - ((season2024Data.team1.thirdDownConversionsOpponent / season2024Data.team1.thirdDownsOpponent) * 100)).toFixed(1) + '%' : '0%'}
          value2={season2024Data.team2.thirdDownsOpponent > 0 ? (100 - ((season2024Data.team2.thirdDownConversionsOpponent / season2024Data.team2.thirdDownsOpponent) * 100)).toFixed(1) + '%' : '0%'}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
          compareBy="percentage"
          team1Value={season2024Data.team1.thirdDownsOpponent > 0 ? 100 - ((season2024Data.team1.thirdDownConversionsOpponent / season2024Data.team1.thirdDownsOpponent) * 100) : 0}
          team2Value={season2024Data.team2.thirdDownsOpponent > 0 ? 100 - ((season2024Data.team2.thirdDownConversionsOpponent / season2024Data.team2.thirdDownsOpponent) * 100) : 0}
        />

        {/* === SPECIAL TEAMS & RETURN GAME === */}

        {/* Kick Return Average */}
        <ModernComparisonCard
          title="Kick Return Average"
          subtitle="Kickoff Return Efficiency"
          icon="fast-forward"
          value1={season2024Data.team1.kickReturns > 0 ? (season2024Data.team1.kickReturnYards / season2024Data.team1.kickReturns).toFixed(1) : '0.0'}
          value2={season2024Data.team2.kickReturns > 0 ? (season2024Data.team2.kickReturnYards / season2024Data.team2.kickReturns).toFixed(1) : '0.0'}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
          compareBy="average"
          team1Value={season2024Data.team1.kickReturns > 0 ? season2024Data.team1.kickReturnYards / season2024Data.team1.kickReturns : 0}
          team2Value={season2024Data.team2.kickReturns > 0 ? season2024Data.team2.kickReturnYards / season2024Data.team2.kickReturns : 0}
        />

        {/* Punt Return Average */}
        <ModernComparisonCard
          title="Punt Return Average"
          subtitle="Punt Return Efficiency"
          icon="undo"
          value1={season2024Data.team1.puntReturns > 0 ? (season2024Data.team1.puntReturnYards / season2024Data.team1.puntReturns).toFixed(1) : '0.0'}
          value2={season2024Data.team2.puntReturns > 0 ? (season2024Data.team2.puntReturnYards / season2024Data.team2.puntReturns).toFixed(1) : '0.0'}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
          compareBy="average"
          team1Value={season2024Data.team1.puntReturns > 0 ? season2024Data.team1.puntReturnYards / season2024Data.team1.puntReturns : 0}
          team2Value={season2024Data.team2.puntReturns > 0 ? season2024Data.team2.puntReturnYards / season2024Data.team2.puntReturns : 0}
        />

        {/* Return Touchdowns */}
        <ModernComparisonCard
          title="Return Touchdowns"
          subtitle="Special Teams Scores"
          icon="star"
          value1={(season2024Data.team1.kickReturnTDs + season2024Data.team1.puntReturnTDs).toString()}
          value2={(season2024Data.team2.kickReturnTDs + season2024Data.team2.puntReturnTDs).toString()}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
        />

        {/* === ADDITIONAL EFFICIENCY METRICS === */}

        {/* Yards Per Play */}
        <ModernComparisonCard
          title="Yards Per Play"
          subtitle="Overall Offensive Efficiency"
          icon="chart-line"
          value1={((season2024Data.team1.rushingAttempts + season2024Data.team1.passAttempts) > 0) ? (season2024Data.team1.totalYards / (season2024Data.team1.rushingAttempts + season2024Data.team1.passAttempts)).toFixed(1) : '0.0'}
          value2={((season2024Data.team2.rushingAttempts + season2024Data.team2.passAttempts) > 0) ? (season2024Data.team2.totalYards / (season2024Data.team2.rushingAttempts + season2024Data.team2.passAttempts)).toFixed(1) : '0.0'}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={getWinner}
          compareBy="efficiency"
          team1Value={((season2024Data.team1.rushingAttempts + season2024Data.team1.passAttempts) > 0) ? season2024Data.team1.totalYards / (season2024Data.team1.rushingAttempts + season2024Data.team1.passAttempts) : 0}
          team2Value={((season2024Data.team2.rushingAttempts + season2024Data.team2.passAttempts) > 0) ? season2024Data.team2.totalYards / (season2024Data.team2.rushingAttempts + season2024Data.team2.passAttempts) : 0}
        />

        {/* Yards Per Play Allowed */}
        <ModernComparisonCard
          title="Yards Per Play Allowed"
          subtitle="Defensive Efficiency (Lower is Better)"
          icon="shield-virus"
          value1={((season2024Data.team1.rushingAttemptsOpponent + season2024Data.team1.passAttemptsOpponent) > 0) ? (season2024Data.team1.totalYardsOpponent / (season2024Data.team1.rushingAttemptsOpponent + season2024Data.team1.passAttemptsOpponent)).toFixed(1) : '0.0'}
          value2={((season2024Data.team2.rushingAttemptsOpponent + season2024Data.team2.passAttemptsOpponent) > 0) ? (season2024Data.team2.totalYardsOpponent / (season2024Data.team2.rushingAttemptsOpponent + season2024Data.team2.passAttemptsOpponent)).toFixed(1) : '0.0'}
          team1={team1}
          team2={team2}
          animateStats={animateStats}
          getTeamColor={getTeamColor}
          getWinner={(v1, v2) => getWinner(v2, v1)} // Reverse comparison for defensive stat
          compareBy="efficiency"
          team1Value={((season2024Data.team1.rushingAttemptsOpponent + season2024Data.team1.passAttemptsOpponent) > 0) ? season2024Data.team1.totalYardsOpponent / (season2024Data.team1.rushingAttemptsOpponent + season2024Data.team1.passAttemptsOpponent) : 0}
          team2Value={((season2024Data.team2.rushingAttemptsOpponent + season2024Data.team2.passAttemptsOpponent) > 0) ? season2024Data.team2.totalYardsOpponent / (season2024Data.team2.rushingAttemptsOpponent + season2024Data.team2.passAttemptsOpponent) : 0}
        />
        
        {/* Existing Yards Allowed card... */}
      </div>

      {/* Legend */}
      <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8 transition-all duration-500 ${animateStats ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex items-center space-x-4 mb-6">
          <i className="fas fa-info-circle text-2xl gradient-text"></i>
          <h3 className="text-2xl font-black gradient-text">About This Data</h3>
        </div>
        
        <div className="space-y-4 text-gray-700">
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Current Season</h4>
            <p className="text-sm">Complete 2024 college football season statistics for both teams, including record and comprehensive performance metrics.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Offensive Metrics</h4>
            <p className="text-sm">Total yards, rushing/passing production, efficiency rates (yards per carry/pass), first downs, third/fourth down conversions, time of possession, penalties, and turnovers.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Defensive Metrics</h4>
            <p className="text-sm">Yards allowed (total, rushing, passing), sacks, tackles for loss, interceptions, fumbles recovered, forced turnovers, and defensive stop rates on key downs.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Special Teams</h4>
            <p className="text-sm">Kick and punt return averages, return touchdowns, and overall special teams efficiency ratings.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Efficiency Analysis</h4>
            <p className="text-sm">Advanced metrics including yards per play (offense and defense), completion percentages, conversion rates, and turnover differentials.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Data Source</h4>
            <p className="text-sm">Live statistics from the College Football Data API, featuring official NCAA game data updated throughout the season.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Season2024Tab;
