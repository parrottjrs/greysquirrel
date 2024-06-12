import express from "express";
import { AccessToken, RefreshToken } from "../utils/Token";
import { ONE_DAY, TEN_MINUTES, THIRTY_DAYS, pool } from "../utils/consts";
import {
  sendEmailVerification,
  sendForgotPasswordVerification,
} from "../utils/mail";
import {
  AuthRequest,
  authenticateToken,
  authenticateUser,
  createUser,
  getId,
  updateUserInfo,
  usernameExists,
  getUserInfo,
  changePassword,
  verifyForgotPassword,
  forgotPasswordResponse,
  createVerificationToken,
  searchForEmail,
  verifyEmailToken,
  checkPassword,
  verifyById,
  createEmailToken,
  fetchEmailAndUsername,
} from "../utils/userHelpers";

export const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body.data;
    const username = req.body.data.username.toLowerCase();
    if (!username || !email || !firstName || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required data",
      });
    }

    const { success, message } = await createUser(
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
    const id = await getId(pool, username);
    const { emailToken } = await createEmailToken(pool, id, email);
    if (emailToken) {
      await sendEmailVerification(username, email, emailToken);
    }
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

userRouter.post("/login", async (req, res) => {
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

userRouter.post("/logout", async (req, res) => {
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

userRouter.get("/account", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userId === undefined) {
      return res
        .status(200)
        .json({ success: false, message: "Authorization error" });
    }
    const { success, message, userInfo } = await getUserInfo(pool, req.userId);
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
});

userRouter.put(
  "/account/update",
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

userRouter.post("/forgot-password/request", async (req, res) => {
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

userRouter.post("/forgot-password/verify-token", async (req, res) => {
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

userRouter.put(
  "/forgot-password/update",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
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

userRouter.post(
  "/verification/resend",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
        return res
          .status(200)
          .json({ success: false, message: "Authorization Error" });
      }
      const isVerified = await verifyById(pool, req.userId);
      if (isVerified) {
        return res
          .status(200)
          .json({ success: false, message: "User email is already verified" });
      }
      const emailFetchResponse = await fetchEmailAndUsername(pool, req.userId);
      if (!emailFetchResponse.success) {
        return res
          .status(400)
          .json({ success: false, message: emailFetchResponse.message });
      }
      const { emailToken } = await createEmailToken(
        pool,
        req.userId,
        emailFetchResponse.email
      );
      const { success, message } = await sendEmailVerification(
        emailFetchResponse.username,
        emailFetchResponse.email,
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

userRouter.put(
  "/register/verification",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
        return res
          .status(200)
          .json({ success: false, message: "Authorization error" });
      }
      const isVerified = await verifyById(pool, req.userId);
      if (isVerified) {
        return res
          .status(200)
          .json({ success: false, message: "User email is already verified" });
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

userRouter.post(
  "/account/authorization",
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

userRouter.get(
  "/verification/status",
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
