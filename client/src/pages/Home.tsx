import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";

type Form = {
  username: string;
  password: string;
};

export default function Home() {
  const [change, setChange] = useState(false);

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
    <div>
      <h1>://greysquirrel</h1>
      <form
        onSubmit={handleSubmit((data) => {
          fetchUser(data);
        })}
      >
        <FormInput
          id="username"
          type="text"
          register={register("username")}
          required={true}
        />
        <FormInput
          id={"password"}
          type={"password"}
          register={register("password")}
          required={true}
        />

        {!change ? (
          <div />
        ) : (
          <div>
            <p className="text-red-600">
              Authentication failed. Please try again.
            </p>
          </div>
        )}
        <input type="submit" value="sign in" />
      </form>
      <label htmlFor="signup">{"New to ://greysquirrel?"} </label>
      <button>
        <a id="signup" href="/#signup">
          Sign up here!
        </a>
      </button>
    </div>
  );
}
