import React, { useEffect, useState } from "react";
import { STYLES } from "../utils/styles/styles";
import BellDot from "./BellDot";
import Bell from "./Bell";
import AccountModal from "./AccountModal";
import { removeHasSignedUp } from "../utils/functions";
import {
  BASIC_LINK,
  LINK_CONTAINER,
  NAVBAR_CHILD_CONTAINER,
  NAVBAR_PARENT_CONTAINER,
  NAVBAR_TITLE_TEXT,
} from "../utils/styles/NavbarStyles";
import { STYLIZED_ANCHOR_GREEN } from "../utils/styles/GeneralStyles";

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
    <header className={NAVBAR_PARENT_CONTAINER}>
      <div className="w-full">
        <nav className={NAVBAR_CHILD_CONTAINER} id="navbar">
          <h1 className={NAVBAR_TITLE_TEXT}>Greysquirrel</h1>
          {!isLoggedIn ? (
            <div className={LINK_CONTAINER}>
              <a
                href="#/"
                className={BASIC_LINK}
                onClick={() => {
                  removeHasSignedUp();
                }}
              >
                About
              </a>
              <a href="#/signin" className={STYLIZED_ANCHOR_GREEN}>
                Sign in
              </a>
            </div>
          ) : (
            <div className={LINK_CONTAINER}>
              <a href="#/documents" className={BASIC_LINK}>
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
