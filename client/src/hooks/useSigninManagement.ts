import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { authenticate } from "../utils/functions";
import { SigninFormData } from "../utils/customTypes";

export const useSigninManagement = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  const navigate = useNavigate();

  const authenticateUser = async () => {
    try {
      const { success } = await authenticate();
      if (success) {
        navigate("/documents");
      }
    } catch (err) {
      console.error({ message: "Error occured during authorization process" });
    }
  };

  useEffect(() => {
    authenticateUser();
  }, []);

  const fetchUser = async (data: SigninFormData) => {
    const trimmedData = {
      username: data.username.toLowerCase().trim(),
      password: data.password.trim(),
      remember: data.remember,
    };

    data.username = data.username.toLowerCase();
    try {
      const response = await fetch("/api/signIn", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: trimmedData }),
      });

      const json = await response.json();
      switch (json.message) {
        case "Access granted":
          localStorage.setItem("hasSignedUp", "true");
          navigate(`/documents`);
          break;
        case "Unauthorized: Invalid username and/or password":
          setShowWarning(true);
          break;
        default:
          console.error("an unexpected error has occured.");
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleShowPassword = () => {
    return setShowPassword(!showPassword);
  };

  const onSubmit = (data: SigninFormData) => {
    fetchUser(data);
  };

  return {
    handleSubmit,
    onSubmit,
    register,
    showPassword,
    handleShowPassword,
    showWarning,
  };
};
