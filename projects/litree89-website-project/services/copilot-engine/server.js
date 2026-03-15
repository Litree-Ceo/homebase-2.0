const express = require("express");
const app = express();

app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

// Example: Copilot orchestration endpoint
app.post("/copilot/plan", async (req, res) => {
  const { prompt, context } = req.body || {};
  // TODO: call your model provider / tools / workflows
  res.json({
    prompt,
    context,
    actions: [
      { type: "open", target: "wallet" },
      { type: "start", target: "mission" },
      { type: "join", target: "guild" },
    ],
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Copilot Engine listening on ${port}`));
