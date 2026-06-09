import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { LlmInstallStatus, SensorStatus } from "../types";

export default function Tools() {
  const [status, setStatus] = useState<LlmInstallStatus | null>(null);
  const [sensors, setSensors] = useState<SensorStatus | null>(null);
  const [msg, setMsg] = useState("");

  const refresh = () => {
    invoke<LlmInstallStatus>("check_llm_install").then(setStatus);
    invoke<SensorStatus>("get_sensor_status").then(setSensors);
  };

  useEffect(() => {
    refresh();
  }, []);

  const run = async (cmd: string) => {
    try {
      const r = await invoke<string>(cmd);
      setMsg(r);
      refresh();
    } catch (e) {
      setMsg(String(e));
    }
  };

  return (
    <>
      <h1 className="page-title">Tools</h1>
      <p className="page-sub">
        Install backends, configure AMD sensors. Для полной работы запускайте LLMMonitor.exe от имени администратора.
      </p>

      <div className="grid-3">
        <div className="card">
          <div className="card-title">ik_llama.cpp</div>
          <Status ok={status?.ik_llama_installed} />
          {status?.ik_llama_path && <Path p={status.ik_llama_path} />}
          <p style={{ fontSize: 12, color: "var(--text-dim)", margin: "8px 0" }}>
            AVX-512 & Zen-optimized fork. One-click prebuild download.
          </p>
          <button className="btn btn-primary" onClick={() => run("install_ik_llama_cpp")}>
            Download ik_llama.cpp
          </button>
        </div>

        <div className="card">
          <div className="card-title">llama.cpp</div>
          <Status ok={status?.llama_cpp_installed} />
          {status?.llama_cpp_path && <Path p={status.llama_cpp_path} />}
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => run("install_llama_cpp")}>
            Clone llama.cpp
          </button>
        </div>

        <div className="card">
          <div className="card-title">Ollama</div>
          <Status ok={status?.ollama_installed} />
          {status?.ollama_path && <Path p={status.ollama_path} />}
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => run("install_ollama")}>
            Install Ollama
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">AMD Sensor Integration</div>
        <div style={{ fontSize: 13, marginBottom: 12 }}>
          Active source:{" "}
          <span style={{ color: sensors?.lhm_running ? "var(--green)" : "var(--yellow)" }}>
            {sensors?.active_source ?? "none"}
          </span>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>
          {sensors?.hint}
        </p>
        <ol style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 12, paddingLeft: 20, lineHeight: 1.8 }}>
          <li>Download <a href="https://github.com/LibreHardwareMonitor/LibreHardwareMonitor" style={{ color: "var(--cyan)" }}>LibreHardwareMonitor</a> — run as Administrator</li>
          <li>Per-CCD temps & PPT appear automatically via WMI namespace <code>root\LibreHardwareMonitor</code></li>
          <li>Optional: ZenPower driver for direct SMU access (Linux / advanced Windows setups)</li>
        </ol>
      </div>

      {status && (
        <div className="card" style={{ marginTop: 16, fontSize: 13 }}>
          Preferred backend: <strong>{status.preferred_backend}</strong>
        </div>
      )}

      {msg && (
        <div className="card" style={{ marginTop: 16, fontSize: 13, color: "var(--cyan)" }}>
          {msg}
        </div>
      )}
    </>
  );
}

function Status({ ok }: { ok?: boolean }) {
  return (
    <div style={{ marginBottom: 8 }}>
      Status:{" "}
      <span style={{ color: ok ? "var(--green)" : "var(--red)" }}>
        {ok ? "Installed" : "Not found"}
      </span>
    </div>
  );
}

function Path({ p }: { p: string }) {
  return (
    <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--mono)", wordBreak: "break-all" }}>
      {p}
    </div>
  );
}
