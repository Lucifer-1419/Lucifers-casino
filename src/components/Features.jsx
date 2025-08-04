import React from 'react';
import { Shield, Zap, Trophy, Crown, Star, Lock, Users, TrendingUp } from 'lucide-react';

function Features() {
  const features = [
    {
      id: 1,
      icon: Shield,
      title: 'Fortress Security',
      description: 'Bank-level encryption guards your soul and coins',
      color: 'var(--primary-red)',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
    },
    {
      id: 2,
      icon: Zap,
      title: 'Lightning Withdrawals',
      description: 'Get your winnings faster than Lucifer\'s wrath',
      color: 'var(--primary-gold)',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      id: 3,
      icon: Trophy,
      title: '98.5% RTP',
      description: 'Highest payout rates in all nine circles',
      color: '#7c3aed',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
    },
    {
      id: 4,
      icon: Crown,
      title: 'VIP Underworld',
      description: 'Exclusive bonuses for our most devoted souls',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      id: 5,
      icon: Star,
      title: 'Provably Fair',
      description: 'Every game outcome is cryptographically verified',
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
    },
    {
      id: 6,
      icon: Lock,
      title: 'KYC Protected',
      description: 'Your identity is safer than heaven\'s gates',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      id: 7,
      icon: Users,
      title: '24/7 Hell Support',
      description: 'Our demons are always ready to assist',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    },
    {
      id: 8,
      icon: TrendingUp,
      title: 'Progressive Jackpots',
      description: 'Pools that grow hotter than hellfire',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    }
  ];

  return (
    <section className="features">
      <div className="features-background">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>
      
      <div className="features-container">
        <div className="features-header">
          <h2 className="gradient-text">👑 Why Choose Lucifer's Casino?</h2>
          <p className="features-subtitle">
            Experience the ultimate in hellish hospitality and devilish advantages
          </p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={feature.id} className={`feature-card glass-card stagger-item hover-lift`}>
                <div className="feature-icon-wrapper">
                  <div className="feature-icon" style={{ background: feature.gradient }}>
                    <IconComponent size={32} color="white" />
                  </div>
                  <div className="icon-glow" style={{ background: feature.color, opacity: 0.2 }}></div>
                </div>
                
                <div className="feature-content">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
                
                <div className="feature-hover-effect" style={{ background: feature.gradient }}></div>
              </div>
            );
          })}
        </div>
      </div>
      
      <style jsx>{`
        .features {
          padding: 6rem 0;
          background: #0a0a0a;
          position: relative;
          overflow: hidden;
        }
        
        .features-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }
        
        .floating-orb {
          position: absolute;
          border-radius: 50%;
          animation: float 8s ease-in-out infinite;
        }
        
        .orb-1 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(220, 38, 38, 0.1) 0%, transparent 70%);
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }
        
        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%);
          top: 60%;
          right: 10%;
          animation-delay: 2s;
        }
        
        .orb-3 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%);
          top: 30%;
          right: 30%;
          animation-delay: 4s;
        }
        
        .features-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 2;
        }
        
        .features-header {
          text-align: center;
          margin-bottom: 4rem;
        }
        
        .features-header h2 {
          font-size: 3.5rem;
          font-weight: 900;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }
        
        .features-subtitle {
          font-size: 1.2rem;
          color: #888;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .feature-card {
          position: relative;
          padding: 2.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.05) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 16px;
        }
        
        .feature-card:hover::before {
          opacity: 1;
        }
        
        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .feature-icon-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 1.5rem;
        }
        
        .feature-icon {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          position: relative;
          z-index: 2;
          transition: all 0.3s ease;
        }
        
        .feature-card:hover .feature-icon {
          transform: scale(1.1) rotate(5deg);
        }
        
        .icon-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          border-radius: 50%;
          filter: blur(20px);
          z-index: 1;
          transition: all 0.3s ease;
        }
        
        .feature-card:hover .icon-glow {
          opacity: 0.4 !important;
          transform: translate(-50%, -50%) scale(1.2);
        }
        
        .feature-content {
          position: relative;
          z-index: 2;
        }
        
        .feature-title {
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
          transition: color 0.3s ease;
        }
        
        .feature-description {
          color: #aaa;
          font-size: 0.95rem;
          line-height: 1.6;
          transition: color 0.3s ease;
        }
        
        .feature-card:hover .feature-title {
          color: white;
        }
        
        .feature-card:hover .feature-description {
          color: #ccc;
        }
        
        .feature-hover-effect {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 16px;
        }
        
        .feature-card:hover .feature-hover-effect {
          opacity: 0.05;
        }
        
        .stagger-item {
          opacity: 0;
          animation: slideUp 0.8s ease-out forwards;
        }
        
        .stagger-item:nth-child(1) { animation-delay: 0.1s; }
        .stagger-item:nth-child(2) { animation-delay: 0.2s; }
        .stagger-item:nth-child(3) { animation-delay: 0.3s; }
        .stagger-item:nth-child(4) { animation-delay: 0.4s; }
        .stagger-item:nth-child(5) { animation-delay: 0.5s; }
        .stagger-item:nth-child(6) { animation-delay: 0.6s; }
        .stagger-item:nth-child(7) { animation-delay: 0.7s; }
        .stagger-item:nth-child(8) { animation-delay: 0.8s; }
        
        @media (max-width: 768px) {
          .features-container {
            padding: 0 1rem;
          }
          
          .features-header h2 {
            font-size: 2.5rem;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .feature-card {
            padding: 2rem;
          }
          
          .feature-icon {
            width: 70px;
            height: 70px;
          }
        }
      `}</style>
    </section>
  );
}

export default Features;
