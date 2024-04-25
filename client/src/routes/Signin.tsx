import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

import { useBreakpoints } from "../hooks/useBreakpoints";
import SigninMobile from "../components/SigninMobile";
import SigninDesktop from "../components/SigninDesktop";

export default function Signin() {
  const { isMobile } = useBreakpoints();

  return !isMobile ? (
    <>
      <Navbar />
      <SigninDesktop />
    </>
  ) : (
    <SigninMobile />
  );
}
