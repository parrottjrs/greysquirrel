import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function AwaitingVerification() {
  const params = useParams();
  const navigate = useNavigate();
  const emailToken = params.emailToken;
  const location = useLocation();
  // const { userName, email } = location.state;

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
      navigate("/documents");
    }
  };

  const handleVerification = async (emailToken: string | undefined) => {
    await verification(emailToken);
  };

  useEffect(() => {
    handleVerification(emailToken);
  });

  return (
    <div>
      <p>
        Please check your email, for a verification link.\n Not the right email?{" "}
        <button>Click Here</button>
      </p>
    </div>
  );
}
