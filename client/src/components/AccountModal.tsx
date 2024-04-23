import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import React, { useState } from "react";
import AccountCircle from "./AccountCircle";
import LogoutButton from "./LogoutButton";

export default function AccountModal() {
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
          <a
            href="#/account"
            className="relative p-2 pb-3 top-8 right-6 h-12 w-28 border-solid border rounded-lg"
          >
            Edit Profile
          </a>
          <LogoutButton />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
