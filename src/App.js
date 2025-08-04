import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import Wallet from './pages/Wallet';
import Settings from './pages/Settings';
import ApiService from './services/api';
import './styles/globals.css';

function App() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0); // Start with 0, will load from API

  // Check for existing user session and load balance
  useEffect(() => {
    const loadUserSession = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('🔥 App: Found existing user session:', parsedUser);
          setUser(parsedUser);
          
          // Fetch latest balance from backend
          const balanceResponse = await ApiService.getBalance();
          if (balanceResponse.success) {
            setBalance(balanceResponse.balance);
            console.log('🔥 App: Loaded balance from API:', balanceResponse.balance);
          } else {
            // Fallback to stored balance
            setBalance(parsedUser.chipBalance || 1000);
          }
        } catch (error) {
          console.error('🔥 App: Error loading session:', error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setBalance(0);
        }
      }
    };

    loadUserSession();
  }, []);

  // Update balance when user changes
  useEffect(() => {
    if (user && user.chipBalance) {
      setBalance(user.chipBalance);
    }
  }, [user]);

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/" 
            element={<Home setUser={setUser} />} 
          />
          <Route 
            path="/dashboard" 
            element={
              <Dashboard 
                user={user} 
                setUser={setUser} 
                balance={balance} 
                setBalance={setBalance}
              />
            } 
          />
          <Route 
            path="/account" 
            element={
              <Account 
                user={user} 
                setUser={setUser} 
                balance={balance} 
                setBalance={setBalance}
              />
            } 
          />
          <Route 
            path="/wallet" 
            element={
              <Wallet 
                user={user} 
                setUser={setUser} 
                balance={balance} 
                setBalance={setBalance}
              />
            } 
          />
          <Route 
            path="/settings" 
            element={
              <Settings 
                user={user} 
                setUser={setUser} 
                balance={balance} 
                setBalance={setBalance}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
