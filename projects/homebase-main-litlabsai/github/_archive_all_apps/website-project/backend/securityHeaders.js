// Security headers middleware for Azure Functions
module.exports = function setSecurityHeaders(context) {
  context.res = context.res || {};
  context.res.headers = context.res.headers || {};
  context.res.headers["Strict-Transport-Security"] =
    "max-age=63072000; includeSubDomains; preload";
  context.res.headers["X-Content-Type-Options"] = "nosniff";
  context.res.headers["X-Frame-Options"] = "DENY";
  context.res.headers["Referrer-Policy"] = "no-referrer";
};
