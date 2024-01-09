import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import mysql from "mysql2/promise";
import cookieParser from "cookie-parser";
import { AccessToken, RefreshToken } from "./Token";
import {
  allDocuments,
  authenticateToken,
  authenticateUser,
  AuthRequest,
  createDocument,
  createUser,
  deleteDocument,
  deleteInvite,
  getDocument,
  getId,
  getInvites,
  getUsernames,
  saveDocument,
  sendInvite,
  strongPassword,
} from "./utils";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 8000;
const TEN_MINUTES = 600000;
const ONE_DAY = 8.64e7;
const THIRTY_DAYS = 2.592e9;

// const path = require("path");
// const relativePath = "../client/build";
// const absolutePath = path.resolve(relativePath);
app.use(express.json());
app.use(cookieParser());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "myDB",
});

app.post("/api/signUp", async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body.data;
    const username = req.body.data.username.toLowerCase();
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
    const id = await getId(pool, username);
    const access = AccessToken.create(id);
    const refresh = RefreshToken.create(id);
    return res
      .cookie("accessToken", access, {
        maxAge: TEN_MINUTES,
        httpOnly: true,
      })
      .cookie("refreshToken", refresh, { maxAge: ONE_DAY, httpOnly: true })
      .status(200)
      .json({ message: "User created" });
  } catch (err) {
    console.error("User signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/signIn", async (req, res) => {
  try {
    const { username, password, remember } = req.body.data;
    const authenticated = await authenticateUser(username, password, pool);
    if (!authenticated) {
      return res.status(401).json({
        message: "Unauthorized: Invalid username and/or password",
      });
    }
    const refreshMaxAge = !remember ? ONE_DAY : THIRTY_DAYS;
    const id = await getId(pool, username);
    if (!id) {
      return res
        .status(404)
        .send({ message: "Bad request: user does not exist" });
    }
    const access = AccessToken.create(id);
    const refresh = RefreshToken.create(id);
    return res
      .cookie("accessToken", access, {
        maxAge: TEN_MINUTES,
        httpOnly: true,
      })
      .cookie("refreshToken", refresh, {
        maxAge: refreshMaxAge,
        httpOnly: true,
      })
      .status(200)
      .json({ message: "Access granted" });
  } catch (err) {
    console.error("Authorization error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get(
  "/api/authenticate",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      return res.status(200).json({ message: "Authorized" });
    } catch (err) {
      console.error("Authentication error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.get("/api/content", authenticateToken, (req: AuthRequest, res) => {
  try {
    if (req.userId === undefined) {
      return res.status(403).json("Unauthorized");
    }
    const docId = req.body;
    const doc = getDocument(pool, docId, req.userId);
    if (!doc) {
      return res.status(404).json({ message: "File not found" });
    }
    return res.status(200).json({ message: "ok", document: doc });
  } catch (err) {
    console.error("Error getting content:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// app.get("/", (req, res) => {
//   res.sendFile(`${absolutePath}/index.html`);
// });

app.post("/api/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    const verified = RefreshToken.verify(refreshToken);
    if (!refreshToken || !verified) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const access = AccessToken.create(verified.userId);
    return res
      .cookie("accessToken", access, {
        maxAge: TEN_MINUTES,
        httpOnly: true,
      })
      .status(200)
      .json({ message: "Authorized" });
  } catch (err) {
    console.error("Refresh token error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/logout", async (req, res) => {
  try {
    return res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .status(200)
      .json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/create", authenticateToken, async (req: AuthRequest, res) => {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "myDB",
  });
  try {
    if (req.userId === undefined) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const { docId } = req.body;
    if (!docId) {
      const id = await createDocument(connection, req.userId);
      connection.end();
      return res.status(201).json({ message: "created", docId: id });
    }
    const doc = await getDocument(connection, docId, req.userId);
    connection.end();
    if (doc.message === "Unauthorized") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    return res.status(200).json({ message: "exists", document: doc });
  } catch (err) {
    connection.end();
    console.error("Error creating document:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/save", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userId === undefined) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const { doc } = req.body;
    const { success, message } = await saveDocument(pool, doc);
    if (!success) {
      return res.status(403).json({ message: message });
    }
    return res.status(200).json({ message: message });
  } catch (err) {
    console.error("Error saving document:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// app.use(express.static(absolutePath));

app.get("/api/documents", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userId === undefined) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    let documents = await allDocuments(pool, req.userId);
    return res.status(200).send({ message: "Authorized", docs: documents });
  } catch (err) {
    console.error("Error accessing user documents:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.delete(
  "/api/documents",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const { docId } = req.body;
      const { success, message } = await deleteDocument(
        pool,
        docId,
        req.userId
      );
      if (!success) {
        return res.status(403).json({ message: message });
      }
      return res.status(200).json({ message: message });
    } catch (err) {
      console.error("Error deleting user document:", err);
      return res.status(500).json({ message: "Internal servor error" });
    }
  }
);

app.post("/api/invite", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userId === undefined) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const { docId, recipient } = req.body;
    const recipientId: number = await getId(pool, recipient);
    if (!recipientId) {
      return res.status(404).json({ message: "Recipient does not exist" });
    }
    const { success, message } = await sendInvite(
      pool,
      docId,
      req.userId,
      recipientId
    );
    if (!success) {
      return res.status(400).json({ message: message });
    }
    return res.status(200).json({ message: message });
  } catch (err) {
    console.error("User invite error:", err);
    return res.status(500).json({ message: "internal server error" });
  }
});

app.get("/api/invite", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userId === undefined) {
      return res.status(403).json({ message: "Authorization error" });
    }
    const { success, invites } = await getInvites(pool, req.userId);
    if (!success) {
      return res.status(404).json({ message: "No invites" });
    }
    return res
      .status(200)
      .json({ message: "Fetch successful", invites: invites });
  } catch (err) {
    console.error("Cannot get invite:", err);
    return res.status(500).json({ message: "internal server error" });
  }
});

app.delete("/api/invite", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userId === undefined) {
      return res.status(403).json({ message: "Authorization error" });
    }
    const { inviteId } = req.body;
    const { success } = await deleteInvite(pool, req.userId, inviteId);
    if (!success) {
      return res.status(404).json({ message: "Failed to delete invite" });
    }
    return res.status(200).json({ message: "Invite successfully deleted" });
  } catch (err) {
    console.error("Cannot delete invite:", err);
    return res.status(500).json({ message: "Internal servor error" });
  }
});

// app.post(
//   "/api/accept-invite",
//   authenticateToken,
//   async (req: AuthRequest, res) => {
//     try {
//       if (req.userId === undefined) {
//         return res.status(403).json({ message: "Authorization error" });
//       }
//       const { inviteId, docId } = req.body;
//       const { success } = await acceptInvite(pool, inviteId, docId);
//       if (!success) {
//         return res.status(404).json({ message: "Failed to delete invite" });
//       }
//       return res.status(200).json({ message: "Invite accepted" });
//     } catch (err) {
//       console.error("Cannot accept invite:", err);
//       return res.status(500).json({ message: "Internal servor error" });
//     }
//   }
// );

app.post(
  "/api/accept-invite",
  authenticateToken,
  async (req: AuthRequest, res) => {}
);
// const clients: any = {};

// wss.on("connection", (connection) => {
//   connection.on("error", console.error);

//   const userId = uuid();

//   clients[userId] = connection;

//   connection.on("message", (message, isBinary) => {
//     wss.clients.forEach((client) => {
//       if (client !== connection && client.readyState === WebSocket.OPEN) {
//         client.send(message, { binary: isBinary });
//       }
//     });
//   });
// });

server.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
