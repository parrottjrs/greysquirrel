import { DocumentsGridProps, UserDocument } from "../utils/customTypes";
import { useBreakpoints } from "../hooks/useBreakpoints";
import DocumentItem from "./DocumentItem";
import DocItemMobile from "./DocItemMobile";

export default function DocsGrid({
  documents,
  setDocuments,
}: DocumentsGridProps) {
  const { isMobile } = useBreakpoints();
  return documents.map((document: UserDocument) => {
    return !isMobile ? (
      <DocumentItem
        key={document.doc_id}
        doc={document}
        setDocs={setDocuments}
      />
    ) : (
      <DocItemMobile
        key={document.doc_id}
        doc={document}
        setDocs={setDocuments}
      />
    );
  });
}
