// server/index.js
const express = require("express");
const app = express();
app.use(express.json());
app.use("/api/packs", require("./api/packs"));
app.use("/api/webhook", require("./api/webhook"));
// ...existing middleware and routes...

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
