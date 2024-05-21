import { docOwnership, getSharedDoc } from "./documentsHelpers";

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
  if (senderId === recipientId) {
    return {
      success: false,
      message:
        "Self love is important, but you can't share documents with yourself",
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
