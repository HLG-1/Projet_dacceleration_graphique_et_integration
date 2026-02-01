#text_cleaner.py
import re, unicodedata

def clean_text(text: str) -> str:
    # Normalize Unicode characters
    text = unicodedata.normalize("NFKD", text)
    # Remove extra whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text 

def remove_special_characters(text: str) -> str:
    # Remove special characters except for basic punctuation
    text = re.sub(r"[^a-zA-Z0-9\s.,!?;:()-]", "", text)
    return text 

def to_lowercase(text: str) -> str:
    return text.lower() 

def clean_document_text(text: str) -> str:
    text = clean_text(text)
    text = remove_special_characters(text)
    text = to_lowercase(text)
    return text 

def extract_sentences(text: str) -> list:
    # Simple sentence extraction based on punctuation
    sentences = re.split(r'(?<=[.!?]) +', text)
    return [sentence.strip() for sentence in sentences if sentence.strip()]     

def extract_metadata(text: str) -> dict:
    # Placeholder for metadata extraction logic
    metadata = {
        "length": len(text),
        "word_count": len(text.split())
    }
    return metadata

def chunk_text(text: str, chunk_size: int = 500) -> list:
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks



         
         
