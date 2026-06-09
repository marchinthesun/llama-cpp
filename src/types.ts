export interface SystemStaticInfo {
  cpu_brand: string;
  vendor: "amd" | "intel" | "other";
  physical_cores: number;
  logical_cores: number;
  numa_nodes: number;
  ccx_groups: CcxGroup[];
  total_memory_gb: number;
  memory_channels: number;
  memory_speed_mhz: number;
  avx512: boolean;
  avx2: boolean;
  l3_cache_mb: number;
  os_name: string;
  hostname: string;
}

export interface CcxGroup {
  id: number;
  numa_node: number;
  core_ids: number[];
  label: string;
}

export interface CoreUsage {
  core_id: number;
  usage_percent: number;
  ccx_id: number;
  numa_node: number;
}

export interface NumaNodeStats {
  node_id: number;
  memory_used_gb: number;
  memory_total_gb: number;
  bandwidth_gbps: number;
  latency_ns: number;
}

export interface CcdSensor {
  ccd_id: number;
  label: string;
  temp_c: number;
  power_w: number | null;
}

export interface SystemSnapshot {
  timestamp_ms: number;
  global_cpu_usage: number;
  core_usages: CoreUsage[];
  ccx_usages: number[];
  temperature_c: number | null;
  power_watts: number | null;
  voltage_v: number | null;
  ppt_watts: number | null;
  memory_used_gb: number;
  memory_total_gb: number;
  memory_bandwidth_gbps: number;
  memory_latency_ns: number;
  numa_stats: NumaNodeStats[];
  ccd_temps: CcdSensor[];
  sensor_source: SensorSource;
  sensor_hint: string;
}

export type SensorSource =
  | "none"
  | "libre_hardware_monitor"
  | "zenpower"
  | "wmi_fallback";

export interface SensorStatus {
  lhm_running: boolean;
  zenpower_running: boolean;
  active_source: SensorSource;
  hint: string;
}

export interface BeastScore {
  total: number;
  grade: string;
  breakdown: {
    core_count: number;
    numa_efficiency: number;
    memory_bandwidth: number;
    cache_score: number;
    simd_score: number;
    thermal_headroom: number;
    llm_readiness: number;
  };
  tips: string[];
}

export interface LlmRecommendation {
  threads: number;
  batch_size: number;
  ctx_size: number;
  quant: string;
  ngl: number;
  preset: string;
  bottleneck: string;
  estimated_tokens_per_sec: number;
  llama_cli_args: string;
  numa_hint: string;
}

export interface OptimizationPreset {
  id: string;
  name: string;
  description: string;
  thread_ratio: number;
  batch_multiplier: number;
  ctx_size: number;
  power_limit: boolean;
}

export interface LlmInstallStatus {
  ollama_installed: boolean;
  ollama_path: string | null;
  llama_cpp_installed: boolean;
  llama_cpp_path: string | null;
  ik_llama_installed: boolean;
  ik_llama_path: string | null;
  preferred_backend: string;
}

export interface LlmProcessStatus {
  running: boolean;
  pid: number | null;
  tokens_per_sec: number;
  bottleneck: string;
  prompt_tokens: number;
  gen_tokens: number;
  uptime_secs: number;
  last_stderr_line: string;
}

export interface CcdPinningConfig {
  enabled: boolean;
  selected_ccx_ids: number[];
  cpu_mask_hex: string;
  thread_count: number;
}

export interface BenchmarkProgress {
  phase: string;
  progress_pct: number;
  message: string;
  running: boolean;
}

export interface BenchmarkResult {
  baseline_tps: number;
  optimized_tps: number;
  improvement_percent: number;
  baseline_threads: number;
  optimized_threads: number;
  baseline_label: string;
  optimized_label: string;
  model_path: string;
  duration_secs: number;
  meets_target: boolean;
}

export interface OptimizationProfile {
  id: string;
  name: string;
  preset: string;
  threads: number;
  batch_size: number;
  ctx_size: number;
  quant: string;
  model_path: string | null;
  notes: string;
  created_at: string;
}
