export interface SensorData {
  density_kg_m3: number;
  pressure_diff_kpa: number;
  pressure_kpa: number;
  temperature_c: number;
  hourly_flow_m3: number;
  total_flow_m3: number;
}

export interface StationReading {
  timestamp: string;
  location: string;
  sensors: SensorData;
  is_anomaly: boolean;
  anomaly_score: number;
}

export type StationName = "Mardakan" | "Sumqayit" | "Turkan";

export type StationsState = {
  [K in StationName]: StationReading | null;
};

export interface AnomalyEvent {
  id: string;
  timestamp: string;
  location: string;
  anomaly_score: number;
  sensors: SensorData;
}

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface SensorConfig {
  label: string;
  unit: string;
  min: number;
  max: number;
  normalMin: number;
  normalMax: number;
  precision: number;
  icon: string;
}

export interface HistoricalLocationStats {
  anomaly_rate: number;
  total_samples: number;
  anomaly_count: number;
}

export interface HistoricalData {
  locations: Record<string, HistoricalLocationStats>;
  hourly_patterns: Record<string, number>;
}
