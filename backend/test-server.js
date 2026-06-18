const express = require("express");
const app = express();

app.get("/api/test", (req, res) => {
  console.log("✅ GET /api/test");
  res.json({ success: true, message: "Minimal server works!" });
});

app.listen(5001, "0.0.0.0", () => {
  console.log("🚀 Test server running on port 5001");
});
