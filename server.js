require("dotenv").config();

const express = require("express");
const sequelize = require("./config/sequelize");
const mySqlPool = require("./config/db");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/v1/checkpoints", require("./routes/checkPointRout"));
app.use("/api/v1/users", require("./routes/userRout"));
app.use("/api/v1/routes", require("./routes/routeEstimationRoute"));

// moderation BEFORE reports
app.use("/api/v1", require("./routes/moderation.routes"));

app.use("/api/v1/reports", require("./routes/reports.routes"));
app.use("/api/v1/reports", require("./routes/reportVote.routes"));
app.use("/api/v1/incidents", require("./routes/incidentRout"));

app.get("/test", (req, res) => res.send("hello world"));

sequelize
  .authenticate()
  .then(() => console.log("✅ Sequelize Connected"))
  .catch((err) => console.error("❌ Sequelize Error:", err));

mySqlPool
  .query("SELECT 1")
  .then(() => console.log("✅ Raw MySQL Connected"))
  .catch((err) => console.error("❌ Raw MySQL Error:", err));

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});