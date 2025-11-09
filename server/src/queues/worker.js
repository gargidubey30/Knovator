const { Worker } = require("bullmq");
const mongoose = require("mongoose");
const axios = require("axios");
const xml2js = require("xml2js");
const { importQueue } = require("./queue");
const ImportLog = require("../models/ImportLog");
const Job = require("../models/Job");
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
      console.log(`📥 Fetching feed from: ${feedUrl}`);
      const response = await axios.get(feedUrl);
      const result = await xml2js.parseStringPromise(response.data, { explicitArray: false });

      const items = result.rss.channel.item || [];
      let totalImported = 0;

      for (const item of items) {
        const existing = await Job.findOne({ externalId: item.guid || item.link });
        if (!existing) {
          await Job.create({
            title: item.title,
            link: item.link,
            description: item.description,
            company: item["job:company"] || "Unknown",
            pubDate: new Date(item.pubDate),
            externalId: item.guid || item.link,
          });
          totalImported++;
        }
      }

      // ✅ Log the import
      await ImportLog.create({
        fileName: feedUrl,
        totalFetched: items.length,
        totalImported,
        newJobs: totalImported,
        updatedJobs: 0,
      });

      console.log(`✅ Imported ${totalImported} jobs from ${feedUrl}`);
    } catch (error) {
      console.error(`❌ Error processing ${feedUrl}:`, error.message);
    }
  },
  { connection: importQueue.opts.connection }
);

worker.on("completed", (job) => console.log(`✅ Job ${job.id} completed`));
worker.on("failed", (job, err) => console.error(`❌ Failed job ${job.id}`, err));
