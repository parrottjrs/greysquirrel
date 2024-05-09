import React from "react";
import {
  ALERT_DIV,
  ALERT_TEXT,
  FLEX_COL_CENTER,
  FLEX_COL_CENTER_MOBILE,
  FLEX_COL_LEFT,
  FORM_INPUT_FIELD,
  GENERIC_HEADER,
  GREEN_BUTTON_STRETCH,
  INPUT_FIELD_GAP,
  INPUT_FIELD_LABEL,
  INSTRUCTIONS,
  MD_VIOLET_TEXT,
} from "../styles/GeneralStyles";
import { NAVBAR_TITLE_TEXT } from "../styles/NavbarStyles";
import ExclamationMark from "./ExclamationMark";
import ShowPassword from "./ShowPasword";
import { useSignUpManagement } from "../hooks/useSignUpManagement";

export default function SignupMobile() {
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
    <div className={FLEX_COL_CENTER_MOBILE}>
      <div className={FLEX_COL_LEFT}>
        <h1 className={NAVBAR_TITLE_TEXT}>Greysquirrel</h1>
        <h1 className={GENERIC_HEADER}>Let's Get Started</h1>
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
            {!emailsMatch && (
              <div className={ALERT_DIV}>
                <span className="mr-2">
                  <ExclamationMark />
                </span>
                <p className={ALERT_TEXT}>Emails must match.</p>
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
              autoComplete="off"
            />
          </label>

          <div className={INPUT_FIELD_GAP}>
            <label className={INPUT_FIELD_LABEL} htmlFor={"password"}>
              Password
            </label>
            <input
              className={FORM_INPUT_FIELD}
              id={"password"}
              placeholder="Enter your password"
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

          <div className={INPUT_FIELD_GAP}>
            <label className={INPUT_FIELD_LABEL} htmlFor={"passCheck"}>
              Confirm your password
            </label>
            <input
              className={FORM_INPUT_FIELD}
              id={"passCheck"}
              placeholder="Enter your password"
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
          <div className="mt-[36px] w-full flex flex-col gap-[2px] items-start ">
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
          <button className={GREEN_BUTTON_STRETCH} type="submit" value="submit">
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
  );
}
