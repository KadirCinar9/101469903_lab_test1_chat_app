const io = require('socket.io-client');

const socket = io('http://localhost:5000');

socket.on('connect', () => {
    console.log('Connected to server');

    // Test joining a room
    socket.emit('joinRoom', { username: 'testuser', room: 'general' });

    // Test sending a message
    setTimeout(() => {
        socket.emit('chatMessage', {
            username: 'testuser',
            room: 'general',
            message: 'Test message via socket'
        });
    }, 1000);
});

socket.on('message', (message) => {
    console.log('Received message:', message);
});

// Keep the script running for a few seconds
setTimeout(() => {
    socket.disconnect();
    process.exit(0);
}, 3000); 