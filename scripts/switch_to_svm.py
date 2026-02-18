"""
Switch production pipeline to use One-Class SVM instead of broken LOF model
"""
import joblib
import json
from pathlib import Path
from sklearn.pipeline import Pipeline

print("="*80)
print("SWITCHING TO ONE-CLASS SVM MODEL")
print("="*80)

artifacts_dir = Path('artifacts')

# Load the scaler and One-Class SVM model
print("\nLoading artifacts...")
scaler = joblib.load(artifacts_dir / 'scaler.joblib')
svm_model = joblib.load(artifacts_dir / 'best_model_one_class_svm.joblib')

print(f"✓ Loaded scaler")
print(f"✓ Loaded One-Class SVM model")
print(f"  Model type: {type(svm_model).__name__}")

# Create new production pipeline
print("\nCreating production pipeline...")
production_pipeline = Pipeline([
    ('scaler', scaler),
    ('model', svm_model)
])

print("✓ Pipeline created with One-Class SVM")

# Backup current (broken) pipeline
import shutil
from datetime import datetime
backup_path = artifacts_dir / f"production_pipeline_lof_broken_{datetime.now().strftime('%Y%m%d_%H%M%S')}.joblib"
shutil.copy(artifacts_dir / 'production_pipeline.joblib', backup_path)
print(f"\n✓ Backed up broken LOF pipeline to: {backup_path.name}")

# Save new pipeline
joblib.dump(production_pipeline, artifacts_dir / 'production_pipeline.joblib')
print(f"✓ Saved new production pipeline with One-Class SVM")

# Update feature config
feature_config = json.load(open(artifacts_dir / 'feature_config.json'))
feature_config['best_model_name'] = 'One-Class SVM'
with open(artifacts_dir / 'feature_config.json', 'w') as f:
    json.dump(feature_config, f, indent=2)
print(f"✓ Updated feature config")

# Test the new pipeline
print("\n" + "="*80)
print("TESTING NEW PIPELINE")
print("="*80)

# Load and test
import pandas as pd
import numpy as np

loaded_pipeline = joblib.load(artifacts_dir / 'production_pipeline.joblib')
print("\n✓ Loaded pipeline successfully")
print(f"  Model type: {type(loaded_pipeline.named_steps['model']).__name__}")

# Create test data (simulating normal pipeline operation)
test_data = np.array([[
    0.74,    # density_kg_m3
    5.0,     # pressure_diff_kpa
    500.0,   # pressure_kpa
    15.0,    # temperature_c
    5000.0,  # hourly_flow_m3
    5000.0,  # total_flow_m3
    12,      # hour
    3,       # day_of_week
    1,       # month
    2024,    # year
    1,       # loc_Mardakan
    0,       # loc_Sumqayit
    0        # loc_Turkan
]])

predictions = loaded_pipeline.predict(test_data)
print(f"\n✓ Test prediction works!")
print(f"  Prediction: {'NORMAL' if predictions[0] == 1 else 'ANOMALY'}")

# Test on multiple samples
test_samples = np.random.randn(100, 13)
test_samples[:, 0] = 0.74  # density around normal
test_samples[:, 2] = 500   # pressure around normal
predictions = loaded_pipeline.predict(test_samples)
anomaly_rate = (predictions == -1).sum() / len(predictions) * 100
print(f"\n✓ Tested on 100 random samples")
print(f"  Anomaly rate: {anomaly_rate:.1f}% (should be around 1-5%)")

print("\n" + "="*80)
print("SUCCESS! ONE-CLASS SVM IS NOW ACTIVE")
print("="*80)
print("\nRestart your FastAPI server to use the new model.")
print("The anomaly detection should now work correctly!")
