const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Create an HTTP server
const server = http.createServer(app);

// Configure CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Basic route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Socket.IO setup
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Echo back any terminal input
  socket.on('terminal-input', (data) => {
    console.log('Terminal input received:', data);
    socket.emit('terminal-output', `You typed: ${data}\n`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
server.listen(port, () => {
  console.log(`Debug server running on http://localhost:${port}`);
}); 