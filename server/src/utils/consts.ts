import mysql from "mysql2/promise";

export const PORT = process.env.PORT || 8000;

//Token expiration times
export const TEN_MINUTES = 600000;
export const ONE_DAY = 8.64e7;
export const THIRTY_DAYS = 2.592e9;

//db access variables
require("dotenv").config();
const DB_ENDPOINT = process.env.DB_ENDPOINT;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

export const pool = mysql.createPool({
  host: DB_ENDPOINT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
});
