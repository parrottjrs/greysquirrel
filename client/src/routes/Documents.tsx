import React from "react";
import { useBreakpoints } from "../hooks/useBreakpoints";
import DocumentsDesktop from "../components/DocumentsDesktop";
import DocumentsMobile from "../components/DocumentsMobile";

export default function Documents() {
  const { isMobile } = useBreakpoints();
  return <>{isMobile ? <DocumentsMobile /> : <DocumentsDesktop />}</>;
}
