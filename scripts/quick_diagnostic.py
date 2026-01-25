"""Quick diagnostic - check simulator distributions"""
import sys
sys.path.insert(0, '/Users/ismatsamadov/crash_detection')

import numpy as np
from app.data_simulator import PipelineDataSimulator

# Generate samples
simulator = PipelineDataSimulator()
samples = simulator.generate_batch(100)

print("SIMULATOR OUTPUT STATISTICS")
print("=" * 70)

stats = {
    "density_kg_m3": {"mean": 0.739, "std": 0.014},
    "pressure_diff_kpa": {"mean": 9.21, "std": 8.03},
    "pressure_kpa": {"mean": 485.65, "std": 95.80},
    "temperature_c": {"mean": 16.32, "std": 17.37},
    "hourly_flow_m3": {"mean": 8.19, "std": 11.39},
    "total_flow_m3": {"mean": 196.57, "std": 273.29}
}

for col, expected in stats.items():
    actual_mean = samples[col].mean()
    actual_std = samples[col].std()
    actual_min = samples[col].min()
    actual_max = samples[col].max()

    mean_diff = abs(actual_mean - expected["mean"]) / expected["mean"] * 100
    std_diff = abs(actual_std - expected["std"]) / expected["std"] * 100

    status = "✓" if mean_diff < 15 and std_diff < 30 else "✗"

    print(f"\n{status} {col}:")
    print(f"  Actual:   mean={actual_mean:8.3f}, std={actual_std:8.3f}, range=[{actual_min:.3f}, {actual_max:.3f}]")
    print(f"  Expected: mean={expected['mean']:8.3f}, std={expected['std']:8.3f}")
    print(f"  Diff:     mean={mean_diff:5.1f}%, std={std_diff:5.1f}%")

print("\n" + "=" * 70)
print("Location distribution:")
print(samples['location'].value_counts())
