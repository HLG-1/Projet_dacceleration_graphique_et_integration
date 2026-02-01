#document_processor.py

from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path
from typing import Optional



@dataclass
class ExtractedDocument:
    source_path: Path
    raw_text: str
    num_pages: Optional[int] = None
    document_type: Optional[str] = None
    metadata: Optional[dict] = None  
    valid_scope: Optional[bool] = None




class DocumentProcessor(ABC):

    @abstractmethod
    def load(self, document_path: Path) :
        """Load the document located at document_path and return its content."""
        pass

    @abstractmethod
    def extract(self, document_path: Path) -> ExtractedDocument:
        """Extract semantic content from the document located at document_path."""
        pass

    @abstractmethod
    def validate(self, document_path: Path) -> bool:
        """Validate the document located at document_path and return True if valid, else False."""
        pass    








    