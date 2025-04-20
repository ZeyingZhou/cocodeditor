import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

// Add global event listener for debugging
socket.on('newMessage', (message) => {
  console.log('[GLOBAL SOCKET] Received newMessage event:', message);
});

export default socket; 