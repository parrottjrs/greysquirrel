import React, { useEffect } from "react";
import { authenticate } from "../utils/functions";
import { useNavigate } from "react-router-dom";
import squirrel from "../images/squirrel.png";
import {
  GENERIC_HEADER,
  GENERIC_PARAGRAPH,
  STYLIZED_ANCHOR_GREEN,
} from "../styles/GeneralStyles";
import { Breakpoints } from "../hooks/breakpoints";
import HomeMobile from "../components/HomeMobile";
import Navbar from "../components/Navbar";
import HomeDesktop from "../components/HomeDesktop";

export default function Home() {
  const { isMobile, isTablet, isBigScreen } = Breakpoints();
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
    <div>
      {isMobile ? (
        <HomeMobile />
      ) : (
        <div>
          <Navbar />
          <HomeDesktop />
        </div>
      )}
    </div>
  );
}
