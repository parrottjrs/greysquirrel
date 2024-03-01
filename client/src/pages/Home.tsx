import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { authenticate } from "../utils/functions";
import { useNavigate } from "react-router-dom";
import squirrel from "../images/squirrel.png";
import { STYLES } from "../utils/styles/styles";

export default function Home() {
  const hasSignedUp =
    JSON.parse(JSON.stringify(localStorage.getItem("hasSignedUp"))) === "true"
      ? true
      : false;

  const navigate = useNavigate();
  const authenticateUser = async () => {
    try {
      const authorized = await authenticate();
      if (authorized) {
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
      <Navbar isLoggedIn={false} />
      <div className={STYLES.HOME_PARENT_CONTAINER}>
        <div className={STYLES.HOME_WELCOME_CONTAINER}>
          <h1 className={STYLES.WELCOME_HEADER}>Welcome to Greysquirrel</h1>
          <p className={STYLES.PARAGRAPH}>
            Greysquirrel is a seamless web app designed to simplify the way you
            and your team work together on shared documents. Unlike the rest,
            we've crafted a special experience that's intuitive and keeps the
            amount of noise on your screen to a minimum so you can focus on what
            matters.
          </p>
          <a href="#/signup" className={STYLES.STYLIZED_ANCHOR}>
            Get started
          </a>
        </div>
        <img src={squirrel} className={STYLES.SQUIRREL_IMAGE} />
      </div>
    </div>
  );
}
