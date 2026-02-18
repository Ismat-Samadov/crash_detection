# Gas Pipeline Monitoring System - Deployment Guide

## Overview

This real-time monitoring dashboard showcases anomaly detection capabilities for natural gas pipeline operations in Azerbaijan. The system streams simulated pipeline data and performs ML-based anomaly detection using a trained Local Outlier Factor model.

---

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend                        │
│  ┌──────────────────────────────────────────┐  │
│  │  Dashboard (Jinja2 + HTML/CSS/JS)        │  │
│  │  - SCADA-inspired industrial design      │  │
│  │  - Real-time charts (Chart.js)           │  │
│  │  - WebSocket client                      │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────────┐
│              FastAPI Backend                     │
│  ┌──────────────────────────────────────────┐  │
│  │  REST API Endpoints                      │  │
│  │  - GET /                                 │  │
│  │  - GET /api/health                       │  │
│  │  - GET /api/historical                   │  │
│  │  - WS  /ws/realtime                      │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Data Simulator                          │  │
│  │  - Realistic sensor data generation      │  │
│  │  - Station-specific patterns             │  │
│  │  - Time-based anomaly injection          │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  ML Pipeline (LOF Model)                 │  │
│  │  - Real-time anomaly detection           │  │
│  │  - 99.99% validation consistency         │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Prerequisites

- Python 3.10+
- Virtual environment (`.venv` or `venv`)
- Trained ML model artifacts (already generated from notebook)

### 2. Installation

```bash
# Navigate to project directory
cd /Users/ismatsamadov/crash_detection

# Activate virtual environment
source .venv/bin/activate  # On macOS/Linux
# OR
.venv\Scripts\activate     # On Windows

# Install dependencies
pip install -r requirements.txt
```

### 3. Start the Application

```bash
# Start the FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Access the Dashboard

Open your web browser and navigate to:

```
http://localhost:8000
```

---

## API Endpoints

### 1. Dashboard (GET /)
- **Description**: Main SCADA dashboard interface
- **Response**: HTML page with real-time monitoring
- **Features**:
  - Live sensor readings for 3 stations
  - Animated pipeline visualization
  - Real-time pressure and flow charts
  - Anomaly detection alerts

### 2. Health Check (GET /api/health)
- **Description**: System health status
- **Response**:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "simulator_active": true,
  "timestamp": "2026-01-25T07:50:07.099780"
}
```

### 3. Historical Data (GET /api/historical)
- **Description**: Historical anomaly statistics
- **Response**: Location-based and hourly anomaly rates
- **Data Includes**:
  - Anomaly rates by location (Mardakan, Sumqayit, Turkan)
  - Hourly anomaly patterns (0-23 hours)
  - Summary statistics

### 4. Real-Time Stream (WebSocket /ws/realtime)
- **Description**: Live data streaming
- **Update Frequency**: Every 2 seconds
- **Data Format**:
```json
{
  "timestamp": "2026-01-25T07:50:07.099780",
  "location": "Sumqayit",
  "sensors": {
    "density_kg_m3": 0.742,
    "pressure_diff_kpa": 12.5,
    "pressure_kpa": 485.3,
    "temperature_c": 25.4,
    "hourly_flow_m3": 12500.0,
    "total_flow_m3": 1500000.0
  },
  "is_anomaly": false,
  "anomaly_score": 0.0
}
```

---

## Dashboard Features

### Station Monitoring
- **3 Pipeline Stations**: Mardakan, Sumqayit, Turkan
- **Real-time Metrics**:
  - Flow Rate (m³/h)
  - Pressure (kPa)
  - Temperature (°C)
- **Status Indicators**:
  - Normal (Green)
  - Elevated Risk (Orange) - Sumqayit
  - Anomaly (Red) - Active alerts

### Pipeline Visualization
- Animated flow simulation
- Color-coded station status
- Real-time flow direction indicators
- SVG-based schematic

