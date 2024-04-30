import React from "react";
import { useSigninManagement } from "../hooks/useSigninManagement";
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
  SM_VIOLET_TEXT,
  WELCOME_HEADER,
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
    <>
      <Navbar />
      <div className={FLEX_CENTER_LARGE}>
        <div className={`${FLEX_COL_CENTER} gap-[11px]`}>
          <h1 className={WELCOME_HEADER}>Welcome Back!</h1>
          <p className={INSTRUCTIONS}>
            Enter your credentials to access your account
          </p>
        </div>

        <form
          className={`${FLEX_COL_CENTER} gap-[45px]`}
          onSubmit={handleSubmit(onSubmit)}
          tabIndex={0}
        >
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
          </div>
          <div>
            <div className={FORM_INNER_CONTAINER}>
              <div className="w-[404px] flex flex-row justify-between items-center">
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
                placeholder="Enter your password"
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
          <div className="w-full flex flex-row items-center justify-left">
            <input
              id="remember"
              type="checkbox"
              className="h-[16px] w-[16px] ml-0 mr-2"
              {...register("remember")}
            />
            <label
              className="text-nero text-[12px] font-IBM font-medium"
              htmlFor="remember"
            >
              Remember me for 30 days
            </label>
          </div>
          <button className={GREEN_BUTTON_STRETCH} type="submit" value="Log In">
            Sign in
          </button>
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
            aria-label="signup"
          >
            Don't have an account?
          </label>
          <a className={MD_VIOLET_TEXT} id="signup" href="#/signup">
            Sign up
          </a>
        </div>
      </div>
    </>
  );
}
