const mongoose = require("mongoose");

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    console.log("⚙️ MongoDB already connected");
    return;
  }

  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/knovator-job-importer");
    console.log("✅ MongoDB Connected (Shared)");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
}

module.exports = connectDB;
