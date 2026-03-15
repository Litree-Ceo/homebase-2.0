"use client";

import { useEffect, useRef, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import { Card } from "@/components/ui/Card";

type Status = "idle" | "recording" | "transcribing" | "recognizing" | "error";
type Mode = "whisper" | "browser";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export default function SpeechPage() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const speechRef = useRef<SpeechRecognitionLike | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [mode, setMode] = useState<Mode>("whisper");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
      speechRef.current?.stop();
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    setTranscript("");

    if (mode === "browser") {
      startBrowserRecognition();
      return;
    }

    if (typeof window === "undefined" || !navigator.mediaDevices) {
      setError("Recording is only available in the browser.");
      setStatus("error");
      return;
    }

    if (!("MediaRecorder" in window)) {
      setError("MediaRecorder is not supported in this browser.");
      setStatus("error");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await sendForTranscription(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus("recording");
    } catch (err) {
      console.error(err);
      setError("Could not access microphone. Please check permissions.");
      setStatus("error");
    }
  };

  const startBrowserRecognition = () => {
    if (typeof window === "undefined") {
      setError("Recognition is only available in the browser.");
      setStatus("error");
      return;
    }

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setError("Browser speech recognition is not supported here.");
      setStatus("error");
      return;
    }

    const recognizer = new SpeechRecognitionCtor() as SpeechRecognitionLike;
    recognizer.lang = "en-US";
    recognizer.interimResults = true;
    recognizer.continuous = false;

    recognizer.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join(" ");
      setTranscript(text);
    };

    recognizer.onerror = (event: any) => {
      console.error(event);
      setError(event.error || "Browser recognition failed.");
      setStatus("error");
    };

    recognizer.onend = () => {
      setStatus((prev) => (prev === "recognizing" ? "idle" : prev));
    };

    speechRef.current = recognizer;
    recognizer.start();
    setStatus("recognizing");
  };

  const stopRecording = () => {
    if (mode === "browser") {
      speechRef.current?.stop();
      setStatus("idle");
      return;
    }

    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setStatus("transcribing");
    }
  };

  const sendForTranscription = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("file", blob, "speech.webm");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Unable to transcribe audio");
      }

      setTranscript(json.text || "");
      setStatus("idle");
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while transcribing.";
      setError(message);

      if (message.toLowerCase().includes("openai_api_key")) {
        setMode("browser");
      }

      setStatus("error");
    }
  };

  const reset = () => {
    setTranscript("");
    setError(null);
    setStatus("idle");
  };

  const statusLabel =
    status === "recording"
      ? "Listening…"
      : status === "transcribing"
        ? "Transcribing…"
        : status === "recognizing"
          ? "Recognizing (browser)…"
          : "Ready";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 -z-20">
        <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-pink-600/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-blue-600/30 blur-3xl" />
      </div>

      <SiteHeader />

      <main className="relative z-10 mx-auto flex max-w-5xl flex-col gap-8 px-4 py-16">
        <section className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-sm text-white/70 ring-1 ring-white/10">
            🎙️ Speech to Text · Whisper + Browser fallback
          </p>
          <h1 className="text-4xl font-black leading-tight md:text-5xl">
            Record your voice and get instant transcripts
          </h1>
          <p className="max-w-2xl text-lg text-white/70">
            Use the server-backed Whisper route for best accuracy. If an API key
            is missing or blocked, we fall back to browser speech recognition.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-5">
          <Card className="md:col-span-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-white/60">Recorder</p>
                <p className="text-xl font-semibold">{statusLabel}</p>
                <p className="text-xs text-white/50">
                  Mode: {mode === "whisper" ? "Whisper (API)" : "Browser only"}
                </p>
              </div>
              <div
                className={`h-3 w-3 rounded-full ${
                  status === "recording"
                    ? "animate-pulse bg-pink-400 shadow-[0_0_0_6px] shadow-pink-400/30"
                    : status === "transcribing"
                      ? "bg-blue-400 shadow-[0_0_0_6px] shadow-blue-400/30"
                      : status === "recognizing"
                        ? "bg-amber-400 shadow-[0_0_0_6px] shadow-amber-400/30"
                        : status === "error"
                          ? "bg-red-400 shadow-[0_0_0_6px] shadow-red-400/30"
                          : "bg-emerald-400 shadow-[0_0_0_6px] shadow-emerald-400/30"
                }`}
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={startRecording}
                disabled={
                  status === "recording" ||
                  status === "transcribing" ||
                  status === "recognizing"
                }
                className="rounded-lg bg-pink-500 px-4 py-2 font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "recording" || status === "recognizing"
                  ? "Recording…"
                  : "Start Recording"}
              </button>
              <button
                onClick={stopRecording}
                disabled={
                  status !== "recording" && status !== "recognizing"
                }
                className="rounded-lg border border-white/20 px-4 py-2 font-semibold text-white transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Stop &amp; Transcribe
              </button>
              <button
                onClick={reset}
                disabled={status === "recording" || status === "recognizing"}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <button
                onClick={() => {
                  setMode("whisper");
                  setError(null);
                  setTranscript("");
                  setStatus("idle");
                }}
                className={`rounded-lg border px-3 py-1 transition ${
                  mode === "whisper"
                    ? "border-pink-400 bg-pink-500/20 text-white"
                    : "border-white/10 text-white/70 hover:border-white/30"
                }`}
              >
                Whisper (API)
              </button>
              <button
                onClick={() => {
                  setMode("browser");
                  setError(null);
                  setTranscript("");
                  setStatus("idle");
                }}
                className={`rounded-lg border px-3 py-1 transition ${
                  mode === "browser"
                    ? "border-amber-300 bg-amber-400/20 text-white"
                    : "border-white/10 text-white/70 hover:border-white/30"
                }`}
              >
                Browser-only
              </button>
            </div>

            <div className="mt-6 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              <p className="font-semibold text-white">Status</p>
              <p className="text-white/70">
                {status === "recording" && "Recording audio from your mic…"}
                {status === "recognizing" &&
                  "Browser recognition is listening…"}
                {status === "transcribing" &&
                  "Uploading audio and waiting for Whisper…"}
                {status === "idle" && "Idle — ready for a new recording."}
                {status === "error" &&
                  (error || "Something went wrong. Try again.")}
              </p>
            </div>
          </Card>

          <Card className="md:col-span-2 space-y-4">
            <div>
              <p className="text-sm font-semibold text-white">Setup</p>
              <p className="text-sm text-white/70">
                Whisper mode needs <code className="rounded bg-white/10 px-1">OPENAI_API_KEY</code>{" "}
                in <code className="rounded bg-white/10 px-1">.env.local</code>. Browser mode works
                without keys but only in Chrome/Edge and is less accurate.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-white/70">
              <li>• Whisper: best accuracy, multi-language, runs via <code className="rounded bg-white/10 px-1">/api/transcribe</code>.</li>
              <li>• Browser: instant, no backend; relies on your browser&apos;s speech engine.</li>
              <li>• Swap modes above; errors like missing keys auto-suggest Browser mode.</li>
            </ul>
          </Card>
        </div>

        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white/60">Transcript</p>
              <p className="text-lg font-semibold text-white">Latest result</p>
            </div>
            {status === "transcribing" && (
              <span className="text-sm text-blue-200">Processing…</span>
            )}
            {status === "recognizing" && (
              <span className="text-sm text-amber-200">Listening…</span>
            )}
          </div>
          <div className="min-h-[120px] rounded-lg border border-white/10 bg-black/40 p-4 text-white/80">
            {transcript || "No transcript yet. Record something to see it here."}
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
        </Card>
      </main>
    </div>
  );
}
