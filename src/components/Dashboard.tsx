import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { BeastScore, SensorStatus, SystemSnapshot, SystemStaticInfo } from "../types";
import CoreGrid from "./CoreGrid";
import BeastScoreRing from "./BeastScoreRing";

const SOURCE_LABELS: Record<string, string> = {
  libre_hardware_monitor: "LibreHardwareMonitor",
  zenpower: "ZenPower",
  wmi_fallback: "WMI",
  none: "No sensor",
};

export default function Dashboard() {
  const [staticInfo, setStaticInfo] = useState<SystemStaticInfo | null>(null);
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);
  const [beast, setBeast] = useState<BeastScore | null>(null);
  const [sensorStatus, setSensorStatus] = useState<SensorStatus | null>(null);

  useEffect(() => {
    invoke<SystemStaticInfo>("get_static_info").then(setStaticInfo);
    invoke<SensorStatus>("get_sensor_status").then(setSensorStatus);
    const tick = async () => {
      const snap = await invoke<SystemSnapshot>("get_snapshot");
      setSnapshot(snap);
      const score = await invoke<BeastScore>("get_beast_score");
      setBeast(score);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!staticInfo || !snapshot) {
    return <div className="page-title">Loading system...</div>;
  }

  const tempColor = (t: number | null) => {
    if (t === null) return "var(--text-dim)";
    if (t < 70) return "var(--green)";
    if (t < 85) return "var(--yellow)";
    return "var(--red)";
  };

  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">
        {staticInfo.cpu_brand} · {staticInfo.logical_cores} threads ·{" "}
        {staticInfo.numa_nodes} NUMA node{staticInfo.numa_nodes > 1 ? "s" : ""} ·{" "}
        <span className={`vendor-badge ${staticInfo.vendor}`}>{staticInfo.vendor}</span>
        <span className="sensor-badge">
          {SOURCE_LABELS[snapshot.sensor_source] ?? snapshot.sensor_source}
        </span>
      </p>

      {snapshot.sensor_hint && (
        <div className="sensor-hint">{snapshot.sensor_hint}</div>
      )}

      <div className="grid-4" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-title">CPU Usage</div>
          <div className="stat-value">
            {snapshot.global_cpu_usage.toFixed(1)}
            <span className="stat-unit">%</span>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Temperature</div>
          <div className="stat-value" style={{ color: tempColor(snapshot.temperature_c) }}>
            {snapshot.temperature_c !== null ? snapshot.temperature_c.toFixed(0) : "—"}
            <span className="stat-unit">°C</span>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Power (PPT)</div>
          <div className="stat-value">
            {snapshot.ppt_watts !== null ? snapshot.ppt_watts.toFixed(0) : "—"}
            <span className="stat-unit">W</span>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Memory BW</div>
          <div className="stat-value">
            {snapshot.memory_bandwidth_gbps.toFixed(1)}
            <span className="stat-unit"> GB/s</span>
          </div>
          <div className="stat-label">Latency: {snapshot.memory_latency_ns.toFixed(0)} ns</div>
        </div>
      </div>

      {snapshot.ccd_temps.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Per-CCD Temperatures (AMD)</div>
          <div className="ccd-temp-grid">
            {snapshot.ccd_temps.map((ccd) => (
              <div key={ccd.ccd_id} className="ccd-temp-cell">
                <div className="ccd-temp-label">{ccd.label}</div>
                <div className="ccd-temp-value" style={{ color: tempColor(ccd.temp_c) }}>
                  {ccd.temp_c.toFixed(0)}°C
                </div>
                {ccd.power_w !== null && (
                  <div className="ccd-temp-power">{ccd.power_w.toFixed(0)} W</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Core / CCD / CCX Usage</div>
          <CoreGrid
            cores={snapshot.core_usages}
            ccxGroups={staticInfo.ccx_groups}
            ccxUsages={snapshot.ccx_usages}
          />
        </div>

        <div className="card">
          <div className="card-title">Beast Score</div>
          {beast && <BeastScoreRing score={beast} />}
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-title">NUMA Nodes & Memory</div>
          {snapshot.numa_stats.map((n) => (
            <div key={n.node_id} className="numa-bar">
              <div className="numa-header">
                <span>Node {n.node_id}</span>
                <span>
                  {n.memory_used_gb.toFixed(1)} / {n.memory_total_gb.toFixed(1)} GB ·{" "}
                  {n.bandwidth_gbps.toFixed(1)} GB/s · {n.latency_ns.toFixed(0)} ns
                </span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${(n.memory_used_gb / Math.max(n.memory_total_gb, 0.01)) * 100}%`,
                    background: "linear-gradient(90deg, var(--accent), var(--cyan))",
                  }}
                />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-dim)" }}>
            RAM: {snapshot.memory_used_gb.toFixed(1)} / {snapshot.memory_total_gb.toFixed(1)} GB ·{" "}
            {staticInfo.memory_channels}ch @ {staticInfo.memory_speed_mhz} MHz · L3:{" "}
            {staticInfo.l3_cache_mb} MB
            {staticInfo.avx512 && " · AVX-512"}
          </div>
          {sensorStatus && !sensorStatus.lhm_running && staticInfo.vendor === "amd" && (
            <div className="sensor-hint" style={{ marginTop: 10 }}>
              Tip: Run LibreHardwareMonitor as admin for per-CCD AMD temps via SMU.
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Optimization Tips</div>
          {beast && (
            <ul className="tip-list">
              {beast.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
