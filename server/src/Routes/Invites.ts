import express from "express";
import { pool } from "../utils/consts";
import {
  AuthRequest,
  acceptInvite,
  authenticateToken,
  countInvites,
  deleteInviteByInviteId,
  getId,
  getInvitesReceived,
  getInvitesSent,
  sendInvite,
  verifyById,
} from "../utils/utils";

export const invitesRouter = express.Router();

invitesRouter.post(
  "/send",
  authenticateToken,
  async (req: AuthRequest, res) => {
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
  }
);

invitesRouter.get(
  "/count",
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

invitesRouter.get(
  "/pending/received",
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

invitesRouter.get(
  "/pending/sent",
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

invitesRouter.delete(
  "/delete",
  authenticateToken,
  async (req: AuthRequest, res) => {
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
  }
);

invitesRouter.post(
  "/accept",
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
