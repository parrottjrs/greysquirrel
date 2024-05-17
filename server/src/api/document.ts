import { app, pool } from "../utils/consts";
import {
  AuthRequest,
  allDocuments,
  authenticateToken,
  createDocument,
  deleteDocument,
  getDocument,
  saveDocument,
} from "../utils/utils";

app.post(
  "/api/create-document",
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

app.put(
  "/api/save-document",
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

app.get(
  "/api/get-documents",
  authenticateToken,
  async (req: AuthRequest, res) => {
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
  }
);

app.delete(
  "/api/delete-documents",
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
