#pdf_processor.py

from pathlib import Path    
import pdfplumber, logging
from typing import Optional

from src.processors.document_processor import DocumentProcessor, ExtractedDocument

class PDFProcessor(DocumentProcessor):

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def validate(self, document_path: Path) -> bool:
        try:
            with pdfplumber.open(document_path) as pdf:
                return True
        except Exception as e:
            self.logger.error(f"Validation failed for {document_path}: {e}")
            return False                    
        
        
    def load(self, document_path: Path) -> str:
        with pdfplumber.open(document_path) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        return text.strip()
    
    def extract(self, document_path: Path) -> ExtractedDocument:        
        with pdfplumber.open(document_path) as pdf:

            raw_text = "\n".join(page.extract_text() for page in pdf.pages)
            metadata = pdf.metadata
            num_pages = len(pdf.pages)

        return ExtractedDocument(
            source_path=document_path,
            raw_text=raw_text,
            num_pages=len(pdf.pages),
            document_type="PDF",
            metadata=metadata
        )
