# Quantum Mechanics RAG with CUDA Acceleration

## 📋 Project Overview
RAG-style NLP pipeline on introductory quantum mechanics demonstrating CPU vs GPU performance on Transformer-based models.

## 🏗️ Project Structure
- **Days 1-2**: Data processing (CPU)
- **Days 3-4**: Embeddings (GPU acceleration #1) ⚡
- **Days 5-6**: Vector retrieval
- **Days 7-8**: LLM inference (GPU acceleration #2) ⚡
- **Days 9-10**: Full RAG pipeline
- **Days 11-12**: Profiling & analysis

## 🚀 Installation
```powershell
# Create virtual environment
python -m venv venv
venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

## 🎯 Usage

### Phase 1: Process Data
```powershell
python scripts\day1_2_process_data.py
```

### Phase 2: Benchmark Embeddings (CUDA)
```powershell
python scripts\day3_4_benchmark_embeddings.py
```

### Phase 3: Build Vector Index
```powershell
python scripts\day5_6_build_index.py
```

### Phase 4: Benchmark LLM (CUDA)
```powershell
python scripts\day7_8_benchmark_llm.py
```

### Phase 5: Test Full Pipeline
```powershell
python scripts\day9_10_test_rag.py
```

### Phase 6: Analyze Results
```powershell
python scripts\day11_12_analyze.py
tensorboard --logdir=results\profiling
```

## 📊 Expected Results
- Embedding speedup: 10-15x
- LLM speedup: 12-20x
- Full profiling analysis in TensorBoard

## 👥 Team
[Ajoutez vos noms ici]

## 📝 License
Academic project - [Votre université]
