"use client";

import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebase";

const functions = app ? getFunctions(app, "us-central1") : null;

export interface MoneyTodayActionClient {
  title: string;
  description: string;
  assetsNeeded: string[];
  scripts: {
    postCaption: string;
    dmText: string;
    storyScript: string;
  };
}

export interface MoneyTodayClientResponse {
  planId: string;
  summary: string;
  todayPlan: MoneyTodayActionClient[];
}

export async function callGenerateMoneyToday(input?: {
  businessType?: string;
  idealClients?: string;
  audienceSize?: string;
  availabilityToday?: string;
  promosRunning?: string;
}): Promise<MoneyTodayClientResponse> {
  if (!functions) throw new Error("Firebase Functions not initialized");
  const fn = httpsCallable(functions, "generateMoneyToday");
  const res = (await fn(input || {})) as { data?: unknown };
  const data = (res.data || {}) as {
    planId?: string;
    moneyPlan?: { summary?: string; todayPlan?: MoneyTodayActionClient[] };
  };

  return {
    planId: data.planId || "",
    summary: data.moneyPlan?.summary || "",
    todayPlan: data.moneyPlan?.todayPlan || [],
  };
}

export async function callCreateCheckoutSession(plan: "growth" | "godmode") {
  if (!functions) throw new Error("Firebase Functions not initialized");
  const fn = httpsCallable(functions, "createCheckoutSession");
  const res = (await fn({
    plan,
    successUrl: `${window.location.origin}/dashboard?upgraded=${plan}`,
    cancelUrl: `${window.location.origin}/pricing`,
  })) as { data?: { url?: string } };

  return res.data?.url || null;
}

export async function callGenerateOnboardingResponse(
  step: string,
  userInput: string,
  businessProfile?: Record<string, unknown>,
): Promise<{ message: string; step: string } | null> {
  if (!functions) return null;
  const fn = httpsCallable(functions, "generateOnboardingResponse");
  const res = (await fn({ step, userInput, businessProfile })) as {
    data?: unknown;
  };
  const data = (res.data || {}) as { step?: string; message?: string };
  if (!data.step || !data.message) return null;
  return { step: data.step, message: data.message };
}
