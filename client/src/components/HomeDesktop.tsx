import squirrel from "../images/squirrel.png";
import Navbar from "./Navbar";
import {
  GENERIC_PARAGRAPH,
  STYLIZED_ANCHOR_GREEN,
} from "../styles/GeneralStyles";

export default function HomeDesktop() {
  return (
    <>
      <Navbar />
      <div className="mx-auto mt-[249px] lg:mt-[239px] -mr-[15px] pl-[24px] flex flex-row items-center justify-center gap-[66px]">
        <div className="w-[381px] lg:w-[544px] flex flex-col items-start gap-[43px]">
          <h1 className="m-0 text-[24px] lg:text-[42px] text-nero font-IBM font-medium">
            Welcome to Greysquirrel
          </h1>
          <p className={`${GENERIC_PARAGRAPH} m-0`}>
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
        <img
          src={squirrel}
          className="h-[263px] w-[263px] lg:h-[345px] lg:w-[345px]"
        />
      </div>
    </>
  );
}
