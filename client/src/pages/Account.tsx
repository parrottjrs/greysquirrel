import React from "react";
import { STYLES } from "../utils/styles/styles";
import LogoutButton from "../components/LogoutButton";
import Navbar from "../components/Navbar";

export default function Account() {
  return (
    <div>
      <Navbar isLoggedIn={true} />
      <h1 className={STYLES.WELCOME_HEADER}>Account</h1>
      <LogoutButton />
    </div>
  );
}
