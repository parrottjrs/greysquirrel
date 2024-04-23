import React, { useEffect, useState } from "react";
import sanitize from "sanitize-html";
import { clipText, formatDate } from "../utils/functions";
import Page from "./Page";
import CheckMark from "./CheckMark";
import { DocumentsGridProps, UserDocument } from "../utils/customTypes";
import DocOptionsDropdown from "./DocOptionsDropdown";
import {
  DETAILS_CONTAINER,
  DOCUMENT_GRID_ITEM,
  DOC_HEADER,
  DOC_PREVIEW,
  FULLSIZE_INVIS_ANCHOR,
  LAST_UPDATE_TEXT,
  SHARED_TEXT,
} from "../utils/styles/DocPageStyles";

export default function DocumentsGrid({
  documents,
  setDocuments,
}: DocumentsGridProps) {
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

  const handleRevoke = async (docId: any, userToRevoke: string) => {
    await fetchRevoke(docId, userToRevoke);
    setDocuments((previousDocuments) =>
      previousDocuments.map((document: UserDocument) =>
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

  return documents.map((document: UserDocument) => {
    const { title, doc_id, content, authorizedUsers, last_edit } = document;

    const newTitle = title ? clipText(title, "title") : "Untitled";

    const cleanContent = content
      ? sanitize(content, { allowedTags: [], allowedAttributes: {} })
      : null;

    const newContent = content ? clipText(cleanContent, "content") : "";

    const formattedEditDate = formatDate(last_edit);
    return (
      <div className={DOCUMENT_GRID_ITEM} key={doc_id}>
        <a className={FULLSIZE_INVIS_ANCHOR} href={`#/editor/${doc_id}`}>
          <div className="flex flex-row w-full">
            <Page />
            <div className="flex flex-col w-full">
              <h2 className={DOC_HEADER}>{!title ? "Untitled" : newTitle}</h2>
              <p className={DOC_PREVIEW}>{newContent}</p>
              <div className={DETAILS_CONTAINER}>
                <span className={LAST_UPDATE_TEXT}>
                  Last updated: {formattedEditDate}
                </span>
                {authorizedUsers.length > 0 ? (
                  <div>
                    <span className={SHARED_TEXT}>Shared</span>
                    <CheckMark />
                  </div>
                ) : (
                  false
                )}
              </div>
            </div>
          </div>
        </a>
        <DocOptionsDropdown
          docId={doc_id}
          title={title}
          handleDocs={setDocuments}
        />
      </div>
    );
  });
}
