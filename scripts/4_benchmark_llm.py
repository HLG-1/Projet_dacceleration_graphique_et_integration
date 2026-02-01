# scripts/4benchmark_llm.py
import time
import sys
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from src.llm.llm_inference import LLMInference
from src.config import DEVICE



def main():
    prompts = [
        "Explain the Schrödinger equation",
        "What is quantum superposition?"
    ]

    llm = LLMInference(device="cpu")
    cpu_times = []
    for p in prompts:
        _, t = llm.generate(p)
        cpu_times.append(t)
    print(f"CPU average time: {sum(cpu_times)/len(cpu_times):.2f}s")

    if DEVICE == "cuda":
        llm_gpu = LLMInference(device="cuda")
        gpu_times = []
        for p in prompts:
            _, t = llm_gpu.generate(p)
            gpu_times.append(t)
        print(f"GPU average time: {sum(gpu_times)/len(gpu_times):.2f}s")
        print(f"LLM speedup: {sum(cpu_times)/sum(gpu_times):.2f}x")

if __name__ == "__main__":
    main()
