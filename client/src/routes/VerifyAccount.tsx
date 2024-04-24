import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import VerifyAccountMobile from "../components/VerifyAccountMobile";
import HomeDesktop from "../components/HomeDesktop";
import { useBreakpoints } from "../hooks/useBreakpoints";
import VerifyAccountDesktop from "../components/VerifyAccountDesktop";

export default function VerifyAccount() {
  const { isMobile } = useBreakpoints();
  const navigate = useNavigate();
  const params = useParams();
  let emailToken = params.emailToken;

  const [verified, setVerified] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
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
      setTokenExpired(true);
    }
    setTokenExpired(false);
    setVerified(true);
  };

  const handleVerification = async (emailToken: string | undefined) => {
    setSent(false);
    setTokenExpired(false);
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
    if (emailToken) {
      handleVerification(emailToken);
    }
  }, [emailToken]);

  const handleClick = async () => {
    const id = await fetchCreate();
    navigate(`/editor/${id}`);
  };

  return (
    <>
      {isMobile && (
        <VerifyAccountMobile
          verified={verified}
          sent={sent}
          sendNewToken={sendNewEmailToken}
          tokenExpired={tokenExpired}
          createDocument={handleClick}
        />
      )}
      {!isMobile && (
        <>
          <Navbar />
          <VerifyAccountDesktop
            verified={verified}
            sent={sent}
            sendNewToken={sendNewEmailToken}
            tokenExpired={tokenExpired}
            createDocument={handleClick}
          />
        </>
      )}
    </>
  );
}
