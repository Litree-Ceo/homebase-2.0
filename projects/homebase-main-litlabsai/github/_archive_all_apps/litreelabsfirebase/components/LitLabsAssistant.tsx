"use client";

import { useState } from "react";

type Message = {
  id: number;
  from: "user" | "bot";
  text: string;
};

let idCounter = 1;

export default function LitLabsAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: idCounter++,
      from: "bot",
      text:
        "Hey, I'm LitLabs Assistant. Ask me things like:\n" +
        "• Which command should I use?\n" +
        "• How do I get more bookings?\n" +
        "• How do I handle a weird DM?\n" +
        "• What should I do with my content this week?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleOpen = () => setOpen((v) => !v);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");

    // Add user message immediately
    const userMsg: Message = {
      id: idCounter++,
      from: "user",
      text: userText,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Call your API route (stubbed for now)
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      if (!res.ok) {
        throw new Error("API error");
      }

      const data = await res.json();
      const botText: string =
        data.text ||
        "I had trouble thinking just now. Try asking that one more time.";

      const botMsg: Message = {
        id: idCounter++,
        from: "bot",
        text: botText,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errMsg: Message = {
        id: idCounter++,
        from: "bot",
        text:
          "Something went off on the backend. For now, think in commands:\n\n" +
          "/daily_post – get a post + caption\n" +
          "/promo – slow-day offer\n" +
          "/dm_reply – answer 'how much?'\n" +
          "/fraud_check – scan sketchy messages.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={toggleOpen}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-sky-500 px-3 py-2 text-xs font-semibold shadow-[0_0_30px_rgba(236,72,153,0.9)] hover:scale-[1.03] active:scale-95 transition-transform"
      >
        <span className="h-6 w-6 rounded-full bg-black/30 flex items-center justify-center text-lg">
          💬
        </span>
        <span className="hidden sm:inline">Ask LitLabs</span>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-16 right-4 z-40 w-[90vw] max-w-sm rounded-3xl border border-white/20 bg-black/95 backdrop-blur shadow-[0_0_40px_rgba(15,23,42,0.9)] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/15 bg-gradient-to-r from-pink-500/20 via-black to-sky-500/20">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-2xl bg-gradient-to-br from-pink-500 to-sky-500 flex items-center justify-center text-[11px] font-black">
                LL
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold">LitLabs Assistant</p>
                <p className="text-[10px] text-white/65">
                  Ask anything about growth, commands, or weird DMs.
                </p>
              </div>
            </div>
            <button
              onClick={toggleOpen}
              className="text-[16px] text-white/60 hover:text-white"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 max-h-80 overflow-y-auto px-3 py-2 space-y-2 text-[11px]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 whitespace-pre-wrap ${
                    m.from === "user"
                      ? "bg-pink-500 text-black"
                      : "bg-white/5 text-white/80 border border-white/15"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-3 py-2 bg-white/5 border border-white/15 text-white/60">
                  Thinking…
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-white/15 p-2 bg-black/90">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              className="w-full rounded-2xl border border-white/20 bg-black/80 px-3 py-1.5 text-[11px] focus:outline-none focus:border-pink-500/80 focus:ring-1 focus:ring-pink-500/60"
              placeholder="Example: Which command should I use to fill up this Friday?"
            />
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-3 py-1.5 rounded-full bg-pink-500 text-[11px] font-semibold shadow-[0_0_18px_rgba(236,72,153,0.6)] hover:bg-pink-400 disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
