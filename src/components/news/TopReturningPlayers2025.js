import React, { useState, useEffect, useMemo } from 'react';
import { newsService } from '../../services';

const TopReturningPlayers2025 = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [showPositionFilter, setShowPositionFilter] = useState(false);
  const [hoveredPlayer, setHoveredPlayer] = useState(null);
  const [newsArticles, setNewsArticles] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('detailed'); // 'detailed' or 'compact'

  // Professional gradient system
  const gradients = {
    // Category gradients
    gold: 'linear-gradient(135deg, rgb(250, 204, 21), rgb(245, 158, 11), rgb(217, 119, 6), rgb(245, 158, 11), rgb(250, 204, 21))',
    silver: 'linear-gradient(135deg, rgb(148, 163, 184), rgb(100, 116, 139), rgb(71, 85, 105), rgb(100, 116, 139), rgb(148, 163, 184))',
    bronze: 'linear-gradient(135deg, rgb(180, 83, 9), rgb(154, 52, 18), rgb(120, 53, 15), rgb(154, 52, 18), rgb(180, 83, 9))',
    blue: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235), rgb(29, 78, 216), rgb(37, 99, 235), rgb(59, 130, 246))',
    emerald: 'linear-gradient(135deg, rgb(16, 185, 129), rgb(5, 150, 105), rgb(4, 120, 87), rgb(5, 150, 105), rgb(16, 185, 129))',
    
    // Position gradients
    violet: 'linear-gradient(135deg, rgb(167, 139, 250), rgb(139, 92, 246), rgb(109, 40, 217), rgb(139, 92, 246), rgb(167, 139, 250))',
    skyBlue: 'linear-gradient(135deg, rgb(56, 189, 248), rgb(14, 165, 233), rgb(2, 132, 199), rgb(14, 165, 233), rgb(56, 189, 248))',
    orange: 'linear-gradient(135deg, rgb(251, 146, 60), rgb(249, 115, 22), rgb(234, 88, 12), rgb(249, 115, 22), rgb(251, 146, 60))',
    lime: 'linear-gradient(135deg, rgb(163, 230, 53), rgb(132, 204, 22), rgb(101, 163, 13), rgb(132, 204, 22), rgb(163, 230, 53))',
    slate: 'linear-gradient(135deg, rgb(148, 163, 184), rgb(100, 116, 139), rgb(51, 65, 85), rgb(100, 116, 139), rgb(148, 163, 184))',
    crimson: 'linear-gradient(135deg, rgb(220, 38, 38), rgb(185, 28, 28), rgb(153, 27, 27), rgb(185, 28, 28), rgb(220, 38, 38))',
    amber: 'linear-gradient(135deg, rgb(252, 211, 77), rgb(251, 191, 36), rgb(245, 158, 11), rgb(251, 191, 36), rgb(252, 211, 77))',
    navy: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235), rgb(30, 58, 138), rgb(37, 99, 235), rgb(59, 130, 246))',
    cyan: 'linear-gradient(135deg, rgb(103, 232, 249), rgb(34, 211, 238), rgb(6, 182, 212), rgb(34, 211, 238), rgb(103, 232, 249))',
    
    // Achievement gradients
    rose: 'linear-gradient(135deg, rgb(251, 207, 232), rgb(244, 114, 182), rgb(236, 72, 153), rgb(244, 114, 182), rgb(251, 207, 232))',
    sapphire: 'linear-gradient(135deg, rgb(37, 99, 235), rgb(29, 78, 216), rgb(30, 64, 175), rgb(29, 78, 216), rgb(37, 99, 235))',
    fuchsia: 'linear-gradient(135deg, rgb(232, 121, 249), rgb(217, 70, 239), rgb(192, 38, 211), rgb(217, 70, 239), rgb(232, 121, 249))',
    coral: 'linear-gradient(135deg, rgb(252, 165, 165), rgb(248, 113, 113), rgb(239, 68, 68), rgb(248, 113, 113), rgb(252, 165, 165))',
    burgundy: 'linear-gradient(135deg, rgb(159, 18, 57), rgb(136, 19, 55), rgb(99, 7, 37), rgb(136, 19, 55), rgb(159, 18, 57))'
  };

  // Fetch news function
  const fetchNews = async () => {
    try {
      setNewsLoading(true);
      const articles = await newsService.getLatestNews(5);
      setNewsArticles(articles);
    } catch (error) {
      console.error('Error fetching news:', error);
      setNewsArticles([]);
    } finally {
      setNewsLoading(false);
    }
  };

  // Fetch news on component mount
  useEffect(() => {
    fetchNews();
  }, []);

  // Get position gradient
  const getPositionGradient = (position) => {
    const positionGradients = {
      'QB': gradients.violet,
      'RB': gradients.skyBlue,
      'WR': gradients.orange,
      'TE': gradients.lime,
      'OL': gradients.slate,
      'OT': gradients.slate,
      'C': gradients.slate,
      'DL': gradients.crimson,
      'DT': gradients.crimson,
      'DE': gradients.crimson,
      'EDGE': gradients.crimson,
      'LB': gradients.amber,
      'OLB': gradients.amber,
      'CB': gradients.navy,
      'S': gradients.navy,
      'K': gradients.cyan,
      'P': gradients.cyan,
      'DI': gradients.crimson
    };
    return positionGradients[position] || gradients.slate;
  };

  // Get category gradient and icon
  const getCategoryStyle = (category) => {
    const categoryStyles = {
      'Elite': { gradient: gradients.gold, icon: 'fa-crown', shadowColor: 'rgba(250, 204, 21, 0.3)' },
      'Star': { gradient: gradients.silver, icon: 'fa-star', shadowColor: 'rgba(148, 163, 184, 0.3)' },
      'Impact': { gradient: gradients.bronze, icon: 'fa-bolt', shadowColor: 'rgba(180, 83, 9, 0.3)' },
      'Solid': { gradient: gradients.blue, icon: 'fa-shield-alt', shadowColor: 'rgba(59, 130, 246, 0.3)' },
      'Freshmen': { gradient: gradients.emerald, icon: 'fa-seedling', shadowColor: 'rgba(16, 185, 129, 0.3)' }
    };
    return categoryStyles[category] || { gradient: gradients.blue, icon: 'fa-users', shadowColor: 'rgba(59, 130, 246, 0.3)' };
  };

  // Get star rating based on rank
  const getStarRating = (rank) => {
    if (rank <= 5) return 5;
    if (rank <= 15) return 4.5;
    if (rank <= 25) return 4;
    if (rank <= 40) return 3.5;
    if (rank <= 60) return 3;
    if (rank <= 80) return 2.5;
    return 2;
  };

  // Player data with team logos
  const getTeamLogo = (team) => {
    const teamLogoMap = {
      'Ohio State': '/team_logos/Ohio_State.png',
      'South Carolina': '/team_logos/South_Carolina.png',
      'Notre Dame': '/team_logos/Notre_Dame.png',
      'LSU': '/team_logos/LSU.png',
      'Clemson': '/team_logos/Clemson.png',
      'Texas': '/team_logos/Texas.png',
      'Alabama': '/team_logos/Alabama.png',
      'Penn State': '/team_logos/Penn_State.png',
      'Arizona State': '/team_logos/Arizona_State.png',
      'Oklahoma': '/team_logos/Oklahoma.png',
      'Oregon': '/team_logos/Oregon.png',
      'Louisville': '/team_logos/Louisville.png',
      'Washington': '/team_logos/Washington.png',
      'Miami': '/team_logos/Miami.png',
      'Indiana': '/team_logos/Indiana.png',
      'Minnesota': '/team_logos/Minnesota.png',
      'Utah': '/team_logos/Utah.png',
      'Florida': '/team_logos/Florida.png',
      'Ole Miss': '/team_logos/Ole_Miss.png',
      'Illinois': '/team_logos/Illinois.png',
      'Tennessee': '/team_logos/Tennessee.png',
      'Pittsburgh': '/team_logos/Pittsburgh.png',
      'Auburn': '/team_logos/Auburn.png',
      'Georgia': '/team_logos/Georgia.png',
      'Duke': '/team_logos/Duke.png',
      'San Diego State': '/team_logos/San_Diego_State.png',
      'Vanderbilt': '/team_logos/Vanderbilt.png',
      'Navy': '/team_logos/Navy.png',
      'Iowa State': '/team_logos/Iowa_State.png',
      'Wisconsin': '/team_logos/Wisconsin.png',
      'Mississippi State': '/team_logos/Mississippi_State.png',
      'Georgia Tech': '/team_logos/Georgia_Tech.png',
      'Colorado': '/team_logos/Colorado.png',
      'SMU': '/team_logos/SMU.png',
      'Baylor': '/team_logos/Baylor.png',
      'TCU': '/team_logos/TCU.png',
      'Michigan': '/team_logos/Michigan.png',
      'Kansas State': '/team_logos/Kansas_State.png',
      'Missouri': '/team_logos/Missouri.png',
      'Houston': '/team_logos/Houston.png',
      'Wake Forest': '/team_logos/Wake_Forest.png',
      'Kentucky': '/team_logos/Kentucky.png',
      'Texas Tech': '/team_logos/Texas_Tech.png',
      'BYU': '/team_logos/BYU.png',
      'Iowa': '/team_logos/Iowa.png',
      'Arkansas': '/team_logos/Arkansas.png',
      'USC': '/team_logos/USC.png',
      'Memphis': '/team_logos/Memphis.png',
      'Maryland': '/team_logos/Maryland.png'
    };
    return teamLogoMap[team] || '/photos/ncaaf.png';
  };

  // Complete player data
  const allPlayers = [
    // TOP 25 ELITE TIER
    {
      rank: 1,
      name: "Jeremiah Smith",
      position: "WR",
      team: "Ohio State",
      year: "Sophomore",
      stats: "1,315 yards, 76 receptions, 15 TDs as true freshman",
      whySpecial: "Led nation in 50+ yard plays, clutch performer in title run, physically imposing at 6-3/215",
      outlook2025: "Unanimous #1 player, Heisman contender, potential record-breaking season",
      category: "Elite"
    },
    {
      rank: 2,
      name: "Caleb Downs",
      position: "S",
      team: "Ohio State",
      year: "Sophomore",
      stats: "81 tackles, 7.5 TFL, 2 INTs, 6 PBUs, 79-yard punt return TD",
      whySpecial: "Elite instincts, allowed just 6 first downs in 16 games, top transfer pickup",
      outlook2025: "Defensive Player of the Year candidate, potential Heisman dark horse",
      category: "Elite"
    },
    {
      rank: 3,
      name: "Dylan Stewart",
      position: "EDGE",
      team: "South Carolina",
      year: "Sophomore",
      stats: "34 hurries, 6.5 sacks, 9.5 TFLs as a true freshman",
      whySpecial: "Prototype NFL edge at 6-6, compared to Jadeveon Clowney",
      outlook2025: "Top-5 2027 draft pick potential, elite pass rusher",
      category: "Elite"
    },
    {
      rank: 4,
      name: "Jeremiyah Love",
      position: "RB",
      team: "Notre Dame",
      year: "Sophomore",
      stats: "1,125 rushing yards, 17 TDs, 7.0 YPC, 28 receptions",
      whySpecial: "98-yard CFP TD run, elite hurdler, big-play threat",
      outlook2025: "Top RB in nation, key to Notre Dame's championship hopes",
      category: "Elite"
    },
    {
      rank: 5,
      name: "Garrett Nussmeier",
      position: "QB",
      team: "LSU",
      year: "Junior",
      stats: "3,700+ passing yards, 26 TDs, gunslinger mentality",
      whySpecial: "Potential top-2 NFL draft pick, elite arm strength",
      outlook2025: "Heisman contender if turnovers decrease",
      category: "Elite"
    },
    {
      rank: 6,
      name: "Cade Klubnik",
      position: "QB",
      team: "Clemson",
      year: "Junior",
      stats: "64% completion, 3,300+ yards, 33 passing TDs, 450+ rushing yards",
      whySpecial: "Massive improvement from 2023, clutch performer",
      outlook2025: "Dark horse Heisman candidate, CFP leader",
      category: "Elite"
    },
    {
      rank: 7,
      name: "LaNorris Sellers",
      position: "QB",
      team: "South Carolina",
      year: "Sophomore",
      stats: "2,274 passing yards, 17 TDs, 655 rushing yards, 7 rushing TDs",
      whySpecial: "Elite dual-threat, top-tier athleticism",
      outlook2025: "Breakout star, potential Heisman dark horse",
      category: "Elite"
    },
    {
      rank: 8,
      name: "Anthony Hill Jr.",
      position: "LB",
      team: "Texas",
      year: "Sophomore",
      stats: "113 tackles, 16.5 TFL (led SEC), 8 sacks, 4 FF",
      whySpecial: "Versatile playmaker, elite instincts",
      outlook2025: "Butkus Award favorite, All-American lock",
      category: "Elite"
    },
    {
      rank: 9,
      name: "T.J. Parker",
      position: "EDGE",
      team: "Clemson",
      year: "Junior",
      stats: "30 hurries, 11 sacks, 19.5 TFL, 6 FF",
      whySpecial: "Led all returners in TFL, high motor",
      outlook2025: "Top pass rusher, potential top-10 draft pick",
      category: "Elite"
    },
    {
      rank: 10,
      name: "Peter Woods",
      position: "DT",
      team: "Clemson",
      year: "Sophomore",
      stats: "3 sacks, 14 hurries, played out of position",
      whySpecial: "Elite interior presence, quick first step",
      outlook2025: "Dominant force back at natural position",
      category: "Elite"
    },
    {
      rank: 11,
      name: "Ryan Williams",
      position: "WR",
      team: "Alabama",
      year: "Sophomore",
      stats: "865 yards, 48 receptions, 8 TDs as 17-year-old freshman",
      whySpecial: "Elite speed, defining plays vs. Georgia",
      outlook2025: "Primary target, explosive playmaker",
      category: "Elite"
    },
    {
      rank: 12,
      name: "Drew Allar",
      position: "QB",
      team: "Penn State",
      year: "Junior",
      stats: "66.5% completion, 3,327 yards, 24 TDs, 8 INTs",
      whySpecial: "Strong arm, CFP experience",
      outlook2025: "Big Ten title contender quarterback",
      category: "Elite"
    },
    {
      rank: 13,
      name: "Sam Leavitt",
      position: "QB",
      team: "Arizona State",
      year: "Sophomore",
      stats: "62% completion, 24 TDs, 6 INTs, 443 rushing yards",
      whySpecial: "Led Big 12 title run, dual-threat",
      outlook2025: "Heisman dark horse without Cam Skattebo",
      category: "Elite"
    },
    {
      rank: 14,
      name: "Dani Dennis-Sutton",
      position: "EDGE",
      team: "Penn State",
      year: "Junior",
      stats: "8.5 sacks, 13 TFL, 2 FF, 1 INT",
      whySpecial: "Big-game performer, versatile",
      outlook2025: "Premier pass rusher without Abdul Carter",
      category: "Elite"
    },
    {
      rank: 15,
      name: "Nicholas Singleton",
      position: "RB",
      team: "Penn State",
      year: "Junior",
      stats: "1,099 rushing yards, 6.4 YPC, 12 TDs, 375 receiving yards",
      whySpecial: "Elite speed, receiving threat",
      outlook2025: "All-American candidate",
      category: "Elite"
    },
    {
      rank: 16,
      name: "John Mateer",
      position: "QB",
      team: "Oklahoma",
      year: "Junior",
      stats: "3,100+ passing yards, 29 TDs, 826 rushing yards, 15 rushing TDs",
      whySpecial: "Dual-threat wizard, transfer from Washington State",
      outlook2025: "SEC adjustment key to success",
      category: "Elite"
    },
    {
      rank: 17,
      name: "Arch Manning",
      position: "QB",
      team: "Texas",
      year: "Sophomore",
      stats: "Limited attempts (107), high upside",
      whySpecial: "Elite arm, mobility, famous name",
      outlook2025: "Massive expectations, Week 1 vs. Ohio State",
      category: "Elite"
    },
    {
      rank: 18,
      name: "Makhi Hughes",
      position: "RB",
      team: "Oregon",
      year: "Junior",
      stats: "1,400 yards, 15 TDs at Tulane",
      whySpecial: "Elite contact balance, transfer addition",
      outlook2025: "Ducks' primary weapon",
      category: "Elite"
    },
    {
      rank: 19,
      name: "Isaac Brown",
      position: "RB",
      team: "Louisville",
      year: "Sophomore",
      stats: "1,173 yards, 7.1 YPC, 11 TDs as freshman",
      whySpecial: "Big-play threat, elusive",
      outlook2025: "ACC Player of the Year candidate",
      category: "Elite"
    },
    {
      rank: 20,
      name: "Jonah Coleman",
      position: "RB",
      team: "Washington",
      year: "Junior",
      stats: "1,053 yards, 10 TDs, never under 5.0 YPC",
      whySpecial: "Power runner, contact balance",
      outlook2025: "Consistent producer",
      category: "Elite"
    },
    {
      rank: 21,
      name: "Jordyn Tyson",
      position: "WR",
      team: "Arizona State",
      year: "Junior",
      stats: "1,098 yards, 75 receptions, 10 TDs",
      whySpecial: "Elite route runner, chemistry with Leavitt",
      outlook2025: "Top WR in Big 12",
      category: "Elite"
    },
    {
      rank: 22,
      name: "Carson Beck",
      position: "QB",
      team: "Miami",
      year: "Senior",
      stats: "3,498 yards, 28 TDs, 12 INTs at Georgia",
      whySpecial: "Strong arm, fresh start",
      outlook2025: "Redemption season in Miami",
      category: "Elite"
    },
    {
      rank: 23,
      name: "Mikail Kamara",
      position: "EDGE",
      team: "Indiana",
      year: "Senior",
      stats: "10 sacks, 42 hurries, 15 TFL",
      whySpecial: "Relentless pass rusher",
      outlook2025: "Big Ten sack leader",
      category: "Elite"
    },
    {
      rank: 24,
      name: "Elijah Sarratt",
      position: "WR",
      team: "Indiana",
      year: "Senior",
      stats: "957 yards, 18+ YPC, 8 TDs",
      whySpecial: "Deep threat, consistent producer",
      outlook2025: "Primary target for new QB",
      category: "Elite"
    },
    {
      rank: 25,
      name: "Koi Perich",
      position: "S",
      team: "Minnesota",
      year: "Sophomore",
      stats: "5 INTs, 88.9 PFF grade as freshman",
      whySpecial: "Ball hawk, will play offense too",
      outlook2025: "Breakout star candidate",
      category: "Elite"
    },
    // PLAYERS 26-50: STAR LEVEL
    {
      rank: 26,
      name: "Spencer Fano",
      position: "OT",
      team: "Utah",
      year: "Senior",
      stats: "Elite run blocker, 93.0 PFF grade",
      whySpecial: "Dominant in run game",
      outlook2025: "All-American candidate",
      category: "Star"
    },
    {
      rank: 27,
      name: "Leonard Moore",
      position: "CB",
      team: "Notre Dame",
      year: "Sophomore",
      stats: "Lockdown corner, 2 INTs as freshman",
      whySpecial: "Elite coverage skills",
      outlook2025: "Shutdown corner",
      category: "Star"
    },
    {
      rank: 28,
      name: "Caleb Banks",
      position: "DT",
      team: "Florida",
      year: "Junior",
      stats: "7 sacks, 22 hurries, interior force",
      whySpecial: "Disruptive interior presence",
      outlook2025: "SEC's best DT",
      category: "Star"
    },
    {
      rank: 29,
      name: "Francis Mauigoa",
      position: "OT",
      team: "Miami",
      year: "Sophomore",
      stats: "Dominant run blocker, former five-star",
      whySpecial: "Elite athleticism",
      outlook2025: "First-round talent",
      category: "Star"
    },
    {
      rank: 30,
      name: "Suntarine Perkins",
      position: "EDGE",
      team: "Ole Miss",
      year: "Senior",
      stats: "10.5 sacks, 14 TFL, versatile",
      whySpecial: "Complete edge defender",
      outlook2025: "SEC sack leader",
      category: "Star"
    },
    {
      rank: 31,
      name: "Sonny Styles",
      position: "LB",
      team: "Ohio State",
      year: "Junior",
      stats: "6 sacks, 11 hurries, prototypical modern LB",
      whySpecial: "Versatile defender",
      outlook2025: "All-American potential",
      category: "Star"
    },
    {
      rank: 32,
      name: "Gabe Jacas",
      position: "OLB",
      team: "Illinois",
      year: "Senior",
      stats: "8 sacks, 30 hurries, 13 TFL",
      whySpecial: "Consistent pass rusher",
      outlook2025: "Big Ten defensive star",
      category: "Star"
    },
    {
      rank: 33,
      name: "Max Klare",
      position: "TE",
      team: "Ohio State",
      year: "Senior",
      stats: "685 yards, 51 receptions, Purdue transfer",
      whySpecial: "Reliable target",
      outlook2025: "Elite TE in new system",
      category: "Star"
    },
    {
      rank: 34,
      name: "Jermod McCoy",
      position: "CB",
      team: "Tennessee",
      year: "Junior",
      stats: "4 INTs, 13 PBUs, physical press corner",
      whySpecial: "Lockdown coverage",
      outlook2025: "All-SEC performer",
      category: "Star"
    },
    {
      rank: 35,
      name: "Colin Simmons",
      position: "EDGE",
      team: "Texas",
      year: "Sophomore",
      stats: "9 sacks as freshman, explosive first step",
      whySpecial: "Elite pass rusher",
      outlook2025: "Double-digit sacks",
      category: "Star"
    },
    {
      rank: 36,
      name: "Matayo Uiagalelei",
      position: "EDGE",
      team: "Oregon",
      year: "Sophomore",
      stats: "10.5 sacks, 13 TFL, refined pass rusher",
      whySpecial: "Technical excellence",
      outlook2025: "Pac-12 defensive star",
      category: "Star"
    },
    {
      rank: 37,
      name: "Kyle Louis",
      position: "LB",
      team: "Pittsburgh",
      year: "Senior",
      stats: "101 tackles, 7 sacks, 4 INTs",
      whySpecial: "Complete linebacker",
      outlook2025: "ACC Defensive POY",
      category: "Star"
    },
    {
      rank: 38,
      name: "Keldric Faulk",
      position: "EDGE",
      team: "Auburn",
      year: "Junior",
      stats: "7 sacks, 35 hurries, relentless",
      whySpecial: "High motor",
      outlook2025: "Breakout candidate",
      category: "Star"
    },
    {
      rank: 39,
      name: "Michael Taaffe",
      position: "S",
      team: "Texas",
      year: "Senior",
      stats: "78 tackles, 2 INTs, former walk-on star",
      whySpecial: "Instinctive playmaker",
      outlook2025: "Team leader",
      category: "Star"
    },
    {
      rank: 40,
      name: "Christen Miller",
      position: "DT",
      team: "Georgia",
      year: "Junior",
      stats: "Next in UGA pipeline, explosive",
      whySpecial: "Elite talent",
      outlook2025: "All-SEC performer",
      category: "Star"
    },
    {
      rank: 41,
      name: "Kadyn Proctor",
      position: "OT",
      team: "Alabama",
      year: "Sophomore",
      stats: "Massive improvement, top-10 draft potential",
      whySpecial: "Elite pass protector",
      outlook2025: "All-American",
      category: "Star"
    },
    {
      rank: 42,
      name: "Darian Mensah",
      position: "QB",
      team: "Duke",
      year: "Sophomore",
      stats: "2,700+ yards at Tulane, highest passer rating",
      whySpecial: "Efficient passer",
      outlook2025: "ACC contender",
      category: "Star"
    },
    {
      rank: 43,
      name: "Avieon Terrell",
      position: "CB",
      team: "Clemson",
      year: "Sophomore",
      stats: "2 INTs, 14 PBUs, brother of AJ Terrell",
      whySpecial: "Elite bloodline",
      outlook2025: "Lockdown corner",
      category: "Star"
    },
    {
      rank: 44,
      name: "KJ Bolden",
      position: "S",
      team: "Georgia",
      year: "Sophomore",
      stats: "Elite freshman, 59 tackles, 1 INT",
      whySpecial: "Instinctive defender",
      outlook2025: "All-SEC safety",
      category: "Star"
    },
    {
      rank: 45,
      name: "Whit Weeks",
      position: "LB",
      team: "LSU",
      year: "Senior",
      stats: "119 tackles, 3.5 sacks, team leader",
      whySpecial: "Defensive quarterback",
      outlook2025: "All-American",
      category: "Star"
    },
    {
      rank: 46,
      name: "Tyreak Sapp",
      position: "EDGE",
      team: "Florida",
      year: "Senior",
      stats: "7 sacks, 14 hurries, versatile",
      whySpecial: "Multiple positions",
      outlook2025: "Draft riser",
      category: "Star"
    },
    {
      rank: 47,
      name: "Darius Taylor",
      position: "RB",
      team: "Minnesota",
      year: "Sophomore",
      stats: "Nearly 1,000 yards, 10 TDs, 5 100+ games",
      whySpecial: "Workhorse back",
      outlook2025: "Big Ten star",
      category: "Star"
    },
    {
      rank: 48,
      name: "Trey White",
      position: "EDGE",
      team: "San Diego State",
      year: "Senior",
      stats: "12.5 sacks, 19.5 TFL, Group of Five star",
      whySpecial: "Dominant pass rusher",
      outlook2025: "G5 defensive POY",
      category: "Star"
    },
    {
      rank: 49,
      name: "Rueben Bain Jr.",
      position: "DL",
      team: "Miami",
      year: "Sophomore",
      stats: "3.5 sacks despite injury, high upside",
      whySpecial: "Elite potential",
      outlook2025: "Breakout season",
      category: "Star"
    },
    {
      rank: 50,
      name: "Eli Stowers",
      position: "TE",
      team: "Vanderbilt",
      year: "Senior",
      stats: "638 yards, 5 TDs, former QB",
      whySpecial: "Unique athleticism",
      outlook2025: "SEC's best TE",
      category: "Star"
    },
    // PLAYERS 51-75: IMPACT LEVEL
    {
      rank: 51,
      name: "Diego Pavia",
      position: "QB",
      team: "Vanderbilt",
      year: "Senior",
      stats: "Gritty leader, makes program relevant",
      whySpecial: "Winner",
      outlook2025: "Bowl game leader",
      category: "Impact"
    },
    {
      rank: 52,
      name: "Dillon Thieneman",
      position: "S",
      team: "Oregon",
      year: "Junior",
      stats: "Elite range, Purdue transfer",
      whySpecial: "Ball hawk",
      outlook2025: "All-Pac-12",
      category: "Impact"
    },
    {
      rank: 53,
      name: "Chandler Rivers",
      position: "CB",
      team: "Duke",
      year: "Senior",
      stats: "90.7 PFF grade, versatile",
      whySpecial: "Shutdown corner",
      outlook2025: "ACC's best CB",
      category: "Impact"
    },
    {
      rank: 54,
      name: "Zane Durant",
      position: "DI",
      team: "Penn State",
      year: "Junior",
      stats: "14 TFL, disruptive interior",
      whySpecial: "Run stopper",
      outlook2025: "All-Big Ten",
      category: "Impact"
    },
    {
      rank: 55,
      name: "Cam Coleman",
      position: "WR",
      team: "Auburn",
      year: "Sophomore",
      stats: "598 yards, 8 TDs, 16.2 YPC as freshman",
      whySpecial: "Deep threat",
      outlook2025: "1,000-yard receiver",
      category: "Impact"
    },
    {
      rank: 56,
      name: "Eli Heidenreich",
      position: "RB",
      team: "Navy",
      year: "Senior",
      stats: "6'0\"/201 lbs, rare athleticism",
      whySpecial: "Triple-option star",
      outlook2025: "Service academy standout",
      category: "Impact"
    },
    {
      rank: 57,
      name: "Rocco Becht",
      position: "QB",
      team: "Iowa State",
      year: "Junior",
      stats: "3,500+ yards, 25 TDs, pure passer",
      whySpecial: "Accurate arm",
      outlook2025: "Big 12 contender",
      category: "Impact"
    },
    {
      rank: 58,
      name: "Blake Horvath",
      position: "QB",
      team: "Navy",
      year: "Senior",
      stats: "1,254 rushing yards, 7.1 YPC",
      whySpecial: "Dual-threat option QB",
      outlook2025: "Service academy leader",
      category: "Impact"
    },
    {
      rank: 59,
      name: "Jake Slaughter",
      position: "C",
      team: "Florida",
      year: "Senior",
      stats: "Only one sack allowed, elite run blocker",
      whySpecial: "Anchor of OL",
      outlook2025: "All-SEC center",
      category: "Impact"
    },
    {
      rank: 60,
      name: "Nico Iamaleava",
      position: "QB",
      team: "Tennessee",
      year: "Sophomore",
      stats: "6'6\", cannon arm, huge upside",
      whySpecial: "Elite tools",
      outlook2025: "Breakout candidate",
      category: "Impact"
    },
    {
      rank: 61,
      name: "Sammy Brown",
      position: "LB",
      team: "Clemson",
      year: "Sophomore",
      stats: "80 tackles, 12 TFL as freshman",
      whySpecial: "Instinctive linebacker",
      outlook2025: "ACC star",
      category: "Impact"
    },
    {
      rank: 62,
      name: "Tanner Koziol",
      position: "TE",
      team: "Wisconsin",
      year: "Senior",
      stats: "839 yards, 8 TDs, elite production",
      whySpecial: "Reliable target",
      outlook2025: "Big Ten's best TE",
      category: "Impact"
    },
    {
      rank: 63,
      name: "Fluff Bothwell",
      position: "RB",
      team: "Mississippi State",
      year: "Junior",
      stats: "1,000 yards, 7.5 YPC transfer",
      whySpecial: "Home run hitter",
      outlook2025: "SEC breakout",
      category: "Impact"
    },
    {
      rank: 64,
      name: "Eric Rivers",
      position: "WR",
      team: "Georgia Tech",
      year: "Senior",
      stats: "97.7 yards/game, 12 TDs",
      whySpecial: "Consistent producer",
      outlook2025: "ACC receiving leader",
      category: "Impact"
    },
    {
      rank: 65,
      name: "Malik Muhammad",
      position: "CB",
      team: "Texas",
      year: "Sophomore",
      stats: "8 PBUs, lockdown potential",
      whySpecial: "Elite coverage",
      outlook2025: "All-Big 12",
      category: "Impact"
    },
    {
      rank: 66,
      name: "Caden Durham",
      position: "RB",
      team: "LSU",
      year: "Sophomore",
      stats: "Elite speed, top-10 2024 recruit",
      whySpecial: "Game-breaker",
      outlook2025: "Feature back",
      category: "Impact"
    },
    {
      rank: 67,
      name: "Jordan Seaton",
      position: "OT",
      team: "Colorado",
      year: "Sophomore",
      stats: "Freshman All-American, athletic",
      whySpecial: "Elite pass protector",
      outlook2025: "All-conference",
      category: "Impact"
    },
    {
      rank: 68,
      name: "Kevin Jennings",
      position: "QB",
      team: "SMU",
      year: "Junior",
      stats: "3,005 yards, 22 TDs, dual-threat",
      whySpecial: "Playmaker",
      outlook2025: "AAC star",
      category: "Impact"
    },
    {
      rank: 69,
      name: "Desmond Reid",
      position: "RB",
      team: "Pittsburgh",
      year: "Junior",
      stats: "All-purpose threat, multiple 100+ games",
      whySpecial: "Versatile weapon",
      outlook2025: "ACC standout",
      category: "Impact"
    },
    {
      rank: 70,
      name: "Domani Jackson",
      position: "CB",
      team: "Alabama",
      year: "Junior",
      stats: "2 INTs, 9 PBUs, elite recruit",
      whySpecial: "Lockdown potential",
      outlook2025: "All-SEC corner",
      category: "Impact"
    },
    {
      rank: 71,
      name: "Nate Frazier",
      position: "RB",
      team: "Georgia",
      year: "Sophomore",
      stats: "671 yards, 8 TDs, 5.0 YPC",
      whySpecial: "Next in UGA line",
      outlook2025: "Feature back",
      category: "Impact"
    },
    {
      rank: 72,
      name: "Kaytron Allen",
      position: "RB",
      team: "Penn State",
      year: "Junior",
      stats: "1,108 yards, 8 TDs, part of elite duo",
      whySpecial: "Power runner",
      outlook2025: "1,000-yard rusher",
      category: "Impact"
    },
    {
      rank: 73,
      name: "Aiden Fisher",
      position: "LB",
      team: "Indiana",
      year: "Senior",
      stats: "100+ tackles, consistent producer",
      whySpecial: "Tackling machine",
      outlook2025: "Team leader",
      category: "Impact"
    },
    {
      rank: 74,
      name: "Jordan White",
      position: "OL",
      team: "Vanderbilt",
      year: "Senior",
      stats: "Elite interior lineman, former Liberty star",
      whySpecial: "Road grader",
      outlook2025: "All-SEC guard",
      category: "Impact"
    },
    {
      rank: 75,
      name: "Jaden Greathouse",
      position: "WR",
      team: "Notre Dame",
      year: "Junior",
      stats: "Talented, underutilized in 2024",
      whySpecial: "Breakout potential",
      outlook2025: "1,000-yard threat",
      category: "Impact"
    },
    // PLAYERS 76-100: SOLID CONTRIBUTORS
    {
      rank: 76,
      name: "Carnell Tate",
      position: "WR",
      team: "Ohio State",
      year: "Junior",
      stats: "52 receptions, 700+ yards",
      whySpecial: "Reliable target",
      outlook2025: "Key contributor",
      category: "Solid"
    },
    {
      rank: 77,
      name: "Aaron Anderson",
      position: "WR",
      team: "LSU",
      year: "Junior",
      stats: "61 catches, 884 yards, 5 TDs",
      whySpecial: "Slot receiver",
      outlook2025: "Consistent producer",
      category: "Solid"
    },
    {
      rank: 78,
      name: "Bryson Washington",
      position: "RB",
      team: "Baylor",
      year: "Sophomore",
      stats: "1,000 yards, 12 TDs as freshman",
      whySpecial: "Workhorse back",
      outlook2025: "Big 12 star",
      category: "Solid"
    },
    {
      rank: 79,
      name: "Evan Stewart",
      position: "WR",
      team: "Oregon",
      year: "Junior",
      stats: "48 catches, 600+ yards, 5 TDs",
      whySpecial: "Deep threat",
      outlook2025: "Big-play receiver",
      category: "Solid"
    },
    {
      rank: 80,
      name: "Taylen Green",
      position: "QB",
      team: "Arkansas",
      year: "Junior",
      stats: "3,154 pass yards, 600+ rushing",
      whySpecial: "Dual-threat QB",
      outlook2025: "SEC producer",
      category: "Solid"
    },
    {
      rank: 81,
      name: "Josh Hoover",
      position: "QB",
      team: "TCU",
      year: "Junior",
      stats: "Nearly 3,700 yards, 23 TDs",
      whySpecial: "Pocket passer",
      outlook2025: "Big 12 starter",
      category: "Solid"
    },
    {
      rank: 82,
      name: "Haynes King",
      position: "QB",
      team: "Georgia Tech",
      year: "Senior",
      stats: "72% completion, 11 TDs, 1 INT",
      whySpecial: "Efficient leader",
      outlook2025: "ACC contender",
      category: "Solid"
    },
    {
      rank: 83,
      name: "DJ Lagway",
      position: "QB",
      team: "Florida",
      year: "Sophomore",
      stats: "1,610 yards, 11 TDs, high upside",
      whySpecial: "Elite arm talent",
      outlook2025: "Breakout candidate",
      category: "Solid"
    },
    {
      rank: 84,
      name: "Dillon Bell",
      position: "WR",
      team: "Georgia",
      year: "Junior",
      stats: "37 catches, 433 yards, reliable",
      whySpecial: "Possession receiver",
      outlook2025: "Role player",
      category: "Solid"
    },
    {
      rank: 85,
      name: "Ryan Wingo",
      position: "WR",
      team: "Texas",
      year: "Sophomore",
      stats: "572 yards as freshman, big-play potential",
      whySpecial: "Speed threat",
      outlook2025: "Breakout season",
      category: "Solid"
    },
    {
      rank: 86,
      name: "Jaishawn Barham",
      position: "LB",
      team: "Michigan",
      year: "Junior",
      stats: "66 tackles, 2 sacks, 14 hurries",
      whySpecial: "Steady defender",
      outlook2025: "Team leader",
      category: "Solid"
    },
    {
      rank: 87,
      name: "Austin Romaine",
      position: "LB",
      team: "Kansas State",
      year: "Senior",
      stats: "96 tackles, 2 sacks, 7.5 TFL",
      whySpecial: "Tackling machine",
      outlook2025: "Big 12 leader",
      category: "Solid"
    },
    {
      rank: 88,
      name: "Kevin Coleman Jr.",
      position: "WR",
      team: "Missouri",
      year: "Junior",
      stats: "74 catches, nearly 1,000 yards",
      whySpecial: "Slot specialist",
      outlook2025: "SEC producer",
      category: "Solid"
    },
    {
      rank: 89,
      name: "CJ Allen",
      position: "LB",
      team: "Georgia",
      year: "Sophomore",
      stats: "76 tackles, 1 INT as freshman",
      whySpecial: "Future star",
      outlook2025: "Starting role",
      category: "Solid"
    },
    {
      rank: 90,
      name: "Jeremiah Wilson",
      position: "CB",
      team: "Houston",
      year: "Senior",
      stats: "5 INTs, 8 PBUs, aggressive",
      whySpecial: "Ball hawk",
      outlook2025: "AAC standout",
      category: "Solid"
    },
    {
      rank: 91,
      name: "Demond Claiborne",
      position: "RB",
      team: "Wake Forest",
      year: "Junior",
      stats: "1,049 yards, 11 TDs",
      whySpecial: "Consistent runner",
      outlook2025: "ACC producer",
      category: "Solid"
    },
    {
      rank: 92,
      name: "Trevin Wallace",
      position: "LB",
      team: "Kentucky",
      year: "Senior",
      stats: "Consistent producer, team leader",
      whySpecial: "Defensive anchor",
      outlook2025: "SEC contributor",
      category: "Solid"
    },
    {
      rank: 93,
      name: "Caleb Douglas",
      position: "WR",
      team: "Texas Tech",
      year: "Junior",
      stats: "14.6 YPC, 6 TDs, deep threat",
      whySpecial: "Vertical threat",
      outlook2025: "Big 12 receiver",
      category: "Solid"
    },
    {
      rank: 94,
      name: "David Gusta",
      position: "DT",
      team: "Kentucky",
      year: "Senior",
      stats: "28 hurries, Washington State transfer",
      whySpecial: "Interior pressure",
      outlook2025: "SEC contributor",
      category: "Solid"
    },
    {
      rank: 95,
      name: "Jake Retzlaff",
      position: "QB",
      team: "BYU",
      year: "Senior",
      stats: "2,800 yards, 20 TDs, 388 rushing",
      whySpecial: "Dual-threat leader",
      outlook2025: "Big 12 starter",
      category: "Solid"
    },
    {
      rank: 96,
      name: "Dominic Zvada",
      position: "K",
      team: "Michigan",
      year: "Junior",
      stats: "95.5% FG percentage, perfect from 50+",
      whySpecial: "Elite accuracy",
      outlook2025: "All-American kicker",
      category: "Solid"
    },
    {
      rank: 97,
      name: "Rhys Dakin",
      position: "P",
      team: "Iowa",
      year: "Senior",
      stats: "44.1 yard average, over half inside 20",
      whySpecial: "Field position weapon",
      outlook2025: "Big Ten's best punter",
      category: "Solid"
    },
    {
      rank: 98,
      name: "Anthony Smith",
      position: "DL",
      team: "Minnesota",
      year: "Senior",
      stats: "Versatile, can play edge or DT",
      whySpecial: "Position flexibility",
      outlook2025: "Defensive contributor",
      category: "Solid"
    },
    {
      rank: 99,
      name: "Domonique Orange",
      position: "DT",
      team: "Iowa State",
      year: "Senior",
      stats: "Quick hands, underrated",
      whySpecial: "Run stopper",
      outlook2025: "Big 12 contributor",
      category: "Solid"
    },
    {
      rank: 100,
      name: "Sam Leavitt",
      position: "QB",
      team: "Arizona State",
      year: "Sophomore",
      stats: "Dual-threat, Big 12 champion",
      whySpecial: "Winner",
      outlook2025: "Conference contender",
      category: "Solid"
    }
  ];

  // Incoming freshmen data
  const incomingFreshmen = [
    {
      rank: 1,
      name: "Bryce Underwood",
      position: "QB",
      team: "Michigan",
      ranking: "#1 overall recruit",
      profile: "6-4, 208 lbs, Michigan native",
      impact: "Presumed starter, $10-12M NIL deal",
      potential: "Franchise quarterback, Heisman candidate"
    },
    {
      rank: 2,
      name: "Gideon Davidson",
      position: "RB",
      team: "Clemson",
      ranking: "#69 overall, #3 RB",
      profile: "5-11, 185 lbs, 8,000+ HS yards",
      impact: "Clear path to starting role",
      potential: "Immediate star, ACC impact"
    },
    {
      rank: 3,
      name: "David Sanders Jr.",
      position: "OT",
      team: "Tennessee",
      ranking: "#6 overall, #2 OT",
      profile: "6-6, 290 lbs, highest-paid recruit",
      impact: "Day 1 starter potential",
      potential: "Elite blindside protector"
    },
    {
      rank: 4,
      name: "Dakorien Moore",
      position: "WR",
      team: "Oregon",
      ranking: "#4 overall, #1 WR",
      profile: "5-11, 182 lbs, elite speed",
      impact: "Primary target with departures",
      potential: "Offensive Rookie of the Year"
    },
    {
      rank: 5,
      name: "Devin Sanchez",
      position: "CB",
      team: "Ohio State",
      ranking: "#8 overall, #1 CB",
      profile: "6-2, 185 lbs, Houston native",
      impact: "Immediate starter opposite",
      potential: "Lockdown corner, first-round talent"
    },
    {
      rank: 6,
      name: "Andrew Babalola",
      position: "OT",
      team: "Michigan",
      ranking: "#16 overall, #3 OT",
      profile: "6-6, 300 lbs, athletic mover",
      impact: "Offensive line help needed",
      potential: "Elite pass protector"
    },
    {
      rank: 7,
      name: "Jahkeem Stewart",
      position: "DE",
      team: "USC",
      ranking: "#34 overall, #5 DL",
      profile: "6-5, 290 lbs, reclassified from 2026",
      impact: "Defensive line rotation",
      potential: "Immediate pass rush help"
    },
    {
      rank: 8,
      name: "Linkon Cure",
      position: "TE",
      team: "Kansas State",
      ranking: "#37 overall, #2 TE",
      profile: "6-5, 223 lbs, elite athleticism",
      impact: "Unique receiving threat",
      potential: "All-Big 12 candidate"
    },
    {
      rank: 9,
      name: "DJ Pickett",
      position: "CB",
      team: "LSU",
      ranking: "#11 overall, #2 CB",
      profile: "6-4, 190 lbs, rare size/speed",
      impact: "Secondary help needed",
      potential: "Stingley-level impact"
    },
    {
      rank: 10,
      name: "Kaliq Lockett",
      position: "WR",
      team: "Texas",
      ranking: "#18 overall, #2 WR",
      profile: "6-2, 187 lbs, explosive playmaker",
      impact: "Depth chart opportunity",
      potential: "Immediate contributor"
    },
    {
      rank: 11,
      name: "Elijah Griffin",
      position: "DL",
      team: "Georgia",
      ranking: "#3 overall, #1 DL",
      profile: "Elite talent",
      impact: "Rotation player",
      potential: "Future All-American"
    },
    {
      rank: 12,
      name: "Justus Terry",
      position: "DL",
      team: "Texas",
      ranking: "#13 overall",
      profile: "Interior help",
      impact: "Depth addition",
      potential: "SEC impact"
    },
    {
      rank: 13,
      name: "Michael Carroll",
      position: "OL",
      team: "Alabama",
      ranking: "#12 overall",
      profile: "Guard/center",
      impact: "Interior line help",
      potential: "Multi-year starter"
    },
    {
      rank: 14,
      name: "Michael Fasusi",
      position: "OL",
      team: "Oklahoma",
      ranking: "#8 overall",
      profile: "SEC line help",
      impact: "Competition for starting spot",
      potential: "All-conference talent"
    },
    {
      rank: 15,
      name: "Antwann Hill",
      position: "QB",
      team: "Memphis",
      ranking: "#145 overall",
      profile: "Starting opportunity",
      impact: "Immediate starter",
      potential: "AAC standout"
    },
    {
      rank: 16,
      name: "Harlem Berry",
      position: "RB",
      team: "Florida",
      ranking: "Elite speed",
      profile: "Depth chart opening",
      impact: "Change of pace back",
      potential: "Big-play threat"
    },
    {
      rank: 17,
      name: "Dallas Wilson",
      position: "WR",
      team: "Florida",
      ranking: "Deep threat",
      profile: "Lagway target",
      impact: "Immediate role",
      potential: "SEC contributor"
    },
    {
      rank: 18,
      name: "Malik Washington",
      position: "QB",
      team: "Maryland",
      ranking: "Dual-threat",
      profile: "Starting chance",
      impact: "QB competition",
      potential: "Big Ten impact"
    },
    {
      rank: 19,
      name: "Caleb Cunningham",
      position: "WR",
      team: "Ole Miss",
      ranking: "Route runner",
      profile: "Immediate role",
      impact: "Slot receiver",
      potential: "SEC producer"
    },
    {
      rank: 20,
      name: "Christopher Burgess Jr.",
      position: "EDGE",
      team: "Notre Dame",
      ranking: "Pass rush help",
      profile: "Elite athlete",
      impact: "Rotation player",
      potential: "Future star"
    }
  ];

  // Position groups for filtering
  const positions = ['All', 'QB', 'RB', 'WR', 'TE', 'OL', 'OT', 'C', 'DL', 'DT', 'EDGE', 'LB', 'OLB', 'CB', 'S', 'K', 'P'];

  // Filter players based on search and position
  const filteredPlayers = useMemo(() => {
    let filtered = selectedCategory === 'Freshmen' ? incomingFreshmen : 
                  selectedCategory === 'All' ? allPlayers :
                  selectedCategory === 'Top 25' ? allPlayers.filter(p => p.rank <= 25) :
                  selectedCategory === 'Star' ? allPlayers.filter(p => p.rank >= 26 && p.rank <= 50) :
                  selectedCategory === 'Impact' ? allPlayers.filter(p => p.rank >= 51 && p.rank <= 75) :
                  selectedCategory === 'Solid' ? allPlayers.filter(p => p.rank >= 76 && p.rank <= 100) :
                  allPlayers;

    if (searchText) {
      filtered = filtered.filter(player => 
        player.name.toLowerCase().includes(searchText.toLowerCase()) ||
        player.team.toLowerCase().includes(searchText.toLowerCase()) ||
        player.position.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedPosition !== 'All' && selectedCategory !== 'Freshmen') {
      filtered = filtered.filter(player => player.position === selectedPosition);
    }

    return filtered;
  }, [selectedCategory, selectedPosition, searchText]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowPositionFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Custom Tailwind CSS Styles */}
      <style jsx>{`
        .gradient-bg {
          background: linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c);
        }
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
      `}</style>

      <div style={{ width: '98%', margin: '0 auto' }} className="relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8 relative">
            {/* Liquid Glass Icon Container */}
            <div className="relative">
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl animate-pulse"></div>
              <div className="relative w-16 h-16 rounded-full bg-white/40 backdrop-blur-2xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center">
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/60 via-transparent to-transparent"></div>
                <i className="fas fa-users text-3xl relative z-10 drop-shadow-lg" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}></i>
              </div>
            </div>
          </div>
          
          <div className="relative mb-8">
            <h1 className="text-6xl md:text-7xl font-black mb-6 relative">
              <span className="drop-shadow-2xl" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Top 100 Returning</span>
              <br />
              <span className="drop-shadow-2xl" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Players 2025</span>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 rounded-full opacity-60 animate-pulse" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' }}></div>
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Powered by GamedayPlus's proprietary analytics engine, this comprehensive ranking combines advanced metrics, performance projections, and expert scouting reports to identify college football's most impactful returning talent for 2025. Our algorithm processes over 50 statistical categories, historical performance data, and situational analytics to deliver the most accurate player evaluations in the sport.
          </p>

          {/* Stats Badge */}
          <div className="inline-flex items-center space-x-4 px-8 py-4 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2),0_15px_35px_rgba(0,0,0,0.1)]">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' }}></div>
              <span className="text-lg font-bold" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{filteredPlayers.length} Players</span>
            </div>
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <span className="text-lg text-gray-700 font-medium">
              Deep Research Analysis
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="relative mb-8">
          <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
            <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              {/* View Mode Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-700">View Mode:</span>
                  <button
                    onClick={() => setViewMode('detailed')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      viewMode === 'detailed' 
                        ? 'text-white shadow-lg' 
                        : 'bg-white/30 text-gray-700 hover:bg-white/40'
                    }`}
                    style={viewMode === 'detailed' ? { background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' } : {}}
                  >
                    <i className="fas fa-th-large mr-2"></i>Detailed
                  </button>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      viewMode === 'compact' 
                        ? 'text-white shadow-lg' 
                        : 'bg-white/30 text-gray-700 hover:bg-white/40'
                    }`}
                    style={viewMode === 'compact' ? { background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' } : {}}
                  >
                    <i className="fas fa-list mr-2"></i>Compact
                  </button>
                </div>
              </div>

              {/* Category Pills with Icons - Wider for better spacing */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                {/* All Players Tab */}
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedPosition('All');
                  }}
                  className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-500 transform hover:scale-105 ${
                    selectedCategory === 'All'
                      ? 'text-white shadow-xl'
                      : 'text-gray-700 hover:text-white'
                  }`}
                >
                  {selectedCategory === 'All' && (
                    <div className="absolute inset-0 rounded-xl shadow-[0_4px_20px_rgba(204,0,28,0.3)]" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' }}></div>
                  )}
                  
                  {selectedCategory !== 'All' && (
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl hover:bg-white/30 transition-all duration-300"></div>
                  )}
                  
                  <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                  
                  <span className="relative z-10 flex items-center gap-2">
                    <i className="fas fa-users"></i>
                    All Players
                  </span>
                </button>

                {['Top 25', 'Star', 'Impact', 'Solid', 'Freshmen'].map(category => {
                  const categoryKey = category === 'Top 25' ? 'Elite' : category;
                  const style = getCategoryStyle(categoryKey);
                  
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedPosition('All');
                      }}
                      className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-500 transform hover:scale-105 ${
                        selectedCategory === category
                          ? 'text-white shadow-xl'
                          : 'text-gray-700 hover:text-white'
                      }`}
                    >
                      {selectedCategory === category && (
                        <div className="absolute inset-0 rounded-xl" style={{ background: style.gradient, boxShadow: `0 4px 20px ${style.shadowColor}` }}></div>
                      )}
                      
                      {selectedCategory !== category && (
                        <div className="absolute inset-0 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl hover:bg-white/30 transition-all duration-300"></div>
                      )}
                      
                      <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                      
                      <span className="relative z-10 flex items-center gap-2">
                        <i className={`fas ${style.icon}`}></i>
                        {category === 'Top 25' && 'Elite (1-25)'}
                        {category === 'Star' && 'Star (26-50)'}
                        {category === 'Impact' && 'Impact (51-75)'}
                        {category === 'Solid' && 'Solid (76-100)'}
                        {category === 'Freshmen' && 'Freshmen'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search and Position Filter */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {/* Search Box */}
                <div className="flex-1 min-w-0 w-full sm:min-w-80 sm:w-auto relative">
                  <div className="relative bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40 shadow-[inset_0_2px_8px_rgba(255,255,255,0.2)] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                    
                    <div className="relative flex items-center">
                      <i className="fas fa-search absolute left-4 text-gray-500 z-10"></i>
                      <input
                        type="text"
                        placeholder="Search players, teams..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full pl-12 pr-6 py-3 sm:py-4 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 font-medium text-base sm:text-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Position Filter */}
                {selectedCategory !== 'Freshmen' && (
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => {
                        setShowPositionFilter(!showPositionFilter);
                      }}
                      className="relative flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 font-semibold text-gray-700 shadow-[inset_0_1px_4px_rgba(255,255,255,0.2)] text-sm sm:text-base"
                    >
                      <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                      
                      <i className="fas fa-football-ball relative z-10"></i>
                      <span className="relative z-10">{selectedPosition === 'All' ? 'All Positions' : selectedPosition}</span>
                      <i className={`fas fa-chevron-down relative z-10 transition-transform duration-200 ${showPositionFilter ? 'rotate-180' : ''}`}></i>
                    </button>
                    {showPositionFilter && (
                      <div className="absolute top-full mt-2 bg-white/95 backdrop-blur-2xl border border-white/50 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] z-[10000] min-w-40 max-h-64 overflow-y-auto">
                        <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                        
                        <div className="relative z-[10001]">
                          {positions.map(pos => (
                            <button
                              key={pos}
                              onClick={() => {
                                setSelectedPosition(pos);
                                setShowPositionFilter(false);
                              }}
                              className={`block w-full text-left px-6 py-3 hover:bg-white/40 transition-all duration-200 font-medium ${
                                selectedPosition === pos 
                                  ? 'bg-white/40 text-red-700 font-bold' 
                                  : 'text-gray-700'
                              }`}
                            >
                              {pos}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Rendering Based on View Mode */}
        {viewMode === 'detailed' ? (
          /* Detailed View - Players Grid */
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlayers.map((player, index) => {
              const categoryStyle = getCategoryStyle(player.category || 'Freshmen');
              const positionGradient = getPositionGradient(player.position);
              const starRating = getStarRating(player.rank);
              
              return (
                <div key={`${player.name}-${index}`} className="flex flex-col h-full">
                  <div
                    className="group relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_25px_50px_rgba(0,0,0,0.15)] flex-1 flex flex-col"
                    style={{ animationDelay: `${index * 50}ms`, minHeight: '600px' }}
                    onMouseEnter={() => setHoveredPlayer(player.name)}
                    onMouseLeave={() => setHoveredPlayer(null)}
                  >
                    <div className="relative bg-white/50 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.1)] p-6 transition-all duration-500 group-hover:bg-white/60 group-hover:border-white/70 h-full flex flex-col">
                      <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/40 via-white/10 to-transparent pointer-events-none"></div>
                      
                      <div className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `linear-gradient(135deg, ${categoryStyle.shadowColor} 0%, ${categoryStyle.shadowColor} 50%, ${categoryStyle.shadowColor} 100%)` }}></div>
                      
                      <div className="relative z-10 flex flex-col h-full">
                        {/* Player Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            {/* Rank Badge with Category Color */}
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300" style={{ background: categoryStyle.gradient, boxShadow: `0 4px 20px ${categoryStyle.shadowColor}` }}>
                                <span className="text-white text-lg font-black">
                                  {selectedCategory === 'Freshmen' ? player.rank : `#${player.rank}`}
                                </span>
                              </div>
                            </div>
                            
                            {/* Team Logo */}
                            <div className="relative w-14 h-14 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                              <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/40 via-transparent to-transparent"></div>
                              <img
                                src={getTeamLogo(player.team)}
                                alt={`${player.team} logo`}
                                className="w-10 h-10 object-contain relative z-10 drop-shadow-xl"
                                onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                              />
                            </div>
                          </div>
                          
                          {/* Position Badge with Position Color */}
                          <div className="relative inline-flex items-center px-3 py-1 rounded-lg font-bold text-xs text-white backdrop-blur-xl border shadow-lg" style={{ background: positionGradient, borderColor: 'rgba(255,255,255,0.3)' }}>
                            <div className="absolute inset-1 rounded-md bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                            <span className="relative z-10">{player.position}</span>
                          </div>
                        </div>

                        {/* Player Info */}
                        <div className="mb-4">
                          <h3 className="text-xl font-black text-gray-900 mb-1 group-hover:text-red-700 transition-colors duration-300">
                            {player.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="font-bold text-gray-700">{player.team}</span>
                            {player.year && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-600">{player.year}</span>
                              </>
                            )}
                          </div>
                          
                          {/* Star Rating */}
                          {selectedCategory !== 'Freshmen' && (
                            <div className="flex items-center mt-2">
                              {[...Array(5)].map((_, i) => (
                                <i 
                                  key={i} 
                                  className={`fas fa-star text-xs ${
                                    i < Math.floor(starRating) 
                                      ? 'text-yellow-500' 
                                      : i === Math.floor(starRating) && starRating % 1 !== 0
                                      ? 'text-yellow-500 opacity-50'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="ml-2 text-xs text-gray-600 font-medium">({starRating})</span>
                            </div>
                          )}
                        </div>

                        {/* Stats/Info Section - Make this flex-grow to fill space */}
                        <div className="space-y-3 flex-grow">
                          {selectedCategory === 'Freshmen' ? (
                            <>
                              <div className="bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 p-3">
                                <div className="text-xs font-bold text-gray-600 mb-1">Ranking</div>
                                <div className="text-sm text-gray-800">{player.ranking}</div>
                              </div>
                              <div className="bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 p-3">
                                <div className="text-xs font-bold text-gray-600 mb-1">Profile</div>
                                <div className="text-sm text-gray-800">{player.profile}</div>
                              </div>
                              <div className="bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 p-3">
                                <div className="text-xs font-bold text-gray-600 mb-1">Impact</div>
                                <div className="text-sm text-gray-800">{player.impact}</div>
                              </div>
                              <div className="bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 p-3">
                                <div className="text-xs font-bold text-gray-600 mb-1">Potential</div>
                                <div className="text-sm font-bold text-gray-800">{player.potential}</div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 p-3">
                                <div className="text-xs font-bold text-gray-600 mb-1">2024 Stats</div>
                                <div className="text-sm text-gray-800">{player.stats}</div>
                              </div>
                              <div className="bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 p-3">
                                <div className="text-xs font-bold text-gray-600 mb-1">Why He's Special</div>
                                <div className="text-sm text-gray-800">{player.whySpecial}</div>
                              </div>
                              <div className="bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 p-3">
                                <div className="text-xs font-bold text-gray-600 mb-1">2025 Outlook</div>
                                <div className="text-sm font-bold text-gray-800">{player.outlook2025}</div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Award Indicators with Icons - Always at bottom */}
                        {selectedCategory !== 'Freshmen' && player.rank <= 100 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {player.outlook2025?.toLowerCase().includes('heisman') && (
                              <div className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: gradients.gold, border: '1px solid rgba(255,255,255,0.3)' }}>
                                <i className="fas fa-trophy mr-1"></i>
                                Heisman Watch
                              </div>
                            )}
                            {player.outlook2025?.toLowerCase().includes('all-american') && (
                              <div className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: gradients.sapphire, border: '1px solid rgba(255,255,255,0.3)' }}>
                                <i className="fas fa-trophy mr-1"></i>
                                All-American
                              </div>
                            )}
                            {(player.outlook2025?.toLowerCase().includes('breakout') || player.whySpecial?.toLowerCase().includes('explosive')) && (
                              <div className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: gradients.fuchsia, border: '1px solid rgba(255,255,255,0.3)' }}>
                                <i className="fas fa-rocket mr-1"></i>
                                Breakout Star
                              </div>
                            )}
                            {player.outlook2025?.toLowerCase().includes('draft') && (
                              <div className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: gradients.coral, border: '1px solid rgba(255,255,255,0.3)' }}>
                                <i className="fas fa-chart-line mr-1"></i>
                                NFL Draft
                              </div>
                            )}
                            {(player.whySpecial?.toLowerCase().includes('leader') || player.outlook2025?.toLowerCase().includes('leader')) && (
                              <div className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: gradients.burgundy, border: '1px solid rgba(255,255,255,0.3)' }}>
                                <i className="fas fa-users mr-1"></i>
                                Team Leader
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Compact View - List Format */
          <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-6">
            <div className="space-y-2">
              {filteredPlayers.map((player, index) => {
                const categoryStyle = getCategoryStyle(player.category || 'Freshmen');
                const positionGradient = getPositionGradient(player.position);
                
                return (
                  <div 
                    key={`${player.name}-${index}`}
                    className="flex items-center space-x-4 p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300"
                  >
                    {/* Rank */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: categoryStyle.gradient }}>
                      <span className="text-white text-sm font-black">
                        {selectedCategory === 'Freshmen' ? player.rank : player.rank}
                      </span>
                    </div>
                    
                    {/* Team Logo */}
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <img
                        src={getTeamLogo(player.team)}
                        alt={`${player.team} logo`}
                        className="w-full h-full object-contain"
                        onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                      />
                    </div>
                    
                    {/* Player Name */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 truncate">{player.name}</h4>
                      <p className="text-sm text-gray-600">{player.team}</p>
                    </div>
                    
                    {/* Position */}
                    <div className="px-3 py-1 rounded-lg font-bold text-xs text-white flex-shrink-0" style={{ background: positionGradient }}>
                      {player.position}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Analysis Section */}
        <div className="mt-16 space-y-8">
          {/* Latest College Football News */}
          <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
            <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-6" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Latest College Football News
              </h2>
              
              {newsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto"></div>
                </div>
              ) : (
                <div className="grid gap-6">
                  {newsArticles.map((article, index) => (
                    <div 
                      key={article.id || index}
                      className="bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 overflow-hidden hover:bg-white/30 transition-all duration-300 cursor-pointer"
                      onClick={() => window.open(article.url, '_blank')}
                    >
                      {article.image && (
                        <div className="relative h-64 overflow-hidden">
                          <img 
                            src={article.image} 
                            alt={article.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="font-bold text-xl text-gray-800 mb-3 hover:text-red-700 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-2 mb-4">{article.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{article.source?.name}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(article.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Players with Highest Upside */}
          <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
            <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-6" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Players with Highest Upside
              </h2>
              
              <div className="space-y-3">
                {[
                  { name: "Jeremiah Smith", team: "WR, Ohio State", desc: "Record-breaking potential" },
                  { name: "Dylan Stewart", team: "EDGE, South Carolina", desc: "Clowney-level impact" },
                  { name: "Bryce Underwood", team: "QB, Michigan", desc: "Franchise-changing talent" },
                  { name: "Caleb Downs", team: "S, Ohio State", desc: "Defensive Player of the Year ceiling" },
                  { name: "Anthony Hill Jr.", team: "LB, Texas", desc: "Complete linebacker package" }
                ].map((player, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-white/40 backdrop-blur-xl border border-white/50 flex items-center justify-center">
                        <img
                          src={getTeamLogo(player.team.split(',')[1].trim())}
                          alt={`${player.team} logo`}
                          className="w-8 h-8 object-contain"
                          onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{player.name}</h3>
                        <p className="text-sm text-gray-600">{player.team}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-700">{player.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dark Horse Breakout Candidates */}
          <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
            <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-6" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Dark Horse Breakout Candidates
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Nyck Harbor", team: "WR, South Carolina", desc: "Elite athleticism unleashed" },
                  { name: "Arch Manning", team: "QB, Texas", desc: "Living up to the hype" },
                  { name: "Gideon Davidson", team: "RB, Clemson", desc: "Immediate impact freshman" },
                  { name: "Zachariah Branch", team: "WR, Georgia", desc: "Explosive in new system" },
                  { name: "Sammy Brown", team: "LB, Clemson", desc: "Defensive star emerging" }
                ].map((player, index) => (
                  <div key={index} className="bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-white/40 backdrop-blur-xl border border-white/50 flex items-center justify-center">
                        <img
                          src={getTeamLogo(player.team.split(',')[1].trim())}
                          alt={`${player.team} logo`}
                          className="w-6 h-6 object-contain"
                          onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{player.name}</h3>
                        <p className="text-sm text-gray-600">{player.team}</p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-gray-700">{player.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Source Attribution */}
          <div className="text-center mt-12">
            <p className="text-sm text-gray-600">
              This comprehensive analysis represents the most thorough evaluation of top college football talent for 2025, 
              combining multiple expert rankings with detailed scouting reports and statistical analysis.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              [Source compilation from Gameday Data Optimization team]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopReturningPlayers2025;