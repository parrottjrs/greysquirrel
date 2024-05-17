import express from "express";
import { pool } from "../utils/consts";
import { emailVerificationInfo, sendEmailVerification } from "../utils/mail";
import { AuthRequest, authenticateToken } from "../utils/utils";

//INCLUDES:
//Enpoints that handle email related requests.

export const emailRouter = express.Router();

emailRouter.post(
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
