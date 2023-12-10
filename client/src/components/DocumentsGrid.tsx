import React, { useEffect, useState } from "react";

interface Document extends Object {
  uuid?: string;
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
    const { title, uuid } = document;
    return (
      <div key={uuid}>
        <a href={`#/editor:${uuid}`}>{!title ? "hello world" : title}</a>
      </div>
    );
  });

  // documents.then((documents) => {
  //   documents.forEach((document: Document) => {
  //     return <p>{document.title}</p>;
  //   });
  // });
}
