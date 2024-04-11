import React, { useEffect, useState } from "react";
import { STYLES } from "../utils/styles";
import BellDot from "./BellDot";
import Bell from "./Bell";
import AccountModal from "./AccountModal";
import { removeHasSignedUp } from "../utils/functions";

interface ChildProps {
  isLoggedIn?: boolean;
  page?: string;
}

export default function Navbar({ isLoggedIn, page }: ChildProps) {
  const invitesRefreshDelay = 900000;
  const [pendingInvites, setPendingInvites] = useState(false);

  const countInvites = async () => {
    try {
      const response = await fetch("/api/count-invites");
      const { success } = await response.json();
      success ? setPendingInvites(true) : setPendingInvites(false);
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  useEffect(() => {
    if (page !== "notifications" && isLoggedIn) {
      countInvites();
    }
  }, []);

  useEffect(() => {
    if (page !== "notifications" && isLoggedIn) {
      let interval = setInterval(() => {
        countInvites();
      }, invitesRefreshDelay);
      return () => clearInterval(interval);
    }
  }, [pendingInvites]);

  return (
    <header className="z-10 h-18 w-full md:h-16 flex flex-row items-center bg-white justify-between p-1 fixed inset-0">
      <div className="w-full">
        <nav className="justify-between md:flex md:w-auto px-7" id="navbar">
          <h1 className={STYLES.NAVBAR_HEADER}>Greysquirrel</h1>
          {!isLoggedIn ? (
            <div className={STYLES.LINK_CONTAINER}>
              <a
                href="#/"
                className={STYLES.BASIC_LINK}
                onClick={() => {
                  removeHasSignedUp();
                }}
              >
                About
              </a>
              <a href="#/signin" className={STYLES.STYLIZED_ANCHOR}>
                Sign in
              </a>
            </div>
          ) : (
            <div className={STYLES.LINK_CONTAINER}>
              <a href="#/documents" className={STYLES.BASIC_LINK}>
                Documents
              </a>
              <a aria-label="notifications" href="#/notifications">
                {pendingInvites ? <BellDot /> : <Bell />}
              </a>
              <span className="cursor-pointer">
                <AccountModal />
              </span>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
