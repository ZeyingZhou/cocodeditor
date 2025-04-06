import express from "express";
import http from "http";
import { Server } from "socket.io";
import { setupSocketHandlers } from "./controllers/socketController";
import router from "./routes/router"; // Updated import path

const app = express();
const port = process.env.PORT || 3000;

// Create an HTTP server
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());

// Routes
app.use("/api", router);

// Socket.IO Handlers
setupSocketHandlers(io);

// Start the server
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});