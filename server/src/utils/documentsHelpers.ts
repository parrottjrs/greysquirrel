import { deleteInviteByDocId } from "./invitesHelpers";

interface Document {
  docId: number;
  lastEdit: Date;
  title: string;
  content: string;
}

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
          userOwnsDoc: false,
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
    userOwnsDoc: true,
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

export const getAuthorizedUsers = async (
  pool: any,
  userId: number,
  docId: any
) => {
  const values = [userId, docId];
  const query = `
    SELECT u.user_name
    FROM shared_docs s
    LEFT JOIN users u ON s.authorized_user = u.user_id
    WHERE s.owner_id = ? AND s.doc_id = ?
    `;

  const [result, _] = await pool.query(query, values);
  if (result.length < 0) {
    return {
      success: false,
      message: "No authorized users",
      authoutizedUsers: null,
    };
  }

  const authorizedUserList = result.map((user: { user_name: string }) => {
    return user.user_name;
  });

  return {
    success: true,
    message: "Authorized users retreived",
    authorizedUsers: authorizedUserList,
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

export const docOwnership = async (
  pool: any,
  docId: number,
  userId: number
) => {
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

export const getSharedDoc = async (
  pool: any,
  docId: number,
  authorizedId: number
) => {
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
