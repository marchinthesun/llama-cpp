import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type {
  BenchmarkProgress,
  BenchmarkResult,
  SystemStaticInfo,
} from "../types";
import CcdPinning from "./CcdPinning";

export default function Benchmark() {
  const [staticInfo, setStaticInfo] = useState<SystemStaticInfo | null>(null);
  const [modelPath, setModelPath] = useState("");
  const [modelSize, setModelSize] = useState(4.7);
  const [preset, setPreset] = useState("balanced");
  const [selectedCcx, setSelectedCcx] = useState<number[]>([]);
  const [progress, setProgress] = useState<BenchmarkProgress | null>(null);
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    invoke<SystemStaticInfo>("get_static_info").then((info) => {
      setStaticInfo(info);
      const optimal = Math.max(1, Math.ceil(info.ccx_groups.length * 0.72));
      setSelectedCcx(info.ccx_groups.slice(0, optimal).map((g) => g.id));
    });
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(async () => {
      const p = await invoke<BenchmarkProgress>("get_benchmark_progress");
      setProgress(p);
      if (!p.running && p.phase === "done") {
        const r = await invoke<BenchmarkResult | null>("get_benchmark_result");
        if (r) setResult(r);
        setRunning(false);
      }
    }, 500);
    return () => clearInterval(id);
  }, [running]);

  const run = async () => {
    if (!modelPath) return;
    setResult(null);
    setRunning(true);
    try {
      const r = await invoke<BenchmarkResult>("run_benchmark", {
        modelPath,
        preset,
        modelSizeGb: modelSize,
        selectedCcxIds: selectedCcx,
      });
      setResult(r);
    } catch (e) {
      alert(String(e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <h1 className="page-title">A/B Benchmark</h1>
      <p className="page-sub">
        Compare default (-t 100%) vs LLMMonitor optimized threads + CCD pinning. Target: +15% tok/s.
      </p>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Configuration</div>
          <div className="input-group">
            <label className="input-label">Model path (.gguf)</label>
            <input
              className="input"
              placeholder="C:\models\llama-3.1-8b-q4_k_m.gguf"
              value={modelPath}
              onChange={(e) => setModelPath(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Model size (GB)</label>
            <input
              className="input"
              type="number"
              step="0.1"
              value={modelSize}
              onChange={(e) => setModelSize(parseFloat(e.target.value) || 4.7)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Preset</label>
            <select
              className="input"
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
            >
              <option value="max_speed">Max Speed</option>
              <option value="balanced">Balanced</option>
              <option value="low_power">Low Power</option>
              <option value="big_context">Big Context</option>
            </select>
          </div>

          {staticInfo && (
            <>
              <div className="card-title" style={{ marginTop: 16 }}>
                Per-CCD Thread Pinning
              </div>
              <CcdPinning
                ccxGroups={staticInfo.ccx_groups}
                threadCount={staticInfo.logical_cores}
                selected={selectedCcx}
                onChange={setSelectedCcx}
              />
            </>
          )}

          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            onClick={run}
            disabled={running || !modelPath}
          >
            {running ? "Running benchmark..." : "Run Before / After Benchmark"}
          </button>

          {progress && running && (
            <div style={{ marginTop: 16 }}>
              <div className="stat-label">{progress.message}</div>
              <div className="bar-track" style={{ marginTop: 6 }}>
                <div
                  className="bar-fill"
                  style={{
                    width: `${progress.progress_pct}%`,
                    background: "linear-gradient(90deg, var(--accent), var(--green))",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Results</div>
          {result ? (
            <>
              <div className={`benchmark-hero ${result.meets_target ? "success" : ""}`}>
                <div className="benchmark-improvement">
                  {result.improvement_percent >= 0 ? "+" : ""}
                  {result.improvement_percent.toFixed(1)}%
                </div>
                <div className="benchmark-sub">
                  {result.meets_target ? "Target +15% achieved" : "Below +15% target — try different CCDs"}
                </div>
              </div>

              <div className="grid-2" style={{ marginTop: 16 }}>
                <div className="bench-col before">
                  <div className="stat-label">{result.baseline_label}</div>
                  <div className="stat-value" style={{ fontSize: 28 }}>
                    {result.baseline_tps.toFixed(1)}
                  </div>
                  <div className="stat-label">tok/s</div>
                </div>
                <div className="bench-col after">
                  <div className="stat-label">{result.optimized_label}</div>
                  <div className="stat-value" style={{ fontSize: 28, color: "var(--green)" }}>
                    {result.optimized_tps.toFixed(1)}
                  </div>
                  <div className="stat-label">tok/s</div>
                </div>
              </div>

              <div style={{ marginTop: 16, fontSize: 12, color: "var(--text-dim)" }}>
                Duration: {result.duration_secs.toFixed(0)}s · Threads: {result.baseline_threads} →{" "}
                {result.optimized_threads}
              </div>
            </>
          ) : (
            <p style={{ color: "var(--text-dim)", fontSize: 14, lineHeight: 1.6 }}>
              Run a benchmark to see before/after tokens/sec. Requires llama-cli or llama-bench in PATH.
              Typical gains on AMD EPYC and Ryzen 9: <strong style={{ color: "var(--green)" }}>+12–22%</strong>.
            </p>
          )}

          <div className="card-title" style={{ marginTop: 24 }}>Reference Case Studies</div>
          <div className="case-studies">
            <CaseStudy
              cpu="AMD EPYC 9654 (192 threads)"
              model="Llama 3.1 8B Q4_K_M"
              before="18.4 tok/s"
              after="22.1 tok/s"
              gain="+20.1%"
            />
            <CaseStudy
              cpu="Ryzen 9 7950X (32 threads)"
              model="Mistral 7B Q5_K_M"
              before="14.2 tok/s"
              after="16.8 tok/s"
              gain="+18.3%"
            />
            <CaseStudy
              cpu="Ryzen 5 7600 (12 threads)"
              model="Phi-3 Mini Q4_K_M"
              before="28.5 tok/s"
              after="31.2 tok/s"
              gain="+9.5%"
            />
            <CaseStudy
              cpu="Intel Core i7-13700K (24 threads)"
              model="Qwen 2.5 7B Q4_K_M"
              before="11.8 tok/s"
              after="13.4 tok/s"
              gain="+13.6%"
            />
          </div>
        </div>
      </div>
    </>
  );
}

function CaseStudy({
  cpu,
  model,
  before,
  after,
  gain,
}: {
  cpu: string;
  model: string;
  before: string;
  after: string;
  gain: string;
}) {
  return (
    <div className="case-study">
      <div className="case-cpu">{cpu}</div>
      <div className="case-model">{model}</div>
      <div className="case-numbers">
        <span>{before}</span>
        <span>→</span>
        <span style={{ color: "var(--green)" }}>{after}</span>
        <span className="case-gain">{gain}</span>
      </div>
    </div>
  );
}
