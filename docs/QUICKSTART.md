# Quick Start Guide

## Virtual Environment Setup ✅

Your virtual environment has been created and all dependencies are installed!

## How to Use

### Option 1: Using the Activation Script (Recommended)

```bash
cd /Users/ismatsamadov/crash_detection
source activate.sh
```

This will:
- Activate the virtual environment
- Display installed packages
- Show helpful commands

### Option 2: Manual Activation

```bash
cd /Users/ismatsamadov/crash_detection
source venv/bin/activate
```

### Launch Jupyter Notebook

After activating the virtual environment:

```bash
jupyter notebook notebooks/anomaly_detection_pipeline.ipynb
```

This will:
1. Open Jupyter in your browser
2. Load the anomaly detection notebook
3. Ready to run all cells!

## Running the Pipeline

Once in Jupyter:
1. Click **Cell → Run All** to execute the entire pipeline
2. Or run cells individually with **Shift + Enter**
3. All outputs will be saved automatically to:
   - `/charts` - Visualizations
   - `/outputs` - Results and metrics
   - `/artifacts` - Trained models

## Expected Runtime

- **Data Loading**: ~5-10 seconds
- **Feature Engineering**: ~2-3 seconds
- **Model Training** (5 models): ~30-60 seconds
- **Evaluation & Visualization**: ~10-15 seconds
- **Total**: ~1-2 minutes

## Installed Packages

All required packages are installed:

```
✓ pandas 2.3.3
✓ numpy 2.2.6
✓ scikit-learn 1.7.2
✓ matplotlib 3.10.8
✓ seaborn 0.13.2
✓ jupyter 1.1.1
✓ notebook 7.5.2
✓ ipykernel 7.1.0
✓ joblib 1.5.3
✓ tqdm 4.67.1
```

## Deactivate Environment

When done:

```bash
deactivate
```

## Troubleshooting

### Issue: "jupyter: command not found"
**Solution**: Make sure you activated the virtual environment first

### Issue: "ModuleNotFoundError"
**Solution**: Reinstall requirements
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: Kernel not found in Jupyter
**Solution**: Install ipykernel
```bash
python -m ipykernel install --user --name=crash_detection
```

## Next Steps

1. ✅ Activate virtual environment
2. ✅ Launch Jupyter Notebook
3. ✅ Run all cells
4. ✅ Review outputs in `/charts`, `/outputs`, `/artifacts`
5. ✅ Check `outputs/00_SUMMARY_REPORT.txt` for comprehensive results

## Quick Commands Reference

```bash
# Activate
source activate.sh

# Launch Jupyter
jupyter notebook notebooks/anomaly_detection_pipeline.ipynb

# Install new package
pip install package_name

# List installed packages
pip list

# Deactivate
deactivate
```

---

**Ready to run!** 🚀
