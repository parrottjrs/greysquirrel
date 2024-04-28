import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const useEmailTokenManagement = () => {
  const navigate = useNavigate();
  const params = useParams();

  const [accountIsVerified, setAccountIsVerified] = useState(false);
  const [resetIsVerified, setResetIsVerified] = useState(false);
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
    setAccountIsVerified(true);
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
      headers: { "content-type": "application/json" },
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
    navigate(`/edit/${id}`);
  };

  useEffect(() => {
    if (params.verificationToken) {
      const verifyUser = async () => {
        const response = await fetch("/api/verify-forgot-password", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ verificationToken: params.verificationToken }),
        });
        const json = await response.json();

        if (!json.success) {
          return false;
        }
        setResetIsVerified(true);
      };
      verifyUser();
    }
  }, [params.verificationToken]);
  console.log(
    "emailToken:",
    params.emailToken,
    "passwordToken:",
    params.verificationToken
  );
  return {
    accountIsVerified,
    resetIsVerified,
    sent,
    sendNewEmailToken,
    tokenIsExpired,
    handleCreateDocument,
  };
};
