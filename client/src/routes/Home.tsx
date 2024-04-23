import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { authenticate } from "../utils/functions";
import { useNavigate } from "react-router-dom";
import squirrel from "../images/squirrel.png";
import {
  GENERIC_HEADER,
  GENERIC_PARAGRAPH,
  STYLIZED_ANCHOR_GREEN,
} from "../utils/styles/GeneralStyles";

export default function Home() {
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
      <Navbar />
      <div className="h-screen  flex flex-row items-center justify-center">
        <div className="w-96 mr-28">
          <h1 className={GENERIC_HEADER}>Welcome to Greysquirrel</h1>
          <p className={GENERIC_PARAGRAPH}>
            Greysquirrel is a seamless web app designed to simplify the way you
            and your team work together on shared documents. Unlike the rest,
            we've crafted a special experience that's intuitive and keeps the
            amount of noise on your screen to a minimum so you can focus on what
            matters.
          </p>
          <a href="#/signup" className={STYLIZED_ANCHOR_GREEN}>
            Get started
          </a>
        </div>
        <img src={squirrel} className="w-72 h-72" />
      </div>
    </div>
  );
}
