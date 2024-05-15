import { useEffect, useState } from "react";
import BellDot from "./BellDot";
import AccountModal from "./AccountModal";
import { removeHasSignedUp } from "../utils/functions";
import { GENERIC_HEADER } from "../styles/GeneralStyles";
import { Notifications } from "@mui/icons-material";
import { NavbarProps } from "../utils/customTypes";
import {
  BASIC_LINK,
  LARGE_PARENT_CONTAINER,
  SIGNIN_BUTTON,
} from "../styles/NavbarStyles";

export default function Navbar({ isLoggedIn, page }: NavbarProps) {
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
    <header className={LARGE_PARENT_CONTAINER}>
      <h1 className={GENERIC_HEADER}>Greysquirrel</h1>
      {!isLoggedIn ? (
        <nav className="w-[254px] h-[45px] flex flex-row items-center justify-between">
          <a
            href="#/"
            className={BASIC_LINK}
            onClick={() => {
              removeHasSignedUp();
            }}
          >
            About
          </a>
          <a href="#/signin" className={SIGNIN_BUTTON}>
            Sign in
          </a>
        </nav>
      ) : (
        <nav className="w-[226px] h-[32px] flex flex-row items-center justify-between">
          <a href="#/documents" className={BASIC_LINK}>
            Documents
          </a>
          <a aria-label="notifications" href="#/notifications">
            {pendingInvites ? (
              <BellDot />
            ) : (
              <div>
                <Notifications sx={{ fontSize: 33, color: "black" }} />
              </div>
            )}
          </a>
          <span>
            <AccountModal />
          </span>
        </nav>
      )}
    </header>
  );
}
