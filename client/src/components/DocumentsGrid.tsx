import React, { useEffect, useState } from "react";
import ShareModal from "./ShareModal";

interface Document {
  doc_id?: number;
  title?: string;
  content?: string;
  authorizedUsers: string[];
}

export default function DocumentsGrid() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      const json = await response.json();
      if (json.success) {
        setDocuments(json.docs);
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const fetchDelete = async (id: any) => {
    try {
      await fetch("api/documents", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ docId: id }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRevoke = async (docId: number, authorizedUserName: string) => {
    try {
      await fetch("api/shared-docs", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          docId: docId,
          authorizedUserName: authorizedUserName,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: any) => {
    await fetchDelete(id);
    setDocuments((currentDocuments) => {
      return currentDocuments.filter(
        (document: Document) => document.doc_id !== id
      );
    });
  };

  const handleRevoke = async (docId: any, userToRevoke: string) => {
    await fetchRevoke(docId, userToRevoke);
    setDocuments((previousDocuments) =>
      previousDocuments.map((document: Document) =>
        document.doc_id === docId
          ? {
              ...document,
              authorizedUsers: document.authorizedUsers.filter(
                (authorizedUser: string) => authorizedUser !== userToRevoke
              ),
            }
          : document
      )
    );
  };

  return documents.map((document: Document) => {
    const { title, doc_id, authorizedUsers } = document;
    return (
      <div key={doc_id}>
        <a href={`#/editor/${doc_id}`}>{!title ? "hello world" : title}</a>{" "}
        {authorizedUsers.length > 0
          ? authorizedUsers.map((userName: string) => {
              const index = authorizedUsers.indexOf(userName);
              return (
                <span
                  className="cursor-pointer"
                  key={index}
                  onClick={() => handleRevoke(doc_id, userName)}
                >
                  {userName}
                </span>
              );
            })
          : null}
        <ShareModal docId={doc_id} />
        <button onClick={() => handleDelete(doc_id)}>Delete</button>
      </div>
    );
  });
}
