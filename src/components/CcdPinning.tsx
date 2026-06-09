import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { CcdPinningConfig, CcxGroup } from "../types";

interface Props {
  ccxGroups: CcxGroup[];
  threadCount: number;
  selected: number[];
  onChange: (ids: number[]) => void;
}

export default function CcdPinning({ ccxGroups, threadCount, selected, onChange }: Props) {
  const [config, setConfig] = useState<CcdPinningConfig | null>(null);

  useEffect(() => {
    if (selected.length === 0) return;
    invoke<CcdPinningConfig>("get_ccd_pinning", {
      selectedCcxIds: selected,
      threadCount,
    }).then(setConfig);
  }, [selected, threadCount]);

  const toggle = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id].sort((a, b) => a - b));
    }
  };

  const selectAll = () => onChange(ccxGroups.map((g) => g.id));
  const selectOptimal = () => {
    const count = Math.max(1, Math.ceil(ccxGroups.length * 0.72));
    onChange(ccxGroups.slice(0, count).map((g) => g.id));
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button className="btn btn-secondary" style={{ fontSize: 12, padding: "6px 12px" }} onClick={selectOptimal}>
          Optimal (72% CCDs)
        </button>
        <button className="btn btn-secondary" style={{ fontSize: 12, padding: "6px 12px" }} onClick={selectAll}>
          All CCDs
        </button>
      </div>
      <div className="ccd-pin-grid">
        {ccxGroups.map((g) => {
          const active = selected.includes(g.id);
          return (
            <button
              key={g.id}
              className={`ccd-pin-cell ${active ? "active" : ""}`}
              onClick={() => toggle(g.id)}
              title={`Cores: ${g.core_ids.join(", ")} · NUMA ${g.numa_node}`}
            >
              <div className="ccd-pin-label">{g.label}</div>
              <div className="ccd-pin-meta">{g.core_ids.length} threads</div>
              <div className="ccd-pin-meta">NUMA {g.numa_node}</div>
            </button>
          );
        })}
      </div>
      {config && config.enabled && (
        <div style={{ marginTop: 10, fontSize: 11, fontFamily: "var(--mono)", color: "var(--cyan)" }}>
          --cpu-mask {config.cpu_mask_hex}
        </div>
      )}
    </div>
  );
}
