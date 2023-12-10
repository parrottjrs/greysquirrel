import { NextFunction, Request, Response } from "express";
import { AccessToken } from "./Token";
import { pbkdf2Sync, randomBytes, randomUUID } from "crypto";

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
  if (!user[0]) {
    return { truePass: "", salt: "" };
  }
  return { truePass: user[0].password, salt: user[0].salt };
};

export const getId = async (pool: any, username: string) => {
  const query = `SELECT user_id from users WHERE user_name = "${username}"`;
  const [result, _] = await pool.query(query);
  const id = JSON.parse(JSON.stringify(result));
  return id[0].user_id;
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

export interface AuthRequest extends Request {
  userId?: number;
}

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
    res.status(403).json({ message: "Unauthorized: Missing or invalid token" });
  }
};

export const createDocument = async (con: any, userId: number) => {
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");
  const uuid = randomUUID();
  const query1 = `
  INSERT INTO documents (user_id, created, last_edit, uuid) 
  VALUES ("${userId}", "${date}", "${date}", "${uuid}");
  `;
  const query2 = `SELECT uuid FROM documents WHERE doc_id = LAST_INSERT_ID()`;
  con.query(query1);
  const [result, _] = await con.query(query2);
  const id = JSON.parse(JSON.stringify(result));
  return id[0].uuid;
};

export const getDocument = async (con: any, uuid: number) => {
  const query = `SELECT uuid, title, content FROM documents WHERE uuid = "${uuid}"`;
  const [result, _] = await con.query(query);
  const document = await JSON.parse(JSON.stringify(result));
  return {
    docId: document[0].uuid,
    title: document[0].title,
    content: document[0].content,
  };
};

export const allDocuments = async (pool: any, userId: number) => {
  const query = `SELECT uuid, title, content FROM documents WHERE user_id = "${userId}"`;
  const [result, _] = await pool.query(query);
  return result;
};