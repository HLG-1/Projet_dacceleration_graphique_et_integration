# scripts/5_test_rag.py
import json
from pathlib import Path
import sys
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from src.pipeline import QuantumRAG
from src.config import CHUNKS_DIR

def main():
    with open(CHUNKS_DIR / "all_chunks.json", "r", encoding="utf-8") as f:
        chunks_by_file = json.load(f)

    all_chunks = []
    for c in chunks_by_file.values():
        all_chunks.extend(c)

    rag = QuantumRAG()
    rag.add_corpus(all_chunks)

    # Example query
    query = "What is the uncertainty principle in quantum mechanics?"
    result = rag.answer_question(query)
    print("ANSWER:")
    print(result["answer"])
    print("\nSOURCES:")
    for src in result["sources"]:
        print(f"- {src[:100]}...")

if __name__ == "__main__":
    main()
