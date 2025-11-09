// server/src/routes/importRoutes.js

const express = require("express");
const router = express.Router();
const { importQueue } = require("../queues/queue");
const ImportLog = require("../models/ImportLog");

// 🧠 POST /api/import/enqueue → Enqueue new feed import
router.post("/enqueue", async (req, res) => {
  try {
    const { feedUrl } = req.body;

    if (!feedUrl) {
      return res.status(400).json({ error: "feedUrl is required" });
    }

    await importQueue.add("importJob", { feedUrl });
    console.log(`📨 Enqueued feed: ${feedUrl}`);

    res.json({ success: true, queued: 1 });
  } catch (err) {
    console.error("Error enqueueing feed:", err);
    res.status(500).json({ error: "Failed to enqueue feed" });
  }
});

// 🧠 GET /api/import/history → Return import logs
router.get("/history", async (req, res) => {
  try {
    const logs = await ImportLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    console.error("Error fetching import history:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
