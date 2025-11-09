const mongoose = require("mongoose");

const ImportLogSchema = new mongoose.Schema(
  {
    feedUrl: { type: String, required: true },
    importedCount: { type: Number, required: true },
    status: { type: String, enum: ["success", "failed"], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImportLog", ImportLogSchema);
