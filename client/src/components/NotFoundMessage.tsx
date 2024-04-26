import {
  FLEX_COL_CENTER_MOBILE,
  FLEX_COL_LEFT,
  GENERIC_HEADER,
  GENERIC_PARAGRAPH,
  PLAIN_BORDERLESS_BUTTON,
} from "../styles/GeneralStyles";

export default function NotFoundMessage() {
  return (
    <div className={`${FLEX_COL_CENTER_MOBILE} gap-[46px]`}>
      <div className={FLEX_COL_LEFT}>
        <h1 className={GENERIC_HEADER}>Greysquirrel</h1>

        <h2 className={"text-nero text-[42px] font-IBM font-bold "}>404</h2>
        <p className="text-nero text-[42px] font-IBM">
          Oops, the page you are looking for does not exist
        </p>
        <p className={GENERIC_PARAGRAPH}>
          You may want to head back to the home page
        </p>
      </div>
      <a aria-label="return-home" href="#/signIn">
        <button className={PLAIN_BORDERLESS_BUTTON}>Go back to Home</button>
      </a>
    </div>
  );
}
