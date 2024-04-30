import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { SignupFormData } from "../utils/customTypes";

export const useSignUpManagement = () => {
  const [agree, setAgree] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordIsWeak, setPasswordIsWeak] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [emailsMatch, setEmailsMatch] = useState(true);
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      username: "",
      email: "",
      emailCheck: "",
      firstName: "",
      lastName: "",
      password: "",
      passCheck: "",
      agree: false,
    },
  });

  const signup = async (data: SignupFormData) => {
    const trimmedData = {
      username: data.username.toLowerCase().trim(),
      email: data.email.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      password: data.password.trim(),
      passCheck: data.passCheck.trim(),
    };
    try {
      const response = await fetch("/api/signUp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: trimmedData }),
      });
      const json = await response.json();
      switch (json.message) {
        case "User already exists":
          setUserExists(true);
          break;
        case "User created":
          localStorage.setItem("hasSignedUp", "true");
          navigate(`/verify-account`);
          break;
        default:
          console.error("An unexpected error has occurred");
          break;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkPasswordRestrictions = (password: string) => {
    const restrictions =
      /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    const strongPassword = restrictions.test(password);
    strongPassword ? setPasswordIsWeak(false) : setPasswordIsWeak(true);
    return strongPassword;
  };

  const doPasswordsMatch = (passwordOne: string, passwordTwo: string) => {
    const passwordsMatch = passwordOne === passwordTwo;
    passwordsMatch ? setPasswordsMatch(true) : setPasswordsMatch(false);
    return passwordsMatch;
  };

  const doEmailsMatch = (emailOne: string, emailTwo: string) => {
    const emailsMatch = emailOne === emailTwo;
    emailsMatch ? setEmailsMatch(true) : setEmailsMatch(false);
    return emailsMatch;
  };

  const checkUserEntry = (
    agree: boolean,
    emailOne: string,
    emailTwo: string,
    passwordOne: string,
    passwordTwo: string
  ) => {
    if (!agree) {
      setAgree(false);
      return false;
    }
    setAgree(true);
    const emailsMatch = doEmailsMatch(emailOne, emailTwo);
    const strongPassword = checkPasswordRestrictions(passwordOne);
    const passwordsMatch = doPasswordsMatch(passwordOne, passwordTwo);
    if (!emailsMatch || !strongPassword || !passwordsMatch) {
      return false;
    }
    return true;
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSignup = (data: SignupFormData) => {
    const { agree, email, emailCheck, password, passCheck } = data;

    const userEntryOK = checkUserEntry(
      agree,
      email,
      emailCheck,
      password,
      passCheck
    );

    if (userEntryOK) {
      signup(data);
    }
  };

  const onSubmit = (data: SignupFormData) => {
    handleSignup(data);
  };

  return {
    handleSubmit,
    onSubmit,
    register,
    userExists,
    emailsMatch,
    showPassword,
    handleShowPassword,
    passwordIsWeak,
    passwordsMatch,
    agree,
  };
};
