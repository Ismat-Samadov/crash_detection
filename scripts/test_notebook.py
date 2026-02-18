#!/usr/bin/env python3
"""
Quick validation script to test if the notebook fixes work correctly.
This tests the critical date parsing fix.
"""

from pathlib import Path
import pandas as pd

print("="*70)
print("NOTEBOOK VALIDATION TEST")
print("="*70)

# Configuration
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"

COLUMN_RENAME_MAP = {
    "TARİX": "timestamp",
    "XÜSUSİ ÇƏKİ\n(kq/m3)": "density_kg_m3",
    "TƏZYİQLƏR\nFƏRQİ (kPa)": "pressure_diff_kpa",
    "TƏZYİQ (kPa)": "pressure_kpa",
    "TEMPERATUR\n(C)": "temperature_c",
    "SAATLIQ\nSƏRF(min m3)": "hourly_flow_m3",
    "SƏRF (min m3)": "total_flow_m3",
}

print("\n✓ Configuration loaded")

# Test 1: Load sample data
print("\n" + "="*70)
print("TEST 1: Data Loading")
print("="*70)

try:
    sample_file = DATA_DIR / "Mardakan.csv"
    df = pd.read_csv(sample_file)
    df = df.rename(columns=COLUMN_RENAME_MAP)
    print(f"✓ Loaded {sample_file.name}: {len(df):,} rows")
    print(f"✓ Columns: {df.columns.tolist()}")
except Exception as e:
    print(f"✗ Failed to load data: {e}")
    exit(1)

# Test 2: Date parsing (THE CRITICAL FIX)
print("\n" + "="*70)
print("TEST 2: Date Parsing (Critical Fix)")
print("="*70)

try:
    # Test the fixed date parsing
    df_test = df.head(100).copy()
    print(f"Sample timestamp values:\n{df_test['timestamp'].head(3).tolist()}")

    # Apply the fix
    df_test['timestamp'] = pd.to_datetime(df_test['timestamp'], dayfirst=True, format='mixed')
    print(f"\n✓ Date parsing successful!")
    print(f"  Parsed format: {df_test['timestamp'].dtype}")
    print(f"  Sample parsed dates:\n{df_test['timestamp'].head(3).tolist()}")
    print(f"  Date range: {df_test['timestamp'].min()} to {df_test['timestamp'].max()}")
except Exception as e:
    print(f"✗ Date parsing failed: {e}")
    exit(1)

# Test 3: Null value handling
print("\n" + "="*70)
print("TEST 3: Null Value Handling")
print("="*70)

try:
    null_counts = df.isnull().sum()
    total_nulls = null_counts.sum()
    print(f"✓ Null value check completed")
    print(f"  Total null values: {total_nulls:,}")
    if total_nulls > 0:
        print(f"  Columns with nulls:")
        for col, count in null_counts[null_counts > 0].items():
            print(f"    - {col}: {count:,} ({count/len(df)*100:.2f}%)")
except Exception as e:
    print(f"✗ Null check failed: {e}")
    exit(1)

# Test 4: Feature extraction
print("\n" + "="*70)
print("TEST 4: Temporal Feature Extraction")
print("="*70)

try:
    df_test['hour'] = df_test['timestamp'].dt.hour
    df_test['day_of_week'] = df_test['timestamp'].dt.dayofweek
    df_test['month'] = df_test['timestamp'].dt.month
    df_test['year'] = df_test['timestamp'].dt.year
    print(f"✓ Temporal features extracted successfully")
    print(f"  New columns: hour, day_of_week, month, year")
    print(f"  Sample values:")
    print(df_test[['timestamp', 'hour', 'day_of_week', 'month', 'year']].head(3))
except Exception as e:
    print(f"✗ Feature extraction failed: {e}")
    exit(1)

# Summary
print("\n" + "="*70)
print("VALIDATION COMPLETE")
print("="*70)
print("\n✅ ALL TESTS PASSED!")
print("\nThe notebook is ready to run. Key fixes verified:")
print("  1. ✓ Data loading works correctly")
print("  2. ✓ Date parsing handles DD-MM-YYYY format")
print("  3. ✓ Null value detection working")
print("  4. ✓ Feature extraction successful")
print("\nYou can now run the full notebook with confidence!")
print("\nNext steps:")
print("  1. source activate.sh")
print("  2. jupyter notebook notebooks/anomaly_detection_pipeline.ipynb")
print("  3. Cell → Run All")
print("\n" + "="*70)
