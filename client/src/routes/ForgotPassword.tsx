import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { ForgotPasswordRequest } from "../components/ForgotPasswordRequest.tsx";
import { PasswordReset } from "../components/PasswordReset";

export default function ForgotPassword() {
  const params = useParams();
  const verificationToken = params.verificationToken;
  const [verified, setVerified] = useState(false);
  const { isMobile } = useBreakpoints();

  useEffect(() => {
    if (verificationToken) {
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
      verifyUser();
    }
  }, [verificationToken]);

  return (
    <>
      {!isMobile && <Navbar />}
      {!verified ? <ForgotPasswordRequest /> : <PasswordReset />}
    </>
  );
}
