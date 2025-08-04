import React from 'react';

function Hero({ onJoin }) {
    // Instead of calling onJoin, let's dispatch a custom event
  const handleJoinClick = () => {
    // Dispatch custom event to open register modal
    window.dispatchEvent(new CustomEvent('openRegisterModal'));
  };

  return (
    <section className="hero">
      <div className="hero-background">
        <div className="hero-glow"></div>
        <div className="hero-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </div>
      
      <div className="hero-container">
        <div className="hero-content slide-up">
          <h1 className="hero-title gradient-text">
            Welcome to the
            <br />
            <span className="gradient-text-gold">Underworld's Premier Casino</span>
          </h1>
          <p className="hero-subtitle">
            Where devils dare to play and fortunes burn bright in the flames of chance
          </p>
          
          <div className="hero-stats">
            <div className="stat-card glass">
              <div className="stat-number gradient-text">₹50L+</div>
              <div className="stat-label">Won Today</div>
            </div>
            <div className="stat-card glass">
              <div className="stat-number gradient-text">5,000+</div>
              <div className="stat-label">Active Souls</div>
            </div>
            <div className="stat-card glass">
              <div className="stat-number gradient-text">98.5%</div>
              <div className="stat-label">RTP Rate</div>
            </div>
          </div>
          
          <button className="btn btn-gold hero-cta glow" onClick={onJoin}>
            <span>🔥 Ignite Your Fortune</span>
          </button>
        </div>
        
        <div className="hero-visual">
          <div className="floating-casino">
            <div className="floating-card float">
              <div className="card-inner">🃏</div>
            </div>
            <div className="floating-dice float-delay-1">
              <div className="dice-inner">🎲</div>
            </div>
            <div className="floating-coin float-delay-2">
              <div className="coin-inner">🪙</div>
            </div>
            <div className="floating-chip float">
              <div className="chip-inner">🎰</div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .hero {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
          display: flex;
          align-items: center;
          padding-top: 80px;
          position: relative;
          overflow: hidden;
        }
        
        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }
        
        .hero-glow {
          position: absolute;
          top: 20%;
          right: 20%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          animation: glow 4s ease-in-out infinite;
        }
        
        .hero-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: var(--primary-gold);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }
        
        .particle:nth-child(1) {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }
        
        .particle:nth-child(2) {
          top: 40%;
          left: 20%;
          animation-delay: 1s;
        }
        
        .particle:nth-child(3) {
          top: 60%;
          left: 80%;
          animation-delay: 2s;
        }
        
        .particle:nth-child(4) {
          top: 80%;
          left: 70%;
          animation-delay: 3s;
        }
        
        .particle:nth-child(5) {
          top: 30%;
          left: 90%;
          animation-delay: 4s;
        }
        
        .hero-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          gap: 4rem;
          position: relative;
          z-index: 2;
        }
        
        .hero-content {
          flex: 1;
        }
        
        .hero-title {
          font-size: 4.5rem;
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        
        .hero-subtitle {
          font-size: 1.4rem;
          color: #aaa;
          margin-bottom: 3rem;
          line-height: 1.6;
          max-width: 500px;
        }
        
        .hero-stats {
          display: flex;
          gap: 2rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }
        
        .stat-card {
          padding: 1.5rem;
          min-width: 140px;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.1);
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          font-size: 0.9rem;
          color: #888;
          font-weight: 500;
        }
        
        .hero-cta {
          font-size: 1.3rem;
          padding: 1.2rem 2.5rem;
          border-radius: 16px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: relative;
          overflow: hidden;
        }
        
        .hero-cta:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 15px 40px rgba(245, 158, 11, 0.6);
        }
        
        .hero-visual {
          flex: 1;
          position: relative;
          height: 500px;
        }
        
        .floating-casino {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .floating-card,
        .floating-dice,
        .floating-coin,
        .floating-chip {
          position: absolute;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        
        .floating-card {
          top: 10%;
          right: 20%;
        }
        
        .floating-dice {
          top: 50%;
          right: 10%;
        }
        
        .floating-coin {
          top: 70%;
          right: 40%;
        }
        
        .floating-chip {
          top: 30%;
          right: 60%;
        }
        
        .card-inner,
        .dice-inner,
        .coin-inner,
        .chip-inner {
          width: 80px;
          height: 80px;
          background: var(--glass-bg);
          backdrop-filter: blur(15px);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          transition: all 0.3s ease;
        }
        
        .floating-card:hover .card-inner,
        .floating-dice:hover .dice-inner,
        .floating-coin:hover .coin-inner,
        .floating-chip:hover .chip-inner {
          transform: scale(1.2) rotate(10deg);
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--primary-red);
          box-shadow: 0 0 30px rgba(220, 38, 38, 0.5);
        }
        
        @media (max-width: 768px) {
          .hero-container {
            flex-direction: column;
            text-align: center;
            padding: 0 1rem;
            gap: 2rem;
          }
          
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-subtitle {
            font-size: 1.1rem;
          }
          
          .hero-stats {
            justify-content: center;
            gap: 1rem;
          }
          
          .stat-card {
            min-width: 100px;
            padding: 1rem;
          }
          
          .hero-visual {
            height: 250px;
          }
          
          .card-inner,
          .dice-inner,
          .coin-inner,
          .chip-inner {
            width: 60px;
            height: 60px;
            font-size: 1.8rem;
          }
        }
      `}</style>
    </section>
  );
}

export default Hero;
