import Navbar from "../components/Navbar";
import ShowPassword from "../components/ShowPasword";
import ExclamationMark from "../components/ExclamationMark";
import CheckMark from "../components/CheckMark";
import { useBreakpoints } from "../hooks/useBreakpoints";
import MobileNavbar from "./MobileNavbar";
import {
  ALERT_DIV,
  ALERT_TEXT,
  BOLD_GRAY_TEXT,
  FORM_INPUT_FIELD,
  GENERIC_HEADER,
  INPUT_FIELD_LABEL,
  INPUT_FIELD_GAP,
  FLEX_COL_CENTER_MOBILE,
  FLEX_COL_LEFT,
  SUCCESS_CONTAINER,
  GREEN_BUTTON_STRETCH,
} from "../styles/GeneralStyles";
import { useAccountManagement } from "../hooks/useAccountManagement";

export default function AccountManagement() {
  const { isMobile } = useBreakpoints();
  const {
    authorization,
    passIsWeak,
    handleSubmit,
    onSubmit,
    register,
    userExists,
    showPass,
    handleShowPass,
    passMatch,
    updateSuccess,
  } = useAccountManagement();
  return (
    authorization && (
      <div className={FLEX_COL_CENTER_MOBILE}>
        {!isMobile ? <Navbar isLoggedIn={true} /> : <MobileNavbar />}
        <div className={FLEX_COL_LEFT}>
          <h1 className={GENERIC_HEADER}>My Account</h1>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <div className={INPUT_FIELD_GAP}>
              <label className={INPUT_FIELD_LABEL} htmlFor={"firstName"}>
                First Name
              </label>
              <input
                className={FORM_INPUT_FIELD}
                id={"firstName"}
                {...register("firstName")}
                autoComplete="off"
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
                type="text"
                {...register("email")}
                autoComplete="off"
              />
            </div>

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
                Confirm password
              </label>
              <input
                className={FORM_INPUT_FIELD}
                id={"passCheck"}
                type={!showPass ? "password" : "text"}
                {...register("passCheck")}
                autoComplete="off"
              />
              {passMatch && (
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
              Update information
            </button>
          </form>
          {updateSuccess && (
            <div className={SUCCESS_CONTAINER}>
              <CheckMark />
              <span className={`${BOLD_GRAY_TEXT} ml-[15px]`}>
                Your account has been updated
              </span>
            </div>
          )}
        </div>
      </div>
    )
  );
}
