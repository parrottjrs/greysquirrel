import Page from "./Page";
import { clipText } from "../utils/functions";
import { useBreakpoints } from "../hooks/useBreakpoints";
import sanitize from "sanitize-html";
import DocumentOptionsDropdown from "./DocOptionsDropdown";
import { SharedDocument, SharedDocsGridProps } from "../utils/customTypes";
import {
  DOCUMENT_GRID_ITEM,
  DOC_HEADER,
  DOC_PREVIEW,
  FULLSIZE_INVIS_ANCHOR,
  GRID_INTERIOR,
  ICONS_CONTAINER,
  SHARED_TEXT,
} from "../styles/DocPageStyles";

export default function SharedDocsGridMobile({
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

    const newContent = content ? clipText(cleanContent, "content") : "";

    return (
      <div className={DOCUMENT_GRID_ITEM} key={doc_id}>
        <div className={GRID_INTERIOR}>
          <div className={ICONS_CONTAINER}>
            <a href={`#/edit/${doc_id}`}>
              <Page isMobile={isMobile} />
            </a>
            <DocumentOptionsDropdown
              docId={doc_id}
              handleDocs={setSharedDocuments}
              ownerId={owner_id}
              shared={true}
            />
          </div>
          <a className={FULLSIZE_INVIS_ANCHOR} href={`#/edit/${doc_id}`}>
            <h2 className={DOC_HEADER}>{newTitle}</h2>
            <p className={DOC_PREVIEW}>{newContent}</p>
            <p className={SHARED_TEXT}>Shared by: {owner_name}</p>
          </a>
        </div>
      </div>
    );
  });
}
