import React, { useState, useEffect } from 'react';
import { teamService } from '../../services/teamService';

const TeamOutlook = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const teamsData = await teamService.getAllTeams();
        // Filter for only FBS and FCS teams and sort by school name
        const fbsAndFcsTeams = teamsData
          .filter(team => {
            const classification = team.classification?.toLowerCase();
            return classification === 'fbs' || classification === 'fcs';
          })
          .sort((a, b) => a.school.localeCompare(b.school));
        setTeams(fbsAndFcsTeams);
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Failed to load teams');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const getLocalLogoPath = (team, isDark = false) => {
    if (!team.school) return null;
    
    // Clean team name for file path - replace spaces and special chars with underscores
    const cleanTeamName = team.school
      .replace(/\s+/g, '_')           // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9_]/g, '_') // Replace special chars with underscores
      .replace(/_+/g, '_')            // Replace multiple underscores with single
      .replace(/^_|_$/g, '');         // Remove leading/trailing underscores
    
    const suffix = isDark ? '_dark' : '';
    return `/team_logos/${cleanTeamName}${suffix}.png`;
  };

  const handleImageError = (e, team) => {
    // Try the dark variant if primary fails
    const currentSrc = e.target.src;
    if (!currentSrc.includes('_dark.png')) {
      e.target.src = getLocalLogoPath(team, true);
    } else {
      // Hide image if both variants fail
      e.target.style.display = 'none';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 gradient-text">2025 Team Outlook</h1>
          <div className="bg-white rounded-xl p-12 shadow-lg">
            <i className="fas fa-spinner fa-spin text-6xl icon-gradient mb-6"></i>
            <p className="text-xl text-gray-600">Loading teams...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 gradient-text">2025 Team Outlook</h1>
          <div className="bg-white rounded-xl p-12 shadow-lg">
            <i className="fas fa-exclamation-triangle text-6xl text-red-500 mb-6"></i>
            <p className="text-xl text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 gradient-text">2025 Team Outlook</h1>
          <p className="text-xl text-gray-600 mb-4">
            FBS and FCS college football teams
          </p>
          <p className="text-lg text-gray-500">
            {teams.length} teams loaded
          </p>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            >
              {/* Team Logo */}
              <div className="flex justify-center mb-4">
                <img
                  src={getLocalLogoPath(team)}
                  alt={`${team.school} logo`}
                  className="w-16 h-16 object-contain metallic-3d-logo"
                  onError={(e) => handleImageError(e, team)}
                  loading="lazy"
                />
              </div>

              {/* Team Info */}
              <div className="text-center">
                <h3 className="font-bold text-gray-800 text-sm mb-1 group-hover:gradient-text transition-all duration-300">
                  {team.school}
                </h3>
                {team.mascot && (
                  <p className="text-xs text-gray-500 mb-2">{team.mascot}</p>
                )}
                {team.conference && (
                  <p className="text-xs text-gray-400">{team.conference}</p>
                )}
                {team.classification && (
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mt-2">
                    {team.classification.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {teams.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl p-12 shadow-lg">
              <i className="fas fa-search text-6xl icon-gradient mb-6"></i>
              <h2 className="text-3xl font-bold mb-4 text-gray-800">No FBS/FCS Teams Found</h2>
              <p className="text-xl text-gray-600">
                No FBS or FCS teams were found in the database.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamOutlook;
