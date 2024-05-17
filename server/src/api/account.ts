import { AccessToken, RefreshToken } from "../utils/Token";
import { ONE_DAY, TEN_MINUTES, THIRTY_DAYS, app, pool } from "../utils/consts";
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
  getUsernames,
  strongPassword,
  updateUserInfo,
  usernameExists,
  getUserInfo,
  changePassword,
  verifyForgotPassword,
  forgotPasswordResponse,
  createVerificationToken,
  searchForEmail,
} from "../utils/utils";

//INCLUDES:
//Endpoints to do with form submission or data retreival with regards to
//sign up, sign in, or changes to the user's info (ie password, username, email, etc).
//Find authentication and verification of user in their named files.

app.post("/api/signUp", async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body.data;
    const username = req.body.data.username.toLowerCase();
    if (!username || !email || !firstName || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required data",
      });
    }
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
