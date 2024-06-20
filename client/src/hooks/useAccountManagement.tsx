import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { authenticate, refresh } from "../utils/functions";
import { AccountChangeData } from "../utils/customTypes";

export const useAccountManagement = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const refreshTokenDelay = 540000; //nine minutes;
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [passIsWeak, setPassIsWeak] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [passMatch, setPassMatch] = useState(true);
  const [authorization, setAuthorization] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: async () => getUserInfo(),
  });

  const refreshToken = async () => {
    try {
      const { success } = await refresh();
      if (!success) {
        navigate("/signin");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getUserInfo = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/user/account`);
      if (response.ok) {
        const json = await response.json();
        return json.userInfo;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateUserInfo = async (data: AccountChangeData) => {
    const trimmedData = {
      username: data.username.toLowerCase().trim(),
      email: data.email.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      password: data.password.trim(),
      passCheck: data.passCheck.trim(),
    };
    try {
      const response = await fetch(`${apiUrl}/api/user/account/update`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: trimmedData }),
      });
      const json = await response.json();
      switch (json.message) {
        case "Username in use":
          setUserExists(true);
          break;
        case "User info updated":
          setUpdateSuccess(true);
          break;
        default:
          console.error("An unexpected error has occurred");
          break;
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleShowPass = () => {
    setShowPass(!showPass);
  };

  const handleUpdate = (data: AccountChangeData) => {
    const { password, passCheck } = data;
    if (password === "" && passCheck === "") {
      updateUserInfo(data);
      return false;
    }
    const userEntryOK = checkUserEntry(password, passCheck);

    if (userEntryOK) {
      updateUserInfo(data);
    }
  };

  const onSubmit = (data: AccountChangeData) => {
    handleUpdate(data);
  };

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const { success } = await authenticate();
        if (!success) {
          navigate("/signin");
        }
        setAuthorization(true);
      } catch (err) {
        console.error(err);
      }
    };
    authenticateUser();
    getUserInfo();
  }, []);

  useEffect(() => {
    let interval = setInterval(() => refreshToken(), refreshTokenDelay);
    return () => clearInterval(interval);
  }, [authorization]);

  return {
    authorization,
    passIsWeak,
    handleSubmit,
    onSubmit,
    register,
    userExists,
    showPass,
    handleShowPass,
    passMatch,
    updateSuccess,
  };
};
