import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

export default function Documents() {
  const [authorization, setAuthorization] = useState(false);
  const navigate = useNavigate();

  const refresh = async (userId: number) => {
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

  const handleFetchDocuments = async (json: any) => {
    const { message, userId } = json;
    switch (message) {
      case "Authorized":
        setAuthorization(true);
        break;
      case "Unauthorized":
        const auth = await refresh(userId);
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

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/authenticate");
      const json = await response.json();
      handleFetchDocuments(json);
    } catch (err) {
      console.error(err);
    }
  };

  fetchDocuments();

  return (
    authorization && (
      <div>
        <LogoutButton />
        <h1>Documents</h1>
        <button>
          <a href="#/editor">Create Document</a>
        </button>
      </div>
    )
  );
}
