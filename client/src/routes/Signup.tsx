import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ShowPassword from "../components/ShowPasword";
import ExclamationMark from "../components/ExclamationMark";
import {
  ALERT_DIV,
  ALERT_TEXT,
  FLEX_COL_CENTER,
  FLEX_COL_CENTER_MOBILE,
  FORM_INPUT_FIELD,
  GENERIC_HEADER,
  GREEN_BUTTON_STRETCH,
  INPUT_FIELD_GAP,
  INPUT_FIELD_LABEL,
  INSTRUCTIONS,
  MD_VIOLET_TEXT,
  SIGNUP_BUTTON,
  SMALL_DIVIDER,
} from "../styles/GeneralStyles";

import { NAVBAR_TITLE_TEXT } from "../styles/NavbarStyles";
import { useBreakpoints } from "../hooks/useBreakpoints";

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
  const { isMobile } = useBreakpoints();
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
      {!isMobile && <Navbar />}
      {isMobile && (
        <div className={FLEX_COL_CENTER_MOBILE}>
          <div className="w-[358px] flex flex-col items-start">
            <h1 className={NAVBAR_TITLE_TEXT}>Greysquirrel</h1>
            <h1 className={GENERIC_HEADER}>Let's Get Started</h1>
            <p className={INSTRUCTIONS}>
              Join Greysquirrel by creating an account
            </p>
            <form
              className={FLEX_COL_CENTER}
              onSubmit={handleSubmit(onSubmit)}
              autoComplete="off"
            >
              <div className={INPUT_FIELD_GAP}>
                <label className={INPUT_FIELD_LABEL} htmlFor={"firstName"}>
                  First Name
                </label>
                <input
                  className={FORM_INPUT_FIELD}
                  id={"firstName"}
                  placeholder="Enter your first name"
                  {...register("firstName")}
                  autoComplete="off"
                  required={true}
                />
              </div>
              <div className={INPUT_FIELD_GAP}>
                <label className={INPUT_FIELD_LABEL} htmlFor={"lastName"}>
                  Last Name
                </label>
                <input
                  className={FORM_INPUT_FIELD}
                  id={"lastName"}
                  placeholder="Enter your last name"
                  {...register("lastName")}
                  autoComplete="off"
                  required={true}
                />
              </div>
              <div className={INPUT_FIELD_GAP}>
                <label className={INPUT_FIELD_LABEL} htmlFor={"username"}>
                  Username
                </label>
                <input
                  className={FORM_INPUT_FIELD}
                  id={"username"}
                  type="text"
                  placeholder="Enter a username"
                  {...register("username")}
                  autoComplete="off"
                  required={true}
                />
                {userExists && (
                  <div className={ALERT_DIV}>
                    <span className="mr-2">
                      <ExclamationMark />
                    </span>
                    <p className={ALERT_TEXT}>Username is already taken.</p>
                  </div>
                )}
              </div>

              <div className={INPUT_FIELD_GAP}>
                <label className={INPUT_FIELD_LABEL} htmlFor={"email"}>
                  Email
                </label>
                <input
                  className={FORM_INPUT_FIELD}
                  id={"email"}
                  type="email"
                  placeholder="yourname@example.com"
                  title="please enter a valid email address"
                  {...register("email")}
                  autoComplete="off"
                  required={true}
                />
              </div>
              <div className={INPUT_FIELD_GAP}>
                <label className={INPUT_FIELD_LABEL} htmlFor={"emailCheck"}>
                  Confirm your email
                </label>
                <input
                  className={FORM_INPUT_FIELD}
                  id={"emailCheck"}
                  type="email"
                  placeholder="yourname@example.com"
                  title="please enter a valid email address"
                  {...register("emailCheck")}
                  autoComplete="off"
                  required={true}
                />
                {emailsDontMatch && (
                  <div className={ALERT_DIV}>
                    <span className="mr-2">
                      <ExclamationMark />
                    </span>
                    <p className={ALERT_TEXT}>Emails must match.</p>
                  </div>
                )}
              </div>

              <div className={INPUT_FIELD_GAP}>
                <label className={INPUT_FIELD_LABEL} htmlFor={"password"}>
                  Password
                </label>
                <input
                  className={FORM_INPUT_FIELD}
                  id={"password"}
                  placeholder="Enter your password"
                  type={!show ? "password" : "text"}
                  {...register("password")}
                  autoComplete="off"
                  required={true}
                />
                <ShowPassword onClick={handleChange} show={show} />
                {weakPassword && (
                  <div className={ALERT_DIV}>
                    <span className="mr-2 -mt-8">
                      <ExclamationMark />
                    </span>
                    <p className={ALERT_TEXT}>
                      Password must be at least{" "}
                      <span className="font-medium">8 characters</span> and have
                      at least{" "}
                      <span className="font-medium">
                        one uppercase letter, one lowercase letter, one digit
                      </span>
                      , and{" "}
                      <span className="font-medium">one special character</span>
                      .
                    </p>
                  </div>
                )}
              </div>

              <div className={INPUT_FIELD_GAP}>
                <label className={INPUT_FIELD_LABEL} htmlFor={"passCheck"}>
                  Confirm your password
                </label>
                <input
                  className={FORM_INPUT_FIELD}
                  id={"passCheck"}
                  placeholder="Enter your password"
                  type={!show ? "password" : "text"}
                  {...register("passCheck")}
                  autoComplete="off"
                  required={true}
                />
                {passwordsDontMatch && (
                  <div className={ALERT_DIV}>
                    <span className="mr-2">
                      <ExclamationMark />
                    </span>
                    <p className={ALERT_TEXT}>Passwords must match.</p>
                  </div>
                )}
              </div>

              <button
                className={GREEN_BUTTON_STRETCH}
                type="submit"
                value="submit"
              >
                Sign up
              </button>
            </form>
            <div>
              <label
                className="text-nero text-[14px] font-IBM font-medium "
                htmlFor="signin"
              >
                Have an account?
              </label>
              <a className={MD_VIOLET_TEXT} id="signin" href="#/signin">
                Sign in
              </a>
            </div>
          </div>
        </div>
      )}
      {!isMobile && (
        <div
          className={
            "m-auto mb-24 w-[404px] flex flex-col items-center justify-center"
          }
        >
          <h1 className={`${GENERIC_HEADER} mt-24`}>Let's Get Started</h1>
          <p className={INSTRUCTIONS}>
            Join Greysquirrel by creating an account
          </p>
          <form
            className={FLEX_COL_CENTER}
            onSubmit={handleSubmit(onSubmit)}
            autoComplete="off"
          >
            <div className={INPUT_FIELD_GAP}>
              <label className={INPUT_FIELD_LABEL} htmlFor={"firstName"}>
                First Name
              </label>
              <input
                className={FORM_INPUT_FIELD}
                id={"firstName"}
                {...register("firstName")}
                autoComplete="off"
                required={true}
              />
            </div>
            <div className={INPUT_FIELD_GAP}>
              <label className={INPUT_FIELD_LABEL} htmlFor={"lastName"}>
                Last Name
              </label>
              <input
                className={FORM_INPUT_FIELD}
                id={"lastName"}
                {...register("lastName")}
                autoComplete="off"
                required={true}
              />
            </div>
            <div className={INPUT_FIELD_GAP}>
              <label className={INPUT_FIELD_LABEL} htmlFor={"username"}>
                Username
              </label>
              <input
                className={FORM_INPUT_FIELD}
                id={"username"}
                type="text"
                {...register("username")}
                autoComplete="off"
                required={true}
              />
              {userExists && (
                <div className={ALERT_DIV}>
                  <span className="mr-2">
                    <ExclamationMark />
                  </span>
                  <p className={ALERT_TEXT}>Username is already taken.</p>
                </div>
              )}
            </div>

            <div className={INPUT_FIELD_GAP}>
              <label className={INPUT_FIELD_LABEL} htmlFor={"email"}>
                Email
              </label>
              <input
                className={FORM_INPUT_FIELD}
                id={"email"}
                type="email"
                placeholder="yourname@example.com"
                title="please enter a valid email address"
                {...register("email")}
                autoComplete="off"
                required={true}
              />
            </div>
            <div className={INPUT_FIELD_GAP}>
              <label className={INPUT_FIELD_LABEL} htmlFor={"emailCheck"}>
                Confirm your email
              </label>
              <input
                className={FORM_INPUT_FIELD}
                id={"emailCheck"}
                type="email"
                placeholder="yourname@example.com"
                title="please enter a valid email address"
                {...register("emailCheck")}
                autoComplete="off"
                required={true}
              />
              {emailsDontMatch && (
                <div className={ALERT_DIV}>
                  <span className="mr-2">
                    <ExclamationMark />
                  </span>
                  <p className={ALERT_TEXT}>Emails must match.</p>
                </div>
              )}
            </div>

            <div className={INPUT_FIELD_GAP}>
              <label className={INPUT_FIELD_LABEL} htmlFor={"password"}>
                Password
              </label>
              <input
                className={FORM_INPUT_FIELD}
                id={"password"}
                type={!show ? "password" : "text"}
                {...register("password")}
                autoComplete="off"
                required={true}
              />
              <ShowPassword onClick={handleChange} show={show} />
              {weakPassword && (
                <div className={ALERT_DIV}>
                  <span className="mr-2 -mt-8">
                    <ExclamationMark />
                  </span>
                  <p className={ALERT_TEXT}>
                    Password must be at least{" "}
                    <span className="font-medium">8 characters</span> and have
                    at least{" "}
                    <span className="font-medium">
                      one uppercase letter, one lowercase letter, one digit
                    </span>
                    , and{" "}
                    <span className="font-medium">one special character</span>.
                  </p>
                </div>
              )}
            </div>

            <div className={INPUT_FIELD_GAP}>
              <label className={INPUT_FIELD_LABEL} htmlFor={"passCheck"}>
                Confirm your password
              </label>
              <input
                className={FORM_INPUT_FIELD}
                id={"passCheck"}
                type={!show ? "password" : "text"}
                {...register("passCheck")}
                autoComplete="off"
                required={true}
              />
              {passwordsDontMatch && (
                <div className={ALERT_DIV}>
                  <span className="mr-2">
                    <ExclamationMark />
                  </span>
                  <p className={ALERT_TEXT}>Passwords must match.</p>
                </div>
              )}
            </div>

            <button className={SIGNUP_BUTTON} type="submit" value="submit">
              Sign up
            </button>
            <div className={SMALL_DIVIDER} />
          </form>
          <div>
            <label className={INPUT_FIELD_LABEL} htmlFor="signin">
              Have an account?
            </label>
            <a className={MD_VIOLET_TEXT} id="signin" href="#/signin">
              Sign in here!
            </a>
          </div>
        </div>
      )}
    </div>
  );
}