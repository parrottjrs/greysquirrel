import { useState } from "react";
import { useBreakpoints } from "../hooks/useBreakpoints";
import Navbar from "./Navbar";
import MobileNavbar from "./MobileNavbar";
import { useForm } from "react-hook-form";
import ExclamationMark from "./ExclamationMark";
import ShowPassword from "./ShowPasword";
import { PassFormProps } from "../utils/customTypes";
import {
  ALERT_DIV,
  ALERT_TEXT,
  FLEX_CENTER_LARGE,
  FLEX_COL_LEFT,
  FORM,
  FORM_INNER_CONTAINER,
  FORM_INPUT_FIELD,
  GENERIC_HEADER,
  GENERIC_PARAGRAPH,
  GREEN_BUTTON_STRETCH,
  INPUT_FIELD_LABEL,
} from "../styles/GeneralStyles";

export default function PasswordForm({ handleVerified }: PassFormProps) {
  const [showPassword, handleShowPassword] = useState(false);
  const [wrongPassword, setWrongPassword] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: { password: "" },
  });

  const verifyPassword = async (password: string) => {
    const response = await fetch("/api/verify-acct-mgmt", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ password: password }),
    });
    if (!response.ok) {
      return setWrongPassword(true);
    }
    setWrongPassword(false);
    handleVerified(true);
  };

  const onSubmit = (data: any) => {
    verifyPassword(data.password);
  };

  const { isMobile } = useBreakpoints();
  return (
    <div className={FLEX_CENTER_LARGE}>
      {!isMobile ? <Navbar isLoggedIn={true} /> : <MobileNavbar />}
      <div className={FLEX_COL_LEFT}>
        <h1 className={GENERIC_HEADER}>My Account</h1>
        <p className={GENERIC_PARAGRAPH}>First let's verify your account</p>
        <form
          className={FORM}
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <div className={FORM_INNER_CONTAINER}>
            <label className={INPUT_FIELD_LABEL} htmlFor={"password"}>
              Password
            </label>
            <input
              className={FORM_INPUT_FIELD}
              id={"password"}
              type={!showPassword ? "password" : "text"}
              {...register("password")}
              autoComplete="off"
            />
            <ShowPassword onClick={handleShowPassword} show={showPassword} />
            {wrongPassword && (
              <div className={ALERT_DIV}>
                <span className="mr-2">
                  <ExclamationMark />
                </span>
                <p className={ALERT_TEXT}>Password is incorrect.</p>
              </div>
            )}
          </div>
          <button className={GREEN_BUTTON_STRETCH} type="submit" value="submit">
            Update information
          </button>
        </form>
      </div>
    </div>
  );
}
