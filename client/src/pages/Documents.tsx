import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import DocumentsGrid from "../components/DocumentsGrid";
import Invites from "../components/Invites";
import SharedDocumentsGrid from "../components/SharedDocumentsGrid";

export default function Documents() {
  const [authorization, setAuthorization] = useState(false);

  const navigate = useNavigate();

  const refresh = async () => {
    try {
      const response = await fetch("/api/refresh", {
        method: "POST",
      });
      const json = await response.json();
      return json;
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthenticate = async (message: any) => {
    switch (message) {
      case "Authorized":
        setAuthorization(true);
        break;
      case "Unauthorized":
        const auth = await refresh();
        if (auth.message === "Unauthorized") {
          setAuthorization(false);
          navigate("/expired");
        }
        setAuthorization(true);
        break;
      default:
        console.error("An unexpected error has occurred");
        break;
    }
  };

  const authenticate = async () => {
    try {
      const response = await fetch("/api/authenticate");
      const json = await response.json();
      handleAuthenticate(json.message);
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
    navigate(`/editor/${id}`);
  };

  useEffect(() => {
    authenticate();
  }, []);

  return (
    authorization && (
      <div>
        <Invites />
        <LogoutButton />
        <h1>Documents</h1>
        <DocumentsGrid />
        <h2>Shared Documents</h2>
        <SharedDocumentsGrid />
        <button onClick={handleClick}>Create Document</button>
      </div>
    )
  );
}
