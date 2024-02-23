import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function VerifyEmail() {
  const params = useParams();
  let emailToken = params.emailToken;

  const [verified, setVerified] = useState(false);
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
    if (json.success) {
      setVerified(true);
    }
  };

  const handleVerification = async (emailToken: string | undefined) => {
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

  useEffect(() => {
    if (emailToken) {
      handleVerification(emailToken);
    }
  }, []);

  return (
    <div>
      {!verified ? (
        <div>
          {sent && <p>A new email has been sent!</p>}
          <p>
            Please check your email and follow the link provided to verify your
            account.
          </p>
          <div>
            <p>Need another link?</p>
            <button onClick={() => sendNewEmailToken()}>Click Here</button>
          </div>
        </div>
      ) : (
        <div>
          <p>
            Your account has been verified! Click the link below to create your
            first document.
          </p>
          <a href="#/documents">DOCUMENTS</a>
        </div>
      )}
    </div>
  );
}
