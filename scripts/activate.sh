#!/bin/bash
# Activation script for crash_detection virtual environment

echo "==================================================================="
echo "  Activating crash_detection Virtual Environment"
echo "==================================================================="

# Activate virtual environment
source venv/bin/activate

echo ""
echo "✓ Virtual environment activated!"
echo ""
echo "Python version:"
python --version
echo ""
echo "Key packages installed:"
pip list | grep -E "(pandas|numpy|scikit-learn|matplotlib|seaborn|jupyter)" | head -10
echo ""
echo "==================================================================="
echo "  Quick Commands:"
echo "==================================================================="
echo ""
echo "  Launch Jupyter Notebook:"
echo "    jupyter notebook notebooks/anomaly_detection_pipeline.ipynb"
echo ""
echo "  Deactivate environment:"
echo "    deactivate"
echo ""
echo "==================================================================="
