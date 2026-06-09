import type { BeastScore } from "../types";

export default function BeastScoreRing({ score }: { score: BeastScore }) {
  const pct = score.total / 100;
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (pct / 100) * circumference;

  const items = [
    ["Cores", score.breakdown.core_count],
    ["NUMA", score.breakdown.numa_efficiency],
    ["Memory BW", score.breakdown.memory_bandwidth],
    ["L3 Cache", score.breakdown.cache_score],
    ["SIMD", score.breakdown.simd_score],
    ["Thermal", score.breakdown.thermal_headroom],
    ["LLM Ready", score.breakdown.llm_readiness],
  ] as const;

  return (
    <div>
      <div className="beast-score">
        <div className="beast-ring">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="#1e2230" strokeWidth="10" />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="url(#grad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6c5ce7" />
                <stop offset="100%" stopColor="#00cec9" />
              </linearGradient>
            </defs>
          </svg>
          <div className="beast-number">
            <div className="beast-total">{score.total}</div>
            <div className="beast-grade">{score.grade}</div>
          </div>
        </div>
      </div>
      {items.map(([label, val]) => (
        <div key={label} className="breakdown-item">
          <div className="breakdown-header">
            <span>{label}</span>
            <span>{(val / 100).toFixed(0)}%</span>
          </div>
          <div className="breakdown-track">
            <div className="breakdown-fill" style={{ width: `${val / 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
