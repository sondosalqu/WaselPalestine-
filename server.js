// server.js
require("dotenv").config();
const express = require("express");

const sequelize = require("./config/sequelize"); // ORM
const mySqlPool = require("./config/db");        // Raw SQL


const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//route
app.use("/api/v1/checkpoints", require("./routes/checkPointRout"));

app.use("/api/v1/users", require("./routes/userRout"));

app.use("/api/v1/routes", require("./routes/routeEstimationRoute"));


app.use("/api/v1/reports", require("./routes/reports.routes"));


app.get("/test", (req, res) => res.send("hello world"));

sequelize
  .authenticate()
  .then(() => console.log("✅ Sequelize Connected"))
  .catch((err) => console.error("❌ Sequelize Error:", err));


mySqlPool
  .query("SELECT 1")
  .then(() => console.log("✅ Raw MySQL Connected"))
  .catch((err) => console.error("❌ Raw MySQL Error:", err));




app.get("/time-raw", async (req, res) => {
  const [rows] = await mySqlPool.query("SELECT NOW() AS now_time");
  res.json(rows[0]);
});



app.get("/time-orm", async (req, res) => {
  const [rows] = await sequelize.query("SELECT NOW() AS now_time");
  res.json(rows[0]);
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});


