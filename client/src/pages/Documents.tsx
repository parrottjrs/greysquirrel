import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Documents() {
  const [authorization, setAuthorization] = useState(false);
  const navigate = useNavigate();

  const refresh = async (username: string) => {
    try {
      const response = await fetch("/api/refresh", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: username }),
      });
      const json = await response.json();
      return json;
    } catch (err) {
      console.error(err);
    }
  };
  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      const json = await response.json();
      switch (json.message) {
        case "Authorized":
          setAuthorization(true);
          break;
        case "Unauthorized":
          const auth = await refresh(json.username);
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
    } catch (err) {
      console.error(err);
    }
  };
  const logout = async () => {
    try {
      await fetch("/api/logout");
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  fetchDocuments();
  return (
    authorization && (
      <div>
        <button onClick={() => logout()}>Sign out</button>
        <h1>Documents</h1>
        <a href="#/editor">Create Document</a>
      </div>
    )
  );
}
