import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type {
  CcdPinningConfig,
  LlmProcessStatus,
  LlmRecommendation,
  OptimizationPreset,
  SystemStaticInfo,
} from "../types";
import CcdPinning from "./CcdPinning";

const MODELS = [
  { name: "Llama 3.1 8B", size: 4.7 },
  { name: "Qwen 2.5 14B", size: 8.5 },
  { name: "Mistral 7B", size: 4.1 },
  { name: "Phi-3 Mini", size: 2.2 },
];

export default function LlmLauncher() {
  const [staticInfo, setStaticInfo] = useState<SystemStaticInfo | null>(null);
  const [presets, setPresets] = useState<OptimizationPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState("balanced");
  const [modelSize, setModelSize] = useState(4.7);
  const [modelPath, setModelPath] = useState("");
  const [rec, setRec] = useState<LlmRecommendation | null>(null);
  const [status, setStatus] = useState<LlmProcessStatus | null>(null);
  const [selectedCcx, setSelectedCcx] = useState<number[]>([]);
  const [pinning, setPinning] = useState<CcdPinningConfig | null>(null);
  const [useIkLlama, setUseIkLlama] = useState(false);

  useEffect(() => {
    invoke<OptimizationPreset[]>("get_presets").then(setPresets);
    invoke<SystemStaticInfo>("get_static_info").then((info) => {
      setStaticInfo(info);
      const optimal = Math.max(1, Math.ceil(info.ccx_groups.length * 0.72));
      setSelectedCcx(info.ccx_groups.slice(0, optimal).map((g) => g.id));
    });
  }, []);

  useEffect(() => {
    invoke<LlmRecommendation>("get_llm_recommendation", {
      preset: selectedPreset,
      modelSizeGb: modelSize,
    }).then(setRec);
  }, [selectedPreset, modelSize]);

  useEffect(() => {
    if (!rec) return;
    invoke<CcdPinningConfig>("get_ccd_pinning", {
      selectedCcxIds: selectedCcx,
      threadCount: rec.threads,
    }).then(setPinning);
  }, [selectedCcx, rec]);

  useEffect(() => {
    const id = setInterval(() => {
      invoke<LlmProcessStatus>("get_llm_status").then(setStatus);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleStart = async () => {
    if (!rec || !modelPath) return;
    try {
      await invoke("start_llm", {
        modelPath,
        threads: rec.threads,
        batchSize: rec.batch_size,
        ctxSize: rec.ctx_size,
        ngl: rec.ngl,
        cpuMask: pinning?.enabled ? pinning.cpu_mask_hex : null,
        useIkLlama,
      });
    } catch (e) {
      alert(String(e));
    }
  };

  const handleStop = async () => {
    await invoke("stop_llm");
  };

  const running = status?.running ?? false;

  return (
    <>
      <h1 className="page-title">LLM Optimizer</h1>
      <p className="page-sub">
        Smart launcher for llama.cpp / ik_llama.cpp — auto-tuned threads, CCD pinning, live tok/s
      </p>

      {status?.running && (
        <div className="live-tps-banner">
          <span className="live-dot" />
          Live: <strong>{status.tokens_per_sec.toFixed(1)}</strong> tok/s · Bottleneck: {status.bottleneck}
          {status.gen_tokens > 0 && ` · ${status.gen_tokens} tokens generated`}
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Preset</div>
          <div className="preset-grid">
            {presets.map((p) => (
              <button
                key={p.id}
                className={`preset-btn ${selectedPreset === p.id ? "active" : ""}`}
                onClick={() => setSelectedPreset(p.id)}
              >
                <div className="preset-name">{p.name}</div>
                <div className="preset-desc">{p.description}</div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={useIkLlama} onChange={(e) => setUseIkLlama(e.target.checked)} />
              Use ik_llama.cpp backend (AVX-512 / Zen optimized)
            </label>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="card-title">Quick Models</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {MODELS.map((m) => (
                <button
                  key={m.name}
                  className="btn btn-secondary"
                  style={{ fontSize: 12 }}
                  onClick={() => setModelSize(m.size)}
                >
                  {m.name} ({m.size} GB)
                </button>
              ))}
            </div>
          </div>

          {staticInfo && (
            <div style={{ marginTop: 20 }}>
              <div className="card-title">Per-CCD Thread Pinning</div>
              <CcdPinning
                ccxGroups={staticInfo.ccx_groups}
                threadCount={rec?.threads ?? staticInfo.logical_cores}
                selected={selectedCcx}
                onChange={setSelectedCcx}
              />
            </div>
          )}

          <div className="input-group" style={{ marginTop: 16 }}>
            <label className="input-label">Model path (.gguf)</label>
            <input
              className="input"
              placeholder="C:\models\llama-3.1-8b-q4_k_m.gguf"
              value={modelPath}
              onChange={(e) => setModelPath(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            {!running ? (
              <button className="btn btn-primary" onClick={handleStart}>
                Launch
              </button>
            ) : (
              <button className="btn btn-danger" onClick={handleStop}>
                Stop
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Recommended Settings</div>
          {rec && (
            <>
              <div className="grid-4" style={{ marginBottom: 16 }}>
                <div>
                  <div className="stat-label">Threads (-t)</div>
                  <div className="stat-value" style={{ fontSize: 22 }}>{rec.threads}</div>
                </div>
                <div>
                  <div className="stat-label">Batch (-b)</div>
                  <div className="stat-value" style={{ fontSize: 22 }}>{rec.batch_size}</div>
                </div>
                <div>
                  <div className="stat-label">Context (-c)</div>
                  <div className="stat-value" style={{ fontSize: 22 }}>{rec.ctx_size}</div>
                </div>
                <div>
                  <div className="stat-label">Quant</div>
                  <div className="stat-value" style={{ fontSize: 22 }}>{rec.quant}</div>
                </div>
              </div>

              <div className="grid-2" style={{ marginBottom: 16 }}>
                <div className="card" style={{ padding: 12 }}>
                  <div className="stat-label">
                    {status?.running ? "Live tok/s" : "Est. tok/s"}
                  </div>
                  <div className="stat-value" style={{ fontSize: 24, color: "var(--green)" }}>
                    {(status?.running ? status.tokens_per_sec : rec.estimated_tokens_per_sec).toFixed(1)}
                  </div>
                </div>
                <div className="card" style={{ padding: 12 }}>
                  <div className="stat-label">Bottleneck</div>
                  <div className="stat-value" style={{ fontSize: 24, color: "var(--yellow)" }}>
                    {status?.running ? status.bottleneck : rec.bottleneck}
                  </div>
                </div>
              </div>

              {status?.last_stderr_line && (
                <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--text-dim)", marginBottom: 12 }}>
                  {status.last_stderr_line.slice(0, 120)}
                </div>
              )}

              <pre className="cli-preview">{rec.llama_cli_args}</pre>
            </>
          )}
        </div>
      </div>
    </>
  );
}
