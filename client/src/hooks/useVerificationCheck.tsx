import { useEffect, useState } from "react";

export const useVerificationCheck = () => {
  const [verified, setVerified] = useState(false);
  const checkUserVerification = async () => {
    const response = await fetch("/api/check-verification-status");
    const { success } = await response.json();
    if (!success) {
      return false;
    }
    setVerified(true);
  };
  useEffect(() => {
    checkUserVerification();
  }, []);
  return { verified };
};
