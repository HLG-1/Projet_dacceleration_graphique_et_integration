# embedding_generator.py
import torch
from sentence_transformers import SentenceTransformer
from pathlib import Path
from typing import List
import logging

from src.config import EMBEDDING_MODEL, DEVICE

class EmbeddingGenerator:
    """
    CPU/GPU embedding generator using SentenceTransformers.
    """

    def __init__(self, model_name: str = EMBEDDING_MODEL, device: str = DEVICE):
        self.logger = logging.getLogger(__name__)
        self.device = device
        self.model = SentenceTransformer(model_name, device=device)
        self.logger.info(f"Loaded embedding model on {self.device}")

    def encode(self, texts: List[str], batch_size: int = 32) -> torch.Tensor:
        """
        Encode a list of texts into embeddings.
        Returns a numpy array.
        """
        embeddings = self.model.encode(texts, batch_size=batch_size, convert_to_numpy=True, show_progress_bar=True)
        return embeddings
