import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Eye from "../components/Eye";
import { STYLES } from "../utils/consts";

type FormData = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  passCheck: string;
};

export default function Signup() {
  const [show, setShow] = useState(false);
  const [passWarning, setPassWarning] = useState(false);
  const [nameWarning, setNameWarning] = useState(false);
  const [passMatch, setPassMatch] = useState(false);
  const navigate = useNavigate();
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

  const signup = async (data: FormData) => {
    const trimmedData = {
      username: data.username.trim(),
      email: data.email.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      password: data.password.trim(),
      passCheck: data.passCheck.trim(),
    };

    // console.log("data:", data, "newData:", newData);
    try {
      const response = await fetch("/api/signUp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: trimmedData }),
      });
      const json = await response.json();
      switch (json.message) {
        case "User already exists":
          setNameWarning(true);
          console.log(nameWarning);
          break;
        case "User created":
          navigate(`/documents`);
          break;
        default:
          console.error("An unexpected error has occurred");
          break;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkPassword = (password: string) => {
    const restrictions =
      /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return restrictions.test(password);
  };

  const handleChange = () => {
    setShow(!show);
  };

  const handlePasswordValidation = (data: FormData) => {
    switch (checkPassword(data.password)) {
      case false:
        setPassWarning(true);
        data.password !== data.passCheck
          ? setPassMatch(true)
          : setPassMatch(false);
        break;
      case true:
        setPassWarning(false);
        if (data.password !== data.passCheck) {
          return setPassMatch(true);
        }
        signup(data);
        break;
      default:
        return console.error("Something went wrong");
    }
  };

  const onSubmit = (data: FormData) => {
    handlePasswordValidation(data);
  };

  return (
    <div className={STYLES.CENTER}>
      <h1 className={STYLES.WELCOME_HEADER}>Sign Up</h1>
      <form
        className={STYLES.FLEX_COL_CENTER}
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
      >
        <div className="mt-10">
          <label className={STYLES.LABEL} htmlFor={"username"}>
            * Username:
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
        {nameWarning && (
          <p className={STYLES.ALERT_TEXT}>
            You must choose a different username.
          </p>
        )}
        <div className="mt-10">
          <label className={STYLES.LABEL} htmlFor={"email"}>
            * Email:
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
          <label className={STYLES.LABEL} htmlFor={"firstName"}>
            First Name:
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
            Last Name:
          </label>
          <input
            className={STYLES.FORM_INPUT}
            id={"lastName"}
            {...register("lastName")}
            autoComplete="off"
          />
        </div>
        <div className="mt-10">
          <label className={STYLES.LABEL} htmlFor={"password"}>
            * Password:
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
        <Eye onClick={handleChange} show={show} />
        <div className="mt-10">
          <label className={STYLES.LABEL} htmlFor={"passCheck"}>
            * Re-enter password:
          </label>
          <input
            className={STYLES.FORM_INPUT}
            id={"passCheck"}
            type={!show ? "password" : "text"}
            {...register("passCheck")}
            autoComplete="off"
            required={true}
          />
        </div>
        <div className={STYLES.ALERT_DIV}>
          {passMatch && (
            <p className={STYLES.ALERT_TEXT}>Passwords must match.</p>
          )}
          <p className={!passWarning ? "" : STYLES.ALERT_TEXT}>
            Password must be at least 8 characters and have at least one
            uppercase letter, one lowercase letter, one digit, and one special
            character.
          </p>
        </div>
        <input className={STYLES.LOGIN_BUTTON} type="submit" value="submit" />
      </form>
    </div>
  );
}
