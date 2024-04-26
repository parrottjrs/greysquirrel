import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ShowPassword from "../components/ShowPasword";
import { useForm } from "react-hook-form";
import { authenticate, refresh } from "../utils/functions";
import { useNavigate } from "react-router-dom";
import ExclamationMark from "../components/ExclamationMark";
import CheckMark from "../components/CheckMark";
import {
  ACCOUNT_FORM_CONTAINER,
  SUBMIT_SUCCESS_CONTAINER,
} from "../styles/AccountStyles";
import {
  ALERT_DIV,
  ALERT_TEXT,
  BOLD_GRAY_TEXT,
  FLEX_COL_CENTER,
  FORM_INPUT_FIELD,
  GENERIC_HEADER,
  INPUT_FIELD_LABEL,
  INPUT_FIELD_GAP,
  FORM_SUBMIT,
} from "../styles/GeneralStyles";

type FormData = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  passCheck: string;
};

export default function Account() {
  const refreshTokenDelay = 540000; //nine minutes;
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [weakPassword, setWeakPassword] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [passwordsDontMatch, setPasswordsDontMatch] = useState(false);
  const [authorization, setAuthorization] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [accountUpdated, setAccountUpdated] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: async () => getUserInfo(),
  });

  const refreshToken = async () => {
    try {
      const { success } = await refresh();
      if (!success) {
        navigate("/signin");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const authenticateUser = async () => {
    try {
      const { success } = await authenticate();
      if (!success) {
        navigate("/signin");
      }
      setAuthorization(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getUserInfo = async () => {
    try {
      const response = await fetch("/api/get-user-info");
      if (response.ok) {
        const json = await response.json();
        return json.userInfo;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateUserInfo = async (data: FormData) => {
    const trimmedData = {
      username: data.username.toLowerCase().trim(),
      email: data.email.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      password: data.password.trim(),
      passCheck: data.passCheck.trim(),
    };
    try {
      const response = await fetch("/api/update-user-info", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: trimmedData }),
      });
      const json = await response.json();
      switch (json.message) {
        case "Username in use":
          setUserExists(true);
          break;
        case "User info updated":
          setAccountUpdated(true);
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

  const checkUserEntry = (passwordOne: string, passwordTwo: string) => {
    const strongPassword = checkPasswordRestrictions(passwordOne);
    const passwordsMatch = doPasswordsMatch(passwordOne, passwordTwo);
    if (!strongPassword || !passwordsMatch) {
      return false;
    }
    return true;
  };

  const handleChange = () => {
    setShow(!show);
  };

  const handleUpdate = (data: FormData) => {
    const { password, passCheck } = data;
    if (password === "" && passCheck === "") {
      updateUserInfo(data);
      return false;
    }
    const userEntryOK = checkUserEntry(password, passCheck);

    if (userEntryOK) {
      updateUserInfo(data);
    }
  };

  const onSubmit = (data: FormData) => {
    handleUpdate(data);
  };

  useEffect(() => {
    authenticateUser();
    getUserInfo();
  }, []);

  useEffect(() => {
    let interval = setInterval(() => refreshToken(), refreshTokenDelay);
    return () => clearInterval(interval);
  }, [authorization]);

  return (
    authorization && (
      <div>
        <Navbar isLoggedIn={true} />
        <div className={ACCOUNT_FORM_CONTAINER}>
          <h1 className={GENERIC_HEADER}>My Account</h1>
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
                type={!show ? "password" : "text"}
                {...register("password")}
                autoComplete="off"
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
                Confirm password
              </label>
              <input
                className={FORM_INPUT_FIELD}
                id={"passCheck"}
                type={!show ? "password" : "text"}
                {...register("passCheck")}
                autoComplete="off"
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

            <button className={FORM_SUBMIT} type="submit" value="submit">
              Update information
            </button>
          </form>
          {accountUpdated && (
            <div className={SUBMIT_SUCCESS_CONTAINER}>
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
