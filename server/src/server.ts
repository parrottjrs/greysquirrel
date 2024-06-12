import express from "express";
import https from "https";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";

import { PORT } from "./utils/consts";

import { userRouter } from "./Routes/User";
import { tokenRouter } from "./Routes/Tokens";
import { documentsRouter } from "./Routes/Documents";
import { invitesRouter } from "./Routes/Invites";

export const app = express();
const server = https.createServer(app);
const io = new Server(server);

// const path = require("path");
// const relativePath = "../client/build";
// const absolutePath = path.resolve(relativePath);

app.use(express.json());
app.use(cookieParser());
app.use("/api/user", userRouter);
app.use("/api/token", tokenRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/invites", invitesRouter);
// app.use(express.static(absolutePath));

io.on("connection", (socket) => {
  const { docId } = socket.handshake.query;
  console.log(`User joined room ${docId}`);
  socket.join(`${docId}`);
  socket.on("message", (evt) => {
    io.to(`${docId}`).emit("message", evt);
  });
  socket.on("disconnect", () => {
    console.log("someone left");
  });
});

server.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
