import React from "react";
import { STYLES } from "../utils/styles";
import Navbar from "../components/Navbar";

export default function Notifications() {
  return (
    <div>
      <Navbar isLoggedIn={true} />
      <h1 className={STYLES.WELCOME_HEADER}>Notifications</h1>
    </div>
  );
}
