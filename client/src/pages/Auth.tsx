import React from "react";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();

  const checkForTokens = async () => {
    try {
      const response = await fetch("/api/authenticate");
      const json = await response.json();
      if (json.message === "Authorized") {
        navigate(`/documents`);
      } else {
        navigate(`/home`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  checkForTokens();

  return <div />;
}
