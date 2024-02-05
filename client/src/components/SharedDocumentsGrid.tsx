import React, { useEffect, useState } from "react";

interface sharedDocument extends Object {
  doc_id?: number;
  title?: string;
  content?: string;
  owner_name?: string;
}

export default function SharedDocumentsGrid() {
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

  useEffect(() => {
    fetchSharedDocuments();
  }, []);

  //   const handleDelete = (id: any) => {
  //     fetchDelete(id);
  //     setDocuments((currentDocuments) => {
  //       return currentDocuments.filter(
  //         (document: Document) => document.doc_id !== id
  //       );
  //     });
  //   };

  return sharedDocuments.length > 0
    ? sharedDocuments.map((document: sharedDocument) => {
        const { title, doc_id, owner_name } = document;
        return (
          <div key={doc_id}>
            <a href={`#/editor/${doc_id}`}>{!title ? "hello world" : title}</a>
            <p>Shared by: {owner_name}</p>
            {/* <button onClick={() => handleDelete(doc_id)}>Delete</button> */}
          </div>
        );
      })
    : null;
}
