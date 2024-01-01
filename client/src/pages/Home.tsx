import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import { STYLES } from "../utils/consts";
import { AlertCircle } from "lucide-react";

type Form = {
  username: string;
  password: string;
};

export default function Signin() {
  const [change, setChange] = useState(false);
  const [password, setPassword] = useState("");
  const { register, handleSubmit } = useForm({
    defaultValues: {
      username: "",
      password: "",
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
            type={"password"}
            register={register("password")}
            required={true}
          />

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
