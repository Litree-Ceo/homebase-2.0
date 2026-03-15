// JWT Authentication middleware for Azure Functions
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function authenticate(context, req) {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    context.res = {
      status: 401,
      body: { error: "Missing or invalid Authorization header" },
    };
    return false;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return true;
  } catch (err) {
    context.res = { status: 401, body: { error: "Invalid or expired token" } };
    return false;
  }
};
