"""
Real-Time Pipeline Data Simulator
==================================
Generates realistic gas pipeline sensor readings based on historical patterns
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any


class PipelineDataSimulator:
    """
    Simulates real-time gas pipeline sensor data
    Based on actual operational statistics from Azerbaijan pipeline network
    """

    def __init__(self):
        """Initialize simulator with realistic operational parameters"""

        # Locations
        self.locations = ["Mardakan", "Sumqayit", "Turkan"]

        # Base operational parameters (from actual data analysis)
        # These represent normal operating conditions
        self.base_params = {
            "density_kg_m3": {
                "mean": 0.74,
                "std": 0.02,
                "min": 0.65,
                "max": 0.85
            },
            "pressure_diff_kpa": {
                "mean": 12.5,
                "std": 3.2,
                "min": 5.0,
                "max": 25.0
            },
            "pressure_kpa": {
                "mean": 485.0,
                "std": 45.0,
                "min": 350.0,
                "max": 650.0
            },
            "temperature_c": {
                "mean": 25.0,
                "std": 15.0,
                "min": -10.0,
                "max": 45.0
            },
            "hourly_flow_m3": {
                "mean": 12500.0,
                "std": 3500.0,
                "min": 5000.0,
                "max": 25000.0
            }
        }

        # Location-specific adjustments
        # Sumqayit has 40% higher anomaly rate - simulate slightly different operation
        self.location_adjustments = {
            "Mardakan": {"pressure_mult": 1.0, "flow_mult": 1.0},
            "Sumqayit": {"pressure_mult": 1.05, "flow_mult": 0.95},  # Slightly elevated pressure
            "Turkan": {"pressure_mult": 0.98, "flow_mult": 1.02}
        }

        # Time-based patterns
        # Midnight shows 3x higher anomaly rate
        self.hourly_risk = {
            0: 2.82,   # Midnight - highest risk
            23: 1.71,  # Late night
            12: 1.31,  # Noon peak
            13: 1.61   # Afternoon peak
        }

        # Simulation state
        self.current_location_idx = 0
        self.cumulative_flow = np.random.uniform(1e6, 5e6)
        self.last_timestamp = datetime.now()

    def _get_hourly_multiplier(self, hour: int) -> float:
        """
        Get demand multiplier based on hour of day
        Peak demand during day, lower at night
        """
        # Base pattern: higher during day (7-22), lower at night (23-6)
        if 7 <= hour <= 22:
            return np.random.uniform(1.1, 1.3)  # Day - higher demand
        elif 3 <= hour <= 6:
            return np.random.uniform(0.7, 0.9)   # Early morning - lowest demand
        else:
            return np.random.uniform(0.85, 1.05)  # Night/transition

    def _inject_anomaly(self, data: Dict[str, float], hour: int) -> Dict[str, float]:
        """
        Occasionally inject anomalies based on hour-specific risk
        """
        # Get risk for current hour (default 1% if not specified)
        risk_pct = self.hourly_risk.get(hour, 1.0)
        risk_probability = risk_pct / 100.0

        if np.random.random() < risk_probability:
            # Create anomaly by deviating multiple sensors (system-level issue)
            anomaly_type = np.random.choice([
                "pressure_spike",
                "flow_drop",
                "temperature_surge",
                "density_variation"
            ])

            if anomaly_type == "pressure_spike":
                data["pressure_kpa"] *= np.random.uniform(1.3, 1.6)
                data["pressure_diff_kpa"] *= np.random.uniform(1.4, 1.8)

            elif anomaly_type == "flow_drop":
                data["hourly_flow_m3"] *= np.random.uniform(0.4, 0.6)
                data["pressure_diff_kpa"] *= np.random.uniform(0.5, 0.7)

            elif anomaly_type == "temperature_surge":
                data["temperature_c"] += np.random.uniform(15, 30)

            elif anomaly_type == "density_variation":
                data["density_kg_m3"] *= np.random.uniform(1.15, 1.35)

        return data

    def generate_data_point(self) -> Dict[str, Any]:
        """
        Generate a single realistic data point
        """
        # Rotate through locations
        location = self.locations[self.current_location_idx]
        self.current_location_idx = (self.current_location_idx + 1) % len(self.locations)

        # Current timestamp
        timestamp = datetime.now()
        hour = timestamp.hour

        # Location-specific adjustments
        loc_adj = self.location_adjustments[location]

        # Generate base sensor readings
        data = {}

        for sensor, params in self.base_params.items():
            # Generate value with normal distribution
            value = np.random.normal(params["mean"], params["std"])

            # Clip to realistic bounds
            value = np.clip(value, params["min"], params["max"])

            # Apply hourly demand pattern for flow-related sensors
            if "flow" in sensor or "pressure" in sensor:
                value *= self._get_hourly_multiplier(hour)

            # Apply location-specific adjustments
            if "pressure" in sensor:
                value *= loc_adj["pressure_mult"]
            elif "flow" in sensor:
                value *= loc_adj["flow_mult"]

            data[sensor] = value

        # Inject occasional anomalies
        data = self._inject_anomaly(data, hour)

        # Update cumulative flow
        self.cumulative_flow += data["hourly_flow_m3"] / 60.0  # Approximate per-minute
        data["total_flow_m3"] = self.cumulative_flow

        # Add metadata
        data["timestamp"] = timestamp
        data["location"] = location

        return data

    def generate_batch(self, n: int = 100) -> pd.DataFrame:
        """
        Generate a batch of data points
        Useful for testing and validation
        """
        data_points = [self.generate_data_point() for _ in range(n)]
        return pd.DataFrame(data_points)


# Test the simulator if run directly
if __name__ == "__main__":
    simulator = PipelineDataSimulator()

    print("Testing Pipeline Data Simulator")
    print("=" * 50)

    # Generate sample data
    sample = simulator.generate_data_point()

    print(f"\nLocation: {sample['location']}")
    print(f"Timestamp: {sample['timestamp']}")
    print("\nSensor Readings:")
    print(f"  Density: {sample['density_kg_m3']:.3f} kg/m³")
    print(f"  Pressure: {sample['pressure_kpa']:.1f} kPa")
    print(f"  Pressure Diff: {sample['pressure_diff_kpa']:.1f} kPa")
    print(f"  Temperature: {sample['temperature_c']:.1f} °C")
    print(f"  Hourly Flow: {sample['hourly_flow_m3']:.0f} m³")
    print(f"  Total Flow: {sample['total_flow_m3']:.0f} m³")

    # Generate batch and show statistics
    print("\n" + "=" * 50)
    print("Generating 100 samples for validation...")
    batch = simulator.generate_batch(100)

    print("\nStatistical Summary:")
    print(batch.describe())
