import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import Eye from "../components/Eye";
import { STYLES } from "../utils/consts";

type Form = {
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

  const signup = async (data: Form) => {
    data.username = data.username.toLowerCase();
    try {
      const response = await fetch("/api/signUp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: data }),
      });
      const json = await response.json();
      const message = json.message;
      switch (message) {
        case "Bad request: User already exists":
          setNameWarning(true);
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

  const handlePasswordValidation = (data: Form) => {
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

  return (
    <div className={STYLES.CENTER}>
      <h1 className={STYLES.WELCOME_HEADER}>Sign Up</h1>
      <form
        className={STYLES.FLEX_COL_CENTER}
        onSubmit={handleSubmit((data) => {
          handlePasswordValidation(data);
        })}
      >
        <FormInput
          id={"username"}
          type={"username"}
          register={register("username")}
          required={true}
        />
        {nameWarning && (
          <p className="text-red-600">You must choose a different username.</p>
        )}
        <FormInput id={"email"} type={"email"} register={register("email")} />
        <FormInput
          id={"firstName"}
          type={"firstName"}
          register={register("firstName")}
        />
        <FormInput
          id={"lastName"}
          type={"lastName"}
          register={register("lastName")}
        />
        <FormInput
          id={"password"}
          type={!show ? "password" : "text"}
          register={register("password")}
          required={true}
        />
        <Eye onClick={handleChange} show={show} />
        <FormInput
          id={"passCheck"}
          type={!show ? "password" : "text"}
          register={register("passCheck")}
          required={true}
        />
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
