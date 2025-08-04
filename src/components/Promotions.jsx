import React from 'react';
import { Gift, Zap, Star, Crown, Flame, Diamond } from 'lucide-react';

function Promotions() {
  const promotions = [
    {
      id: 1,
      title: 'Welcome to Hell',
      offer: '₹500',
      description: 'Ignite your journey with our devilish welcome bonus',
      icon: Gift,
      gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      glowColor: 'rgba(220, 38, 38, 0.4)',
      popular: true
    },
    {
      id: 2,
      title: 'Infernal Deposit',
      offer: '300%',
      description: 'Triple your deposits with our hellish multiplier',
      icon: Zap,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      glowColor: 'rgba(245, 158, 11, 0.4)',
      popular: false
    },
    {
      id: 3,
      title: 'Devil\'s Spins',
      offer: '20 Free',
      description: 'Spin the wheels of fortune without spending a soul',
      icon: Star,
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
      glowColor: 'rgba(124, 58, 237, 0.4)',
      popular: false
    }
  ];

  return (
    <section className="promotions">
      <div className="promotions-background">
        <div className="flame-particle flame-1">🔥</div>
        <div className="flame-particle flame-2">🔥</div>
        <div className="flame-particle flame-3">🔥</div>
        <div className="flame-particle flame-4">🔥</div>
      </div>
      
      <div className="promotions-container">
        <div className="promotions-header">
          <h2 className="gradient-text">🎁 Hellish Promotions</h2>
          <p className="promotions-subtitle">
            Claim your share of the underworld's most generous rewards
          </p>
        </div>
        
        <div className="promotions-grid">
          {promotions.map((promo, index) => {
            const IconComponent = promo.icon;
            return (
              <div key={promo.id} className={`promo-card ${promo.popular ? 'popular' : ''}`}>
                {promo.popular && (
                  <div className="popular-badge">
                    <Crown size={16} />
                    <span>Most Popular</span>
                  </div>
                )}
                
                <div className="promo-glow" style={{ background: promo.glowColor }}></div>
                
                <div className="promo-icon-wrapper">
                  <div className="promo-icon" style={{ background: promo.gradient }}>
                    <IconComponent size={40} color="white" />
                  </div>
                </div>
                
                <div className="promo-content">
                  <h3 className="promo-title">{promo.title}</h3>
                  <div className="promo-offer">{promo.offer}</div>
                  <p className="promo-description">{promo.description}</p>
                </div>
                
                <button className="btn btn-promo">
                  <Flame size={18} />
                  <span>Claim Now</span>
                </button>
                
                <div className="promo-background" style={{ background: promo.gradient }}></div>
              </div>
            );
          })}
        </div>
        
        <div className="promotions-footer">
          <div className="promo-stats">
            <div className="stat">
              <Diamond size={24} />
              <span>₹2.5L+ claimed today</span>
            </div>
            <div className="stat">
              <Star size={24} />
              <span>5000+ active promotions</span>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .promotions {
          padding: 6rem 0;
          background: #111111;
          position: relative;
          overflow: hidden;
        }
        
        .promotions-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }
        
        .flame-particle {
          position: absolute;
          font-size: 2rem;
          animation: float 4s ease-in-out infinite;
          opacity: 0.3;
        }
        
        .flame-1 {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }
        
        .flame-2 {
          top: 70%;
          left: 20%;
          animation-delay: 1s;
        }
        
        .flame-3 {
          top: 30%;
          right: 15%;
          animation-delay: 2s;
        }
        
        .flame-4 {
          top: 80%;
          right: 30%;
          animation-delay: 3s;
        }
        
        .promotions-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 2;
        }
        
        .promotions-header {
          text-align: center;
          margin-bottom: 4rem;
        }
        
        .promotions-header h2 {
          font-size: 3.5rem;
          font-weight: 900;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }
        
        .promotions-subtitle {
          font-size: 1.2rem;
          color: #888;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }
        
        .promotions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }
        
        .promo-card {
          position: relative;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 3rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        
        .promo-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.05) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 20px;
        }
        
        .promo-card:hover::before {
          opacity: 1;
        }
        
        .promo-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
          border-color: var(--primary-red);
        }
        
        .promo-card.popular {
          border-color: var(--primary-gold);
          background: rgba(245, 158, 11, 0.05);
        }
        
        .promo-card.popular:hover {
          border-color: var(--primary-gold);
          box-shadow: 0 25px 50px rgba(245, 158, 11, 0.3);
        }
        
        .popular-badge {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--gradient-gold);
          color: #000;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          z-index: 3;
        }
        
        .promo-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .promo-card:hover .promo-glow {
          opacity: 1;
        }
        
        .promo-icon-wrapper {
          position: relative;
          margin-bottom: 2rem;
          z-index: 2;
        }
        
        .promo-icon {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          position: relative;
          transition: all 0.3s ease;
        }
        
        .promo-card:hover .promo-icon {
          transform: scale(1.1) rotate(10deg);
        }
        
        .promo-content {
          position: relative;
          z-index: 2;
          margin-bottom: 2rem;
        }
        
        .promo-title {
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
        }
        
        .promo-offer {
          font-size: 3rem;
          font-weight: 900;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #ffffff 0%, var(--primary-red) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }
        
        .promo-description {
          color: #aaa;
          font-size: 1rem;
          line-height: 1.5;
        }
        
        .btn-promo {
          background: var(--gradient-primary);
          color: white;
          border: none;
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 700;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
          width: 100%;
        }
        
        .btn-promo:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(220, 38, 38, 0.4);
        }
        
        .promo-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.02;
          border-radius: 20px;
        }
        
        .promotions-footer {
          display: flex;
          justify-content: center;
        }
        
        .promo-stats {
          display: flex;
          gap: 3rem;
          align-items: center;
        }
        
        .stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-size: 1rem;
        }
        
        .stat svg {
          color: var(--primary-gold);
        }
        
        @media (max-width: 768px) {
          .promotions-container {
            padding: 0 1rem;
          }
          
          .promotions-header h2 {
            font-size: 2.5rem;
          }
          
          .promotions-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .promo-card {
            padding: 2rem;
          }
          
          .promo-offer {
            font-size: 2.5rem;
          }
          
          .promo-stats {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </section>
  );
}

export default Promotions;
