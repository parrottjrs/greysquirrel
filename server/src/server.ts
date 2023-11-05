import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import * as fs from "fs";
import { v4 as uuid } from "uuid";
import mysql from "mysql2";

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

app.post("/api/signIn", (req, res) => {
  const username = req.body.data.username;
  const password = req.body.data.password;

  const sqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "myDB",
  });
  sqlConnection.query(
    // `SELECT * from users WHERE user_name = "${username}"`,
    `SELECT * from users WHERE user_name = "${username}"`,
    (err, results, fields) => {
      try {
        const user = JSON.parse(JSON.stringify(results));
        if (user[0].password !== password) {
          return console.log("Authentication unsuccessful");
        }
        res.send("authentication successful");
      } catch (e) {
        res.status(500).json("error caught");
      }
    }
  );
});

server.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
