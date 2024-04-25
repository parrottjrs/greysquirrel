import React from "react";
import {
  ALERT_DIV,
  ALERT_TEXT,
  FLEX_COL_CENTER_MOBILE,
  FORM_INPUT_FIELD,
  GREEN_BUTTON_STRETCH,
  INPUT_FIELD_GAP,
  INPUT_FIELD_LABEL,
  INSTRUCTIONS,
  MD_VIOLET_TEXT,
  SM_VIOLET_TEXT,
} from "../styles/GeneralStyles";
import { NAVBAR_TITLE_TEXT } from "../styles/NavbarStyles";
import ShowPassword from "./ShowPasword";
import ExclamationMark from "./ExclamationMark";
import { useSigninManagement } from "../hooks/useSigninManagement";

export default function SigninMobile() {
  const {
    handleSubmit,
    onSubmit,
    register,
    showPassword,
    handleShowPassword,
    showWarning,
  } = useSigninManagement();
  return (
    <div className={FLEX_COL_CENTER_MOBILE}>
      <div className="w-[358px] flex flex-col items-start">
        <h1 className={NAVBAR_TITLE_TEXT}>Greysquirrel</h1>
        <h1 className="mb-0 text-nero text-[32px] font-IBM font-medium">
          Welcome Back!
        </h1>
        <p className={INSTRUCTIONS}>
          Enter your credentials to access your account
        </p>

        <div>
          <form
            className="w-[358px]"
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
            <button
              className={GREEN_BUTTON_STRETCH}
              type="submit"
              value="Log In"
            >
              Log in
            </button>
          </form>
        </div>
        <div>
          <label
            className="text-nero text-[14px] font-IBM font-medium "
            aria-label="signup"
          >
            Don't have an account?
          </label>
          <a className={MD_VIOLET_TEXT} id="signup" href="#/signup">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
