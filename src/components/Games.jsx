import React from 'react';

function Games() {
  const games = [
    {
      id: 1,
      name: 'Fire Joker',
      category: 'Slots',
      emoji: '🔥',
      players: '2.1K',
      hot: true,
      gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
    },
    {
      id: 2,
      name: 'Lightning Roulette',
      category: 'Live Casino',
      emoji: '⚡',
      players: '856',
      hot: false,
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
    },
    {
      id: 3,
      name: 'Blackjack VIP',
      category: 'Table Games',
      emoji: '🃏',
      players: '1.3K',
      hot: false,
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
    },
    {
      id: 4,
      name: 'Mega Fortune',
      category: 'Jackpots',
      emoji: '💎',
      players: '945',
      hot: true,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      id: 5,
      name: 'Dragon Tiger',
      category: 'Live Casino',
      emoji: '🐉',
      players: '687',
      hot: false,
      gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
    },
    {
      id: 6,
      name: 'Sweet Bonanza',
      category: 'Slots',
      emoji: '🍭',
      players: '1.8K',
      hot: true,
      gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
    }
  ];

  return (
    <section className="games">
      <div className="games-container">
        <div className="games-header">
          <h2 className="gradient-text">🎮 Popular Games</h2>
          <p className="games-subtitle">
            Choose your weapon of fortune from our hellish collection
          </p>
        </div>
        
        <div className="games-grid">
          {games.map((game, index) => (
            <div key={game.id} className={`game-card glass-card stagger-item hover-lift`}>
              {game.hot && (
                <div className="hot-badge">
                  <span>🔥 HOT</span>
                </div>
              )}
              
              <div className="game-icon" style={{ background: game.gradient }}>
                <span className="game-emoji">{game.emoji}</span>
              </div>
              
              <div className="game-info">
                <h3 className="game-title">{game.name}</h3>
                <p className="game-category">{game.category}</p>
                <div className="game-players">
                  <span>👥 {game.players} playing</span>
                </div>
              </div>
              
              <div className="game-actions">
                <button className="btn btn-outline btn-small">
                  Demo
                </button>
                <button className="btn btn-primary btn-small">
                  Play Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .games {
          padding: 6rem 0;
          background: #111111;
          position: relative;
        }
        
        .games::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 50%);
        }
        
        .games-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 2;
        }
        
        .games-header {
          text-align: center;
          margin-bottom: 4rem;
        }
        
        .games-header h2 {
          font-size: 3.5rem;
          font-weight: 900;
          margin-bottom: 1rem;
        }
        
        .games-subtitle {
          font-size: 1.2rem;
          color: #888;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
        }
        
        .game-card {
          position: relative;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .game-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(220, 38, 38, 0.1) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 16px;
        }
        
        .game-card:hover::before {
          opacity: 1;
        }
        
        .game-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .hot-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: var(--gradient-gold);
          color: #000;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          z-index: 3;
        }
        
        .game-icon {
          width: 100px;
          height: 100px;
          margin: 0 auto 1.5rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .game-icon::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.1);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .game-card:hover .game-icon::before {
          opacity: 1;
        }
        
        .game-emoji {
          font-size: 3rem;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }
        
        .game-title {
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: white;
        }
        
        .game-category {
          color: #888;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
        
        .game-players {
          color: #666;
          font-size: 0.85rem;
          margin-bottom: 2rem;
        }
        
        .game-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        
        .btn-small {
          padding: 0.6rem 1.2rem;
          font-size: 0.85rem;
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
        
        @media (max-width: 768px) {
          .games-container {
            padding: 0 1rem;
          }
          
          .games-header h2 {
            font-size: 2.5rem;
          }
          
          .games-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .game-card {
            padding: 1.5rem;
          }
          
          .game-icon {
            width: 80px;
            height: 80px;
          }
          
          .game-emoji {
            font-size: 2.5rem;
          }
          
          .game-actions {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </section>
  );
}

export default Games;
