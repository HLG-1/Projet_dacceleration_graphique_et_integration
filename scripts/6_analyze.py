# scripts/6_analyze.py
import json
import sys
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from src.profiling.profiling_analyzer import ProfilingAnalyzer

def main():
    analyzer = ProfilingAnalyzer()
    
    # Example dummy CPU/GPU profs
    cpu_prof = {"key_averages": lambda: []}
    gpu_prof = {"key_averages": lambda: []}

    # Replace above with actual torch.profiler outputs if available
    analysis = analyzer.compare_cpu_gpu(cpu_prof, gpu_prof)
    analyzer.export_report(analysis, "results/profiling_report.md")
    print("Profiling report saved to results/profiling_report.md")

if __name__ == "__main__":
    main()
