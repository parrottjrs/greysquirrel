import React, { useEffect, useState } from "react";
import { STYLES } from "../utils/styles/styles";
import LogoutButton from "../components/LogoutButton";
import Navbar from "../components/Navbar";
import { AlertCircle } from "lucide-react";
import Eye from "../components/Eye";
import { useForm } from "react-hook-form";
import { authenticate, refresh } from "../utils/functions";
import { useNavigate } from "react-router-dom";

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
  const { register, handleSubmit } = useForm({
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      passCheck: "",
    },
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
      const authorized = await authenticate();
      if (!authorized) {
        navigate("/signin");
      }
      setAuthorization(true);
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
      // const response = await fetch("/api/signUp", {
      //   method: "POST",
      //   headers: { "content-type": "application/json" },
      //   body: JSON.stringify({ data: trimmedData }),
      // });
      // const json = await response.json();
      // switch (json.message) {
      //   case "User already exists":
      //     setUserExists(true);
      //     break;
      //   case "User created":
      //     localStorage.setItem("hasSignedUp", "true");
      //     navigate(`/verify-email`);
      //     break;
      //   default:
      //     console.error("An unexpected error has occurred");
      //     break;
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

  const handleSignup = (data: FormData) => {
    const { password, passCheck } = data;
    const userEntryOK = checkUserEntry(password, passCheck);

    if (userEntryOK) {
      updateUserInfo(data);
    }
  };

  const onSubmit = (data: FormData) => {
    handleSignup(data);
  };

  useEffect(() => {
    authenticateUser();
  }, []);

  useEffect(() => {
    let interval = setInterval(() => refreshToken(), refreshTokenDelay);
    return () => clearInterval(interval);
  }, [authorization]);

  return (
    authorization && (
      <div>
        <Navbar isLoggedIn={true} />
        <div className={`${STYLES.SIGNUP_PARENT_CONTAINER} mt-36`}>
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
                required={true}
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
                required={true}
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
                required={true}
              />
              {userExists && (
                <div className={STYLES.ALERT_DIV}>
                  <AlertCircle className={STYLES.ALERT_CIRCLE} />
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
                required={true}
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
                required={true}
              />
              <Eye onClick={handleChange} show={show} />
              {weakPassword && (
                <div className="relative">
                  <div className="absolute">
                    <AlertCircle
                      className={`${STYLES.ALERT_CIRCLE} relative top-4`}
                    />
                    <p
                      className={`${STYLES.ALERT_TEXT} relative left-3 bottom-5`}
                    >
                      Password must be at least{" "}
                      <span className={STYLES.BOLD}>8 characters</span> and have
                      at least{" "}
                      <span className={STYLES.BOLD}>
                        one uppercase letter, one lowercase letter, one digit
                      </span>
                      , and{" "}
                      <span className={STYLES.BOLD}>one special character</span>
                      .
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-24">
              <label className={STYLES.LABEL} htmlFor={"passCheck"}>
                Confirm your password:
              </label>
              <input
                className={STYLES.FORM_INPUT}
                id={"passCheck"}
                type={!show ? "password" : "text"}
                {...register("passCheck")}
                autoComplete="off"
                required={true}
              />
              {passwordsDontMatch && (
                <div className={STYLES.ALERT_DIV}>
                  <AlertCircle className={STYLES.ALERT_CIRCLE} />
                  <p className={STYLES.ALERT_TEXT}>Passwords must match.</p>
                </div>
              )}
            </div>

            <button
              className={STYLES.SIGNUP_BUTTON}
              type="submit"
              value="submit"
            >
              Update information
            </button>
            <div className={STYLES.SIGN_IN_DIVIDER} />
          </form>
          <LogoutButton />
        </div>
      </div>
    )
  );
}
