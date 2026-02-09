# Projet d'accéleration graphique et intégration
# GPU Acceleration for Image Classification

A comprehensive benchmark project comparing CPU vs GPU performance for training a ResNet50 model on the CIFAR-10 dataset using PyTorch.

## 📋 Project Overview

This project demonstrates the performance benefits of GPU acceleration in deep learning by training a ResNet50 model on CIFAR-10 across multiple configurations:

- **CPU Baseline**: Standard CPU training
- **GPU Baseline**: Basic GPU training
- **GPU Optimized**: GPU with larger batch sizes
- **Mixed Precision**: GPU with automatic mixed precision (AMP)

## 🎯 Key Features

- ResNet50 architecture adapted for CIFAR-10 (10 classes)
- Multiple training configurations with performance profiling
- Comprehensive benchmarking with PyTorch Profiler
- Automated performance metrics and visualizations
- Mixed precision training using CUDA AMP
- Detailed performance reports and comparisons

## 📊 Dataset

- **Name**: CIFAR-10
- **Size**: 50,000 training images
- **Classes**: 10 (airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck)
- **Image Size**: Resized to 224x224 (ResNet50 input size)
- **Normalization**: ImageNet mean and std values

## 🏗️ Model Architecture

- **Base Model**: ResNet50
- **Modifications**: Final fully connected layer adapted for 10 classes
- **Parameters**: ~25 million trainable parameters
- **Framework**: PyTorch

## ⚙️ Configurations

### 1. CPU Baseline
- Device: CPU
- Batch Size: 32
- Workers: 2

### 2. GPU Baseline
- Device: CUDA GPU
- Batch Size: 32
- Workers: 4

### 3. GPU Optimized
- Device: CUDA GPU
- Batch Size: 128 (4x larger)
- Workers: 4
- Pin Memory: Enabled

### 4. Mixed Precision
- Device: CUDA GPU
- Batch Size: 128
- Workers: 4
- Precision: FP16/FP32 automatic mixed precision
- Pin Memory: Enabled

## 📈 Performance Metrics

The project tracks and visualizes:
- Total training time
- Speedup vs CPU baseline
- Speedup vs GPU baseline
- Batch processing throughput
- GPU utilization (when applicable)

## 🛠️ Requirements

```
torch>=2.0.0
torchvision>=0.15.0
pandas>=1.5.0
matplotlib>=3.7.0
seaborn>=0.12.0
numpy>=1.24.0
tensorboard>=2.13.0
```

## 🚀 Installation

1. Clone the repository or download the notebook
2. Install dependencies:
```bash
pip install torch torchvision pandas matplotlib seaborn numpy tensorboard
```

3. Ensure CUDA is available for GPU acceleration:
```python
import torch
print(f"CUDA available: {torch.cuda.is_available()}")
```

## 💻 Usage

### Running the Notebook

1. Open the notebook in Jupyter or Google Colab:
```bash
jupyter notebook Image_Classification_GPU_FINAL__1_.ipynb
```

2. Run all cells sequentially to:
   - Load and prepare the CIFAR-10 dataset
   - Create the ResNet50 model
   - Train across all configurations
   - Generate performance reports and visualizations

### Key Functions

#### `create_model()`
Creates a ResNet50 model adapted for CIFAR-10.

#### `train_cpu(model, train_loader, epochs=2)`
Trains the model on CPU with profiling enabled.

#### `train_gpu(model, train_loader, epochs=2, use_mixed_precision=False)`
Trains the model on GPU with optional mixed precision support.

## 📊 Outputs

The notebook generates:

1. **Performance Metrics Table**
   - Configuration comparison
   - Training times
   - Speedup ratios

2. **Visualizations**
   - Training time comparison bar charts
   - Speedup vs CPU baseline
   - Speedup vs GPU baseline
   - Comprehensive performance dashboard

3. **Profiling Data**
   - PyTorch Profiler traces for each configuration
   - Detailed performance breakdowns

4. **Final Report**
   - Summary of all configurations
   - Best performing setup
   - Detailed metrics and recommendations

## 🎓 Learning Objectives

This project demonstrates:
- GPU acceleration benefits in deep learning
- Impact of batch size on training performance
- Mixed precision training advantages
- PyTorch profiling and optimization techniques
- Data loading optimizations (pin memory, num workers)

## 📝 Notes

- Training runs for 2 epochs per configuration (configurable)
- First run will download CIFAR-10 dataset (~170MB)
- GPU configurations require CUDA-compatible GPU
- Mixed precision requires GPU with Tensor Cores (Volta/Turing/Ampere or newer)

## 🔍 Expected Results

Typical speedup ratios (actual results may vary):
- **GPU Baseline vs CPU**: 3-5x faster
- **GPU Optimized vs CPU**: 8-12x faster
- **Mixed Precision vs CPU**: 10-15x faster

## 🐛 Troubleshooting

**CUDA not available:**
- Verify GPU drivers are installed
- Check PyTorch CUDA compatibility: `torch.cuda.is_available()`

**Out of memory errors:**
- Reduce batch size
- Use gradient accumulation
- Enable mixed precision training

**Slow data loading:**
- Increase `num_workers`
- Enable `pin_memory=True`
- Use SSD for data storage

## 📚 References

- PyTorch Documentation: https://pytorch.org/docs/
- ResNet Paper: "Deep Residual Learning for Image Recognition"
- CIFAR-10 Dataset: https://www.cs.toronto.edu/~kriz/cifar.html
- Mixed Precision Training: https://pytorch.org/docs/stable/amp.html

