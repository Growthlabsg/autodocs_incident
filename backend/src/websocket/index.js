// src/websocket/index.js
// WebSocket Server for Real-time Features

const socketIO = require('socket.io');
const { verifyAccessToken } = require('../config/jwt');

let io;

const initializeWebSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            credentials: true
        }
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = verifyAccessToken(token);
            socket.userId = decoded.userId;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.userId}`);

        // Join user's personal room
        socket.join(`user:${socket.userId}`);

        // Subscribe to incident updates
        socket.on('subscribe:incident', (incidentId) => {
            socket.join(`incident:${incidentId}`);
            console.log(`User ${socket.userId} subscribed to incident ${incidentId}`);
        });

        // Unsubscribe from incident
        socket.on('unsubscribe:incident', (incidentId) => {
            socket.leave(`incident:${incidentId}`);
        });

        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.userId}`);
        });
    });

    return io;
};

// Emit events
const emitIncidentUpdate = (incidentId, data) => {
    if (io) {
        io.to(`incident:${incidentId}`).emit('incident:update', data);
    }
};

const emitNewIncident = (data) => {
    if (io) {
        io.emit('incident:new', data);
    }
};

const emitNotification = (userId, notification) => {
    if (io) {
        io.to(`user:${userId}`).emit('notification', notification);
    }
};

module.exports = {
    initializeWebSocket,
    emitIncidentUpdate,
    emitNewIncident,
    emitNotification
};
