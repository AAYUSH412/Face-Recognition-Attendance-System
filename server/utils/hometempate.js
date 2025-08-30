/**
 * Enhanced Home Template for Face Recognition Attendance System API
 * Modern, responsive HTML page with comprehensive API documentation
 * Created by Aayush Vaghela (https://github.com/AAYUSH412)
 */

const hometemplate = () => {
  const currentYear = new Date().getFullYear();
  const serverTime = new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Face Recognition Attendance System API - A cutting-edge attendance management system powered by AI facial recognition technology">
    <meta name="author" content="Aayush Vaghela">
    <meta name="keywords" content="face recognition, attendance system, API, Node.js, Express, MongoDB, JWT, AI, machine learning">
    <meta property="og:title" content="Face Recognition Attendance System API">
    <meta property="og:description" content="Secure API for Face Recognition Based Attendance Management">
    <meta property="og:type" content="website">
    <title>🔐 Face Recognition Attendance System API</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔐</text></svg>">
    <style>
        /* Modern CSS Reset */
        *, *::before, *::after {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        /* CSS Custom Properties */
        :root {
            --primary-color: #667eea;
            --secondary-color: #764ba2;
            --accent-color: #f093fb;
            --success-color: #27ae60;
            --warning-color: #f39c12;
            --error-color: #e74c3c;
            --text-primary: #2c3e50;
            --text-secondary: #7f8c8d;
            --text-light: #95a5a6;
            --bg-card: rgba(255, 255, 255, 0.95);
            --bg-overlay: rgba(255, 255, 255, 0.1);
            --shadow-light: 0 5px 15px rgba(0, 0, 0, 0.08);
            --shadow-medium: 0 10px 30px rgba(0, 0, 0, 0.1);
            --shadow-heavy: 0 15px 40px rgba(0, 0, 0, 0.2);
            --border-radius: 15px;
            --border-radius-small: 8px;
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            :root {
                --text-primary: #ecf0f1;
                --text-secondary: #bdc3c7;
                --text-light: #95a5a6;
                --bg-card: rgba(44, 62, 80, 0.95);
                --bg-overlay: rgba(0, 0, 0, 0.2);
            }
        }
        
        /* Base Styles */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: var(--text-primary);
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 50%, var(--accent-color) 100%);
            min-height: 100vh;
            scroll-behavior: smooth;
            overflow-x: hidden;
        }
        
        /* Animated background particles */
        .background-animation {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
            animation: float 20s infinite linear;
        }
        
        @keyframes float {
            0% { transform: translateY(0) rotate(0deg); }
            100% { transform: translateY(-100vh) rotate(360deg); }
        }
        
        /* Container */
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            position: relative;
            z-index: 1;
        }
        
        /* Header */
        .header {
            text-align: center;
            background: var(--bg-card);
            padding: 60px 40px;
            border-radius: var(--border-radius);
            margin-bottom: 40px;
            box-shadow: var(--shadow-medium);
            backdrop-filter: blur(10px);
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color), var(--accent-color));
        }
        
        .header h1 {
            font-size: clamp(2rem, 5vw, 3.5rem);
            margin-bottom: 20px;
            font-weight: 800;
            background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: none;
        }
        
        .header .subtitle {
            font-size: clamp(1rem, 3vw, 1.4rem);
            color: var(--text-secondary);
            margin-bottom: 30px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: var(--success-color);
            color: white;
            padding: 12px 25px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1rem;
            margin-top: 20px;
            animation: pulse-glow 2s infinite;
            box-shadow: 0 4px 20px rgba(39, 174, 96, 0.3);
        }
        
        @keyframes pulse-glow {
            0%, 100% { 
                box-shadow: 0 4px 20px rgba(39, 174, 96, 0.3), 0 0 0 0 rgba(39, 174, 96, 0.7); 
            }
            50% { 
                box-shadow: 0 4px 25px rgba(39, 174, 96, 0.4), 0 0 0 10px rgba(39, 174, 96, 0); 
            }
        }
        
        .pulse-dot {
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            animation: pulse-dot 1.5s infinite;
        }
        
        @keyframes pulse-dot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.2); }
        }
        
        /* Navigation */
        .nav-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 30px;
            flex-wrap: wrap;
        }
        
        .nav-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            background: var(--bg-overlay);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 25px;
            color: var(--text-primary);
            text-decoration: none;
            font-weight: 500;
            transition: var(--transition);
            backdrop-filter: blur(5px);
        }
        
        .nav-link:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
            box-shadow: var(--shadow-light);
        }
        
        /* Grid Layout */
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }
        
        /* Cards */
        .card {
            background: var(--bg-card);
            padding: 35px;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-medium);
            transition: var(--transition);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            overflow: hidden;
        }
        
        .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
            transform: scaleX(0);
            transition: var(--transition);
        }
        
        .card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: var(--shadow-heavy);
        }
        
        .card:hover::before {
            transform: scaleX(1);
        }
        
        .card h3 {
            color: var(--text-primary);
            margin-bottom: 25px;
            font-size: 1.5rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .card-icon {
            font-size: 1.8rem;
            padding: 8px;
            background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 40px;
            height: 40px;
        }
        
        /* Endpoints */
        .endpoint {
            background: rgba(248, 249, 250, 0.8);
            padding: 16px;
            border-radius: var(--border-radius-small);
            margin-bottom: 15px;
            border-left: 4px solid var(--primary-color);
            transition: var(--transition);
            backdrop-filter: blur(5px);
        }
        
        .endpoint:hover {
            background: rgba(248, 249, 250, 1);
            transform: translateX(5px);
            box-shadow: var(--shadow-light);
        }
        
        .method {
            font-weight: 700;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            margin-right: 12px;
            display: inline-block;
            min-width: 60px;
            text-align: center;
            font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
            letter-spacing: 0.5px;
        }
        
        .get { background: var(--success-color); color: white; }
        .post { background: var(--error-color); color: white; }
        .put { background: var(--warning-color); color: white; }
        .patch { background: #9b59b6; color: white; }
        .delete { background: #e67e22; color: white; }
        
        .endpoint-path {
            font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
            color: var(--text-primary);
            font-weight: 600;
            font-size: 0.95rem;
            background: rgba(103, 126, 234, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
        }
        
        .endpoint-desc {
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin-top: 8px;
            line-height: 1.4;
        }
        
        /* Features */
        .feature {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding: 15px;
            background: rgba(248, 249, 250, 0.5);
            border-radius: var(--border-radius-small);
            transition: var(--transition);
            backdrop-filter: blur(5px);
        }
        
        .feature:hover {
            background: rgba(248, 249, 250, 0.8);
            transform: translateX(5px);
        }
        
        .feature-icon {
            width: 45px;
            height: 45px;
            background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            margin-right: 20px;
            font-weight: 700;
            font-size: 1.1rem;
            flex-shrink: 0;
        }
        
        .feature-text {
            font-weight: 500;
            color: var(--text-primary);
        }
        
        /* Statistics Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .stat-item {
            text-align: center;
            padding: 20px;
            background: var(--bg-overlay);
            border-radius: var(--border-radius-small);
            backdrop-filter: blur(5px);
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-color);
            display: block;
        }
        
        .stat-label {
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin-top: 5px;
        }
        
        /* Footer */
        .footer {
            text-align: center;
            background: var(--bg-card);
            padding: 40px 30px;
            border-radius: var(--border-radius);
            color: var(--text-secondary);
            backdrop-filter: blur(10px);
            box-shadow: var(--shadow-medium);
        }
        
        .footer h3 {
            color: var(--text-primary);
            margin-bottom: 25px;
            font-size: 1.4rem;
        }
        
        .tech-stack {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin: 25px 0;
            flex-wrap: wrap;
        }
        
        .tech-item {
            background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 10px 18px;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 600;
            transition: var(--transition);
            box-shadow: var(--shadow-light);
        }
        
        .tech-item:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-medium);
        }
        
        .github-link {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 600;
            margin-top: 20px;
            padding: 10px 20px;
            border: 2px solid var(--primary-color);
            border-radius: 25px;
            transition: var(--transition);
        }
        
        .github-link:hover {
            background: var(--primary-color);
            color: white;
            transform: translateY(-2px);
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .container {
                padding: 15px;
            }
            
            .header {
                padding: 40px 20px;
            }
            
            .grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .card {
                padding: 25px;
            }
            
            .nav-links {
                gap: 10px;
            }
            
            .nav-link {
                padding: 8px 15px;
                font-size: 0.9rem;
            }
        }
        
        @media (max-width: 480px) {
            .tech-stack {
                gap: 8px;
            }
            
            .tech-item {
                padding: 8px 12px;
                font-size: 0.8rem;
            }
            
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        }
        
        /* Print Styles */
        @media print {
            body {
                background: white !important;
                color: black !important;
            }
            
            .header, .card, .footer {
                background: white !important;
                box-shadow: none !important;
                border: 1px solid #ccc !important;
            }
            
            .background-animation {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="background-animation"></div>
    
    <div class="container">
        <!-- Header Section -->
        <header class="header">
            <h1>🚀 Face Recognition Attendance System</h1>
            <p class="subtitle">
                A cutting-edge attendance management system powered by AI facial recognition technology.
                Secure, scalable, and modern API built with Node.js, Express, and MongoDB.
            </p>
            
            <div class="status-badge">
                <div class="pulse-dot"></div>
                <span>API Server Running</span>
            </div>
            
            <nav class="nav-links">
                <a href="/api" class="nav-link">
                    📊 API Info
                </a>
                <a href="/health" class="nav-link">
                    🔍 Health Check
                </a>
                <a href="https://github.com/AAYUSH412/Face-Recognition-Attendance-System" class="nav-link" target="_blank">
                    📖 Documentation
                </a>
            </nav>
        </header>
        
        <!-- Statistics Section -->
        <div class="card">
            <h3><span class="card-icon">📈</span>System Statistics</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-number">6</span>
                    <div class="stat-label">API Modules</div>
                </div>
                <div class="stat-item">
                    <span class="stat-number">30+</span>
                    <div class="stat-label">Endpoints</div>
                </div>
                <div class="stat-item">
                    <span class="stat-number">JWT</span>
                    <div class="stat-label">Authentication</div>
                </div>
                <div class="stat-item">
                    <span class="stat-number">AI</span>
                    <div class="stat-label">Powered</div>
                </div>
            </div>
        </div>
        
        <!-- API Endpoints Grid -->
        <div class="grid">
            <!-- Authentication Endpoints -->
            <div class="card">
                <h3><span class="card-icon">🔐</span>Authentication</h3>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/auth/register</span>
                    <div class="endpoint-desc">Register new user with email verification and face data setup</div>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/auth/login</span>
                    <div class="endpoint-desc">Authenticate user credentials and return JWT access token</div>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/auth/me</span>
                    <div class="endpoint-desc">Get current authenticated user profile and permissions</div>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/auth/refresh</span>
                    <div class="endpoint-desc">Refresh expired JWT token with new access token</div>
                </div>
            </div>
            
            <!-- User Management -->
            <div class="card">
                <h3><span class="card-icon">👥</span>User Management</h3>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/users</span>
                    <div class="endpoint-desc">Retrieve all users with pagination and filtering (Admin only)</div>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/users/stats</span>
                    <div class="endpoint-desc">Get comprehensive user statistics and analytics</div>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/users/bulk-delete</span>
                    <div class="endpoint-desc">Bulk delete multiple users (Admin only)</div>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/users/export</span>
                    <div class="endpoint-desc">Export user data in CSV format with custom filters</div>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/users/:id/face-data</span>
                    <div class="endpoint-desc">Upload and store face recognition training data</div>
                </div>
            </div>
            
            <!-- Event Management -->
            <div class="card">
                <h3><span class="card-icon">📅</span>Event Management</h3>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/events</span>
                    <div class="endpoint-desc">Get all events with advanced filtering and search options</div>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/events</span>
                    <div class="endpoint-desc">Create new event with QR code generation</div>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/events/:id/qr</span>
                    <div class="endpoint-desc">Generate secure QR code for event attendance</div>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/events/:id/attendance</span>
                    <div class="endpoint-desc">Mark attendance via QR scan or face recognition</div>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/events/:id/attendees</span>
                    <div class="endpoint-desc">Get detailed attendee list with check-in times</div>
                </div>
            </div>
            
            <!-- Attendance Tracking -->
            <div class="card">
                <h3><span class="card-icon">📊</span>Attendance Tracking</h3>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/attendance</span>
                    <div class="endpoint-desc">Get attendance records with date range and user filters</div>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/attendance/mark</span>
                    <div class="endpoint-desc">Mark attendance with face recognition or manual entry</div>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/attendance/export</span>
                    <div class="endpoint-desc">Export attendance data in multiple formats (CSV, Excel)</div>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/attendance/stats</span>
                    <div class="endpoint-desc">Get detailed attendance analytics and trends</div>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/attendance/bulk-verify</span>
                    <div class="endpoint-desc">Bulk verify attendance records (Admin only)</div>
                </div>
            </div>
            
            <!-- Department Management -->
            <div class="card">
                <h3><span class="card-icon">🏢</span>Department Management</h3>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/departments</span>
                    <div class="endpoint-desc">Get all departments with head information</div>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/departments</span>
                    <div class="endpoint-desc">Create new department with validation</div>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/departments/:id/users</span>
                    <div class="endpoint-desc">Get all users belonging to specific department</div>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/departments/:id/stats</span>
                    <div class="endpoint-desc">Get department-wise attendance statistics</div>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/departments/export</span>
                    <div class="endpoint-desc">Export department data with user counts</div>
                </div>
            </div>
            
            <!-- System Features -->
            <div class="card">
                <h3><span class="card-icon">🚀</span>Advanced Features</h3>
                <div class="feature">
                    <div class="feature-icon">🎯</div>
                    <div class="feature-text">AI-Powered Face Recognition with TensorFlow.js</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">📱</div>
                    <div class="feature-text">QR Code Based Attendance with JWT Security</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🔒</div>
                    <div class="feature-text">Enterprise-Grade JWT Authentication</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">👨‍💼</div>
                    <div class="feature-text">Role-Based Access Control (RBAC)</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">📈</div>
                    <div class="feature-text">Real-Time Analytics & Reporting Dashboard</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">☁️</div>
                    <div class="feature-text">ImageKit Cloud Storage Integration</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">📄</div>
                    <div class="feature-text">Multiple Export Formats (CSV, Excel, PDF)</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">⚡</div>
                    <div class="feature-text">High-Performance Bulk Operations</div>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <footer class="footer">
            <h3>🛠️ Built with Modern Technologies</h3>
            <div class="tech-stack">
                <span class="tech-item">Node.js v18+</span>
                <span class="tech-item">Express.js</span>
                <span class="tech-item">MongoDB 7.0+</span>
                <span class="tech-item">Mongoose ODM</span>
                <span class="tech-item">JWT Auth</span>
                <span class="tech-item">ImageKit</span>
                <span class="tech-item">TensorFlow.js</span>
                <span class="tech-item">React 19</span>
                <span class="tech-item">Vite</span>
                <span class="tech-item">TailwindCSS</span>
                <span class="tech-item">Docker</span>
            </div>
            
            <a href="https://github.com/AAYUSH412/Face-Recognition-Attendance-System" class="github-link" target="_blank">
                <span>🐙</span>
                <span>View on GitHub</span>
            </a>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                <p style="font-size: 0.95rem; margin-bottom: 10px;">
                    <strong>Face Recognition Attendance System API v1.0.0</strong>
                </p>
                <p style="font-size: 0.9rem; margin-bottom: 8px;">
                    Created with ❤️ by <strong>Aayush Vaghela</strong> • 
                    <a href="https://github.com/AAYUSH412" style="color: var(--primary-color); text-decoration: none;">@AAYUSH412</a>
                </p>
                <p style="font-size: 0.85rem; color: var(--text-light);">
                    Server Time: ${serverTime} • 
                    Status: <span style="color: var(--success-color); font-weight: 600;">Operational ✅</span>
                </p>
                <p style="font-size: 0.8rem; color: var(--text-light); margin-top: 15px;">
                    © ${currentYear} Face Recognition Attendance System. Licensed under MIT License.
                </p>
            </div>
        </footer>
    </div>
    
    <script>
        // Simple analytics and interaction tracking
        document.addEventListener('DOMContentLoaded', function() {
            // Track page load time
            const loadTime = performance.now();
            console.log('🚀 Page loaded in', Math.round(loadTime), 'ms');
            
            // Add click tracking for endpoints
            document.querySelectorAll('.endpoint').forEach(endpoint => {
                endpoint.addEventListener('click', function() {
                    const method = this.querySelector('.method').textContent;
                    const path = this.querySelector('.endpoint-path').textContent;
                    console.log('📊 Endpoint clicked:', method, path);
                });
            });
            
            // Add hover effects for cards
            document.querySelectorAll('.card').forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-8px) scale(1.02)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });
            
            // Update server time every minute
            setInterval(function() {
                const timeElement = document.querySelector('footer p:last-child');
                if (timeElement) {
                    const now = new Date().toLocaleString('en-US', {
                        timeZone: 'UTC',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                    timeElement.innerHTML = timeElement.innerHTML.replace(/\\d{1,2}:\\d{2}:\\d{2}/, now);
                }
            }, 60000);
        });
        
        // Service Worker registration for offline support (if available)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(function() {
                // Silently fail if service worker is not available
            });
        }
    </script>
</body>
</html>
  `;
};

export default hometemplate;