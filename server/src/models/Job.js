const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  link: { type: String, required: true, unique: true }, // Using link as unique identifier
  title: { type: String, required: true },
  company: { type: String, default: "Unknown" },
  location: String,
  employmentType: String,
  description: String,
  pubDate: Date,
  raw: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

// Add indexes for better query performance
JobSchema.index({ link: 1 });
JobSchema.index({ pubDate: -1 });
JobSchema.index({ company: 1 });

module.exports = mongoose.model("Job", JobSchema);