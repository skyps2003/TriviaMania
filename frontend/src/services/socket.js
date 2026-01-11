import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
    autoConnect: false,
    transports: ['websocket', 'polling'], // Try websocket first, fallback to polling if needed (or just websocket if polling fails)
    reconnection: true,
    reconnectionAttempts: 5,
});

export default socket;
