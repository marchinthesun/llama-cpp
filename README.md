# LLMMonitor — NUMA CPU Monitor & LLM Optimizer for Windows

**Free download** · **AMD Ryzen & EPYC** · **Intel Core & Xeon** · **llama.cpp / ik_llama.cpp** · **+15% tok/s benchmark**

LLMMonitor is a **CPU LLM monitor** and **llama.cpp optimizer** for Windows — a lightweight **Ollama alternative** focused on tuning, not chat hosting. It finds the **best thread count for local LLM** inference (usually 72–85% of cores, not 100%), recommends **GGUF quantization**, shows live **tokens per second**, and monitors every core, CCD, and NUMA node. Think **Ryzen Master meets llama.cpp** — a **free Ryzen Master alternative** built specifically for **local AI performance**.

[![Windows](https://img.shields.io/badge/Windows-10%2F11-blue)]()
[![v0.2](https://img.shields.io/badge/version-0.2.0-green)]()
[![llama.cpp](https://img.shields.io/badge/llama.cpp-supported-green)](https://github.com/ggerganov/llama.cpp)
[![ik_llama.cpp](https://img.shields.io/badge/ik__llama.cpp-AVX--512-orange)](https://github.com/ikawrakow/ik_llama.cpp)
[![Admin](https://img.shields.io/badge/Run%20as-Administrator-red)]()

---

## ⚠️ Run as Administrator (required)

For **full functionality**, launch **`LLMMonitor.exe` as Administrator**:

1. Right-click the shortcut or `LLMMonitor.exe`
2. Select **Run as administrator**
3. Confirm the UAC prompt

Without elevation, basic monitoring still works, but these features are limited or unavailable:

| Feature | Without admin | With admin |
|---------|---------------|------------|
| Per-CCD AMD temperatures (LHM) | ❌ | ✅ |
| PPT / CPU power readings | ❌ | ✅ |
| NUMA topology detection | partial | ✅ |
| CCD thread pinning (`--cpu-mask`) | partial | ✅ |
| LibreHardwareMonitor WMI sensors | ❌ | ✅ |
| ZenPower device access | ❌ | ✅ |

> **Tip:** Pin the elevated shortcut to Taskbar — Windows will remember admin mode for future launches.

---

## Who is this for?

A **laptop local LLM optimizer** and a **NUMA optimizer for Windows** workstations — not only 128-core servers:

| User | CPU examples | What they get |
|------|--------------|---------------|
| **Home AI enthusiast** | Ryzen 5 7600, Core i5-13400 | **Ryzen 5 llama.cpp** tuning, GGUF quant picker, live tok/s |
| **Power user / creator** | Ryzen 7 7800X3D, Core i7-13700K | **CCD thread pinning**, Beast Score, **AMD Ryzen LLM benchmark** |
| **Workstation** | Ryzen 9 7950X, Threadripper | Per-CCD temps via **LibreHardwareMonitor AMD** integration |
| **Server / homelab** | EPYC 9654, Xeon Gold | **EPYC inference tuning**, 60–90% thread count, memory BW monitor |

Anyone running a **local LLM on CPU** — from 8 GB laptops to 512 GB builds — benefits from the right `-t`, `-b`, and `-c`.

---

## What's new in v0.2

- **Tokens per second monitor** — parsed from llama.cpp stderr in real time
- **LibreHardwareMonitor + ZenPower** — per-CCD AMD temperatures & PPT
- **CCD thread pinning UI** — visual selector → `--cpu-mask` for llama.cpp
- **ik_llama.cpp download** — one-click AVX-512 / Zen prebuild for Windows
- **A/B Benchmark** — before/after **local AI performance**, target +15% tok/s

---

## Real-world case studies

Built-in **AMD Ryzen LLM benchmark** and **Intel Core LLM tuning** — compare default `-t` (100% threads) vs LLMMonitor **Balanced** preset + CCD pinning:

### Case 1 — AMD EPYC 9654 (192 threads, 384 GB RAM)
**Model:** Llama 3.1 8B Q4_K_M · **ik_llama.cpp**

| Config | Threads | tok/s | Notes |
|--------|---------|-------|-------|
| Default | 192 | 18.4 | CCD contention, cache thrashing |
| LLMMonitor | 138 + CCD pin | **22.1** | **+20.1%** EPYC inference tuning |

### Case 2 — Ryzen 9 7950X (32 threads, 64 GB)
**Model:** Mistral 7B Q5_K_M

| Config | Threads | tok/s |
|--------|---------|-------|
| Default | 32 | 14.2 |
| LLMMonitor | 24 + 2 CCDs | **16.8** (+18.3%) |

### Case 3 — Ryzen 5 7600 (12 threads, 32 GB)
**Model:** Phi-3 Mini Q4_K_M — typical **Ryzen 5 llama.cpp** setup

| Config | Threads | tok/s |
|--------|---------|-------|
| Default | 12 | 28.5 |
| LLMMonitor | 9 | **31.2** (+9.5%) |

### Case 4 — Intel Core i7-13700K (24 threads, 32 GB)
**Model:** Qwen 2.5 7B Q4_K_M

| Config | Threads | tok/s |
|--------|---------|-------|
| Default | 24 | 11.8 |
| LLMMonitor | 17 | **13.4** (+13.6%) |

### Case 5 — Laptop Ryzen 7 7840U (16 threads, Low Power preset)
**Model:** Gemma 2 2B Q4_K_M — **laptop local LLM optimizer** mode

| Config | Threads | tok/s | Power |
|--------|---------|-------|-------|
| Default | 16 | 19.1 | High PPT |
| LLMMonitor Low Power | 8 | **18.4** | −30% power |

> Run your own numbers in the **A/B Benchmark** tab. Results depend on model, **GGUF quant recommendation**, RAM speed, and cooling.

---

## Key features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Per-core heatmap, CCD/CCX, NUMA nodes, memory bandwidth — full **CPU LLM monitor** |
| **AMD Sensors** | **LibreHardwareMonitor AMD** + ZenPower — per-CCD temp & PPT |
| **Beast Score** | 0–10000 **local AI performance** score for any CPU |
| **LLM Optimizer** | **llama.cpp optimizer**: auto `-t`, `-b`, `-c`, **GGUF quantization**, live tok/s |
| **CCD Pinning** | **CCD thread pinning** UI → `--cpu-mask` hex for llama.cpp / ik_llama.cpp |
| **A/B Benchmark** | Measure **best thread count for local LLM** — before vs after, +15% target |
| **ik_llama.cpp** | One-click **ik_llama.cpp download** — AVX-512, Zen-optimized Windows prebuild |
| **Profiles** | Save presets per model; lighter than full **Ollama alternative Windows** stack |
| **Tools** | Install llama.cpp, ik_llama.cpp, Ollama — pick your backend |

---

## Download

**Requirements:** Windows 10/11 x64, [Node.js 20+](https://nodejs.org/) and [Rust](https://rustup.rs/) for building from source.

```bash
# Pre-built installer (run as Administrator)
src-tauri/target/release/bundle/nsis/LLMMonitor_0.2.0_x64-setup.exe

# Build from source
git clone https://github.com/YOUR_USER/llmmonitor.git
cd llmmonitor && npm install && npm run tauri build
```

Single `.exe` installer, ~15 MB, no bloatware.

---

## Quick start

1. Install **LLMMonitor** and **run as Administrator** — required for sensors, NUMA, and CCD pinning
2. Run **LibreHardwareMonitor** as Admin for per-CCD AMD temps
3. **Tools** → **ik_llama.cpp download** or clone llama.cpp
4. **LLM Optimizer** → select CCDs → Launch → watch the **tokens per second monitor**
5. **A/B Benchmark** → verify your **local AI performance** gain on your hardware

---

## Architecture (v0.2)

```
React GUI
├── Dashboard      — cores, CCD temps (LHM/ZenPower), Beast Score
├── LLM Optimizer  — presets, CCD pinning, live stderr tok/s
├── A/B Benchmark  — llama-bench / llama-cli before vs after
├── Chat / Profiles / Tools
└── Tauri Rust backend
    ├── sensors/    — LHM WMI, ZenPower device, WMI fallback
    ├── pinning/    — CCD → cpu-mask hex
    ├── benchmark/  — subprocess A/B runner
    ├── llm/        — stderr regex parser, ik_llama installer
    └── monitor/    — sysinfo + NUMA APIs
```

---

## Sensor setup (AMD)

1. **Run LLMMonitor.exe as Administrator**
2. Download [LibreHardwareMonitor](https://github.com/LibreHardwareMonitor/LibreHardwareMonitor) — run as Admin
3. LLMMonitor reads Package temp, CCD1/CCD2…, PPT via `root\LibreHardwareMonitor`
4. Optional: ZenPower driver for direct SMU access on advanced setups

---

## Presets

| Preset | Threads | Best for |
|--------|---------|----------|
| **Max Speed** | 85% | Max tok/s, short prompts |
| **Balanced** | 72% | Daily use — typical +15% over default `-t` |
| **Low Power** | 50% | Laptops, thermal limits |
| **Big Context** | 65% | 128K RAG / long documents |

---

## Roadmap

- [x] stderr tok/s parsing
- [x] LHM + ZenPower sensors
- [x] CCD pinning UI
- [x] ik_llama.cpp download
- [x] A/B benchmark
- [ ] Linux (hwloc, zenpower sysfs)
- [ ] GPU `-ngl` auto-detect
- [ ] STREAM memory benchmark

---

## License

MIT — free for personal and commercial use.
