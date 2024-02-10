import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import DocumentsGrid from "../components/DocumentsGrid";
import Invites from "../components/Invites";
import SharedDocumentsGrid from "../components/SharedDocumentsGrid";
import { authenticate } from "../utils/functions";

export default function Documents() {
  const [authorization, setAuthorization] = useState(false);

  const navigate = useNavigate();

  const authenticateUser = async () => {
    try {
      const authorized = await authenticate();
      if (!authorized) {
        navigate("/");
      }
      setAuthorization(true);
    } catch (err) {
      console.error(err);
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
    console.log(id);
    navigate(`/editor/${id}`);
  };

  useEffect(() => {
    authenticateUser();
  }, []);

  return (
    authorization && (
      <div>
        <Invites />
        <LogoutButton />
        <h1>Documents</h1>
        <DocumentsGrid />
        <SharedDocumentsGrid />
        <button onClick={handleClick}>Create Document</button>
      </div>
    )
  );
}
