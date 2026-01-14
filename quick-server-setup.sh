#!/bin/bash

# Quick Server Setup Script for Juridence Case Hearing Management App
# Server IP: 62.171.137.28
# Run this script on your local machine to set up the server

echo "🚀 Starting Juridence Server Setup..."
echo "Server IP: 62.171.137.28"
echo "=================================="

# Check if SSH key exists, if not create one
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "📝 Creating SSH key..."
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
fi

# Copy SSH key to server
echo "🔑 Copying SSH key to server..."
ssh-copy-id root@62.171.137.28

# Run the main setup script on the server
echo "📦 Running setup on server..."
ssh root@62.171.137.28 << 'EOF'
#!/bin/bash

echo "🔄 Updating system packages..."
apt update && apt upgrade -y

echo "📦 Installing essential packages..."
apt install -y curl wget git vim unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

echo "🐍 Installing Python 3.11..."
apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

echo "🗄️ Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib postgresql-client

echo "🟢 Installing Node.js 18 LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

echo "🌐 Installing Nginx..."
apt install -y nginx

echo "⚙️ Installing PM2..."
npm install -g pm2 serve

echo "🔧 Starting services..."
systemctl start postgresql
systemctl enable postgresql
systemctl start nginx
systemctl enable nginx

echo "📁 Creating application directory..."
mkdir -p /var/www/juridence
chown -R www-data:www-data /var/www/juridence

echo "🗃️ Setting up PostgreSQL database..."
sudo -u postgres psql << 'EOL'
CREATE DATABASE juridence_db;
CREATE USER juridence_user WITH PASSWORD 'JuridenceSecure2024!';
ALTER USER juridence_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE juridence_db TO juridence_user;
\q
EOL

echo "🔥 Configuring firewall..."
apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

echo "✅ Basic server setup completed!"
echo "Next steps:"
echo "1. Clone the repository"
echo "2. Setup the application"
echo "3. Configure Nginx"
EOF

echo "🎉 Server basic setup completed!"
echo "=================================="
echo "Next, let's deploy your application..."
