#!/bin/bash

# Deployment script for Face Recognition Attendance System
# Created by Aayush Vaghela (https://github.com/AAYUSH412)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project information
PROJECT_NAME="Face Recognition Attendance System"
VERSION="1.0.0"
AUTHOR="Aayush Vaghela"
GITHUB_URL="https://github.com/AAYUSH412"

# Functions
print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}🚀 $PROJECT_NAME Deployment Script${NC}"
    echo -e "${BLUE}Version: $VERSION${NC}"
    echo -e "${BLUE}Created by: $AUTHOR${NC}"
    echo -e "${BLUE}GitHub: $GITHUB_URL${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Check if Docker is installed and running
check_docker() {
    print_info "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    
    print_success "Docker is installed and running"
}

# Check if Docker Compose is installed
check_docker_compose() {
    print_info "Checking Docker Compose installation..."
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker Compose is available"
}

# Setup environment file
setup_environment() {
    print_info "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_warning "Environment file created from .env.example"
            print_warning "Please update the .env file with your actual configuration before proceeding"
            read -p "Press Enter to continue after updating .env file..."
        else
            print_error ".env.example file not found. Please create environment configuration manually."
            exit 1
        fi
    else
        print_success "Environment file already exists"
    fi
}

# Create necessary directories
create_directories() {
    print_info "Creating necessary directories..."
    
    mkdir -p uploads
    mkdir -p logs
    mkdir -p backups
    
    print_success "Directories created successfully"
}

# Build and start services
deploy_development() {
    print_info "Deploying development environment..."
    
    # Stop any existing containers
    docker-compose -f docker-compose.dev.yml down --remove-orphans
    
    # Build and start services
    docker-compose -f docker-compose.dev.yml up --build -d
    
    print_success "Development environment deployed successfully"
    print_info "Services:"
    print_info "- Client (React): http://localhost:5173"
    print_info "- Admin (React): http://localhost:5174"
    print_info "- Server (Node.js): http://localhost:4000"
    print_info "- MongoDB: localhost:27017"
    print_info "- Mongo Express: http://localhost:8081 (admin:admin123)"
    print_info "- Redis: localhost:6379"
    print_info "- Redis Commander: http://localhost:8082 (admin:admin123)"
}

# Deploy production environment
deploy_production() {
    print_info "Deploying production environment..."
    
    # Stop any existing containers
    docker-compose down --remove-orphans
    
    # Build and start services
    docker-compose up --build -d
    
    print_success "Production environment deployed successfully"
    print_info "Services:"
    print_info "- Application: http://localhost"
    print_info "- Admin Panel: http://localhost/admin"
    print_info "- API: http://localhost:4000"
    print_info "- MongoDB: localhost:27017"
}

# Deploy with analytics
deploy_with_analytics() {
    print_info "Deploying with analytics stack..."
    
    # Stop any existing containers
    docker-compose down --remove-orphans
    
    # Build and start services with analytics profile
    docker-compose --profile analytics up --build -d
    
    print_success "Environment with analytics deployed successfully"
    print_info "Additional services:"
    print_info "- Elasticsearch: http://localhost:9200"
    print_info "- Kibana: http://localhost:5601"
}

# Show status of all services
show_status() {
    print_info "Checking service status..."
    
    echo ""
    echo "=== Development Services ==="
    docker-compose -f docker-compose.dev.yml ps
    
    echo ""
    echo "=== Production Services ==="
    docker-compose ps
}

# Show logs
show_logs() {
    local service=${1:-""}
    
    if [ -z "$service" ]; then
        print_info "Showing logs for all services..."
        docker-compose logs -f
    else
        print_info "Showing logs for service: $service"
        docker-compose logs -f "$service"
    fi
}

# Stop all services
stop_services() {
    print_info "Stopping all services..."
    
    docker-compose -f docker-compose.dev.yml down
    docker-compose down
    
    print_success "All services stopped"
}

# Clean up Docker resources
cleanup() {
    print_warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_info "Cleaning up Docker resources..."
        
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans
        docker-compose down -v --remove-orphans
        docker system prune -af --volumes
        
        print_success "Cleanup completed"
    else
        print_info "Cleanup cancelled"
    fi
}

# Backup database
backup_database() {
    print_info "Creating database backup..."
    
    timestamp=$(date +"%Y%m%d_%H%M%S")
    backup_file="backups/mongodb_backup_$timestamp.gz"
    
    mkdir -p backups
    
    docker exec fras-mongodb mongodump --archive --gzip --db face_recognition_db > "$backup_file"
    
    print_success "Database backup created: $backup_file"
}

# Main script logic
main() {
    print_header
    
    case "${1:-help}" in
        "dev"|"development")
            check_docker
            check_docker_compose
            setup_environment
            create_directories
            deploy_development
            ;;
        "prod"|"production")
            check_docker
            check_docker_compose
            setup_environment
            create_directories
            deploy_production
            ;;
        "analytics")
            check_docker
            check_docker_compose
            setup_environment
            create_directories
            deploy_with_analytics
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "${2:-}"
            ;;
        "stop")
            stop_services
            ;;
        "cleanup")
            cleanup
            ;;
        "backup")
            backup_database
            ;;
        "help"|*)
            echo "Usage: $0 {dev|prod|analytics|status|logs|stop|cleanup|backup}"
            echo ""
            echo "Commands:"
            echo "  dev          - Deploy development environment"
            echo "  prod         - Deploy production environment"
            echo "  analytics    - Deploy with analytics stack (Elasticsearch, Kibana)"
            echo "  status       - Show status of all services"
            echo "  logs [service] - Show logs (optionally for specific service)"
            echo "  stop         - Stop all services"
            echo "  cleanup      - Remove all containers, images, and volumes"
            echo "  backup       - Create database backup"
            echo "  help         - Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 dev              # Start development environment"
            echo "  $0 prod             # Start production environment"
            echo "  $0 logs mongodb     # Show MongoDB logs"
            echo "  $0 backup           # Create database backup"
            ;;
    esac
}

# Run main function with all arguments
main "$@"
