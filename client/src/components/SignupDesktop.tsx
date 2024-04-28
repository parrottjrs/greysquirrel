import React from "react";
import { useSignUpManagement } from "../hooks/useSignUpManagement";
import {
  ALERT_DIV,
  ALERT_TEXT,
  FLEX_COL_CENTER,
  FORM_INPUT_FIELD,
  GENERIC_HEADER,
  INPUT_FIELD_GAP,
  INPUT_FIELD_LABEL,
  INSTRUCTIONS,
  MD_VIOLET_TEXT,
  SIGNUP_BUTTON,
  SMALL_DIVIDER,
} from "../styles/GeneralStyles";
import ExclamationMark from "./ExclamationMark";
import ShowPassword from "./ShowPasword";
import Navbar from "./Navbar";

export default function SignupDesktop() {
  const {
    handleSubmit,
    onSubmit,
    register,
    userExists,
    emailsMatch,
    showPassword,
    handleShowPassword,
    passwordIsWeak,
    passwordsMatch,
  } = useSignUpManagement();

  return (
    <div
      className={
        "m-auto mb-24 w-[404px] flex flex-col items-center justify-center"
      }
    >
      <Navbar />
      <h1 className={`${GENERIC_HEADER} mt-24`}>Let's Get Started</h1>
      <p className={INSTRUCTIONS}>Join Greysquirrel by creating an account</p>
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
          {!emailsMatch && (
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
            type={!showPassword ? "password" : "text"}
            {...register("password")}
            autoComplete="off"
            required={true}
          />
          <ShowPassword onClick={handleShowPassword} show={showPassword} />
          {passwordIsWeak && (
            <div className={ALERT_DIV}>
              <span className="mr-2 -mt-8">
                <ExclamationMark />
              </span>
              <p className={ALERT_TEXT}>
                Password must be at least 8 characters and have at least one
                uppercase letter, one lowercase letter, one digit , and one
                special character .
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
            type={!showPassword ? "password" : "text"}
            {...register("passCheck")}
            autoComplete="off"
            required={true}
          />
          {!passwordsMatch && (
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
  );
}
