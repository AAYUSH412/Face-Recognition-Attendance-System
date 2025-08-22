<div align="center">

# 🚀 Face Recognition Attendance System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green.svg)](https://www.mongodb.com/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22.0-orange.svg)](https://www.tensorflow.org/js)

*A cutting-edge attendance management system powered by AI facial recognition technology*

[🎯 Features](#-features) •
[🚀 Quick Start](#-quick-start) •
[📖 Documentation](#-documentation) •
[🛠️ Tech Stack](#️-tech-stack) •
[📱 Demo](#-demo)

</div>

---

## 🌟 Overview

The **Face Recognition Attendance System** revolutionizes traditional attendance tracking by implementing contactless, AI-powered facial recognition technology. This comprehensive solution eliminates manual processes, reduces errors, and provides real-time analytics for educational institutions and organizations.

### ✨ Why Choose This System?

- 🎯 **Zero Contact**: Completely contactless attendance marking
- ⚡ **Real-time Processing**: Instant face recognition and attendance confirmation
- 🔒 **Enterprise Security**: JWT authentication, encrypted data, and secure cloud storage
- 📊 **Advanced Analytics**: Comprehensive reporting and data visualization
- 📱 **Cross-platform**: Works on all devices with camera support
- 🎨 **Modern UI**: Beautiful, responsive interface built with TailwindCSS

## 🎯 Features

<details>
<summary><strong>👤 User Features</strong></summary>

- 🔐 **Smart Authentication**
  - AI-powered facial recognition registration
  - Secure email/password login with JWT
  - Multi-factor authentication support

- 📸 **Contactless Attendance**
  - Real-time face detection and verification
  - Instant attendance confirmation
  - Backup QR code scanning option

- 📊 **Personal Dashboard**
  - Live attendance status tracking
  - Historical attendance analytics
  - Personal performance metrics

- 👤 **Profile Management**
  - Update personal information
  - Manage face recognition data
  - Privacy settings control

</details>

<details>
<summary><strong>🛡️ Admin Features</strong></summary>

- 👥 **User Management**
  - Bulk user registration and import
  - Role-based access control
  - Department organization

- 📈 **Advanced Analytics**
  - Real-time attendance monitoring
  - Comprehensive reporting dashboard
  - Data export in multiple formats

- 🎯 **Event Management**
  - Create and manage events
  - QR code generation
  - Attendee tracking and analytics

- 🔧 **System Administration**
  - Attendance verification and correction
  - System configuration
  - Security audit logs

</details>

## 🏗️ Architecture

<div align="center">

```mermaid
graph TB
    subgraph "Frontend Applications"
        A[👤 User Client<br/>React + Vite]
        B[🛡️ Admin Panel<br/>React + Vite]
    end
    
    subgraph "Backend Services"
        C[🚀 Express Server<br/>Node.js + JWT Auth]
        D[🧠 Face Recognition<br/>TensorFlow.js + BlazeFace]
    end
    
    subgraph "Data Layer"
        E[📚 MongoDB<br/>User & Attendance Data]
        F[☁️ ImageKit<br/>Face Images Storage]
    end
    
    A --> C
    B --> C
    C --> D
    C --> E
    C --> F
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#fce4ec
    style F fill:#f1f8e9
```

</div>

### 📁 Project Structure

```
Face-Recognition-Attendance-System/
├── 📱 client/              # User-facing React application
│   ├── 🎨 src/
│   │   ├── 🔐 Auth/        # Authentication components
│   │   ├── 🧩 components/  # Reusable UI components
│   │   ├── 🌐 context/     # React context providers
│   │   └── 🛠️ utils/       # Utility functions
│   └── 📦 package.json
│
├── 🛡️ admin/              # Admin dashboard React application
│   ├── 🎨 src/
│   │   ├── 🧩 components/  # Admin UI components
│   │   ├── 📄 pages/       # Admin pages
│   │   ├── 🌐 context/     # Admin context providers
│   │   └── 🛠️ utils/       # Admin utilities
│   └── 📦 package.json
│
├── 🚀 server/             # Node.js Express backend
│   ├── 🎮 controllers/    # Business logic
│   ├── 🛡️ middleware/     # Custom middleware
│   ├── 📊 models/         # MongoDB schemas
│   ├── 🛣️ routes/         # API endpoints
│   └── 🛠️ utils/          # Server utilities
│
└── 📖 docs/               # Documentation
    └── 📋 PRD.md          # Product Requirements Document
```

## 🛠️ Tech Stack

<div align="center">

### Frontend
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)

### Backend
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

### AI/ML
[![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

</div>

<details>
<summary><strong>🎨 Frontend Technologies</strong></summary>

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.0.0 | Component-based UI library |
| **TailwindCSS** | Latest | Utility-first CSS framework |
| **Vite** | Latest | Lightning-fast build tool |
| **TensorFlow.js** | 4.22.0 | Client-side ML for face recognition |
| **BlazeFace** | 0.1.0 | Lightweight face detection model |
| **React Router** | 6.22.3 | Declarative routing |
| **Axios** | 1.6.8 | Promise-based HTTP client |
| **Framer Motion** | 11.1.17 | Animation library |

</details>

<details>
<summary><strong>⚙️ Backend Technologies</strong></summary>

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 14+ | JavaScript runtime |
| **Express.js** | 4.21.2 | Web application framework |
| **MongoDB** | 4.4+ | NoSQL database |
| **Mongoose** | 8.12.2 | MongoDB object modeling |
| **JWT** | 9.0.2 | Authentication tokens |
| **Bcrypt** | 3.0.2 | Password hashing |
| **ImageKit** | 6.0.0 | Cloud image storage |
| **Helmet** | 8.1.0 | Security middleware |

</details>

## 🚀 Quick Start

### 📋 Prerequisites

Ensure you have the following installed on your system:

```bash
# Check if Node.js is installed (v14 or higher required)
node --version

# Check if npm is installed
npm --version

# Check if MongoDB is running
mongod --version
```

<details>
<summary><strong>🔧 Installation Guide</strong></summary>

#### macOS
```bash
# Install Node.js using Homebrew
brew install node

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb/brew/mongodb-community
```

#### Ubuntu/Debian
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### Windows
- Download and install [Node.js](https://nodejs.org/)
- Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community)

</details>

### ⚡ One-Click Setup

```bash
# Clone the repository
git clone https://github.com/AAYUSH412/Face-Recognition-Attendance-System.git
cd Face-Recognition-Attendance-System

# Run the setup script (installs all dependencies)
chmod +x setup.sh && ./setup.sh

# Or manually install each component:
```

### 🔧 Manual Installation

<details>
<summary><strong>1️⃣ Backend Setup</strong></summary>

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit the environment variables
nano .env.local
```

**Environment Configuration:**
```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/face_recognition_attendance

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# ImageKit Configuration (Sign up at https://imagekit.io)
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint
```

```bash
# Start the server
npm run dev
```

✅ **Server running at:** http://localhost:4000

</details>

<details>
<summary><strong>2️⃣ Client App Setup</strong></summary>

```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:4000/api" > .env
echo "VITE_APP_NAME=Face Recognition Attendance" >> .env

# Start the development server
npm run dev
```

✅ **Client app running at:** http://localhost:5173

</details>

<details>
<summary><strong>3️⃣ Admin Panel Setup</strong></summary>

```bash
# Navigate to admin directory
cd ../admin

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:4000/api" > .env
echo "VITE_APP_NAME=Attendance Admin Panel" >> .env

# Start the development server
npm run dev
```

✅ **Admin panel running at:** http://localhost:5174

</details>

### 🎯 Quick Verification

After setup, verify everything is working:

1. **Backend API**: Visit http://localhost:4000/api/health
2. **User App**: Visit http://localhost:5173
3. **Admin Panel**: Visit http://localhost:5174
4. **Database**: Check MongoDB connection

### 🐳 Docker Setup (Alternative)

```bash
# Clone and navigate to project
git clone https://github.com/AAYUSH412/Face-Recognition-Attendance-System.git
cd Face-Recognition-Attendance-System

# Build and run with Docker Compose
docker-compose up --build

# Services will be available at:
# - API: http://localhost:4000
# - Client: http://localhost:3000
# - Admin: http://localhost:3001
```

## 📖 Documentation

### 📚 API Reference

<details>
<summary><strong>🔐 Authentication Endpoints</strong></summary>

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "employeeId": "EMP001",
  "department": "64f7b1234567890123456789",
  "faceImages": ["base64Image1", "base64Image2", "base64Image3"]
}
```

#### Login with Credentials
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Face Recognition Login
```http
POST /api/auth/face-login
Content-Type: application/json

{
  "faceImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
}
```

</details>

<details>
<summary><strong>📊 Attendance Endpoints</strong></summary>

#### Mark Attendance
```http
POST /api/attendance/mark
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "faceImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

#### Get Attendance History
```http
GET /api/attendance/history?startDate=2025-01-01&endDate=2025-01-31&page=1&limit=10
Authorization: Bearer {jwt_token}
```

#### Export Attendance Report
```http
GET /api/attendance/export?format=csv&startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer {jwt_token}
```

</details>

<details>
<summary><strong>🎯 Event Endpoints</strong></summary>

#### Get Events
```http
GET /api/events?status=active&department=64f7b1234567890123456789
Authorization: Bearer {jwt_token}
```

#### Create Event
```http
POST /api/events
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "title": "Tech Workshop",
  "description": "AI and Machine Learning Workshop",
  "startDate": "2025-09-01T09:00:00Z",
  "endDate": "2025-09-01T17:00:00Z",
  "location": "Conference Room A",
  "maxAttendees": 50
}
```

</details>

### 🔍 Database Schema

<details>
<summary><strong>📄 Core Schemas</strong></summary>

#### User Schema
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed with bcrypt),
  employeeId: String (unique),
  department: ObjectId (ref: 'Department'),
  role: String (enum: ['user', 'admin', 'super_admin']),
  faceDescriptors: [Array], // Face recognition data
  faceImages: [String], // ImageKit URLs
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Attendance Schema
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  date: Date (indexed),
  checkIn: Date,
  checkOut: Date,
  duration: Number, // in minutes
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  faceImage: String, // ImageKit URL
  confidence: Number, // Recognition confidence
  verified: Boolean,
  verifiedBy: ObjectId (ref: 'User'),
  notes: String,
  createdAt: Date
}
```

</details>

### 🎮 Usage Examples

<details>
<summary><strong>💻 Frontend Integration</strong></summary>

#### Face Recognition Component
```jsx
import { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceRecognition = () => {
  const videoRef = useRef();
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.blazeFace.loadFromUri('/models');
      setIsModelLoaded(true);
    };
    loadModels();
  }, []);

  const captureAndRecognize = async () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg');
    
    // Send to API for recognition
    const response = await fetch('/api/auth/face-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faceImage: imageData })
    });
    
    const result = await response.json();
    console.log('Recognition result:', result);
  };

  return (
    <div>
      <video ref={videoRef} autoPlay muted />
      <button onClick={captureAndRecognize}>
        Recognize Face
      </button>
    </div>
  );
};
```

</details>

## 🚀 Deployment

### 🌐 Production Deployment Options

<details>
<summary><strong>☁️ Cloud Deployment (Recommended)</strong></summary>

#### Backend Deployment - Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
heroku config:set JWT_SECRET=your_production_jwt_secret
heroku config:set IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
heroku config:set IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
heroku config:set IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint

# Deploy
git push heroku main
```

#### Frontend Deployment - Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy client app
cd client
vercel --prod

# Deploy admin panel
cd ../admin
vercel --prod
```

#### Frontend Deployment - Netlify
```bash
# Build the applications
cd client && npm run build
cd ../admin && npm run build

# Deploy using Netlify CLI or drag & drop the dist folders
```

</details>

<details>
<summary><strong>🐳 Docker Deployment</strong></summary>

#### Docker Compose Configuration
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    container_name: face-recognition-db
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./server
    container_name: face-recognition-api
    restart: always
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password@mongodb:27017/face_recognition?authSource=admin
      JWT_SECRET: your_jwt_secret
    ports:
      - "4000:4000"
    depends_on:
      - mongodb

  client:
    build: ./client
    container_name: face-recognition-client
    restart: always
    ports:
      - "3000:80"

  admin:
    build: ./admin
    container_name: face-recognition-admin
    restart: always
    ports:
      - "3001:80"

volumes:
  mongodb_data:
```

```bash
# Deploy with Docker Compose
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

</details>

<details>
<summary><strong>🖥️ VPS/Self-Hosted Deployment</strong></summary>

#### Ubuntu Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install PM2 for process management
sudo npm install -g pm2

# Clone and setup project
git clone https://github.com/AAYUSH412/Face-Recognition-Attendance-System.git
cd Face-Recognition-Attendance-System

# Setup backend
cd server
npm install --production
pm2 start index.js --name "face-recognition-api"

# Setup nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/face-recognition
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /var/www/face-recognition/client/dist;
        try_files $uri $uri/ /index.html;
    }

    location /admin {
        root /var/www/face-recognition/admin/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

</details>

### 📊 Performance Optimization

<details>
<summary><strong>⚡ Frontend Optimization</strong></summary>

```javascript
// vite.config.js - Production optimizations
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          tensorflow: ['@tensorflow/tfjs', '@tensorflow-models/blazeface'],
          ui: ['@headlessui/react', '@heroicons/react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

</details>

### 🔒 Security Checklist

- [ ] **Environment Variables**: Never commit sensitive data
- [ ] **HTTPS**: Enable SSL certificates in production
- [ ] **CORS**: Configure proper CORS settings
- [ ] **Rate Limiting**: Implement API rate limiting
- [ ] **Input Validation**: Validate all user inputs
- [ ] **MongoDB Security**: Enable authentication and use strong passwords
- [ ] **JWT Security**: Use strong secrets and short expiration times
- [ ] **Image Security**: Validate and sanitize uploaded images

## 🧪 Testing

### 🔍 Testing Strategy

<details>
<summary><strong>📝 Manual Testing Checklist</strong></summary>

#### User Registration & Authentication
- [ ] User can register with valid face images
- [ ] Face recognition login works accurately
- [ ] Email/password login functions correctly
- [ ] JWT tokens are properly generated and validated
- [ ] Password reset functionality works

#### Attendance Features
- [ ] Face recognition attendance marking
- [ ] Real-time feedback for attendance confirmation
- [ ] QR code backup attendance method
- [ ] Attendance history displays correctly
- [ ] Geolocation tracking (if enabled)

#### Admin Panel
- [ ] Admin can view all users and their data
- [ ] Attendance reports generate correctly
- [ ] Event management functions work
- [ ] Department management operates properly
- [ ] Data export features function

</details>

<details>
<summary><strong>🧪 API Testing with Postman</strong></summary>

Import the provided Postman collection for comprehensive API testing:

```bash
# Files included in the project:
- Face-Recognition-Attendance-System.postman_collection.json
- Face-Recognition-Attendance-System.postman_environment.json
```

**Setup Postman Testing:**
1. Import both JSON files into Postman
2. Set up the environment variables
3. Run the test suite to verify all endpoints

**Key Test Cases:**
- Authentication flow
- User registration with face data
- Attendance marking
- Event management
- Admin operations

</details>

<details>
<summary><strong>🎯 Unit Testing (Future Enhancement)</strong></summary>

```bash
# Backend testing setup
cd server
npm install --save-dev jest supertest

# Frontend testing setup
cd client
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

</details>

## 🐛 Troubleshooting

<details>
<summary><strong>❌ Common Issues & Solutions</strong></summary>

#### Camera Access Issues
```javascript
// Problem: Camera not accessible
// Solution: Ensure HTTPS in production and proper permissions

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      // Camera access granted
    })
    .catch(error => {
      console.error('Camera access denied:', error);
      // Show fallback options
    });
}
```

#### Face Recognition Problems
```javascript
// Problem: Low recognition accuracy
// Solutions:
// 1. Ensure proper lighting
// 2. Check model loading
// 3. Validate image quality

const checkImageQuality = (imageData) => {
  const img = new Image();
  img.src = imageData;
  
  if (img.width < 224 || img.height < 224) {
    throw new Error('Image resolution too low');
  }
  
  // Additional quality checks
};
```

#### MongoDB Connection Issues
```bash
# Check MongoDB status
brew services list | grep mongodb
sudo systemctl status mongod  # Ubuntu

# Restart MongoDB
brew services restart mongodb-community  # macOS
sudo systemctl restart mongod  # Ubuntu

# Check logs
tail -f /usr/local/var/log/mongodb/mongo.log  # macOS
tail -f /var/log/mongodb/mongod.log  # Ubuntu
```

#### Performance Issues
```javascript
// Optimize face recognition performance
const optimizeFaceDetection = {
  // Reduce image size before processing
  maxImageSize: 640,
  
  // Use appropriate model settings
  scoreThreshold: 0.5,
  nmsThreshold: 0.3,
  
  // Implement caching for descriptors
  useDescriptorCache: true
};
```

</details>

<details>
<summary><strong>📊 Performance Monitoring</strong></summary>

#### Backend Monitoring
```javascript
// server/middleware/monitoring.js
const responseTime = require('response-time');
const morgan = require('morgan');

app.use(responseTime());
app.use(morgan('combined'));

// Track API performance
app.use('/api', (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

#### Frontend Performance
```javascript
// Monitor component render times
import { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration) => {
  console.log('Component:', id, 'Phase:', phase, 'Duration:', actualDuration);
};

<Profiler id="FaceRecognition" onRender={onRenderCallback}>
  <FaceRecognitionComponent />
</Profiler>
```

</details>

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### 📝 Contribution Guidelines

1. **Fork the Repository**
   ```bash
   git fork https://github.com/AAYUSH412/Face-Recognition-Attendance-System.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-new-feature
   ```

3. **Make Your Changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test Your Changes**
   ```bash
   # Run tests (when available)
   npm test
   
   # Check linting
   npm run lint
   ```

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   git push origin feature/amazing-new-feature
   ```

6. **Create Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes

### 🎯 Areas for Contribution

- 🐛 **Bug Fixes**: Report and fix issues
- ✨ **New Features**: Implement new functionality
- 📖 **Documentation**: Improve documentation
- 🎨 **UI/UX**: Enhance user interface
- 🧪 **Testing**: Add test coverage
- 🚀 **Performance**: Optimize system performance

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Face Recognition Attendance System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🙏 Acknowledgements

<div align="center">

**Built with ❤️ using amazing open-source technologies**

[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

</div>

### 🌟 Special Thanks

- **[TensorFlow.js Team](https://www.tensorflow.org/js)** - For making ML accessible in browsers
- **[BlazeFace Model](https://github.com/tensorflow/tfjs-models/tree/master/blazeface)** - Lightweight face detection
- **[React Team](https://reactjs.org/)** - For the amazing frontend framework
- **[TailwindCSS](https://tailwindcss.com/)** - For the utility-first CSS framework
- **[ImageKit](https://imagekit.io/)** - For reliable cloud image storage
- **[MongoDB](https://www.mongodb.com/)** - For the flexible NoSQL database

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/AAYUSH412/Face-Recognition-Attendance-System?style=social)](https://github.com/AAYUSH412/Face-Recognition-Attendance-System/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/AAYUSH412/Face-Recognition-Attendance-System?style=social)](https://github.com/AAYUSH412/Face-Recognition-Attendance-System/network/members)

**Made with 💻 for educational purposes • [Report Bug](https://github.com/AAYUSH412/Face-Recognition-Attendance-System/issues) • [Request Feature](https://github.com/AAYUSH412/Face-Recognition-Attendance-System/issues)**

</div>
