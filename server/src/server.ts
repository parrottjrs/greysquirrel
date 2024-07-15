import express from "express";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
const ck = require("cookie");

import { PORT } from "./utils/consts";

import { userRouter } from "./Routes/User";
import { tokenRouter } from "./Routes/Tokens";
import { documentsRouter } from "./Routes/Documents";
import { invitesRouter } from "./Routes/Invites";
import cors from "cors";
import { checkEditingToken } from "./utils/userHelpers";
export const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// const path = require("path");
// const relativePath = "../client/build";
// const absolutePath = path.resolve(relativePath);
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/api/user", userRouter);
app.use("/api/token", tokenRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/invites", invitesRouter);
// app.use(express.static(absolutePath));

app.get("/api/health", (req, res) => {
  try {
    const uptime = process.uptime();
    if (uptime === 0) {
      return res.status(503).json({
        message: "Server is down",
        timeStamp: Date.now(),
      });
    }
    const healthcheck = {
      uptime: uptime,
      message: "OK",
      timeStamp: Date.now(),
    };
    return res.status(200).json({ healthcheck: healthcheck });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error running health check", error: err });
  }
});

io.on("connection", (socket) => {
  const { docId } = socket.handshake.query;
  let cookies = socket.handshake.headers.cookie;
  let { editingToken } = ck.parse(cookies);
  let verified = checkEditingToken(editingToken);
  if (!verified.userId || verified.docId !== docId) {
    socket.disconnect();
    return;
  }
  console.log(`User joined room ${docId}`);
  socket.join(`${docId}`);

  socket.on("message", (evt) => {
    let cookies = socket.handshake.headers.cookie;
    let { editingToken } = ck.parse(cookies);
    let verified = checkEditingToken(editingToken);
    if (!verified.userId || verified.docId !== docId) {
      socket.disconnect();
      return;
    }
    io.to(`${docId}`).emit("message", evt);
  });
  socket.on("disconnecting", () => {
    console.log("Socket disconnecting...");
  });
  socket.on("disconnect", () => {
    console.log("someone left");
  });
});

server.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
