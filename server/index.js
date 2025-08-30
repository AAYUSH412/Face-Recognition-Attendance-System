import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import hometemplate from './utils/hometempate.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import attendanceRoutes from './routes/attendance.js';
import departmentRoutes from './routes/departments.js';
import eventRoutes from './routes/events.js';
import demoRoutes from './routes/demo.js';

// Load environment variables
dotenv.config({ path: './.env.local' });

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security and Performance Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for some face recognition libraries
})); // Enhanced security headers

app.use(compression()); // Compress responses for better performance

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions)); // Enable CORS with configuration

// Request Parsing Middleware
app.use(express.json({ 
  limit: process.env.MAX_FILE_SIZE || '50mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook verification if needed
    req.rawBody = buf;
  }
})); // Parse JSON bodies with large size for images

app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_FILE_SIZE || '50mb' 
})); // Parse URL-encoded bodies

// Request Logging Middleware (Development)
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
    next();
  });
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
    },
    environment: NODE_ENV,
    nodeVersion: process.version,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// MongoDB Connection with Enhanced Error Handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/face_recognition_db';
    
    console.log('🔄 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(mongoURI, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log(`✅ MongoDB connected successfully to: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // In production, we might want to retry connection
    if (NODE_ENV === 'production') {
      console.log('🔄 Retrying connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
};

// Initialize database connection
await connectDB();

// Authentication routes
app.use('/api/auth', authRoutes);

// User management routes
app.use('/api/users', userRoutes);

// Attendance tracking routes
app.use('/api/attendance', attendanceRoutes);

// Department management routes
app.use('/api/departments', departmentRoutes);

// Event management routes
app.use('/api/events', eventRoutes);

// Demo and testing routes
app.use('/api/demo', demoRoutes);

// API Information endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Face Recognition Attendance System API',
    version: '1.0.0',
    description: 'A cutting-edge attendance management system powered by AI facial recognition technology',
    author: 'Aayush Vaghela (https://github.com/AAYUSH412)',
    repository: 'https://github.com/AAYUSH412/Face-Recognition-Attendance-System',
    documentation: req.protocol + '://' + req.get('host') + '/',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      attendance: '/api/attendance',
      departments: '/api/departments',
      events: '/api/events',
      demo: '/api/demo',
      health: '/health'
    },
    features: [
      'Face Recognition Based Attendance',
      'QR Code Attendance Marking',
      'JWT Authentication & Authorization',
      'Multi-Role Access Control',
      'Real-time Analytics & Reports',
      'Responsive Admin Dashboard',
      'ImageKit Cloud Storage Integration',
      'CSV Data Export',
      'Bulk Operations Support'
    ],
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// Home page with enhanced template
app.get('/', (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Powered-By', 'Face Recognition Attendance System');
    res.send(hometemplate());
  } catch (error) {
    console.error('Error serving home page:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to render home page template',
      timestamp: new Date().toISOString()
    });
  }
});

// 404 Handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.method} ${req.originalUrl} does not exist`,
    availableRoutes: {
      documentation: '/',
      api: '/api',
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      attendance: '/api/attendance',
      departments: '/api/departments',
      events: '/api/events',
      demo: '/api/demo'
    },
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  
  // Don't leak error details in production
  const isDevelopment = NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    error: 'Internal server error',
    message: isDevelopment ? error.message : 'Something went wrong',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
});

// Start server with enhanced logging
const server = app.listen(PORT, () => {
  console.log(`
🎉 ====================================================
   🚀 Face Recognition Attendance System API
   ====================================================
   ✅ Server Status: Running Successfully
   🌐 Server URL: http://localhost:${PORT}
   📖 Documentation: http://localhost:${PORT}/
   🔍 Health Check: http://localhost:${PORT}/health
   📊 API Info: http://localhost:${PORT}/api
   ⚡ Environment: ${NODE_ENV}
   🕐 Started: ${new Date().toLocaleString()}
   ====================================================
   Ready to accept connections! 🎯
`);
});

// Graceful shutdown handling (defined after server is created)
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️  Received ${signal}. Starting graceful shutdown...`);
  
  // Set a timeout to force shutdown if graceful shutdown takes too long
  const forceShutdownTimeout = setTimeout(() => {
    console.error('❌ Force closing server after 10 seconds timeout');
    process.exit(1);
  }, 10000);
  
  try {
    // Close HTTP server first
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            console.error('❌ Error closing HTTP server:', err);
            reject(err);
          } else {
            console.log('✅ HTTP server closed');
            resolve();
          }
        });
      });
    }
    
    // Close database connection (modern Mongoose returns a Promise)
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
    }
    
    clearTimeout(forceShutdownTimeout);
    console.log('👋 Face Recognition Attendance System API shutdown complete');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    clearTimeout(forceShutdownTimeout);
    process.exit(1);
  }
};

// Handle process signals for graceful shutdown
let isShuttingDown = false;

const handleShutdown = (signal) => {
  if (isShuttingDown) {
    console.log('⚠️  Shutdown already in progress...');
    return;
  }
  isShuttingDown = true;
  gracefulShutdown(signal);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  if (!isShuttingDown) {
    isShuttingDown = true;
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  if (!isShuttingDown) {
    isShuttingDown = true;
    gracefulShutdown('UNHANDLED_REJECTION');
  }
});