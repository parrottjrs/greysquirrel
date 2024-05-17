import { documentRouter } from "./Routes/Document";

import express, { Response } from "express";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import {
  acceptInvite,
  authenticateToken,
  AuthRequest,
  countInvites,
  deleteInviteByInviteId,
  getAllSharedDocs,
  getAuthorizedUsers,
  getId,
  getInvitesReceived,
  getInvitesSent,
  revokeSharedAccess,
  sendInvite,
  verifyById,
} from "./utils/utils";

import { PORT, app, pool } from "./utils/consts";
import { accountRouter } from "./Routes/Account";
import { authRouter } from "./Routes/Auth";
import { emailRouter } from "./Routes/Email";

const server = http.createServer(app);
const io = new Server(server);

// const path = require("path");
// const relativePath = "../client/build";
// const absolutePath = path.resolve(relativePath);

app.use(express.json());
app.use(cookieParser());
app.use("/api", accountRouter, authRouter, documentRouter, emailRouter);

// app.use(express.static(absolutePath));

// app.post("/api/signIn", async (req, res) => {
//   try {
//     console.log(req.body);
//     const { username, password, remember } = req.body.data;
//     const authenticated = await authenticateUser(username, password, pool);
//     if (!authenticated) {
//       return res.status(401).json({
//         message: "Unauthorized: Invalid username and/or password",
//       });
//     }
//     const refreshMaxAge = !remember ? ONE_DAY : THIRTY_DAYS;
//     const id = await getId(pool, username);
//     if (!id) {
//       return res
//         .status(404)
//         .send({ message: "Bad request: user does not exist" });
//     }
//     const access = AccessToken.create(id);
//     const refresh = RefreshToken.create(id);
//     return res
//       .cookie("accessToken", access, {
//         maxAge: TEN_MINUTES,
//         httpOnly: true,
//       })
//       .cookie("refreshToken", refresh, {
//         maxAge: refreshMaxAge,
//         httpOnly: true,
//       })
//       .status(200)
//       .json({ message: "Access granted" });
//   } catch (err) {
//     console.error("Authorization error:", err);
//     return res.status(500).json({ message: "Error when signing in" });
//   }
// });

app.post("/api/invite", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userId === undefined) {
      return res.status(403).json({ message: "Authorization error" });
    }
    const isVerified = await verifyById(pool, req.userId);
    if (!isVerified) {
      return res.status(403).json({ message: "Authorization error" });
    }
    const { docId, recipient } = req.body;
    const recipientId: number = await getId(pool, recipient);
    if (!recipientId) {
      return res
        .status(200)
        .json({ success: false, message: "Recipient does not exist" });
    }
    if (req.userId === recipientId) {
      return res.status(200).json({
        success: false,
        message: "User already has access",
      });
    }
    const { success, message } = await sendInvite(
      pool,
      docId,
      req.userId,
      recipientId
    );
    if (!success) {
      return res.status(200).json({ success: success, message: message });
    }
    return res.status(200).json({ success: success, message: message });
  } catch (err) {
    console.error("User invite error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error sending invite" });
  }
});

app.get(
  "/api/count-invites",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
        return res
          .status(403)
          .json({ success: false, message: "Authorization error" });
      }
      const { success } = await countInvites(pool, req.userId);
      return res.status(200).json({ success: success });
    } catch (err) {
      console.error("Cannot count invites:", err);
      return res
        .status(500)
        .json({ success: false, message: "error counting invites" });
    }
  }
);

app.get(
  "/api/invites-received",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
        return res
          .status(403)
          .json({ success: false, message: "Authorization error" });
      }
      const { success, message, invites } = await getInvitesReceived(
        pool,
        req.userId
      );
      if (!success) {
        return res.status(200).json({ success: success, message: message });
      }
      return res
        .status(200)
        .json({ success: success, message: message, invites: invites });
    } catch (err) {
      console.error("Cannot get invite:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error getting invite" });
    }
  }
);

