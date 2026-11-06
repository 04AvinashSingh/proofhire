"""ProofHire AI Service package."""
import sys
from pathlib import Path

# Ensure parent directory of src is in sys.path so 'src.*' package imports always resolve
_parent_dir = str(Path(__file__).resolve().parent.parent)
if _parent_dir not in sys.path:
    sys.path.insert(0, _parent_dir)

__version__ = "0.1.0"
