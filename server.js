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
app.use("/api/v1", require("./routes/moderation.routes"));
app.use("/api/v1/reports", require("./routes/reports.routes"));
app.use("/api/v1/reports", require("./routes/reportVote.routes"));
app.use("/api/v1/incidents", require("./routes/incidentRout"));
app.use("/api/v1/alerts", require("./routes/alerts.routes"));


app.get("/test", (req, res) => res.send("hello world"));

async function connectWithRetry() {
  let attempts = 10;

  while (attempts > 0) {
    try {
      await sequelize.authenticate();
      console.log("✅ Sequelize Connected");

      await mySqlPool.query("SELECT 1");
      console.log("✅ Raw MySQL Connected");

      app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
      });

      return;
    } catch (err) {
      attempts--;
      console.log(`⏳ Database not ready yet. Retrying... (${attempts} attempts left)`);
      console.error(err.message);

      if (attempts === 0) {
        console.error("❌ Could not connect to database after multiple attempts.");
        process.exit(1);
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

connectWithRetry();