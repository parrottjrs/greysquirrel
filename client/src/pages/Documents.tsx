import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import DocumentsGrid from "../components/DocumentsGrid";

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

  authenticate();

  return (
    authorization && (
      <div>
        <LogoutButton />
        <h1>Documents</h1>
        <DocumentsGrid />
        <button>
          <a href="#/editor">Create Document</a>
        </button>
      </div>
    )
  );
}
