Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

python -m ml.src.train
python api/run.py
