import type { SensorConfig } from "@/types";

export const STATION_NAMES = ["Mardakan", "Sumqayit", "Turkan"] as const;

export const SENSOR_CONFIGS: Record<string, SensorConfig> = {
  density_kg_m3: {
    label: "Gas Density",
    unit: "kg/m³",
    min: 0.67,
    max: 0.81,
    normalMin: 0.70,
    normalMax: 0.78,
    precision: 3,
    icon: "◈",
  },
  pressure_diff_kpa: {
    label: "Pressure Diff",
    unit: "kPa",
    min: 0,
    max: 40,
    normalMin: 0,
    normalMax: 25,
    precision: 2,
    icon: "⇅",
  },
  pressure_kpa: {
    label: "System Pressure",
    unit: "kPa",
    min: 200,
    max: 700,
    normalMin: 300,
    normalMax: 650,
    precision: 1,
    icon: "◉",
  },
  temperature_c: {
    label: "Temperature",
    unit: "°C",
    min: -35,
    max: 55,
    normalMin: -10,
    normalMax: 45,
    precision: 1,
    icon: "⊕",
  },
  hourly_flow_m3: {
    label: "Hourly Flow",
    unit: "m³/h",
    min: 0,
    max: 45,
    normalMin: 0,
    normalMax: 35,
    precision: 2,
    icon: "⇒",
  },
  total_flow_m3: {
    label: "Total Flow",
    unit: "m³",
    min: 0,
    max: 900,
    normalMin: 0,
    normalMax: 750,
    precision: 1,
    icon: "Σ",
  },
};

export const SENSOR_KEYS = Object.keys(SENSOR_CONFIGS) as Array<
  keyof typeof SENSOR_CONFIGS
>;

export const MODEL_META = {
  version: "2.0",
  type: "One-Class SVM (RBF)",
  trainingSamples: 170_289,
  expectedAnomalyRate: 1.0,
  trainingPeriod: "2018–2024",
  features: 13,
};
