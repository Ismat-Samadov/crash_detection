# Docker Deployment - Quick Start

## One-Command Deployment

```bash
./deploy_docker.sh
```

That's it! The dashboard will be available at **http://localhost:8000**

---

## Prerequisites

1. **Install Docker Desktop**
   - macOS: https://www.docker.com/products/docker-desktop
   - Or: `brew install --cask docker`

2. **Start Docker Desktop**
   - Make sure Docker is running (check system tray/menu bar)

---

## Deployment Methods

### Method 1: Automated Script (Recommended)

```bash
# Simple deployment
./deploy_docker.sh

# With Nginx reverse proxy (production)
./deploy_docker.sh --production

# Show logs after deployment
./deploy_docker.sh --logs
```

### Method 2: Docker Compose

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Method 3: Plain Docker

```bash
# Build image
docker build -t pipeline-monitor .

# Run container
docker run -d -p 8000:8000 \
  -v $(pwd)/artifacts:/app/artifacts:ro \
  pipeline-monitor
```

---

## Access Points

| Service | URL |
|---------|-----|
| **Dashboard** | http://localhost:8000 |
| **API Docs** | http://localhost:8000/docs |
| **Health Check** | http://localhost:8000/api/health |
| **WebSocket** | ws://localhost:8000/ws/realtime |

---

## Common Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f pipeline-dashboard

# Restart
docker-compose restart

# Stop
docker-compose down

# Rebuild
docker-compose up -d --build

# Clean up everything
docker-compose down -v
docker system prune -a
```

---

## Troubleshooting

### Docker not running?
```bash
# macOS
open -a Docker

# Linux
sudo systemctl start docker
```

### Port 8000 already in use?
```bash
# Find and kill process
lsof -ti:8000 | xargs kill -9

# Or edit docker-compose.yml to use different port
ports:
  - "9000:8000"
```

### Container won't start?
```bash
# Check logs
docker-compose logs pipeline-dashboard

# Run interactively for debugging
docker run -it --rm pipeline-monitor bash
```

---

## Production Deployment

For production with Nginx reverse proxy:

```bash
./deploy_docker.sh --production
```

Access via: http://localhost:80

---

## File Structure

```
crash_detection/
├── Dockerfile                  # Main Docker image definition
├── docker-compose.yml          # Multi-container orchestration
├── .dockerignore              # Files to exclude from build
├── nginx.conf                 # Nginx reverse proxy config
├── deploy_docker.sh           # Automated deployment script
└── DOCKER_DEPLOYMENT.md       # Detailed documentation
```

---

## Next Steps

1. ✅ **Start Docker Desktop**
2. ✅ **Run deployment script:** `./deploy_docker.sh`
3. ✅ **Open browser:** http://localhost:8000
4. ✅ **View real-time monitoring**

For detailed documentation, see **DOCKER_DEPLOYMENT.md**

---

**Ready to deploy!** 🐳 Run `./deploy_docker.sh` to get started.
