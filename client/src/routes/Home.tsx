import React, { useEffect } from "react";
import { authenticate } from "../utils/functions";
import { useNavigate } from "react-router-dom";

import HomeMobile from "../components/HomeMobile";
import Navbar from "../components/Navbar";
import HomeDesktop from "../components/HomeDesktop";
import { useBreakpoints } from "../hooks/useBreakpoints";

export default function Home() {
  const { isMobile } = useBreakpoints();
  const hasSignedUp =
    JSON.parse(JSON.stringify(localStorage.getItem("hasSignedUp"))) === "true"
      ? true
      : false;

  const navigate = useNavigate();

  const authenticateUser = async () => {
    try {
      const { success } = await authenticate();
      if (success) {
        navigate("/documents");
      }
      if (hasSignedUp) {
        navigate("/signIn");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    authenticateUser();
  }, []);

  return (
    <>
      {isMobile ? (
        <HomeMobile />
      ) : (
        <>
          <Navbar />
          <HomeDesktop />
        </>
      )}
    </>
  );
}
