const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: '🔥 Lucifer\'s Casino Backend is Working!',
    port: process.env.PORT || 3001,
    timestamp: new Date().toISOString()
  });
});

// Test auth routes (no database needed)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple test login
  if (email === 'test@test.com' && password === 'password') {
    res.json({
      success: true,
      message: 'Login successful!',
      token: 'test-token-123',
      user: { name: 'Test Player', balance: 5000 }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  
  res.json({
    success: true,
    message: 'Registration successful!',
    token: 'test-token-123',
    user: { name: username, balance: 1000 }
  });
});

const PORT = process.env.PORT || 3001; // Changed from 5000 to 3001
app.listen(PORT, () => {
  console.log(`
🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
🔥                                🔥
🔥  LUCIFER'S CASINO BACKEND     🔥
🔥        IS ONLINE!             🔥
🔥                                🔥
🔥    Server running on port ${PORT}   🔥
🔥                                🔥
🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  `);
});
