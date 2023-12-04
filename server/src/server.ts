import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import * as fs from "fs";
import { v4 as uuid } from "uuid";
import mysql from "mysql2/promise";
import cookieParser from "cookie-parser";
import { AccessToken, RefreshToken } from "./Token";
import {
  authenticateToken,
  authenticateUser,
  AuthRequest,
  createUser,
  getUsernames,
  strongPassword,
} from "./utils";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 8000;
const TEN_MINUTES = 600000;
const ONE_DAY = 8.64e7;

// const path = require("path");
// const relativePath = "../client/build";
// const absolutePath = path.resolve(relativePath);
app.use(express.json());
app.use(cookieParser());

app.put("/api/signUp", async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body.data;
    const username = req.body.data.username.toLowerCase();
    const pool = mysql.createPool({
      host: "localhost",
      user: "root",
      database: "myDB",
    });
    const usernames = await getUsernames(pool);
    if (usernames.includes(username)) {
      return res.status(400).json({
        message: "Bad request: User already exists",
      });
    }
    if (!strongPassword(password)) {
      return res.status(400).json({
        message: "Bad request: Password does not meet requirements",
      });
    }
    await createUser(pool, username, email, firstName, lastName, password);
    const access = AccessToken.create(username);
    const refresh = RefreshToken.create(username);
    return res
      .cookie("accessToken", access, {
        maxAge: TEN_MINUTES,
        httpOnly: true,
      })
      .cookie("refreshToken", refresh, { maxAge: ONE_DAY, httpOnly: true })
      .status(200)
      .json({ message: "User created" });
  } catch (err) {
    console.error("Refresh token error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/signIn", async (req, res) => {
  try {
    const { username, password } = req.body.data;
    const pool = mysql.createPool({
      host: "localhost",
      user: "root",
      database: "myDB",
    });
    const authenticated = await authenticateUser(username, password, pool);
    if (!authenticated) {
      return res.status(401).json({
        message: "Unauthorized: Invalid username and/or password",
      });
    }
    const access = AccessToken.create(username);
    const refresh = RefreshToken.create(username);
    return res
      .cookie("accessToken", access, {
        maxAge: TEN_MINUTES,
        httpOnly: true,
      })
      .cookie("refreshToken", refresh, { maxAge: ONE_DAY, httpOnly: true })
      .status(200)
      .json({ message: "Access granted" });
  } catch (err) {
    console.error("Authorization error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/documents", authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log(req.username);
    if (req.username === undefined) {
      return res
        .status(403)
        .json({ message: "Unauthorized", username: "Token bearer undefined" });
    }
    return res
      .status(200)
      .json({ message: "Authorized", username: req.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api", (_, res) => {
  try {
    const data = fs.readFileSync("./files/test.txt", "utf-8");
    return res.send({ data });
  } catch (err) {
    return res.status(404).json({ message: "File not found" });
  }
});

// app.get("/", (req, res) => {
//   res.sendFile(`${absolutePath}/index.html`);
// });
app.post("/api/refresh", async (req, res) => {
  const { refreshToken } = req.cookies;
  const { username } = req.body;

  try {
    const verified = RefreshToken.verify(refreshToken);
    if (!refreshToken || !verified) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const access = AccessToken.create(username);
    const refresh = RefreshToken.create(username);
    return res
      .cookie("accessToken", access, {
        maxAge: TEN_MINUTES,
        httpOnly: true,
      })
      .cookie("refreshToken", refresh, { maxAge: ONE_DAY, httpOnly: true })
      .status(200)
      .json({ message: "Authorized", username: username });
  } catch (err) {
    console.error("Refresh token error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/createfile", (req, res) => {
  try {
    fs.writeFileSync(`./files/test.txt`, req.body.text);
    return res.status(200).json({ message: "Created" });
  } catch (err) {
    console.error("Error creating file", err);
    return res.status(500).json({ message: "Internal server error" });
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

server.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
