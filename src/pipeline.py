# pipeline.py
from src.embeddings.embedding_generator import EmbeddingGenerator
from src.embeddings.vector_store import VectorStore
from src.retrieval.retrieval_pipeline import RetrievalPipeline
from src.llm.llm_inference import LLMInference
from src.config import DEVICE, TOP_K

class QuantumRAG:
    """
    Complete RAG pipeline: embeddings → FAISS retrieval → LLM generation
    """

    def __init__(self):
        self.embedder = EmbeddingGenerator(device=DEVICE)
        self.vector_store = VectorStore()
        self.retriever = RetrievalPipeline(self.vector_store, self.embedder)
        self.llm = LLMInference(device=DEVICE)

    def add_corpus(self, chunks: list):
        """
        Add chunked documents to vector store
        """
        embeddings = self.embedder.encode(chunks)
        self.vector_store.add_embeddings(embeddings, chunks)

    def answer_question(self, query: str, top_k: int = TOP_K):
        """
        Retrieve relevant context and generate LLM answer.
        """
        context_chunks = self.retriever.retrieve(query, k=top_k)
        context = "\n".join(context_chunks)

        prompt = f"Context:\n{context}\n\nQuestion: {query}\nAnswer based on the context above:"

        answer, _ = self.llm.generate(prompt)
        return {
            "answer": answer,
            "sources": context_chunks
        }
