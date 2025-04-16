import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { io, Socket } from 'socket.io-client';
import 'xterm/css/xterm.css';
import { useTheme } from "@/contexts/ThemeContext";

interface TerminalPanelProps {
  theme: 'light' | 'dark';
  sessionId: string;
  projectPath?: string;
}

const TerminalPanel: React.FC<TerminalPanelProps> = ({ theme, sessionId, projectPath }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const webLinksAddon = useRef<WebLinksAddon | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const commandBuffer = useRef<string>('');
  const lastProjectPath = useRef<string>('');

  useEffect(() => {
    if (terminalRef.current) {
      // Initialize terminal
      terminal.current = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
          background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
          foreground: theme === 'dark' ? '#d4d4d4' : '#000000',
          cursor: theme === 'dark' ? '#d4d4d4' : '#000000',
        },
      });

      // Initialize addons
      fitAddon.current = new FitAddon();
      webLinksAddon.current = new WebLinksAddon();

      terminal.current.loadAddon(fitAddon.current);
      terminal.current.loadAddon(webLinksAddon.current);

      // Open terminal
      terminal.current.open(terminalRef.current);
      if (fitAddon.current) {
        fitAddon.current.fit();
      }

      // Connect to Socket.IO server
      socketRef.current = io('http://localhost:3000', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        query: {
          projectPath: projectPath || '',
        },
      });

      // Handle connection errors
      socketRef.current.on('connect_error', (error) => {
        if (terminal.current) {
          terminal.current.write(`\r\nConnection error: ${error.message}\r\n`);
          terminal.current.write('\x1B[1;32m$\x1B[0m ');
        }
      });

      // Handle successful connection
      socketRef.current.on('connect', () => {
        if (terminal.current) {
          terminal.current.write('\r\nConnected to terminal server\r\n');
        }
      });

      // Handle terminal input
      terminal.current.onData((data) => {
        if (terminal.current) {
          // Handle backspace
          if (data === '\x7F') {
            if (commandBuffer.current.length > 0) {
              commandBuffer.current = commandBuffer.current.slice(0, -1);
              terminal.current.write('\b \b');
            }
            return;
          }

          // Handle enter key
          if (data === '\r') {
            terminal.current.write('\r\n');
            if (socketRef.current && socketRef.current.connected) {
              socketRef.current.emit('terminal-input', commandBuffer.current + '\n');
            }
            commandBuffer.current = '';
            return;
          }

          // Handle regular input
          if (data >= ' ' && data <= '~') {
            commandBuffer.current += data;
            terminal.current.write(data);
          }
        }
      });

      // Handle terminal output from socket
      socketRef.current.on('terminal-output', (data: string) => {
        if (terminal.current) {
          terminal.current.write(data);
        }
      });

      // Handle window resize
      const handleResize = () => {
        if (fitAddon.current) {
          fitAddon.current.fit();
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (terminal.current) {
          terminal.current.dispose();
        }
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [theme, sessionId]);

  // Handle project path changes
  useEffect(() => {
    if (projectPath && projectPath !== lastProjectPath.current && socketRef.current?.connected) {
      lastProjectPath.current = projectPath;
      socketRef.current.emit('change-directory', projectPath);
    }
  }, [projectPath]);

  return (
    <div className="h-full">
      <div ref={terminalRef} className="h-full w-full" />
    </div>
  );
};

export default TerminalPanel; 