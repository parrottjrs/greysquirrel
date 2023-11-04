import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import * as fs from "fs";
import { v4 as uuid } from "uuid";
import { Key } from "readline";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 8000;

// const path = require("path");
// const relativePath = "../client/build";
// const absolutePath = path.resolve(relativePath);
app.use(express.json());
app.use(express.urlencoded());

app.get("/api", (req, res) => {
  try {
    const data = fs.readFileSync("./files/test.txt", "utf-8");
    res.send({ data });
  } catch (e) {
    res.status(404).json("File not found");
  }
});

// app.get("/", (req, res) => {
//   res.sendFile(`${absolutePath}/index.html`);
// });

app.post("/api/createfile", (req, res) => {
  try {
    fs.writeFileSync(`./files/test.txt`, req.body.text);
    res.status(200).json({ message: "ok" });
  } catch (e) {
    res.status(500).json("Error caught");
  }
});
// app.use(express.static(absolutePath));

const clients: any = {};

wss.on("connection", (connection) => {
  connection.on("error", console.error);

  const userId = uuid();
  console.log("Recieved a new connection.");

  clients[userId] = connection;
  console.log(`${userId} connected.`);

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
