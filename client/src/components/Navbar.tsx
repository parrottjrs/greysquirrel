import React from "react";
import { STYLES } from "../utils/styles";
import { BellIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";

interface ChildProps {
  isLoggedIn?: boolean;
}

export default function Navbar({ isLoggedIn }: ChildProps) {
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

  return (
    <header className="h-18 md:h-16 flex flex-row items-center justify-between p-1">
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
              <a href="#/notifications">
                <BellIcon className="text-nero h-6 w-6" />
              </a>
              <button className={STYLES.STYLIZED_ANCHOR} onClick={handleClick}>
                New Document
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
