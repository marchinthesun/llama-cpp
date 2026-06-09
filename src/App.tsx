import { useState } from "react";
import Dashboard from "./components/Dashboard";
import LlmLauncher from "./components/LlmLauncher";
import Benchmark from "./components/Benchmark";
import Chat from "./components/Chat";
import Profiles from "./components/Profiles";
import Tools from "./components/Tools";
import AdminBanner from "./components/AdminBanner";

type Tab = "dashboard" | "llm" | "benchmark" | "chat" | "profiles" | "tools";

const NAV: { id: Tab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "◈" },
  { id: "llm", label: "LLM Optimizer", icon: "⚡" },
  { id: "benchmark", label: "A/B Benchmark", icon: "📊" },
  { id: "chat", label: "Chat", icon: "💬" },
  { id: "profiles", label: "Profiles", icon: "📁" },
  { id: "tools", label: "Tools", icon: "🔧" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">LM</div>
          <div>
            <div className="logo-text">LLMMonitor</div>
            <div className="logo-sub">NUMA Optimizer</div>
          </div>
        </div>
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${tab === item.id ? "active" : ""}`}
            onClick={() => setTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </aside>
      <main className="main">
        <AdminBanner />
        {tab === "dashboard" && <Dashboard />}
        {tab === "llm" && <LlmLauncher />}
        {tab === "benchmark" && <Benchmark />}
        {tab === "chat" && <Chat />}
        {tab === "profiles" && <Profiles />}
        {tab === "tools" && <Tools />}
      </main>
    </div>
  );
}
