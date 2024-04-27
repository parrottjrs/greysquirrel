import { useState } from "react";
import { PasswordFormData } from "../utils/customTypes";
import { useForm } from "react-hook-form";
import {
  ALERT_DIV,
  ALERT_TEXT,
  BOLD_GRAY_TEXT,
  FLEX_COL_CENTER,
  FLEX_COL_CENTER_MOBILE,
  FLEX_COL_LEFT,
  FORM_INPUT_FIELD,
  GENERIC_HEADER,
  GREEN_BUTTON_STRETCH,
  INPUT_FIELD_GAP,
  INPUT_FIELD_LABEL,
  MD_VIOLET_TEXT,
  SUCCESS_CONTAINER,
} from "../styles/GeneralStyles";
import ShowPassword from "./ShowPasword";
import ExclamationMark from "./ExclamationMark";
import CheckMark from "./CheckMark";
import { RESET_FAILURE_CONTAINER } from "../styles/ForgotPasswordStyles";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { usePasswordChangeManagement } from "../hooks/usePasswordChangeManagement";

export const PasswordReset = () => {
  const { isMobile } = useBreakpoints();
  const {
    handleSubmit,
    onSubmit,
    showPass,
    handleShowPass,
    register,
    passIsWeak,
    passMatch,
    updateSuccess,
    passChangeFailed,
  } = usePasswordChangeManagement();

  return (
    <div className={FLEX_COL_CENTER_MOBILE}>
      <div className={FLEX_COL_LEFT}>
        {isMobile && <h1 className={GENERIC_HEADER}>Greysquirrel</h1>}
        <h1 className={GENERIC_HEADER}>Reset your password</h1>

        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <div className={INPUT_FIELD_GAP}>
            <label className={INPUT_FIELD_LABEL} htmlFor={"password"}>
              Password
            </label>
            <input
              className={FORM_INPUT_FIELD}
              id={"password"}
              type={!showPass ? "password" : "text"}
              {...register("password")}
              autoComplete="off"
            />
            <ShowPassword onClick={handleShowPass} show={showPass} />
            {passIsWeak && (
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
              Confirm password
            </label>
            <input
              className={FORM_INPUT_FIELD}
              id={"passwordCheck"}
              type={!showPass ? "password" : "text"}
              {...register("passwordCheck")}
              autoComplete="off"
            />
            {!passMatch && (
              <div className={`${ALERT_DIV} -mt-[5px]`}>
                <span className="mr-2">
                  <ExclamationMark />
                </span>
                <p className={ALERT_TEXT}>Passwords must match.</p>
              </div>
            )}
          </div>
          <button
            className={`${GREEN_BUTTON_STRETCH} mt-[47px]`}
            type="submit"
            value="submit"
          >
            Change password
          </button>
        </form>

        {updateSuccess && (
          <div className={`${FLEX_COL_CENTER} gap-[10px]`}>
            <div className={SUCCESS_CONTAINER}>
              <CheckMark />
              <span className={BOLD_GRAY_TEXT}>Password change successful</span>
            </div>
            <a href="#/documents" className={MD_VIOLET_TEXT}>
              Visit your documents
            </a>
          </div>
        )}
        {passChangeFailed && (
          <div className={RESET_FAILURE_CONTAINER}>
            <ExclamationMark />
            <span className={BOLD_GRAY_TEXT}>
              Password change failed. Please restart the process.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
