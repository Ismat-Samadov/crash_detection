/**
 * Server-side data simulator.
 * Generates realistic sensor readings and computes anomaly scores
 * using a Mahalanobis-distance approach calibrated to the training statistics.
 *
 * The One-Class SVM (nu=0.01) trained on 170,289 samples is approximated by:
 *   score = sum_i( ((x_i - mean_i) / std_i)^2 )   [Mahalanobis^2]
 *   anomaly when score > chi2_inv(0.99, 6) ≈ 16.81
 */

import type { SensorData, StationReading } from "@/types";

// ── Training statistics (from training_statistics.json) ────────────────────
const SENSOR_STATS: Record<
  keyof SensorData,
  { mean: number; std: number; min: number; max: number }
> = {
  density_kg_m3:     { mean: 0.740,  std: 0.014,  min: 0.67,  max: 0.82  },
  pressure_diff_kpa: { mean: 9.21,   std: 8.03,   min: 0,     max: 50    },
  pressure_kpa:      { mean: 485.7,  std: 95.8,   min: 150,   max: 780   },
  temperature_c:     { mean: 16.3,   std: 17.4,   min: -35,   max: 55    },
  hourly_flow_m3:    { mean: 8.19,   std: 11.39,  min: 0,     max: 75    },
  total_flow_m3:     { mean: 196.6,  std: 273.3,  min: 0,     max: 1600  },
};

// Per-station historical anomaly rates (from training data analysis)
const STATION_ANOMALY_RATES: Record<string, number> = {
  Mardakan: 0.0087,
  Sumqayit: 0.0122,
  Turkan:   0.0092,
};

// chi2_inv(0.99, 6) ≈ 16.81  → anything above this is in the 1% tail
const ANOMALY_THRESHOLD = 16.81;

// ── Gaussian random (Box-Muller transform) ─────────────────────────────────
function gaussianRandom(mean: number, std: number): number {
  let u1 = 0, u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + std * z;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// ── Anomaly score (Mahalanobis distance squared) ───────────────────────────
export function computeAnomalyScore(sensors: SensorData): number {
  const keys = Object.keys(SENSOR_STATS) as (keyof SensorData)[];
  return keys.reduce((sum, key) => {
    const { mean, std } = SENSOR_STATS[key];
    const z = (sensors[key] - mean) / std;
    return sum + z * z;
  }, 0);
}

// ── Normal reading generation ──────────────────────────────────────────────
function generateNormalSensors(hourOfDay: number): SensorData {
  // Diurnal modifiers — midnight has 2.8× higher anomaly, 3-6 AM is calmest
  const tempBias = Math.sin(((hourOfDay - 6) / 24) * 2 * Math.PI) * 8; // ±8°C swing
  const flowBias = Math.max(0, Math.sin(((hourOfDay - 9) / 24) * 2 * Math.PI) * 4);

  const density    = clamp(gaussianRandom(0.740, 0.013), 0.68, 0.81);
  const pressureDiff = Math.max(0, gaussianRandom(9.21, 7.5));
  const pressure   = clamp(gaussianRandom(485.7, 90), 200, 720);
  const temperature = gaussianRandom(16.3 + tempBias, 14);
  const hourlyFlow = Math.max(0, gaussianRandom(8.19 + flowBias, 10));
  const totalFlow  = Math.max(0, gaussianRandom(196.6, 260));

  return {
    density_kg_m3:     density,
    pressure_diff_kpa: pressureDiff,
    pressure_kpa:      pressure,
    temperature_c:     temperature,
    hourly_flow_m3:    hourlyFlow,
    total_flow_m3:     totalFlow,
  };
}

// ── Anomalous reading — inject multi-sensor deviation ─────────────────────
function generateAnomalousSensors(hourOfDay: number): SensorData {
  const base = generateNormalSensors(hourOfDay);

  // Pick 2-4 sensors to deviate
  const keys = Object.keys(SENSOR_STATS) as (keyof SensorData)[];
  const numDeviant = 2 + Math.floor(Math.random() * 3);
  const shuffled = keys.sort(() => Math.random() - 0.5).slice(0, numDeviant);

  const anomalous = { ...base };
  for (const key of shuffled) {
    const { mean, std, min, max } = SENSOR_STATS[key];
    // 3–5σ deviation in a random direction
    const sigma = 3 + Math.random() * 2;
    const direction = Math.random() < 0.5 ? 1 : -1;
    anomalous[key] = clamp(mean + direction * sigma * std, min, max);
  }

  return anomalous;
}

// ── Public: generate one reading for a station ────────────────────────────
export function generateStationReading(stationName: string): StationReading {
  const hourOfDay = new Date().getHours();
  const baseAnomalyRate = STATION_ANOMALY_RATES[stationName] ?? 0.01;

  // Midnight multiplier (matches the "2.8× at 00:00" insight from EDA)
  const hourMultiplier = hourOfDay === 0 ? 2.8 : hourOfDay < 3 || hourOfDay > 21 ? 1.5 : 1.0;
  const effectiveRate = baseAnomalyRate * hourMultiplier;

  const forceAnomaly = Math.random() < effectiveRate;
  const sensors = forceAnomaly
    ? generateAnomalousSensors(hourOfDay)
    : generateNormalSensors(hourOfDay);

  const anomalyScore = computeAnomalyScore(sensors);
  const isAnomaly = forceAnomaly || anomalyScore > ANOMALY_THRESHOLD;

  return {
    timestamp: new Date().toISOString(),
    location: stationName,
    sensors,
    is_anomaly: isAnomaly,
    anomaly_score: isAnomaly ? anomalyScore : 0,
  };
}

// ── Public: generate readings for all three stations ──────────────────────
export function generateAllReadings(): Record<string, StationReading> {
  return {
    Mardakan: generateStationReading("Mardakan"),
    Sumqayit: generateStationReading("Sumqayit"),
    Turkan:   generateStationReading("Turkan"),
  };
}
