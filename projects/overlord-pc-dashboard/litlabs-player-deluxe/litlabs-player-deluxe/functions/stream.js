/**
 * Firebase Functions providing lightweight Real-Debrid API proxies.
 */
/* eslint-disable require-jsdoc, max-len */
const functions = require("firebase-functions");

const RD_API_BASE = "https://api.real-debrid.com/rest/1.0";

function rdKey() {
  return process.env.RD_API_KEY || "";
}

/** GET /api/stream/config */
exports.streamConfig = functions.https.onRequest(async (req, res) => {
  res.json({api_configured: !!rdKey()});
});

/** GET /api/stream/torrents */
exports.streamTorrents = functions.https.onRequest(async (req, res) => {
  if (!rdKey()) return res.json([]);
  try {
    const r = await fetch(`${RD_API_BASE}/torrents/active`, {
      headers: {Authorization: `Bearer ${rdKey()}`},
    });
    if (!r.ok) {
      return res.status(502).json({error: "Real-Debrid upstream error"});
    }
    const data = await r.json();
    return res.json(data || []);
  } catch (e) {
    console.error("[streamTorrents] error", e);
    return res.status(500).json({error: "Internal error"});
  }
});

/** POST /api/stream/addMagnet */
exports.streamAddMagnet = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({error: "Method not allowed"});
  if (!rdKey()) return res.status(400).json({error: "RD_API_KEY not configured"});

  const {magnet} = req.body || {};
  if (!magnet) return res.status(400).json({error: "magnet required"});

  try {
    const r = await fetch(`${RD_API_BASE}/torrents/addMagnet`, {
      method: "POST",
      headers: {"Authorization": `Bearer ${rdKey()}`, "Content-Type": "application/json"},
      body: JSON.stringify({magnet}),
    });
    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({error: "Real-Debrid upstream error", detail: text});
    }
    const data = await r.json();
    return res.json(data);
  } catch (e) {
    console.error("[streamAddMagnet] error", e);
    return res.status(500).json({error: "Internal error"});
  }
});

/** POST /api/stream/unrestrict */
exports.streamUnrestrict = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({error: "Method not allowed"});
  if (!rdKey()) return res.status(400).json({error: "RD_API_KEY not configured"});

  const {link} = req.body || {};
  if (!link) return res.status(400).json({error: "link required"});

  try {
    const r = await fetch(`${RD_API_BASE}/unrestrict/link`, {
      method: "POST",
      headers: {"Authorization": `Bearer ${rdKey()}`, "Content-Type": "application/json"},
      body: JSON.stringify({link}),
    });
    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({error: "Real-Debrid upstream error", detail: text});
    }
    const data = await r.json();
    return res.json(data);
  } catch (e) {
    console.error("[streamUnrestrict] error", e);
    return res.status(500).json({error: "Internal error"});
  }
});
