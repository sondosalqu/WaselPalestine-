// config/config.js
require("dotenv").config();

const username = process.env.DB_USER || "root";
const password = process.env.DB_PASSWORD || "123123";
const database = process.env.DB_NAME || "myDB";
const host = process.env.DB_HOST || "127.0.0.1";
const port = Number(process.env.DB_PORT) || 3306;

module.exports = {
  development: {
    username,
    password,
    database,
    host,
    port,
    dialect: process.env.DIALECT || "mysql",
    logging: false,
  },
  production: {
    username,
    password,
    database,
    host,
    port,
    dialect: process.env.DIALECT || "mysql",
    logging: false,
  },
};