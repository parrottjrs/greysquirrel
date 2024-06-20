import { useEffect, useState } from "react";
import { apiUrl } from "../utils/consts";

export const useVerificationCheck = () => {
  const [verified, setVerified] = useState(false);
  const checkUserVerification = async () => {
    const response = await fetch(`${apiUrl}/api/user/verification/status`);
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
