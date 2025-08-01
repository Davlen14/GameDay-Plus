import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChartHoverModal = ({ 
  isVisible, 
  position, 
  data, 
  team, 
  onViewDetails 
}) => {
  if (!isVisible || !data) return null;

  const { 
    chartType, 
    label, 
    value, 
    games = [], 
    year,
    category,
    additionalInfo = {}
  } = data;

  const getModalContent = () => {
    switch (chartType) {
      case 'yearly':
        return {
          title: `${team.school} - ${year} Season`,
          subtitle: `${games.length} games analyzed`,
          mainStat: `${value.toFixed(1)}% ATS`,
          details: [
            { label: 'ATS Record', value: `${additionalInfo.wins || 0}-${additionalInfo.losses || 0}-${additionalInfo.pushes || 0}` },
            { label: 'Total Games', value: games.length },
            { label: 'Win Rate', value: `${value.toFixed(1)}%` },
            { label: 'ROI', value: `${(additionalInfo.roi || 0).toFixed(1)}%` }
          ]
        };
      
      case 'spreadCategory':
        return {
          title: `${team.school} - ${label}`,
          subtitle: `Spread range analysis`,
          mainStat: `${value.toFixed(1)}% ATS`,
          details: [
            { label: 'Category', value: label },
            { label: 'Games in Range', value: games.length },
            { label: 'ATS Win %', value: `${value.toFixed(1)}%` },
            { label: 'Average Spread', value: `${(additionalInfo.avgSpread || 0).toFixed(1)}` }
          ]
        };
      
      case 'homeAway':
        return {
          title: `${team.school} - ${label}`,
          subtitle: `Location-based performance`,
          mainStat: `${value.toFixed(1)}% ATS`,
          details: [
            { label: 'Location', value: label.includes('Home') ? 'Home Games' : 'Away Games' },
            { label: 'Games Played', value: games.length },
            { label: 'ATS Win %', value: `${value.toFixed(1)}%` },
            { label: 'Point Differential', value: `${(additionalInfo.avgMargin || 0).toFixed(1)}` }
          ]
        };
      
      case 'radar':
        return {
          title: `${team.school} - ${label}`,
          subtitle: `Situational analysis`,
          mainStat: `${value.toFixed(1)}% ATS`,
          details: [
            { label: 'Situation', value: label },
            { label: 'Sample Size', value: games.length },
            { label: 'ATS Win %', value: `${value.toFixed(1)}%` },
            { label: 'Confidence', value: games.length > 10 ? 'High' : games.length > 5 ? 'Medium' : 'Low' }
          ]
        };
      
      default:
        return {
          title: `${team.school}`,
          subtitle: `ATS Performance`,
          mainStat: `${value.toFixed(1)}%`,
          details: [
            { label: 'Games', value: games.length },
            { label: 'Performance', value: `${value.toFixed(1)}%` }
          ]
        };
    }
  };

  const content = getModalContent();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="fixed z-40 pointer-events-none"
        style={{
          left: Math.min(position.x + 10, window.innerWidth - 320),
          top: Math.max(position.y - 10, 10)
        }}
      >
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 max-w-sm pointer-events-auto">
          {/* Header */}
          <div className="border-b border-gray-100 pb-3 mb-3">
            <h3 className="font-bold text-gray-900 text-sm">{content.title}</h3>
            <p className="text-xs text-gray-500">{content.subtitle}</p>
          </div>

          {/* Main Stat */}
          <div className="text-center mb-3">
            <div className="text-2xl font-bold text-blue-600">{content.mainStat}</div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            {content.details.map((detail, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-gray-600">{detail.label}:</span>
                <span className="font-medium text-gray-900">{detail.value}</span>
              </div>
            ))}
          </div>

          {/* View Details Button */}
          {games.length > 0 && onViewDetails && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => onViewDetails(data)}
                className="w-full text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-3 rounded-md transition-colors"
              >
                View All {games.length} Games →
              </button>
            </div>
          )}

          {/* Pointer Arrow */}
          <div className="absolute -bottom-2 left-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
          <div className="absolute -bottom-3 left-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-200"></div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChartHoverModal;
