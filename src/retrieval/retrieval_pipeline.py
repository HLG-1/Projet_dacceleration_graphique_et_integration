# retrieval_pipeline.py
from src.embeddings.vector_store import VectorStore
from src.embeddings.embedding_generator import EmbeddingGenerator
from typing import List

class RetrievalPipeline:
    """
    RAG retrieval pipeline: query → embedding → FAISS search → top-k results.
    """

    def __init__(self, vector_store: VectorStore, embedder: EmbeddingGenerator):
        self.store = vector_store
        self.embedder = embedder

    def retrieve(self, query: str, k: int = 5) -> List[str]:
        """
        Retrieve top-k chunks for a query.
        """
        query_emb = self.embedder.encode([query])
        results = self.store.search(query_emb, k)
        return results
