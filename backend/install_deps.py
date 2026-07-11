"""
Run this once to install all backend dependencies into the venv.
Usage: python install_deps.py
"""
import subprocess
import sys
import os

venv_python = os.path.join(os.path.dirname(__file__), "venv", "Scripts", "python.exe")

# Upgrade pip first to improve wheel detection
print("Upgrading pip...")
subprocess.run(
    [venv_python, "-m", "pip", "install", "--upgrade", "pip"],
    capture_output=False,
)

packages = [
    "numpy",
    "pandas",
    "python-multipart",
    "fastapi",
    "uvicorn[standard]",
]

print("Installing backend dependencies one by one...")
for pkg in packages:
    print(f"\n>>> Installing {pkg} ...")
    result = subprocess.run(
        [venv_python, "-m", "pip", "install", "--only-binary=:all:", pkg],
        capture_output=False,
    )
    if result.returncode != 0:
        print(f"ERROR: Failed to install {pkg}")
        sys.exit(1)
    print(f"    {pkg} installed OK")

print("\nAll dependencies installed successfully!")
print("You can now run: venv\\Scripts\\uvicorn main:app --reload --port 8000")
