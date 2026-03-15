const functions = require("firebase-functions");
const admin = require("firebase-admin");
const bcrypt = require("bcrypt");

// Initialize admin SDK only once
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.database();
const saltRounds = 10;

exports.authRegister = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if user already exists
    const userRef = db.ref(`/users/${email.replace(/\./g, "_")}`);
    const snapshot = await userRef.once("value");

    if (snapshot.exists()) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Store user in Realtime Database
    await userRef.set({
      email: email,
      password: hashedPassword,
      createdAt: admin.database.ServerValue.TIMESTAMP,
      tier: "free",
    });

    return res.status(201).json({
      message: "User created successfully",
      email: email,
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
