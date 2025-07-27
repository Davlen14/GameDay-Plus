import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import usePreloader from './hooks/usePreloader';

// Layout Components (always loaded)
import Header from './components/layout/Header';
import Hero from './components/layout/Hero';  
import Features from './components/layout/Features';
import CTA from './components/layout/CTA';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Advanced Analytics Components
const Efficiency = React.lazy(() => import('./components/analytics/advanced/Efficiency'));
const Explosiveness = React.lazy(() => import('./components/analytics/advanced/Explosiveness'));
const Situational = React.lazy(() => import('./components/analytics/advanced/Situational'));
const DriveAnalysis = React.lazy(() => import('./components/analytics/advanced/DriveAnalysis'));
const PlayerImpact = React.lazy(() => import('./components/analytics/advanced/PlayerImpact'));
const Heatmaps = React.lazy(() => import('./components/analytics/advanced/Heatmaps'));

// Auth Components
const LoginPage = React.lazy(() => import('./components/auth/LoginPage'));

// Pricing Components
const PricingPage = React.lazy(() => import('./components/pricing/PricingPage'));

// Lazy load heavy components
const HomePageView = React.lazy(() => import('./components/layout/HomePageView'));
const AllTeams = React.lazy(() => import('./components/teams/AllTeams'));
const CompareTeamsView = React.lazy(() => import('./components/teams/CompareTeamsView'));
const TeamDetailView = React.lazy(() => import('./components/teams/TeamDetailView'));
const SEC = React.lazy(() => import('./components/teams/SEC'));
const BigTen = React.lazy(() => import('./components/teams/BigTen'));
const ACC = React.lazy(() => import('./components/teams/ACC'));
const Big12 = React.lazy(() => import('./components/teams/Big12'));
const TopReturningPlayers2025 = React.lazy(() => import('./components/news/TopReturningPlayers2025'));
const Pac12 = React.lazy(() => import('./components/teams/Pac12'));
const AmericanAthletic = React.lazy(() => import('./components/teams/AmericanAthletic'));
const ConferenceUSA = React.lazy(() => import('./components/teams/ConferenceUSA'));
const MidAmerican = React.lazy(() => import('./components/teams/MidAmerican'));
const MountainWest = React.lazy(() => import('./components/teams/MountainWest'));
const FBSIndependents = React.lazy(() => import('./components/teams/FBSIndependents'));
const TeamOutlook = React.lazy(() => import('./components/teams/TeamOutlook'));

// Analytics Components
const TeamMetrics = React.lazy(() => import('./components/analytics/TeamMetrics'));
const TeamAdvancedAnalytics = React.lazy(() => import('./components/analytics/TeamAdvancedAnalytics'));
const GamedayGPT = React.lazy(() => import('./components/analytics/GamedayGPT'));
const PlayerMetrics = React.lazy(() => import('./components/analytics/PlayerMetrics'));
const CoachOverview = React.lazy(() => import('./components/analytics/CoachOverview'));
const PlayerGrade = React.lazy(() => import('./components/analytics/PlayerGrade'));
const PredictOutcomes = React.lazy(() => import('./components/analytics/PredictOutcomes'));
const AskQuestions = React.lazy(() => import('./components/analytics/AskQuestions'));
const AIInsights = React.lazy(() => import('./components/analytics/AIInsights'));

// Stats Components
const PlayerStats = React.lazy(() => import('./components/stats/PlayerStats'));
const TeamStats = React.lazy(() => import('./components/stats/TeamStats'));

// Betting Components
const BettingModels = React.lazy(() => import('./components/betting/BettingModels'));
const SpreadAnalysis = React.lazy(() => import('./components/betting/SpreadAnalysis'));
const ArbitrageEV = React.lazy(() => import('./components/betting/ArbitrageEV'));
const OverUnderMetrics = React.lazy(() => import('./components/betting/OverUnderMetrics'));
const BettingSuggestions = React.lazy(() => import('./components/betting/BettingSuggestions'));

// News Components
const LatestNews = React.lazy(() => import('./components/news/LatestNews'));
const DraftNews = React.lazy(() => import('./components/news/DraftNews'));
const InjuryReports = React.lazy(() => import('./components/news/InjuryReports'));
const Rankings = React.lazy(() => import('./components/news/Rankings'));
const CoachingChanges = React.lazy(() => import('./components/news/CoachingChanges'));
const TopProspects = React.lazy(() => import('./components/news/TopProspects'));
const Commitments = React.lazy(() => import('./components/news/Commitments'));
const TransferPortal = React.lazy(() => import('./components/news/TransferPortal'));
const Videos = React.lazy(() => import('./components/news/Videos'));
const Highlights = React.lazy(() => import('./components/news/Highlights'));
const Analysis = React.lazy(() => import('./components/news/Analysis'));
const PressConferences = React.lazy(() => import('./components/news/PressConferences'));