### Charts
- **Pressure Monitoring**: Live pressure trends across stations
- **Flow Rate Monitoring**: Live flow rate tracking
- **Auto-updating**: New data every 2 seconds
- **Maximum Data Points**: Last 20 readings

### Anomaly Detection
- **ML Model**: Local Outlier Factor (LOF)
- **Detection Rate**: ~1% (matches historical baseline)
- **Alert Log**: Real-time anomaly notifications
- **Visual Alerts**: Station highlighting and status changes

---

## Configuration

### Model Settings
Models are loaded from: `/artifacts/`
- `production_pipeline.joblib` - Full ML pipeline
- `feature_config.json` - Feature configuration
- `scaler.joblib` - Data scaler

### Simulator Settings
Location: `app/data_simulator.py`

```python
CONFIG = {
    # Anomaly injection rates (matches historical patterns)
    "hourly_risk": {
        0: 2.82,   # Midnight - highest risk
        23: 1.71,  # Late night
        12: 1.31,  # Noon peak
        13: 1.61   # Afternoon peak
    },

    # Location adjustments (Sumqayit has elevated risk)
    "location_adjustments": {
        "Sumqayit": {"pressure_mult": 1.05}
    }
}
```

### WebSocket Settings
Location: `app/static/js/dashboard.js`

```javascript
const CONFIG = {
    wsUrl: `ws://${window.location.host}/ws/realtime`,
    maxDataPoints: 20,
    reconnectDelay: 3000,
    chartUpdateInterval: 100
};
```

---

## Production Deployment

### Option 1: Docker (Recommended)

Create `Dockerfile`:
```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t pipeline-monitor .
docker run -p 8000:8000 pipeline-monitor
```

### Option 2: Systemd Service

Create `/etc/systemd/system/pipeline-monitor.service`:
```ini
[Unit]
Description=Gas Pipeline Monitoring System
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/crash_detection
Environment="PATH=/path/to/.venv/bin"
ExecStart=/path/to/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable pipeline-monitor
sudo systemctl start pipeline-monitor
```

### Option 3: Gunicorn with Workers

```bash
pip install gunicorn

# Production server with 4 workers
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Option 4: Nginx Reverse Proxy

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## Performance Considerations

### Resource Requirements
- **CPU**: 1-2 cores (minimal)
- **RAM**: 512MB - 1GB
- **Storage**: ~50MB (model + application)
- **Network**: WebSocket connections (1 per client)

### Scaling
- **Single Server**: Handles 100-500 concurrent users
- **Load Balancing**: Use sticky sessions for WebSocket
- **Horizontal Scaling**: Deploy multiple instances behind load balancer

### Optimization Tips
1. **Reduce Chart Data Points**: Lower `maxDataPoints` in JS config
2. **Increase Update Interval**: Change WebSocket sleep from 2s to 5s
3. **Enable Compression**: Use gzip middleware
4. **Static File CDN**: Serve CSS/JS from CDN

---

## Troubleshooting

### Issue: Model Not Loading
**Error**: `"model_loaded": false`

**Solution**:
```bash
# Ensure artifacts exist
ls artifacts/

# Should contain:
# - production_pipeline.joblib
# - feature_config.json
# - scaler.joblib

# Re-run notebook to generate artifacts
jupyter nbconvert --to notebook --execute notebooks/anomaly_detection_pipeline.ipynb
```

### Issue: WebSocket Connection Failed
**Error**: Connection timeout or refused

**Solution**:
1. Check server is running: `curl http://localhost:8000/api/health`
2. Check firewall allows port 8000
3. Verify WebSocket URL in browser console

### Issue: Static Files Not Found
**Error**: 404 on `/static/css/dashboard.css`

**Solution**:
```bash
# Ensure static files exist
ls app/static/css/
ls app/static/js/

# Check FastAPI mount path in app/main.py
```

### Issue: Import Errors
**Error**: `ModuleNotFoundError: No module named 'app'`

