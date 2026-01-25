"""
Real-Time Pipeline Data Simulator
==================================
Generates realistic gas pipeline sensor readings by sampling from historical data
"""

import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, Any
from pathlib import Path


class PipelineDataSimulator:
    """
    Simulates real-time gas pipeline sensor data
    Samples from actual historical data to preserve natural sensor correlations
    """

    def __init__(self):
        """Initialize simulator by loading historical data"""

        # Load actual historical data
        data_dir = Path(__file__).parent.parent / "data"

        # Load data from all locations
        mardakan = pd.read_csv(data_dir / "Mardakan.csv")
        sumqayit = pd.read_csv(data_dir / "Sumqayit.csv")
        turkan = pd.read_csv(data_dir / "Turkan.csv")

        # Add location column
        mardakan['location'] = 'Mardakan'
        sumqayit['location'] = 'Sumqayit'
        turkan['location'] = 'Turkan'

        # Combine all data
        all_data = pd.concat([mardakan, sumqayit, turkan], ignore_index=True)

        # Rename columns to match our feature names
        column_mapping = {
            'XÜSUSİ ÇƏKİ\n(kq/m3)': 'density_kg_m3',
            'TƏZYİQLƏR\nFƏRQİ (kPa)': 'pressure_diff_kpa',
            'TƏZYİQ (kPa)': 'pressure_kpa',
            'TEMPERATUR\n(C)': 'temperature_c',
            'SAATLIQ\nSƏRF(min m3)': 'hourly_flow_m3',
            'SƏRF (min m3)': 'total_flow_m3',
            'TARİX': 'timestamp'
        }
        all_data = all_data.rename(columns=column_mapping)

        # Filter out summary rows (rows where timestamp contains "Cəmi")
        all_data = all_data[~all_data['timestamp'].astype(str).str.contains('Cəmi', na=False)]

        # Convert timestamp to datetime
        all_data['timestamp'] = pd.to_datetime(all_data['timestamp'], format='%d-%m-%Y %H:%M')

        # Drop rows with NaN values
        all_data = all_data.dropna()

        # Store the clean data pool
        self.data_pool = all_data.reset_index(drop=True)

        print(f"✓ Data simulator initialized with {len(self.data_pool):,} historical samples")

        # Noise levels for perturbation (±0.5% variation to preserve correlations)
        self.noise_levels = {
            'density_kg_m3': 0.005,
            'pressure_diff_kpa': 0.005,
            'pressure_kpa': 0.005,
            'temperature_c': 0.005,
            'hourly_flow_m3': 0.005,
            'total_flow_m3': 0.005
        }

    def generate_data_point(self) -> Dict[str, Any]:
        """
        Generate a single realistic data point by sampling from historical data
        """
        # Randomly sample a row from historical data
        sample_idx = np.random.randint(0, len(self.data_pool))
        sample = self.data_pool.iloc[sample_idx].copy()

        # Add small random perturbations to make each sample unique
        # This preserves correlations while adding variability
        for sensor, noise_level in self.noise_levels.items():
            if sensor in sample:
                # Add noise: ± noise_level percent of the value
                noise = np.random.uniform(-noise_level, noise_level)
                sample[sensor] = sample[sensor] * (1 + noise)

                # Ensure non-negative values for physical sensors
                if sample[sensor] < 0:
                    sample[sensor] = abs(sample[sensor]) * 0.1

        # Update timestamp to current time
        sample['timestamp'] = datetime.now()

        return sample.to_dict()

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

    print("\nTesting Pipeline Data Simulator")
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
