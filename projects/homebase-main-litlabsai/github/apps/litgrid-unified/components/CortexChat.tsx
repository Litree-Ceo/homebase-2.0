"use client";

import { useState } from "react";
import { Send, Terminal, Cpu } from "lucide-react";

export default function CortexChat() {
  const [messages, setMessages] = useState([
    { role: "ai", content: "Initializing Cortex AI... Vertex connection established. How can I assist you with the Social OS?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    
    try {
      const response = await fetch('http://localhost:8080/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: data.response || "No response received from Cortex." 
      }]);
    } catch (error) {
      console.error('Cortex Chat Error:', error);
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: "Error: Could not connect to the Cortex AI backend. Ensure the server is running." 
      }]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/90 text-matrix font-mono border border-matrix/30 rounded-md overflow-hidden shadow-[0_0_15px_rgba(0,255,65,0.2)]">
      <div className="bg-black/80 border-b border-matrix/30 p-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Cpu size={14} className="text-litBlue" />
          <span className="text-litBlue font-bold tracking-wider">CORTEX_AI_TERMINAL</span>
        </div>
        <span className="text-matrix/50">v2.0.4</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] text-sm p-3 rounded-md ${
              msg.role === "user" 
                ? "bg-litBlue/10 border border-litBlue/30 text-litBlue" 
                : "bg-matrix/10 border border-matrix/30 text-matrix"
            }`}>
              {msg.role === "ai" && <Terminal size={12} className="inline mr-2 mb-1" />}
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-matrix/30 bg-black/80 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter command..." 
          className="flex-1 bg-transparent border-b border-matrix/50 focus:border-litBlue focus:outline-none text-sm p-1 text-white placeholder:text-matrix/30 transition-colors"
        />
        <button type="submit" className="text-matrix hover:text-litBlue transition-colors p-1">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
