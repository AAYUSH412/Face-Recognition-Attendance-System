#!/bin/bash

# ========================================================
# Face Recognition Attendance System - Startup Script
# Created by Aayush Vaghela (https://github.com/AAYUSH412)
# ========================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_NAME="Face Recognition Attendance System"
CLIENT_PORT=5173
ADMIN_PORT=5174
SERVER_PORT=4000

# Function to print colored output
print_message() {
    echo -e "${2}${1}${NC}"
}

# Function to print banner
print_banner() {
    echo -e "${CYAN}"
    echo "=============================================================================="
    echo "🚀 $PROJECT_NAME - Development Environment Startup"
    echo "=============================================================================="
    echo -e "${NC}"
    echo -e "${YELLOW}Created by Aayush Vaghela${NC}"
    echo -e "${BLUE}GitHub: https://github.com/AAYUSH412${NC}"
    echo ""
}

# Function to check if a port is in use
check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_message "⚠️  Port $port is already in use (required for $service)" $YELLOW
        echo "Please stop the service running on port $port or choose a different port."
        return 1
    fi
    return 0
}

# Function to check prerequisites
check_prerequisites() {
    print_message "🔍 Checking prerequisites..." $BLUE
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_message "❌ Node.js is not installed. Please install Node.js (v18 or higher)" $RED
        exit 1
    fi
    
    local node_version=$(node -v | sed 's/v//')
    print_message "✅ Node.js version: $node_version" $GREEN
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_message "❌ npm is not installed" $RED
        exit 1
    fi
    
    local npm_version=$(npm -v)
    print_message "✅ npm version: $npm_version" $GREEN
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]] || [[ ! -d "client" ]] || [[ ! -d "server" ]] || [[ ! -d "admin" ]]; then
        print_message "❌ Please run this script from the project root directory" $RED
        exit 1
    fi
    
    # Check ports
    check_port $CLIENT_PORT "Client (React)"
    check_port $ADMIN_PORT "Admin Panel (React)"
    check_port $SERVER_PORT "Server (Node.js)"
    
    print_message "✅ All prerequisites checked" $GREEN
    echo ""
}

# Function to install dependencies
install_dependencies() {
    print_message "📦 Installing dependencies..." $BLUE
    
    # Server dependencies
    print_message "🔧 Installing server dependencies..." $CYAN
    cd server
    npm install
    cd ..
    
    # Client dependencies
    print_message "🔧 Installing client dependencies..." $CYAN
    cd client
    npm install
    cd ..
    
    # Admin dependencies
    print_message "🔧 Installing admin dependencies..." $CYAN
    cd admin
    npm install
    cd ..
    
    print_message "✅ All dependencies installed successfully" $GREEN
    echo ""
}

# Function to start services
start_services() {
    print_message "🚀 Starting all services..." $BLUE
    
    # Create log directory if it doesn't exist
    mkdir -p logs
    
    # Start server
    print_message "🖥️  Starting Node.js Server (Port: $SERVER_PORT)..." $CYAN
    cd server
    npm run dev > ../logs/server.log 2>&1 &
    SERVER_PID=$!
    cd ..
    
    # Wait a moment for server to start
    sleep 3
    
    # Start client
    print_message "🌐 Starting Client Application (Port: $CLIENT_PORT)..." $CYAN
    cd client
    npm run dev > ../logs/client.log 2>&1 &
    CLIENT_PID=$!
    cd ..
    
    # Start admin panel
    print_message "👨‍💼 Starting Admin Panel (Port: $ADMIN_PORT)..." $CYAN
    cd admin
    npm run dev > ../logs/admin.log 2>&1 &
    ADMIN_PID=$!
    cd ..
    
    # Wait for services to start
    sleep 5
    
    print_message "✅ All services started successfully!" $GREEN
    echo ""
}

# Function to display service URLs
show_urls() {
    print_message "🌍 Service URLs:" $PURPLE
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│  🌐 Client Application:    http://localhost:$CLIENT_PORT              │"
    echo "│  👨‍💼 Admin Panel:          http://localhost:$ADMIN_PORT              │"
    echo "│  🖥️  API Server:            http://localhost:$SERVER_PORT              │"
    echo "│  📚 API Documentation:     http://localhost:$SERVER_PORT/api-docs     │"
    echo "└─────────────────────────────────────────────────────────────┘"
    echo ""
}

