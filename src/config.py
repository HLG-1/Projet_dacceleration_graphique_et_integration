import torch
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"
QM_DOCS_DIR = DATA_DIR / "qm_docs"
PROCESSED_DIR = DATA_DIR / "processed"
CHUNKS_DIR = DATA_DIR / "chunks"

RESULTS_DIR = BASE_DIR / "results"

# Models
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
LLM_MODEL = "microsoft/phi-2"

# Chunking
CHUNK_SIZE = 400
CHUNK_OVERLAP = 50

# Retrieval
TOP_K = 5

# Device
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
