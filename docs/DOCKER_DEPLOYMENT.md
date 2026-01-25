# Docker Deployment Guide - Gas Pipeline Monitoring System

## Overview

This guide provides complete instructions for deploying the Gas Pipeline Monitoring Dashboard using Docker and Docker Compose.

---

## Prerequisites

### 1. Install Docker Desktop

**macOS:**
```bash
# Download from: https://www.docker.com/products/docker-desktop
# Or install via Homebrew:
brew install --cask docker
```

**Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
```

**Windows:**
```
Download from: https://www.docker.com/products/docker-desktop
```

### 2. Verify Installation

```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker-compose --version

# Test Docker installation
docker run hello-world
```

---

## Quick Start

### 1. Start Docker Desktop

Make sure Docker Desktop is running (you should see the Docker icon in your system tray/menu bar).

### 2. Deploy with Docker Compose

```bash
# Navigate to project directory
cd /Users/ismatsamadov/crash_detection

# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f pipeline-dashboard

# Access dashboard
open http://localhost:8000
```

### 3. Stop the Application

```bash
# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## Deployment Options

### Option 1: Simple Deployment (Recommended for Development)

```bash
# Build and start in one command
docker-compose up --build -d

# Check status
docker-compose ps

# View real-time logs
docker-compose logs -f
```

**Access:**
- Dashboard: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/health

### Option 2: Production Deployment with Nginx

```bash
# Start with Nginx reverse proxy
docker-compose --profile production up -d

# Access via Nginx
open http://localhost:80
```

**Features:**
- Nginx reverse proxy for better performance
- WebSocket support
- Static file caching
- Production-grade configuration

### Option 3: Manual Docker Build

```bash
# Build the image
docker build -t pipeline-monitor:latest .

# Run the container
docker run -d \
  --name gas-pipeline-dashboard \
  -p 8000:8000 \
  -v $(pwd)/artifacts:/app/artifacts:ro \
  -v $(pwd)/outputs:/app/outputs:ro \
  -v $(pwd)/charts:/app/charts:ro \
  pipeline-monitor:latest

# View logs
docker logs -f gas-pipeline-dashboard

# Stop container
docker stop gas-pipeline-dashboard
docker rm gas-pipeline-dashboard
```

---

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Application Settings
APP_HOST=0.0.0.0
APP_PORT=8000
APP_RELOAD=false

# Logging
LOG_LEVEL=info

# ML Model
MODEL_PATH=/app/artifacts/production_pipeline.joblib
```

Update `docker-compose.yml`:
```yaml
services:
  pipeline-dashboard:
    env_file:
      - .env
```

### Custom Port Mapping

To use a different port (e.g., 9000):

```bash
# Edit docker-compose.yml
ports:
  - "9000:8000"

# Or use environment variable
docker-compose up -d -e PORT=9000
```

---

## Docker Commands Reference

### Building

```bash
# Build without cache
docker-compose build --no-cache

# Build specific service
docker-compose build pipeline-dashboard

# Build with build arguments
docker build --build-arg PYTHON_VERSION=3.10 -t pipeline-monitor .
```

### Running

```bash
# Start in foreground (see logs)
docker-compose up

# Start in background (detached)
docker-compose up -d

# Start specific service
docker-compose up -d pipeline-dashboard

# Restart services
docker-compose restart

# Force recreate containers
docker-compose up -d --force-recreate
```

### Monitoring

```bash
# View running containers
docker-compose ps

# View all logs
docker-compose logs

# Follow logs (live)
docker-compose logs -f

# View logs for specific service
docker-compose logs -f pipeline-dashboard

# View last 100 lines
docker-compose logs --tail=100

# Check resource usage
docker stats gas-pipeline-dashboard
```

### Maintenance

```bash
# Stop services
docker-compose stop

# Start stopped services
docker-compose start

# Stop and remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove containers, volumes, and images
docker-compose down -v --rmi all

# Prune unused Docker resources
docker system prune -a
```

### Debugging

```bash
# Execute command in running container
docker-compose exec pipeline-dashboard bash

# Check container health
docker inspect --format='{{.State.Health.Status}}' gas-pipeline-dashboard

# View container details
docker inspect gas-pipeline-dashboard

# Copy files from container
docker cp gas-pipeline-dashboard:/app/logs ./local-logs
```

---

## Production Deployment

### 1. Multi-Stage Build (Optimized)

Update `Dockerfile` for smaller image size:

```dockerfile
# Build stage
FROM python:3.10-slim as builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Runtime stage
FROM python:3.10-slim

WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .

ENV PATH=/root/.local/bin:$PATH

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Docker Swarm Deployment

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml pipeline-stack

# List services
docker service ls

# Scale service
docker service scale pipeline-stack_pipeline-dashboard=3

# Remove stack
docker stack rm pipeline-stack
```

### 3. Kubernetes Deployment

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pipeline-dashboard
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pipeline-dashboard
  template:
    metadata:
      labels:
        app: pipeline-dashboard
    spec:
      containers:
      - name: dashboard
        image: pipeline-monitor:latest
        ports:
        - containerPort: 8000
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: pipeline-service
spec:
  selector:
    app: pipeline-dashboard
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer
```

Deploy:
```bash
kubectl apply -f k8s-deployment.yaml
kubectl get pods
kubectl get services
```

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/docker-build.yml`:

```yaml
name: Docker Build and Push

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Build Docker image
      run: docker build -t pipeline-monitor:${{ github.sha }} .

    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push pipeline-monitor:${{ github.sha }}
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
build:
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t pipeline-monitor:$CI_COMMIT_SHA .
    - docker push pipeline-monitor:$CI_COMMIT_SHA
