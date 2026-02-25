// server.js
require("dotenv").config();
const express = require("express");

const sequelize = require("./config/sequelize"); // ORM
const mySqlPool = require("./config/db");        // Raw SQL

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Route بسيط
app.get("/test", (req, res) => res.send("hello world"));

// ✅ اختبار اتصال ORM (Sequelize)
sequelize
  .authenticate()
  .then(() => console.log("✅ Sequelize Connected"))
  .catch((err) => console.error("❌ Sequelize Error:", err));

// ✅ اختبار اتصال Raw SQL (mysql2)
mySqlPool
  .query("SELECT 1")
  .then(() => console.log("✅ Raw MySQL Connected"))
  .catch((err) => console.error("❌ Raw MySQL Error:", err));

// ✅ مثال Raw SQL endpoint
app.get("/time-raw", async (req, res) => {
  const [rows] = await mySqlPool.query("SELECT NOW() AS now_time");
  res.json(rows[0]);
});

// ✅ مثال ORM endpoint (Sequelize query)
app.get("/time-orm", async (req, res) => {
  const [rows] = await sequelize.query("SELECT NOW() AS now_time");
  res.json(rows[0]);
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});