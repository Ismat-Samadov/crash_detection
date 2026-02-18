"""Test model on actual training data to verify it works"""
import sys
sys.path.insert(0, '/Users/ismatsamadov/crash_detection')

import pandas as pd
import joblib
import json
from pathlib import Path

# Paths
BASE_DIR = Path("/Users/ismatsamadov/crash_detection")
ARTIFACTS_DIR = BASE_DIR / "artifacts"
DATA_DIR = BASE_DIR / "data"

# Load model
pipeline = joblib.load(ARTIFACTS_DIR / "production_pipeline.joblib")
with open(ARTIFACTS_DIR / "feature_config.json", 'r') as f:
    feature_config = json.load(f)

print("=" * 70)
print("Testing model on ACTUAL TRAINING DATA")
print("=" * 70)

# Load real pipeline data
mardakan = pd.read_csv(DATA_DIR / "Mardakan.csv")
sumqayit = pd.read_csv(DATA_DIR / "Sumqayit.csv")
turkan = pd.read_csv(DATA_DIR / "Turkan.csv")

# Add location column
mardakan['location'] = 'Mardakan'
sumqayit['location'] = 'Sumqayit'
turkan['location'] = 'Turkan'

# Combine
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

# Take a random sample of 100 rows
sample = all_data.sample(n=100, random_state=42)

# One-hot encode location
location_dummies = pd.get_dummies(sample['location'], prefix='loc')
sample_prepared = pd.concat([sample, location_dummies], axis=1)

# Ensure all required columns exist
for col in feature_config['feature_columns']:
    if col not in sample_prepared.columns:
        sample_prepared[col] = 0

# Extract features
X = sample_prepared[feature_config['feature_columns']]

# Drop rows with NaN values (same as training does)
X_clean = X.dropna()
print(f"  Dropped {len(X) - len(X_clean)} rows with NaN values")

X = X_clean.values

# Predict
predictions = pipeline.predict(X)
anomaly_count = (predictions == -1).sum()
normal_count = (predictions == 1).sum()
anomaly_rate = anomaly_count / len(predictions) * 100

print(f"\n✓ Loaded {len(all_data):,} rows of actual pipeline data")
print(f"  Tested on random sample of {len(sample)} rows")
print("\nPrediction Results:")
print(f"  Normal: {normal_count} ({normal_count/len(predictions)*100:.1f}%)")
print(f"  Anomalies: {anomaly_count} ({anomaly_rate:.1f}%)")

print("\n" + "=" * 70)

if anomaly_rate > 50:
    print("✗ PROBLEM: Model detects >50% of training data as anomalies!")
    print("  This indicates the model is broken or overtrained.")
elif anomaly_rate > 5:
    print("⚠ WARNING: Model detects {}% anomalies in training data".format(int(anomaly_rate)))
    print("  This is higher than expected 1% rate.")
else:
    print("✓ SUCCESS: Model correctly recognizes training data!")
    print(f"  Anomaly rate of {anomaly_rate:.1f}% is reasonable.")

print("=" * 70)
