import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { STYLES } from "../utils/styles/styles";

export default function VerifyEmail() {
  const params = useParams();
  let emailToken = params.emailToken;

  const [verified, setVerified] = useState(false);
  const [sent, setSent] = useState(false);

  const verification = async (emailToken: string | undefined) => {
    const response = await fetch("/api/verify-user", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ emailToken: emailToken }),
    });
    const json = await response.json();
    if (json.success) {
      setVerified(true);
    }
  };

  const handleVerification = async (emailToken: string | undefined) => {
    await verification(emailToken);
  };

  const sendNewEmailToken = async () => {
    try {
      const response = await fetch("/api/resend-verification-email", {
        method: "POST",
      });
      const json = await response.json();
      if (json.success) {
        setSent(true);
      }
    } catch (err) {
      console.error(
        "An unexpected error has occurred. Please try again later."
      );
    }
  };

  useEffect(() => {
    if (emailToken) {
      handleVerification(emailToken);
    }
  }, []);

  return (
    <div>
      <Navbar isLoggedIn={verified ? true : false} />
      <div className="mt-32 flex flex-row items-center justify-center">
        {!verified ? (
          <div className={`${STYLES.FLEX_COL_CENTER} w-96`}>
            <h1 className={STYLES.WELCOME_HEADER}>Verify your account</h1>
            {sent && <p>A new email has been sent!</p>}
            <p className="text-nero text-lg font-medium text-center">
              A confirmation was sent to your email on file and will arrive
              shortly. Please check your spam folder if you haven't received it.
            </p>
            <div className={STYLES.FLEX_COL_CENTER}>
              <button
                className={STYLES.CREATE_BUTTON}
                onClick={() => sendNewEmailToken()}
              >
                Send a new link
              </button>
            </div>
            <p className="text-nero text-sm text-center">
              *Verification helps you update things like email and password
            </p>
          </div>
        ) : (
          <div className={`${STYLES.FLEX_COL_CENTER} mt-24 w-96`}>
            <h1 className={STYLES.WELCOME_HEADER}>Your account is verified!</h1>
            <p className="text-nero text-lg font-medium text-center mb-8">
              Click the link below to create your first document.
            </p>
            <a className={STYLES.STYLIZED_ANCHOR} href="#/editor">
              Create a document
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
