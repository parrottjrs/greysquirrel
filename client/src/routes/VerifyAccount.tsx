import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  ALERT_DIV,
  ALERT_TEXT,
  FLEX_COL_CENTER,
  FLEX_COL_CENTER_MOBILE,
  FLEX_COL_LEFT,
  GENERIC_HEADER,
  GENERIC_PARAGRAPH,
  GREEN_BUTTON_STRETCH,
  INSTRUCTIONS,
  SMALL_GREEN_BUTTON,
  STYLIZED_ANCHOR_GREEN,
  STYLIZED_ANCHOR_GREEN_MOBILE,
} from "../styles/GeneralStyles";
import { Breakpoints } from "../hooks/breakpoints";
import { NAVBAR_TITLE_TEXT } from "../styles/NavbarStyles";
import ExclamationMark from "../components/ExclamationMark";
import VerifyAccountMobile from "../components/VerifyAccountMobile";
import HomeDesktop from "../components/HomeDesktop";

export default function VerifyAccount() {
  const { isMobile } = Breakpoints();
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
    <div>
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
        <div>
          <Navbar />
          <HomeDesktop />
        </div>
      )}
    </div>
  );
}
