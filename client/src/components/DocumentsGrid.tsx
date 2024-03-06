import React, { useEffect, useState } from "react";
import sanitize from "sanitize-html";
import { FileText } from "lucide-react";
import { STYLES } from "../utils/styles/styles";
import DocumentOptionsDropdown from "./DocumentOptionsDropdown";
import { clipText } from "../utils/functions";

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
    const { title, doc_id, content, authorizedUsers } = document;

    const newTitle = title ? clipText(title, "title") : "Untitled";

    const cleanContent = content
      ? sanitize(content, { allowedTags: [], allowedAttributes: {} })
      : null;

    const newContent = content ? clipText(cleanContent, "content") : "";

    return (
      <div
        className="relative flex flex-row justify-between h-30 p-4 my-4 border-solid border border-dustyGray rounded-lg overflow-hidden"
        key={doc_id}
      >
        <a className="no-underline text-nero" href={`#/editor/${doc_id}`}>
          <div className="flex flex-row relative mr-4 ">
            <FileText className={STYLES.DOCUMENT_ICON} />
            <div className="flex flex-col">
              <h2 className={STYLES.DOC_HEADER}>
                {!title ? "Untitled" : newTitle}
              </h2>
              <p className={STYLES.PREVIEW}>{newContent}</p>
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
            </div>
          </div>
        </a>
        <DocumentOptionsDropdown
          docId={doc_id}
          title={title}
          handleDocs={setDocuments}
        />
      </div>
    );
  });
}
