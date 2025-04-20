import express from "express";
import http from "http";
import { Server } from "socket.io";
import { setupSocketHandlers } from "./controllers/socketController";
import router from "./routes/router"; // Updated import path
import dotenv from 'dotenv';
import cors from 'cors';
import teamRoutes from './routes/team';
import compileRoutes from './routes/compile';
import terminalRoutes, { initializeTerminalRoutes } from './routes/terminal';
import codeExecutionRoutes from './routes/codeExecution'; // Import code execution routes

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Create an HTTP server
const server = http.createServer(app);

// Configure CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 600,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware before any other middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());

// Routes
app.use("/api", router);
app.use('/api/teams', teamRoutes);
app.use('/api/compile', compileRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/execute', codeExecutionRoutes); // Add code execution routes

// Attach Socket.IO to the HTTP server
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  cookie: {
    name: 'io',
    path: '/',
    httpOnly: true,
    sameSite: 'lax'
  }
});

// Socket.IO Handlers
setupSocketHandlers(io);
initializeTerminalRoutes(io);

// Start the server
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});