import express, { Response } from "express";

import http from "http";
// import WebSocket, { WebSocketServer } from "ws";\
import { Server } from "socket.io";
import mysql from "mysql2/promise";
import cookieParser from "cookie-parser";
import { AccessToken, RefreshToken } from "./Token";
import {
  acceptInvite,
  allDocuments,
  authenticateToken,
  authenticateUser,
  AuthRequest,
  changePassword,
  countInvites,
  createDocument,
  createUser,
  createVerificationToken,
  deleteDocument,
  deleteInviteByInviteId,
  forgotPasswordResponse,
  getAllSharedDocs,
  getAuthorizedUsers,
  getDocument,
  getId,
  getInvitesReceived,
  getInvitesSent,
  getUserInfo,
  getUsernames,
  revokeSharedAccess,
  saveDocument,
  searchForEmail,
  sendInvite,
  strongPassword,
  updateUserInfo,
  usernameExists,
  verifyEmailToken,
  verifyForgotPassword,
} from "./utils/utils";
import {
  emailVerificationInfo,
  sendEmailVerification,
  sendForgotPasswordVerification,
} from "./utils/mail";
import { time } from "console";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 8000;
const TEN_MINUTES = 600000;
const ONE_DAY = 8.64e7;
const THIRTY_DAYS = 2.592e9;

// const path = require("path");
// const relativePath = "../client/build";
// const absolutePath = path.resolve(relativePath);

app.use(express.json());
app.use(cookieParser());
// app.use(express.static(absolutePath));

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
        success: false,
        message: "User already exists",
      });
    }
    if (!strongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password does not meet site requirements. Please try again.",
      });
    }
    const { success, message, emailToken } = await createUser(
      pool,
      username,
      email,
      firstName,
      lastName,
      password
    );
    if (!success) {
      return res.status(400).json({ success: success, message: message });
    }
    await sendEmailVerification(username, email, emailToken);
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
      .json({ success: success, message: message });
  } catch (err) {
    console.error("User signup error:", err);
    return res.status(500).json({ message: "User signup error" });
  }
});

app.put(
  "/api/verify-user",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
        return res
          .status(200)
          .json({ success: false, message: "Authorization error" });
      }
      const { emailToken } = req.body;
      const { success, message } = await verifyEmailToken(
        pool,
        req.userId,
        emailToken
      );
      const response = { success: success, message: message };
      if (!success) {
        return res.status(400).json(response);
      }
      return res.status(200).json(response);
    } catch (err) {
      console.error("Verification error:", err);
      res.status(500).json({ message: "User verification failed" });
    }
  }
);

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
    return res.status(500).json({ message: "Error when signing in" });
  }
});

app.get(
  "/api/get-user-info",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
        return res
          .status(200)
          .json({ success: false, message: "Authorization error" });
      }
      const { success, message, userInfo } = await getUserInfo(
        pool,
        req.userId
      );
      if (!success) {
        return res.status(400).json({ success: success, message: message });
      }
      return res
        .status(200)
        .json({ success: success, message: message, userInfo: userInfo });
    } catch (err) {
      console.error("Error retreiving user info:", err);
      return res.status(500).json({ message: "Cannot retreive user info" });
    }
  }
);

app.put(
  "/api/update-user-info",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
        return res
          .status(200)
          .json({ success: false, message: "Authorization error" });
      }
      const { firstName, lastName, username, email, password } = req.body.data;
      const userNameInUse = await usernameExists(pool, req.userId, username);
      if (userNameInUse) {
        return res.status(200).json({
          success: false,
          message: "Username in use",
        });
      }
      const { success, message } = await updateUserInfo(
        pool,
        firstName,
        lastName,
        username,
        email,
        password,
        req.userId
      );
      if (!success) {
        return res.status(400).json({ success: success, message: message });
      }
      return res.status(200).json({ success: success, message: message });
    } catch (err) {
      console.error("Error updating user info:", err);
      res.status(500).json({ message: "Cannot update user info" });
    }
  }
);

app.post(
  "/api/resend-verification-email",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
        return res
          .status(200)
          .json({ success: false, message: "Authorization Error" });
      }
      const { username, email, emailToken } = await emailVerificationInfo(
        pool,
        req.userId
      );
      const { success, message } = await sendEmailVerification(
        username,
        email,
        emailToken
      );
      return res.status(200).json({ success: success, message: message });
    } catch (err) {
      console.error("Error sending verification email:", err);
      return res
        .status(500)
        .json({ success: false, message: "Cannot resend email verification" });
    }
  }
);

app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const searchResult = await searchForEmail(pool, email);
    if (!searchResult.success) {
      return forgotPasswordResponse(res);
    }
    const userId = searchResult.userId;
    if (!userId) {
      return forgotPasswordResponse(res);
    }
    const createTokenResponse = await createVerificationToken(
      pool,
      email,
      userId
    );
    if (!createTokenResponse.success) {
      return forgotPasswordResponse(res);
    }
    await sendForgotPasswordVerification(
      email,
      createTokenResponse.verificationToken
    );
    return forgotPasswordResponse(res);
  } catch (err) {
    console.error("Error sending email:", err);
    return res.status(500).json({
      success: false,
      message: "Cannot initialize forgot-password process",
    });
  }
});

