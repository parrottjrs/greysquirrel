import express, { Response } from "express";
import { pool } from "../utils/consts";
import {
  AuthRequest,
  allDocuments,
  authenticateToken,
  createDocument,
  deleteDocument,
  getAllSharedDocs,
  getAuthorizedUsers,
  getDocument,
  getId,
  revokeSharedAccess,
  saveDocument,
} from "../utils/utils";

export const documentsRouter = express.Router();

documentsRouter.post(
  "/create",
  authenticateToken,
  async (req: AuthRequest, res) => {
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
          return res.status(400).json({
            success: newDocument.success,
            message: newDocument.message,
          });
        }
        return res.status(201).json({
          success: newDocument.success,
          message: newDocument.message,
          docId: newDocument.docId,
        });
      }
      const { success, message, doc, userOwnsDoc } = await getDocument(
        pool,
        docId,
        req.userId
      );
      if (!success) {
        return res.status(403).json({ success: success, message: message });
      }
      return res.status(200).json({
        success: success,
        message: message,
        document: doc,
        userOwnsDoc,
      });
    } catch (err) {
      console.error("Error creating document:", err);
      return res.status(500).json({
        success: false,
        message: "Unable to create/retreive document",
      });
    }
  }
);

documentsRouter.put(
  "/save",
  authenticateToken,
  async (req: AuthRequest, res) => {
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
  }
);

documentsRouter.get("/", authenticateToken, async (req: AuthRequest, res) => {
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

documentsRouter.delete(
  "/delete",
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

documentsRouter.get(
  "/shared",
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

documentsRouter.delete(
  "/shared/revoke",
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

documentsRouter.get(
  "/shared/users",
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
