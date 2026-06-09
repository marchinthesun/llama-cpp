import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { OptimizationProfile } from "../types";

export default function Profiles() {
  const [profiles, setProfiles] = useState<OptimizationProfile[]>([]);
  const [name, setName] = useState("");

  const refresh = () => invoke<OptimizationProfile[]>("list_profiles").then(setProfiles);

  useEffect(() => {
    refresh();
  }, []);

  const save = async () => {
    if (!name.trim()) return;
    const profile: OptimizationProfile = {
      id: crypto.randomUUID(),
      name,
      preset: "balanced",
      threads: 0,
      batch_size: 512,
      ctx_size: 8192,
      quant: "Q4_K_M",
      model_path: null,
      notes: "",
      created_at: new Date().toISOString(),
    };
    await invoke("save_profile", { profile });
    setName("");
    refresh();
  };

  const remove = async (id: string) => {
    await invoke("delete_profile", { id });
    refresh();
  };

  return (
    <>
      <h1 className="page-title">Optimization Profiles</h1>
      <p className="page-sub">Save and load tuning presets for different workloads</p>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">New Profile</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Profile name (e.g. EPYC 96-core Inference)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn btn-primary" onClick={save}>
            Save
          </button>
        </div>
      </div>

      <div className="grid-2">
        {profiles.map((p) => (
          <div key={p.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
                  Preset: {p.preset} · {p.quant} · ctx {p.ctx_size}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                  {new Date(p.created_at).toLocaleString()}
                </div>
              </div>
              <button className="btn btn-danger" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => remove(p.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {profiles.length === 0 && (
          <div className="card" style={{ color: "var(--text-dim)", fontSize: 14 }}>
            No profiles saved yet. Create one above or save from the LLM Optimizer.
          </div>
        )}
      </div>
    </>
  );
}
