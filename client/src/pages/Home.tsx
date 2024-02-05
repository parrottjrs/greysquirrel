import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { STYLES } from "../utils/consts";
import { AlertCircle } from "lucide-react";
import Eye from "../components/Eye";

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

  const fetchUser = async (data: FormData) => {
    data.username = data.username.toLowerCase();
    try {
      const response = await fetch("/api/signIn", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: data }),
      });
      const json = await response.json();
      switch (json.message) {
        case "Access granted":
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
    <div className={STYLES.CENTER}>
      <h1 className={STYLES.WELCOME_HEADER}>Welcome Back!</h1>

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
          <div />

          <input
            className={
              !change ? STYLES.LOGIN_BUTTON : STYLES.LOGIN_BUTTON_ALERT
            }
            type="submit"
            value="Log In"
          />
          <label htmlFor="remember">Remember me for 30 days</label>
          <input id="remember" type="checkbox" {...register("remember")} />
        </form>
        <div className={STYLES.SIGN_IN_DIVIDER} />
      </div>
      <div>
        <label className={STYLES.LABEL} htmlFor="signup">
          {"Don't have an account?"}{" "}
        </label>
        <a className={STYLES.VIOLET_TEXT} id="signup" href="/#signup">
          Sign up here!
        </a>
      </div>
    </div>
  );
}
