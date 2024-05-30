import { pbkdf2Sync, randomBytes, randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import { AccessToken } from "./Token";

export interface AuthRequest extends Request {
  userId?: number;
  message?: string;
  docId?: number;
  recipient?: string;
  inviteId?: number;
  password?: string;
}

export const usernameExists = async (
  pool: any,
  userId: number,
  usernameToCheck: string
) => {
  const { success, currentUsername } = await userNameFromId(pool, userId);
  if (!success) {
    return true;
  }
  if (usernameToCheck !== currentUsername) {
    const allUsernames = await getUsernames(pool);
    return allUsernames.includes(usernameToCheck);
  }
  return false;
};

const getPasswordFromUsername = async (pool: any, username: string) => {
  const query = `
    SELECT password, salt FROM users
    WHERE user_name = ?
    `;
  const [result, _] = await pool.query(query, [username]);
  const user = JSON.parse(JSON.stringify(result));
  if (!user[0]) {
    return { truePass: "", salt: "" };
  }
  return { truePass: user[0].password, salt: user[0].salt };
};

const passwordSaltFromUserId = async (pool: any, userId: number) => {
  const query = `
    SELECT password, salt FROM users
    WHERE user_id = ?
    `;
  const [result, _] = await pool.query(query, [userId]);
  return result.length > 0
    ? {
        success: true,
        currentPassword: result[0].password,
        currentSalt: result[0].salt,
      }
    : { success: false };
};

export const checkPassword = async (
  userId: number,
  password: string,
  pool: any
) => {
  const { success, currentPassword, currentSalt } =
    await passwordSaltFromUserId(pool, userId);
  if (!success) {
    return { success: false, message: "Couldn't retreive user info" };
  }
  const attemptedPass = pbkdf2Sync(
    password,
    currentSalt,
    10000,
    64,
    "sha512"
  ).toString("base64");
  if (attemptedPass !== currentPassword) {
    return { success: false, message: "Password is incorrect" };
  }
  return { success: true, message: "Authentication successful" };
};

export const getId = async (pool: any, username: string) => {
  const query = `
    SELECT user_id FROM users 
    WHERE user_name = ?
    `;
  const [result, _] = await pool.query(query, [username]);
  const id = JSON.parse(JSON.stringify(result));
  return result.length > 0 ? id[0].user_id : false;
};

export const userNameFromId = async (pool: any, userId: number) => {
  const query = `
    SELECT user_name as username
    FROM users
    WHERE user_id = ?
    `;
  const [result, _] = await pool.query(query, [userId]);
  return result.length > 0
    ? { success: true, currentUsername: result[0].username }
    : { success: false };
};

export const strongPassword = (password: string) => {
  var restrictions = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

  return restrictions.test(password);
};

export const getUsernames = async (pool: any) => {
  const query = `SELECT user_name FROM users`;
  const [result, _] = await pool.query(query);
  const usernames = JSON.parse(JSON.stringify(result));

  return usernames.map((username: object) => {
    return Object.values(username).toString();
  });
};

export const verifyById = async (pool: any, userId: number) => {
  const query = `
    SELECT is_verified
    FROM users
    WHERE user_id = ?
    `;
  const [result, _] = await pool.query(query, [userId]);
  if (result[0].is_verified === 0) {
    return false;
  }
  return true;
};

const getEmailToken = async (pool: any, userId: number) => {
  const query = `
    SELECT email_token
    FROM users
    WHERE user_id = ?
    `;
  const [result, _] = await pool.query(query, [userId]);
  const parsedResult = JSON.parse(JSON.stringify(result));
  const emailToken = parsedResult[0].email_token;
  return emailToken;
};

const deleteEmailToken = async (pool: any, emailToken: string) => {
  const query = `
    DELETE FROM email_tokens
    WHERE email_token = ?
    `;
  const [result, _] = await pool.query(query, [emailToken]);
  return result.affectedrows === 0 ? false : true;
};

export const verifyEmailToken = async (
  pool: any,
  userId: number,
  emailToken: string
) => {
  const values = [emailToken, userId];
  const query = `
    SELECT expiration_date
    FROM email_tokens 
    WHERE email_token = ? AND user_id = ?
    `;
  const [result, _] = await pool.query(query, values);
  if (result.length === 0) {
    return {
      success: false,
      message: "Email token does not exist. Please restart process.",
    };
  }
  const deleted = await deleteEmailToken(pool, emailToken);
  if (!deleted) {
    return { success: false, message: "Error deleting email token" };
  }
  if (result[0].expiration_date < Date.now()) {
    return {
      success: false,
      message: "Email token expired. Please restart process",
    };
  }
  const verified = await setVerifiedToTrue(pool, userId);
  return verified;
};

const setVerifiedToTrue = async (pool: any, userId: number) => {
  const values = [true, userId];
  const query = `
  UPDATE users
  SET is_verified = ?
  where user_id = ?
  `;
  const [result, _] = await pool.query(query, values);
  return result.affectedRows > 0
    ? { success: true, message: "User email has been verified" }
    : {
        success: false,
        message: "User email verification failed. Please restart process.",
      };
};

export const authenticateUser = async (
  username: string,
  password: string,
  pool: any
) => {
  const { truePass, salt } = await getPasswordFromUsername(pool, username);

  const attemptedPass = pbkdf2Sync(
    password,
    salt,
    10000,
    64,
    "sha512"
  ).toString("base64");
  return attemptedPass === truePass;
};

export const emailExistsInDatabase = async (pool: any, email: string) => {
  const query = `
  SELECT * FROM users
  WHERE email = ?
  `;
  const [result, _] = await pool.query(query, [email]);
  return result.length > 0 ? true : false;
};

export const fetchEmailAndUsername = async (pool: any, userId: number) => {
  const query = `
  SELECT email, user_name 
  FROM users
  WHERE user_id = ?
  `;
  const [result, _] = await pool.query(query, [userId]);
  return result.length < 0
    ? {
        success: false,
        message: "Could not retrieve user email. Please try again.",
      }
    : {
        success: true,
        message: "User email retreived",
        email: result[0].email,
        username: result[0].user_name,
      };
};

export const createEmailToken = async (
  pool: any,
  userId: number,
  email: string
) => {
  const emailToken = randomUUID();
  const expirationDateMs = Date.now() + 600000; /* 600000 ms = 10 minutes */
  const values = [emailToken, email, expirationDateMs, userId];
  const query = `
      INSERT INTO email_tokens (email_token, email, expiration_date, user_id)
      VALUES (?, ?, ?, ?)
      `;
  const [result, _] = await pool.query(query, values);

  return result.affectedRows > 0
    ? {
        success: true,
        emailToken: emailToken,
      }
    : { success: false, message: "Error creating email token" };
};

export const createUser = async (
  pool: any,
  username: string,
  email: string,
  firstName: string,
  lastName: string,
  password: string
) => {
  const usernames = await getUsernames(pool);
  const emailExists = await emailExistsInDatabase(pool, email);
  if (usernames.includes(username)) {
    return {
      success: false,
      message: "User already exists",
    };
  }
  if (!strongPassword(password)) {
    return {
      success: false,
      message: "Password does not meet site requirements. Please try again.",
    };
  }
  if (emailExists) {
    return {
      success: false,
      message: "Email is already associated with an account",
    };
  }
  const salt = randomBytes(64).toString("base64");
  const hash = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString(
    "base64"
  );

  const values = [username, email, firstName, lastName, hash, salt, false];
  const query = `
    INSERT INTO users (
      user_name, 
      email, 
      first_name, 
      last_name, 
      password, 
      salt, 
      is_verified
      ) 
    VALUES (
    ?,?,?,?,?,?,?
    )`;
  const [result, _] = await pool.query(query, values);
  return result.affectedRows > 0
    ? { success: true, message: "User created" }
    : { success: false, message: "Failed to create user" };
};

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken } = req.cookies;
    const verified = AccessToken.verify(accessToken);
    req.userId = verified.userId;
    next();
  } catch (err) {
    console.error("Token error:", err);
    return res
      .status(403)
      .json({ message: "Unauthorized: Missing or invalid token" });
  }
};

