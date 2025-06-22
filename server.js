const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { logger } = require('./src/utils/logger');

// Import routes
const searchRoutes = require('./src/routes/search');
const toolsRoutes = require('./src/routes/tools');
const chatRoutes = require('./src/routes/chat');
const sectionsRoutes = require('./src/routes/sections');

const app = express();
const server = createServer(app);
const io = new Server(server);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "wss:", "https:"],
            frameSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));

// API Routes
app.use('/api/search', searchRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/sections', sectionsRoutes);
app.use('/api/ai', chatRoutes); // Add AI routes under /api/ai prefix

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '3.0.0'
    });
});

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'OSINT Framework API',
        version: '1.0.0',
        description: 'Comprehensive OSINT intelligence gathering and analysis API',
        endpoints: {
            health: '/api/health',
            search: '/api/search',
            tools: '/api/tools',
            tools_categories: '/api/tools/categories',
            tools_search: '/api/tools/search',
            tools_recommendations: '/api/tools/recommendations',
            tools_statistics: '/api/tools/statistics',
            tools_quick_access: '/api/tools/quick-access'
        },
        documentation: '/docs',
        support: '/support'
    });
});

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/tools', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tools.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'search.html'));
});

app.get('/analysis', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'analysis.html'));
});

app.get('/reports', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reports.html'));
});

// IntelTechniques page
app.get('/inteltechniques', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'inteltechniques.html'));
});

// WebSocket connection handling
io.on('connection', (socket) => {
    logger.info('Client connected', { id: socket.id });

    socket.on('join_room', (room) => {
        socket.join(room);
        logger.info('Client joined room', { id: socket.id, room });
    });

    socket.on('leave_room', (room) => {
        socket.leave(room);
        logger.info('Client left room', { id: socket.id, room });
    });

    socket.on('search_request', (data) => {
        // Handle real-time search requests
        logger.info('Search request received', { id: socket.id, query: data.query });
        
        // Emit search progress updates
        socket.emit('search_progress', { 
            status: 'searching', 
            message: 'Searching for results...' 
        });
    });

    socket.on('tool_execution', (data) => {
        // Handle tool execution requests
        logger.info('Tool execution request', { 
            id: socket.id, 
            tool: data.tool, 
            category: data.category 
        });
        
        // Emit execution progress updates
        socket.emit('execution_progress', { 
            status: 'executing', 
            message: `Executing ${data.tool}...` 
        });
    });

    socket.on('disconnect', () => {
        logger.info('Client disconnected', { id: socket.id });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error', { 
        error: err.message, 
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
    });

    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    logger.warn('404 Not Found', { url: req.url, method: req.method });
    
    if (req.path.startsWith('/api/')) {
        res.status(404).json({
            success: false,
            error: 'Endpoint not found',
            message: `The requested endpoint ${req.path} does not exist`
        });
    } else {
        res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', { promise, reason });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    logger.info(`OSINT Framework server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage()
    });
    
    console.log(`
    🚀 OSINT Framework Server Started!
    
    📍 Local: http://localhost:${PORT}
    🌐 Environment: ${process.env.NODE_ENV || 'development'}
    📊 Health Check: http://localhost:${PORT}/api/health
    🔧 API Docs: http://localhost:${PORT}/api
    🛠️  Tools Hub: http://localhost:${PORT}/tools
    🛡️  IntelTechniques: http://localhost:${PORT}/inteltechniques
    
    Press Ctrl+C to stop the server
    `);
});

module.exports = { app, server, io }; 