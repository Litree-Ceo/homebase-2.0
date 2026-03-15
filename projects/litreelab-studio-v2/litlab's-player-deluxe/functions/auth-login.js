const functions = require("firebase-functions");
const admin = require("firebase-admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Initialize admin SDK only once
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Use a secure, environment-variable-based secret for JWT
const jwtSecret = process.env.JWT_SECRET || "your-super-secret-fallback-key-that-is-long-and-random";
if (jwtSecret.includes("fallback")) {
    console.warn("WARNING: Using fallback JWT secret. Set the JWT_SECRET environment variable for production.");
}

const db = admin.database();

exports.authLogin = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Fetch user from Realtime Database
    const userRef = db.ref(`/users/${email.replace(/\./g, "_")}`);
    const snapshot = await userRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = snapshot.val();

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
        { id: snapshot.key, email: user.email, tier: user.tier },
        jwtSecret,
        { expiresIn: "1h" } // Token expires in 1 hour
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
          email: user.email,
          tier: user.tier
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
