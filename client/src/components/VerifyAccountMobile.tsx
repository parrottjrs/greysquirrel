import React from "react";
import {
  ALERT_DIV,
  ALERT_TEXT,
  FLEX_COL_CENTER,
  FLEX_COL_CENTER_MOBILE,
  FLEX_COL_LEFT,
  GENERIC_HEADER,
  GENERIC_PARAGRAPH,
  GREEN_BUTTON_STRETCH,
  INSTRUCTIONS,
  MD_VIOLET_TEXT,
} from "../styles/GeneralStyles";
import { NAVBAR_TITLE_TEXT } from "../styles/NavbarStyles";
import ExclamationMark from "./ExclamationMark";
import { useVerifyAccountManagement } from "../hooks/useVerifyAccountManagement";

export default function VerifyAccountMobile() {
  const {
    verified,
    sent,
    sendNewEmailToken,
    tokenIsExpired,
    handleCreateDocument,
  } = useVerifyAccountManagement();
  return (
    <div className={FLEX_COL_CENTER_MOBILE}>
      {!verified ? (
        <div className={FLEX_COL_LEFT}>
          <h1 className={NAVBAR_TITLE_TEXT}>Greysquirrel</h1>
          <h2 className={GENERIC_HEADER}>Verify your account</h2>
          <p className={GENERIC_PARAGRAPH}>
            A confirmation was sent to your email on file and will arrive
            shortly. Please check your spam folder if you haven't received it.
          </p>
          <div className={FLEX_COL_CENTER}>
            <button
              className={GREEN_BUTTON_STRETCH}
              onClick={sendNewEmailToken}
            >
              Send a new link
            </button>
            {tokenIsExpired && (
              <div className={ALERT_DIV}>
                <span className="mr-2">
                  <ExclamationMark />
                </span>
                <p className={ALERT_TEXT}>
                  Verification token expired. Click the button above to receive
                  a new one.
                </p>
              </div>
            )}{" "}
            {sent && (
              <p className={MD_VIOLET_TEXT}>A new email has been sent!</p>
            )}
          </div>

          <p className={INSTRUCTIONS}>
            * Verification is for security purposes only and not intended for
            advertising or general communication
          </p>
        </div>
      ) : (
        <div className={FLEX_COL_CENTER_MOBILE}>
          <div className={FLEX_COL_LEFT}>
            <h1 className={NAVBAR_TITLE_TEXT}>Greysquirrel</h1>
            <h1 className={GENERIC_HEADER}>Your account is verified!</h1>
            <p className={GENERIC_PARAGRAPH}>
              Click the link below to create your first document.
            </p>
            <button
              className={GREEN_BUTTON_STRETCH}
              onClick={handleCreateDocument}
            >
              Create a document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
