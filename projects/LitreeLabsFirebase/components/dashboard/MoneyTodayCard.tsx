"use client";

import { useState } from "react";
import { callGenerateMoneyToday, MoneyTodayActionClient } from "@/lib/functionsClient";

export function MoneyTodayCard() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<MoneyTodayActionClient[] | null>(null);
  const [summary, setSummary] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleMakeMoneyToday = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await callGenerateMoneyToday();
      setSummary(result.summary);
      setPlan(result.todayPlan);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to generate money today plan");
      console.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Brief success feedback
    const el = document.activeElement as HTMLElement;
    const originalText = el?.textContent;
    if (el && el.textContent) {
      el.textContent = "✓ Copied!";
      setTimeout(() => {
        if (el && originalText) el.textContent = originalText;
      }, 1500);
    }
  };

  return (
    <div className="rounded-lg border border-[#40e0d0]/30 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">💰 Make Me Money Today</h3>
          <p className="mt-1 text-sm text-[#40e0d0]">Get 2-3 quick actions with ready-to-use scripts</p>
        </div>
      </div>

      {/* Panic Button */}
      <button
        onClick={handleMakeMoneyToday}
        disabled={loading}
        className="mb-6 w-full rounded-lg bg-gradient-to-r from-[#ff0080] to-[#ff8c00] py-3 font-bold text-white transition-all hover:shadow-lg hover:shadow-[#ff0080]/50 disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            Generating your moves...
          </span>
        ) : (
          "🚨 Make Me Money Today"
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
          <button
            onClick={handleMakeMoneyToday}
            className="ml-2 underline hover:text-red-300"
          >
            Try again
          </button>
        </div>
      )}

      {/* Summary & Plan */}
      {plan && plan.length > 0 && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="rounded-lg bg-[#0a0a0a]/50 p-4">
            <p className="text-sm leading-relaxed text-[#40e0d0]">{summary}</p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {plan.map((action, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-lg border border-[#00d4ff]/20 bg-[#0a0a0a]/50"
              >
                {/* Action Header */}
                <button
                  onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                  className="w-full px-4 py-3 text-left transition-colors hover:bg-[#1a1a1a]"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">{action.title}</h4>
                    <span className="text-[#40e0d0]">
                      {expandedIndex === idx ? "▼" : "▶"}
                    </span>
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedIndex === idx && (
                  <div className="border-t border-[#00d4ff]/10 px-4 py-3 space-y-4 bg-[#1a1a1a]/30">
                    {/* Description */}
                    <div>
                      <p className="text-xs font-semibold text-[#40e0d0] uppercase tracking-wide mb-1">
                        What to do
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed">{action.description}</p>
                    </div>

                    {/* Assets */}
                    {action.assetsNeeded && action.assetsNeeded.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#40e0d0] uppercase tracking-wide mb-2">
                          You&apos;ll need
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {action.assetsNeeded.map((asset, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-[#00d4ff]/10 px-3 py-1 text-xs text-[#00d4ff]"
                            >
                              {asset}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Scripts */}
                    <div className="space-y-3">
                      {/* Post Caption */}
                      <div>
                        <p className="text-xs font-semibold text-[#ff8c00] uppercase tracking-wide mb-2">
                          📱 Post Caption
                        </p>
                        <div className="rounded-lg bg-[#0a0a0a] p-3 group relative">
                          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed pr-8">
                            {action.scripts.postCaption}
                          </p>
                          <button
                            onClick={() =>
                              copyToClipboard(action.scripts.postCaption)
                            }
                            className="absolute top-2 right-2 rounded bg-[#00d4ff]/10 px-2 py-1 text-xs text-[#00d4ff] opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      {/* DM Text */}
                      <div>
                        <p className="text-xs font-semibold text-[#ff0080] uppercase tracking-wide mb-2">
                          💬 DM Text
                        </p>
                        <div className="rounded-lg bg-[#0a0a0a] p-3 group relative">
                          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed pr-8">
                            {action.scripts.dmText}
                          </p>
                          <button
                            onClick={() =>
                              copyToClipboard(action.scripts.dmText)
                            }
                            className="absolute top-2 right-2 rounded bg-[#00d4ff]/10 px-2 py-1 text-xs text-[#00d4ff] opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      {/* Story Script */}
                      <div>
                        <p className="text-xs font-semibold text-[#40e0d0] uppercase tracking-wide mb-2">
                          🎬 Story Script
                        </p>
                        <div className="rounded-lg bg-[#0a0a0a] p-3 group relative">
                          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed pr-8">
                            {action.scripts.storyScript}
                          </p>
                          <button
                            onClick={() =>
                              copyToClipboard(action.scripts.storyScript)
                            }
                            className="absolute top-2 right-2 rounded bg-[#00d4ff]/10 px-2 py-1 text-xs text-[#00d4ff] opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !plan && !error && (
        <div className="rounded-lg bg-[#1a1a1a] p-4 text-center">
          <p className="text-sm text-gray-400">
            Click the button above when you need money moves TODAY.
          </p>
        </div>
      )}
    </div>
  );
}
