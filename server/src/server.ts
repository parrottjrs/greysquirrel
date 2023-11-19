import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import * as fs from "fs";
import { v4 as uuid } from "uuid";
import mysql from "mysql2/promise";
import { randomBytes, pbkdf2Sync } from "crypto";
import { sign, verify, decode } from "jsonwebtoken";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 8000;
const ITERATIONS = 10000;
const KEYLEN = 64;
const TEN_MINUTES = 600000;
const ONE_DAY = 8.64e7;
const PUBLIC_ACCESS_KEY = fs.readFileSync("../public-access.pem", "utf8");
const PUBLIC_REFRESH_KEY = fs.readFileSync("../public-refresh.pem", "utf8");

const accessToken = async (username: string) => {
  const accessKey = fs.readFileSync("../private-access.pem", "utf8");
  const expiration = Math.floor(Date.now()) + TEN_MINUTES;
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const payload = {
    username: username,
    iat: Date.now(),
    exp: expiration,
  };
  const accessToken = sign(payload, accessKey, { header });
  return accessToken;
};

const refreshToken = async (username: string) => {
  const refreshKey = fs.readFileSync("../private-refresh.pem", "utf8");

  const expiration = Math.floor(Date.now()) + ONE_DAY;
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const payload = {
    username: username,
    iat: Date.now(),
    exp: expiration,
  };
  const refreshToken = sign(payload, refreshKey, { header });
  return refreshToken;
};

const isExpired = (token: any) => {
  const decoded: any = decode(token);
  const expiration = decoded.exp;
  return expiration < Math.floor(Date.now());
};
// const path = require("path");
// const relativePath = "../client/build";
// const absolutePath = path.resolve(relativePath);
app.use(express.json());
app.use(express.urlencoded());

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

const getPassword = async (pool: any, username: string) => {
  const query = `SELECT password, salt from users WHERE user_name = "${username}"`;
  const [result, _] = await pool.query(query);
  const user = JSON.parse(JSON.stringify(result));
  return { pass: user[0].password, salt: user[0].salt };
};

const authenticate = (password1: string, password2: string) => {
  return password1 === password2;
};

app.post("/api/signIn", async (req, res) => {
  try {
    const { username, password } = req.body.data;
    const pool = mysql.createPool({
      host: "localhost",
      user: "root",
      database: "myDB",
    });
    const { pass, salt } = await getPassword(pool, username);
    const hash = pbkdf2Sync(
      password,
      salt,
      ITERATIONS,
      KEYLEN,
      "sha512"
    ).toString("base64");
    const authenticated = authenticate(hash, pass);

    if (!authenticated) {
      return res.status(400).json({ message: "unsuccessful" });
    }
    return res.status(202).json({ message: "successful" });
  } catch (err) {
    return res.status(500).json({ message: "error caught" });
  }
});

const checkPassword = (password: string) => {
  var restrictions = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  return restrictions.test(password);
};

const getUsernames = async (pool: any) => {
  const query = `SELECT user_name from users`;
  const [result, _] = await pool.query(query);
  const usernames = JSON.parse(JSON.stringify(result));

  return usernames.map((username: object) => {
    return Object.values(username).toString();
  });
};

const createUser = async (
  pool: any,
  username: string,
  email: string,
  firstName: string,
  lastName: string,
  password: string
) => {
  const salt = randomBytes(64).toString("base64");
  const hash = pbkdf2Sync(
    password,
    salt,
    ITERATIONS,
    KEYLEN,
    "sha512"
  ).toString("base64");
  const query = `INSERT INTO users (
  user_name, email, first_name, last_name, password, salt
) VALUES (
  "${username}", "${email}", "${firstName}", "${lastName}", "${hash}", "${salt}" 
)`;
  await pool.query(query);
};

app.put("/api/signUp", async (req, res) => {
  try {
    const { username, email, firstName, lastName, password } = req.body.data;
    const pool = mysql.createPool({
      host: "localhost",
      user: "root",
      database: "myDB",
    });
    const usernames = await getUsernames(pool);
    if (usernames.includes(username) || !checkPassword(password)) {
      return res.status(400).json({ message: "unsuccessful" });
    }
    await createUser(pool, username, email, firstName, lastName, password);
    const access = await accessToken(username);
    const refresh = await refreshToken(username);
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
