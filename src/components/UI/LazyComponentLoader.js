import React, { Suspense, lazy } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Lazy load components with loading fallbacks
const createLazyComponent = (importFn, fallback = <LoadingSpinner />) => {
  const Component = lazy(importFn);
  
  return React.forwardRef((props, ref) => (
    <Suspense fallback={fallback}>
      <Component {...props} ref={ref} />
    </Suspense>
  ));
};

// Custom loading states for different components
const GameCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="w-16 h-4 bg-gray-200 rounded"></div>
      <div className="w-12 h-4 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

const TeamCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
    <div className="flex items-center space-x-4 mb-6">
      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
      <div>
        <div className="w-32 h-6 bg-gray-200 rounded mb-2"></div>
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="w-full h-4 bg-gray-200 rounded"></div>
      <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
      <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const PageSkeleton = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="w-96 h-12 bg-gray-200 rounded mx-auto mb-4"></div>
        <div className="w-64 h-6 bg-gray-200 rounded mx-auto"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);

// Lazy loaded components with appropriate skeletons
export const LazySchedule = createLazyComponent(
  () => import('../games/Schedule'),
  <PageSkeleton />
);

export const LazyGameDetailView = createLazyComponent(
  () => import('../games/GameDetailView'),
  <PageSkeleton />
);

export const LazyTeamDetailView = createLazyComponent(
  () => import('../teams/TeamDetailView'),
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <TeamCardSkeleton />
  </div>
);

export const LazyGamePredictor = createLazyComponent(
  () => import('../games/GamePredictor'),
  <PageSkeleton />
);

export const LazyArbitrageEV = createLazyComponent(
  () => import('../betting/ArbitrageEV'),
  <PageSkeleton />
);

export const LazyGraphQLDemo = createLazyComponent(
  () => import('../GraphQLDemo'),
  <PageSkeleton />
);

export const LazyHomePageView = createLazyComponent(
  () => import('../layout/HomePageView'),
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
    <LoadingSpinner size="xl" />
  </div>
);

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload home page component
  import('../layout/HomePageView');
  
  // Preload schedule after a delay
  setTimeout(() => {
    import('../games/Schedule');
  }, 2000);
  
  // Preload game predictor after longer delay
  setTimeout(() => {
    import('../games/GamePredictor');
  }, 4000);
};

export { GameCardSkeleton, TeamCardSkeleton, PageSkeleton };
