import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [checked, setChecked] = useState(false);
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

  const checkPassword = (pass: string) => {
    var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(pass);
  };

  const handleChange = () => {
    setChecked(!checked);
  };

  const fetchSignup = async (data) => {
    try {
      const response = await fetch("/api/signUp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: data }),
      });
      const text = await response.text();
      switch (text) {
        case "unsuccessful":
          alert("You must choose a different username!");
          break;
        case "success":
          navigate(`/${data.username}/documents`);
          break;
        default:
          console.error("something went wrong");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>{"Sign Up"}</h1>
      <form
        onSubmit={handleSubmit((data) => {
          if (!checkPassword(data.password)) {
            alert(
              "password must contain at least one of each:\n- Uppercase letter\n- Lowercase letter\n- Digit (0-9)\n- Special character (! @ # $ %, etc.)"
            );
            return;
          }
          if (data.password !== data.passCheck) {
            alert("passwords must match!");
            return;
          }
          fetchSignup(data);
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
        <p>
          Password must be at least 8 characters and have at least one uppercase
          letter, one lowercase letter, one digit, and one special character
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
