const express = require("express");
const ImportLog = require("../models/ImportLog");
const router = express.Router();

router.get("/import-logs", async (req, res) => {
  const logs = await ImportLog.find().sort({ timestamp: -1 }).limit(20);
  res.json({ data: logs });
});

module.exports = router;
