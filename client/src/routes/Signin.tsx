import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ShowPassword from "../components/ShowPasword";
import { authenticate } from "../utils/functions";
import Navbar from "../components/Navbar";
import {
  ALERT_DIV,
  ALERT_TEXT,
  FLEX_COL_CENTER,
  FLEX_COL_CENTER_MOBILE,
  FORM_INPUT_FIELD,
  GREEN_BUTTON_STRETCH,
  INPUT_FIELD_GAP,
  INPUT_FIELD_LABEL,
  INSTRUCTIONS,
  MD_VIOLET_TEXT,
  SMALL_DIVIDER,
  SM_VIOLET_TEXT,
} from "../styles/GeneralStyles";

import { NAVBAR_TITLE_TEXT } from "../styles/NavbarStyles";
import ExclamationMark from "../components/ExclamationMark";
import { useBreakpoints } from "../hooks/useBreakpoints";

type FormData = {
  username: string;
  password: string;
  remember: boolean;
};

export default function Signin() {
  const { isMobile, isTablet, isBigScreen } = useBreakpoints();
  const [change, setChange] = useState(false);
  const [show, setShow] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  const navigate = useNavigate();

  const authenticateUser = async () => {
    try {
      const { success } = await authenticate();
      if (success) {
        navigate("/documents");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    authenticateUser();
  }, []);

  const fetchUser = async (data: FormData) => {
    const trimmedData = {
      username: data.username.toLowerCase().trim(),
      password: data.password.trim(),
      remember: data.remember,
    };

    data.username = data.username.toLowerCase();
    try {
      const response = await fetch("/api/signIn", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: trimmedData }),
      });

      const json = await response.json();
      switch (json.message) {
        case "Access granted":
          localStorage.setItem("hasSignedUp", "true");
          navigate(`/documents`);
          break;
        case "Unauthorized: Invalid username and/or password":
          setChange(true);
          break;
        default:
          console.error("an unexpected error has occured.");
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleShow = () => {
    return setShow(!show);
  };

  const onSubmit = (data: FormData) => {
    fetchUser(data);
  };

  return (
    <div>
      {!isMobile && <Navbar />}
      {isMobile && (
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
                      type={!show ? "password" : "text"}
                      {...register("password")}
                      autoComplete="off"
                      required={true}
                    />
                  </div>

                  <ShowPassword onClick={handleShow} show={show} />

                  {change && (
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
      )}
      {isTablet && (
        <div className="md:h-screen md:mt-18 flex flex-col items-center md:justify-center">
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
                    type={!show ? "password" : "text"}
                    {...register("password")}
                    autoComplete="off"
                    required={true}
                  />
                </div>

                <ShowPassword onClick={handleShow} show={show} />

                {change && (
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
      )}
      {isBigScreen && (
        <div className="md:h-screen md:mt-18 flex flex-col items-center md:justify-center">
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
                    type={!show ? "password" : "text"}
                    {...register("password")}
                    autoComplete="off"
                    required={true}
                  />
                </div>

                <ShowPassword onClick={handleShow} show={show} />

                {change && (
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
      )}
    </div>
  );
}
