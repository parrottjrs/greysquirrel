import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import * as fs from "fs";
import { v4 as uuid } from "uuid";
import mysql from "mysql2/promise";
import { sign, verify, decode } from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { AccessToken, RefreshToken } from "./Token";
import {
  authenticate,
  createUser,
  getPassword,
  getUsernames,
  strongPassword,
} from "./utils";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 8000;
const ITERATIONS = 10000;
const KEYLEN = 64;
const TEN_MINUTES = 600000;
const ONE_DAY = 8.64e7;

// const path = require("path");
// const relativePath = "../client/build";
// const absolutePath = path.resolve(relativePath);
app.use(express.json());
app.use(cookieParser());

app.get("/api", (req, res) => {
  try {
    const data = fs.readFileSync("./files/test.txt", "utf-8");
    return res.send({ data });
  } catch (e) {
    return res.status(404).json({ message: "File not found" });
  }
});

// app.get("/", (req, res) => {
//   res.sendFile(`${absolutePath}/index.html`);
// });

app.post("/api/createfile", (req, res) => {
  try {
    fs.writeFileSync(`./files/test.txt`, req.body.text);
    return res.status(200).json({ message: "ok" });
  } catch (e) {
    return res.status(500).json({ message: "Error caught" });
  }
});
// app.use(express.static(absolutePath));

const clients: any = {};

wss.on("connection", (connection) => {
  connection.on("error", console.error);

  const userId = uuid();

  clients[userId] = connection;

  connection.on("message", (message, isBinary) => {
    wss.clients.forEach((client) => {
      if (client !== connection && client.readyState === WebSocket.OPEN) {
        client.send(message, { binary: isBinary });
      }
    });
  });
});

app.post("/api/signIn", async (req, res) => {
  try {
    const { username, password } = req.body.data;
    const { accessToken, refreshToken } = req.cookies;
    const pool = mysql.createPool({
      host: "localhost",
      user: "root",
      database: "myDB",
    });
    const token = decode(refreshToken);
    const authenticated = await authenticate(pool, username, password);
    if (!authenticated) {
      return res.status(400).json({ message: "unsuccessful" });
    }
    return res.status(202).json({ message: "successful" });
  } catch (err) {
    return res.status(500).json({ message: "error caught" });
  }
});

app.put("/api/signUp", async (req, res) => {
  try {
    const { username, email, firstName, lastName, password } = req.body.data;
    const pool = mysql.createPool({
      host: "localhost",
      user: "root",
      database: "myDB",
    });
    const usernames = await getUsernames(pool);
    if (usernames.includes(username) || !strongPassword(password)) {
      return res.status(400).json({ message: "unsuccessful" });
    }
    await createUser(pool, username, email, firstName, lastName, password);
    const access = AccessToken.create(username);
    const refresh = RefreshToken.create(username);
    res.cookie("accessToken", access, {
      maxAge: TEN_MINUTES,
      httpOnly: true,
    });
    res.cookie("refreshToken", refresh, { maxAge: ONE_DAY, httpOnly: true });
    return res.status(201).json({ message: "success" });
  } catch (err) {
    return res.status(500).json("error caught");
  }
});

server.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
