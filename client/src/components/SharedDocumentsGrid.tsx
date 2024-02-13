import React, { useEffect, useState } from "react";
import { Invite } from "../pages/Documents";

interface SharedDocument extends Object {
  doc_id?: number;
  title?: string;
  content?: string;
  owner: { owner_id?: number; owner_name?: string };
}

interface ChildProps {
  invites: Array<Invite>;
}
export default function SharedDocumentsGrid({ invites }: ChildProps) {
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const fetchSharedDocuments = async () => {
    try {
      const response = await fetch("/api/shared-docs");
      const json = await response.json();
      json.success === false
        ? setSharedDocuments([])
        : setSharedDocuments(json.sharedDocs);
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const fetchDelete = async (docId: number, ownerId: number) => {
    try {
      await fetch("api/shared-docs", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ docId: docId, ownerId: ownerId }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSharedDocuments();
  }, [invites]);

  const handleDelete = async (docId: any, ownerId: any) => {
    await fetchDelete(docId, ownerId);
    setSharedDocuments((currentDocuments) => {
      return currentDocuments.filter(
        (document: SharedDocument) => document.doc_id !== docId
      );
    });
  };

  return sharedDocuments.length > 0 ? (
    <div>
      <h2>Shared Documents</h2>
      {sharedDocuments.map((document: SharedDocument) => {
        const {
          title,
          doc_id,
          owner: { owner_id, owner_name },
        } = document;
        return (
          <div key={doc_id}>
            <a href={`#/editor/${doc_id}`}>{!title ? "hello world" : title}</a>
            <p>Shared by: {owner_name}</p>
            <button onClick={() => handleDelete(doc_id, owner_id)}>
              Delete
            </button>
          </div>
        );
      })}
    </div>
  ) : null;
}
