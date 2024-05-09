import React from "react";
import { useSignUpManagement } from "../hooks/useSignUpManagement";
import {
  ALERT_DIV,
  ALERT_TEXT,
  FLEX_CENTER_LARGE,
  FLEX_COL_CENTER,
  FLEX_ROW_CENTER,
  FORM_INNER_CONTAINER,
  FORM_INPUT_FIELD,
  GREEN_BUTTON_STRETCH,
  INPUT_FIELD_LABEL,
  INSTRUCTIONS,
  MD_VIOLET_TEXT,
  SMALL_DIVIDER,
  WELCOME_HEADER,
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
    userAgrees,
  } = useSignUpManagement();

  return (
    <>
      <Navbar />
      <div className={FLEX_CENTER_LARGE}>
        <div className={`${FLEX_COL_CENTER} gap-[11px]`}>
          <h1 className={WELCOME_HEADER}>Let's Get Started</h1>
          <p className={INSTRUCTIONS}>
            Create an account to access our features
          </p>
        </div>
        <form
          className="flex flex-col items-left gap-[45px]"
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <div className={FORM_INNER_CONTAINER}>
            <label className={INPUT_FIELD_LABEL} htmlFor={"firstName"}>
              First Name
            </label>
            <input
              className={FORM_INPUT_FIELD}
              id={"firstName"}
              {...register("firstName")}
              autoComplete="off"
              required={true}
              placeholder="Enter your first name"
            />
          </div>
          <div className={FORM_INNER_CONTAINER}>
            <label className={INPUT_FIELD_LABEL} htmlFor={"lastName"}>
              Last Name
            </label>
            <input
              className={FORM_INPUT_FIELD}
              id={"lastName"}
              {...register("lastName")}
              autoComplete="off"
              required={false}
              placeholder="Enter your last name"
            />
          </div>
          <div className={FORM_INNER_CONTAINER}>
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
              placeholder="Enter your username"
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
          <label
            className={`${INPUT_FIELD_LABEL} hidden`}
            htmlFor="additional-info"
          >
            If you are human leave this field blank
            <input
              className={`${FORM_INPUT_FIELD} hidden`}
              type="text"
              id={"additional-info"}
              {...register("additionalInfo")}
            />
          </label>
          <div className={FORM_INNER_CONTAINER}>
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
          <div className={FORM_INNER_CONTAINER}>
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

          <div className={FORM_INNER_CONTAINER}>
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
              placeholder="Enter your password"
            />
            <ShowPassword onClick={handleShowPassword} show={showPassword} />
            {passwordIsWeak && (
              <div className={ALERT_DIV}>
                <span className="mr-2">
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

          <div className={FORM_INNER_CONTAINER}>
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
              placeholder="Enter your password"
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

          <button className={GREEN_BUTTON_STRETCH} type="submit" value="submit">
            Sign up
          </button>
          <div className="flex flex-col gap-[2px] items-start">
            <div className="flex flex-row items-center">
              <input
                id="terms-of-use"
                type="checkbox"
                className="h-[16px] w-[16px] ml-[1px] mr-2"
                {...register("agree")}
              />
              <label
                className="text-nero text-[12px] font-IBM font-medium"
                htmlFor="terms-of-use"
              >
                I agree with Greysquirrel's privacy policy
              </label>
            </div>
            {!userAgrees && (
              <div className={ALERT_DIV}>
                <span className="mr-2">
                  <ExclamationMark />
                </span>
                <p className={ALERT_TEXT}>
                  You must agree with our privacy policy
                </p>
              </div>
            )}
          </div>
        </form>

        <div className={`${FLEX_ROW_CENTER} w-[404px]`}>
          <div className={SMALL_DIVIDER} />

          <span className="text-[12px] text-nero font-IBM font-medium mx-[2px]">
            Or
          </span>
          <div className={SMALL_DIVIDER} />
        </div>
        <div className={FLEX_ROW_CENTER}>
          <label
            className="text-[14px] text-nero font-IBM font-medium"
            htmlFor="signin"
          >
            Have an account?
          </label>
          <a className={MD_VIOLET_TEXT} id="signin" href="#/signin">
            Sign in
          </a>
        </div>
      </div>
    </>
  );
}
