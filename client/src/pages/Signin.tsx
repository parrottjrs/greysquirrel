import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { STYLES } from "../utils/styles/styles";
import { AlertCircle } from "lucide-react";
import Eye from "../components/Eye";
import { authenticate } from "../utils/functions";
import Navbar from "../components/Navbar";

type FormData = {
  username: string;
  password: string;
  remember: boolean;
};

export default function Signin() {
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
      const authorized = await authenticate();
      if (authorized) {
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
      <Navbar />
      <div className={STYLES.SIGNIN_PARENT_CONTAINER}>
        <h1 className={STYLES.SIGNIN_HEADER}>Welcome Back!</h1>

        <p className={STYLES.INSTRUCTIONS}>
          Enter your credentials to access your account
        </p>
        <div>
          <form
            className={STYLES.FLEX_COL_CENTER}
            onSubmit={handleSubmit(onSubmit)}
            tabIndex={0}
          >
            <div className="mt-10">
              <label className={STYLES.LABEL} htmlFor={"username"}>
                Username:
              </label>
              <input
                className={STYLES.FORM_INPUT}
                id={"username"}
                type="text"
                {...register("username")}
                autoComplete="off"
                required={true}
              />
            </div>
            <div>
              <div className="mt-10">
                <label className={STYLES.LABEL} htmlFor={"password"}>
                  Password:
                </label>
                <input
                  className={STYLES.FORM_INPUT}
                  id={"password"}
                  type={!show ? "password" : "text"}
                  {...register("password")}
                  autoComplete="off"
                  required={true}
                />
              </div>

              <Eye onClick={handleShow} show={show} />

              {change && (
                <div className={STYLES.ALERT_DIV}>
                  <AlertCircle className={STYLES.ALERT_CIRCLE} />
                  <p className={STYLES.ALERT_TEXT}>
                    Authentication failed. Please try again.
                  </p>
                </div>
              )}
            </div>
            <div className={STYLES.REMEMBER_CONTAINER}>
              <input
                id="remember"
                type="checkbox"
                className={STYLES.CHECK_BOX}
                {...register("remember")}
              />
              <label className={STYLES.REMEMBER_TEXT} htmlFor="remember">
                Remember me for 30 days
              </label>
            </div>
            <button
              className={STYLES.LOGIN_BUTTON}
              type="submit"
              value="Log In"
            >
              Sign in
            </button>
          </form>
          <div className={STYLES.SIGN_IN_DIVIDER} />
        </div>
        <div>
          <label className={STYLES.LABEL} aria-label="signup">
            Don't have an account?
          </label>
          <a className={STYLES.VIOLET_TEXT} id="signup" href="#/signup">
            Sign up here!
          </a>
        </div>
      </div>
    </div>
  );
}