app.post("/api/verify-forgot-password", async (req, res) => {
  try {
    const verificationToken = req.body.verificationToken;

    const { success, message, userId } = await verifyForgotPassword(
      pool,
      verificationToken
    );
    if (!success) {
      return res.status(400).json({ success: success, message: message });
    }
    const access = AccessToken.create(userId);
    const refresh = RefreshToken.create(userId);
    return res
      .cookie("accessToken", access, {
        maxAge: TEN_MINUTES,
        httpOnly: true,
      })
      .cookie("refreshToken", refresh, {
        maxAge: ONE_DAY,
        httpOnly: true,
      })
      .status(200)
      .json({ success: success, message: message });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Cannot get verification token" });
  }
});

app.put(
  "/api/change-password",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res
          .status(401)
          .json({ success: false, message: "Authorization error" });
      }
      const newPassword = req.body.password;

      const { success, message } = await changePassword(
        pool,
        newPassword,
        req.userId
      );
      const status = success ? 200 : 400;
      return res.status(status).json({ success: success, message: message });
    } catch (err) {
      console.error("Error changing password:", err);
      return res.status(500).json({ message: "internal server error" });
    }
  }
);

app.get(
  "/api/authenticate",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
        return res
          .status(200)
          .json({ success: false, message: "Authorization error" });
      }
      return res.status(200).json({
        success: true,
        message: "Authorized",
        userId: req.userId,
      });
    } catch (err) {
      console.error("Authentication error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Authentication failed" });
    }
  }
);

app.post("/api/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    const verified = RefreshToken.verify(refreshToken);
    if (!refreshToken || !verified) {
      return res
        .status(200)
        .json({ success: false, message: "Authorization error" });
    }
    const access = AccessToken.create(verified.userId);
    return res
      .cookie("accessToken", access, {
        maxAge: TEN_MINUTES,
        httpOnly: true,
      })
      .status(200)
      .json({ success: true, message: "Authorized" });
  } catch (err) {
    console.error("Refresh token error", err);
    return res
      .status(500)
      .json({ success: false, message: "Token refresh failed" });
  }
});

app.get("/api/logout", async (req, res) => {
  try {
    return res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .status(200)
      .json({ success: true, message: "User logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error loggin out" });
  }
});

app.post("/api/create", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userId === undefined) {
      return res
        .status(403)
        .json({ success: false, message: "Authorization error" });
    }

    const { docId } = req.body;
    if (!docId) {
      const newDocument = await createDocument(pool, req.userId);
      if (!newDocument.success) {
        return res
          .status(400)
          .json({ success: newDocument.success, message: newDocument.message });
      }
      return res.status(201).json({
        success: newDocument.success,
        message: newDocument.message,
        docId: newDocument.docId,
      });
    }
    const { success, message, doc } = await getDocument(
      pool,
      docId,
      req.userId
    );
    if (!success) {
      return res.status(403).json({ success: success, message: message });
    }
    return res
      .status(200)
      .json({ success: success, message: message, document: doc });
  } catch (err) {
    console.error("Error creating document:", err);
    return res
      .status(500)
      .json({ success: false, message: "Unable to create/retreive document" });
  }
});

app.put("/api/save", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userId === undefined) {
      return res
        .status(401)
        .json({ success: false, message: "Authorization error" });
    }
    const { doc } = req.body;
    const { success, message } = await saveDocument(pool, doc, req.userId);
    if (!success) {
      return res.status(403).json({ success: success, message: message });
    }
    return res.status(200).json({ success: success, message: message });
  } catch (err) {
    console.error("Error saving document:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error saving document" });
  }
});

app.get("/api/documents", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userId === undefined) {
      return res
        .status(403)
        .json({ success: false, message: "Authorization error" });
    }
    const { success, message, docs } = await allDocuments(pool, req.userId);
    if (!success) {
      return res.status(200).json({ success: success, message: message });
    }
    return res.status(200).send({
      success: success,
      message: message,
      docs: docs,
    });
  } catch (err) {
    console.error("Error accessing user documents:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error accessing user documents" });
  }
});

app.delete(
  "/api/documents",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
        return res
          .status(403)
          .json({ success: false, message: "Authorization error" });
      }
      const { docId } = req.body;
      const { success, message } = await deleteDocument(
        pool,
        docId,
        req.userId
      );
      if (!success) {
        return res.status(403).json({ success: success, message: message });
      }
      return res.status(200).json({ success: success, message: message });
    } catch (err) {
      console.error("Error deleting user document:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error deleting document" });
    }
  }
);

app.post("/api/invite", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userId === undefined) {
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
        return res
          .status(200)
          .json({
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
    console.log(evt);
    io.to(`${docId}`).emit("message", evt);
  });
  socket.on("disconnect", () => {
    console.log("someone left");
  });
});

server.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
