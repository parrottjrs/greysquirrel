import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import DocumentsGrid from "../components/DocumentsGrid";
import SharedDocumentsGrid from "../components/SharedDocumentsGrid";
import { authenticate, refresh } from "../utils/functions";
import Navbar from "../components/Navbar";
import { STYLES } from "../utils/styles";
import { SharedDocument, UserDocument } from "../utils/customTypes";

// export interface Document {
//   doc_id?: number;
//   title?: string;
//   content?: string;
//   authorizedUsers: string[];
//   last_edit: string;
// }
// interface SharedDocument {
//   doc_id?: number;
//   title?: string;
//   content?: string;
//   owner: { owner_id?: number; owner_name?: string };
// }

export default function Documents() {
  const refreshTokenDelay = 540000; //nine minutes;
  const [authorization, setAuthorization] = useState(false);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [sharedDocuments, setSharedDocuments] = useState<SharedDocument[]>([]);
  const [showOwnedDocuments, setShowOwnedDocuments] = useState(true);
  const navigate = useNavigate();

  const refreshToken = async () => {
    try {
      const { success } = await refresh();
      if (!success) {
        navigate("/signin");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const authenticateUser = async () => {
    try {
      const authorized = await authenticate();
      if (!authorized) {
        navigate("/signin");
      }
      setAuthorization(true);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      const json = await response.json();
      if (json.success) {
        setDocuments(json.docs);
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

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

  const fetchCreate = async () => {
    const response = await fetch("/api/create", {
      method: "POST",
      headers: { "content-type": "application /json" },
    });
    const json = await response.json();
    return json.docId;
  };

  const handleClick = async () => {
    const id = await fetchCreate();
    navigate(`/editor/${id}`);
  };

  useEffect(() => {
    let interval = setInterval(() => refreshToken(), refreshTokenDelay);
    return () => clearInterval(interval);
  }, [authorization]);

  useEffect(() => {
    authenticateUser();
    fetchDocuments();
    fetchSharedDocuments();
  }, []);

  return (
    authorization && (
      <div>
        <Navbar isLoggedIn={true} />
        <LogoutButton />
        <div className={STYLES.DOCUMENTS_CONTAINER}>
          <div className="flex flex-row items-center justify-between">
            <h1 className={`${STYLES.WELCOME_HEADER} mb-10`}>Documents</h1>
            <button className={STYLES.CREATE_BUTTON} onClick={handleClick}>
              New Document
            </button>
          </div>
          <div>
            <button
              className={
                showOwnedDocuments
                  ? STYLES.DOCUMENTS_SWITCH_SELECTED
                  : STYLES.DOCUMENTS_SWITCH
              }
              onClick={() => setShowOwnedDocuments(true)}
            >
              My Documents
            </button>
            <button
              className={
                !showOwnedDocuments
                  ? STYLES.DOCUMENTS_SWITCH_SELECTED
                  : STYLES.DOCUMENTS_SWITCH
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
