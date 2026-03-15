// CORS middleware for Azure Functions
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

module.exports = function setCors(context) {
  const origin =
    context.req && context.req.headers && context.req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    context.res = context.res || {};
    context.res.headers = context.res.headers || {};
    context.res.headers["Access-Control-Allow-Origin"] = origin;
    context.res.headers["Vary"] = "Origin";
    context.res.headers["Access-Control-Allow-Credentials"] = "true";
    context.res.headers["Access-Control-Allow-Headers"] =
      "Authorization,Content-Type";
    context.res.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS";
  }
};
