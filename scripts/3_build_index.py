# scripts/3_build_index.py
import json
import numpy as np
from pathlib import Path
import sys
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from src.embeddings.vector_store import VectorStore
from src.embeddings.embedding_generator import EmbeddingGenerator
from src.config import CHUNKS_DIR, DEVICE

def main():
    with open(CHUNKS_DIR / "all_chunks.json", "r", encoding="utf-8") as f:
        chunks_by_file = json.load(f)

    all_chunks = []
    for c in chunks_by_file.values():
        all_chunks.extend(c)

    embedder = EmbeddingGenerator(device=DEVICE)
    embeddings = embedder.encode(all_chunks)

    store = VectorStore(embedding_dim=embeddings.shape[1])
    store.add_embeddings(embeddings, all_chunks)

    # Save FAISS index
    import faiss
    faiss.write_index(store.index, CHUNKS_DIR / "vector_index.faiss")
    print(f"FAISS index saved to {CHUNKS_DIR / 'vector_index.faiss'}")

if __name__ == "__main__":
    main()
