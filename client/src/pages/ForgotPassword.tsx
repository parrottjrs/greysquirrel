import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { STYLES } from "../utils/styles";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import CheckMark from "../components/CheckMark";
import ShowPassword from "../components/ShowPasword";
import ExclamationMark from "../components/ExclamationMark";

interface EmailFormData {
  email: string;
}
interface PasswordFormData {
  password: string;
  passwordCheck: string;
}
const VerifyAccount = () => {
  const [emailSent, setEmailSent] = useState(false);
  const { register, handleSubmit } = useForm({
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
  };
  return (
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
          <span className={STYLES.BOLD_GRAY_TEXT}>
            If the email you provided exists, an email will be sent to that
            address
          </span>
        </div>
      )}
    </div>
  );
};

const ResetPassword = () => {
  const [show, setShow] = useState(false);
  const [weakPassword, setWeakPassword] = useState(false);
  const [passwordsDontMatch, setPasswordsDontMatch] = useState(false);
  const [accountUpdated, setAccountUpdated] = useState(false);
  const [passwordChangeFailed, setPasswordChangeFailed] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: { password: "", passwordCheck: "" },
  });

  const fetchchangePassword = async (password: string) => {
    const response = await fetch("/api/change-password", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ password: password }),
    });

    if (!response.ok) {
      setPasswordChangeFailed(true);
    }
    setPasswordChangeFailed(false);
    setAccountUpdated(true);
  };

  const checkPasswordRestrictions = (password: string) => {
    const restrictions =
      /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    const strongPassword = restrictions.test(password);
    strongPassword ? setWeakPassword(false) : setWeakPassword(true);
    return strongPassword;
  };

  const doPasswordsMatch = (passwordOne: string, passwordTwo: string) => {
    const passwordsMatch = passwordOne === passwordTwo;
    passwordsMatch ? setPasswordsDontMatch(false) : setPasswordsDontMatch(true);
    return passwordsMatch;
  };

  const checkUserEntry = (passwordOne: string, passwordTwo: string) => {
    const strongPassword = checkPasswordRestrictions(passwordOne);
    const passwordsMatch = doPasswordsMatch(passwordOne, passwordTwo);
    if (!strongPassword || !passwordsMatch) {
      return false;
    }
    return true;
  };

  const handleChange = () => {
    setShow(!show);
  };

  const handleUpdate = (data: PasswordFormData) => {
    const { password, passwordCheck } = data;

    const userEntryOK = checkUserEntry(password, passwordCheck);

    if (userEntryOK) {
      fetchchangePassword(password);
    }
  };

  const onSubmit = (data: PasswordFormData) => {
    handleUpdate(data);
  };

  return (
    <div className="w-[403px] m-auto mt-32 flex flex-col items-center justify-center">
      <h1 className="text-[32px] text-nero font-IBM font-medium text-center">
        Reset your password
      </h1>
      <div className="m-auto w-[404px] flex flex-col items-center justify-center">
        <form
          className={STYLES.FLEX_COL_CENTER}
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <div className="mt-10">
            <label className={STYLES.LABEL} htmlFor={"password"}>
              Password
            </label>
            <input
              className={STYLES.FORM_INPUT}
              id={"password"}
              type={!show ? "password" : "text"}
              {...register("password")}
              autoComplete="off"
            />
            <ShowPassword onClick={handleChange} show={show} />
            {weakPassword && (
              <div className={STYLES.ALERT_DIV}>
                <span className="mr-2 -mt-8">
                  <ExclamationMark />
                </span>
                <p className={STYLES.ALERT_TEXT}>
                  Password must be at least{" "}
                  <span className="font-medium">8 characters</span> and have at
                  least{" "}
                  <span className="font-medium">
                    one uppercase letter, one lowercase letter, one digit
                  </span>
                  , and{" "}
                  <span className="font-medium">one special character</span>.
                </p>
              </div>
            )}
          </div>
          <div className="mt-10">
            <label className={STYLES.LABEL} htmlFor={"passCheck"}>
              Confirm password
            </label>
            <input
              className={STYLES.FORM_INPUT}
              id={"passwordCheck"}
              type={!show ? "password" : "text"}
              {...register("passwordCheck")}
              autoComplete="off"
            />
            {passwordsDontMatch && (
              <div className={STYLES.ALERT_DIV}>
                <span className="mr-2">
                  <ExclamationMark />
                </span>
                <p className={STYLES.ALERT_TEXT}>Passwords must match.</p>
              </div>
            )}
          </div>
          <button
            className="mt-12 mb-12 w-full h-9 py-1 text-nero text-sm font-sans font-medium bg-aeroBlue gap-2.5 rounded-xl border-0"
            type="submit"
            value="submit"
          >
            Change password
          </button>
        </form>
        {accountUpdated && (
          <div className="flex flex-row justify-center w-[385px] py-[0.56rem] px-[19px] border border-solid rounded-[0.88rem] border-aeroBlue">
            <CheckMark />
            <span className={STYLES.BOLD_GRAY_TEXT}>
              Your password has been changed!{" "}
              <a href="#/documents" className={STYLES.FORGOT_PASSWORD_TEXT}>
                Visit your documents
              </a>
            </span>
          </div>
        )}
        {passwordChangeFailed && (
          <div className="flex flex-row justify-center w-[385px] py-[0.56rem] px-[19px] border border-solid rounded-[0.88rem] border-aeroBlue">
            <ExclamationMark />
            <span className={STYLES.BOLD_GRAY_TEXT}>
              Password change failed. Please try again.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ForgotPassword() {
  const params = useParams();
  const verificationToken = params.verificationToken;
  const [verified, setVerified] = useState(false);

  const verifyUser = async () => {
    const response = await fetch("/api/verify-forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ verificationToken: verificationToken }),
    });
    const json = await response.json();

    if (!json.success) {
      return false;
    }
    setVerified(true);
  };

  useEffect(() => {
    if (verificationToken) {
      verifyUser();
    }
  }, [verificationToken]);

  return (
    <div>
      <Navbar />
      {!verified ? <VerifyAccount /> : <ResetPassword />}
    </div>
  );
}
