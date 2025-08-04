import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Games from '../components/Games';
import Features from '../components/Features';
import Promotions from '../components/Promotions';
import Footer from '../components/Footer';

function Home({ setUser }) {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const user = JSON.parse(userData);
      setUser(user);
      navigate('/dashboard');
    }
  }, [setUser, navigate]);

  // This function will be called from Navbar when login/register succeeds
  const handleLogin = (userData) => {
    setUser(userData);
    navigate('/dashboard');
  };

  // For the hero "Start Your Journey" button - should open register modal
  const handleJoinClick = () => {
    setShowLogin(false); // Make sure login modal is closed
    // We need to trigger the register modal from Navbar
    // Let's pass a state to Navbar to handle this
  };

  return (
    <div className="home">
      <Navbar 
        showLogin={showLogin}
        setShowLogin={setShowLogin}
        onLogin={handleLogin} // This passes the real user data
      />
      <Hero onJoin={handleJoinClick} /> {/* This should open register modal */}
      <Games />
      <Features />
      <Promotions />
      <Footer />
    </div>
  );
}

export default Home;