export const getUserInfo = async (pool: any, userId: number) => {
  const query = `
    SELECT first_name as firstName, last_name as lastName, user_name as username, email
    FROM users
    WHERE user_id = ?
    `;
  const [result, _] = await pool.query(query, [userId]);
  return result.length > 0
    ? {
        success: true,
        message: "Info successfully retreived",
        userInfo: result[0],
      }
    : { success: false, message: "Could not retreive user info" };
};

export const updateUserInfo = async (
  pool: any,
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string,
  userId: number
) => {
  let userNameToUpdate = username;
  let saltToUpdate = randomBytes(64).toString("base64");
  let passWordToUpdate = pbkdf2Sync(
    password,
    saltToUpdate,
    10000,
    64,
    "sha512"
  ).toString("base64");

  if (password === "") {
    const { success, currentPassword, currentSalt } =
      await passwordSaltFromUserId(pool, userId);
    if (success) {
      passWordToUpdate = currentPassword;
      saltToUpdate = currentSalt;
    }
  }

  if (username === "") {
    const { success, currentUsername } = await userNameFromId(pool, userId);
    if (success) {
      userNameToUpdate = currentUsername;
    }
  }

  const values = [
    firstName,
    lastName,
    userNameToUpdate,
    email,
    passWordToUpdate,
    saltToUpdate,
    userId,
  ];

  const query = `
    UPDATE users
    SET first_name = ?, last_name = ?, user_name = ?, email = ?, password = ?, salt = ?
    WHERE user_id = ?
    `;

  const [result, _] = await pool.query(query, values);
  return result.affectedRows > 0
    ? {
        success: true,
        message: "User info updated",
      }
    : { success: false, message: "Could not update user info" };
};