**Solution**:
```bash
# Ensure __init__.py exists
touch app/__init__.py

# Run from project root directory
cd /Users/ismatsamadov/crash_detection
uvicorn app.main:app
```

---

## Testing

### Manual Testing
```bash
# Health check
curl http://localhost:8000/api/health

# Historical data
curl http://localhost:8000/api/historical

# Dashboard (view in browser)
open http://localhost:8000
```

### WebSocket Testing (with `websocat`)
```bash
# Install websocat
brew install websocat  # macOS

# Test WebSocket connection
websocat ws://localhost:8000/ws/realtime
```

---

## Project Structure

```
crash_detection/
├── app/
│   ├── __init__.py                # Package init
│   ├── main.py                    # FastAPI application
│   ├── data_simulator.py          # Real-time data generator
│   ├── templates/
│   │   └── dashboard.html         # Main dashboard template
│   └── static/
│       ├── css/
│       │   └── dashboard.css      # SCADA styling
│       └── js/
│           └── dashboard.js       # Real-time updates
├── artifacts/                     # ML models (generated by notebook)
├── data/                          # Input CSV files
├── outputs/                       # Analysis outputs
├── charts/                        # Visualization charts
├── notebooks/
│   └── anomaly_detection_pipeline.ipynb
├── requirements.txt               # Python dependencies
├── README.md                      # Executive summary
└── DEPLOYMENT.md                  # This file
```

---

## Presentation Tips

### For Executive Audiences
1. **Start with Dashboard**: Show live monitoring immediately
2. **Highlight Key Metrics**: Point out Sumqayit elevated risk, midnight anomaly spike
3. **Demonstrate Anomaly Detection**: Wait for or trigger an anomaly alert
4. **Show Historical Context**: Navigate to README.md for insights

### For Technical Audiences
1. **Architecture Overview**: Explain FastAPI + WebSocket + ML pipeline
2. **Model Performance**: Show 99.99% consistency, LOF selection rationale
3. **Code Walkthrough**: Demonstrate simulator, feature engineering, pipeline
4. **API Documentation**: Test endpoints with curl/Postman

### For Stakeholders
1. **Business Value**: Early detection, predictive maintenance, cost savings
2. **Risk Mitigation**: Show how system identifies issues before failures
3. **Resource Optimization**: Data-driven maintenance scheduling
4. **Scalability**: Discuss deployment to production operations

---

## Future Enhancements

### Short-Term
- [ ] Add user authentication (OAuth2)
- [ ] Export alerts to CSV
- [ ] Email notifications for anomalies
- [ ] Historical playback feature

### Medium-Term
- [ ] Multi-model ensemble voting
- [ ] Root cause analysis AI
- [ ] Predictive failure forecasting
- [ ] Mobile-responsive design

### Long-Term
- [ ] Integration with actual SCADA systems
- [ ] Real-time model retraining
- [ ] Advanced analytics dashboard
- [ ] Multi-pipeline network support

---

## Support

### Documentation
- **API Docs**: http://localhost:8000/docs (auto-generated by FastAPI)
- **Executive Summary**: README.md
- **Analysis Details**: outputs/00_SUMMARY_REPORT.txt

### Logs
- **Application Logs**: Stdout from uvicorn process
- **Error Logs**: Check FastAPI console output
- **Access Logs**: Enable with `--access-log` flag

---

## License & Credits

**Project**: Gas Pipeline Anomaly Detection System
**Analysis Period**: January 2018 - August 2024
**Locations**: Mardakan, Sumqayit, Turkan (Azerbaijan)
**ML Model**: Local Outlier Factor (scikit-learn)
**Framework**: FastAPI + Jinja2
**Visualization**: Chart.js

**Created**: January 2026
**Purpose**: Demonstration of ML-powered operational monitoring capabilities

---

**Ready for deployment!** 🚀

For questions or issues, review the troubleshooting section or check application logs.
