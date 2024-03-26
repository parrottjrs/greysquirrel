import React, { useEffect, useState } from "react";
import { STYLES } from "../utils/styles";
import LogoutButton from "../components/LogoutButton";
import Navbar from "../components/Navbar";
import { AlertCircle } from "lucide-react";
import ShowPassword from "../components/ShowPasword";
import { useForm } from "react-hook-form";
import { authenticate, refresh } from "../utils/functions";
import { useNavigate } from "react-router-dom";
import ExclamationMark from "../components/ExclamationMark";
import CheckMark from "../components/CheckMark";

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
        <div className={STYLES.ACCOUNT_FORM_CONTAINER}>
          <h1 className={STYLES.WELCOME_HEADER}>My Account</h1>
          <form
            className={STYLES.FLEX_COL_CENTER}
            onSubmit={handleSubmit(onSubmit)}
            autoComplete="off"
          >
            <div className="mt-10">
              <label className={STYLES.LABEL} htmlFor={"firstName"}>
                First Name
              </label>
              <input
                className={STYLES.FORM_INPUT}
                id={"firstName"}
                {...register("firstName")}
                autoComplete="off"
              />
            </div>
            <div className="mt-10">
              <label className={STYLES.LABEL} htmlFor={"lastName"}>
                Last Name
              </label>
              <input
                className={STYLES.FORM_INPUT}
                id={"lastName"}
                {...register("lastName")}
                autoComplete="off"
              />
            </div>
            <div className="mt-10">
              <label className={STYLES.LABEL} htmlFor={"username"}>
                Username
              </label>
              <input
                className={STYLES.FORM_INPUT}
                id={"username"}
                type="text"
                {...register("username")}
                autoComplete="off"
              />
              {userExists && (
                <div className={STYLES.ALERT_DIV}>
                  <span className="mr-2">
                    <ExclamationMark />
                  </span>
                  <p className={STYLES.ALERT_TEXT}>
                    Username is already taken.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-10">
              <label className={STYLES.LABEL} htmlFor={"email"}>
                Email
              </label>
              <input
                className={STYLES.FORM_INPUT}
                id={"email"}
                type="text"
                {...register("email")}
                autoComplete="off"
              />
            </div>

            <div className="mt-10">
              <label className={STYLES.LABEL} htmlFor={"password"}>
                Password
              </label>
              <input
                className={STYLES.FORM_INPUT}
                id={"password"}
                type={!show ? "password" : "text"}
                {...register("password")}
                autoComplete="off"
              />
              <ShowPassword onClick={handleChange} show={show} />
              {weakPassword && (
                <div className={STYLES.ALERT_DIV}>
                  <span className="mr-2 -mt-8">
                    <ExclamationMark />
                  </span>
                  <p className={STYLES.ALERT_TEXT}>
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

            <div className="mt-10">
              <label className={STYLES.LABEL} htmlFor={"passCheck"}>
                Confirm password
              </label>
              <input
                className={STYLES.FORM_INPUT}
                id={"passCheck"}
                type={!show ? "password" : "text"}
                {...register("passCheck")}
                autoComplete="off"
              />
              {passwordsDontMatch && (
                <div className={STYLES.ALERT_DIV}>
                  <span className="mr-2">
                    <ExclamationMark />
                  </span>
                  <p className={STYLES.ALERT_TEXT}>Passwords must match.</p>
                </div>
              )}
            </div>

            <button
              className="mt-12 mb-12 w-full h-9 py-1 text-nero text-sm font-sans font-medium bg-aeroBlue gap-2.5 rounded-xl border-0"
              type="submit"
              value="submit"
            >
              Update information
            </button>
          </form>
          {accountUpdated && (
            <div className="flex flex-row justify-center w-[385px] py-[0.56rem] px-[19px] border border-solid rounded-[0.88rem] border-aeroBlue">
              <CheckMark />
              <span className="ml-[15px]">Your account has been updated</span>
            </div>
          )}
        </div>
      </div>
    )
  );
}
