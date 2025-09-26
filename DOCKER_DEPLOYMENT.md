# CBMS Docker Deployment Guide

This guide explains how to deploy the CBMS system using Docker containers.

## 🐳 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM
- At least 10GB free disk space

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/cbms.git
cd cbms
```

### 2. Environment Setup
```bash
# Copy environment files
cp server/env.example server/.env
cp client/env.example client/.env
cp env.production.example .env.production

# Edit the environment files with your settings
nano server/.env
nano client/.env
nano .env.production
```

### 3. Start Development Environment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB Express**: http://localhost:8081 (admin/admin123)
- **MongoDB**: localhost:27017

## 🔧 Development Setup

### Services Included
- **cbms-server**: Node.js backend API
- **cbms-client**: React frontend
- **mongodb**: MongoDB database
- **redis**: Redis cache (optional)
- **mongo-express**: Database admin UI

### Environment Variables

#### Server (.env)
```env
MONGO_URI=mongodb://admin:password123@mongodb:27017/cbms?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_change_in_production
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

#### Client (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=CBMS
REACT_APP_VERSION=1.0.0
```

### Useful Commands

```bash
# Build and start services
docker-compose up --build

# Start specific service
docker-compose up cbms-server

# View service logs
docker-compose logs cbms-server

# Execute commands in container
docker-compose exec cbms-server npm install
docker-compose exec mongodb mongosh

# Restart service
docker-compose restart cbms-server

# Remove all containers and volumes
docker-compose down -v
```

## 🏭 Production Deployment

### 1. Production Environment Setup
```bash
# Copy production environment
cp env.production.example .env.production

# Edit production settings
nano .env.production
```

### 2. Deploy Production Stack
```bash
# Deploy production stack
docker-compose -f docker-compose.prod.yml up -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. SSL Configuration (Optional)
```bash
# Create SSL directory
mkdir -p nginx/ssl

# Copy your SSL certificates
cp your-cert.pem nginx/ssl/cert.pem
cp your-key.pem nginx/ssl/key.pem

# Update nginx configuration
nano nginx/nginx.conf
```

## 📊 Monitoring and Maintenance

### Health Checks
All services include health checks:
```bash
# Check service health
docker-compose ps

# View health check logs
docker-compose logs cbms-server | grep health
```

### Database Backup
```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --out /backup

# Restore MongoDB
docker-compose exec mongodb mongorestore /backup
```

### Log Management
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs cbms-server
docker-compose logs cbms-client
docker-compose logs mongodb

# Follow logs in real-time
docker-compose logs -f cbms-server
```

### Resource Monitoring
```bash
# View resource usage
docker stats

# View container details
docker inspect cbms-server
```

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use strong passwords for production
- Rotate API keys regularly

### 2. Network Security
- Use Docker networks for service isolation
- Configure firewall rules
- Enable SSL/TLS in production

### 3. Container Security
- Run containers as non-root users
- Keep base images updated
- Scan images for vulnerabilities

### 4. Database Security
- Use strong MongoDB passwords
- Enable authentication
- Configure network access

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000

# Change ports in docker-compose.yml
ports:
  - "3001:80"  # Change from 3000:80
```

#### 2. Database Connection Issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Test MongoDB connection
docker-compose exec cbms-server node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection failed:', err));
"
```

#### 3. Build Failures
```bash
# Clean build cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### 4. Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Fix Docker permissions
sudo usermod -aG docker $USER
```

### Debug Mode
```bash
# Enable debug logging
docker-compose -f docker-compose.yml -f docker-compose.debug.yml up
```

## 📈 Performance Optimization

### 1. Resource Limits
```yaml
services:
  cbms-server:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

### 2. Caching
- Enable Redis caching
- Configure CDN for static assets
- Use Docker layer caching

### 3. Database Optimization
- Create appropriate indexes
- Configure connection pooling
- Monitor query performance

## 🔄 Updates and Maintenance

### 1. Application Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```

### 2. Database Migrations
```bash
# Run migrations
docker-compose exec cbms-server npm run migrate

# Backup before migration
docker-compose exec mongodb mongodump --out /backup/pre-migration
```

### 3. Security Updates
```bash
# Update base images
docker-compose pull

# Rebuild with updated images
docker-compose up --build -d
```

## 📞 Support

For Docker-related issues:
- Check Docker logs: `docker-compose logs`
- Verify environment variables
- Test individual services
- Check network connectivity

For CBMS-specific issues:
- Check application logs
- Verify database connections
- Test API endpoints
- Review configuration files
