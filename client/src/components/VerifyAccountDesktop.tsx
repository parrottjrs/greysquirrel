import React from "react";
import { VerifyAccountProps } from "../utils/customTypes";
import {
  ALERT_DIV,
  ALERT_TEXT,
  FLEX_COL_CENTER,
  GENERIC_HEADER,
  GENERIC_PARAGRAPH,
  GREEN_BUTTON_STRETCH,
  SMALL_GREEN_BUTTON,
  STYLIZED_ANCHOR_GREEN,
} from "../styles/GeneralStyles";
import ExclamationMark from "./ExclamationMark";

export default function VerifyAccountDesktop({
  verified,
  sent,
  sendNewToken,
  tokenExpired,
  createDocument,
}: VerifyAccountProps) {
  return (
    <div className={"mt-32 flex flex-row items-center justify-center"}>
      {!verified ? (
        <div className={`${FLEX_COL_CENTER} w-96`}>
          <h1 className={GENERIC_HEADER}>Verify your account</h1>
          <p className="text-nero text-lg font-medium text-center">
            A confirmation was sent to your email on file and will arrive
            shortly. Please check your spam folder if you haven't received it.
          </p>
          <div className={FLEX_COL_CENTER}>
            <button className={SMALL_GREEN_BUTTON} onClick={sendNewToken}>
              Send a new link
            </button>
            {tokenExpired && (
              <div className={ALERT_DIV}>
                <span className="mr-2">
                  <ExclamationMark />
                </span>
                <p className={ALERT_TEXT}>
                  Verification token expired. Click the button above to receive
                  a new one.
                </p>
              </div>
            )}
            {sent && (
              <p className={GENERIC_PARAGRAPH}>A new email has been sent!</p>
            )}
          </div>
          <p className="text-nero text-sm text-center">
            *Verification helps you update things like email and password
          </p>
        </div>
      ) : (
        <div className={`${FLEX_COL_CENTER} mt-24 w-96`}>
          <h1 className={GENERIC_HEADER}>Your account is verified!</h1>
          <p className="text-nero text-lg font-medium text-center mb-8">
            Click the link below to create your first document.
          </p>
          <button className={GREEN_BUTTON_STRETCH} onClick={createDocument}>
            Create a document
          </button>
        </div>
      )}
    </div>
  );
}
