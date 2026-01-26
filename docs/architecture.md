# Architecture Documentation

## System Design

### Data Flow
```
PDFs → Text Extraction → Cleaning → Chunking → Embeddings (GPU) → Vector Store
                                                       ↓
                                            Query → Retrieval → LLM (GPU) → Answer
```

## Modules

### processors/
Data ingestion and preprocessing (CPU-bound operations)

### embeddings/
Vector generation with CPU/GPU comparison

### llm/
Language model inference with CUDA acceleration

### retrieval/
Vector search and context retrieval

### profiling/
Performance measurement and analysis
