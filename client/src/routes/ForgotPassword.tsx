import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { ForgotPasswordRequest } from "../components/ForgotPasswordRequest.tsx";
import { PasswordReset } from "../components/PasswordReset";
import { useEmailTokenManagement } from "../hooks/useEmailTokenManagement";

export default function ForgotPassword() {
  const { isMobile } = useBreakpoints();
  const { resetIsVerified } = useEmailTokenManagement();

  return (
    <>
      {!isMobile && <Navbar />}
      {!resetIsVerified ? <ForgotPasswordRequest /> : <PasswordReset />}
    </>
  );
}
