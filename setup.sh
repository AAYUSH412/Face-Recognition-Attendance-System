#!/bin/bash

# Setup script for Face Recognition Attendance System
# Created by Aayush Vaghela (https://github.com/AAYUSH412)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project information
PROJECT_NAME="Face Recognition Attendance System"
VERSION="1.0.0"
AUTHOR="Aayush Vaghela"
GITHUB_URL="https://github.com/AAYUSH412"

# Functions
print_header() {
    clear
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                                                               ║${NC}"
    echo -e "${BLUE}║              🚀 $PROJECT_NAME Setup                ║${NC}"
    echo -e "${BLUE}║                                                               ║${NC}"
    echo -e "${BLUE}║              Version: $VERSION                                   ║${NC}"
    echo -e "${BLUE}║              Created by: $AUTHOR                          ║${NC}"
    echo -e "${BLUE}║              GitHub: $GITHUB_URL          ║${NC}"
    echo -e "${BLUE}║                                                               ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
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
    echo -e "${CYAN}ℹ️ $1${NC}"
}

print_step() {
    echo -e "${PURPLE}🔧 $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install Docker on macOS
install_docker_macos() {
    print_step "Installing Docker Desktop for macOS..."
    
    if command_exists brew; then
        brew install --cask docker
        print_success "Docker Desktop installed via Homebrew"
        print_warning "Please start Docker Desktop manually and return to continue"
    else
        print_warning "Homebrew not found. Please install Docker Desktop manually:"
        print_info "1. Download from: https://www.docker.com/products/docker-desktop"
        print_info "2. Install and start Docker Desktop"
        print_info "3. Re-run this script"
        exit 1
    fi
}

# Install Docker on Linux
install_docker_linux() {
    print_step "Installing Docker on Linux..."
    
    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    print_success "Docker and Docker Compose installed"
    print_warning "Please log out and log back in for group changes to take effect"
}

# Check and install Docker
check_install_docker() {
    print_step "Checking Docker installation..."
    
    if command_exists docker; then
        if docker info >/dev/null 2>&1; then
            print_success "Docker is installed and running"
        else
            print_error "Docker is installed but not running"
            print_info "Please start Docker and re-run this script"
            exit 1
        fi
    else
        print_warning "Docker not found. Installing Docker..."
        
        case "$(uname -s)" in
            Linux*)     install_docker_linux;;
            Darwin*)    install_docker_macos;;
            *)          print_error "Unsupported operating system"
                       exit 1;;
        esac
    fi
    
    # Check Docker Compose
    if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
        print_success "Docker Compose is available"
    else
        print_error "Docker Compose not found"
        exit 1
    fi
}

# Install Node.js and npm
install_nodejs() {
    print_step "Checking Node.js installation..."
    
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            print_success "Node.js $(node --version) is installed"
        else
            print_warning "Node.js version is too old. Recommended: v18+"
        fi
    else
        print_warning "Node.js not found. Installing..."
        
        case "$(uname -s)" in
            Linux*)
                curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                sudo apt-get install -y nodejs
                ;;
            Darwin*)
                if command_exists brew; then
                    brew install node
                else
                    print_error "Please install Homebrew first or install Node.js manually"
                    exit 1
                fi
                ;;
        esac
        
        print_success "Node.js installed"
    fi
}

# Setup environment configuration
setup_environment() {
    print_step "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Environment file created from .env.example"
            
            # Generate random secrets
            JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
            SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
            
            # Update .env with generated secrets
            sed -i.bak "s/your-super-secret-jwt-key-minimum-32-characters-long-for-security/$JWT_SECRET/" .env
            sed -i.bak "s/your-session-secret-key-change-this-too/$SESSION_SECRET/" .env
            
            print_success "Generated secure JWT and session secrets"
            print_warning "Please update ImageKit credentials in .env file for image uploads"
        else
            print_error ".env.example file not found"
            exit 1
        fi
    else
        print_success "Environment file already exists"
    fi
}

# Create necessary directories
create_directories() {
    print_step "Creating necessary directories..."
    
    mkdir -p uploads
    mkdir -p logs
    mkdir -p backups
    mkdir -p docker/ssl
    
    print_success "Directories created successfully"
}

# Install dependencies for manual setup
install_dependencies() {
    print_step "Installing project dependencies..."
    
    # Server dependencies
    if [ -d "server" ]; then
        print_info "Installing server dependencies..."
        cd server
        npm install
        cd ..
        print_success "Server dependencies installed"
    fi
    
    # Client dependencies
    if [ -d "client" ]; then
        print_info "Installing client dependencies..."
        cd client
        npm install
        cd ..
        print_success "Client dependencies installed"
    fi
    
    # Admin dependencies
    if [ -d "admin" ]; then
        print_info "Installing admin dependencies..."
        cd admin
        npm install
        cd ..
        print_success "Admin dependencies installed"
    fi
}

# Setup MongoDB for manual installation
setup_mongodb() {
    print_step "Checking MongoDB installation..."
    
    if command_exists mongod; then
        print_success "MongoDB is installed"
    else
        print_warning "MongoDB not found. Installing..."
        
        case "$(uname -s)" in
            Linux*)
                wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
                echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
                sudo apt-get update
                sudo apt-get install -y mongodb-org
                sudo systemctl start mongod
                sudo systemctl enable mongod
                ;;
            Darwin*)
                if command_exists brew; then
                    brew tap mongodb/brew
                    brew install mongodb-community@7.0
                    brew services start mongodb/brew/mongodb-community
                else
                    print_error "Please install Homebrew first"
                    exit 1
                fi
                ;;
        esac
        
        print_success "MongoDB installed and started"
    fi
}

