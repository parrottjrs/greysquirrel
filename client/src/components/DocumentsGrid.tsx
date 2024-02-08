import React, { useEffect, useState } from "react";

interface Document extends Object {
  doc_id?: number;
  title?: string;
  content?: string;
  authorizedUsers: Array<string>;
}

export default function DocumentsGrid() {
  const [documents, setDocuments] = useState([]);
  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      const json = await response.json();
      json.success === false ? setDocuments([]) : setDocuments(json.docs);
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

  const handleRevoke = async (docId: any, authorizedUserName: string) => {
    await fetchRevoke(docId, authorizedUserName);
  };

  console.log(documents);
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
                  key={index}
                  onClick={() => handleRevoke(doc_id, userName)}
                >
                  {userName}
                </span>
              );
            })
          : null}
        <button onClick={() => handleDelete(doc_id)}>Delete</button>
      </div>
    );
  });
}
