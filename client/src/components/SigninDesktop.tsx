import React from "react";
import { useSigninManagement } from "../hooks/useSigninManagement";
import {
  ALERT_DIV,
  ALERT_TEXT,
  FLEX_COL_CENTER,
  FORM_INPUT_FIELD,
  GREEN_BUTTON_STRETCH,
  INPUT_FIELD_GAP,
  INPUT_FIELD_LABEL,
  INSTRUCTIONS,
  MD_VIOLET_TEXT,
  SMALL_DIVIDER,
  SM_VIOLET_TEXT,
} from "../styles/GeneralStyles";
import ShowPassword from "./ShowPasword";
import ExclamationMark from "./ExclamationMark";
import Navbar from "./Navbar";

export default function SigninDesktop() {
  const {
    handleSubmit,
    onSubmit,
    register,
    showPassword,
    handleShowPassword,
    showWarning,
  } = useSigninManagement();

  return (
    <div className="md:h-screen md:mt-18 flex flex-col items-center md:justify-center">
      <Navbar />
      <h1 className="mb-0 text-left text-nero text-xl font-IBM font-medium md:text-3xl">
        Welcome Back!
      </h1>
      <p className={INSTRUCTIONS}>
        Enter your credentials to access your account
      </p>
      <div>
        <form
          className={FLEX_COL_CENTER}
          onSubmit={handleSubmit(onSubmit)}
          tabIndex={0}
        >
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
          </div>
          <div>
            <div className={INPUT_FIELD_GAP}>
              <div className="flex flex-row justify-between items-center">
                <label className={INPUT_FIELD_LABEL} htmlFor={"password"}>
                  Password
                </label>
                <a href="#/forgot-password" className={SM_VIOLET_TEXT}>
                  Forgot password?
                </a>
              </div>

              <input
                className={FORM_INPUT_FIELD}
                id={"password"}
                type={!showPassword ? "password" : "text"}
                {...register("password")}
                autoComplete="off"
                required={true}
              />
            </div>

            <ShowPassword onClick={handleShowPassword} show={showPassword} />

            {showWarning && (
              <div className={ALERT_DIV}>
                <span className="mr-2">
                  <ExclamationMark />
                </span>
                <p className={ALERT_TEXT}>
                  Authentication failed. Please try again.
                </p>
              </div>
            )}
          </div>
          <div className="w-full mt-16 flex flex-row items-center justify-left">
            <input
              id="remember"
              type="checkbox"
              className="mr-2"
              {...register("remember")}
            />
            <label
              className="text-nero text-xs md: text-sm font-IBM font-medium"
              htmlFor="remember"
            >
              Remember me for 30 days
            </label>
          </div>
          <button className={GREEN_BUTTON_STRETCH} type="submit" value="Log In">
            Sign in
          </button>
        </form>
        <div className={SMALL_DIVIDER} />
      </div>
      <div>
        <label className={INPUT_FIELD_LABEL} aria-label="signup">
          Don't have an account?
        </label>
        <a className={MD_VIOLET_TEXT} id="signup" href="#/signup">
          Sign up here!
        </a>
      </div>
    </div>
  );
}