# Main menu
show_menu() {
    echo ""
    echo -e "${BLUE}Please choose an installation method:${NC}"
    echo ""
    echo -e "${GREEN}1.${NC} 🐳 Docker Setup (Recommended)"
    echo -e "${GREEN}2.${NC} 🔧 Manual Setup (Traditional)"
    echo -e "${GREEN}3.${NC} ⚡ Development Setup (Docker)"
    echo -e "${GREEN}4.${NC} 📊 Analytics Setup (Docker + ELK)"
    echo -e "${GREEN}5.${NC} 🛠️ Dependencies Only"
    echo -e "${GREEN}6.${NC} ❓ Help & Documentation"
    echo ""
    echo -e "${YELLOW}Enter your choice (1-6):${NC} "
}

# Docker production setup
docker_production_setup() {
    print_step "Setting up Docker production environment..."
    
    check_install_docker
    setup_environment
    create_directories
    
    print_info "Starting production deployment..."
    chmod +x scripts/deploy.sh
    ./scripts/deploy.sh prod
    
    echo ""
    print_success "🎉 Production setup complete!"
    print_info "Access your application at:"
    print_info "  • Main App: http://localhost"
    print_info "  • Admin Panel: http://localhost/admin"
    print_info "  • API: http://localhost:4000"
}

# Docker development setup
docker_development_setup() {
    print_step "Setting up Docker development environment..."
    
    check_install_docker
    setup_environment
    create_directories
    
    print_info "Starting development deployment..."
    chmod +x scripts/deploy.sh
    ./scripts/deploy.sh dev
    
    echo ""
    print_success "🎉 Development setup complete!"
    print_info "Access your application at:"
    print_info "  • Client: http://localhost:5173"
    print_info "  • Admin: http://localhost:5174"
    print_info "  • API: http://localhost:4000"
    print_info "  • Mongo Express: http://localhost:8081 (admin:admin123)"
    print_info "  • Redis Commander: http://localhost:8082 (admin:admin123)"
}

# Docker analytics setup
docker_analytics_setup() {
    print_step "Setting up Docker environment with analytics..."
    
    check_install_docker
    setup_environment
    create_directories
    
    print_info "Starting analytics deployment..."
    chmod +x scripts/deploy.sh
    ./scripts/deploy.sh analytics
    
    echo ""
    print_success "🎉 Analytics setup complete!"
    print_info "Access your services at:"
    print_info "  • Main App: http://localhost"
    print_info "  • Admin Panel: http://localhost/admin"
    print_info "  • Elasticsearch: http://localhost:9200"
    print_info "  • Kibana: http://localhost:5601"
}

# Manual setup
manual_setup() {
    print_step "Setting up manual development environment..."
    
    install_nodejs
    setup_mongodb
    setup_environment
    create_directories
    install_dependencies
    
    echo ""
    print_success "🎉 Manual setup complete!"
    print_info "To start the application:"
    print_info "  1. Start MongoDB: mongod"
    print_info "  2. Start server: cd server && npm run dev"
    print_info "  3. Start client: cd client && npm run dev"
    print_info "  4. Start admin: cd admin && npm run dev"
}

# Dependencies only
dependencies_only() {
    print_step "Installing dependencies only..."
    
    install_nodejs
    setup_environment
    install_dependencies
    
    print_success "Dependencies installed successfully!"
}

# Show help
show_help() {
    echo ""
    print_info "📚 Face Recognition Attendance System Help"
    echo ""
    echo -e "${GREEN}Setup Options:${NC}"
    echo "  1. Docker Setup - Complete containerized solution (recommended)"
    echo "  2. Manual Setup - Traditional installation with local services"
    echo "  3. Development Setup - Docker with development tools and hot reload"
    echo "  4. Analytics Setup - Includes Elasticsearch and Kibana for analytics"
    echo ""
    echo -e "${GREEN}Requirements:${NC}"
    echo "  • Docker 20.10+ and Docker Compose 2.0+ (for Docker setups)"
    echo "  • Node.js 18+ and npm 8+ (for manual setup)"
    echo "  • MongoDB 7.0+ (for manual setup)"
    echo "  • 4GB+ RAM recommended"
    echo ""
    echo -e "${GREEN}Post-Installation:${NC}"
    echo "  • Update .env file with your ImageKit credentials"
    echo "  • Configure JWT secrets (auto-generated in Docker setup)"
    echo "  • Setup SSL certificates for production (optional)"
    echo ""
    echo -e "${GREEN}Documentation:${NC}"
    echo "  • README.md - Complete project documentation"
    echo "  • docs/PRD.md - Product requirements and technical details"
    echo "  • scripts/deploy.sh - Deployment management script"
    echo ""
    echo -e "${GREEN}Support:${NC}"
    echo "  • GitHub: $GITHUB_URL"
    echo "  • Issues: $GITHUB_URL/issues"
    echo ""
}

# Main script
main() {
    print_header
    
    # Check if already run
    if [ "$1" = "--skip-menu" ]; then
        case "$2" in
            "docker-prod") docker_production_setup ;;
            "docker-dev") docker_development_setup ;;
            "docker-analytics") docker_analytics_setup ;;
            "manual") manual_setup ;;
            *) docker_production_setup ;;
        esac
        return
    fi
    
    while true; do
        show_menu
        read -r choice
        
        case $choice in
            1)
                docker_production_setup
                break
                ;;
            2)
                manual_setup
                break
                ;;
            3)
                docker_development_setup
                break
                ;;
            4)
                docker_analytics_setup
                break
                ;;
            5)
                dependencies_only
                break
                ;;
            6)
                show_help
                echo ""
                read -p "Press Enter to continue..."
                ;;
            *)
                print_error "Invalid choice. Please select 1-6."
                sleep 2
                ;;
        esac
    done
}

# Run main function
main "$@"
