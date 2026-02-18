# Azerbaijan Gas Pipeline — SCADA Dashboard

Real-time SCADA-style anomaly detection dashboard for gas pipeline operations across **Mardakan**, **Sumqayit**, and **Turkan** monitoring stations.

Fully self-contained Next.js app — no external backend required. Deploy directly to Vercel.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Runtime | React 19 |
| Deployment | Vercel |

## Architecture

```
Browser (client)
  └─ polls GET /api/readings every 2s
        └─ Next.js API Route (serverless)
              └─ lib/simulator.ts
                    ├─ Generates realistic sensor data (Box-Muller Gaussian)
                    └─ Anomaly detection via Mahalanobis distance
                         (calibrated to chi²(0.99, 6) = 16.81 threshold)
```

No external Python backend. No WebSocket server. Zero infrastructure to manage.

## Features

- **2-second polling** — all 3 stations update simultaneously on every tick
- **Anomaly alerts** — full-screen banner + red glow on affected station cards
- **6 sensors per station** — progress bars, normal-range overlays, color-coded values
- **~1% anomaly rate** — matches the original One-Class SVM behavior
- **Midnight risk model** — anomaly probability 2.8× higher at 00:00 (from EDA)
- **Rolling anomaly log** — session history with sensor deviation highlights
- **Responsive** — mobile, tablet, and desktop layouts
- **Animated SVG favicon** — pipeline crosshair with pulsing dot

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── health/route.ts      ← GET /api/health
│   │   └── readings/route.ts    ← GET /api/readings (all 3 stations)
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                 ← Main dashboard
│   ├── icon.tsx
│   └── not-found.tsx
├── components/
│   ├── Header.tsx               ← Live clock, connection status
│   ├── StationCard.tsx          ← Per-station monitoring card
│   ├── SensorRow.tsx            ← Sensor bar + value
│   ├── SystemStats.tsx          ← KPI bar
│   ├── AnomalyLog.tsx           ← Rolling event log
│   └── ModelInfo.tsx            ← Model metadata panel
├── hooks/
│   └── usePolling.ts            ← 2-second polling with error recovery
├── lib/
│   ├── config.ts                ← Sensor configs, model metadata
│   └── simulator.ts             ← Data generation + anomaly scoring
└── types/index.ts
```

## Local Development

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Vercel Deployment

1. Push this repo to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects Next.js — click **Deploy**, done

No environment variables needed. The app is fully self-contained.

## API

| Endpoint | Description |
|---|---|
| `GET /api/readings` | Returns fresh readings for all 3 stations |
| `GET /api/health` | System health check |

### `GET /api/readings` response

```json
{
  "Mardakan": {
    "timestamp": "2026-02-18T12:00:00.000Z",
    "location": "Mardakan",
    "sensors": {
      "density_kg_m3": 0.742,
      "pressure_diff_kpa": 9.45,
      "pressure_kpa": 487.2,
      "temperature_c": 16.8,
      "hourly_flow_m3": 8.34,
      "total_flow_m3": 205.6
    },
    "is_anomaly": false,
    "anomaly_score": 0
  },
  "Sumqayit": { ... },
  "Turkan": { ... }
}
```

## Anomaly Detection

The server-side detector approximates the trained One-Class SVM:

1. **Mahalanobis distance squared** computed across all 6 sensors using training mean/std
2. **Threshold** = `chi²_inv(0.99, 6) = 16.81` → 1% false-positive rate
3. **Temporal multiplier** — anomaly probability scaled by time of day (2.8× at midnight)
4. **Per-station rates** — Mardakan 0.87%, Sumqayit 1.22%, Turkan 0.92% (from training EDA)
