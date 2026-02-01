# scripts/day1_process_data.py
import logging
from pathlib import Path
import sys

project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from src.processors.pdf_processor import PDFProcessor
from src.processors.text_cleaner import clean_document_text
from src.config import QM_DOCS_DIR, PROCESSED_DIR



logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    processor = PDFProcessor()

    for pdf_file in QM_DOCS_DIR.glob("*.pdf"):
        if processor.validate(pdf_file):
            doc = processor.extract(pdf_file)
            clean_text = clean_document_text(doc.raw_text)
            output_file = PROCESSED_DIR / f"{pdf_file.stem}.txt"
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(clean_text)
            logger.info(f"Processed {pdf_file.name} → {output_file.name}")

if __name__ == "__main__":
    main()
