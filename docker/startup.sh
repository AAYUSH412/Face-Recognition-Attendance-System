#!/bin/sh

# Face Recognition Attendance System Startup Script
# Created by Aayush Vaghela (https://github.com/AAYUSH412)

set -e

echo "🚀 Starting Face Recognition Attendance System..."
echo "📅 Date: $(date)"
echo "🏷️  Version: 1.0.0"
echo "👨‍💻 Created by: Aayush Vaghela"

# Create necessary directories
mkdir -p /var/log/supervisor
mkdir -p /var/run

# Set permissions
chown -R nginx:nginx /var/lib/nginx/
chmod -R 755 /var/lib/nginx/

# Start supervisor which will manage nginx and node server
echo "🔧 Starting services..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
