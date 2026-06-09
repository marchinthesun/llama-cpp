import type { CcxGroup, CoreUsage } from "../types";

interface Props {
  cores: CoreUsage[];
  ccxGroups: CcxGroup[];
  ccxUsages: number[];
}

function usageColor(pct: number): string {
  if (pct < 15) return "#1e2230";
  if (pct < 40) return "#2d4a3e";
  if (pct < 70) return "#4a6b2a";
  if (pct < 90) return "#b8860b";
  return "#c0392b";
}

export default function CoreGrid({ cores, ccxGroups, ccxUsages }: Props) {
  return (
    <div>
      {ccxGroups.map((group) => (
        <div key={group.id}>
          <div className="ccx-label">
            {group.label} (NUMA {group.numa_node}) —{" "}
            {ccxUsages[group.id]?.toFixed(0) ?? 0}% avg
          </div>
          <div className="core-grid">
            {group.core_ids.map((cid) => {
              const core = cores.find((c) => c.core_id === cid);
              const pct = core?.usage_percent ?? 0;
              return (
                <div
                  key={cid}
                  className="core-cell"
                  style={{
                    background: usageColor(pct),
                    color: pct > 40 ? "#fff" : "var(--text-dim)",
                  }}
                  data-tip={`Core ${cid}: ${pct.toFixed(0)}%`}
                >
                  {cid}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
