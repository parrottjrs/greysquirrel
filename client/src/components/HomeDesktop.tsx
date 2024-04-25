import React from "react";
import squirrel from "../images/squirrel.png";
import {
  GENERIC_HEADER,
  GENERIC_PARAGRAPH,
  STYLIZED_ANCHOR_GREEN,
} from "../styles/GeneralStyles";

export default function HomeDesktop() {
  return (
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
  );
}
