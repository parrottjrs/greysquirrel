import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function VerifyEmail() {
  const params = useParams();
  const navigate = useNavigate();
  const emailToken = params.emailToken;
  const location = useLocation();
  const [verified, setVerified] = useState(false);
  const { userName, email } = location.state;

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
      // navigate("/documents");
    }
  };

  const handleVerification = async (emailToken: string | undefined) => {
    await verification(emailToken);
  };

  useEffect(() => {
    if (emailToken) {
      handleVerification(emailToken);
    }
  });

  return (
    <div>
      {!verified ? (
        <div>
          {" "}
          <p>Please check your email, for a verification link.</p>
          <div>
            <p>Need another link?</p>
            <button>Click Here</button>
          </div>
        </div>
      ) : (
        <div>
          <p>
            Your account has been verified! Click the link below to create your
            first document!
          </p>
          <a href="/documents">DOCUMENTS</a>
        </div>
      )}
    </div>
  );
}
