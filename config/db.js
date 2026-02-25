const mysql = require("mysql2/promise");

const mySqlPool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123123",
  database: process.env.DB_NAME || "myDB",
  port: Number(process.env.DB_PORT) || 3306,
});

module.exports = mySqlPool;