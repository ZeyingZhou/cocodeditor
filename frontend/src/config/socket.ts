import { io } from 'socket.io-client';

// Create socket instance with comprehensive error handling and logging
const socket = io('http://localhost:3000', {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

// Debug connection events
socket.on('connect', () => {
  console.log(`[SOCKET] Connected with ID: ${socket.id}`);
  console.log(`[SOCKET] Transport: ${socket.io.engine.transport.name}`);
  
  // Force a page refresh if reconnecting after a long disconnection
  // This ensures all components reload properly with new socket state
  const wasDisconnected = sessionStorage.getItem('socket_disconnected');
  if (wasDisconnected === 'true') {
    console.log('[SOCKET] Reconnected after long disconnection, refreshing session state');
    sessionStorage.removeItem('socket_disconnected');
  }
});

socket.on('connect_error', (error) => {
  console.error(`[SOCKET] Connection error: ${error.message}`);
});

socket.on('disconnect', (reason) => {
  console.warn(`[SOCKET] Disconnected: ${reason}`);
  
  // Mark socket as disconnected for tracking
  sessionStorage.setItem('socket_disconnected', 'true');
  
  // If the server forcibly closed our connection
  if (reason === 'io server disconnect') {
    // Try to reconnect manually
    setTimeout(() => {
      console.log('[SOCKET] Attempting manual reconnection...');
      socket.connect();
    }, 1000);
  }
  // For all other disconnection reasons, auto-reconnect will work
});

socket.on('reconnect', (attemptNumber) => {
  console.log(`[SOCKET] Reconnected after ${attemptNumber} attempts`);
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`[SOCKET] Reconnection attempt ${attemptNumber}`);
});

socket.on('reconnect_error', (error) => {
  console.error(`[SOCKET] Reconnection error: ${error.message}`);
});

socket.on('reconnect_failed', () => {
  console.error('[SOCKET] Failed to reconnect - max attempts reached');
  
  // Try a final manual reconnection with increased timeout
  setTimeout(() => {
    console.log('[SOCKET] Attempting final manual reconnection...');
    socket.io.opts.timeout = 30000; // Increase timeout
    socket.connect();
  }, 3000);
});

// Listen for server errors
socket.on('error', (error) => {
  console.error('[SOCKET] Server error:', error);
});

// Debug received events for real-time collaboration
socket.onAny((event, ...args) => {
  // Only log certain events to avoid excessive console output
  if (['fileCreated', 'filesUpdate', 'codeUpdate', 'projectUsers', 'usersUpdate'].includes(event)) {
    console.log(`[SOCKET] Received event: ${event}`, 
      event === 'codeUpdate' 
        ? `file: ${args[0]?.file}, content length: ${args[0]?.content?.length || 0}` 
        : event === 'filesUpdate'
          ? `files count: ${args[0]?.files?.length || 0}`
          : args
    );
  }
});

// Ping function to check connection
export const pingSocket = () => {
  if (socket.connected) {
    console.log('[SOCKET] Connection verified, socket is connected');
    return true;
  } else {
    console.warn('[SOCKET] Connection issue detected, socket is disconnected');
    socket.connect(); // Try to reconnect
    return false;
  }
};

export default socket; 