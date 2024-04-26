import React from "react";
import { GENERIC_PARAGRAPH } from "../styles/GeneralStyles";
import {
  DOCUMENTS_SWITCH_OFF,
  DOCUMENTS_SWITCH_ON,
  NEW_DOC_MOBILE,
} from "../styles/DocPageStyles";
import DocumentsGrid from "./DocumentsGrid";
import SharedDocumentsGrid from "./SharedDocumentsGrid";
import { useDocumentManagement } from "../hooks/useDocumentManagement";
import MobileNavbar from "./MobileNavbar";

export default function DocumentsMobile() {
  const {
    authorization,
    documents,
    setDocuments,
    sharedDocuments,
    setSharedDocuments,
    showOwnedDocuments,
    setShowOwnedDocuments,
    handleCreateDocument,
  } = useDocumentManagement();
  return (
    authorization && (
      <div className="mx-[16px] my-[47px]">
        <MobileNavbar />
        <div className="flex flex-col items-center mx-[32px] mt-[47px] gap-[52px]">
          <div className="flex flex-col items-left mt-[20px] gap-[25px]">
            <h1 className="mb-0 text-nero text-[42px] font-IBM font-medium">
              My Documents
            </h1>
            <button className={NEW_DOC_MOBILE} onClick={handleCreateDocument}>
              New Document
            </button>
          </div>

          <div className="flex flex row gap-[16px]">
            <button
              className={
                showOwnedDocuments ? DOCUMENTS_SWITCH_ON : DOCUMENTS_SWITCH_OFF
              }
              onClick={() => setShowOwnedDocuments(true)}
            >
              My Documents
            </button>
            <button
              className={
                !showOwnedDocuments ? DOCUMENTS_SWITCH_ON : DOCUMENTS_SWITCH_OFF
              }
              onClick={() => setShowOwnedDocuments(false)}
            >
              Shared with me
            </button>
          </div>

          <span className={`${GENERIC_PARAGRAPH} -mb-[30px] self-start`}>
            Files
          </span>

          {showOwnedDocuments ? (
            <DocumentsGrid documents={documents} setDocuments={setDocuments} />
          ) : (
            <SharedDocumentsGrid
              sharedDocuments={sharedDocuments}
              setSharedDocuments={setSharedDocuments}
            />
          )}
        </div>
      </div>
    )
  );
}
