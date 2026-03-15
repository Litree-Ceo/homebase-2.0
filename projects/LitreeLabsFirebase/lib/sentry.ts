import * as Sentry from "@sentry/node";

let sentryInitialized = false;

export function initSentry() {
  if (sentryInitialized) return;

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return; // silently skip if not configured

  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "production",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    beforeSend(event) {
      if (event.request?.headers) {
        delete (event.request.headers as any)["authorization"];
        delete (event.request.headers as any)["cookie"];
      }
      return event;
    },
  });

  sentryInitialized = true;
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!sentryInitialized) return;
  if (context) Sentry.setContext("extra", context);
  Sentry.captureException(error);
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  if (!sentryInitialized) return;
  Sentry.captureMessage(message, level);
}

export { Sentry };
