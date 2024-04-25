import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const useVerifyAccountManagement = () => {
  const navigate = useNavigate();
  const params = useParams();

  const [verified, setVerified] = useState(false);
  const [tokenIsExpired, setTokenIsExpired] = useState(false);
  const [sent, setSent] = useState(false);

  const verification = async (emailToken: string | undefined) => {
    const response = await fetch("/api/verify-user", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ emailToken: emailToken }),
    });
    const json = await response.json();
    if (!json.success) {
      setTokenIsExpired(true);
    }
    setTokenIsExpired(false);
    setVerified(true);
  };

  const handleVerification = async () => {
    const emailToken = params.emailToken;
    setSent(false);
    setTokenIsExpired(false);
    await verification(emailToken);
  };

  const sendNewEmailToken = async () => {
    try {
      const response = await fetch("/api/resend-verification-email", {
        method: "POST",
      });
      const json = await response.json();
      if (json.success) {
        setSent(true);
      }
    } catch (err) {
      console.error(
        "An unexpected error has occurred. Please try again later."
      );
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

  useEffect(() => {
    if (params.emailToken) {
      handleVerification();
    }
  }, [params.emailToken]);

  const handleCreateDocument = async () => {
    const id = await fetchCreate();
    navigate(`/editor/${id}`);
  };

  return {
    verified,
    sent,
    sendNewEmailToken,
    tokenIsExpired,
    handleCreateDocument,
  };
};
