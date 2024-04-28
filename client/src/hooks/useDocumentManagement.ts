import { useEffect, useState } from "react";
import { SharedDocument, UserDocument } from "../utils/customTypes";
import { useNavigate } from "react-router-dom";
import { authenticate, refresh } from "../utils/functions";

export const useDocumentManagement = () => {
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
      const { success } = await authenticate();
      if (!success) {
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

  const handleCreateDocument = async () => {
    const id = await fetchCreate();
    navigate(`/edit/${id}`);
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

  return {
    authorization,
    setAuthorization,
    documents,
    setDocuments,
    sharedDocuments,
    setSharedDocuments,
    showOwnedDocuments,
    setShowOwnedDocuments,
    handleCreateDocument,
  };
};
