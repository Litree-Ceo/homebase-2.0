// Azure Function: Auth API (register & login)
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  findUserByEmail,
  createUser,
  updateUserSubscription,
  getUserById,
} = require("../backend/userDb");
const setCors = require("../backend/cors");
const setSecurityHeaders = require("../backend/securityHeaders");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async function (context, req) {
  setCors(context);
  setSecurityHeaders(context);
  if (req.method === "POST") {
    const { action, email, password, name, userId, subscription } =
      req.body || {};
    // Registration and login
    if (action === "register" || action === "login") {
      if (!email || !password || (action === "register" && !name)) {
        context.res = { status: 400, body: { error: "Missing fields" } };
        return;
      }
      if (action === "register") {
        // Registration
        const existing = await findUserByEmail(email);
        if (existing) {
          context.res = {
            status: 409,
            body: { error: "Email already registered" },
          };
          return;
        }
        const user = await createUser({ email, password, name });
        const token = jwt.sign(
          { id: user.id, email: user.email, name: user.name },
          JWT_SECRET,
          { expiresIn: "7d" }
        );
        context.res = {
          status: 201,
          body: {
            token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              subscription: user.subscription,
              packs: user.packs || [],
            },
          },
        };
        return;
      } else if (action === "login") {
        // Login
        const user = await findUserByEmail(email);
        if (!user) {
          context.res = { status: 401, body: { error: "Invalid credentials" } };
          return;
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          context.res = { status: 401, body: { error: "Invalid credentials" } };
          return;
        }
        const token = jwt.sign(
          { id: user.id, email: user.email, name: user.name },
          JWT_SECRET,
          { expiresIn: "7d" }
        );
        context.res = {
          status: 200,
          body: {
            token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              subscription: user.subscription,
              packs: user.packs || [],
            },
          },
        };
        return;
      }
    }
    // Subscription management
    if (action === "update-subscription") {
      if (!userId || !subscription) {
        context.res = {
          status: 400,
          body: { error: "Missing userId or subscription" },
        };
        return;
      }
      try {
        const user = await updateUserSubscription(userId, subscription);
        context.res = {
          status: 200,
          body: { subscription: user.subscription },
        };
      } catch (err) {
        context.res = { status: 404, body: { error: err.message } };
      }
      return;
    }
  } else if (req.method === "GET") {
    // Get user subscription status
    const { userId } = req.query;
    if (!userId) {
      context.res = { status: 400, body: { error: "Missing userId" } };
      return;
    }
    try {
      const user = await getUserById(userId);
      if (!user) throw new Error("User not found");
      context.res = { status: 200, body: { subscription: user.subscription } };
    } catch (err) {
      context.res = { status: 404, body: { error: err.message } };
    }
    return;
  } else {
    context.res = { status: 405 };
  }
};
