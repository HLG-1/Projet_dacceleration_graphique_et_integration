# scripts/2_benchmark_embeddings.py
import time
import json
from pathlib import Path

import sys
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from src.embeddings.text_chunker import TextChunker
from src.embeddings.embedding_generator import EmbeddingGenerator
from src.config import PROCESSED_DIR, CHUNKS_DIR, DEVICE

CHUNKS_DIR.mkdir(parents=True, exist_ok=True)

def main():
    chunker = TextChunker()
    chunks_by_file = chunker.chunk_directory(PROCESSED_DIR)

    all_chunks = []
    for c in chunks_by_file.values():
        all_chunks.extend(c)

    # Save chunks
    chunker.save_chunks(chunks_by_file, CHUNKS_DIR / "all_chunks.json")

    embedder = EmbeddingGenerator(device="cpu")
    start_cpu = time.time()
    cpu_embeddings = embedder.encode(all_chunks)
    cpu_time = time.time() - start_cpu

    if DEVICE == "cuda":
        embedder_gpu = EmbeddingGenerator(device="cuda")
        start_gpu = time.time()
        gpu_embeddings = embedder_gpu.encode(all_chunks)
        gpu_time = time.time() - start_gpu
    else:
        gpu_time = None

    print(f"CPU embedding time: {cpu_time:.2f}s")
    if gpu_time:
        print(f"GPU embedding time: {gpu_time:.2f}s")
        print(f"Speedup: {cpu_time / gpu_time:.2f}x")

    # Save embeddings for later
    import numpy as np
    np.save(CHUNKS_DIR / "cpu_embeddings.npy", cpu_embeddings)
    if gpu_time:
        np.save(CHUNKS_DIR / "gpu_embeddings.npy", gpu_embeddings)

if __name__ == "__main__":
    main()
