const app = require("./app");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
dotenv.config();

// Connect to MongoDB (shared connection)
connectDB();
// MongoDB connection


// Start worker
require("./queues/worker"); // 👈 IMPORTANT: start BullMQ worker here

// Start Express server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
