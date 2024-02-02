import { error } from "console";
import { NextFunction, Request, Response } from "express";
import { AccessToken } from "./Token";
import { pbkdf2Sync, randomBytes, randomUUID } from "crypto";

//Custom types

type Document = {
  docId: number;
  lastEdit: Date;
  title: string;
  content: string;
};

export interface AuthRequest extends Request {
  userId?: number;
  message?: string;
  docId?: number;
  recipient?: string;
  inviteId?: number;
}

//User creation/Authentication handling & queries

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
  WHERE user_name = ?
  `;
  const [result, _] = await pool.query(query, [username]);
  const user = JSON.parse(JSON.stringify(result));
  if (!user[0]) {
    return { truePass: "", salt: "" };
  }
  return { truePass: user[0].password, salt: user[0].salt };
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

export const strongPassword = (password: string) => {
  var restrictions = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  return restrictions.test(password);
};

const getUsername = async (pool: any, userId: number) => {
  const query = `
  SELECT user_name
  FROM users
  WHERE user_id = ?
  `;
  const [result, _] = await pool.query(query, [userId]);
  const userName = JSON.parse(JSON.stringify(result));
  return userName[0].user_name;
  // return userName[0].user_name;
};

export const getUsernames = async (pool: any) => {
  const query = `SELECT user_name FROM users`;
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
  const values = [username, email, firstName, lastName, hash, salt];
  const query = `
  INSERT INTO users (
    user_name, email, first_name, last_name, password, salt
    ) 
  VALUES (
  ?,?,?,?,?,?
)`;
  await pool.query(query, values);
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

//Document queries

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
  const [result, _] = await con.query(query, [docId]);
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
  const [result, _] = await pool.query(query, [userId]);
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

const docOwnership = async (pool: any, docId: number, userId: number) => {
  const values = [docId, userId];
  const query = `
  SELECT *
  FROM documents
  WHERE doc_id = ?
  AND user_id = ?
  `;
  const [result, _] = await pool.query(query, values);
  const success = result.length > 0 ? true : false;
  return success;
};

//Invitation queries

export const getInvites = async (pool: any, userId: number) => {
  const query = `
  SELECT * 
  FROM invites
  WHERE recipient_id = ?
  `;
  const [result, _] = await pool.query(query, [userId]);
  if (result.length === 0) {
    return { success: false, message: "No invites" };
  }
  const newResults = await Promise.all(
    result.map(async (element: any) => {
      const { invite_id, doc_id, sender_id, recipient_id } = element;
      const senderName = await getUsername(pool, sender_id);
      return {
        inviteId: invite_id,
        docId: doc_id,
        senderName: senderName,
        senderId: sender_id,
        recipientId: recipient_id,
      };
    })
  );
  return { success: true, invites: newResults };
};

export const sendInvite = async (
  pool: any,
  docId: number,
  senderId: number,
  recipientId: number
) => {
  //Make sure user owns document
  const ownsDoc = await docOwnership(pool, docId, senderId);
  if (!ownsDoc) {
    return {
      success: false,
      message: "Document not found or unauthorized",
    };
  }

  //Make sure invitation hasn't already been sent - avoid duplicate information
  const findDuplicateQuery = `
  SELECT * 
  FROM invites
  WHERE doc_id = ?
  AND recipient_id = ?
  `;
  const findDuplicateValues = [docId, recipientId];
  const [findDuplicateResult, _] = await pool.query(
    findDuplicateQuery,
    findDuplicateValues
  );

  if (findDuplicateResult.length === 0) {
    //add invite to database
    const createDocQuery = `
    INSERT INTO invites (doc_id, sender_id, recipient_id)
    VALUES (?, ?, ?)
    `;
    const createDocValues = [docId, senderId, recipientId];
    const [createResult, _] = await pool.query(createDocQuery, createDocValues);
    return createResult.affectedRows > 0
      ? { success: true, message: "Invite sent" }
      : {
          success: false,
          message: "Invite failed",
          error: createResult.message,
        };
  }
  return {
    success: false,
    message: "A similar invite exists",
  };
};

export const deleteInvite = async (
  pool: any,
  userId: number,
  inviteId: number
) => {
  const values = [inviteId, userId, userId];
  const query = `
  DELETE FROM invites
  WHERE invite_id = ?
  AND (recipient_id = ? OR sender_id = ?) 
  `;
  const [result, _] = await pool.query(query, values);
  return result.affectedRows > 0
    ? { success: true, message: "Invite successfully deleted" }
    : {
        success: false,
        message: "Failed to delete invite: unauthorized or does not exist",
      };
};

const getSharedDoc = async (pool: any, docId: number) => {
  const values = [docId];
  const query = `
  SELECT *
  FROM shared_docs
  WHERE doc_id = ?
  `;
  const [result, _] = await pool.query(query, values);
  const sharedDoc = await JSON.parse(JSON.stringify(result));
  return result.length > 0
    ? { success: true, authorizedUsers: sharedDoc[0].authorized_users }
    : { success: false };
};

const ownsInvite = async (pool: any, inviteId: number, recipientId: number) => {
  const inviteOwnershipValues = [inviteId, recipientId];
  const inviteOwnershipQuery = `
  SELECT *
  FROM invites
  WHERE invite_id = ? 
  AND recipient_id = ?
  `;
  const [result, _] = await pool.query(
    inviteOwnershipQuery,
    inviteOwnershipValues
  );
  return result.length > 0;
};

export const acceptInvite = async (
  pool: any,
  inviteId: number,
  docId: number,
  senderId: number,
  recipientId: number
) => {
  const authorized = await ownsInvite(pool, inviteId, recipientId);
  if (!authorized) {
    return { success: false };
  }
  const sharedDoc = await getSharedDoc(pool, docId);
  if (!sharedDoc.success) {
    const recipientArray = [recipientId];
    const recipientArrayString = JSON.stringify(recipientArray);
    const createSharedDocValues = [docId, senderId, recipientArrayString];
    const createSharedDoc = `
    INSERT INTO shared_docs (doc_id, owner_id, authorized_users)
    VALUES (?, ?, ?)
    `;
    const [result, _] = await pool.query(
      createSharedDoc,
      createSharedDocValues
    );
    return result.affectedRows > 0
      ? { success: true, message: "Invite accepted" }
      : { success: false, message: "Invite acceptance unsuccessful" };
  }
  const authorizedUsers = JSON.parse(sharedDoc.authorizedUsers);
  authorizedUsers.push(recipientId);
  const newUsersArray = authorizedUsers;
  const newUsersArrayString = JSON.stringify(newUsersArray);
  const updateSharedDocValues = [newUsersArrayString, docId];
  const updateSharedDocQuery = `
  UPDATE shared_docs
  SET authorized_users = ?
  WHERE doc_id = ?
  `;
  const [result, _] = await pool.query(
    updateSharedDocQuery,
    updateSharedDocValues
  );
  return result.affectedRows > 0
    ? { success: true, message: "Invite accepted" }
    : { success: false, message: "Invite acceptance unsuccessful " };
};
