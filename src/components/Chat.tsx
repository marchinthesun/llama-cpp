import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Welcome to LLMMonitor Chat. Connect a running llama.cpp model via the LLM Optimizer tab to start chatting. This built-in web chat will stream tokens in real-time once a model is loaded.",
    },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input };
    setMessages((m) => [
      ...m,
      userMsg,
      {
        role: "assistant",
        text: "Model not connected. Launch llama.cpp from the LLM Optimizer tab with a valid .gguf model path, then return here to chat.",
      },
    ]);
    setInput("");
  };

  return (
    <>
      <h1 className="page-title">Chat</h1>
      <p className="page-sub">Built-in chat interface for local LLM inference</p>

      <div className="card chat-container">
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role}`}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="chat-input-row">
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button className="btn btn-primary" onClick={send}>
            Send
          </button>
        </div>
      </div>
    </>
  );
}
