#!/bin/bash

# Deployment script for Juridence application
# This script deploys both frontend and backend to the server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server configuration
SERVER_IP="62.171.137.28"
SERVER_USER="root"
SERVER_PASS="OJTn3IDq6umk6FagN"
APP_DIR="/home/juridence/juridence"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if build directory exists
if [ ! -d "build" ]; then
    print_error "Build directory not found. Please run 'npm run build' first."
    exit 1
fi

print_status "Starting deployment to ${SERVER_IP}..."

# Install sshpass if not available (for password-based SSH)
if ! command -v sshpass &> /dev/null; then
    print_warning "sshpass not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if ! command -v brew &> /dev/null; then
            print_error "Homebrew not found. Please install it first: https://brew.sh"
            exit 1
        fi
        brew install hudochenkov/sshpass/sshpass
    else
        sudo apt-get update && sudo apt-get install -y sshpass
    fi
fi

# Function to run SSH command
ssh_cmd() {
    sshpass -p "${SERVER_PASS}" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "$@"
}

# Function to run SCP command
scp_cmd() {
    sshpass -p "${SERVER_PASS}" scp -o StrictHostKeyChecking=no -r "$@"
}

print_status "Checking server connection..."
if ! ssh_cmd "echo 'Connection successful'"; then
    print_error "Failed to connect to server"
    exit 1
fi

print_success "Server connection established"

# Install system dependencies
print_status "Installing system dependencies..."
ssh_cmd "apt-get update -qq && apt-get install -y -qq python3.12 python3.12-venv python3.12-dev python3-pip nginx git postgresql-client build-essential libssl-dev libffi-dev python3-dev curl wget || true"

# Check if Node.js is installed, install if not
print_status "Checking Node.js installation..."
if ! ssh_cmd "node --version &>/dev/null"; then
    print_status "Installing Node.js 18.x..."
    ssh_cmd "curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y -qq nodejs"
fi

print_success "System dependencies installed"

# Create application directory structure on server
print_status "Setting up server directory structure..."
ssh_cmd "mkdir -p ${APP_DIR}/backend ${APP_DIR}/build /home/juridence/backups"

# Check if juridence user exists, create if not
print_status "Checking for juridence user..."
if ! ssh_cmd "id -u juridence &>/dev/null"; then
    print_status "Creating juridence user..."
    ssh_cmd "useradd -m -s /bin/bash juridence || true"
    ssh_cmd "mkdir -p /home/juridence/juridence"
    ssh_cmd "chown -R juridence:juridence /home/juridence"
fi

# Upload frontend build files
print_status "Uploading frontend build files..."
cd build
tar -czf /tmp/frontend.tar.gz .
cd ..

scp_cmd /tmp/frontend.tar.gz "${SERVER_USER}@${SERVER_IP}:/tmp/frontend.tar.gz"
ssh_cmd "mkdir -p ${APP_DIR}/build && cd ${APP_DIR}/build && tar -xzf /tmp/frontend.tar.gz && rm /tmp/frontend.tar.gz"
rm /tmp/frontend.tar.gz

print_success "Frontend files uploaded"

# Upload backend files (excluding venv, __pycache__, etc.)
print_status "Uploading backend files..."
cd backend
tar --exclude='venv' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.env' \
    --exclude='*.log' \
    --exclude='.git' \
    --exclude='uploads' \
    -czf /tmp/backend.tar.gz .
cd ..

scp_cmd /tmp/backend.tar.gz "${SERVER_USER}@${SERVER_IP}:/tmp/backend.tar.gz"
ssh_cmd "cd ${APP_DIR}/backend && tar -xzf /tmp/backend.tar.gz && rm /tmp/backend.tar.gz"
rm /tmp/backend.tar.gz

print_success "Backend files uploaded"

# Create .env file on server with database credentials
print_status "Creating .env file on server..."
ssh_cmd "cat > ${APP_DIR}/backend/.env << 'EOF'
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=62579011
POSTGRES_DATABASE=juridence
DATABASE_URL_ENV=postgresql://postgres:62579011@localhost:5432/juridence
SECRET_KEY=$(openssl rand -hex 32)
DEBUG=False
FRONTEND_URL=https://juridence.net
EOF"

# Create uploads directory
print_status "Creating uploads directory..."
ssh_cmd "mkdir -p ${APP_DIR}/backend/uploads"

