import React from "react";
import {
  FLEX_CENTER_LARGE,
  FLEX_COL_LEFT,
  GENERIC_HEADER,
  GENERIC_PARAGRAPH,
  GREEN_BUTTON_STRETCH,
  MD_VIOLET_TEXT,
  SMALLER_HEADER,
  STYLIZED_ANCHOR_GREEN,
  STYLIZED_ANCHOR_GREEN_MOBILE,
} from "../styles/GeneralStyles";
import { useBreakpoints } from "../hooks/useBreakpoints";
import Navbar from "./Navbar";

export default function PrivacyContents() {
  const { isMobile } = useBreakpoints();
  return (
    <>
      {!isMobile && <Navbar />}
      <div className={`${FLEX_COL_LEFT} md:my-[160px]`}>
        {isMobile && <h1 className={GENERIC_HEADER}>Greysquirrel</h1>}
        <h2 className={GENERIC_HEADER}>Privacy Policy</h2>
        <p className={GENERIC_PARAGRAPH}>
          Thank you for choosing Greysuirrel. This Privacy Policy outlines how
          we collect, use, and protect the personal information you provide when
          signing up for and using our app.
        </p>
        <h3 className={SMALLER_HEADER}>Information Collection</h3>
        <p className={GENERIC_PARAGRAPH}>
          When you sign up for Greysquirrel, we collect the following personal
          information:
        </p>
        <ul>
          <li className={GENERIC_PARAGRAPH}>First name</li>
          <li className={GENERIC_PARAGRAPH}>Last name (optional)</li>
          <li className={GENERIC_PARAGRAPH}>Username</li>
          <li className={GENERIC_PARAGRAPH}>Email address</li>
          <li className={GENERIC_PARAGRAPH}>Password</li>{" "}
        </ul>
        <h3 className={SMALLER_HEADER}>Use of Information</h3>
        <p className={GENERIC_PARAGRAPH}>
          We use the information collected to:
        </p>
        <ul>
          <li className={GENERIC_PARAGRAPH}>Create and manage your account.</li>
          <li className={GENERIC_PARAGRAPH}>
            Provide personalized user experiences.
          </li>
          <li className={GENERIC_PARAGRAPH}>
            Communicate with you about account-related matters and updates.
          </li>
          <li className={GENERIC_PARAGRAPH}>
            Improve our services and develop new features.
          </li>
        </ul>
        <p className={GENERIC_PARAGRAPH}>
          We do not share your personal information with third parties, except
          as necessary for providing our services or as required by law.
        </p>
        <h3 className={SMALLER_HEADER}>Data Security</h3>
        <p className={GENERIC_PARAGRAPH}>
          We take measures to protect the security of your personal information,
          including encryption and secure server infrastructure. Your password
          is hashed and stored securely, and we recommend choosing a strong and
          unique password.
        </p>
        <h3 className={SMALLER_HEADER}>User Rights</h3>
        <p className={GENERIC_PARAGRAPH}>
          You have the right to access, correct, or delete your personal
          information at any time. You can manage your account information by
          logging into your account settings or contacting our customer support
          team (email provided below).
        </p>
        <h3 className={SMALLER_HEADER}>Cookies</h3>
        <p className={GENERIC_PARAGRAPH}>
          We use cookies to enable secure authentication and user sessions
          within our app. These cookies are necessary for the proper functioning
          of the app and are not used for tracking purposes.
        </p>
        <h3 className={SMALLER_HEADER}>Changes to Privacy Policy</h3>
        <p className={GENERIC_PARAGRAPH}>
          We may update this Privacy Policy periodically to reflect changes in
          our practices or legal requirements. We will notify you of any
          significant changes to the policy through the app or via email.
        </p>
        <h3 className={SMALLER_HEADER}>Contact Information</h3>
        <p className={GENERIC_PARAGRAPH}>
          <span></span>If you have any questions or concerns about our Privacy
          Policy or our data practices, please contact us at
          <a
            className="ml-2 text-vividViolet text-[18px] lg:text-[24px] font-IBM font-medium no-underline"
            href="mailto:greysquirrelmgmt@gmail.com"
          >
            greysquirrelmgmt@gmail.com
          </a>
          .
        </p>
        {isMobile && (
          <a href="/" className={`${STYLIZED_ANCHOR_GREEN_MOBILE} my-[36px]`}>
            Home
          </a>
        )}
      </div>
    </>
  );
}
