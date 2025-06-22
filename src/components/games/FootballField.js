import React, { useEffect, useState } from 'react';

const FootballField = ({ homeTeam, awayTeam }) => {
  const [animateField, setAnimateField] = useState(false);

  // Get team data with fallbacks to Whitmer
  const getHomeTeamData = () => {
    if (homeTeam) {
      return {
        name: homeTeam.school || 'WHITMER',
        logo: homeTeam.logos?.[0] || '/photos/Whitmer.png',
        primaryColor: homeTeam.color || '#cc001c',
        secondaryColor: homeTeam.alternateColor || '#a10014'
      };
    }
    return {
      name: 'WHITMER',
      logo: '/photos/Whitmer.png',
      primaryColor: '#cc001c',
      secondaryColor: '#a10014'
    };
  };

  const getAwayTeamData = () => {
    if (awayTeam) {
      return {
        name: awayTeam.school || 'OPPONENT',
        logo: awayTeam.logos?.[0] || '/photos/ncaaf.png',
        primaryColor: awayTeam.color || '#3b82f6',
        secondaryColor: awayTeam.alternateColor || '#1e40af'
      };
    }
    return {
      name: 'OPPONENT',
      logo: '/photos/ncaaf.png',
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af'
    };
  };

  const homeData = getHomeTeamData();
  const awayData = getAwayTeamData();

  // Convert hex to RGB for CSS
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 204, g: 0, b: 28 };
  };

  const homeRgb = hexToRgb(homeData.primaryColor);
  const awayRgb = hexToRgb(awayData.primaryColor);
  const homeColorRgb = `${homeRgb.r}, ${homeRgb.g}, ${homeRgb.b}`;
  const awayColorRgb = `${awayRgb.r}, ${awayRgb.g}, ${awayRgb.b}`;

  useEffect(() => {
    const timer = setTimeout(() => setAnimateField(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-6 lg:p-8" style={{
      fontFamily: 'Titillium Web, sans-serif'
    }}>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&family=Titillium+Web:wght@200;300;400;600;700;900&display=swap');

        .football-field {
          position: relative;
          border: 2px solid #ffffff;
          border-radius: 6px;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.3),
            0 10px 20px rgba(0, 0, 0, 0.2),
            inset 0 0 0 1px rgba(255, 255, 255, 0.1);
          display: flex;
          width: 100%;
          max-width: 1200px;
          min-width: 320px;
          aspect-ratio: 2.2 / 1;
          z-index: 1;
          backdrop-filter: blur(5px);
          overflow: hidden;
          transform: perspective(1000px) rotateX(2deg);
          transform-style: preserve-3d;
          transition: all 0.8s ease-out;
          opacity: ${animateField ? '1' : '0'};
          transform: ${animateField ? 'perspective(1000px) rotateX(2deg) scale(1)' : 'perspective(1000px) rotateX(2deg) scale(0.9)'};
        }

        @media (max-width: 768px) {
          .football-field {
            border: 1px solid #ffffff;
            border-radius: 4px;
            box-shadow: 
              0 10px 20px rgba(0, 0, 0, 0.25),
              0 5px 10px rgba(0, 0, 0, 0.15),
              inset 0 0 0 1px rgba(255, 255, 255, 0.08);
          }
        }

        @media (max-width: 480px) {
          .football-field {
            aspect-ratio: 2 / 1;
            transform: perspective(800px) rotateX(1deg);
            transform: ${animateField ? 'perspective(800px) rotateX(1deg) scale(1)' : 'perspective(800px) rotateX(1deg) scale(0.95)'};
          }
        }

        .endzone {
          flex-shrink: 0;
          width: 15%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          box-shadow: 
            inset 0 0 20px rgba(0, 0, 0, 0.4),
            inset 0 0 0 1px rgba(255, 255, 255, 0.05);
        }

        @media (max-width: 768px) {
          .endzone {
            width: 12%;
            box-shadow: 
              inset 0 0 15px rgba(0, 0, 0, 0.35),
              inset 0 0 0 1px rgba(255, 255, 255, 0.04);
          }
        }

        .away-endzone {
          background: 
            linear-gradient(135deg, rgba(${awayColorRgb}, 0.9) 0%, rgba(${awayColorRgb}, 0.7) 50%, rgba(${awayColorRgb}, 0.9) 100%),
            repeating-linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.02) 2%,
              transparent 4%
            );
        }

        .home-endzone {
          background: 
            linear-gradient(135deg, rgba(${homeColorRgb}, 0.9) 0%, rgba(${homeColorRgb}, 0.7) 50%, rgba(${homeColorRgb}, 0.9) 100%),
            repeating-linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.02) 2%,
              transparent 4%
            );
        }

        .main-field {
          flex-grow: 1;
          position: relative;
          overflow: hidden;
          background: 
            repeating-linear-gradient(
              90deg,
              #1a5a1f 0%,
              #1a5a1f 9.5%,
              #2d7532 9.5%,
              #2d7532 10%,
              #238529 10%,
              #238529 19.5%,
              #1f6b25 19.5%,
              #1f6b25 20%
            ),
            repeating-linear-gradient(
              0deg,
              transparent 0%,
              rgba(255, 255, 255, 0.01) 1px,
              transparent 2px,
              rgba(0, 0, 0, 0.01) 3px,
              transparent 4px
            );
        }
        
        .main-field::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.15) 0%,
              rgba(255, 255, 255, 0.08) 30%,
              rgba(0, 0, 0, 0.05) 70%,
              rgba(0, 0, 0, 0.1) 100%
            ),
            repeating-linear-gradient(
              45deg,
              transparent 0%,
              rgba(255, 255, 255, 0.008) 1px,
              transparent 2px
            );
          pointer-events: none;
          z-index: 1;
        }
        
        .main-field::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.015) 0%,
            rgba(255, 255, 255, 0.015) 10%,
            rgba(0, 0, 0, 0.015) 10%,
            rgba(0, 0, 0, 0.015) 20%
          );
          pointer-events: none;
          z-index: 2;
        }

        .endzone-text {
          font-family: "Orbitron", sans-serif;
          font-size: clamp(1.2rem, 3.5vw, 3.5rem);
          font-weight: 700;
          text-align: center;
          white-space: nowrap;
          transform: rotate(90deg);
          position: absolute;
          letter-spacing: clamp(0.05rem, 0.2vw, 0.1rem);
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        @media (max-width: 768px) {
          .endzone-text {
            font-size: clamp(1rem, 3vw, 2.5rem);
            letter-spacing: clamp(0.03rem, 0.15vw, 0.08rem);
          }
        }

        @media (max-width: 480px) {
          .endzone-text {
            font-size: clamp(0.8rem, 2.5vw, 2rem);
            letter-spacing: clamp(0.02rem, 0.1vw, 0.06rem);
          }
        }

        .away-text {
          color: ${awayData.secondaryColor};
          text-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.6),
            0 2px 4px rgba(0, 0, 0, 0.4),
            0 0 20px rgba(${awayColorRgb}, 0.4),
            0 0 40px rgba(${awayColorRgb}, 0.2);
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) rotate(-90deg);
        }

        .home-text {
          color: ${homeData.secondaryColor};
          text-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.6),
            0 2px 4px rgba(0, 0, 0, 0.4),
            0 0 20px rgba(${homeColorRgb}, 0.4),
            0 0 40px rgba(${homeColorRgb}, 0.2);
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) rotate(90deg);
        }

        .yard-line {
          position: absolute;
          width: clamp(2px, 0.5vw, 4px);
          height: 100%;
          background: 
            linear-gradient(to bottom, 
              rgba(255, 255, 255, 0.95) 0%, 
              rgba(255, 255, 255, 1) 50%, 
              rgba(255, 255, 255, 0.95) 100%
            );
          top: 0;
          box-shadow: 
            0 0 6px rgba(255, 255, 255, 0.6),
            inset 0 0 2px rgba(255, 255, 255, 0.8),
            2px 0 4px rgba(0, 0, 0, 0.1);
          z-index: 5;
          border-radius: 1px;
        }

        .yard-line.fifty {
          width: clamp(3px, 0.7vw, 6px);
          background: 
            linear-gradient(to bottom, 
              rgba(255, 255, 255, 1) 0%, 
              rgba(255, 255, 255, 1) 100%
            );
          box-shadow: 
            0 0 12px rgba(255, 255, 255, 0.8),
            inset 0 0 3px rgba(255, 255, 255, 0.9),
            3px 0 6px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .yard-line {
            width: 2px;
            box-shadow: 
              0 0 4px rgba(255, 255, 255, 0.5),
              inset 0 0 1px rgba(255, 255, 255, 0.7),
              1px 0 2px rgba(0, 0, 0, 0.08);
          }

          .yard-line.fifty {
            width: 3px;
            box-shadow: 
              0 0 8px rgba(255, 255, 255, 0.7),
              inset 0 0 2px rgba(255, 255, 255, 0.8),
              2px 0 4px rgba(0, 0, 0, 0.12);
          }
        }

        .yard-number {
          position: absolute;
          color: #ffffff;
          font-family: "Orbitron", sans-serif;
          font-weight: 700;
          font-size: clamp(0.6rem, 1.8vw, 1.6rem);
          user-select: none;
          text-shadow: 
            0 3px 6px rgba(0, 0, 0, 0.7),
            0 1px 3px rgba(0, 0, 0, 0.5),
            0 0 10px rgba(255, 255, 255, 0.3),
            0 0 20px rgba(255, 255, 255, 0.1);
          letter-spacing: clamp(0.03rem, 0.1vw, 0.08rem);
          z-index: 6;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
        }

        @media (max-width: 768px) {
          .yard-number {
            font-size: clamp(0.5rem, 1.5vw, 1.2rem);
            letter-spacing: clamp(0.02rem, 0.08vw, 0.06rem);
            text-shadow: 
              0 2px 4px rgba(0, 0, 0, 0.6),
              0 1px 2px rgba(0, 0, 0, 0.4),
              0 0 8px rgba(255, 255, 255, 0.25);
          }
        }

        @media (max-width: 480px) {
          .yard-number {
            font-size: clamp(0.4rem, 1.2vw, 1rem);
            letter-spacing: clamp(0.01rem, 0.06vw, 0.04rem);
          }
        }

        .yard-number.top {
          top: clamp(8%, 2vw, 10%);
        }

        .yard-number.bottom {
          bottom: clamp(8%, 2vw, 10%);
          transform: rotate(180deg);
        }

        .center-logo {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: clamp(80px, 20vw, 320px);
          height: clamp(80px, 20vw, 320px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
        }

        @media (max-width: 768px) {
          .center-logo {
            width: clamp(60px, 18vw, 250px);
            height: clamp(60px, 18vw, 250px);
            filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25));
          }
        }

        @media (max-width: 480px) {
          .center-logo {
            width: clamp(50px, 16vw, 200px);
            height: clamp(50px, 16vw, 200px);
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
          }
        }

        .center-logo img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          filter: 
            drop-shadow(0 6px 12px rgba(0, 0, 0, 0.5))
            drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3))
            drop-shadow(0 0 20px rgba(255, 255, 255, 0.1))
            brightness(1.05)
            contrast(1.1)
            saturate(1.2);
          z-index: 11;
          transition: transform 0.5s ease-out;
          transform: ${animateField ? 'scale(1)' : 'scale(0.8)'};
        }

        @media (max-width: 768px) {
          .center-logo img {
            filter: 
              drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))
              drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25))
              drop-shadow(0 0 15px rgba(255, 255, 255, 0.08))
              brightness(1.03)
              contrast(1.08)
              saturate(1.15);
          }
        }

        .field-lighting {
          position: absolute;
          top: -10%;
          left: -5%;
          right: -5%;
          bottom: -10%;
          background: 
            radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.1) 0%, transparent 60%),
            linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.05) 100%);
          z-index: 0;
          pointer-events: none;
        }
        
        .field-shadow {
          position: absolute;
          bottom: -8px;
          left: 8px;
          right: 8px;
          height: 12px;
          background: 
            linear-gradient(to right, 
              transparent 0%, 
              rgba(0, 0, 0, 0.1) 10%, 
              rgba(0, 0, 0, 0.15) 50%, 
              rgba(0, 0, 0, 0.1) 90%, 
              transparent 100%
            );
          border-radius: 50%;
          filter: blur(3px);
          z-index: -1;
        }

        @media (max-width: 768px) {
          .field-shadow {
            bottom: -6px;
            left: 6px;
            right: 6px;
            height: 8px;
            filter: blur(2px);
          }
        }

        @media (max-width: 480px) {
          .field-shadow {
            bottom: -4px;
            left: 4px;
            right: 4px;
            height: 6px;
            filter: blur(1.5px);
          }
        }

        .hash-mark {
          position: absolute;
          width: clamp(1px, 0.3vw, 2px);
          height: 100%;
          background: rgba(255, 255, 255, 0.4);
          top: 0;
          z-index: 3;
        }

        @media (max-width: 768px) {
          .hash-mark {
            width: 1px;
            background: rgba(255, 255, 255, 0.3);
          }
        }

        @keyframes fieldEntrance {
          from {
            opacity: 0;
            transform: perspective(1000px) rotateX(5deg) scale(0.9);
          }
          to {
            opacity: 1;
            transform: perspective(1000px) rotateX(2deg) scale(1);
          }
        }
      `}</style>

      <div className="football-field">
        {/* Away Team End Zone */}
        <div className="endzone away-endzone">
          <span className="endzone-text away-text">{awayData.name}</span>
        </div>

        {/* Main Field */}
        <div className="main-field" id="mainField">
            {/* Field Lighting */}
            <div className="field-lighting"></div>
            
            {/* Yard Lines */}
            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(yardMark => {
              const percentage = yardMark / 100;
              let displayNum;
              if (yardMark === 50) {
                displayNum = 50;
              } else if (yardMark < 50) {
                displayNum = yardMark;
              } else {
                displayNum = 100 - yardMark;
              }

              return (
                <div key={yardMark}>
                  <div 
                    className={`yard-line ${yardMark === 50 ? 'fifty' : ''}`}
                    style={{ left: `${percentage * 100}%` }}
                  />
                  <span 
                    className="yard-number top"
                    style={{ left: `${percentage * 100}%`, transform: 'translateX(-50%)' }}
                  >
                    {displayNum}
                  </span>
                  <span 
                    className="yard-number bottom"
                    style={{ left: `${percentage * 100}%`, transform: 'translateX(-50%) rotate(180deg)' }}
                  >
                    {displayNum}
                  </span>
                </div>
              );
            })}

            {/* Hash Marks */}
            {[15, 25, 35, 45, 55, 65, 75, 85, 95].map(hashMark => (
              <div 
                key={hashMark}
                className="hash-mark"
                style={{ left: `${(hashMark / 100) * 100}%` }}
              />
            ))}

            {/* Home Team Logo in Center */}
            <div className="center-logo">
              <img
                src={homeData.logo}
                alt={`${homeData.name} logo`}
                onError={(e) => { e.target.src = '/photos/Whitmer.png'; }}
              />
            </div>
          </div>

        {/* Home Team End Zone */}
        <div className="endzone home-endzone">
          <span className="endzone-text home-text">{homeData.name}</span>
        </div>

        {/* Field Shadow */}
        <div className="field-shadow"></div>
      </div>
    </div>
  );
};

export default FootballField;
