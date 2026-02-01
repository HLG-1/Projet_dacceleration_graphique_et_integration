# src/profiling/profiling_analyzer.py
import json
from pathlib import Path
import logging

class ProfilingAnalyzer:
    """
    Analyze torch.profiler outputs for CPU vs GPU comparisons
    and generate a Markdown report.
    """

    def __init__(self, results_dir: Path):
        self.results_dir = results_dir
        self.results_dir.mkdir(parents=True, exist_ok=True)
        self.logger = logging.getLogger(__name__)

    def compare_cpu_gpu(self, cpu_prof, gpu_prof):
        """
        Compare CPU and GPU profiler objects from torch.profiler.
        Returns a dict with total times, top ops, and memory overhead.
        """
        # Total execution times
        cpu_total_ms = sum(e.cpu_time_total for e in cpu_prof.key_averages()) / 1000
        gpu_total_ms = sum(e.cuda_time_total for e in gpu_prof.key_averages()) / 1000

        # Speedup
        speedup = cpu_total_ms / gpu_total_ms if gpu_total_ms > 0 else None

        # Top operations
        cpu_top_ops = cpu_prof.key_averages().table(sort_by="cpu_time_total", row_limit=10)
        gpu_top_ops = gpu_prof.key_averages().table(sort_by="cuda_time_total", row_limit=10)

        # Memory transfer overhead (cudaMemcpy)
        memory_overhead_ms = sum(
            e.cuda_time_total for e in gpu_prof.key_averages() if "cudaMemcpy" in e.key
        ) / 1000

        return {
            "cpu_total_ms": cpu_total_ms,
            "gpu_total_ms": gpu_total_ms,
            "speedup": speedup,
            "cpu_top_ops": cpu_top_ops,
            "gpu_top_ops": gpu_top_ops,
            "memory_overhead_ms": memory_overhead_ms,
        }

    def export_report(self, analysis: dict, filename: str = "profiling_report.md"):
        """
        Export a Markdown report to the results directory.
        """
        report_path = self.results_dir / filename
        self.logger.info(f"Exporting profiling report to {report_path}")

        with report_path.open("w", encoding="utf-8") as f:
            f.write("# GPU Acceleration Profiling Report\n\n")
            f.write(f"**Speedup (CPU / GPU):** {analysis['speedup']:.2f}x\n\n")
            f.write(f"**Total CPU Time:** {analysis['cpu_total_ms']:.2f} ms\n")
            f.write(f"**Total GPU Time:** {analysis['gpu_total_ms']:.2f} ms\n")
            f.write(f"**GPU Memory Transfer Overhead:** {analysis['memory_overhead_ms']:.2f} ms\n\n")

            f.write("## Top CPU Operations\n")
            f.write("```\n")
            f.write(analysis["cpu_top_ops"])
            f.write("\n```\n\n")

            f.write("## Top GPU Operations\n")
            f.write("```\n")
            f.write(analysis["gpu_top_ops"])
            f.write("\n```\n")

        self.logger.info("Profiling report exported successfully.")

    def save_metrics_json(self, analysis: dict, filename: str = "profiling_metrics.json"):
        """
        Save numeric metrics only for plotting/assignments.
        """
        metrics = {
            "cpu_total_ms": analysis["cpu_total_ms"],
            "gpu_total_ms": analysis["gpu_total_ms"],
            "speedup": analysis["speedup"],
            "memory_overhead_ms": analysis["memory_overhead_ms"],
        }
        json_path = self.results_dir / filename
        with json_path.open("w", encoding="utf-8") as f:
            json.dump(metrics, f, indent=2)
        self.logger.info(f"Metrics JSON saved to {json_path}")
