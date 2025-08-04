import React from 'react';
import { Mail, Phone, MapPin, Twitter, Facebook, Instagram, Youtube, Crown, Shield, Award, Users } from 'lucide-react';

function Footer() {
  const footerLinks = {
    casino: [
      { name: 'Live Casino', href: '#' },
      { name: 'Slots', href: '#' },
      { name: 'Table Games', href: '#' },
      { name: 'Jackpots', href: '#' },
      { name: 'Sports Betting', href: '#' }
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Live Chat', href: '#' },
      { name: 'Contact Us', href: '#' },
      { name: 'FAQ', href: '#' },
      { name: 'Responsible Gaming', href: '#' }
    ],
    legal: [
      { name: 'Terms & Conditions', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Bonus Terms', href: '#' },
      { name: 'AML Policy', href: '#' },
      { name: 'Licenses', href: '#' }
    ]
  };

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#', color: '#1DA1F2' },
    { name: 'Facebook', icon: Facebook, href: '#', color: '#1877F2' },
    { name: 'Instagram', icon: Instagram, href: '#', color: '#E4405F' },
    { name: 'YouTube', icon: Youtube, href: '#', color: '#FF0000' }
  ];

  const achievements = [
    { icon: Crown, text: 'Licensed by MGA', color: '#f59e0b' },
    { icon: Shield, text: 'SSL Secured', color: '#10b981' },
    { icon: Award, text: 'Casino of the Year', color: '#8b5cf6' },
    { icon: Users, text: '1M+ Players', color: '#dc2626' }
  ];

  return (
    <footer className="footer">
      <div className="footer-background">
        <div className="footer-glow footer-glow-1"></div>
        <div className="footer-glow footer-glow-2"></div>
        <div className="footer-flame">🔥</div>
        <div className="footer-flame footer-flame-2">🔥</div>
        <div className="footer-flame footer-flame-3">🔥</div>
      </div>
      
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          <div className="footer-brand">
            <div className="brand-logo">
              <h3 className="gradient-text-gold">🔥 Lucifer's Casino</h3>
              <p className="brand-tagline">Where Fortune Meets Fire</p>
            </div>
            <p className="brand-description">
              Experience the ultimate thrill of online gaming in the underworld's most prestigious casino. 
              Where every spin ignites fortune and every bet burns with possibility.
            </p>
            <div className="social-links">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a key={index} href={social.href} className="social-link">
                    <IconComponent size={20} />
                  </a>
                );
              })}
            </div>
          </div>
          
          <div className="footer-links">
            <div className="link-group">
              <h4>🎰 Casino</h4>
              <ul>
                {footerLinks.casino.map((link, index) => (
                  <li key={index}>
                    <a href={link.href}>{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="link-group">
              <h4>🔥 Support</h4>
              <ul>
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <a href={link.href}>{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="link-group">
              <h4>📜 Legal</h4>
              <ul>
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a href={link.href}>{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="footer-contact">
            <h4>👹 Contact Hell</h4>
            <div className="contact-info">
              <div className="contact-item">
                <Mail size={18} />
                <span>support@luciferscasino.com</span>
              </div>
              <div className="contact-item">
                <Phone size={18} />
                <span>+1 (666) 666-6666</span>
              </div>
              <div className="contact-item">
                <MapPin size={18} />
                <span>9th Circle, Underworld</span>
              </div>
            </div>
            
            <div className="newsletter">
              <h5>🔥 Hell's Newsletter</h5>
              <div className="newsletter-form">
                <input type="email" placeholder="Your soul's email..." />
                <button className="btn btn-primary">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Achievements Section */}
        <div className="footer-achievements">
          <h4>🏆 Our Infernal Achievements</h4>
          <div className="achievements-grid">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <div key={index} className="achievement-item">
                  <div className="achievement-icon" style={{ color: achievement.color }}>
                    <IconComponent size={24} />
                  </div>
                  <span>{achievement.text}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; 2025 Lucifer's Casino. All rights reserved in Hell and Earth.</p>
              <p className="disclaimer">
                Please gamble responsibly. This site is operated by the Underworld Gaming Authority.
              </p>
            </div>
            <div className="footer-badges">
              <div className="badge">18+</div>
              <div className="badge">🛡️ Secure</div>
              <div className="badge">🎰 Licensed</div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .footer {
          background: #000000;
          position: relative;
          overflow: hidden;
          border-top: 1px solid #333;
        }
        
        .footer-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }
        
        .footer-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.1;
        }
        
        .footer-glow-1 {
          width: 400px;
          height: 400px;
          background: var(--primary-red);
          top: -200px;
          left: -200px;
        }
        
        .footer-glow-2 {
          width: 300px;
          height: 300px;
          background: var(--primary-gold);
          bottom: -150px;
          right: -150px;
        }
        
        .footer-flame {
          position: absolute;
          font-size: 1.5rem;
          opacity: 0.2;
          animation: float 6s ease-in-out infinite;
        }
        
        .footer-flame:nth-child(3) {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }
        
        .footer-flame-2 {
          top: 60%;
          right: 20%;
          animation-delay: 2s;
        }
        
        .footer-flame-3 {
          bottom: 30%;
          left: 30%;
          animation-delay: 4s;
        }
        
        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 4rem 2rem 2rem;
          position: relative;
          z-index: 2;
        }
        
        .footer-main {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }
        
        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .brand-logo h3 {
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }
        
        .brand-tagline {
          color: #666;
          font-size: 0.9rem;
          font-style: italic;
        }
        
        .brand-description {
          color: #888;
          line-height: 1.6;
          font-size: 0.95rem;
        }
        
        .social-links {
          display: flex;
          gap: 1rem;
        }
        
        .social-link {
          width: 40px;
          height: 40px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #888;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        
        .social-link:hover {
          background: var(--primary-red);
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(220, 38, 38, 0.3);
        }
        
        .footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        
        .link-group h4 {
          color: var(--primary-red);
          margin-bottom: 1rem;
          font-size: 1.1rem;
          font-weight: 700;
        }
        
        .link-group ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .link-group ul li a {
          color: #888;
          text-decoration: none;
          transition: color 0.3s ease;
          font-size: 0.95rem;
        }
        
        .link-group ul li a:hover {
          color: var(--primary-red);
        }
        
        .footer-contact h4 {
          color: var(--primary-red);
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
          font-weight: 700;
        }
        
        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #888;
          font-size: 0.95rem;
        }
        
        .contact-item svg {
          color: var(--primary-red);
        }
        
        .newsletter h5 {
          color: #ccc;
          margin-bottom: 1rem;
          font-size: 1rem;
        }
        
        .newsletter-form {
          display: flex;
          gap: 0.5rem;
        }
        
        .newsletter-form input {
          flex: 1;
          padding: 0.75rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          color: white;
          font-size: 0.9rem;
        }
        
        .newsletter-form input:focus {
          outline: none;
          border-color: var(--primary-red);
        }
        
        .newsletter-form button {
          padding: 0.75rem 1.5rem;
          font-size: 0.9rem;
        }
        
        .footer-achievements {
          margin-bottom: 3rem;
          padding: 2rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
        }
        
        .footer-achievements h4 {
          color: var(--primary-gold);
          margin-bottom: 1.5rem;
          text-align: center;
          font-size: 1.3rem;
          font-weight: 700;
        }
        
        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        
        .achievement-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .achievement-item:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
        }
        
        .achievement-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .achievement-item span {
          color: #ccc;
          font-weight: 600;
          font-size: 0.95rem;
        }
        
        .footer-bottom {
          border-top: 1px solid #333;
          padding-top: 2rem;
        }
        
        .footer-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .copyright p {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        
        .disclaimer {
          font-size: 0.8rem !important;
          color: #555 !important;
        }
        
        .footer-badges {
          display: flex;
          gap: 1rem;
        }
        
        .badge {
          padding: 0.5rem 1rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          color: #ccc;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        @media (max-width: 768px) {
          .footer-container {
            padding: 2rem 1rem;
          }
          
          .footer-main {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .footer-links {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .achievements-grid {
            grid-template-columns: 1fr;
          }
          
          .footer-bottom-content {
            flex-direction: column;
            text-align: center;
          }
          
          .newsletter-form {
            flex-direction: column;
          }
        }
      `}</style>
    </footer>
  );
}

export default Footer;
