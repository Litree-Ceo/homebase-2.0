'use client';

import { createContext, useContext, useEffect, useState } from "react";

type Intensity = "low" | "medium" | "ultra";

type PreferencesContextType = {
  intensity: Intensity;
  particles: boolean;
  sound: boolean;
  setIntensity: (v: Intensity) => void;
  setParticles: (v: boolean) => void;
  setSound: (v: boolean) => void;
};

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [intensity, setIntensity] = useState<Intensity>("medium");
  const [particles, setParticles] = useState(true);
  const [sound, setSound] = useState(false);

  // Load saved prefs
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("labstudio_prefs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.intensity === "low" || parsed?.intensity === "medium" || parsed?.intensity === "ultra") {
          setIntensity(parsed.intensity);
        }
        if (typeof parsed?.particles === "boolean") setParticles(parsed.particles);
        if (typeof parsed?.sound === "boolean") setSound(parsed.sound);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Persist prefs
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("labstudio_prefs", JSON.stringify({ intensity, particles, sound }));

    // Fire-and-forget server save (replace with real auth-based user)
    fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intensity, particles, sound }),
    }).catch(() => {});
  }, [intensity, particles, sound]);

  return (
    <PreferencesContext.Provider
      value={{ intensity, particles, sound, setIntensity, setParticles, setSound }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}

// Safe optional hook to avoid hard dependency
export function usePreferencesOptional() {
  return useContext(PreferencesContext);
}
