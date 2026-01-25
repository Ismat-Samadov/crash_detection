"""
Diagnostic Script - Compare Simulator vs Training Data
========================================================
Identifies why the model is detecting 100% anomalies
"""

import sys
sys.path.insert(0, '/Users/ismatsamadov/crash_detection')

import joblib
import pandas as pd
import numpy as np
import json
from pathlib import Path
from app.data_simulator import PipelineDataSimulator

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
DATA_DIR = BASE_DIR / "data"

print("=" * 70)
print("DIAGNOSTIC ANALYSIS: Simulator vs Training Data")
print("=" * 70)

# Load model and config
pipeline = joblib.load(ARTIFACTS_DIR / "production_pipeline.joblib")
with open(ARTIFACTS_DIR / "feature_config.json", 'r') as f:
    feature_config = json.load(f)

print(f"\n✓ Model loaded: {feature_config['model_name']}")
print(f"  Features: {feature_config['n_features']}")
print(f"  Expected anomaly rate: {feature_config['contamination_rate']*100:.1f}%")

# Load training data statistics
with open(BASE_DIR / "outputs" / "training_statistics.json", 'r') as f:
    training_stats = json.load(f)

print("\n" + "=" * 70)
print("STEP 1: Generate Simulator Data")
print("=" * 70)

simulator = PipelineDataSimulator()
sim_samples = simulator.generate_batch(100)

print(f"\n✓ Generated {len(sim_samples)} samples from simulator")
print("\nSimulator Data Statistics:")
for col in ['density_kg_m3', 'pressure_diff_kpa', 'pressure_kpa', 'temperature_c', 'hourly_flow_m3', 'total_flow_m3']:
    if col in sim_samples.columns:
        sim_mean = sim_samples[col].mean()
        sim_std = sim_samples[col].std()
        sim_min = sim_samples[col].min()
        sim_max = sim_samples[col].max()

        train_mean = training_stats[col]['mean']
        train_std = training_stats[col]['std']

        mean_diff = abs(sim_mean - train_mean) / train_mean * 100
        std_diff = abs(sim_std - train_std) / train_std * 100

        print(f"\n{col}:")
        print(f"  Simulator: mean={sim_mean:.3f}, std={sim_std:.3f}, range=[{sim_min:.3f}, {sim_max:.3f}]")
        print(f"  Training:  mean={train_mean:.3f}, std={train_std:.3f}")
        print(f"  Difference: mean={mean_diff:.1f}%, std={std_diff:.1f}%")

print("\n" + "=" * 70)
print("STEP 2: Test Model on Actual Training Data")
print("=" * 70)

# Load a sample of actual training data
training_data = pd.read_csv(DATA_DIR / "merged_data.csv")
print(f"\n✓ Loaded training data: {len(training_data):,} rows")

# Take a random sample
training_sample = training_data.sample(n=100, random_state=42)

# Prepare training sample for prediction
training_sample['timestamp'] = pd.to_datetime(training_sample['timestamp'])

# One-hot encode location
location_dummies = pd.get_dummies(training_sample['location'], prefix='loc')
training_prepared = pd.concat([training_sample, location_dummies], axis=1)

# Ensure all required columns exist
for col in feature_config['feature_columns']:
    if col not in training_prepared.columns:
        training_prepared[col] = 0

# Extract features
X_train = training_prepared[feature_config['feature_columns']].values

# Predict on actual training data
predictions_train = pipeline.predict(X_train)
anomalies_train = (predictions_train == -1).sum()

print(f"\n✓ Predictions on TRAINING data:")
print(f"  Total: {len(predictions_train)}")
print(f"  Normal: {(predictions_train == 1).sum()} ({(predictions_train == 1).sum()/len(predictions_train)*100:.1f}%)")
print(f"  Anomalies: {anomalies_train} ({anomalies_train/len(predictions_train)*100:.1f}%)")

print("\n" + "=" * 70)
print("STEP 3: Test Model on Simulator Data")
print("=" * 70)

# Prepare simulator data for prediction
location_dummies_sim = pd.get_dummies(sim_samples['location'], prefix='loc')
sim_prepared = pd.concat([sim_samples, location_dummies_sim], axis=1)

# Ensure all required columns exist
for col in feature_config['feature_columns']:
    if col not in sim_prepared.columns:
        sim_prepared[col] = 0

# Extract features
X_sim = sim_prepared[feature_config['feature_columns']].values

# Predict on simulator data
predictions_sim = pipeline.predict(X_sim)
anomalies_sim = (predictions_sim == -1).sum()

print(f"\n✓ Predictions on SIMULATOR data:")
print(f"  Total: {len(predictions_sim)}")
print(f"  Normal: {(predictions_sim == 1).sum()} ({(predictions_sim == 1).sum()/len(predictions_sim)*100:.1f}%)")
print(f"  Anomalies: {anomalies_sim} ({anomalies_sim/len(predictions_sim)*100:.1f}%)")

print("\n" + "=" * 70)
print("STEP 4: Compare Feature Distributions")
print("=" * 70)

print("\nFeature comparison (first 5 samples):")
print("\nTRAINING DATA:")
print(training_prepared[feature_config['feature_columns']].head())

print("\nSIMULATOR DATA:")
print(sim_prepared[feature_config['feature_columns']].head())

# Check for NaN or inf values
print("\n" + "=" * 70)
print("STEP 5: Data Quality Checks")
print("=" * 70)

print("\nTraining data quality:")
print(f"  NaN values: {training_prepared[feature_config['feature_columns']].isna().sum().sum()}")
print(f"  Inf values: {np.isinf(training_prepared[feature_config['feature_columns']].values).sum()}")

print("\nSimulator data quality:")
print(f"  NaN values: {sim_prepared[feature_config['feature_columns']].isna().sum().sum()}")
print(f"  Inf values: {np.isinf(sim_prepared[feature_config['feature_columns']].values).sum()}")

print("\n" + "=" * 70)
print("STEP 6: Inspect StandardScaler")
print("=" * 70)

# Extract scaler from pipeline
scaler = pipeline.named_steps['standardscaler']

print("\nScaler statistics (mean and std for each feature):")
for i, col in enumerate(feature_config['feature_columns']):
    print(f"  {col}:")
    print(f"    mean = {scaler.mean_[i]:.6f}")
    print(f"    std  = {scaler.scale_[i]:.6f}")

# Transform and inspect
X_train_scaled = scaler.transform(X_train[:5])
X_sim_scaled = scaler.transform(X_sim[:5])

print("\nScaled values (first 5 samples):")
print("\nTraining data (scaled):")
print(X_train_scaled)
print(f"  Range: [{X_train_scaled.min():.3f}, {X_train_scaled.max():.3f}]")

print("\nSimulator data (scaled):")
print(X_sim_scaled)
print(f"  Range: [{X_sim_scaled.min():.3f}, {X_sim_scaled.max():.3f}]")

print("\n" + "=" * 70)
print("DIAGNOSIS SUMMARY")
print("=" * 70)

if anomalies_train < 10:
    print("\n✓ Model correctly predicts training data as NORMAL")
else:
    print(f"\n✗ WARNING: Model detects {anomalies_train}% anomalies in training data!")

if anomalies_sim > 50:
    print(f"✗ PROBLEM: Model detects {anomalies_sim}% anomalies in simulator data")
    print("\n  Likely causes:")
    print("  1. Feature distribution mismatch between simulator and training")
    print("  2. Location encoding issue")
    print("  3. Scaler not properly calibrated")
    print("  4. One-hot encoding mismatch")
else:
    print(f"✓ Model correctly handles simulator data")

print("\n" + "=" * 70)