# Function to show process information
show_process_info() {
    print_message "📊 Process Information:" $PURPLE
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│  Server PID:    $SERVER_PID"
    echo "│  Client PID:    $CLIENT_PID"
    echo "│  Admin PID:     $ADMIN_PID"
    echo "└─────────────────────────────────────────────────────────────┘"
    echo ""
    
    # Save PIDs to file for cleanup script
    echo "$SERVER_PID" > .server.pid
    echo "$CLIENT_PID" > .client.pid
    echo "$ADMIN_PID" > .admin.pid
}

# Function to show logs information
show_logs_info() {
    print_message "📋 Log Files:" $PURPLE
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│  Server logs:   tail -f logs/server.log                    │"
    echo "│  Client logs:   tail -f logs/client.log                    │"
    echo "│  Admin logs:    tail -f logs/admin.log                     │"
    echo "└─────────────────────────────────────────────────────────────┘"
    echo ""
}

# Function to handle cleanup
cleanup() {
    print_message "🧹 Cleaning up processes..." $YELLOW
    
    if [[ -n $SERVER_PID ]]; then
        kill $SERVER_PID 2>/dev/null || true
    fi
    
    if [[ -n $CLIENT_PID ]]; then
        kill $CLIENT_PID 2>/dev/null || true
    fi
    
    if [[ -n $ADMIN_PID ]]; then
        kill $ADMIN_PID 2>/dev/null || true
    fi
    
    # Clean up PID files
    rm -f .server.pid .client.pid .admin.pid
    
    print_message "✅ Cleanup completed" $GREEN
    exit 0
}

# Function to show help
show_help() {
    echo "Usage: ./start-all.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --install     Install dependencies before starting"
    echo "  --docker      Use Docker Compose instead of local development"
    echo "  --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./start-all.sh                    # Start all services"
    echo "  ./start-all.sh --install          # Install dependencies and start"
    echo "  ./start-all.sh --docker           # Use Docker Compose"
    echo ""
}

# Function to start with Docker
start_docker() {
    print_message "🐳 Starting with Docker Compose..." $BLUE
    
    if ! command -v docker &> /dev/null; then
        print_message "❌ Docker is not installed" $RED
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_message "❌ Docker Compose is not installed" $RED
        exit 1
    fi
    
    # Stop any existing containers
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    
    # Start services with Docker Compose
    docker-compose -f docker-compose.dev.yml up --build -d
    
    print_message "✅ Docker services started successfully!" $GREEN
    echo ""
    
    print_message "🌍 Service URLs (Docker):" $PURPLE
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│  🌐 Client Application:    http://localhost:5173               │"
    echo "│  👨‍💼 Admin Panel:          http://localhost:5174               │"
    echo "│  🖥️  API Server:            http://localhost:4000               │"
    echo "│  🗄️  MongoDB Express:       http://localhost:8081               │"
    echo "│  📊 Redis Commander:       http://localhost:8082               │"
    echo "└─────────────────────────────────────────────────────────────┘"
    echo ""
    
    print_message "📊 View logs with: docker-compose -f docker-compose.dev.yml logs -f" $CYAN
    print_message "🛑 Stop services with: docker-compose -f docker-compose.dev.yml down" $CYAN
    
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Main script execution
main() {
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --install)
                INSTALL_DEPS=true
                shift
                ;;
            --docker)
                USE_DOCKER=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_message "❌ Unknown option: $1" $RED
                show_help
                exit 1
                ;;
        esac
    done
    
    # Print banner
    print_banner
    
    # Check if Docker mode is requested
    if [[ "$USE_DOCKER" == "true" ]]; then
        start_docker
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Install dependencies if requested
    if [[ "$INSTALL_DEPS" == "true" ]]; then
        install_dependencies
    fi
    
    # Start services
    start_services
    
    # Show information
    show_urls
    show_process_info
    show_logs_info
    
    print_message "🎉 All services are running!" $GREEN
    print_message "📝 Press Ctrl+C to stop all services" $YELLOW
    
    # Wait for user to stop services
    while true; do
        sleep 1
    done
}

# Run main function
main "$@"