// FanHub Components - NEW CONSOLIDATED 3-SECTION DESIGN
const FanHubCentral = React.lazy(() => import('./components/fanhub/FanHubCentral'));
const TheColosseum = React.lazy(() => import('./components/fanhub/TheColosseum'));
const FanProphecy = React.lazy(() => import('./components/fanhub/FanProphecy'));
const ForumSectionDetail = React.lazy(() => import('./components/fanhub/ForumSectionDetail'));

// Legacy FanHub Components (for compatibility)
const FanForums = React.lazy(() => import('./components/fanhub/FanForums'));
const FanPredictions = React.lazy(() => import('./components/fanhub/FanPredictions'));
const Polls = React.lazy(() => import('./components/fanhub/Polls'));
const SocialFeed = React.lazy(() => import('./components/fanhub/SocialFeed'));
const FanStats = React.lazy(() => import('./components/fanhub/FanStats'));

// Games Components
const Schedule = React.lazy(() => import('./components/games/Schedule'));
const Schedule2024Recap = React.lazy(() => import('./components/games/Schedule2024Recap'));
const GamePredictor = React.lazy(() => import('./components/games/GamePredictor'));
const LiveGames = React.lazy(() => import('./components/games/LiveGames'));
const GameDetailView = React.lazy(() => import('./components/games/GameDetailView'));

