import React from "react";
import sanitize from "sanitize-html";
import { SharedDocument, SharedDocsGridProps } from "../utils/customTypes";
import {
  DETAILS_CONTAINER,
  DOCUMENT_GRID_ITEM,
  DOC_HEADER,
  DOC_PREVIEW,
  FULLSIZE_INVIS_ANCHOR,
  SHARED_TEXT,
} from "../styles/DocPageStyles";
import Page from "./Page";
import { clipText } from "../utils/functions";
import { useBreakpoints } from "../hooks/useBreakpoints";
import DocOptionsDropdown from "./DocOptionsDropdown";

export default function SharedDocsGridDesktop({
  sharedDocuments,
  setSharedDocuments,
}: SharedDocsGridProps) {
  const { isMobile } = useBreakpoints();

  return sharedDocuments.map((document: SharedDocument) => {
    const {
      title,
      doc_id,
      content,
      owner: { owner_id, owner_name },
    } = document;

    const newTitle = title ? clipText(title, "title") : "Untitled";

    const cleanContent = content
      ? sanitize(content, { allowedTags: [], allowedAttributes: {} })
      : null;

    const newContent = content
      ? clipText(cleanContent, "content", isMobile)
      : "";

    return (
      <div className={DOCUMENT_GRID_ITEM} key={doc_id}>
        <a href={`#/edit/${doc_id}`}>
          <Page isMobile={isMobile} />
        </a>

        <a className={FULLSIZE_INVIS_ANCHOR} href={`#/edit/${doc_id}`}>
          <div className="flex flex-col items-left gap-[12px]">
            <h2 className={DOC_HEADER}>{!title ? "Untitled" : newTitle}</h2>
            <p className={DOC_PREVIEW}>{newContent}</p>

            <p className={SHARED_TEXT}>Shared by: {owner_name}</p>
          </div>
        </a>
        <DocOptionsDropdown
          docId={doc_id}
          handleDocs={setSharedDocuments}
          ownerId={owner_id}
          shared={true}
        />
      </div>
    );
  });
}
