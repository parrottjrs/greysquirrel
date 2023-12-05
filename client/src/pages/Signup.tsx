import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type Form = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  passCheck: string;
};

export default function Signup() {
  const [checked, setChecked] = useState(false);
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

  const checkPassword = (password: string) => {
    const restrictions =
      /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return restrictions.test(password);
  };

  const handleChange = () => {
    setChecked(!checked);
  };

  const signup = async (data: Form) => {
    data.username = data.username.toLowerCase();
    try {
      const response = await fetch("/api/signUp", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: data }),
      });
      const json = await response.json();
      const message = json.message;
      switch (message) {
        case "Bad request: Password does not meet site requirements":
          setNameWarning(true);
          break;
        case "User created":
          navigate(`/documents`);
          break;
        default:
          console.error("An unexpected error has occurred");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <form
        onSubmit={handleSubmit((data) => {
          if (!checkPassword(data.password)) {
            setPassWarning(true);
            if (data.password !== data.passCheck) {
              setPassMatch(true);
              return;
            }
            return;
          }
          setPassWarning(false);
          if (data.password !== data.passCheck) {
            setPassMatch(true);
            return;
          }
          signup(data);
        })}
      >
        <div>
          <label htmlFor="username">{"username: "}</label>
          <input
            id="username"
            type="text"
            {...register("username")}
            autoComplete="off"
            required={true}
          />
        </div>
        {nameWarning && (
          <p className="text-red-600">You must choose a different username.</p>
        )}
        <div>
          <label htmlFor="email">{"email: "}</label>
          <input
            id="email"
            type="text"
            {...register("email")}
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="firstName">{"First name: "}</label>
          <input
            id="firstName"
            type="text"
            {...register("firstName")}
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="lastName">{"Last name: "}</label>
          <input
            id="lastName"
            type="text"
            {...register("lastName")}
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="password">{"Choose a password: "}</label>
          <input
            id="password"
            type={!checked ? "password" : "text"}
            {...register("password")}
            autoComplete="off"
            required={true}
          />
        </div>
        <div>
          <label htmlFor="passCheck">{"Re-enter your password: "}</label>
          <input
            id="passCheck"
            type={!checked ? "password" : "text"}
            {...register("passCheck")}
            autoComplete="off"
            required={true}
          />
        </div>
        {passMatch && <p className="text-red-600">Passwords must match.</p>}
        <p className={!passWarning ? "" : "text-red-600"}>
          Password must be at least 8 characters and have at least one uppercase
          letter, one lowercase letter, one digit, and one special character.
        </p>
        <div>
          <label htmlFor="showPass">{"Show password "}</label>
          <input
            id="showPass"
            type="checkbox"
            onChange={() => handleChange()}
          />
        </div>
        <input type="submit" value="submit" />
      </form>
    </div>
  );
}
