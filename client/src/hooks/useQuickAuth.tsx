import { useNavigate } from "react-router-dom";
import { authenticate } from "../utils/functions";
import { useEffect } from "react";

export const useQuickAuth = () => {
  const navigate = useNavigate();
  const hasSignedUp =
    JSON.parse(JSON.stringify(localStorage.getItem("hasSignedUp"))) === "true";

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const { success } = await authenticate();
        if (success) {
          navigate("/documents");
        }
        if (hasSignedUp) {
          navigate("/signIn");
        }
      } catch (err) {
        navigate("/signIn");
        console.error({
          message: "Error occured during authorization process",
        });
      }
    };
    authenticateUser();
  }, [hasSignedUp, navigate]);
};
