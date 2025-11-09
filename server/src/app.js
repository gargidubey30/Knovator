const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const importRoutes = require("./routes/importRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/import", importRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
