const { Worker } = require("bullmq");
const { importQueue } = require("./queue");
const { fetchAndImport } = require("../services/fetcherService");
const connectDB = require("../config/db");
require("dotenv").config();

// Connect to MongoDB
connectDB();

const worker = new Worker(
  "importQueue",
  async (job) => {
    const feedUrl = job.data.feedUrl;
    console.log(`🚀 Processing job ${job.id} for feed: ${feedUrl}`);

    try {
      await fetchAndImport(feedUrl);
    } catch (error) {
      console.error(`❌ Error processing ${feedUrl}:`, error.message);
      throw error; // Re-throw to mark job as failed
    }
  },
  { connection: importQueue.opts.connection }
);

worker.on("completed", (job) => console.log(`✅ Job ${job.id} completed`));
worker.on("failed", (job, err) => console.error(`❌ Failed job ${job.id}:`, err.message));

module.exports = worker;