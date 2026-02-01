# vector_store.py
import faiss
import numpy as np
from typing import List

class VectorStore:
    """
    FAISS-based vector store for embeddings and retrieval.
    """

    def __init__(self, embedding_dim: int = 384):
        self.index = faiss.IndexFlatL2(embedding_dim)
        self.chunks = []

    def add_embeddings(self, embeddings: np.ndarray, chunks: List[str]):
        """
        Add embeddings and corresponding text chunks to the FAISS index.
        """
        self.index.add(embeddings.astype("float32"))
        self.chunks.extend(chunks)

    def search(self, query_embedding: np.ndarray, k: int = 5) -> List[str]:
        """
        Retrieve top-k nearest chunks for the query embedding.
        """
        distances, indices = self.index.search(query_embedding.reshape(1, -1).astype("float32"), k)
        results = [self.chunks[i] for i in indices[0]]
        return results
