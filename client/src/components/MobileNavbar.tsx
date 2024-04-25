import React, { useState } from "react";
import {
  MOBILE_LINK_CONTAINER,
  MOBILE_NAVBAR_ANCHOR,
  NAVBAR_BUTTON_BLACK,
  NAVBAR_TITLE_TEXT,
} from "../styles/NavbarStyles";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import MobileNavTrigger from "./MobileNavTrigger";
import { useLogout } from "../hooks/useLogout";
import { TRANSPARENT_BUTTON_BOLD } from "../styles/GeneralStyles";

export default function MobileNavbar() {
  const { handleLogout } = useLogout();
  const [open, setOpen] = useState(false);

  return (
    <div className=" flex flex-row justify-between items-center">
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
              <button className={NAVBAR_BUTTON_BLACK} onClick={handleLogout}>
                Sign out
              </button>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
