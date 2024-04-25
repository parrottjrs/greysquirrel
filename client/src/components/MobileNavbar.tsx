import React, { useState } from "react";
import {
  MOBILE_LINK_CONTAINER,
  NAVBAR_TITLE_TEXT,
} from "../styles/NavbarStyles";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import MobileNavTrigger from "./MobileNavTrigger";
import { useLogout } from "../hooks/useLogout";
import {
  MOBILE_NAVBAR_ANCHOR,
  TRANSPARENT_BUTTON,
} from "../styles/GeneralStyles";

export default function MobileNavbar() {
  const { handleLogout } = useLogout();
  const [open, setOpen] = useState(false);

  return (
    <div className="px-[23px] flex flex-row justify-between items-center">
      <h1 className={NAVBAR_TITLE_TEXT}>Greysquirrel</h1>
      <DropdownMenu.Root open={open ? true : false}>
        <DropdownMenu.Trigger
          asChild={true}
          onClick={() => {
            setOpen(true);
          }}
        >
          <div className="">
            <MobileNavTrigger />
          </div>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            onInteractOutside={() => {
              setOpen(false);
            }}
          >
            <div className={MOBILE_LINK_CONTAINER}>
              <a className={MOBILE_NAVBAR_ANCHOR} href="#/documents">
                Documents
              </a>

              <a
                className={MOBILE_NAVBAR_ANCHOR}
                aria-label="notifications"
                href="#/notifications"
              >
                Notifications
              </a>

              <a
                className={`${MOBILE_NAVBAR_ANCHOR} w-[94px]`}
                aria-label="edit-profile"
                href="/account"
              >
                Edit Profile
              </a>
              <button className={TRANSPARENT_BUTTON} onClick={handleLogout}>
                Sign out
              </button>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
