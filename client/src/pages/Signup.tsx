import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { STYLES } from "../utils/styles";
import Navbar from "../components/Navbar";
import ShowPassword from "../components/ShowPasword";
import ExclamationMark from "../components/ExclamationMark";

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
          localStorage.setItem("hasSignedUp", "true");
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
      <div className={STYLES.SIGNUP_PARENT_CONTAINER}>
        <h1 className={`${STYLES.WELCOME_HEADER} mt-24`}>Let's Get Started</h1>
        <p className={STYLES.INSTRUCTIONS}>
          Join Greysquirrel by creating an account
        </p>
        <form
          className={STYLES.FLEX_COL_CENTER}
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <div className="mt-10">
            <label className={STYLES.LABEL} htmlFor={"firstName"}>
              First Name
            </label>
            <input
              className={STYLES.FORM_INPUT}
              id={"firstName"}
              {...register("firstName")}
              autoComplete="off"
              required={true}
            />
          </div>
          <div className="mt-10">
            <label className={STYLES.LABEL} htmlFor={"lastName"}>
              Last Name
            </label>
            <input
              className={STYLES.FORM_INPUT}
              id={"lastName"}
              {...register("lastName")}
              autoComplete="off"
              required={true}
            />
          </div>
          <div className="mt-10">
            <label className={STYLES.LABEL} htmlFor={"username"}>
              Username
            </label>
            <input
              className={STYLES.FORM_INPUT}
              id={"username"}
              type="text"
              {...register("username")}
              autoComplete="off"
              required={true}
            />
            {userExists && (
              <div className={STYLES.ALERT_DIV}>
                <span className="mr-2">
                  <ExclamationMark />
                </span>
                <p className={STYLES.ALERT_TEXT}>Username is already taken.</p>
              </div>
            )}
          </div>

          <div className="mt-10">
            <label className={STYLES.LABEL} htmlFor={"email"}>
              Email
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
              Confirm your email
            </label>
            <input
              className={STYLES.FORM_INPUT}
              id={"emailCheck"}
              type="text"
              {...register("emailCheck")}
              autoComplete="off"
              required={true}
            />
            {emailsDontMatch && (
              <div className={STYLES.ALERT_DIV}>
                <span className="mr-2">
                  <ExclamationMark />
                </span>
                <p className={STYLES.ALERT_TEXT}>Emails must match.</p>
              </div>
            )}
          </div>

          <div className="mt-10">
            <label className={STYLES.LABEL} htmlFor={"password"}>
              Password
            </label>
            <input
              className={STYLES.FORM_INPUT}
              id={"password"}
              type={!show ? "password" : "text"}
              {...register("password")}
              autoComplete="off"
              required={true}
            />
            <ShowPassword onClick={handleChange} show={show} />
            {weakPassword && (
              <div className={STYLES.ALERT_DIV}>
                <span className="mr-2 -mt-8">
                  <ExclamationMark />
                </span>
                <p className={STYLES.ALERT_TEXT}>
                  Password must be at least{" "}
                  <span className="font-medium">8 characters</span> and have at
                  least{" "}
                  <span className="font-medium">
                    one uppercase letter, one lowercase letter, one digit
                  </span>
                  , and{" "}
                  <span className="font-medium">one special character</span>.
                </p>
              </div>
            )}
          </div>

          <div className="mt-24">
            <label className={STYLES.LABEL} htmlFor={"passCheck"}>
              Confirm your password
            </label>
            <input
              className={STYLES.FORM_INPUT}
              id={"passCheck"}
              type={!show ? "password" : "text"}
              {...register("passCheck")}
              autoComplete="off"
              required={true}
            />
            {passwordsDontMatch && (
              <div className={STYLES.ALERT_DIV}>
                <span className="mr-2">
                  <ExclamationMark />
                </span>
                <p className={STYLES.ALERT_TEXT}>Passwords must match.</p>
              </div>
            )}
          </div>

          <button className={STYLES.SIGNUP_BUTTON} type="submit" value="submit">
            Sign up
          </button>
          <div className={STYLES.SIGN_IN_DIVIDER} />
        </form>
        <div>
          <label className={STYLES.LABEL} htmlFor="signin">
            Have an account?
          </label>
          <a className={STYLES.VIOLET_TEXT} id="signin" href="#/signin">
            Sign in here!
          </a>
        </div>
      </div>
    </div>
  );
}
