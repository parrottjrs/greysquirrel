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
          className="z-20 flex flex-col justify-center items-start gap-[6px] relative px-[13px] py-[10px] top-[18px] right-[18px] h-[84px]  w-[96px]  bg-white shadow-[0_4px_24.6px_rgba(196,196,196,1)] rounded-[14px]"
          onInteractOutside={() => {
            setOpen(false);
          }}
        >
          <a
            href="#/account"
            className="text-nero text-[18px] font-IBM no-underline"
          >
            Edit Profile
          </a>
          <button className={TRANSPARENT_BUTTON_NORMAL} onClick={handleLogout}>
            Sign out
          </button>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
