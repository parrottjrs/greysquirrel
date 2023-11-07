import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const navigate = useNavigate();

  const fetchUser = async (data) => {
    const username = data.username;
    try {
      const response = await fetch("/api/signIn", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: data }),
      });
      const text = await response.text();
      switch (text) {
        case "successful":
          navigate(`/${username}/documents`);
          break;
        case "unsuccessful":
          alert("Something went wrong. Please try again.");
          break;
        default:
          console.error("an unexpected error has occured.");
      }
    } catch (error) {
      console.error(error);
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
        <div>
          <label htmlFor="username">{"username"}</label>
          <input
            id="username"
            type="text"
            {...register("username")}
            autoComplete="off"
            required={true}
          />
        </div>
        <div>
          <label htmlFor="password">{"password"}</label>
          <input
            id="password"
            type="password"
            {...register("password")}
            autoComplete="off"
            required={true}
          />
        </div>
        <input type="submit" value="sign in" />
      </form>
      <label htmlFor="signup">{"New to ://greysquirrel?"}</label>
      <a id="signup" href="/#signup">
        Sign up here!
      </a>
    </div>
  );
}
