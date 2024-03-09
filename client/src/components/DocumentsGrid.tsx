import React, { useEffect, useState } from "react";
import sanitize from "sanitize-html";
import { FileText } from "lucide-react";
import { STYLES } from "../utils/styles/styles";
import DocumentOptionsDropdown from "./DocumentOptionsDropdown";
import { clipText, formatDate } from "../utils/functions";
import Page from "./Page";
import CheckMark from "./CheckMark";

interface Document {
  doc_id?: number;
  title?: string;
  content?: string;
  authorizedUsers: string[];
  last_edit: string;
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
    const { title, doc_id, content, authorizedUsers, last_edit } = document;

    const newTitle = title ? clipText(title, "title") : "Untitled";

    const cleanContent = content
      ? sanitize(content, { allowedTags: [], allowedAttributes: {} })
      : null;

    const newContent = content ? clipText(cleanContent, "content") : "";

    const formattedEditDate = formatDate(last_edit);
    return (
      <div
        className="flex flex-row justify-between h-30 p-4 my-4 border-solid border border-dustyGray rounded-lg overflow-hidden w-full"
        key={doc_id}
      >
        <a
          className="no-underline text-nero w-full h-full"
          href={`#/editor/${doc_id}`}
        >
          <div className="flex flex-row w-full">
            <Page />
            <div className="flex flex-col w-full">
              <h2 className={STYLES.DOC_HEADER}>
                {!title ? "Untitled" : newTitle}
              </h2>
              <p className={STYLES.PREVIEW}>{newContent}</p>
              <div className="flex flex-row justify-between items-center w-full">
                <span className="text-boulder text-sm font-sans md:text-lg mt-0">
                  Last updated: {formattedEditDate}
                </span>
                {authorizedUsers.length > 0 ? (
                  <div className="">
                    <span className="cursor-pointer text-boulder text-sm font-sans md:text-lg mr-2">
                      Shared
                    </span>
                    <CheckMark />
                  </div>
                ) : (
                  false
                )}
              </div>
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
