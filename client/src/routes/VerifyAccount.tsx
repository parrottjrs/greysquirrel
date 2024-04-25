import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import VerifyAccountMobile from "../components/VerifyAccountMobile";
import { useBreakpoints } from "../hooks/useBreakpoints";
import VerifyAccountDesktop from "../components/VerifyAccountDesktop";

export default function VerifyAccount() {
  const { isMobile } = useBreakpoints();

  return !isMobile ? (
    <>
      <Navbar />
      <VerifyAccountDesktop />
    </>
  ) : (
    <VerifyAccountMobile />
  );
}
