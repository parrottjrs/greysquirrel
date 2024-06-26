import { useDocumentManagement } from "../hooks/useDocumentManagement";
import MobileNavbar from "./MobileNavbar";
import DocsGrid from "./DocsGrid";
import SharedDocsGridMobile from "./SharedDocsGridMobile";
import {
  FLEX_COL_CENTER_MOBILE,
  GENERIC_PARAGRAPH,
} from "../styles/GeneralStyles";
import {
  DOCUMENTS_SWITCH_OFF,
  DOCUMENTS_SWITCH_ON,
  NEW_DOC_MOBILE,
} from "../styles/DocPageStyles";

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
      <div className={`${FLEX_COL_CENTER_MOBILE} gap-[52px]`}>
        <div className="flex flex-col items-left gap-[25px]">
          <MobileNavbar />
          <h1 className="mb-0 text-nero text-[42px] font-IBM font-medium">
            My Documents
          </h1>
          <button className={NEW_DOC_MOBILE} onClick={handleCreateDocument}>
            New Document
          </button>
        </div>

        <div className="flex flex-row gap-[16px]">
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
          <span className={GENERIC_PARAGRAPH}>Files</span>
          {showOwnedDocuments ? (
            <DocsGrid documents={documents} setDocuments={setDocuments} />
          ) : (
            <SharedDocsGridMobile
              sharedDocuments={sharedDocuments}
              setSharedDocuments={setSharedDocuments}
            />
          )}
        </div>
      </div>
    )
  );
}
