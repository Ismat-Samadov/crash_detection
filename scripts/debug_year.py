"""Check if year feature is causing the problem"""
import pandas as pd
from pathlib import Path

BASE_DIR = Path("/Users/ismatsamadov/crash_detection")
DATA_DIR = BASE_DIR / "data"

# Load one dataset
df = pd.read_csv(DATA_DIR / "Mardakan.csv")

# Parse timestamp
COLUMN_MAP = {
    "TARİX": "timestamp",
    "XÜSUSİ ÇƏKİ\n(kq/m3)": "density_kg_m3",
}
df = df.rename(columns=COLUMN_MAP)
df['timestamp'] = pd.to_datetime(df['timestamp'], dayfirst=True, format='mixed')
df['year'] = df['timestamp'].dt.year

print("="*60)
print("YEAR ANALYSIS")
print("="*60)
print(f"\nUnique years in training data: {sorted(df['year'].unique())}")
print(f"Year value counts:")
print(df['year'].value_counts().sort_index())
print("\n" + "="*60)
print(f"Current year (simulator): 2026")
print("="*60)
