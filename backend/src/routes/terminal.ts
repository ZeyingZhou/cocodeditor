import express from 'express';
import { spawn } from 'child_process';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const router = express.Router();

// Store active PTYs
const activePty = new Map<string, any>();

// Function to initialize terminal routes with Socket.IO
export const initializeTerminalRoutes = (io: Server) => {
  // Handle terminal connections
  io.on('connection', (socket) => {
    console.log('Terminal connection established:', socket.id);
    const sessionId = socket.id;
    
    // Get project path from query parameters
    const projectPath = socket.handshake.query.projectPath as string;
    const workingDir = projectPath ? path.resolve(projectPath) : process.cwd();
    
    // Create a new PTY for this session
    const pty = spawn(process.platform === 'win32' ? 'cmd.exe' : 'bash', [], {
      env: {
        ...process.env,
        TERM: 'xterm-256color',
        COLORTERM: 'truecolor',
        PS1: '\\w $ ', // Set custom prompt to show current directory
      },
      cwd: workingDir,
    });

    activePty.set(sessionId, pty);

    // Handle PTY output
    pty.stdout.on('data', (data: Buffer) => {
      socket.emit('terminal-output', data.toString());
    });

    pty.stderr.on('data', (data: Buffer) => {
      socket.emit('terminal-output', data.toString());
    });

    pty.on('close', () => {
      activePty.delete(sessionId);
      socket.emit('terminal-output', '\r\nProcess exited\r\n');
    });

    // Handle terminal input
    socket.on('terminal-input', (command: string) => {
      const sessionPty = activePty.get(sessionId);
      if (sessionPty) {
        sessionPty.stdin.write(command);
      }
    });

    // Handle directory change
    socket.on('change-directory', (newPath: string) => {
      const sessionPty = activePty.get(sessionId);
      if (sessionPty) {
        const resolvedPath = path.resolve(newPath);
        try {
          process.chdir(resolvedPath);
          sessionPty.stdin.write(`cd "${resolvedPath}"\n`);
        } catch (error) {
          socket.emit('terminal-output', `\r\nError changing directory: ${error}\r\n`);
        }
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const sessionPty = activePty.get(sessionId);
      if (sessionPty) {
        sessionPty.kill();
        activePty.delete(sessionId);
      }
      console.log('Terminal connection closed:', sessionId);
    });

    // Send initial prompt
    socket.emit('terminal-output', `\r\n${workingDir} $ `);
  });
};

// Simple status route
router.get('/status', (req, res) => {
  res.json({ status: 'Terminal service is running' });
});

// Clean up PTYs on server shutdown
process.on('SIGTERM', () => {
  activePty.forEach((pty) => {
    pty.kill();
  });
  process.exit(0);
});

export default router; 