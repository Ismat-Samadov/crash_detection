"""Debug simulator output vs training statistics"""
import sys
sys.path.append('/Users/ismatsamadov/crash_detection')

from app.data_simulator import PipelineDataSimulator
import json
from pathlib import Path

# Load training statistics
BASE_DIR = Path("/Users/ismatsamadov/crash_detection")
with open(BASE_DIR / "outputs/training_statistics.json", 'r') as f:
    train_stats = json.load(f)

# Create simulator
simulator = PipelineDataSimulator()

# Generate samples
print("="*70)
print("SIMULATOR vs TRAINING DATA COMPARISON")
print("="*70)

samples = [simulator.generate_data_point() for _ in range(10)]

for feature in ["density_kg_m3", "pressure_diff_kpa", "pressure_kpa",
                "temperature_c", "hourly_flow_m3", "total_flow_m3"]:
    values = [s[feature] for s in samples]
    sim_mean = sum(values) / len(values)
    sim_min = min(values)
    sim_max = max(values)

    train_mean = train_stats[feature]["mean"]
    train_min = train_stats[feature]["min"]
    train_max = train_stats[feature]["max"]

    print(f"\n{feature}:")
    print(f"  Training: mean={train_mean:.2f}, min={train_min:.2f}, max={train_max:.2f}")
    print(f"  Simulator: mean={sim_mean:.2f}, min={sim_min:.2f}, max={sim_max:.2f}")

    # Check if simulator is within training range
    if sim_min < train_min or sim_max > train_max:
        print(f"  ⚠️  OUT OF RANGE!")
    else:
        print(f"  ✓ Within range")

print("\n" + "="*70)
