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
  GRID_INTERIOR,
  ICONS_CONTAINER,
  LAST_UPDATE_TEXT,
  SHARED_TEXT,
} from "../styles/DocPageStyles";
import { useBreakpoints } from "../hooks/useBreakpoints";

export default function DocumentsGrid({
  documents,
  setDocuments,
}: DocumentsGridProps) {
  const { isMobile } = useBreakpoints();

  return documents.map((document: UserDocument) => {
    const { title, doc_id, content, authorizedUsers, last_edit } = document;

    const newTitle = title ? clipText(title, "title") : "Untitled";

    const cleanContent = content
      ? sanitize(content, { allowedTags: [], allowedAttributes: {} })
      : null;

    const newContent = content
      ? clipText(cleanContent, "content", isMobile)
      : "";

    const formattedEditDate = formatDate(last_edit);
    return (
      <div className={DOCUMENT_GRID_ITEM} key={doc_id}>
        <div className={GRID_INTERIOR}>
          <div className={ICONS_CONTAINER}>
            <a href={`#/edit/${doc_id}`}>
              <Page isMobile={isMobile} />
            </a>
            <DocOptionsDropdown
              docId={doc_id}
              title={title}
              handleDocs={setDocuments}
              authorizedUsers={authorizedUsers}
            />
          </div>
          <a className={FULLSIZE_INVIS_ANCHOR} href={`#/edit/${doc_id}`}>
            <h2 className={DOC_HEADER}>{!title ? "Untitled" : newTitle}</h2>
            <p className={DOC_PREVIEW}>{newContent}</p>
            <div className={DETAILS_CONTAINER}>
              <span className={LAST_UPDATE_TEXT}>
                Last updated: {formattedEditDate}
              </span>
              {authorizedUsers.length > 0 ? (
                <div className="mt-[8px] md:mt-0">
                  <span className={SHARED_TEXT}>Shared</span>
                  <CheckMark />
                </div>
              ) : (
                false
              )}
            </div>
          </a>
        </div>
      </div>
    );
  });
}
