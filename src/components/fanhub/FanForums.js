import React, { useState, useEffect } from 'react';

const TheColosseum = () => {
  const [activeStadium, setActiveStadium] = useState('main');
  const [fanCount, setFanCount] = useState(1247);
  const [showTopicsModal, setShowTopicsModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);
  const [showAllSections, setShowAllSections] = useState(false);

  // User photos for avatars - expanded with new photos
  const userPhotos = [
    '/SportsbookLogos/Wedding.jpg',
    '/SportsbookLogos/Mclovin.jpg',
    '/SportsbookLogos/Nick.jpg',
    '/SportsbookLogos/NY.jpg',
    '/SportsbookLogos/SB.jpg',
    '/SportsbookLogos/CLE.jpg',
    '/SportsbookLogos/ASU.jpg',
    '/SportsbookLogos/Allstate.jpg',
    '/SportsbookLogos/Aly.jpg',
    '/SportsbookLogos/Asmith.jpg',
    '/SportsbookLogos/Dan.jpeg',
    '/SportsbookLogos/Erin Dolan.jpg',
    '/SportsbookLogos/Graig.jpg',
    '/SportsbookLogos/JoellKlat.jpg',
    '/SportsbookLogos/Kstate.jpg',
    '/SportsbookLogos/LouisR.jpg',
    '/SportsbookLogos/Michiganfan.jpg',
    '/SportsbookLogos/NIUALUM.jpg',
    '/SportsbookLogos/Patrick.jpg',
    '/SportsbookLogos/UT.jpeg',
    '/SportsbookLogos/annie.jpeg',
    '/SportsbookLogos/leeC.png',
    '/SportsbookLogos/osufan.jpg',
    '/SportsbookLogos/pollack.jpg'
  ];

  // Modern theme colors - matching EVBettingView's sophisticated system
  const metallicGradient = `linear-gradient(135deg, 
    rgb(255, 46, 74), 
    rgb(204, 0, 28), 
    rgb(161, 0, 20), 
    rgb(204, 0, 28), 
    rgb(255, 46, 74)
  )`;
  
  // Professional multi-stop gradient system like EVBettingView
  const professionalGradients = {
    red: `linear-gradient(135deg, 
      rgb(239, 68, 68), 
      rgb(220, 38, 38), 
      rgb(185, 28, 28), 
      rgb(220, 38, 38), 
      rgb(239, 68, 68)
    )`,
    blue: `linear-gradient(135deg, 
      rgb(59, 130, 246), 
      rgb(37, 99, 235), 
      rgb(29, 78, 216), 
      rgb(37, 99, 235), 
      rgb(59, 130, 246)
    )`,
    green: `linear-gradient(135deg, 
      rgb(34, 197, 94), 
      rgb(22, 163, 74), 
      rgb(15, 118, 54), 
      rgb(22, 163, 74), 
      rgb(34, 197, 94)
    )`,
    gold: `linear-gradient(135deg, 
      rgb(250, 204, 21), 
      rgb(245, 158, 11), 
      rgb(217, 119, 6), 
      rgb(245, 158, 11), 
      rgb(250, 204, 21)
    )`,
    silver: `linear-gradient(135deg, 
      rgb(148, 163, 184), 
      rgb(100, 116, 139), 
      rgb(71, 85, 105), 
      rgb(100, 116, 139), 
      rgb(148, 163, 184)
    )`,
    orange: `linear-gradient(135deg, 
      rgb(251, 146, 60), 
      rgb(249, 115, 22), 
      rgb(234, 88, 12), 
      rgb(249, 115, 22), 
      rgb(251, 146, 60)
    )`,
    teal: `linear-gradient(135deg, 
      rgb(20, 184, 166), 
      rgb(13, 148, 136), 
      rgb(15, 118, 110), 
      rgb(13, 148, 136), 
      rgb(20, 184, 166)
    )`,
    bronze: `linear-gradient(135deg, 
      rgb(180, 83, 9), 
      rgb(154, 52, 18), 
      rgb(120, 53, 15), 
      rgb(154, 52, 18), 
      rgb(180, 83, 9)
    )`,
    indigo: `linear-gradient(135deg, 
      rgb(99, 102, 241), 
      rgb(79, 70, 229), 
      rgb(67, 56, 202), 
      rgb(79, 70, 229), 
      rgb(99, 102, 241)
    )`,
    emerald: `linear-gradient(135deg, 
      rgb(16, 185, 129), 
      rgb(5, 150, 105), 
      rgb(4, 120, 87), 
      rgb(5, 150, 105), 
      rgb(16, 185, 129)
    )`
  };
  
  const glassEffect = 'rgba(255, 255, 255, 0.85)';
  const backdropBlur = 'blur(12px)';

  // Simulate live fan activity
  useEffect(() => {
    const interval = setInterval(() => {
      setFanCount(prev => prev + Math.floor(Math.random() * 5 - 2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stadiumSections = [
    { 
      id: 'main', 
      name: 'Main Plaza', 
      icon: 'fa-landmark', 
      fans: 456, 
      description: 'General CFB discussion', 
      color: professionalGradients.red,
      shadowColor: 'rgba(239, 68, 68, 0.3)'
    },
    { 
      id: 'gameweek', 
      name: 'Game of the Week', 
      icon: 'fa-star', 
      fans: 312, 
      description: 'Weekly marquee matchup talk', 
      color: professionalGradients.gold,
      shadowColor: 'rgba(250, 204, 21, 0.3)'
    },
    { 
      id: 'betting', 
      name: 'Betting Insights', 
      icon: 'fa-chart-line', 
      fans: 201, 
      description: 'Lines, spreads & picks', 
      color: professionalGradients.emerald,
      shadowColor: 'rgba(16, 185, 129, 0.3)'
    },
    { 
      id: 'gameday', 
      name: 'GameDay Central', 
      icon: 'fa-calendar', 
      fans: 234, 
      description: 'Live game reactions', 
      color: professionalGradients.blue,
      shadowColor: 'rgba(59, 130, 246, 0.3)'
    },
    { 
      id: 'recruiting', 
      name: 'Recruiting Hub', 
      icon: 'fa-graduation-cap', 
      fans: 189, 
      description: 'Prospect tracking', 
      color: professionalGradients.green,
      shadowColor: 'rgba(34, 197, 94, 0.3)'
    },
    { 
      id: 'rivalry', 
      name: 'Rivalry Corner', 
      icon: 'fa-fire', 
      fans: 167, 
      description: 'Team vs team debates', 
      color: professionalGradients.orange,
      shadowColor: 'rgba(251, 146, 60, 0.3)'
    },
    { 
      id: 'nostalgia', 
      name: 'Memory Lane', 
      icon: 'fa-history', 
      fans: 134, 
      description: 'Classic games & moments', 
      color: professionalGradients.silver,
      shadowColor: 'rgba(148, 163, 184, 0.3)'
    },
    { 
      id: 'playoffs', 
      name: 'Playoff Central', 
      icon: 'fa-trophy', 
      fans: 289, 
      description: 'Championship talk', 
      color: `linear-gradient(135deg, 
        rgb(168, 85, 247), 
        rgb(139, 69, 219), 
        rgb(124, 58, 193), 
        rgb(139, 69, 219), 
        rgb(168, 85, 247)
      )`,
      shadowColor: 'rgba(168, 85, 247, 0.3)'
    },
    { 
      id: 'transfer', 
      name: 'Transfer Portal', 
      icon: 'fa-exchange-alt', 
      fans: 156, 
      description: 'Portal moves & rumors', 
      color: professionalGradients.teal,
      shadowColor: 'rgba(20, 184, 166, 0.3)'
    },
    { 
      id: 'coaching', 
      name: 'Coaching Corner', 
      icon: 'fa-chalkboard-teacher', 
      fans: 124, 
      description: 'Coach hires & strategy', 
      color: professionalGradients.bronze,
      shadowColor: 'rgba(180, 83, 9, 0.3)'
    },
    { 
      id: 'draft', 
      name: 'NFL Draft Zone', 
      icon: 'fa-football-ball', 
      fans: 98, 
      description: 'Draft prospects & analysis', 
      color: professionalGradients.indigo,
      shadowColor: 'rgba(99, 102, 241, 0.3)'
    },
    { 
      id: 'impact', 
      name: 'Impact Players', 
      icon: 'fa-star', 
      fans: 267, 
      description: 'Breakout stars & standouts', 
      color: `linear-gradient(135deg, 
        rgb(244, 63, 94), 
        rgb(225, 29, 72), 
        rgb(190, 18, 60), 
        rgb(225, 29, 72), 
        rgb(244, 63, 94)
      )`,
      shadowColor: 'rgba(244, 63, 94, 0.3)'
    }
  ];

  // Additional Hot Topics for each section
  const hotTopicsData = {
    main: [
      { topic: '"CFP rankings are out - thoughts?"', replies: 34, reactions: 12, user: '@CFBAnalyst' },
      { topic: '"Which conference is strongest this year?"', replies: 89, reactions: 45, user: '@ConferenceKing' },
      { topic: '"Best uniform combinations this season"', replies: 67, reactions: 23, user: '@UniformGuru' },
      { topic: '"Most overrated teams in the top 25"', replies: 156, reactions: 78, user: '@HotTakeHank' },
      { topic: '"Predictions for bowl game matchups"', replies: 43, reactions: 19, user: '@BowlExpert' }
    ],
    gameday: [
      { topic: '"This interception just changed everything!"', replies: 34, reactions: 12, user: '@LiveReactions' },
      { topic: '"Did anyone see that incredible catch?!"', replies: 78, reactions: 45, user: '@GameWatcher' },
      { topic: '"Referee missed that obvious call"', replies: 234, reactions: 156, user: '@RefWatch' },
      { topic: '"Overtime predictions - who takes it?"', replies: 56, reactions: 23, user: '@OTPredictor' },
      { topic: '"Weather delay affecting the game plan"', replies: 34, reactions: 12, user: '@WeatherFan' }
    ],
    recruiting: [
      { topic: '"5-star QB just entered the portal..."', replies: 34, reactions: 12, user: '@RecruitTracker' },
      { topic: '"Top 2025 recruits still uncommitted"', replies: 89, reactions: 67, user: '@RecruitScout' },
      { topic: '"NIL deals changing the recruiting game"', replies: 123, reactions: 89, user: '@NILExpert' },
      { topic: '"Surprise commitment flips coming soon?"', replies: 45, reactions: 23, user: '@FlipWatch' },
      { topic: '"Junior college transfers to watch"', replies: 67, reactions: 34, user: '@JUCOExpert' }
    ],
    rivalry: [
      { topic: '"Alabama vs Georgia: Who has the better defense?"', replies: 34, reactions: 12, user: '@DefenseDebate' },
      { topic: '"Texas vs Oklahoma - Red River predictions"', replies: 156, reactions: 89, user: '@RedRiverFan' },
      { topic: '"Michigan vs Ohio State trash talk thread"', replies: 234, reactions: 123, user: '@RivalryKing' },
      { topic: '"Iron Bowl predictions - Auburn can win"', replies: 78, reactions: 45, user: '@IronBowlFan' },
      { topic: '"Clemson vs South Carolina - who wants it more?"', replies: 56, reactions: 23, user: '@PalmettoState' }
    ],
    nostalgia: [
      { topic: '"Remember the 2019 LSU season?"', replies: 34, reactions: 12, user: '@LSULegend' },
      { topic: '"Greatest CFB game you ever witnessed live"', replies: 156, reactions: 89, user: '@LiveGameFan' },
      { topic: '"Vince Young\'s 2006 Rose Bowl performance"', replies: 234, reactions: 167, user: '@LonghornLegacy' },
      { topic: '"2007 season chaos - what a year that was"', replies: 89, reactions: 56, user: '@ChaosYear' },
      { topic: '"Boise State vs Oklahoma Fiesta Bowl magic"', replies: 78, reactions: 45, user: '@FiestaBowlFan' }
    ],
    playoffs: [
      { topic: '"Playoff expansion thoughts?"', replies: 34, reactions: 12, user: '@PlayoffPundit' },
      { topic: '"12-team playoff bracket predictions"', replies: 189, reactions: 123, user: '@BracketMaster' },
      { topic: '"Should conference champions get auto-bids?"', replies: 156, reactions: 89, user: '@AutoBidDebate' },
      { topic: '"First round playoff games will be epic"', replies: 67, reactions: 34, user: '@FirstRoundFan' },
      { topic: '"Cinderella teams that could make noise"', replies: 45, reactions: 23, user: '@CinderellaWatch' }
    ],
    transfer: [
      { topic: '"5-star WR just hit the portal from Alabama"', replies: 287, reactions: 156, user: '@PortalWatch' },
      { topic: '"Transfer QBs changing the landscape"', replies: 134, reactions: 89, user: '@QuarterbackGuru' },
      { topic: '"Best portal pickups this season"', replies: 98, reactions: 67, user: '@TransferExpert' },
      { topic: '"NIL money driving portal decisions?"', replies: 203, reactions: 145, user: '@NILTracker' },
      { topic: '"Coaching changes = more transfers"', replies: 76, reactions: 43, user: '@CoachingImpact' }
    ],
    coaching: [
      { topic: '"Lane Kiffin to which job next?"', replies: 234, reactions: 167, user: '@CoachingRumors' },
      { topic: '"Best offensive coordinators in CFB"', replies: 156, reactions: 89, user: '@OffenseGuru' },
      { topic: '"Defensive genius: who runs the best D?"', replies: 98, reactions: 67, user: '@DefenseExpert' },
      { topic: '"Young coaches making waves"', replies: 87, reactions: 45, user: '@NextGenCoach' },
      { topic: '"Hot seat watch: who\'s in trouble?"', replies: 345, reactions: 234, user: '@HotSeatAlert' }
    ],
    draft: [
      { topic: '"Top 2025 NFL Draft prospects to watch"', replies: 189, reactions: 123, user: '@DraftScout' },
      { topic: '"Quarterback class looking weak this year"', replies: 156, reactions: 89, user: '@QBAnalyst' },
      { topic: '"Sleeper picks that will surprise NFL teams"', replies: 98, reactions: 67, user: '@SleepersAlert' },
      { topic: '"Early entrants vs staying in school"', replies: 134, reactions: 78, user: '@DraftDecisions' },
      { topic: '"Small school players NFL should notice"', replies: 76, reactions: 45, user: '@SmallSchoolScout' }
    ],
    betting: [
      { topic: '"Vegas insider tips for this weekend"', replies: 234, reactions: 156, user: '@VegasInsider' },
      { topic: '"Best value bets in college football"', replies: 189, reactions: 123, user: '@ValueBetter' },
      { topic: '"Upset alerts: where\'s the money?"', replies: 156, reactions: 89, user: '@UpsetAlert' },
      { topic: '"Live betting strategies that work"', replies: 134, reactions: 78, user: '@LiveBetPro' },
      { topic: '"Prop bets worth your money this week"', replies: 98, reactions: 67, user: '@PropMaster' }
    ],
    gameweek: [
      { topic: '"Georgia vs Alabama preview: who wins?"', replies: 456, reactions: 289, user: '@GameweekGuru' },
      { topic: '"Key matchups to watch this Saturday"', replies: 234, reactions: 167, user: '@MatchupExpert' },
      { topic: '"Weather could be a factor in the big game"', replies: 123, reactions: 78, user: '@WeatherImpact' },
      { topic: '"Injury reports affecting the spread"', replies: 189, reactions: 134, user: '@InjuryWatch' },
      { topic: '"Playoff implications riding on this game"', replies: 345, reactions: 234, user: '@PlayoffWatch' }
    ],
    impact: [
      { topic: '"Heisman dark horse candidates emerging"', replies: 287, reactions: 189, user: '@HeismanWatch' },
      { topic: '"Freshman making immediate impact"', replies: 156, reactions: 123, user: '@FreshmanPhenom' },
      { topic: '"Transfer QB lighting up the scoreboard"', replies: 234, reactions: 167, user: '@TransferStar' },
      { topic: '"Defensive player of the year race heating up"', replies: 134, reactions: 89, user: '@DefensiveMVP' },
      { topic: '"Under-the-radar players NFL scouts love"', replies: 98, reactions: 67, user: '@ScoutFavorite' }
    ]
  };

  const mockFanActivity = [
    { user: '@CrimsonTide2025', action: 'Started heated debate about CFP rankings', time: '2m ago', avatar: 'fa-user', photo: userPhotos[0], points: '+25' },
    { user: '@GeorgiaDawg', action: 'Predicted upset in Rivalry Corner', time: '5m ago', avatar: 'fa-user-circle', photo: userPhotos[1], points: '+15' },
    { user: '@TexasLonghorn', action: 'Shared legendary 2005 Rose Bowl memory', time: '8m ago', avatar: 'fa-user-astronaut', photo: userPhotos[2], points: '+10' },
    { user: '@OhioStateFan', action: 'Posted recruiting analysis in Main Plaza', time: '12m ago', avatar: 'fa-user-graduate', photo: userPhotos[3], points: '+20' },
    { user: '@AlabamaFan', action: 'Won weekly prediction challenge', time: '15m ago', avatar: 'fa-user-ninja', photo: userPhotos[4], points: '+100' }
  ];

  // Fan Predictions Mock Data
  const fanPredictions = [
    {
      id: 1,
      homeTeam: 'Alabama',
      awayTeam: 'Georgia',
      homeScore: 28,
      awayScore: 21,
      confidence: 85,
      predictor: '@CrimsonTide2025',
      predictorPhoto: userPhotos[0],
      homelogo: '/team_logos/alabama.png',
      awaylogo: '/team_logos/georgia.png',
      reasoning: 'Alabama\'s defense at home will be the difference maker',
      likes: 47,
      comments: 12,
      time: '2 hours ago',
      category: 'SEC Championship',
      points: '+150'
    },
    {
      id: 2,
      homeTeam: 'Michigan',
      awayTeam: 'Ohio State',
      homeScore: 24,
      awayScore: 31,
      confidence: 78,
      predictor: '@WolverineNation',
      predictorPhoto: userPhotos[1],
      homelogo: '/team_logos/michigan.png',
      awaylogo: '/team_logos/ohio_state.png',
      reasoning: 'Ohio State\'s passing attack will exploit Michigan\'s secondary',
      likes: 89,
      comments: 23,
      time: '4 hours ago',
      category: 'Big Ten Rivalry',
      points: '+200'
    },
    {
      id: 3,
      homeTeam: 'Texas',
      awayTeam: 'Oklahoma',
      homeScore: 35,
      awayScore: 28,
      confidence: 92,
      predictor: '@LonghornPride',
      predictorPhoto: userPhotos[2],
      homelogo: '/team_logos/texas.png',
      awaylogo: '/team_logos/oklahoma.png',
      reasoning: 'Texas offense is unstoppable this season, Red River magic',
      likes: 156,
      comments: 34,
      time: '6 hours ago',
      category: 'Big 12 Showdown',
      points: '+250'
    },
    {
      id: 4,
      homeTeam: 'Oregon',
      awayTeam: 'Washington',
      homeScore: 42,
      awayScore: 17,
      confidence: 88,
      predictor: '@DuckNation',
      predictorPhoto: userPhotos[3],
      homelogo: '/team_logos/oregon.png',
      awaylogo: '/team_logos/washington.png',
      reasoning: 'Oregon\'s speed and depth will wear down Washington',
      likes: 73,
      comments: 18,
      time: '8 hours ago',
      category: 'Pac-12 Battle',
      points: '+175'
    }
  ];

  // Prediction Categories
  const predictionCategories = [
    {
      name: 'SEC Championship',
      count: 234,
      color: professionalGradients.red,
      shadowColor: 'rgba(239, 68, 68, 0.3)',
      icon: 'fa-crown'
    },
    {
      name: 'Big Ten Rivalry',
      count: 189,
      color: professionalGradients.blue,
      shadowColor: 'rgba(59, 130, 246, 0.3)',
      icon: 'fa-fire'
    },
    {
      name: 'Big 12 Showdown',
      count: 156,
      color: professionalGradients.orange,
      shadowColor: 'rgba(251, 146, 60, 0.3)',
      icon: 'fa-bolt'
    },
    {
      name: 'Pac-12 Battle',
      count: 123,
      color: professionalGradients.green,
      shadowColor: 'rgba(34, 197, 94, 0.3)',
      icon: 'fa-mountain'
    }
  ];
  
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0, #f1f5f9)' }}>
      {/* Hero Section */}
      <div className="relative pt-32 pb-20" style={{ width: '97%', margin: '0 auto' }}>
        <div className="w-full">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-extrabold mb-6">
              <span 
                className="block"
                style={{
                  background: metallicGradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                THE
              </span>
              <span 
                className="block"
                style={{
                  background: 'linear-gradient(135deg, #1f2937, #374151, #4b5563)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                COLOSSEUM
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
              Step into virtual stadium sections where passionate fans gather to debate, celebrate, and share the pure emotion of college football.
            </p>
            <div 
              className="rounded-lg p-6 border shadow-xl max-w-2xl mx-auto"
              style={{
                background: glassEffect,
                backdropFilter: backdropBlur,
                WebkitBackdropFilter: backdropBlur,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h3 
                className="text-lg font-bold mb-4 flex items-center gap-3"
                style={{
                  background: metallicGradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                <i 
                  className="fas fa-bullseye"
                  style={{
                    background: metallicGradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                ></i>
                EARN POINTS FOR EVERY ACTION
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div 
                    className="text-lg font-bold"
                    style={{
                      background: professionalGradients.green,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    +25
                  </div>
                  <div className="text-gray-600 font-medium">Start Discussion</div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-lg font-bold"
                    style={{
                      background: professionalGradients.green,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    +15
                  </div>
                  <div className="text-gray-600 font-medium">Quality Reply</div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-lg font-bold"
                    style={{
                      background: professionalGradients.green,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    +10
                  </div>
                  <div className="text-gray-600 font-medium">Share Memory</div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-lg font-bold"
                    style={{
                      background: professionalGradients.green,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    +5
                  </div>
                  <div className="text-gray-600 font-medium">React/Like</div>
                </div>
              </div>
            </div>
            
            {/* Live Stats Bar */}
            <div className="mt-8 flex justify-center items-center space-x-8 text-sm font-medium">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{
                    background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                    boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)'
                  }}
                ></div>
                <span 
                  className="font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #1f2937, #374151)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {fanCount.toLocaleString()} Fans Online
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <i 
                  className="fas fa-comments"
                  style={{
                    background: metallicGradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                ></i>
                <span 
                  className="font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #1f2937, #374151)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  342 Active Discussions
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <i 
                  className="fas fa-fire"
                  style={{
                    background: 'linear-gradient(135deg, rgb(245, 158, 11), rgb(217, 119, 6))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                ></i>
                <span 
                  className="font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #1f2937, #374151)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  89 Hot Takes
                </span>
              </div>
            </div>
          </div>

          {/* Stadium Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {(showAllSections ? stadiumSections : stadiumSections.slice(0, 6)).map((section) => (
              <div 
                key={section.id}
                onClick={() => setActiveStadium(section.id)}
                className={`group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] ${
                  activeStadium === section.id ? 'scale-[1.05] shadow-2xl' : 'hover:shadow-2xl'
                }`}
                style={{
                  filter: activeStadium === section.id ? `drop-shadow(0 8px 24px ${section.shadowColor})` : 'none'
                }}
              >
                <div 
                  className="rounded-lg shadow-xl hover:shadow-2xl border overflow-hidden"
                  style={{
                    background: glassEffect,
                    backdropFilter: backdropBlur,
                    WebkitBackdropFilter: backdropBlur,
                    border: activeStadium === section.id ? 
                      `2px solid rgba(255, 255, 255, 0.6)` : 
                      '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: activeStadium === section.id ? 
                      `0 12px 40px ${section.shadowColor}, 0 0 0 1px rgba(255, 255, 255, 0.5)` : 
                      '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {/* Section Header */}
                  <div 
                    className="relative p-6 text-white"
                    style={{
                      background: section.color,
                      boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 8px ${section.shadowColor}`
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <i 
                        className={`fas ${section.icon} text-3xl`}
                        style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                        }}
                      ></i>
                      <div 
                        className="flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium"
                        style={{
                          background: 'rgba(255, 255, 255, 0.25)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <i className="fas fa-users"></i>
                        <span>{section.fans}</span>
                      </div>
                    </div>
                    <h3 
                      className="text-xl font-bold mb-2"
                      style={{
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      {section.name}
                    </h3>
                    <p 
                      className="text-white/90 text-sm"
                      style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                      }}
                    >
                      {section.description}
                    </p>
                    
                    {/* Activity Indicator */}
                    <div className="absolute top-4 right-4">
                      <div 
                        className="w-3 h-3 rounded-full animate-pulse"
                        style={{
                          background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                          boxShadow: '0 0 8px rgba(34, 197, 94, 0.8)'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Section Preview */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Sample Discussion Topics */}
                      <div 
                        className="flex items-start space-x-3 p-4 rounded-md transition-all duration-200 hover:shadow-md cursor-pointer"
                        style={{
                          background: 'rgba(249, 250, 251, 0.8)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white border-opacity-30 flex-shrink-0">
                          <img 
                            src={userPhotos[Math.floor(Math.random() * userPhotos.length)]} 
                            alt="User avatar" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="w-full h-full flex items-center justify-center shadow-md"
                            style={{
                              background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(147, 51, 234))',
                              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                              display: 'none'
                            }}
                          >
                            <i className="fas fa-user text-white text-sm"></i>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div 
                            className="text-sm font-semibold"
                            style={{
                              background: 'linear-gradient(135deg, #1f2937, #374151)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          >
                            Latest Hot Topic
                          </div>
                          <div className="text-xs text-gray-600 mt-1 font-medium">
                            {hotTopicsData[section.id] ? hotTopicsData[section.id][0].topic : 
                             section.id === 'rivalry' ? '"Alabama vs Georgia: Who has the better defense?"' :
                             section.id === 'recruiting' ? '"5-star QB just entered the portal..."' :
                             section.id === 'gameday' ? '"This interception just changed everything!"' :
                             section.id === 'playoffs' ? '"Playoff expansion thoughts?"' :
                             section.id === 'nostalgia' ? '"Remember the 2019 LSU season?"' :
                             '"CFP rankings are out - thoughts?"'}
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-xs">
                            <span className="text-gray-500 font-medium">
                              {hotTopicsData[section.id] ? hotTopicsData[section.id][0].replies : 34} replies
                            </span>
                            <span className="text-gray-500 font-medium">
                              {hotTopicsData[section.id] ? hotTopicsData[section.id][0].reactions : 12} reactions
                            </span>
                            <span 
                              className="font-bold"
                              style={{
                                background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                              }}
                            >
                              +15 points
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSection(section);
                            setShowTopicsModal(true);
                          }}
                          className="py-2 px-3 text-sm rounded-md font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02] group"
                          style={{
                            background: 'linear-gradient(135deg, rgba(249, 250, 251, 0.9), rgba(255, 255, 255, 0.8))',
                            border: `1px solid ${section.shadowColor}`,
                            color: section.color.includes('250, 204, 21') ? '#b45309' : 
                                   section.color.includes('239, 68, 68') ? '#dc2626' :
                                   section.color.includes('59, 130, 246') ? '#2563eb' :
                                   section.color.includes('34, 197, 94') ? '#16a34a' :
                                   section.color.includes('251, 146, 60') ? '#ea580c' :
                                   section.color.includes('147, 51, 234') ? '#9333ea' :
                                   section.color.includes('20, 184, 166') ? '#0d9488' :
                                   section.color.includes('236, 72, 153') ? '#db2777' :
                                   section.color.includes('99, 102, 241') ? '#6366f1' : '#059669'
                          }}
                        >
                          <i className="fas fa-list mr-2"></i>
                          <span>View More Topics</span>
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSection(section);
                            setShowCreateTopicModal(true);
                          }}
                          className="py-2 px-3 text-sm text-white rounded-md font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group"
                          style={{
                            background: section.color,
                            boxShadow: `0 2px 8px ${section.shadowColor}`
                          }}
                        >
                          <i className="fas fa-plus mr-2"></i>
                          <span>New Topic</span>
                        </button>
                      </div>

                      {/* Join Button */}
                      <button 
                        onClick={() => window.location.hash = `forum-section-${section.id}`}
                        className="w-full py-3 text-white rounded-md font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group"
                        style={{
                          background: section.color,
                          boxShadow: `0 4px 12px ${section.shadowColor}`
                        }}
                      >
                        <i className="fas fa-sign-in-alt mr-2"></i>
                        <span>Enter {section.name}</span>
                        <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform duration-300"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View More Button */}
          {!showAllSections && stadiumSections.length > 6 && (
            <div className="text-center mb-16">
              <button 
                onClick={() => setShowAllSections(true)}
                className="px-8 py-4 text-white rounded-lg font-bold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group"
                style={{
                  background: metallicGradient,
                  boxShadow: '0 4px 12px rgba(255, 46, 74, 0.3)'
                }}
              >
                <i className="fas fa-chevron-down mr-2"></i>
                <span>View More Forum Sections ({stadiumSections.length - 6} more)</span>
                <i className="fas fa-chevron-down ml-2 group-hover:translate-y-1 transition-transform duration-300"></i>
              </button>
            </div>
          )}

          {/* Show Less Button */}
          {showAllSections && (
            <div className="text-center mb-16">
              <button 
                onClick={() => setShowAllSections(false)}
                className="px-8 py-4 text-gray-700 rounded-lg font-bold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group"
                style={{
                  background: 'rgba(249, 250, 251, 0.9)',
                  border: '1px solid rgba(209, 213, 219, 0.5)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              >
                <i className="fas fa-chevron-up mr-2"></i>
                <span>Show Less</span>
                <i className="fas fa-chevron-up ml-2 group-hover:-translate-y-1 transition-transform duration-300"></i>
              </button>
            </div>
          )}

          {/* Live Fan Activity Feed */}
          <div 
            className="rounded-lg shadow-xl border overflow-hidden mb-16"
            style={{
              background: glassEffect,
              backdropFilter: backdropBlur,
              WebkitBackdropFilter: backdropBlur,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div 
              className="text-white p-6"
              style={{
                background: metallicGradient,
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 
                    className="text-2xl font-bold mb-2 flex items-center gap-3"
                    style={{
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    <i 
                      className="fas fa-fire text-white"
                      style={{
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                      }}
                    ></i>
                    Live Fan Activity
                  </h3>
                  <p 
                    className="text-gray-300"
                    style={{
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}
                  >
                    Real-time fan movements across the Colosseum
                  </p>
                </div>
                <div 
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium"
                  style={{
                    background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                  }}
                >
                  <div 
                    className="w-2 h-2 bg-white rounded-full animate-pulse"
                    style={{
                      boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)'
                    }}
                  ></div>
                  <span className="text-sm font-bold">LIVE</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {mockFanActivity.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-4 p-4 rounded-md transition-all duration-200 hover:shadow-md cursor-pointer hover:scale-[1.01]"
                  style={{
                    background: 'rgba(249, 250, 251, 0.8)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white border-opacity-30 flex-shrink-0">
                    <img 
                      src={activity.photo} 
                      alt="User avatar" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-full h-full flex items-center justify-center shadow-md"
                      style={{
                        background: 'linear-gradient(135deg, rgb(239, 68, 68), rgb(245, 158, 11))',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                        display: 'none'
                      }}
                    >
                      <i className={`fas ${activity.avatar} text-white`}></i>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span 
                        className="font-bold"
                        style={{
                          background: 'linear-gradient(135deg, #1f2937, #374151)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      >
                        {activity.user}
                      </span>
                      <span className="text-gray-600 font-medium">{activity.action}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 font-medium">{activity.time}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span 
                      className="text-sm font-bold"
                      style={{
                        background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      {activity.points}
                    </span>
                    <button 
                      className="px-3 py-1 text-xs rounded-md font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                      style={{
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.2))',
                        color: 'rgb(239, 68, 68)',
                        border: '1px solid rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      Follow
                    </button>
                  </div>
                </div>
              ))}

              <div className="text-center pt-4">
                <button 
                  className="px-6 py-3 text-white rounded-lg font-bold transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                  style={{
                    background: metallicGradient,
                    boxShadow: '0 4px 12px rgba(255, 46, 74, 0.3)'
                  }}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Start Your Own Discussion
                </button>
              </div>
            </div>
          </div>

          {/* Fan Predictions Section */}
          <div 
            className="rounded-lg shadow-xl border overflow-hidden mb-16"
            style={{
              background: glassEffect,
              backdropFilter: backdropBlur,
              WebkitBackdropFilter: backdropBlur,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div 
              className="text-white p-6"
              style={{
                background: metallicGradient,
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 
                    className="text-2xl font-bold mb-2 flex items-center gap-3"
                    style={{
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    <i 
                      className="fas fa-bullseye text-white"
                      style={{
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                      }}
                    ></i>
                    Fan Predictions Arena
                  </h3>
                  <p 
                    className="text-gray-300"
                    style={{
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}
                  >
                    Test your CFB knowledge and compete with fellow fans
                  </p>
                </div>
                <div 
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium"
                  style={{
                    background: 'linear-gradient(135deg, rgb(250, 204, 21), rgb(245, 158, 11))',
                    boxShadow: '0 4px 12px rgba(250, 204, 21, 0.3)'
                  }}
                >
                  <i className="fas fa-trophy text-sm"></i>
                  <span className="text-sm font-bold text-gray-900">COMPETE</span>
                </div>
              </div>
            </div>

            {/* Prediction Categories */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {predictionCategories.map((category, index) => (
                  <div 
                    key={index}
                    className="text-center p-4 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                    style={{
                      background: 'rgba(249, 250, 251, 0.8)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{
                        background: category.color,
                        boxShadow: `0 4px 12px ${category.shadowColor}`
                      }}
                    >
                      <i className={`fas ${category.icon} text-white text-lg`}></i>
                    </div>
                    <h4 
                      className="text-sm font-bold mb-1"
                      style={{
                        background: 'linear-gradient(135deg, #1f2937, #374151)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      {category.name}
                    </h4>
                    <p 
                      className="text-xs font-medium"
                      style={{
                        background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      {category.count} predictions
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fan Predictions Grid */}
            <div className="p-6 space-y-6">
              {fanPredictions.map((prediction) => (
                <div 
                  key={prediction.id}
                  className="rounded-lg shadow-lg border overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-[1.01]"
                  style={{
                    background: 'rgba(249, 250, 251, 0.9)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  {/* Prediction Header */}
                  <div 
                    className="p-4 text-white"
                    style={{
                      background: 'linear-gradient(135deg, rgb(31, 41, 55), rgb(55, 65, 81), rgb(75, 85, 99))',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white border-opacity-30">
                          <img 
                            src={prediction.predictorPhoto} 
                            alt="Predictor" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="w-full h-full flex items-center justify-center"
                            style={{
                              background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(147, 51, 234))',
                              display: 'none'
                            }}
                          >
                            <i className="fas fa-user text-white text-xs"></i>
                          </div>
                        </div>
                        <div>
                          <span 
                            className="font-bold text-sm"
                            style={{
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}
                          >
                            {prediction.predictor}
                          </span>
                          <div className="text-xs text-gray-300">{prediction.time}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div 
                          className="px-3 py-1 rounded-lg text-xs font-bold"
                          style={{
                            background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
                          }}
                        >
                          {prediction.confidence}% confident
                        </div>
                        <div 
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(4px)',
                            WebkitBackdropFilter: 'blur(4px)'
                          }}
                        >
                          {prediction.category}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Matchup Display */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      {/* Away Team */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                          <img 
                            src={prediction.awaylogo} 
                            alt={prediction.awayTeam} 
                            className="w-full h-full object-contain filter drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 hover:scale-110"
                            style={{
                              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15)) contrast(1.1) saturate(1.2)',
                              imageRendering: 'crisp-edges'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="w-16 h-16 flex items-center justify-center rounded-lg"
                            style={{
                              background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(147, 51, 234))',
                              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                              display: 'none'
                            }}
                          >
                            <i className="fas fa-football-ball text-white text-2xl"></i>
                          </div>
                        </div>
                        <div>
                          <h4 
                            className="text-lg font-bold"
                            style={{
                              background: 'linear-gradient(135deg, #1f2937, #374151)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          >
                            {prediction.awayTeam}
                          </h4>
                          <p className="text-sm text-gray-600 font-medium">Away</p>
                        </div>
                      </div>

                      {/* VS and Score */}
                      <div className="flex-1 text-center mx-6">
                        <div 
                          className="text-3xl font-bold mb-2"
                          style={{
                            background: metallicGradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}
                        >
                          {prediction.awayScore} - {prediction.homeScore}
                        </div>
                        <div 
                          className="text-sm font-bold px-4 py-2 rounded-lg"
                          style={{
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.2))',
                            color: 'rgb(239, 68, 68)',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                          }}
                        >
                          VS
                        </div>
                      </div>

                      {/* Home Team */}
                      <div className="flex items-center space-x-4 flex-1 justify-end">
                        <div className="text-right">
                          <h4 
                            className="text-lg font-bold"
                            style={{
                              background: 'linear-gradient(135deg, #1f2937, #374151)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          >
                            {prediction.homeTeam}
                          </h4>
                          <p className="text-sm text-gray-600 font-medium">Home</p>
                        </div>
                        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                          <img 
                            src={prediction.homelogo} 
                            alt={prediction.homeTeam} 
                            className="w-full h-full object-contain filter drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 hover:scale-110"
                            style={{
                              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15)) contrast(1.1) saturate(1.2)',
                              imageRendering: 'crisp-edges'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="w-16 h-16 flex items-center justify-center rounded-lg"
                            style={{
                              background: 'linear-gradient(135deg, rgb(239, 68, 68), rgb(245, 158, 11))',
                              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                              display: 'none'
                            }}
                          >
                            <i className="fas fa-football-ball text-white text-2xl"></i>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Prediction Reasoning */}
                    <div 
                      className="p-4 rounded-lg mb-4"
                      style={{
                        background: 'rgba(249, 250, 251, 0.8)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.5)'
                      }}
                    >
                      <h5 
                        className="text-sm font-bold mb-2"
                        style={{
                          background: 'linear-gradient(135deg, #1f2937, #374151)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      >
                        💭 Prediction Reasoning:
                      </h5>
                      <p className="text-sm text-gray-700 font-medium italic">"{prediction.reasoning}"</p>
                    </div>

                    {/* Prediction Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-heart text-red-500"></i>
                          <span className="text-sm font-medium">{prediction.likes} likes</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-comment text-blue-500"></i>
                          <span className="text-sm font-medium">{prediction.comments} comments</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span 
                          className="text-sm font-bold"
                          style={{
                            background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}
                        >
                          {prediction.points}
                        </span>
                        <button 
                          className="px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                          style={{
                            background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))',
                            color: 'white',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                          }}
                        >
                          <i className="fas fa-thumbs-up mr-2"></i>
                          Agree
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="text-center pt-6">
                <button 
                  className="px-8 py-4 text-white rounded-lg font-bold transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                  style={{
                    background: metallicGradient,
                    boxShadow: '0 4px 12px rgba(255, 46, 74, 0.3)'
                  }}
                >
                  <i className="fas fa-crystal-ball mr-2"></i>
                  Make Your Prediction
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Modal */}
      {showTopicsModal && selectedSection && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: 'blur(8px)' }}
          onClick={() => setShowTopicsModal(false)}
        >
          <div 
            className="rounded-lg shadow-2xl border max-w-4xl w-full max-h-[90vh] overflow-hidden"
            style={{
              background: glassEffect,
              backdropFilter: backdropBlur,
              WebkitBackdropFilter: backdropBlur,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              className="p-6 text-white"
              style={{
                background: selectedSection.color,
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <i 
                    className={`fas ${selectedSection.icon} text-2xl`}
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }}
                  ></i>
                  <div>
                    <h3 
                      className="text-2xl font-bold"
                      style={{
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      {selectedSection.name} - Hot Topics
                    </h3>
                    <p 
                      className="text-white/90"
                      style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                      }}
                    >
                      Browse all discussions in {selectedSection.description}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowTopicsModal(false)}
                  className="text-white hover:text-gray-200 transition-colors duration-200"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}
                >
                  <i className="fas fa-times text-2xl"></i>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                {hotTopicsData[selectedSection.id]?.map((topic, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-4 p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01]"
                    style={{
                      background: 'rgba(249, 250, 251, 0.8)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white border-opacity-30 flex-shrink-0">
                      <img 
                        src={userPhotos[Math.floor(Math.random() * userPhotos.length)]} 
                        alt="User avatar" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div 
                        className="w-full h-full flex items-center justify-center shadow-md"
                        style={{
                          background: selectedSection.color,
                          display: 'none'
                        }}
                      >
                        <i className="fas fa-user text-white text-sm"></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span 
                          className="font-bold text-sm"
                          style={{
                            background: 'linear-gradient(135deg, #1f2937, #374151)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}
                        >
                          {topic.user}
                        </span>
                        <span className="text-xs text-gray-500">• {Math.floor(Math.random() * 24) + 1}h ago</span>
                      </div>
                      <h4 className="text-gray-800 font-medium mb-2">{topic.topic}</h4>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-comment text-blue-500"></i>
                          <span className="text-gray-600 font-medium">{topic.replies} replies</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-heart text-red-500"></i>
                          <span className="text-gray-600 font-medium">{topic.reactions} reactions</span>
                        </div>
                        <span 
                          className="text-sm font-bold"
                          style={{
                            background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}
                        >
                          +{Math.floor(Math.random() * 30) + 10} points
                        </span>
                      </div>
                    </div>
                    <button 
                      className="px-3 py-1 text-xs rounded-md font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                      style={{
                        background: `linear-gradient(135deg, ${selectedSection.shadowColor}, ${selectedSection.shadowColor.replace('0.3', '0.4')})`,
                        color: selectedSection.color.includes('250, 204, 21') ? '#b45309' : 
                               selectedSection.color.includes('239, 68, 68') ? '#dc2626' :
                               selectedSection.color.includes('59, 130, 246') ? '#2563eb' :
                               selectedSection.color.includes('34, 197, 94') ? '#16a34a' :
                               selectedSection.color.includes('251, 146, 60') ? '#ea580c' :
                               selectedSection.color.includes('147, 51, 234') ? '#9333ea' :
                               selectedSection.color.includes('20, 184, 166') ? '#0d9488' :
                               selectedSection.color.includes('236, 72, 153') ? '#db2777' :
                               selectedSection.color.includes('99, 102, 241') ? '#6366f1' : '#059669',
                        border: `1px solid ${selectedSection.shadowColor.replace('0.3', '0.6')}`
                      }}
                    >
                      Join Discussion
                    </button>
                  </div>
                )) || []}
              </div>
              
              <div className="text-center mt-6">
                <button 
                  onClick={() => {
                    setShowTopicsModal(false);
                    setShowCreateTopicModal(true);
                  }}
                  className="px-6 py-3 text-white rounded-lg font-bold transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                  style={{
                    background: selectedSection.color,
                    boxShadow: `0 4px 12px ${selectedSection.shadowColor}`
                  }}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Start New Discussion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Topic Modal */}
      {showCreateTopicModal && selectedSection && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: 'blur(8px)' }}
          onClick={() => setShowCreateTopicModal(false)}
        >
          <div 
            className="rounded-lg shadow-2xl border max-w-2xl w-full overflow-hidden"
            style={{
              background: glassEffect,
              backdropFilter: backdropBlur,
              WebkitBackdropFilter: backdropBlur,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              className="p-6 text-white"
              style={{
                background: selectedSection.color,
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <i 
                    className={`fas ${selectedSection.icon} text-2xl`}
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }}
                  ></i>
                  <div>
                    <h3 
                      className="text-2xl font-bold"
                      style={{
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      Create New Topic
                    </h3>
                    <p 
                      className="text-white/90"
                      style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                      }}
                    >
                      Start a discussion in {selectedSection.name}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCreateTopicModal(false)}
                  className="text-white hover:text-gray-200 transition-colors duration-200"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}
                >
                  <i className="fas fa-times text-2xl"></i>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <form className="space-y-6">
                <div>
                  <label 
                    className="block text-sm font-bold mb-2"
                    style={{
                      background: 'linear-gradient(135deg, #1f2937, #374151)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    Topic Title
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter your discussion topic..."
                    className="w-full p-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2"
                    style={{
                      background: 'rgba(249, 250, 251, 0.9)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      focusRingColor: selectedSection.shadowColor
                    }}
                  />
                </div>
                
                <div>
                  <label 
                    className="block text-sm font-bold mb-2"
                    style={{
                      background: 'linear-gradient(135deg, #1f2937, #374151)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    Description
                  </label>
                  <textarea 
                    rows="4"
                    placeholder="Share your thoughts, ask questions, or start a debate..."
                    className="w-full p-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 resize-none"
                    style={{
                      background: 'rgba(249, 250, 251, 0.9)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      focusRingColor: selectedSection.shadowColor
                    }}
                  ></textarea>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg"
                    style={{
                      background: 'rgba(249, 250, 251, 0.8)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <i className="fas fa-plus-circle text-green-500"></i>
                    <span 
                      className="text-sm font-bold"
                      style={{
                        background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      +25 points for starting discussion
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button 
                      type="button"
                      onClick={() => setShowCreateTopicModal(false)}
                      className="px-4 py-2 text-gray-700 rounded-lg font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                      style={{
                        background: 'rgba(249, 250, 251, 0.9)',
                        border: '1px solid rgba(209, 213, 219, 0.5)'
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2 text-white rounded-lg font-bold transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                      style={{
                        background: selectedSection.color,
                        boxShadow: `0 4px 12px ${selectedSection.shadowColor}`
                      }}
                    >
                      <i className="fas fa-paper-plane mr-2"></i>
                      Create Topic
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheColosseum;
