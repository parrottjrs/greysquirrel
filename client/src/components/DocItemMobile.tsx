import React, { useState } from "react";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { clipText, formatDate } from "../utils/functions";
import sanitize from "sanitize-html";
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
import DocOptionsDropdown from "./DocOptionsDropdown";
import CheckMark from "./CheckMark";
import Page from "./Page";

export default function DocItemMobile({ doc, setDocs }: any) {
  const { isMobile } = useBreakpoints();
  const { title, doc_id, content, authorizedUsers, last_edit } = doc;
  const [currentAuthorizedUsers, setAuthorizedUsers] =
    useState<string[]>(authorizedUsers);
  const newTitle = title ? clipText(title, "title") : "Untitled";

  const cleanContent = content
    ? sanitize(content, { allowedTags: [], allowedAttributes: {} })
    : null;

  const newContent = content ? clipText(cleanContent, "content", isMobile) : "";

  const revokeSharedAccess = async (userName: string) => {
    await fetch("api/shared-docs", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ docId: doc_id, authorizedUserName: userName }),
    });
  };

  const handleRevokeSharedAccess = (userName: string) => {
    revokeSharedAccess(userName);

    setAuthorizedUsers((prevUsers: string[]) =>
      prevUsers.filter((authorizedUser) => authorizedUser !== userName)
    );
  };

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
            handleDocs={setDocs}
            authorizedUsers={currentAuthorizedUsers}
            onDeleteUser={handleRevokeSharedAccess}
          />
        </div>
        <a className={FULLSIZE_INVIS_ANCHOR} href={`#/edit/${doc_id}`}>
          <h2 className={DOC_HEADER}>{!title ? "Untitled" : newTitle}</h2>
          <p className={DOC_PREVIEW}>{newContent}</p>
          <div className={DETAILS_CONTAINER}>
            <span className={LAST_UPDATE_TEXT}>
              Last updated: {formattedEditDate}
            </span>
            {currentAuthorizedUsers.length > 0 ? (
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
}
