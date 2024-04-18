import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { STYLES } from "../utils/styles";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import CheckMark from "../components/CheckMark";

export default function ForgotPassword() {
  const params = useParams();
  const verificationToken = params.verificationToken;

  const [verified, setVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailIsLegit, setEmailIsLegit] = useState(true);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = () => {
    setEmailSent(true);
  };

  return (
    <div>
      <Navbar />
      <div className="w-[403px] m-auto mt-32 flex flex-col items-center justify-center">
        <h1 className="text-[32px] text-nero font-IBM font-medium text-center">
          Verify your account
        </h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-10">
            <label htmlFor="email"></label>
            <input
              className={STYLES.FORM_INPUT}
              id="email"
              type="email"
              placeholder="yourname@example.com"
              title="please enter a valid email address"
              {...register("email")}
              autoComplete="off"
              required={true}
            />
          </div>
          <button
            className="mt-12 mb-12 w-full h-9 py-1 text-nero text-sm font-sans font-medium bg-aeroBlue gap-2.5 rounded-xl border-0"
            type="submit"
            value="submit"
          >
            Send link
          </button>
        </form>

        {!emailSent ? (
          <p className="text-nero text-center text-lg">
            A secure link will be sent to your email so that you can reset your
            password.
          </p>
        ) : (
          <div className="flex flex-row justify-center  items-center w-full px-2 py-1 border border-solid rounded-[0.88rem] border-aeroBlue">
            <CheckMark />
            <span className={STYLES.BOLD_GRAY_TEXT}>Email sent</span>
          </div>
        )}
      </div>
    </div>
  );
}