app.get(
  "/api/invites-sent",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
        return res
          .status(403)
          .json({ success: false, message: "Authorization error" });
      }
      const { success, message, invites } = await getInvitesSent(
        pool,
        req.userId
      );
      if (!success) {
        return res.status(200).json({ success: success, message: message });
      }
      return res
        .status(200)
        .json({ success: success, message: message, invites: invites });
    } catch (err) {
      console.error("Cannot get invite:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error getting invite" });
    }
  }
);

app.delete("/api/invite", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userId === undefined) {
      return res
        .status(403)
        .json({ success: false, message: "Authorization error" });
    }
    const { inviteId } = req.body;
    const { success, message } = await deleteInviteByInviteId(
      pool,
      req.userId,
      inviteId
    );
    if (!success) {
      return res.status(200).json({ success: success, message: message });
    }
    return res.status(200).json({ succees: success, message: message });
  } catch (err) {
    console.error("Cannot delete invite:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting invite" });
  }
});

app.post(
  "/api/accept-invite",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
        return res
          .status(403)
          .json({ success: false, message: "Authorization error" });
      }
      const { inviteId, docId, senderId, recipientId } = req.body;
      if (req.userId !== recipientId) {
        return res
          .status(403)
          .json({ success: false, message: "Authorization error" });
      }
      const { success, message } = await acceptInvite(
        pool,
        inviteId,
        docId,
        senderId,
        recipientId
      );
      if (!success) {
        switch (message) {
          case "Authorization error":
            return res.status(403).json({ success: success, message: message });
          case "Invite no longer exists":
            return res.status(404).json({ success: success, message: message });
          default:
            console.error("Cannot accept invite");
            return res
              .status(500)
              .json({ success: false, message: "Error accepting invite" });
        }
      }
      deleteInviteByInviteId(pool, recipientId, inviteId);
      return res.status(200).json({ success: success, message: message });
    } catch (err) {
      console.error("Cannot accept invite", err);
      return res
        .status(500)
        .json({ success: false, message: "Error accepting invite" });
    }
  }
);

app.get(
  "/api/shared-docs",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
        return res
          .status(403)
          .json({ success: false, message: "Authorization error" });
      }
      const { success, message, sharedDocs } = await getAllSharedDocs(
        pool,
        req.userId
      );
      if (!success) {
        return res.status(200).json({ success: success, message: message });
      }
      return res
        .status(200)
        .json({ success: success, message: message, sharedDocs: sharedDocs });
    } catch (err) {
      console.error("error retrieving shared documents", err);
      return res
        .status(500)
        .json({ success: false, message: "Error retrieving shared documents" });
    }
  }
);

app.delete(
  "/api/shared-docs",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
        return res
          .status(403)
          .json({ success: false, message: "Authorization error" });
      }
      let userIdToRevoke;
      let documentOwner;
      const { docId, ownerId, authorizedUserName } = req.body;

      authorizedUserName
        ? (userIdToRevoke = await getId(pool, authorizedUserName))
        : (userIdToRevoke = req.userId);

      ownerId ? (documentOwner = ownerId) : (documentOwner = req.userId);

      if (req.userId !== documentOwner && req.userId !== userIdToRevoke) {
        return res
          .status(403)
          .json({ success: "false", message: "Authorization error" });
      }
      const { success, message } = await revokeSharedAccess(
        pool,
        docId,
        documentOwner,
        userIdToRevoke
      );
      if (!success) {
        return res.status(404).json({ success: success, message: message });
      }
      return res.status(200).json({ success: success, message: message });
    } catch (err) {
      console.error("Cannot remove access to shared-document:", err);
      return res.status(500).json({
        success: false,
        message: "Error removing access to shared-document",
      });
    }
  }
);

app.get(
  "/api/authorized-users",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      if (req.userId === undefined) {
        return res
          .status(403)
          .json({ success: false, message: "Authorization error" });
      }
      if (typeof req.query.docId === "string") {
        const docId = req.query.docId;
        const { success, message, authorizedUsers } = await getAuthorizedUsers(
          pool,
          req.userId,
          docId
        );
        if (!success) {
          return res.status(400).json({ success: success, message: message });
        }
        return res.status(200).json({
          success: success,
          message: message,
          authorizedUsers: authorizedUsers,
        });
      }
    } catch (err) {
      console.error("Error retreiving authorized users:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error retreiving authorized users" });
    }
  }
);

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