```

---

## Troubleshooting

### Issue: Port Already in Use

**Error:** `Bind for 0.0.0.0:8000 failed: port is already allocated`

**Solution:**
```bash
# Find process using port 8000
lsof -ti:8000

# Kill the process
kill -9 $(lsof -ti:8000)

# Or use a different port
docker-compose up -d -e PORT=9000
```

### Issue: Docker Daemon Not Running

**Error:** `Cannot connect to the Docker daemon`

**Solution:**
```bash
# macOS: Start Docker Desktop application
open -a Docker

# Linux: Start Docker service
sudo systemctl start docker

# Verify
docker info
```

### Issue: Build Fails - No Space Left

**Error:** `no space left on device`

**Solution:**
```bash
# Clean up Docker resources
docker system prune -a --volumes

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

### Issue: Container Exits Immediately

**Error:** Container status shows "Exited (1)"

**Solution:**
```bash
# Check logs for error details
docker-compose logs pipeline-dashboard

# Run container in interactive mode for debugging
docker run -it --rm pipeline-monitor:latest bash

# Test application manually
docker run -it --rm pipeline-monitor:latest python -c "from app.main import app; print('OK')"
```

### Issue: WebSocket Connection Fails

**Error:** WebSocket connection refused or timeout

**Solution:**
```bash
# Check if container is running
docker-compose ps

# Verify port mapping
docker port gas-pipeline-dashboard

# Test WebSocket endpoint
# Install websocat: brew install websocat
websocat ws://localhost:8000/ws/realtime

# Check Nginx configuration if using reverse proxy
docker-compose exec nginx nginx -t
```

### Issue: Model Not Found

**Error:** `model_loaded: false` in health check

**Solution:**
```bash
# Ensure artifacts directory exists and is mounted
ls -la artifacts/

# Check volume mounts
docker inspect gas-pipeline-dashboard | grep Mounts -A 10

# Copy artifacts into container if needed
docker cp artifacts/production_pipeline.joblib gas-pipeline-dashboard:/app/artifacts/
```

---

## Performance Optimization

### 1. Enable BuildKit

```bash
# Set environment variable
export DOCKER_BUILDKIT=1

# Build with BuildKit
docker build --progress=plain -t pipeline-monitor .
```

### 2. Layer Caching

Order `Dockerfile` instructions from least to most frequently changing:

```dockerfile
# Dependencies (changes rarely)
COPY requirements.txt .
RUN pip install -r requirements.txt

# Application code (changes frequently)
COPY app/ ./app/
```

### 3. Multi-Stage Builds

Separate build and runtime stages to reduce image size:

```dockerfile
FROM python:3.10 as builder
# Build steps...

FROM python:3.10-slim
COPY --from=builder /app /app
```

### 4. Resource Limits

Limit container resources in `docker-compose.yml`:

```yaml
services:
  pipeline-dashboard:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

---

## Security Best Practices

### 1. Non-Root User

Already implemented in `Dockerfile`:
```dockerfile
RUN useradd -m -u 1000 appuser
USER appuser
```

### 2. Scan for Vulnerabilities

```bash
# Using Docker Scout
docker scout cves pipeline-monitor:latest

# Using Trivy
trivy image pipeline-monitor:latest
```

### 3. Use Secrets Management

```bash
# Docker secrets (Swarm mode)
echo "my-secret-token" | docker secret create api_token -

# Docker Compose with secrets
secrets:
  api_token:
    file: ./secrets/api_token.txt
```

### 4. Network Isolation

```yaml
networks:
  frontend:
  backend:
    internal: true  # No external access

services:
  pipeline-dashboard:
    networks:
      - frontend
      - backend
```

---

## Monitoring and Logging

### 1. Centralized Logging

```yaml
services:
  pipeline-dashboard:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 2. Health Monitoring

```bash
# Check health status
docker-compose ps

# Automatic health checks in docker-compose.yml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### 3. Prometheus Integration

Add metrics endpoint to your FastAPI app and expose:

```yaml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

---

## Common Workflows

### Development Workflow

```bash
# 1. Make code changes
vim app/main.py

# 2. Rebuild and restart
docker-compose up -d --build

# 3. View logs
docker-compose logs -f

# 4. Test changes
curl http://localhost:8000/api/health
```

### Production Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Build production image
docker build -t pipeline-monitor:v1.0 .

# 3. Tag for registry
docker tag pipeline-monitor:v1.0 registry.example.com/pipeline-monitor:v1.0

# 4. Push to registry
docker push registry.example.com/pipeline-monitor:v1.0

# 5. Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Backup and Restore

```bash
# Backup artifacts
docker run --rm -v pipeline-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/artifacts-backup.tar.gz /data

# Restore artifacts
docker run --rm -v pipeline-data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/artifacts-backup.tar.gz -C /
```

---

## Summary

### Quick Commands

| Action | Command |
|--------|---------|
| Start | `docker-compose up -d` |
| Stop | `docker-compose down` |
| Logs | `docker-compose logs -f` |
| Rebuild | `docker-compose up -d --build` |
| Status | `docker-compose ps` |
| Shell | `docker-compose exec pipeline-dashboard bash` |
| Clean | `docker system prune -a` |

### URLs

- Dashboard: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health: http://localhost:8000/api/health

---

**Docker deployment is now ready!** 🐳

Start with `docker-compose up -d` and access the dashboard at http://localhost:8000
