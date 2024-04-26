import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import CheckMark from "../components/CheckMark";
import ShowPassword from "../components/ShowPasword";
import ExclamationMark from "../components/ExclamationMark";
import {
  ALERT_DIV,
  ALERT_TEXT,
  BOLD_GRAY_TEXT,
  FLEX_COL_CENTER,
  FLEX_COL_CENTER_MOBILE,
  FLEX_COL_LEFT,
  FORM_INPUT_FIELD,
  FORM_SUBMIT,
  GENERIC_HEADER,
  GENERIC_PARAGRAPH,
  GREEN_BUTTON_STRETCH,
  INPUT_FIELD_GAP,
  INPUT_FIELD_LABEL,
  MD_VIOLET_TEXT,
  SM_VIOLET_TEXT,
  SUCCESS_CONTAINER,
} from "../styles/GeneralStyles";
import { RESET_FAILURE_CONTAINER } from "../styles/ForgotPasswordStyles";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { ForgotPasswordRequest } from "../components/ForgotPasswordRequest.tsx";
import { PasswordReset } from "../components/PasswordReset";

export default function ForgotPassword() {
  const params = useParams();
  const verificationToken = params.verificationToken;
  const [verified, setVerified] = useState(false);
  const { isMobile } = useBreakpoints();
  const verifyUser = async () => {
    const response = await fetch("/api/verify-forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ verificationToken: verificationToken }),
    });
    const json = await response.json();

    if (!json.success) {
      return false;
    }
    setVerified(true);
  };

  useEffect(() => {
    if (verificationToken) {
      verifyUser();
    }
  }, [verificationToken]);

  return (
    <>
      {!isMobile && <Navbar />}
      {!verified ? (
        <ForgotPasswordRequest isMobile={isMobile} />
      ) : (
        <PasswordReset isMobile={isMobile} />
      )}
    </>
  );
}
