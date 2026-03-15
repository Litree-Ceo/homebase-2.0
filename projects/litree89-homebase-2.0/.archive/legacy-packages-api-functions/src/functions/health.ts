/**
 * LITLABS API - Azure Functions v4 Entry Point
 * Health check endpoint to verify function app is running
 */
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { registerEpipeHandler } from "../shared/epipe";

registerEpipeHandler();

export async function health(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Health check invoked at ${new Date().toISOString()}`);

  return {
    status: 200,
    jsonBody: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      runtime: process.version,
      environment: process.env.AZURE_FUNCTIONS_ENVIRONMENT || "Development",
    },
  };
}

app.http("health", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "health",
  handler: health,
});
