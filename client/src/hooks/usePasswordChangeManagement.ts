import { useState } from "react";
import { useForm } from "react-hook-form";
import { PasswordFormData } from "../utils/customTypes";

export const usePasswordChangeManagement = () => {
  const [showPass, setShowPass] = useState(false);
  const [passIsWeak, setPassIsWeak] = useState(false);
  const [passMatch, setPassMatch] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [passChangeFailed, setPassChangeFailed] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: { password: "", passwordCheck: "" },
  });

  const checkPasswordRestrictions = (password: string) => {
    const restrictions =
      /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    const strongPassword = restrictions.test(password);
    strongPassword ? setPassIsWeak(false) : setPassIsWeak(true);
    return strongPassword;
  };

  const doPasswordsMatch = (passwordOne: string, passwordTwo: string) => {
    const passwordsMatch = passwordOne === passwordTwo;
    passwordsMatch ? setPassMatch(true) : setPassMatch(false);
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

  const fetchchangePassword = async (password: string) => {
    const response = await fetch("/api/user/forgot-password/update", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ password: password }),
    });

    if (!response.ok) {
      return setPassChangeFailed(true);
    }
    setPassChangeFailed(false);
    setUpdateSuccess(true);
  };

  const handleShowPass = () => {
    setShowPass(!showPass);
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

  return {
    handleSubmit,
    onSubmit,
    showPass,
    register,
    handleShowPass,
    passIsWeak,
    passMatch,
    updateSuccess,
    passChangeFailed,
  };
};