export const searchForEmail = async (pool: any, email: string) => {
  const query = `
      SELECT user_id
      FROM users 
      WHERE email = ?
    `;
  const [result, _] = await pool.query(query, [email]);
  return result.length > 0
    ? { success: true, userId: result[0].user_id }
    : { success: false };
};

const getRandomTimeout = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const forgotPasswordResponse = async (res: Response<any>) => {
  const timeout = getRandomTimeout(3000, 6000);

  return setTimeout(() => {
    res.status(200).json({
      success: true,
      message:
        "An email has been sent to the provided address if it exists in our system. Please check your inbox for instructions to reset your password.",
    });
  }, timeout);
};

export const createVerificationToken = async (
  pool: any,
  email: string,
  userId: number
) => {
  const verificationToken = randomUUID();
  const expirationDateMs = Date.now() + 600000; /* 600000 ms = 10 minutes */
  const values = [verificationToken, email, expirationDateMs, userId];
  const query = `
      INSERT INTO verification_tokens (verification_token, email, expiration_date, user_id)
      VALUES (?, ?, ?, ?)
      `;
  const [result, _] = await pool.query(query, values);

  return result.affectedRows > 0
    ? {
        success: true,
        message: "Verification token created",
        verificationToken: verificationToken,
      }
    : { success: false, message: "Error creating verification token" };
};

const deleteVerificationToken = async (
  pool: any,
  verificationToken: string
) => {
  const query = `
    DELETE FROM verification_tokens
    WHERE verification_token = ?
    `;
  const [result, _] = await pool.query(query, [verificationToken]);
  return result.affectedrows === 0 ? false : true;
};

export const verifyForgotPassword = async (
  pool: any,
  verificationToken: string
) => {
  const query = `
    SELECT user_id, expiration_date
    FROM verification_tokens 
    WHERE verification_token = ?
    `;
  const [result, _] = await pool.query(query, [verificationToken]);
  if (result.length === 0) {
    return {
      success: false,
      message: "Verification token does not exist. Please restart process.",
    };
  }
  const deleted = await deleteVerificationToken(pool, verificationToken);
  if (!deleted) {
    return { success: false, message: "Error deleting verification token" };
  }
  return result[0].expiration_date < Date.now()
    ? {
        success: false,
        message: "Verification token expired. Please restart process",
      }
    : {
        success: true,
        message: "Verification token authorized. Continue to reset password",
        userId: result[0].user_id,
      };
};

const isSamePassword = async (
  pool: any,
  newPassword: string,
  userId: number
) => {
  const { currentPassword, currentSalt } = await passwordSaltFromUserId(
    pool,
    userId
  );
  const attemptedPassword = pbkdf2Sync(
    newPassword,
    currentSalt,
    10000,
    64,
    "sha512"
  ).toString("base64");
  return attemptedPassword === currentPassword;
};

export const changePassword = async (
  pool: any,
  newPassword: string,
  userId: number
) => {
  const isReusingPassword = await isSamePassword(pool, newPassword, userId);
  if (isReusingPassword) {
    return {
      success: false,
      message: "New password can't be the same as a previously used password",
    };
  }
  const newSalt = randomBytes(64).toString("base64");
  const newHash = pbkdf2Sync(
    newPassword,
    newSalt,
    10000,
    64,
    "sha512"
  ).toString("base64");

  const values = [newSalt, newHash, userId];
  const query = `
    UPDATE users
    SET salt = ?, password = ?
    WHERE user_id = ?
    `;
  const [result, _] = await pool.query(query, values);
  return result.affectedRows > 0
    ? { success: true, message: "Password reset successful" }
    : { success: false, message: "Password reset failed" };
};
