// Azure Function: Chat API (SignalR negotiation)
const authenticate = require("../backend/auth");
const setCors = require("../backend/cors");
const setSecurityHeaders = require("../backend/securityHeaders");

module.exports = async function (context, req) {
  if (!authenticate(context, req)) return;
  // Example: Negotiate SignalR connection (replace with real logic)
  if (req.method === "POST") {
    // Require userId in body for negotiation (example)
    if (!req.body || !req.body.userId) {
      context.res = {
        status: 400,
        body: { error: "Missing userId in request body" },
      };
      setCors(context);
      return;
    }
    const url = process.env.SIGNALR_URL;
    if (!url) {
      context.res = {
        status: 500,
        body: { error: "SignalR URL not configured" },
      };
      setCors(context);
      return;
    }
    context.res = {
      status: 200,
      body: {
        url,
        accessToken: process.env.SIGNALR_ACCESS_TOKEN || "",
      },
    };
  } else {
    context.res = { status: 405 };
  }
  setCors(context);
  setSecurityHeaders(context);
};
