// src/server.js
// Main Express Server for AutoDocs + AutoIncident Enterprise Platform

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Database
const { testConnection } = require('./config/database');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const incidentRoutes = require('./routes/incidents');
const oncallRoutes = require('./routes/oncall');
const serviceRoutes = require('./routes/services');
const statusPageRoutes = require('./routes/statusPages');
const postmortemRoutes = require('./routes/postmortems');
const documentationRoutes = require('./routes/documentation');
const analyticsRoutes = require('./routes/analytics');
const teamRoutes = require('./routes/teams');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/oncall', oncallRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/status-pages', statusPageRoutes);
app.use('/api/postmortems', postmortemRoutes);
app.use('/api/documentation', documentationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/teams', teamRoutes);

// API Documentation
app.get('/api', (req, res) => {
    res.json({
        message: 'AutoDocs + AutoIncident Enterprise API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            incidents: '/api/incidents',
            oncall: '/api/oncall',
            services: '/api/services',
            statusPages: '/api/status-pages',
            postmortems: '/api/postmortems',
            documentation: '/api/documentation',
            analytics: '/api/analytics',
            teams: '/api/teams'
        },
        documentation: '/api/docs'
    });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

// ============================================
// SERVER START
// ============================================

const startServer = async () => {
    try {
        // Test database connection
        console.log('🔗 Testing database connection...');
        await testConnection();
        console.log('✅ Database connected successfully');

        // Start server
        const server = app.listen(PORT, () => {
            console.log('🚀 ============================================');
            console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
            console.log(`🚀 Port: ${PORT}`);
            console.log(`🚀 API: http://localhost:${PORT}/api`);
            console.log(`🚀 Health: http://localhost:${PORT}/health`);
            console.log('🚀 ============================================');
        });

        // Initialize WebSocket
        const { initializeWebSocket } = require('./websocket');
        initializeWebSocket(server);
        console.log('🔌 WebSocket server initialized');

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Promise Rejection:', error);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Process terminated');
        process.exit(0);
    });
});

// Start the server
startServer();

module.exports = app;