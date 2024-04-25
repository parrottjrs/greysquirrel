import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import React, { useState } from "react";
import AccountCircle from "./AccountCircle";
import { TRANSPARENT_BUTTON_NORMAL } from "../styles/GeneralStyles";
import { useLogout } from "../hooks/useLogout";

export default function AccountModal() {
  const { handleLogout } = useLogout();
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu.Root open={open ? true : false}>
      <DropdownMenu.Trigger
        asChild
        onClick={() => {
          setOpen(true);
        }}
      >
        <div>
          <AccountCircle />
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="relative p-2 pb-3 top-8 right-6 h-12 w-28 border-solid border rounded-lg"
          onInteractOutside={() => {
            setOpen(false);
          }}
        >
          <a href="#/account">Edit Profile</a>
          <button className={TRANSPARENT_BUTTON_NORMAL} onClick={handleLogout}>
            Sign out
          </button>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
