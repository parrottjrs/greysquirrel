import React, { useEffect, useState } from "react";
import { STYLES } from "../utils/styles/styles";
import { useNavigate } from "react-router-dom";
import { LucideBell, LucideBellDot } from "lucide-react";

interface ChildProps {
  isLoggedIn?: boolean;
  page?: string;
}

export default function Navbar({ isLoggedIn, page }: ChildProps) {
  const invitesRefreshDelay = 900000;
  const [pendingInvites, setPendingInvites] = useState(false);
  const navigate = useNavigate();

  const fetchCreate = async () => {
    const response = await fetch("/api/create", {
      method: "POST",
      headers: { "content-type": "application /json" },
    });
    const json = await response.json();
    return json.docId;
  };

  const handleClick = async () => {
    const id = await fetchCreate();
    navigate(`/editor/${id}`);
  };

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
              <a href="#/" className={STYLES.BASIC_LINK}>
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
              <a href="#/account" className={STYLES.BASIC_LINK}>
                Account
              </a>
              <a aria-label="notifications" href="#/notifications">
                {pendingInvites ? (
                  <LucideBellDot className="text-roman h-6 w-6 " />
                ) : (
                  <LucideBell className="text-nero h-6 w-6" />
                )}
              </a>
              {page !== "editor" && (
                <button
                  className={STYLES.STYLIZED_ANCHOR}
                  onClick={handleClick}
                >
                  New Document
                </button>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
