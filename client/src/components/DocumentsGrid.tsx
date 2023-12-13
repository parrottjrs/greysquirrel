import React, { useEffect, useState } from "react";

interface Document extends Object {
  doc_id?: number;
  title?: string;
  content?: string;
}

export default function DocumentsGrid() {
  const [documents, setDocuments] = useState([]);
  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      const json = await response.json();
      json === null ? setDocuments([]) : setDocuments(json.docs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return documents.map((document: Document) => {
    const { title, doc_id } = document;
    return (
      <div key={doc_id}>
        <a href={`#/editor/${doc_id}`}>{!title ? "hello world" : title}</a>
      </div>
    );
  });
}
