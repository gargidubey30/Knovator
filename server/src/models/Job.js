const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  externalId: { type: String, required: true, unique: true },
  title: String,
  company: String,
  location: String,
  employmentType: String,
  description: String,
  url: String,
  raw: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model("Job", JobSchema);
