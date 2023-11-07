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
  const data = req.body.data;
  const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    database: "myDB",
  });
  pool.query(
    `SELECT * from users WHERE user_name = "${data.username}"`,
    (err, results, fields) => {
      try {
        const user = JSON.parse(JSON.stringify(results));
        if (user[0].password !== data.password) {
          res.send("unsuccessful");
        }
        res.send("successful");
      } catch (e) {
        res.status(500).json("error caught");
      }
    }
  );
});

app.post("/api/signUp", (req, res) => {
  try {
    const { username, email, firstName, lastName, password } = req.body.data;
    const sqlPool = mysql.createPool({
      host: "localhost",
      user: "root",
      database: "myDB",
    });

    const query1 = `SELECT user_name from users`;
    const query2 = `INSERT INTO users (
      user_name, email, first_name, last_name, password
    ) VALUES (
      "${username}", "${email}", "${firstName}", "${lastName}", "${password}" 
    )`;

    sqlPool.query(query1, (err, results, fields) => {
      try {
        const queryResults = JSON.parse(JSON.stringify(results));
        const usernames = queryResults.map((username: object) => {
          return Object.values(username).toString();
        });
        if (usernames.includes(username)) {
          res.send("unsuccessful");
          return;
        }
        sqlPool.query(query2, (err, result, field) => {
          if (err) {
            throw err;
          }
          res.send("success");
        });
        // res.send("doesn't exist");
        return;
      } catch (err) {
        res.status(500).json("error caught");
      }
    });
  } catch (err) {
    res.status(500).json("error caught");
  }
});

server.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
