#!/bin/bash

# =============================================================================
# Face Recognition Attendance System - Stop Script
# Created by Aayush Vaghela (https://github.com/AAYUSH412)
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_message() {
    echo -e "${2}${1}${NC}"
}

# Function to print banner
print_banner() {
    echo -e "${CYAN}"
    echo "=============================================================================="
    echo "🛑 Face Recognition Attendance System - Stop All Services"
    echo "=============================================================================="
    echo -e "${NC}"
    echo -e "${YELLOW}Created by Aayush Vaghela${NC}"
    echo ""
}

# Function to stop local services
stop_local_services() {
    print_message "🛑 Stopping local development services..." $BLUE
    
    # Stop services using PID files
    if [[ -f .server.pid ]]; then
        SERVER_PID=$(cat .server.pid)
        if kill -0 $SERVER_PID 2>/dev/null; then
            kill $SERVER_PID
            print_message "✅ Server stopped (PID: $SERVER_PID)" $GREEN
        fi
        rm -f .server.pid
    fi
    
    if [[ -f .client.pid ]]; then
        CLIENT_PID=$(cat .client.pid)
        if kill -0 $CLIENT_PID 2>/dev/null; then
            kill $CLIENT_PID
            print_message "✅ Client stopped (PID: $CLIENT_PID)" $GREEN
        fi
        rm -f .client.pid
    fi
    
    if [[ -f .admin.pid ]]; then
        ADMIN_PID=$(cat .admin.pid)
        if kill -0 $ADMIN_PID 2>/dev/null; then
            kill $ADMIN_PID
            print_message "✅ Admin panel stopped (PID: $ADMIN_PID)" $GREEN
        fi
        rm -f .admin.pid
    fi
    
    # Also try to kill by port
    print_message "🔍 Checking for any remaining processes on ports 3000, 4000, 5173, 5174..." $CYAN
    
    for port in 3000 4000 5173 5174; do
        PID=$(lsof -ti:$port 2>/dev/null || true)
        if [[ -n "$PID" ]]; then
            kill $PID 2>/dev/null || true
            print_message "✅ Stopped process on port $port (PID: $PID)" $GREEN
        fi
    done
}

# Function to stop Docker services
stop_docker_services() {
    print_message "🐳 Stopping Docker services..." $BLUE
    
    if command -v docker-compose &> /dev/null; then
        # Stop development environment
        if [[ -f docker-compose.dev.yml ]]; then
            docker-compose -f docker-compose.dev.yml down
            print_message "✅ Development Docker services stopped" $GREEN
        fi
        
        # Stop production environment
        if [[ -f docker-compose.yml ]]; then
            docker-compose down
            print_message "✅ Production Docker services stopped" $GREEN
        fi
    else
        print_message "ℹ️  Docker Compose not found, skipping Docker cleanup" $YELLOW
    fi
}

# Function to show help
show_help() {
    echo "Usage: ./stop-all.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --docker-only    Stop only Docker services"
    echo "  --local-only     Stop only local services"
    echo "  --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./stop-all.sh                    # Stop all services (local and Docker)"
    echo "  ./stop-all.sh --docker-only      # Stop only Docker services"
    echo "  ./stop-all.sh --local-only       # Stop only local services"
    echo ""
}

# Main script execution
main() {
    local DOCKER_ONLY=false
    local LOCAL_ONLY=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --docker-only)
                DOCKER_ONLY=true
                shift
                ;;
            --local-only)
                LOCAL_ONLY=true
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
    
    # Stop services based on options
    if [[ "$DOCKER_ONLY" == "true" ]]; then
        stop_docker_services
    elif [[ "$LOCAL_ONLY" == "true" ]]; then
        stop_local_services
    else
        stop_local_services
        stop_docker_services
    fi
    
    print_message "🎉 All specified services have been stopped!" $GREEN
    print_message "💡 Run './start-all.sh' to start services again" $CYAN
}

# Run main function
main "$@"
