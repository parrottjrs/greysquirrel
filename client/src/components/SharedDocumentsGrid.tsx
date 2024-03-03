import React, { useEffect, useState } from "react";
import sanitize from "sanitize-html";
import { STYLES } from "../utils/styles/styles";
import { FileText } from "lucide-react";
import DocumentOptionsDropdown from "./DocumentOptionsDropdown";

interface SharedDocument {
  doc_id?: number;
  title?: string;
  content?: string;
  owner: { owner_id?: number; owner_name?: string };
}

export default function SharedDocumentsGrid() {
  const [sharedDocuments, setSharedDocuments] = useState<SharedDocument[]>([]);
  const fetchSharedDocuments = async () => {
    try {
      const response = await fetch("/api/shared-docs");
      const json = await response.json();
      json.success === false
        ? setSharedDocuments([])
        : setSharedDocuments(json.sharedDocs);
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  useEffect(() => {
    fetchSharedDocuments();
  }, []);

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
      <div
        className="relative flex flex-row justify-between h-24 p-4 my-4 border-solid border border-dustyGray rounded-lg overflow-hidden"
        key={doc_id}
      >
        <a className="no-underline text-nero" href={`#/editor/${doc_id}`}>
          <div className="flex flex-row relative mr-4 ">
            <FileText className={STYLES.DOCUMENT_ICON} />
            <div className="flex flex-col">
              <h2 className={STYLES.DOC_HEADER}>{newTitle}</h2>
              <p className={STYLES.PREVIEW}>{newContent}</p>
              <p className="text-sm text-dustyGray">Shared by: {owner_name}</p>
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
