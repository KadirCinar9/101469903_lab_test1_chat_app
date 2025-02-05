const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Connect to Database
connectDB().catch(err => {
    console.error('Initial database connection failed:', err);
    // Don't exit process, let retry logic handle it
});

// Init Middleware
app.use(express.json());
app.use(cors());

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Chat API is running' });
});

// Add at the top of the file
const activeUsers = new Map(); // Store active users and their rooms

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    // Store username when user connects
    socket.on('setUsername', (username) => {
        socket.username = username;
        activeUsers.set(socket.id, { username, room: null });
        updateActiveUsers();
    });

    // Update join room handling
    socket.on('joinRoom', ({ username, room }) => {
        socket.join(room);
        if (socket.username) {
            activeUsers.get(socket.id).room = room;
        }
        
        // Welcome current user
        socket.emit('message', {
            from_user: 'ChatBot',
            message: `Welcome to ${room}!`,
            date_sent: new Date()
        });

        // Broadcast to others
        socket.broadcast.to(room).emit('message', {
            from_user: 'ChatBot',
            message: `${username} has joined the chat`,
            date_sent: new Date()
        });

        updateActiveUsers();
    });

    // Listen for chatMessage
    socket.on('chatMessage', ({ username, room, message }) => {
        io.to(room).emit('message', { from_user: username, message });
    });

    // User typing
    socket.on('typing', ({ username, room }) => {
        socket.broadcast.to(room).emit('typing', { username });
    });

    // User stops typing
    socket.on('stopTyping', ({ room }) => {
        socket.broadcast.to(room).emit('stopTyping');
    });

    // Update leave room handling
    socket.on('leaveRoom', ({ username, room }) => {
        socket.leave(room);
        if (socket.username) {
            activeUsers.get(socket.id).room = null;
        }
        
        socket.broadcast.to(room).emit('message', {
            from_user: 'ChatBot',
            message: `${username} has left the chat`,
            date_sent: new Date()
        });

        socket.emit('roomLeft', { room });
        updateActiveUsers();
    });

    // Handle private messages
    socket.on('privateMessage', (data) => {
        // Find the recipient's socket
        const recipientSocket = Array.from(io.sockets.sockets.values())
            .find(s => s.username === data.to_user);
            
        if (recipientSocket) {
            // Send to recipient
            io.to(recipientSocket.id).emit('privateMessage', {
                from_user: data.from_user,
                message: data.message,
                isPrivate: true
            });
            
            // Send confirmation to sender
            socket.emit('privateMessage', {
                from_user: data.from_user,
                to_user: data.to_user,
                message: data.message,
                isPrivate: true
            });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        if (activeUsers.has(socket.id)) {
            activeUsers.delete(socket.id);
            updateActiveUsers();
        }
    });

    // Function to update active users list
    function updateActiveUsers() {
        const users = Array.from(activeUsers.values()).map(u => u.username);
        io.emit('activeUsers', users);
    }
});

// Update the server startup
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('Press CTRL + C to stop the server');
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
}); 