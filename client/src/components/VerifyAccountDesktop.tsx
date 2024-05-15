import ExclamationMark from "./ExclamationMark";
import { useEmailTokenManagement } from "../hooks/useEmailTokenManagement";
import Navbar from "./Navbar";
import {
  ALERT_DIV,
  ALERT_TEXT,
  FLEX_CENTER_LARGE,
  FORM_INNER_CONTAINER,
  GREEN_BUTTON_STRETCH,
  SMALLER_HEADER,
  WELCOME_HEADER,
} from "../styles/GeneralStyles";

export default function VerifyAccountDesktop() {
  const {
    accountIsVerified,
    sent,
    sendNewEmailToken,
    tokenIsExpired,
    handleCreateDocument,
  } = useEmailTokenManagement();

  return (
    <>
      <Navbar />
      {!accountIsVerified ? (
        <div className={FLEX_CENTER_LARGE}>
          <h1 className={SMALLER_HEADER}>Verify your account</h1>
          <p className="text-[18px] text-nero font-IBM">
            A confirmation was sent to your email on file and will arrive
            shortly. Please check your spam folder if you haven't received it.
          </p>
          <div className={FORM_INNER_CONTAINER}>
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
            )}
            {sent && (
              <p className="text-[18px] text-nero font-IBM">
                A new email has been sent
              </p>
            )}
          </div>
          <p className="text-nero text-[14px] font-IBM font-medium">
            * Verification helps you update things like email and password
          </p>
        </div>
      ) : (
        <div className={FLEX_CENTER_LARGE}>
          <h1 className={WELCOME_HEADER}>Your account is verified!</h1>
          <p className="text-[18px] text-nero font-IBM">
            Click the link below to create your first document.
          </p>
          <button
            className={GREEN_BUTTON_STRETCH}
            onClick={handleCreateDocument}
          >
            Create a document
          </button>
        </div>
      )}
    </>
  );
}
