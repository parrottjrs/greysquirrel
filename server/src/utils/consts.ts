import mysql from "mysql2/promise";

export const PORT = process.env.PORT || 8000;
export const EMAIL = process.env.EMAIL;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const CLIENT_URL = process.env.CLIENT_URL;

//Token expiration times
export const TEN_MINUTES = 600000;
export const ONE_DAY = 8.64e7;
export const THIRTY_DAYS = 2.592e9;

export const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "myDB",
});
