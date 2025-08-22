/**
 * Home Template for Face Recognition Attendance System API
 * Returns an HTML page with API documentation and system information
 */

const hometemplate = () => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Face Recognition Attendance System API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            background: rgba(255, 255, 255, 0.95);
            padding: 40px 20px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header h1 {
            color: #2c3e50;
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header p {
            color: #7f8c8d;
            font-size: 1.2rem;
        }
        
        .status {
            display: inline-block;
            background: #27ae60;
            color: white;
            padding: 8px 20px;
            border-radius: 25px;
            font-weight: 600;
            margin-top: 15px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(39, 174, 96, 0); }
            100% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0); }
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        
        .card {
            background: rgba(255, 255, 255, 0.95);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
        }
        
        .card h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.4rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .endpoint {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 10px;
            border-left: 4px solid #3498db;
        }
        
        .method {
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            margin-right: 10px;
            display: inline-block;
            min-width: 50px;
            text-align: center;
        }
        
        .get { background: #27ae60; color: white; }
        .post { background: #e74c3c; color: white; }
        .put { background: #f39c12; color: white; }
        .patch { background: #9b59b6; color: white; }
        .delete { background: #e67e22; color: white; }
        
        .endpoint-path {
            font-family: 'Courier New', monospace;
            color: #2c3e50;
            font-weight: 600;
        }
        
        .endpoint-desc {
            color: #7f8c8d;
            font-size: 0.9rem;
            margin-top: 5px;
        }
        
        .feature {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .feature-icon {
            width: 30px;
            height: 30px;
            background: #3498db;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            margin-right: 15px;
            font-weight: bold;
        }
        
        .footer {
            text-align: center;
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            border-radius: 15px;
            color: #7f8c8d;
        }
        
        .tech-stack {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 15px;
            flex-wrap: wrap;
        }
        
        .tech-item {
            background: #3498db;
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
        }
        
        .icon {
            font-size: 1.2rem;
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Face Recognition Attendance System</h1>
            <p>Secure API for Face Recognition Based Attendance Management</p>
            <div class="status">🟢 API Server Running</div>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3><span class="icon">🔐</span>Authentication Endpoints</h3>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/auth/register</span>
                    <div class="endpoint-desc">Register a new user account</div>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/auth/login</span>
                    <div class="endpoint-desc">Authenticate user and get JWT token</div>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/auth/me</span>
                    <div class="endpoint-desc">Get current user profile information</div>
                </div>
            </div>
            
            <div class="card">
                <h3><span class="icon">👥</span>User Management</h3>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/users</span>
                    <div class="endpoint-desc">Get all users (Admin only)</div>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/users/stats</span>
                    <div class="endpoint-desc">Get user statistics and analytics</div>
                </div>
                <div class="endpoint">
                    <span class="method patch">PATCH</span>
                    <span class="endpoint-path">/api/users/bulk-status</span>
                    <div class="endpoint-desc">Bulk update user active status</div>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/users/:id/face-data</span>
                    <div class="endpoint-desc">Upload face recognition data</div>
                </div>
            </div>
            
            <div class="card">
                <h3><span class="icon">📅</span>Event Management</h3>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/events</span>
                    <div class="endpoint-desc">Get all events with filtering options</div>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/events</span>
                    <div class="endpoint-desc">Create a new event</div>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/events/:id/qr</span>
                    <div class="endpoint-desc">Generate QR code for event attendance</div>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/events/:id/attendance</span>
                    <div class="endpoint-desc">Mark attendance via QR/Face recognition</div>
                </div>
            </div>
            
            <div class="card">
                <h3><span class="icon">📊</span>Attendance Tracking</h3>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/attendance</span>
                    <div class="endpoint-desc">Get attendance records with filters</div>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/attendance/export</span>
                    <div class="endpoint-desc">Export attendance data as CSV</div>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/attendance/stats</span>
                    <div class="endpoint-desc">Get attendance statistics and analytics</div>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/attendance/mark</span>
                    <div class="endpoint-desc">Mark attendance manually</div>
                </div>
            </div>
            
            <div class="card">
                <h3><span class="icon">🏢</span>Department Management</h3>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/departments</span>
                    <div class="endpoint-desc">Get all departments</div>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/departments</span>
                    <div class="endpoint-desc">Create a new department</div>
                </div>
                <div class="endpoint">
                    <span class="method put">PUT</span>
                    <span class="endpoint-path">/api/departments/:id</span>
                    <div class="endpoint-desc">Update department information</div>
                </div>
                <div class="endpoint">
                    <span class="method delete">DELETE</span>
                    <span class="endpoint-path">/api/departments/:id</span>
                    <div class="endpoint-desc">Delete a department</div>
                </div>
            </div>
            
            <div class="card">
                <h3><span class="icon">🚀</span>System Features</h3>
                <div class="feature">
                    <div class="feature-icon">🎯</div>
                    <div>Face Recognition Based Attendance</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">📱</div>
                    <div>QR Code Attendance Marking</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🔒</div>
                    <div>JWT Authentication & Authorization</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">👨‍💼</div>
                    <div>Multi-Role Access Control</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">📈</div>
                    <div>Real-time Analytics & Reports</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🎨</div>
                    <div>Responsive Admin Dashboard</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <h3>🛠️ Built With Modern Technologies</h3>
            <div class="tech-stack">
                <span class="tech-item">Node.js</span>
                <span class="tech-item">Express.js</span>
                <span class="tech-item">MongoDB</span>
                <span class="tech-item">Mongoose</span>
                <span class="tech-item">JWT</span>
                <span class="tech-item">ImageKit</span>
                <span class="tech-item">React</span>
                <span class="tech-item">Vite</span>
            </div>
            <p style="margin-top: 20px; color: #95a5a6;">
                Face Recognition Attendance System API • Built for scalable attendance management
            </p>
            <p style="margin-top: 10px; font-size: 0.9rem;">
                Server Time: ${new Date().toLocaleString()} • Status: Operational ✅
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

export default hometemplate;