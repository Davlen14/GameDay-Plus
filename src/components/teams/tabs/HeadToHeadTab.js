import React from 'react';

const HeadToHeadTab = ({ team1, team2 }) => {
  return (
    <div className="relative z-10 flex items-center justify-center h-full">
      <div className="text-center py-20">
        <div className="relative mb-8">
          {/* Outer glass ring */}
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl mx-auto"></div>
          {/* Inner glass container */}
          <div className="relative w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center mx-auto">
            <i className="fas fa-fist-raised text-gray-400 text-3xl"></i>
          </div>
        </div>
        
        <h3 className="text-4xl font-black mb-4 gradient-text">
          Head to Head
        </h3>
        <p className="text-xl text-gray-600 font-light mb-8">
          Direct matchup history between {team1?.school} and {team2?.school}
        </p>
        <div className="inline-flex items-center space-x-4 px-8 py-4 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2)]">
          <i className="fas fa-graduation-cap text-gray-600"></i>
          <span className="text-lg font-bold gradient-text">Under Development</span>
        </div>
      </div>
    </div>
  );
};

export default HeadToHeadTab;
