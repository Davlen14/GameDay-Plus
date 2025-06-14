import React, { useEffect, useState } from 'react';
import './App.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Layout Components
import Header from './components/layout/Header';
import Hero from './components/layout/Hero';  
import Features from './components/layout/Features';
import CTA from './components/layout/CTA';
import Footer from './components/layout/Footer';
import HomePageView from './components/layout/HomePageView';

// Team Components
import AllTeams from './components/teams/AllTeams';
import TeamDetailView from './components/teams/TeamDetailView';
import SEC from './components/teams/SEC';
import BigTen from './components/teams/BigTen';
import ACC from './components/teams/ACC';
import Big12 from './components/teams/Big12';
import Pac12 from './components/teams/Pac12';
import AmericanAthletic from './components/teams/AmericanAthletic';
import ConferenceUSA from './components/teams/ConferenceUSA';
import MidAmerican from './components/teams/MidAmerican';
import MountainWest from './components/teams/MountainWest';
import FBSIndependents from './components/teams/FBSIndependents';
import TeamOutlook from './components/teams/TeamOutlook';

// Analytics Components
import TeamMetrics from './components/analytics/TeamMetrics';
import GamedayGPT from './components/analytics/GamedayGPT';
import PlayerMetrics from './components/analytics/PlayerMetrics';
import CoachOverview from './components/analytics/CoachOverview';
import PlayerGrade from './components/analytics/PlayerGrade';
import PredictOutcomes from './components/analytics/PredictOutcomes';
import AskQuestions from './components/analytics/AskQuestions';
import AIInsights from './components/analytics/AIInsights';

// Betting Components
import BettingModels from './components/betting/BettingModels';
import SpreadAnalysis from './components/betting/SpreadAnalysis';
import ArbitrageEV from './components/betting/ArbitrageEV';
import OverUnderMetrics from './components/betting/OverUnderMetrics';
import BettingSuggestions from './components/betting/BettingSuggestions';

// News Components
import LatestNews from './components/news/LatestNews';
import DraftNews from './components/news/DraftNews';
import InjuryReports from './components/news/InjuryReports';
import Rankings from './components/news/Rankings';
import CoachingChanges from './components/news/CoachingChanges';
import TopProspects from './components/news/TopProspects';
import Commitments from './components/news/Commitments';
import TransferPortal from './components/news/TransferPortal';
import Videos from './components/news/Videos';
import Highlights from './components/news/Highlights';
import Analysis from './components/news/Analysis';
import PressConferences from './components/news/PressConferences';

// FanHub Components
import FanForums from './components/fanhub/FanForums';
import FanPredictions from './components/fanhub/FanPredictions';
import Polls from './components/fanhub/Polls';
import SocialFeed from './components/fanhub/SocialFeed';
import FanStats from './components/fanhub/FanStats';

// Games Components
import Schedule from './components/games/Schedule';
import Schedule2024Recap from './components/games/Schedule2024Recap';
import GamePredictor from './components/games/GamePredictor';
import LiveGames from './components/games/LiveGames';
import GameDetailView from './components/games/GameDetailView';

// Testing Component
import APITester from './components/APITester';
import GraphQLDemo from './components/GraphQLDemo';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });

    // Load particles.js script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
    script.async = true;
    document.body.appendChild(script);

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
  }, []);

  const renderPage = () => {
    // Check for team detail routes (team-detail-{id})
    if (currentPage.startsWith('team-detail-')) {
      return <TeamDetailView />;
    }
    
    // Check for game detail routes (game-detail-{id})
    if (currentPage.startsWith('game-detail-')) {
      const gameId = currentPage.split('-')[2];
      return <GameDetailView gameId={gameId} />;
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
        return <HomePageView />;
      
      // Team routes
      case 'teams':
        return <AllTeams />;
      case 'sec':
        return <SEC />;
      case 'big-ten':
        return <BigTen />;
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
        return <TeamMetrics />;
      case 'player-metrics':
        return <PlayerMetrics />;
      case 'coach-overview':
        return <CoachOverview />;
      case 'player-grade':
        return <PlayerGrade />;
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
      
      // FanHub routes
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
    <div className="App">
      <Header />
      <main className="pt-16">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