# Set proper permissions
print_status "Setting file permissions..."
ssh_cmd "chown -R juridence:juridence ${APP_DIR}"
ssh_cmd "chmod +x ${APP_DIR}/backend/main.py || true"

# Setup Python virtual environment and install dependencies
print_status "Setting up Python environment..."
# Find available Python
PYTHON_BIN=$(ssh_cmd "which python3.11 2>/dev/null || which python3.12 2>/dev/null || which python3 2>/dev/null || echo '/usr/local/bin/python3.11'")
ssh_cmd "su - juridence -c 'cd ${APP_DIR}/backend && ${PYTHON_BIN} -m venv venv || true'"
ssh_cmd "su - juridence -c 'cd ${APP_DIR}/backend && source venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt'"

print_success "Python dependencies installed"

# Create systemd service file for backend
print_status "Creating systemd service..."
# Determine Python version
PYTHON_CMD=$(ssh_cmd "which python3.12 2>/dev/null || which python3 2>/dev/null || echo 'python3'")
ssh_cmd "cat > /etc/systemd/system/juridence-backend.service << 'EOFSERVICE'
[Unit]
Description=Juridence Backend Service
After=network.target postgresql.service

[Service]
Type=exec
User=juridence
Group=juridence
WorkingDirectory=${APP_DIR}/backend
Environment=PATH=${APP_DIR}/backend/venv/bin
EnvironmentFile=${APP_DIR}/backend/.env
ExecStart=${APP_DIR}/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOFSERVICE"

# Create Nginx configuration
print_status "Configuring Nginx..."
ssh_cmd "cat > /etc/nginx/sites-available/juridence << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root ${APP_DIR}/build;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options \"SAMEORIGIN\" always;
        add_header X-XSS-Protection \"1; mode=block\" always;
        add_header X-Content-Type-Options \"nosniff\" always;
        add_header Referrer-Policy \"no-referrer-when-downgrade\" always;
        add_header Content-Security-Policy \"default-src 'self' http: https: data: blob: 'unsafe-inline'\" always;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend uploads (different path to avoid conflict with build static files)
    location /uploads/ {
        alias ${APP_DIR}/backend/uploads/;
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }

    # File upload size limit
    client_max_body_size 100M;
}
EOF"

# Enable Nginx site
ssh_cmd "ln -sf /etc/nginx/sites-available/juridence /etc/nginx/sites-enabled/"
ssh_cmd "rm -f /etc/nginx/sites-enabled/default"

# Test Nginx configuration
print_status "Testing Nginx configuration..."
if ssh_cmd "nginx -t"; then
    print_success "Nginx configuration is valid"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Reload systemd and enable/start services
print_status "Starting services..."
ssh_cmd "systemctl daemon-reload"
ssh_cmd "systemctl enable juridence-backend"
ssh_cmd "systemctl restart juridence-backend"
ssh_cmd "systemctl restart nginx"

# Check service status
print_status "Checking service status..."
if ssh_cmd "systemctl is-active --quiet juridence-backend"; then
    print_success "Backend service is running"
else
    print_warning "Backend service may not be running. Check logs with: ssh ${SERVER_USER}@${SERVER_IP} 'journalctl -u juridence-backend -n 50'"
fi

if ssh_cmd "systemctl is-active --quiet nginx"; then
    print_success "Nginx is running"
else
    print_warning "Nginx may not be running. Check logs with: ssh ${SERVER_USER}@${SERVER_IP} 'tail -f /var/log/nginx/error.log'"
fi

print_success "Deployment completed!"
print_status "Application should be accessible at:"
echo "  - Frontend: http://${SERVER_IP}"
echo "  - Backend API: http://${SERVER_IP}/api/health"
echo ""
print_status "Useful commands:"
echo "  - Check backend logs: ssh ${SERVER_USER}@${SERVER_IP} 'journalctl -u juridence-backend -f'"
echo "  - Check Nginx logs: ssh ${SERVER_USER}@${SERVER_IP} 'tail -f /var/log/nginx/error.log'"
echo "  - Restart backend: ssh ${SERVER_USER}@${SERVER_IP} 'systemctl restart juridence-backend'"
echo "  - Restart Nginx: ssh ${SERVER_USER}@${SERVER_IP} 'systemctl restart nginx'"

