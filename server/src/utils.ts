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

const getHash = (password: string) => {
  const salt = randomBytes(64).toString("base64");
  const hash = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString(
    "base64"
  );
  return { salt, hash };
};

const getPassword = async (pool: any, username: string) => {
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

//Document queries

export const createDocument = async (con: any, userId: number) => {
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");
  const insertValues = [userId, date, date];
  const insertQuery = `
  INSERT INTO documents (user_id, created, last_edit) 
  VALUES (?, ?, ?)
  `;
  const getIdQuery = `SELECT LAST_INSERT_ID() as docId`;
  con.query(insertQuery, insertValues);
  const [result, _] = await con.query(getIdQuery);
  const id = JSON.parse(JSON.stringify(result));
  return result.length > 0
    ? { success: true, message: "Document created", docId: id[0].docId }
    : { success: false, message: "Cannot create document" };
};

export const getDocument = async (con: any, docId: number, userId: number) => {
  const query = `
  SELECT doc_id, user_id, title, content 
  FROM documents 
  WHERE doc_id = ?
  `;
  const [result, _] = await con.query(query, [docId]);
  if (result.length === 0) {
    return { success: false, message: "File not found" };
  }
  const document = await JSON.parse(JSON.stringify(result));
  if (document[0].user_id !== userId) {
    return { success: false, message: "Authorization error" };
  }
  return {
    success: true,
    message: "Document retrieved",
    doc: {
      docId: document[0].doc_id,
      title: document[0].title,
      content: document[0].content,
    },
  };
};

export const allDocuments = async (pool: any, userId: number) => {
  const query = `
  SELECT doc_id, title, content 
  FROM documents 
  WHERE user_id = ?`;
  const [result, _] = await pool.query(query, [userId]);
  return result.length > 0
    ? {
        success: true,
        message: "Documents successfully retrieved",
        docs: result,
      }
    : { success: false, message: "User has no documents to retrieve" };
};

export const saveDocument = async (
  pool: any,
  doc: Document,
  userId: number
) => {
  const { title, content, docId } = doc;
  const isOwner = await docOwnership(pool, docId, userId);
  const isAuthorized = await getSharedDoc(pool, docId, userId);
  if (!isOwner && !isAuthorized) {
    return { success: false, message: "Authorization error" };
  }
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");
  const values = [date, title, content, docId];
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

const deleteSharedDoc = async (pool: any, docId: number, ownerId: number) => {
  const deleteSharedQuery = `
  DELETE FROM shared_docs
  WHERE doc_id = ? AND owner_id = ?
  `;
  const deleteSharedValues = [docId, ownerId];
  const [result, _] = await pool.query(deleteSharedQuery, deleteSharedValues);
  return result.affectedRows > 0;
};

export const deleteDocument = async (
  pool: any,
  docId: number,
  userId: number
) => {
  await deleteSharedDoc(pool, docId, userId);

  await deleteInviteByDocId(pool, docId, userId);

  const deleteDocQuery = `
  DELETE FROM documents 
  WHERE doc_id = ? AND user_id = ?
  `;
  const deleteDocValues = [docId, userId];
  const [result, _] = await pool.query(deleteDocQuery, deleteDocValues);

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
  return result.length > 0 ? true : false;
};

//Invitation queries

export const getInvites = async (pool: any, userId: number) => {
  const query = `
  SELECT i.invite_id, i.doc_id, u.user_name AS sender_name, i.sender_id, i.recipient_id 
  FROM invites i
  JOIN users u ON i.sender_id = u.user_id
  WHERE recipient_id = ?
  `;
  const [result, _] = await pool.query(query, [userId]);
  if (result.length === 0) {
    return { success: false, message: "No invites" };
  }
  return {
    success: true,
    message: "Invites successfully retrieved",
    invites: result,
  };
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
  //Make sure user isn't already authorized
  const alreadyAuthorized = await getSharedDoc(pool, docId, recipientId);
  if (alreadyAuthorized) {
    return {
      success: false,
      message: "Document has already been shared with user",
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

export const deleteInviteByInviteId = async (
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

export const deleteInviteByDocId = async (
  pool: any,
  docId: number,
  senderId: number
) => {
  const values = [docId, senderId];
  const query = `
  DELETE FROM invites
  WHERE doc_id = ?
  AND sender_id = ? 
  `;
  const [result, _] = await pool.query(query, values);
  return result.affectedRows > 0;
};

const ownsInvite = async (pool: any, inviteId: number, userId: number) => {
  const inviteOwnershipValues = [inviteId, userId, userId];
  const inviteOwnershipQuery = `
  SELECT *
  FROM invites
  WHERE invite_id = ? 
  AND (recipient_id = ? OR sender_id = ?)
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
    return { success: false, message: "Authorization error" };
  }

  const createSharedDocValues = [docId, senderId, recipientId];
  const createSharedDoc = `
    INSERT INTO shared_docs (doc_id, owner_id, authorized_user)
    VALUES (?, ?, ?)
    `;
  const [result, _] = await pool.query(createSharedDoc, createSharedDocValues);
  return result.affectedRows > 0
    ? { success: true, message: "Invite accepted" }
    : {
        success: false,
        message: "Invite no longer exists. Invite cannot be accepted",
      };
};

//Shared doc handling

const getSharedDoc = async (pool: any, docId: number, authorizedId: number) => {
  const values = [docId, authorizedId];
  const query = `
  SELECT *
  FROM shared_docs
  WHERE doc_id = ? AND authorized_user = ?
  `;
  const [result, _] = await pool.query(query, values);
  return result.length > 0;
};

const sharedAccessList = async (pool: any, userId: number) => {
  const query = `
  SELECT doc_id 
  FROM shared_docs
  WHERE authorized_user = ?
  `;
  const [result, _] = await pool.query(query, [userId]);
  return result.length > 0
    ? { success: true, sharedIds: result }
    : { success: false };
};

export const getAllSharedDocs = async (pool: any, userId: number) => {
  const accessList = await sharedAccessList(pool, userId);
  if (!accessList.success) {
    return {
      success: false,
      message: "User has no shared documents to retrieve",
    };
  }
  const { sharedIds } = accessList;

  const allSharedDocs = await Promise.all(
    sharedIds.map(async (id: any) => {
      const query = `
    SELECT d.doc_id, d.title, d.content, u.user_name as owner_name
        FROM documents d
        JOIN users u ON d.user_id = u.user_id
        WHERE d.doc_id = ?
    `;
      const [result, _] = await pool.query(query, [id.doc_id]);
      return {
        doc_id: result[0].doc_id,
        title: result[0].title,
        content: result[0].content,
        owner_name: result[0].owner_name,
      };
    })
  );
  return allSharedDocs.length > 0
    ? {
        success: true,
        message: "Shared documents successfully retrieved",
        sharedDocs: allSharedDocs,
      }
    : { success: false, message: "User has no shared documents to retrieve" };
};

export const revokeSharedAccess = async (
  pool: any,
  docId: number,
  ownerId: number,
  authorizedUserId: number
) => {
  const values = [docId, ownerId, authorizedUserId];
  const query = `
  DELETE from shared_docs
  WHERE doc_id = ?
  AND owner_id = ?
  AND authorized_user = ?
  `;
  const [result, _] = await pool.query(query, values);
  return result.affectedRows > 0
    ? { success: true, message: "Access to shared document revoked" }
    : {
        success: false,
        message:
          "Failed to revoke access. Document is not currently being shared with user",
      };
};
