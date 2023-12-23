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
  const query = `
  SELECT password, salt FROM users
  WHERE user_name = "${username}"
  `;
  const [result, _] = await pool.query(query);
  const user = JSON.parse(JSON.stringify(result));
  if (!user[0]) {
    return { truePass: "", salt: "" };
  }
  return { truePass: user[0].password, salt: user[0].salt };
};

export const getId = async (pool: any, username: string) => {
  const query = `
  SELECT user_id FROM users 
  WHERE user_name = "${username}"
  `;
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
  const query = `
  INSERT INTO users (
    user_name, email, first_name, last_name, password, salt
    ) 
  VALUES (
  "${username}", "${email}", "${firstName}", "${lastName}", "${hash}", "${salt}" 
)`;
  await pool.query(query);
};

type Document = {
  docId: number;
  lastEdit: Date;
  title: string;
  content: string;
};

export interface AuthRequest extends Request {
  userId?: number;
  message?: string;
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
  const values = [userId, date, date];
  const query1 = `
  INSERT INTO documents (user_id, created, last_edit) 
  VALUES (?, ?, ?)
  `;
  const query2 = `SELECT LAST_INSERT_ID() as docId`;
  con.query(query1, values);
  const [result, _] = await con.query(query2);
  const id = JSON.parse(JSON.stringify(result));
  return id[0].docId;
};

export const getDocument = async (con: any, docId: number, userId: number) => {
  const query = `
  SELECT doc_id, user_id, title, content 
  FROM documents 
  WHERE doc_id = ?
  `;
  const [result, _] = await con.query(query, docId);
  const document = await JSON.parse(JSON.stringify(result));
  if (document[0].user_id !== userId) {
    return { message: "Unauthorized" };
  }
  return {
    docId: document[0].doc_id,
    title: document[0].title,
    content: document[0].content,
  };
};

export const allDocuments = async (pool: any, userId: number) => {
  const query = `
  SELECT doc_id, title, content 
  FROM documents 
  WHERE user_id = ?`;
  const [result, _] = await pool.query(query, userId);
  return result;
};

export const saveDocument = async (pool: any, doc: Document) => {
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");
  const values = [date, doc.title, doc.content, doc.docId];
  const query = `
  UPDATE documents
  SET last_edit = ?, title = ?, content = ?
  WHERE doc_id = ?
  `;

  const [result, _] = await pool.query(query, values);
  return result.affectedRows > 0
    ? { success: true, message: "Document saved successfully" }
    : {
        success: false,
        message: "Document not found or unauthorized",
        error: result.message,
      };
};

export const deleteDocument = async (
  pool: any,
  docId: number,
  userId: number
) => {
  const query = `
  DELETE FROM documents 
  WHERE doc_id = ? AND user_id = ?
  `;
  const values = [docId, userId];
  const [result, _] = await pool.query(query, values);
  return result.affectedRows > 0
    ? { success: true, message: "Document deleted successfully" }
    : {
        success: false,
        message: "Document not found or unauthorized",
        error: result.message,
      };
};
