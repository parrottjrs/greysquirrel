import Navbar from "./Navbar";
import SharedDocsGridDesktop from "./SharedDocsGridDesktop";
import DocsGrid from "./DocsGrid";
import { useDocumentManagement } from "../hooks/useDocumentManagement";
import {
  GENERIC_HEADER,
  GENERIC_PARAGRAPH,
  SMALL_GREEN_BUTTON,
} from "../styles/GeneralStyles";
import {
  DOCS_PARENT_LARGE,
  DOCUMENTS_SWITCH_OFF,
  DOCUMENTS_SWITCH_ON,
} from "../styles/DocPageStyles";

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
      <>
        <Navbar isLoggedIn={true} />
        <div className={DOCS_PARENT_LARGE}>
          <div className="flex flex-row items-center justify-between">
            <h1 className={`${GENERIC_HEADER} mb-10`}>Documents</h1>
            <button
              className={SMALL_GREEN_BUTTON}
              onClick={handleCreateDocument}
            >
              New Document
            </button>
          </div>
          <div className="flex flex-row gap-[26px]">
            <button
              className={
                showOwnedDocuments ? DOCUMENTS_SWITCH_ON : DOCUMENTS_SWITCH_OFF
              }
              onClick={() => setShowOwnedDocuments(true)}
            >
              My documents
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
          <div className="flex flex-col gap-[17px]">
            <span className={GENERIC_PARAGRAPH}>Files</span>{" "}
            {showOwnedDocuments ? (
              <DocsGrid documents={documents} setDocuments={setDocuments} />
            ) : (
              <SharedDocsGridDesktop
                sharedDocuments={sharedDocuments}
                setSharedDocuments={setSharedDocuments}
              />
            )}
          </div>
        </div>
      </>
    )
  );
}
