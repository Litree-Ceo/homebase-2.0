// Azure Function: User API
const authenticate = require("../backend/auth");
const setCors = require("../backend/cors");
const setSecurityHeaders = require("../backend/securityHeaders");
const { findUserByEmail } = require("../backend/userDb");

module.exports = async function (context, req) {
  setCors(context);
  setSecurityHeaders(context);
  if (!authenticate(context, req)) return;
  if (req.method === "GET") {
    // Get user profile from Cosmos DB using JWT user email
    const user = req.user;
    if (!user || !user.email) {
      context.res = { status: 400, body: { error: "Missing user info" } };
      return;
    }
    const dbUser = await findUserByEmail(user.email);
    if (!dbUser) {
      context.res = { status: 404, body: { error: "User not found" } };
      return;
    }
    context.res = {
      status: 200,
      body: { id: dbUser.id, email: dbUser.email, name: dbUser.name },
    };
  } else if (req.method === "POST" || req.method === "PUT") {
    context.res = {
      status: 400,
      body: { error: "User update not implemented" },
    };
    return;
  } else {
    context.res = { status: 405 };
  }
};
