"use client";

import { useState } from "react";
import { callGenerateOnboardingResponse } from "@/lib/functionsClient";

interface BusinessProfile {
  businessType?: string;
  idealClients?: string;
  struggle?: string;
  moneyGoal?: string;
  availability?: string;
}

type OnboardingStep =
  | "welcome"
  | "business_type"
  | "ideal_clients"
  | "struggle"
  | "money_goal"
  | "availability"
  | "summary_confirm"
  | "first_win_choice"
  | "first_win"
  | "complete";

export function ChatBotOnboarding() {
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [messages, setMessages] = useState<Array<{ role: "bot" | "user"; text: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile>({});
  const [complete, setComplete] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    // Add user message
    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      // Update profile based on step
      const updatedProfile = { ...profile };
      if (step === "business_type") {
        updatedProfile.businessType = userText;
      } else if (step === "ideal_clients") {
        updatedProfile.idealClients = userText;
      } else if (step === "struggle") {
        updatedProfile.struggle = userText;
      } else if (step === "money_goal") {
        updatedProfile.moneyGoal = userText;
      } else if (step === "availability") {
        updatedProfile.availability = userText;
      }
      setProfile(updatedProfile);

      // Call Cloud Function
      const response = await callGenerateOnboardingResponse(step, userText, updatedProfile);

      if (!response) {
        throw new Error('No response from server');
      }

      // Add bot response
      setMessages((prev) => [...prev, { role: "bot", text: response.message }]);

      // Move to next step
      const nextStep = response.step as OnboardingStep;
      setStep(nextStep);

      if (nextStep === "complete") {
        setComplete(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Onboarding error:", msg);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Oops, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setStep("welcome");
    setMessages([]);
    setInput("");
    setProfile({});
    setComplete(false);
  };

  // Initial bot message
  if (messages.length === 0 && !complete) {
    return (
      <div className="rounded-lg border border-[#40e0d0]/30 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-bold text-white">🤖 Welcome to LitLabs OS</h3>
        <p className="mb-4 text-sm text-gray-400">
          Let&apos;s set you up. Just answer a few questions so I can understand your business and help
          you make money faster.
        </p>
        <button
          onClick={handleSendMessage}
          className="w-full rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#40e0d0] py-3 font-semibold text-[#0a0a0a] transition-all hover:shadow-lg hover:shadow-[#40e0d0]/50"
        >
          Let&apos;s Begin →
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#40e0d0]/30 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] p-6 shadow-lg">
      {/* Chat History */}
      <div className="mb-6 max-h-[400px] space-y-4 overflow-y-auto rounded-lg bg-[#1a1a1a]/50 p-4">
        {messages.length === 0 ? (
          <button
            onClick={() => {
              setMessages([
                {
                  role: "bot",
                  text: "Yo, I'm LitLabs OS 👋🏽\nYour AI command center for clients, content, and money.\n\nWho am I helping? (Like: 'lash tech in Detroit', 'barber', 'nail artist online', etc.)",
                },
              ]);
              setStep("business_type");
            }}
            className="w-full rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#40e0d0] py-3 font-semibold text-[#0a0a0a] transition-all hover:shadow-lg hover:shadow-[#40e0d0]/50"
          >
            Start Conversation →
          </button>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "rounded-br-none bg-[#00d4ff]/20 text-[#00d4ff]"
                    : "rounded-bl-none bg-[#1a1a1a] text-white"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg rounded-bl-none bg-[#1a1a1a] px-4 py-2">
              <div className="flex gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-[#40e0d0]"></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-[#40e0d0]"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-[#40e0d0]"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Completion Screen */}
      {complete ? (
        <div className="space-y-4 rounded-lg border border-[#40e0d0]/50 bg-[#0a0a0a] p-4 text-center">
          <div className="text-3xl">🚀</div>
          <div>
            <h4 className="text-lg font-bold text-white mb-2">You&apos;re All Set!</h4>
            <p className="text-sm text-gray-400">
              I&apos;ve got your profile saved. Now you&apos;re ready to use all the features:
            </p>
            <ul className="mt-3 space-y-1 text-xs text-[#40e0d0]">
              <li>💰 Make Me Money Today</li>
              <li>📱 7-Day Content Plans</li>
              <li>💬 DM Scripts That Book</li>
              <li>📊 Real-Time Analytics</li>
            </ul>
          </div>
          <button
            onClick={handleStartOver}
            className="mt-4 w-full rounded-lg bg-[#00d4ff]/20 py-2 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/30"
          >
            Start Over
          </button>
        </div>
      ) : (
        /* Input Area */
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your answer..."
            disabled={loading || complete}
            className="flex-1 rounded-lg border border-[#40e0d0]/20 bg-[#0a0a0a] px-4 py-2 text-sm text-white placeholder-gray-500 transition-colors focus:border-[#40e0d0] focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim() || complete}
            className="rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#40e0d0] px-4 py-2 font-semibold text-[#0a0a0a] transition-all hover:shadow-lg hover:shadow-[#40e0d0]/50 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
