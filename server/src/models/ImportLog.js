const mongoose = require("mongoose");

const ImportLogSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true }, // feedUrl stored as fileName
    totalFetched: { type: Number, required: true },
    totalImported: { type: Number, required: true },
    newJobs: { type: Number, default: 0 },
    updatedJobs: { type: Number, default: 0 },
    failedJobs: [
      {
        link: String,
        reason: String,
      },
    ],
    status: { type: String, enum: ["success", "failed"], default: "success" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImportLog", ImportLogSchema);