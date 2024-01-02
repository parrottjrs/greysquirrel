import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import { STYLES } from "../utils/consts";
import { AlertCircle, EyeOff } from "lucide-react";
import Eye from "../components/Eye";

type Form = {
  username: string;
  password: string;
  remember: boolean;
};

export default function Signin() {
  const [change, setChange] = useState(false);
  const [show, setShow] = useState(false);
  const [checked, setChecked] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      username: "",
      password: "",
      remember: checked,
    },
  });

  const navigate = useNavigate();

  const fetchUser = async (data: Form) => {
    data.username = data.username.toLowerCase();
    try {
      const response = await fetch("/api/signIn", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: data }),
      });

      const json = await response.json();
      const message = json.message;
      switch (message) {
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
  const handleChecked = () => {
    return setChecked(!checked);
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
          onSubmit={handleSubmit((data) => {
            fetchUser(data);
          })}
        >
          <FormInput
            id="Username"
            type="text"
            register={register("username")}
            required={true}
          />

          <FormInput
            id={"Password"}
            type={!show ? "password" : "text"}
            register={register("password")}
            required={true}
          />
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
          <label className={STYLES.LABEL} htmlFor="remember">
            Remember me for 30 days
          </label>
          <input
            id="remember"
            type="checkbox"
            checked={checked}
            {...register("remember")}
            onChange={handleChecked}
          />
          <input
            className={
              !change ? STYLES.LOGIN_BUTTON : STYLES.LOGIN_BUTTON_ALERT
            }
            type="submit"
            value="Log In"
          />
        </form>
        <div className={STYLES.SIGN_IN_DIVIDER} />
      </div>

      <div>
        {" "}
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
