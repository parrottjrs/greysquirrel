import { useState } from "react";
import { EmailFormData } from "../utils/customTypes";
import { useForm } from "react-hook-form";
import CheckMark from "./CheckMark";
import { useBreakpoints } from "../hooks/useBreakpoints";
import Navbar from "./Navbar";
import {
  BOLD_GRAY_TEXT,
  FLEX_CENTER_LARGE,
  FLEX_COL_LEFT,
  FORM_INPUT_FIELD,
  GENERIC_HEADER,
  GREEN_BUTTON_STRETCH,
  INPUT_FIELD_LABEL,
  SMALLER_HEADER,
  SUCCESS_CONTAINER,
} from "../styles/GeneralStyles";

export const ForgotPasswordRequest = () => {
  const { isMobile } = useBreakpoints();
  const [emailSent, setEmailSent] = useState(false);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const fetchForgotPassword = async (email: string) => {
    await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: email }),
    });
    setEmailSent(true);
  };

  const onSubmit = (data: EmailFormData) => {
    fetchForgotPassword(data.email);
    reset();
  };

  return (
    <>
      {!isMobile && <Navbar />}
      <div className={isMobile ? FLEX_COL_LEFT : FLEX_CENTER_LARGE}>
        {isMobile && <h1 className={GENERIC_HEADER}>Greysquirrel</h1>}

        <form
          className="flex flex-col md:items-center gap-[36px]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h1 className={SMALLER_HEADER}>Verify your account</h1>
          <div>
            <label className={INPUT_FIELD_LABEL} htmlFor="email">
              Enter your email
            </label>
            <input
              className={FORM_INPUT_FIELD}
              id="email"
              type="email"
              placeholder="yourname@example.com"
              title="please enter a valid email address"
              {...register("email")}
              autoComplete="off"
              required={true}
            />
          </div>
          <button className={GREEN_BUTTON_STRETCH} type="submit" value="submit">
            Send link
          </button>
        </form>
        {!emailSent ? (
          <p className="text-left text-nero text-[18px]">
            A secure link will be sent to your email so that you can reset your
            password.
          </p>
        ) : (
          <div className={SUCCESS_CONTAINER}>
            <CheckMark />
            <span className={BOLD_GRAY_TEXT}>Email sent</span>
          </div>
        )}
      </div>
    </>
  );
};
