const { Queue } = require("bullmq");
const IORedis = require("ioredis");

// ✅ Create a Redis connection with required BullMQ options
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,  // BullMQ requirement
  enableReadyCheck: false      // Optional but recommended for local dev
});

// ✅ Create the queue instance
const importQueue = new Queue("importQueue", { connection });

module.exports = { importQueue, connection };

