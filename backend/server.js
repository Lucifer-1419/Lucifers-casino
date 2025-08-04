const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/auth');
const gameRoutes = require('./src/routes/games');
const userRoutes = require('./src/routes/users');
const transactionRoutes = require('./src/routes/transactions');
const adminRoutes = require('./src/routes/admin');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lucifer-casino', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('🔥 Connected to MongoDB - Hell\'s Database is Online!'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'alive', 
    message: '🔥 Lucifer\'s Casino Backend is Running!',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('🎮 Player connected:', socket.id);

  // Join game room
  socket.on('join-game', (gameId) => {
    socket.join(gameId);
    socket.emit('joined-game', { gameId, message: 'Welcome to the game!' });
  });

  // Handle game actions
  socket.on('game-action', (data) => {
    // Broadcast to all players in the game
    io.to(data.gameId).emit('game-update', data);
  });

  // Handle balance updates
  socket.on('balance-update', (data) => {
    socket.emit('balance-changed', data);
  });

  socket.on('disconnect', () => {
    console.log('👋 Player disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
  🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  🔥                                          🔥
  🔥      LUCIFER'S CASINO BACKEND           🔥
  🔥           IS NOW ONLINE!                🔥
  🔥                                          🔥
  🔥         Server running on port ${PORT}        🔥
  🔥                                          🔥
  🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  `);
});

module.exports = { app, server, io };
