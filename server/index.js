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

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies with large size for images
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parse URL-encoded bodies

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/demo', demoRoutes);

// Home page
app.get('/', (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(hometemplate());
  } catch (error) {
    console.error('Error serving home page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});