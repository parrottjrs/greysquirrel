import { NextFunction, Request, Response } from "express";
import { AccessToken } from "../Token";
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

const verifyByName = async (pool: any, userName: string) => {
  const query = `
  SELECT is_verified
  FROM users
  WHERE user_name = ?
  `;
  const [result, _] = await pool.query(query, [userName]);
  const parsedResult = JSON.parse(JSON.stringify(result));
  if (parsedResult[0].is_verified === 0) {
    return false;
  }
  return true;
};

export const verifyById = async (pool: any, userId: number) => {
  const query = `
  SELECT is_verified
  FROM users
  WHERE user_id = ?
  `;
  const [result, _] = await pool.query(query, [userId]);
  const parsedResult = JSON.parse(JSON.stringify(result));
  if (parsedResult[0].is_verified === 0) {
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
  return result.length > 0
    ? { success: true, existingEmailToken: emailToken }
    : { success: false, message: "Failed to retreive emailToken" };
};

export const verifyEmailToken = async (
  pool: any,
  userId: number,
  emailToken: string
) => {
  const { success, message, existingEmailToken } = await getEmailToken(
    pool,
    userId
  );

  if (!success) {
    return { success: success, message: message };
  }
  if (existingEmailToken !== emailToken) {
    return { success: false, message: "Tokens do not match." };
  }
  const values = [1, null, userId];
  const query = `
  UPDATE users
  SET is_verified = ?,
      email_token = ?
  WHERE user_id = ?
  `;
  const [response, _] = await pool.query(query, values);

  return response.affectedRows > 0
    ? { success: true, message: "verification successful" }
    : { success: false, message: "verification unsuccessful" };
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
  const emailToken = randomUUID();
  const values = [
    username,
    email,
    firstName,
    lastName,
    hash,
    salt,
    false,
    emailToken,
  ];
  const query = `
  INSERT INTO users (
    user_name, 
    email, 
    first_name, 
    last_name, 
    password, 
    salt, 
    is_verified,
    email_token
    ) 
  VALUES (
  ?,?,?,?,?,?,?,?
  )`;
  const [result, _] = await pool.query(query, values);
  return result.affectedRows > 0
    ? { success: true, message: "User created", emailToken: emailToken }
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
SELECT user_name 
FROM users 
WHERE email = ?
`;
  const [result, _] = await pool.query(query, [email]);
  return result.length > 0 ? true : false;
};

export const createVerificationToken = async (pool: any, email: string) => {
  const verificationToken = randomUUID();
  const expirationDateMs = Date.now() + 600000; /* 600000 ms = 10 minutes */
  const values = [verificationToken, email, expirationDateMs];
  const query = `
    INSERT INTO verification_tokens (verification_token, email, expiration_date)
    VALUES (?, ?, ?)
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

//Document queries

export const createDocument = async (con: any, userId: number) => {
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");
  const insertValues = [userId, date, date];
  const insertQuery = `
  INSERT INTO documents (user_id, created, last_edit) 
  VALUES (?, ?, ?)
  `;
  const getIdQuery = `SELECT LAST_INSERT_ID() as docId`;
  await con.query(insertQuery, insertValues);
  const [result, _] = await con.query(getIdQuery);
  const id = JSON.parse(JSON.stringify(result));
  return result.length > 0
    ? { success: true, message: "Document created", docId: id[0].docId }
    : { success: false, message: "Cannot create document" };
};

export const getDocument = async (pool: any, docId: number, userId: number) => {
  const query = `
  SELECT doc_id, user_id, title, content 
  FROM documents 
  WHERE doc_id = ?
  `;
  const [result, _] = await pool.query(query, [docId]);
  if (result.length === 0) {
    return { success: false, message: "File not found" };
  }
  const document = await JSON.parse(JSON.stringify(result));
  if (document[0].user_id !== userId) {
    const IdToBeChecked = await isAuthorized(pool, docId, userId);
    return IdToBeChecked
      ? {
          success: true,
          message: "Document retrieved",
          doc: {
            docId: document[0].doc_id,
            title: document[0].title,
            content: document[0].content,
          },
        }
      : { success: false, message: "Authorization error" };
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
    SELECT d.doc_id, d.title, d.content, s.authorized_user, last_edit, u.user_name AS authorized_username
    FROM documents d
    LEFT JOIN shared_docs s ON d.doc_id = s.doc_id
    LEFT JOIN users u ON s.authorized_user = u.user_id
    WHERE d.user_id = ? 
  `;

  const [result, _] = await pool.query(query, [userId]);

  if (result.length === 0) {
    return { success: false, message: "User has no documents to retrieve" };
  }

  const documents = await JSON.parse(JSON.stringify(result));

  const groupedDocuments: {
    [key: number]: {
      doc_id: number;
      title: string;
      content: string;
      last_edit: string;
      authorizedUsers: string[];
    };
  } = {};

  documents.forEach(
    (doc: {
      doc_id: number;
      title: string;
      content: string;
      last_edit: string;
      authorized_username: string;
    }) => {
      const doc_id = doc.doc_id;
      if (!groupedDocuments[doc_id]) {
        groupedDocuments[doc_id] = {
          doc_id: doc_id,
          title: doc.title,
          content: doc.content,
          last_edit: doc.last_edit,
          authorizedUsers: [],
        };
      }

      if (doc.authorized_username) {
        groupedDocuments[doc_id].authorizedUsers.push(doc.authorized_username);
      }
    }
  );

  const resultArray = Object.values(groupedDocuments);

  return {
    success: true,
    message: "Documents successfully retrieved",
    docs: resultArray,
  };
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
export const countInvites = async (pool: any, userId: number) => {
  const query = `
  SELECT COUNT(*) as count 
  FROM invites
  WHERE recipient_id = ? AND viewed = 0
  `;
  const [result, _] = await pool.query(query, [userId]);
  const count = result[0].count;
  return count > 0
    ? { success: true, message: "user has unviewed invites" }
    : { success: false, message: "user has no unviewed invites" };
};

export const getInvitesReceived = async (pool: any, userId: number) => {
  const selectQuery = `
  SELECT i.invite_id, i.doc_id, u.user_name AS sender_name, i.sender_id, 
  i.recipient_id, d.title AS title, i.share_date 
	FROM invites i
	JOIN documents d ON i.doc_id = d.doc_id
	JOIN users u ON i.sender_id = u.user_id
	WHERE recipient_id = ?;
  `;
  const [selectResult, _] = await pool.query(selectQuery, [userId]);
  if (selectResult.length === 0) {
    return { success: false, message: "No invites" };
  }
  const updateQuery = `
  UPDATE invites
	SET viewed = 1
	WHERE recipient_id = ? AND viewed = 0;
`;
  await pool.query(updateQuery, [userId]);

  return {
    success: true,
    message: "Invites successfully retrieved",
    invites: selectResult,
  };
};

export const getInvitesSent = async (pool: any, userId: number) => {
  const query = `
  SELECT i.invite_id, i.doc_id, u.user_name AS recipient_name, i.sender_id, i.recipient_id, d.title AS title, i.share_date  
  FROM invites i
  JOIN documents d ON i.doc_id = d.doc_id
  JOIN users u ON i.recipient_id = u.user_id
  WHERE sender_id = ?;
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
    INSERT INTO invites (doc_id, sender_id, recipient_id, viewed, share_date)
    VALUES (?, ?, ?, ?, ?)
    `;
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    const createDocValues = [docId, senderId, recipientId, 0, date];
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

const isAuthorized = async (pool: any, docId: number, userId: number) => {
  const values = [docId, userId];
  const query = `
  SELECT *
  FROM shared_docs
  WHERE doc_id = ? 
  AND authorized_user = ?
  `;
  const [response, _] = await pool.query(query, values);
  return response.length > 0;
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
    SELECT d.doc_id, d.title, d.content, u.user_name as owner_name, u.user_id as owner_id
        FROM documents d
        JOIN users u ON d.user_id = u.user_id
        WHERE d.doc_id = ?
    `;
      const [result, _] = await pool.query(query, [id.doc_id]);
      return {
        doc_id: result[0].doc_id,
        title: result[0].title,
        content: result[0].content,
        owner: {
          owner_id: result[0].owner_id,
          owner_name: result[0].owner_name,
        },
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

export const changeUserInfo = async (pool: any) => {};
