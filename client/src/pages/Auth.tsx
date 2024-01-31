import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const checkForTokens = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/authenticate");
      const json = await response.json();
      if (json.message === "Authorized") {
        setLoading(false);
        navigate(`/documents`);
      } else {
        setLoading(false);
        navigate(`/home`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkForTokens();
  }, []);

  return loading ? <div>Gathering information...</div> : null;
}
