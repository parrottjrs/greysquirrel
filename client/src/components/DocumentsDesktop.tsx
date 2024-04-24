import React from "react";
import { useDocumentManagement } from "../hooks/useDocumentManagement";
import {
  GENERIC_HEADER,
  PARENT_CONTAINER,
  SMALL_GREEN_BUTTON,
} from "../styles/GeneralStyles";
import {
  DOCUMENTS_SWITCH_OFF,
  DOCUMENTS_SWITCH_ON,
} from "../styles/DocPageStyles";
import DocumentsGrid from "./DocumentsGrid";
import SharedDocumentsGrid from "./SharedDocumentsGrid";
import Navbar from "./Navbar";

export default function DocumentsDesktop() {
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
      <div>
        <Navbar isLoggedIn={true} />
        <div className={PARENT_CONTAINER}>
          <div className="flex flex-row items-center justify-between">
            <h1 className={`${GENERIC_HEADER} mb-10`}>Documents</h1>
            <button
              className={SMALL_GREEN_BUTTON}
              onClick={handleCreateDocument}
            >
              New Document
            </button>
          </div>
          <div>
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
              Shared Documents
            </button>
          </div>
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
