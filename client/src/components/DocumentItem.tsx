import { useState } from "react";
import { clipText, formatDate } from "../utils/functions";
import sanitize from "sanitize-html";
import { useBreakpoints } from "../hooks/useBreakpoints";
import CheckMark from "./CheckMark";
import Page from "./Page";
import DocOptionsDropdown from "./DocOptionsDropdown";
import {
  DETAILS_CONTAINER,
  DOCUMENT_GRID_ITEM,
  DOC_HEADER,
  DOC_PREVIEW,
  FULLSIZE_INVIS_ANCHOR,
  LAST_UPDATE_TEXT,
  SHARED_TEXT,
} from "../styles/DocPageStyles";
import { apiUrl } from "../utils/consts";

export default function DocumentItem({ doc, setDocs }: any) {
  const { isMobile } = useBreakpoints();
  const { title, doc_id, content, authorizedUsers, last_edit } = doc;
  const [currentAuthorizedUsers, setAuthorizedUsers] =
    useState<string[]>(authorizedUsers);

  const newTitle = title ? clipText(title, "title") : "Untitled";

  const revokeSharedAccess = async (userName: string) => {
    await fetch(`${apiUrl}/api/documents/shared/revoke`, {
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

  const cleanContent = content
    ? sanitize(content, { allowedTags: [], allowedAttributes: {} })
    : null;

  const newContent = content ? clipText(cleanContent, "content", isMobile) : "";

  const formattedEditDate = formatDate(last_edit);

  return (
    <div className={DOCUMENT_GRID_ITEM} key={doc_id}>
      <a href={`#/edit/${doc_id}`}>
        <Page isMobile={isMobile} />
      </a>

      <a className={FULLSIZE_INVIS_ANCHOR} href={`#/edit/${doc_id}`}>
        <div className="flex flex-col md:items-left gap-[12px]">
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
        </div>
      </a>
      <DocOptionsDropdown
        docId={doc_id}
        title={title}
        handleDocs={setDocs}
        authorizedUsers={currentAuthorizedUsers}
        onDeleteUser={handleRevokeSharedAccess}
      />
    </div>
  );
}
