"""Purpose: Break large documents into manageable pieces (chunks).

Why:

LLMs and embedding models have token limits.

Smaller chunks let you search/retrieve relevant pieces without losing context.

Logic to implement:

Decide chunk size (e.g., 500-1000 words) and overlap (50-100 words) to preserve context between chunks.

Iterate over each document:

Split by paragraphs or sentences.

Build chunks with overlap.

Save chunks (JSON or database) for embedding computation.

tips:

Make it deterministic — same text should always produce the same chunks.

Optionally keep metadata with chunks (document ID, page number, position)."""

import json
import logging
from pathlib import Path
from typing import List, Dict

import nltk
from tqdm import tqdm


class TextChunker:
    """
    Sentence-aware text chunker for RAG pipelines.

    - CPU-only
    - Deterministic
    - Model-agnostic
    """

    def __init__(self, chunk_size: int = 500, overlap: int = 50) -> None:
        """
        Args:
            chunk_size (int): Maximum number of words per chunk
            overlap (int): Number of overlapping words between chunks
        """
        self.chunk_size = chunk_size
        self.overlap = overlap

        self.logger = logging.getLogger(__name__)

        # Ensure sentence tokenizer is available
        nltk.download("punkt", quiet=True)

    # -------------------------
    # Core logic (Level 1)
    # -------------------------

    def chunk_text(self, text: str) -> List[str]:
        """
        Split text into sentence-based chunks.

        Args:
            text (str): Clean input text

        Returns:
            List[str]: List of text chunks
        """
        sentences = nltk.sent_tokenize(text)

        chunks = []
        current_chunk = []
        current_length = 0

        for sentence in sentences:
            sentence_length = len(sentence.split())

            if current_length + sentence_length > self.chunk_size:
                if current_chunk:
                    chunks.append(" ".join(current_chunk))
                    current_chunk, current_length = self._apply_overlap(current_chunk)

            current_chunk.append(sentence)
            current_length += sentence_length

        if current_chunk:
            chunks.append(" ".join(current_chunk))

        return chunks

    def _apply_overlap(self, previous_chunk: List[str]) -> tuple:
        """
        Keep the last sentences of the previous chunk to create overlap.

        Returns:
            (List[str], int): overlapped sentences and their word count
        """
        overlapped = []
        length = 0

        for sentence in reversed(previous_chunk):
            sentence_length = len(sentence.split())
            if length + sentence_length <= self.overlap:
                overlapped.insert(0, sentence)
                length += sentence_length
            else:
                break

        return overlapped, length

    # -------------------------
    # File-level helpers (Level 2)
    # -------------------------

    def chunk_file(self, file_path: Path) -> List[str]:
        """
        Chunk a single text file.

        Args:
            file_path (Path): Path to .txt file

        Returns:
            List[str]: Chunks
        """
        self.logger.debug(f"Chunking file: {file_path.name}")

        with file_path.open("r", encoding="utf-8") as f:
            text = f.read()

        return self.chunk_text(text)

    # -------------------------
    # Corpus-level helpers (Level 3)
    # -------------------------

    def chunk_directory(self, dir_path: Path) -> Dict[str, List[str]]:
        """
        Chunk all .txt files in a directory.

        Args:
            dir_path (Path): Directory containing processed text files

        Returns:
            Dict[str, List[str]]: filename -> chunks
        """
        chunks_by_file = {}

        txt_files = list(dir_path.glob("*.txt"))
        self.logger.info(f"Found {len(txt_files)} files to chunk")

        for file_path in tqdm(txt_files, desc="Chunking documents"):
            chunks_by_file[file_path.stem] = self.chunk_file(file_path)

        return chunks_by_file

    def save_chunks(self, chunks: Dict[str, List[str]], output_path: Path) -> None:
        """
        Save chunks dictionary to JSON.

        Args:
            chunks (dict): Chunked documents
            output_path (Path): Output JSON file
        """
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with output_path.open("w", encoding="utf-8") as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)

        self.logger.info(f"Chunks saved to {output_path}")


      