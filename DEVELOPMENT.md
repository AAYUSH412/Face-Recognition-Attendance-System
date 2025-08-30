# 🚀 Development Guide

## Face Recognition Attendance System
*Created by [Aayush Vaghela](https://github.com/AAYUSH412)*

---

## ⚡ Quick Development Setup

### 1. Clone and Start
```bash
git clone https://github.com/AAYUSH412/Face-Recognition-Attendance-System.git
cd Face-Recognition-Attendance-System
./start-all.sh --install
```

### 2. Access Applications
- **Client**: http://localhost:5173
- **Admin**: http://localhost:5174
- **API**: http://localhost:4000

### 3. Seed Database
```bash
cd server && npm run seed
```

### 4. Test Login
- **Admin**: akash.kumar1@student.edu / password123

---

## 🛠️ Development Workflow

### Local Development
```bash
# Start all services
./start-all.sh

# Stop all services
./stop-all.sh

# Install dependencies
npm run install-all

# Build applications
npm run build
```

### Docker Development
```bash
# Start with Docker
./start-all.sh --docker

# Stop Docker services
npm run docker:down

# View logs
npm run docker:logs
```

### Individual Services
```bash
# Server only
npm run server:dev

# Client only
npm run client:dev

# Admin only
npm run admin:dev
```

---

## 📁 Key Files to Know

### Configuration
- `package.json` - Root workspace configuration
- `.env.example` - Environment variables template
- `docker-compose.dev.yml` - Development environment

### Scripts
- `start-all.sh` - Main startup script
- `stop-all.sh` - Stop all services
- `server/seedData.js` - Database seeding

### Documentation
- `README.md` - Main documentation
- `PROJECT_STRUCTURE.md` - Detailed project structure
- `server/LOGIN_CREDENTIALS.md` - Test credentials

---

## 🔧 Environment Setup

### Prerequisites
- Node.js 18+
- npm 9+
- Git

### Optional (for full development)
- MongoDB 7.0+
- Redis 7.0+
- Docker & Docker Compose

---

## 📊 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19, TailwindCSS, Vite | User interfaces |
| **AI/ML** | TensorFlow.js, BlazeFace | Face recognition |
| **Backend** | Node.js, Express.js | API server |
| **Database** | MongoDB, Mongoose | Data storage |
| **Cache** | Redis | Session management |
| **DevOps** | Docker, Docker Compose | Containerization |

---

## 🎯 Development Tips

### Hot Reload
All services support hot reload during development:
- **Client**: Vite HMR
- **Admin**: Vite HMR  
- **Server**: Nodemon

### Debugging
- Server logs: `tail -f logs/server.log`
- Client logs: `tail -f logs/client.log`
- Admin logs: `tail -f logs/admin.log`

### API Testing
- Import Postman collection: `server/Face_Recognition_Attendance_API.postman_collection.json`
- Base URL: http://localhost:4000/api

### Code Structure
- **Components**: Reusable UI components
- **Pages**: Route-specific components
- **Context**: State management
- **Hooks**: Custom React hooks
- **Utils**: Helper functions

---

## 🚀 Deployment

### Development
```bash
./start-all.sh --docker
```

### Production
```bash
docker-compose up --build -d
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

*Happy coding! 🎉*
