import React, { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import ApiService from '../services/api';

function Navbar({ showLogin, setShowLogin, onLogin }) {
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({
    loginId: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '+91',
    password: '',
    confirmPassword: '',
    referralCode: '',
    termsAccepted: false,
    privacyAccepted: false
  });

  // Forgot password state
  const [forgotPasswordData, setForgotPasswordData] = useState({
    identifier: ''
  });

  // Listen for register modal trigger from Hero button
  React.useEffect(() => {
    const handleOpenRegister = () => {
      console.log('🔥 Opening register modal from hero button!');
      setShowRegister(true);
      setShowLogin(false);
    };

    window.addEventListener('openRegisterModal', handleOpenRegister);
    
    return () => {
      window.removeEventListener('openRegisterModal', handleOpenRegister);
    };
  }, []);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await ApiService.login(loginData);
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onLogin(response.user);
        setShowLogin(false);
        setLoginData({ loginId: '', password: '' });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!registerData.termsAccepted || !registerData.privacyAccepted) {
      setError('You must accept Terms & Conditions and Privacy Policy');
      setLoading(false);
      return;
    }

    if (!registerData.phone.startsWith('+91') || registerData.phone.length !== 13) {
      setError('Please enter a valid Indian phone number with +91');
      setLoading(false);
      return;
    }

    try {
      const response = await ApiService.register(registerData);
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onLogin(response.user);
        setShowRegister(false);
        setRegisterData({
          name: '',
          username: '',
          email: '',
          phone: '+91',
          password: '',
          confirmPassword: '',
          referralCode: '',
          termsAccepted: false,
          privacyAccepted: false
        });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await ApiService.forgotPassword(forgotPasswordData.identifier);
      
      if (response.success) {
        alert('Password reset instructions sent!');
        setShowForgotPassword(false);
        setForgotPasswordData({ identifier: '' });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <h1 className="gradient-text-gold">🔥 Lucifer's Casino</h1>
            <span>Where Fortune Meets Fire</span>
          </div>
          <div className="nav-buttons">
            <button className="btn btn-outline" onClick={() => setShowLogin(true)}>
              Login
            </button>
            <button className="btn btn-primary" onClick={() => setShowRegister(true)}>
              Join Now
            </button>
          </div>
        </div>
      </nav>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="gradient-text">🔥 Welcome Back to Hell</h3>
              <button className="close-btn" onClick={() => setShowLogin(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleLogin} className="modal-form">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Email, Username, or Phone Number"
                  value={loginData.loginId}
                  onChange={(e) => setLoginData({...loginData, loginId: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <div className="password-field">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Entering Hell...' : 'Enter the Underworld'}
              </button>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="link-btn"
                  onClick={() => {
                    setShowLogin(false);
                    setShowForgotPassword(true);
                  }}
                >
                  Forgot Password?
                </button>
                <span> | </span>
                <button 
                  type="button" 
                  className="link-btn"
                  onClick={() => {
                    setShowLogin(false);
                    setShowRegister(true);
                  }}
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER MODAL */}
      {showRegister && (
        <div className="modal-overlay" onClick={() => setShowRegister(false)}>
          <div className="modal glass register-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="gradient-text">👹 Join the Underworld</h3>
              <button className="close-btn" onClick={() => setShowRegister(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleRegister} className="modal-form">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Username"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="tel"
                  placeholder="Phone Number (+91XXXXXXXXXX)"
                  value={registerData.phone}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (!value.startsWith('+91')) {
                      value = '+91' + value.replace(/^\+91/, '');
                    }
                    setRegisterData({...registerData, phone: value});
                  }}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Referral Code (Optional)"
                  value={registerData.referralCode}
                  onChange={(e) => setRegisterData({...registerData, referralCode: e.target.value})}
                />
              </div>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={registerData.termsAccepted}
                    onChange={(e) => setRegisterData({...registerData, termsAccepted: e.target.checked})}
                    required
                  />
                  <span>I agree to the Terms & Conditions</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={registerData.privacyAccepted}
                    onChange={(e) => setRegisterData({...registerData, privacyAccepted: e.target.checked})}
                    required
                  />
                  <span>I agree to the Privacy Policy</span>
                </label>
              </div>
              
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Claim Your 1000 Chips'}
              </button>
              
              <div className="modal-footer">
                <span>Already have an account? </span>
                <button 
                  type="button" 
                  className="link-btn"
                  onClick={() => {
                    setShowRegister(false);
                    setShowLogin(true);
                  }}
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="gradient-text">🔒 Forgot Password</h3>
              <button className="close-btn" onClick={() => setShowForgotPassword(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleForgotPassword} className="modal-form">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Enter Email, Username, or Phone Number"
                  value={forgotPasswordData.identifier}
                  onChange={(e) => setForgotPasswordData({identifier: e.target.value})}
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Sending...' : 'Reset Password'}
              </button>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="link-btn"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setShowLogin(true);
                  }}
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .register-modal {
          max-width: 500px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .checkbox-group {
          margin: 1rem 0;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: #ccc;
          cursor: pointer;
        }
        
        .checkbox-label input[type="checkbox"] {
          width: auto;
          margin: 0;
        }
        
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
        
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--glass-border);
          z-index: 1000;
          display: flex;
          align-items: center;
        }

        .nav-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo h1 {
          font-size: 1.8rem;
          font-weight: 800;
          margin: 0;
          line-height: 1;
        }

        .logo span {
          font-size: 0.85rem;
          color: #666;
          font-weight: 400;
        }

        .nav-buttons {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1rem;
        }

        .modal {
          width: 100%;
          max-width: 400px;
          padding: 0;
          overflow: hidden;
        }

        .modal-header {
          padding: 2rem 2rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--glass-border);
        }

        .modal-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--primary-red);
        }

        .modal-form {
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group input {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary-red);
          background: rgba(255, 255, 255, 0.1);
        }

        .password-field {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .password-toggle:hover {
          color: var(--primary-red);
        }

        .btn-full {
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
        }

        .modal-footer {
          text-align: center;
          color: #888;
          font-size: 0.9rem;
        }

        .link-btn {
          background: none;
          border: none;
          color: var(--primary-red);
          cursor: pointer;
          font-weight: 600;
          text-decoration: underline;
        }

        .link-btn:hover {
          color: #fff;
        }

        @media (max-width: 768px) {
          .nav-container {
            padding: 0 1rem;
          }
          
          .logo h1 {
            font-size: 1.4rem;
          }
          
          .logo span {
            font-size: 0.75rem;
          }
          
          .nav-buttons {
            gap: 0.75rem;
          }
        }
      `}</style>
    </>
  );
}

export default Navbar;
