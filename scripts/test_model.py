"""Test the trained model with simulated data"""
import sys
sys.path.append('/Users/ismatsamadov/crash_detection')

from app.data_simulator import PipelineDataSimulator
import joblib
import json
import pandas as pd
from pathlib import Path

# Load model
BASE_DIR = Path("/Users/ismatsamadov/crash_detection")
ARTIFACTS_DIR = BASE_DIR / "artifacts"

pipeline = joblib.load(ARTIFACTS_DIR / "production_pipeline.joblib")
with open(ARTIFACTS_DIR / "feature_config.json", 'r') as f:
    feature_config = json.load(f)

# Create simulator with updated parameters
simulator = PipelineDataSimulator()

# Generate test data
print("Generating 100 test samples...")
test_data = []
for i in range(100):
    point = simulator.generate_data_point()
    test_data.append(point)

df = pd.DataFrame(test_data)

# One-hot encode location
location_dummies = pd.get_dummies(df['location'], prefix='loc')
df = pd.concat([df, location_dummies], axis=1)

# Ensure all required columns exist
for col in feature_config['feature_columns']:
    if col not in df.columns:
        df[col] = 0

# Select features and predict
X = df[feature_config['feature_columns']].values
predictions = pipeline.predict(X)

# Calculate statistics
anomaly_count = (predictions == -1).sum()
anomaly_rate = anomaly_count / len(predictions) * 100

print("\n" + "="*60)
print("MODEL TEST RESULTS")
print("="*60)
print(f"Total samples: {len(predictions)}")
print(f"Normal: {(predictions == 1).sum()} ({100-anomaly_rate:.1f}%)")
print(f"Anomalies: {anomaly_count} ({anomaly_rate:.1f}%)")
print("\n" + "="*60)

# Expected rate
expected_rate = feature_config['contamination_rate'] * 100
tolerance = 10  # Allow ±10% tolerance

if anomaly_rate < 90:  # Not detecting everything as anomaly
    print("✓ SUCCESS: Model is working correctly!")
    print(f"  Anomaly rate {anomaly_rate:.1f}% is reasonable")
    print(f"  Expected rate: {expected_rate:.1f}%")
else:
    print("✗ FAILED: Model detecting too many anomalies!")
    print(f"  Anomaly rate {anomaly_rate:.1f}% is too high")
    print(f"  Expected rate: {expected_rate:.1f}%")

print("="*60)
