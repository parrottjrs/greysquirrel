import React from "react";
import { NAVBAR_TITLE_TEXT } from "../styles/NavbarStyles";
import squirrel from "../images/squirrel.png";
import {
  GENERIC_PARAGRAPH,
  STYLIZED_ANCHOR_GREEN_MOBILE,
} from "../styles/GeneralStyles";

export default function HomeMobile() {
  return (
    <div className="flex flex-col items-center mx-[32px] mt-[47px]">
      <div className="w-full flex items-start">
        <h1 className={NAVBAR_TITLE_TEXT}>Greysquirrel</h1>
      </div>
      <img src={squirrel} className="ml-6 mb-10 mt-10 w-64 h-64" />
      <a href="#/signup" className={STYLIZED_ANCHOR_GREEN_MOBILE}>
        Get started
      </a>
      <div className="w-[358px] mt-6">
        <h1 className="text-nero text-[24px] font-IBM font-medium">
          Welcome to Greysquirrel
        </h1>
        <p className={GENERIC_PARAGRAPH}>
          Greysquirrel is a seamless web app designed to simplify the way you
          and your team work together on shared documents. Unlike the rest,
          we've crafted a special experience that's intuitive and keeps the
          amount of noise on your screen to a minimum so you can focus on what
          matters.
        </p>
      </div>
    </div>
  );
}
