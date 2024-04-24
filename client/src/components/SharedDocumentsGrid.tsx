import React, { useEffect, useState } from "react";
import sanitize from "sanitize-html";
import DocumentOptionsDropdown from "./DocOptionsDropdown";
import { SharedDocument, SharedDocumentsGridProps } from "../utils/customTypes";
import {
  DOC_HEADER,
  DOC_PREVIEW,
  FULLSIZE_INVIS_ANCHOR,
  SHARED_BY_TEXT,
  SHARED_DOC_ITEM,
} from "../styles/DocPageStyles";
import Page from "./Page";

// interface SharedDocument {
//   doc_id?: number;
//   title?: string;
//   content?: string;
//   owner: { owner_id?: number; owner_name?: string };
// }

export default function SharedDocumentsGrid({
  sharedDocuments,
  setSharedDocuments,
}: SharedDocumentsGridProps) {
  return sharedDocuments.map((document: SharedDocument) => {
    const {
      title,
      doc_id,
      content,
      owner: { owner_id, owner_name },
    } = document;

    const clipText = (text: any, type: string) => {
      let maxLength = 0;
      let maxWords = 0;
      switch (type) {
        case "title":
          maxLength = 20;
          maxWords = 4;
          break;
        case "content":
          maxLength = 120;
          maxWords = 20;
          break;
        default:
          break;
      }
      if (text.length <= maxLength) {
        return text;
      }
      const split = text.split(" ");
      const sliced = split.slice(0, maxWords);
      const joined = sliced.join(" ");
      return joined + "...";
    };

    const newTitle = title ? clipText(title, "title") : "Untitled";

    const cleanContent = content
      ? sanitize(content, { allowedTags: [], allowedAttributes: {} })
      : null;

    const newContent = content ? clipText(cleanContent, "content") : "";

    return (
      <div className={SHARED_DOC_ITEM} key={doc_id}>
        <a className={FULLSIZE_INVIS_ANCHOR} href={`#/editor/${doc_id}/shared`}>
          <div className="flex flex-row relative mr-4 ">
            <Page />
            <div className="flex flex-col">
              <h2 className={DOC_HEADER}>{newTitle}</h2>
              <p className={DOC_PREVIEW}>{newContent}</p>
              <p className={SHARED_BY_TEXT}>Shared by: {owner_name}</p>
            </div>
          </div>
        </a>
        <DocumentOptionsDropdown
          docId={doc_id}
          handleDocs={setSharedDocuments}
          ownerId={owner_id}
          shared={true}
        />
      </div>
    );
  });
}
