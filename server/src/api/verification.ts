import { app, pool } from "../utils/consts";
import {
  AuthRequest,
  authenticateToken,
  checkPassword,
  verifyById,
  verifyEmailToken,
} from "../utils/utils";

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

app.post(
  "/api/verify-acct-mgmt",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
        return res
          .status(400)
          .json({ success: false, message: "Authorization error" });
      }
      const password = req.body.password;
      const { success, message } = await checkPassword(
        req.userId,
        password,
        pool
      );
      const statusCode = success ? 200 : 403;
      return res
        .status(statusCode)
        .json({ success: success, message: message });
    } catch (err) {
      console.error("error verifying user:", err);
      return res
        .status(500)
        .json({ message: "Cannot verify user. Try again later." });
    }
  }
);

app.get(
  "/api/check-verification-status",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
        return res
          .status(200)
          .json({ success: false, message: "Authorization error" });
      }
      const isVerified = await verifyById(pool, req.userId);
      const statusCode = isVerified ? 200 : 403;
      return res.status(statusCode).json({ success: isVerified });
    } catch (err) {
      console.error("Error fetching verification status:", err);
      return res
        .status(500)
        .json({ message: "Error fetching verification status" });
    }
  }
);