// Testing Component
const APITester = React.lazy(() => import('./components/APITester'));
const GraphQLDemo = React.lazy(() => import('./components/GraphQLDemo'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="xl" />
  </div>
);

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  
  // Initialize preloader
  usePreloader();

  useEffect(() => {
    // Initialize AOS with heavy performance optimizations
    const initAOS = () => {
      AOS.init({
        duration: 400,        // Faster animations
        once: true,           // Only animate once
        offset: 30,           // Earlier trigger
        easing: 'ease-out-quart',
        delay: 0,
        anchorPlacement: 'top-bottom',
        disable: window.innerWidth < 768, // Disable on mobile/tablet
        startEvent: 'DOMContentLoaded',
        useClassNames: false,
        disableMutationObserver: true,    // Disable for better performance
        debounceDelay: 100,   // Increased debounce
        throttleDelay: 150,   // Increased throttle
      });
    };

    // Defer AOS initialization
    if (document.readyState === 'complete') {
      setTimeout(initAOS, 100);
    } else {
      window.addEventListener('load', () => setTimeout(initAOS, 100));
    }

    // Lazy load particles.js only when needed
    const loadParticles = () => {
      if (!window.particlesJS && currentPage === 'home') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    };

    // Load particles only for home page
    if (currentPage === 'home') {
      setTimeout(loadParticles, 1000);
    }

    // Handle hash changes for simple routing
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        setCurrentPage(hash);
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Set initial page

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [currentPage]);

  const renderPage = () => {
    // Check for team detail routes (team-detail-{id})
    if (currentPage.startsWith('team-detail-')) {
      return (
        <Suspense fallback={<PageLoader />}>
          <TeamDetailView />
        </Suspense>
      );
    }
    
    // Check for team advanced analytics routes (team-advanced-analytics-{team-slug})
    if (currentPage.startsWith('team-advanced-analytics-')) {
      const teamSlug = currentPage.replace('team-advanced-analytics-', '');
      return (
        <Suspense fallback={<PageLoader />}>
          <TeamAdvancedAnalytics teamSlug={teamSlug} onNavigate={setCurrentPage} />
        </Suspense>
      );
    }
    
    // Check for game detail routes (game-detail-{id})
    if (currentPage.startsWith('game-detail-')) {
      const gameId = currentPage.split('-')[2];
      return (
        <Suspense fallback={<PageLoader />}>
          <GameDetailView gameId={gameId} />
        </Suspense>
      );
    }
    
    // Check for forum section detail routes (forum-section-{sectionId})
    if (currentPage.startsWith('forum-section-')) {
      const sectionId = currentPage.replace('forum-section-', '');
      return (
        <Suspense fallback={<PageLoader />}>
          <ForumSectionDetail sectionId={sectionId} />
        </Suspense>
      );
    }
    
    switch (currentPage) {
      // Launch/Main page route
      case 'home':
        return (
          <>
            <Hero />
            <Features />
            <CTA />
          </>
        );
      
      // Home page route
      case 'home-page':
        return (
          <Suspense fallback={<PageLoader />}>
            <HomePageView />
          </Suspense>
        );
      
      // Team routes
      case 'teams':
        return (
          <Suspense fallback={<PageLoader />}>
            <AllTeams />
          </Suspense>
        );
      case 'compare-teams':
        return (
          <Suspense fallback={<PageLoader />}>
            <CompareTeamsView />
          </Suspense>
        );
      case 'sec':
        return (
          <Suspense fallback={<PageLoader />}>
            <SEC />
          </Suspense>
        );
      case 'big-ten':
        return (
          <Suspense fallback={<PageLoader />}>
            <BigTen />
          </Suspense>
        );
      case 'acc':
        return <ACC />;
      case 'big-12':
        return <Big12 />;
      case 'pac-12':
        return <Pac12 />;
      case 'american-athletic':
        return <AmericanAthletic />;
      case 'conference-usa':
        return <ConferenceUSA />;
      case 'mid-american':
        return <MidAmerican />;
      case 'mountain-west':
        return <MountainWest />;
      case 'fbs-independents':
        return <FBSIndependents />;
      case 'team-outlook':
        return <TeamOutlook />;
      
      // Analytics routes
      case 'team-metrics':
        return <TeamMetrics onNavigate={setCurrentPage} />;
      case 'player-metrics':
        return <PlayerMetrics />;
      case 'coach-overview':
        return <CoachOverview />;
      case 'player-grade':
        return <PlayerGrade />;
      // Advanced Analytics routes
      case 'efficiency':
        return (
          <Suspense fallback={<PageLoader />}>
            <Efficiency />
          </Suspense>
        );
      case 'explosiveness':
        return (
          <Suspense fallback={<PageLoader />}>
            <Explosiveness />
          </Suspense>
        );
      case 'situational':
        return (
          <Suspense fallback={<PageLoader />}>
            <Situational />
          </Suspense>
        );
      case 'drive-analysis':
        return (
          <Suspense fallback={<PageLoader />}>
            <DriveAnalysis />
          </Suspense>
        );
      case 'player-impact':
        return (
          <Suspense fallback={<PageLoader />}>
            <PlayerImpact />
          </Suspense>
        );
      case 'heatmaps':
        return (
          <Suspense fallback={<PageLoader />}>
            <Heatmaps />
          </Suspense>
        );
      case 'player-stats':
        return (
          <Suspense fallback={<PageLoader />}>
            <PlayerStats />
          </Suspense>
        );
      case 'team-stats':
        return (
          <Suspense fallback={<PageLoader />}>
            <TeamStats />
          </Suspense>
        );
      case 'gameday-gpt':
        return <GamedayGPT />;
      case 'predict-outcomes':
        return <PredictOutcomes />;
      case 'ask-questions':
        return <AskQuestions />;
      case 'ai-insights':
        return <AIInsights />;
      
      // Betting routes
      case 'betting-models':
        return <BettingModels />;
      case 'spread-analysis':
        return <SpreadAnalysis />;
      case 'arbitrage-ev':
        return <ArbitrageEV />;
      case 'over-under-metrics':
        return <OverUnderMetrics />;
      case 'betting-suggestions':
        return <BettingSuggestions />;
      
      // News routes
      case 'latest-news':
        return <LatestNews />;
      case 'draft-news':
        return <DraftNews />;
      case 'injury-reports':
        return <InjuryReports />;
      case 'rankings':
        return <Rankings />;
      case 'coaching-changes':
        return <CoachingChanges />;
      case 'top-prospects':
        return <TopProspects />;
      case 'commitments':
        return <Commitments />;
      case 'transfer-portal':
        return <TransferPortal />;
      case 'videos':
        return <Videos />;
      case 'highlights':
        return <Highlights />;
      case 'analysis':
        return <Analysis />;
      case 'press-conferences':
        return <PressConferences />;
      
      // FanHub routes - NEW CONSOLIDATED 3-SECTION DESIGN
      case 'fanhub-central':
        return <FanHubCentral />;
      case 'the-colosseum':
        return <TheColosseum />;
      case 'fan-prophecy':
        return <FanProphecy />;
      
      // Legacy FanHub routes (for compatibility)
      case 'fan-forums':
        return <FanForums />;
      case 'predictions':
        return <FanPredictions />;
      case 'polls':
        return <Polls />;
      case 'social-feed':
        return <SocialFeed />;
      case 'fan-stats':
        return <FanStats />;
      
      // Games routes
      case 'schedule':
        return <Schedule />;
      case 'schedule-2024-recap':
        return <Schedule2024Recap />;
      case 'game-predictor':
        return <GamePredictor />;
      case 'live-games':
        return <LiveGames />;
      case 'game-detail':
        return <GameDetailView />;
      
      // Testing route
      case 'api-tester':
        return <APITester />;
      case 'graphql-demo':
        return <GraphQLDemo />;

      // Auth route
      case 'login':
        return (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        );
      
      // Pricing route
      case 'pricing':
        return (
          <Suspense fallback={<PageLoader />}>
            <PricingPage />
          </Suspense>
        );
      
      default:
        return (
          <>
            <Hero />
            <Features />
            <CTA />
          </>
        );
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* All routes with header/footer */}
          <Route path="/*" element={
            <>
              <Header />
              <main className="pt-16">
                {renderPage()}
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
