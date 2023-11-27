import { NextFunction, Request, Response } from "express";
import { AccessToken, RefreshToken } from "./Token";
import { pbkdf2Sync, randomBytes } from "crypto";

export const getHash = (password: string) => {
  const salt = randomBytes(64).toString("base64");
  const hash = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString(
    "base64"
  );
  return { salt, hash };
};

export const getPassword = async (pool: any, username: string) => {
  const query = `SELECT password, salt from users WHERE user_name = "${username}"`;
  const [result, _] = await pool.query(query);
  const user = JSON.parse(JSON.stringify(result));
  return { truePass: user[0].password, salt: user[0].salt };
};

export const strongPassword = (password: string) => {
  var restrictions = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  return restrictions.test(password);
};

export const getUsernames = async (pool: any) => {
  const query = `SELECT user_name from users`;
  const [result, _] = await pool.query(query);
  const usernames = JSON.parse(JSON.stringify(result));

  return usernames.map((username: object) => {
    return Object.values(username).toString();
  });
};

export const authenticateUser = async (
  username: string,
  password: string,
  pool: any
) => {
  const { truePass, salt } = await getPassword(pool, username);
  const attemptedPass = pbkdf2Sync(
    password,
    salt,
    10000,
    64,
    "sha512"
  ).toString("base64");
  return attemptedPass === truePass;
};

export const createUser = async (
  pool: any,
  username: string,
  email: string,
  firstName: string,
  lastName: string,
  password: string
) => {
  const salt = randomBytes(64).toString("base64");
  const hash = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString(
    "base64"
  );
  const query = `INSERT INTO users (
  user_name, email, first_name, last_name, password, salt
) VALUES (
  "${username}", "${email}", "${firstName}", "${lastName}", "${hash}", "${salt}" 
)`;
  await pool.query(query);
};

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Refresh token missing" });
    }
    try {
      if (!accessToken) {
        const verified = RefreshToken.verify(refreshToken);
        const { username } = req.body.data;
        if (verified.username !== username) {
          return res.status(401).json({
            message: "Unauthorized: Invalid username in refresh token",
          });
        }
        const newToken = AccessToken.create(username);
        res.cookie("accessToken", newToken, {
          maxAge: 600000,
          httpOnly: true,
        });
        next();
      }
    } catch (verificationError) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid refresh token" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
