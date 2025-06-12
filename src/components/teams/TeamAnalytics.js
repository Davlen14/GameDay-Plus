import React from 'react';

const TeamAnalytics = ({ team }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 40px',
      minHeight: '400px',
      background: 'linear-gradient(135deg, rgba(14, 25, 47, 0.95) 0%, rgba(25, 39, 66, 0.95) 100%)',
      borderRadius: '20px',
      border: '1px solid rgba(79, 172, 254, 0.2)',
      backdropFilter: 'blur(20px)',
      boxShadow: `
        0 20px 40px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(79, 172, 254, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '15%',
        width: '80px',
        height: '80px',
        background: 'radial-gradient(circle, rgba(79, 172, 254, 0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite',
        filter: 'blur(2px)'
      }} />
      
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '20%',
        width: '60px',
        height: '60px',
        background: 'radial-gradient(circle, rgba(255, 107, 107, 0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 4s ease-in-out infinite reverse',
        filter: 'blur(1px)'
      }} />

      {/* Analytics icon */}
      <div style={{
        marginBottom: '30px',
        position: 'relative'
      }}>
        <i 
          className="fas fa-chart-line" 
          style={{
            fontSize: '80px',
            color: '#4FACFE',
            filter: 'drop-shadow(0 0 20px rgba(79, 172, 254, 0.5))',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
      </div>

      {/* Coming Soon text */}
      <h2 style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textAlign: 'center',
        marginBottom: '20px',
        letterSpacing: '2px',
        textShadow: '0 0 30px rgba(79, 172, 254, 0.3)'
      }}>
        ANALYTICS
      </h2>

      <h3 style={{
        fontSize: '1.8rem',
        fontWeight: '600',
        color: '#FFB347',
        textAlign: 'center',
        marginBottom: '25px',
        letterSpacing: '1px',
        filter: 'drop-shadow(0 0 10px rgba(255, 179, 71, 0.3))'
      }}>
        Coming Soon
      </h3>

      {/* Description */}
      <p style={{
        fontSize: '1.1rem',
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: '1.8',
        maxWidth: '600px',
        marginBottom: '30px',
        fontWeight: '400'
      }}>
        {team ? (
          `We're building comprehensive analytics for ${team.school}. Get ready for advanced statistics, performance metrics, trend analysis, and data-driven insights that will revolutionize how you understand college football.`
        ) : (
          "We're building comprehensive analytics for college football teams. Get ready for advanced statistics, performance metrics, trend analysis, and data-driven insights."
        )}
      </p>

      {/* Features preview */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '15px',
        marginTop: '20px'
      }}>
        {[
          { icon: 'fa-chart-bar', text: 'Performance Metrics' },
          { icon: 'fa-chart-line', text: 'Trend Analysis' },
          { icon: 'fa-bullseye', text: 'Advanced Stats' },
          { icon: 'fa-brain', text: 'AI Insights' }
        ].map((feature, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(79, 172, 254, 0.1)',
            borderRadius: '20px',
            border: '1px solid rgba(79, 172, 254, 0.2)',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem',
            fontWeight: '500',
            animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
          }}>
            <i className={`fas ${feature.icon}`} style={{ color: '#4FACFE' }} />
            {feature.text}
          </div>
        ))}
      </div>

      {/* Additional CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default TeamAnalytics;
