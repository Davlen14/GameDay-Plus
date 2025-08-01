import React, { useState, useRef, useCallback } from 'react';
import { Line, Bar, Radar } from 'react-chartjs-2';

const InteractiveChart = ({ 
  type = 'line', 
  data, 
  options = {}, 
  gamesData = {}, 
  team,
  team2, // Add team2 prop
  onHover,
  onGameDetails,
  className = ""
}) => {
  const [hoverData, setHoverData] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const chartRef = useRef(null);

  // Enhanced chart options with hover capabilities
  const enhancedOptions = {
    ...options,
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    onHover: (event, elements) => {
      if (elements && elements.length > 0) {
        const element = elements[0];
        const chart = chartRef.current;
        
        if (chart) {
          const datasetIndex = element.datasetIndex;
          const index = element.index;
          const dataset = data.datasets[datasetIndex];
          const label = data.labels[index];
          const value = dataset.data[index];
          
          // Get mouse position relative to viewport
          const rect = chart.canvas.getBoundingClientRect();
          const mouseX = event.native?.clientX || rect.left + element.element.x;
          const mouseY = event.native?.clientY || rect.top + element.element.y;
          
          setMousePosition({ x: mouseX, y: mouseY });
          
          // Prepare hover data based on chart type
          const hoverInfo = prepareHoverData(type, label, value, datasetIndex, index, dataset, gamesData);
          hoverInfo.chartType = type; // Ensure chart type is set
          setHoverData(hoverInfo);
          
          if (onHover) {
            onHover(hoverInfo, { x: mouseX, y: mouseY });
          }
        }
      } else {
        setHoverData(null);
        if (onHover) {
          onHover(null);
        }
      }
    },
    onClick: (event, elements) => {
      if (elements && elements.length > 0 && onGameDetails) {
        const element = elements[0];
        const datasetIndex = element.datasetIndex;
        const index = element.index;
        const dataset = data.datasets[datasetIndex];
        const label = data.labels[index];
        const value = dataset.data[index];
        
        const clickData = prepareHoverData(type, label, value, datasetIndex, index, dataset, gamesData);
        clickData.chartType = type; // Ensure chart type is set
        onGameDetails(clickData);
      }
    },
    plugins: {
      ...options.plugins,
      tooltip: {
        ...options.plugins?.tooltip,
        enabled: false // Disable default tooltips since we're using custom modals
      },
      legend: {
        ...options.plugins?.legend,
        onHover: (event, legendItem, legend) => {
          // Custom legend hover behavior
          legend.chart.canvas.style.cursor = 'pointer';
        },
        onLeave: (event, legendItem, legend) => {
          legend.chart.canvas.style.cursor = 'default';
        }
      }
    }
  };

  const prepareHoverData = (chartType, label, value, datasetIndex, index, dataset, gamesData) => {
    // Determine which team's data to use based on dataset index
    const isTeam1 = datasetIndex === 0;
    const teamData = isTeam1 ? gamesData.team1 : gamesData.team2;
    const currentTeam = isTeam1 ? team : team2;
    
    const baseData = {
      chartType,
      label,
      value,
      team: currentTeam,
      games: [],
      additionalInfo: {}
    };

    if (!teamData) {
      return baseData;
    }

    switch (chartType) {
      case 'yearly':
        const year = parseInt(label);
        baseData.year = year;
        baseData.games = teamData.yearlyGames?.[year] || [];
        break;
        
      case 'spreadCategory':
        const categoryMap = {
          'Small (0-3.5)': 'small',
          'Medium (4-7)': 'medium', 
          'Large (7.5-14)': 'large',
          'Huge (14+)': 'huge'
        };
        const categoryKey = categoryMap[label];
        baseData.category = categoryKey;
        baseData.games = teamData.spreadCategoryGames?.[categoryKey] || [];
        break;
        
      case 'homeAway':
        const isHome = label.includes('Home');
        baseData.games = teamData.homeAwayGames?.[isHome ? 'home' : 'away'] || [];
        break;
        
      case 'radar':
        const radarMap = {
          'Home': { type: 'home', games: teamData.homeAwayGames?.home || [] },
          'Away': { type: 'away', games: teamData.homeAwayGames?.away || [] },
          'Favorite': { type: 'favorite', games: teamData.favoriteUnderdogGames?.favorite || [] },
          'Underdog': { type: 'underdog', games: teamData.favoriteUnderdogGames?.underdog || [] },
          'Small Spreads': { type: 'small', games: teamData.spreadCategoryGames?.small || [] },
          'Large Spreads': { type: 'large', games: teamData.spreadCategoryGames?.large || [] }
        };
        const radarData = radarMap[label];
        if (radarData) {
          baseData.games = radarData.games;
          baseData.category = radarData.type;
        }
        break;
    }

    return baseData;
  };

  // Render the appropriate chart type
  const renderChart = () => {
    const commonProps = {
      ref: chartRef,
      data,
      options: enhancedOptions,
      className
    };

    switch (type) {
      case 'line':
        return <Line {...commonProps} />;
      case 'bar':
        return <Bar {...commonProps} />;
      case 'radar':
        return <Radar {...commonProps} />;
      default:
        return <Line {...commonProps} />;
    }
  };

  return (
    <div className="relative w-full h-full">
      {renderChart()}
    </div>
  );
};

export default InteractiveChart;
