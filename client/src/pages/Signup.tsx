import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Eye from "../components/Eye";
import { STYLES } from "../utils/styles";
import Navbar from "../components/Navbar";

type FormData = {
  username: string;
  email: string;
  emailCheck: string;
  firstName: string;
  lastName: string;
  password: string;
  passCheck: string;
};

export default function Signup() {
  const [show, setShow] = useState(false);
  const [weakPassword, setWeakPassword] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [passwordsDontMatch, setPasswordsDontMatch] = useState(false);
  const [emailsDontMatch, setEmailsDontMatch] = useState(false);
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
    },
  });

  const signup = async (data: FormData) => {
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
          navigate(`/verify-email`);
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
    strongPassword ? setWeakPassword(false) : setWeakPassword(true);
    return strongPassword;
  };

  const doPasswordsMatch = (passwordOne: string, passwordTwo: string) => {
    const passwordsMatch = passwordOne === passwordTwo;
    passwordsMatch ? setPasswordsDontMatch(false) : setPasswordsDontMatch(true);
    return passwordsMatch;
  };

  const doEmailsMatch = (emailOne: string, emailTwo: string) => {
    const emailsMatch = emailOne === emailTwo;
    emailsMatch ? setEmailsDontMatch(false) : setEmailsDontMatch(true);
    return emailsMatch;
  };

  const checkUserEntry = (
    emailOne: string,
    emailTwo: string,
    passwordOne: string,
    passwordTwo: string
  ) => {
    const emailsMatch = doEmailsMatch(emailOne, emailTwo);
    const strongPassword = checkPasswordRestrictions(passwordOne);
    const passwordsMatch = doPasswordsMatch(passwordOne, passwordTwo);
    console.log(
      "emailMatch:",
      emailsMatch,
      "strongPassword:",
      strongPassword,
      "passwordMatch:",
      passwordsMatch
    );
    if (!emailsMatch || !strongPassword || !passwordsMatch) {
      return false;
    }
    return true;
  };

  const handleChange = () => {
    setShow(!show);
  };

  const handleSignup = (data: FormData) => {
    const { email, emailCheck, password, passCheck } = data;
    const userEntryOK = checkUserEntry(email, emailCheck, password, passCheck);

    if (userEntryOK) {
      signup(data);
    }
  };

  const onSubmit = (data: FormData) => {
    handleSignup(data);
  };

  return (
    <div>
      <Navbar />
      <div className={STYLES.CENTER}>
        <h1 className={STYLES.WELCOME_HEADER}>Sign Up</h1>
        <form
          className={STYLES.FLEX_COL_CENTER}
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <div className="mt-10">
            <label className={STYLES.LABEL} htmlFor={"username"}>
              * Username:
            </label>
            <input
              className={STYLES.FORM_INPUT}
              id={"username"}
              type="text"
              {...register("username")}
              autoComplete="off"
              required={true}
            />
          </div>
          {userExists && (
            <p className={STYLES.ALERT_TEXT}>
              You must choose a different username.
            </p>
          )}
          <div className="mt-10">
            <label className={STYLES.LABEL} htmlFor={"email"}>
              * Email:
            </label>
            <input
              className={STYLES.FORM_INPUT}
              id={"email"}
              type="text"
              {...register("email")}
              autoComplete="off"
              required={true}
            />
          </div>
          <div className="mt-10">
            <label className={STYLES.LABEL} htmlFor={"emailCheck"}>
              * Re-enter your email:
            </label>
            <input
              className={STYLES.FORM_INPUT}
              id={"emailCheck"}
              type="text"
              {...register("emailCheck")}
              autoComplete="off"
              required={true}
            />
          </div>
          {emailsDontMatch && (
            <p className={STYLES.ALERT_TEXT}>Emails must match.</p>
          )}
          <div className="mt-10">
            <label className={STYLES.LABEL} htmlFor={"firstName"}>
              First Name:
            </label>
            <input
              className={STYLES.FORM_INPUT}
              id={"firstName"}
              {...register("firstName")}
              autoComplete="off"
            />
          </div>
          <div className="mt-10">
            <label className={STYLES.LABEL} htmlFor={"lastName"}>
              Last Name:
            </label>
            <input
              className={STYLES.FORM_INPUT}
              id={"lastName"}
              {...register("lastName")}
              autoComplete="off"
            />
          </div>
          <div className="mt-10">
            <label className={STYLES.LABEL} htmlFor={"password"}>
              * Password:
            </label>
            <input
              className={STYLES.FORM_INPUT}
              id={"password"}
              type={!show ? "password" : "text"}
              {...register("password")}
              autoComplete="off"
              required={true}
            />
          </div>
          <Eye onClick={handleChange} show={show} />
          <div className="mt-10">
            <label className={STYLES.LABEL} htmlFor={"passCheck"}>
              * Re-enter password:
            </label>
            <input
              className={STYLES.FORM_INPUT}
              id={"passCheck"}
              type={!show ? "password" : "text"}
              {...register("passCheck")}
              autoComplete="off"
              required={true}
            />
          </div>
          <div className={STYLES.ALERT_DIV}>
            {passwordsDontMatch && (
              <p className={STYLES.ALERT_TEXT}>Passwords must match.</p>
            )}
            <p className={!weakPassword ? "" : STYLES.ALERT_TEXT}>
              Password must be at least 8 characters and have at least one
              uppercase letter, one lowercase letter, one digit, and one special
              character.
            </p>
          </div>
          <input className={STYLES.LOGIN_BUTTON} type="submit" value="submit" />
        </form>
      </div>
    </div>
  );
}
