import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "./Link";
import {
  SHARE_BUTTON_TEXT,
  SHARE_HEADER,
  SHARE_INPUT_FIELD,
  SHARE_MODAL_CONTAINER,
} from "../styles/InvitesStyles";
import { INSTRUCTIONS, SMALL_GREEN_BUTTON } from "../styles/GeneralStyles";

interface FormData {
  recipientName: string;
}
interface ChildProps {
  docId: any;
  title?: string;
  type?: string;
}
export default function ShareModal({ type, docId, title }: ChildProps) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      recipientName: "",
    },
  });

  const [shareAttempted, setShareAttempted] = useState(false);
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);
  const [doesNotExist, setDoesNotExist] = useState(false);
  const [alreadyShared, setAlreadyShared] = useState(false);
  const [inviteFailed, setInviteFailed] = useState(false);
  const [shareInput, setShareInput] = useState("");

  const fetchInvite = async (docId: number | undefined, recipient: string) => {
    try {
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ docId: docId, recipient: recipient }),
      });
      const { message } = await response.json();
      setShareAttempted(true);
      switch (message) {
        case "Invite sent":
          return setSent(true);
        case "Document has already been shared with user":
        case "A similar invite exists":
        case "User already has access":
          return setAlreadyShared(true);
        case "Recipient does not exist":
          return setDoesNotExist(true);
        case "Invite failed":
          return setInviteFailed(true);
        default:
          console.error("Invite failed. An unexpected error has occured.");
          return setInviteFailed(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setShareInput("");
  }, [open]);

  const resetInviteStates = () => {
    setOpen(false);
    setShareAttempted(false);
    setSent(false);
    setDoesNotExist(false);
    setAlreadyShared(false);
    setInviteFailed(false);
    setShareInput("");
  };

  const handleChange = (value: string) => {
    setShareInput(value);
  };

  const handleInvite = async (data: FormData) => {
    if (!data.recipientName) {
      setShareInput("");
      return null;
    }
    await fetchInvite(docId, data.recipientName);
    setShareInput("");
  };

  const inviteResponseText = () => {
    if (sent) {
      return "Invite successful!";
    }
    if (alreadyShared) {
      return "User already has access to this document";
    }
    if (doesNotExist) {
      return "User doesn't exist. Please try again.";
    }
    if (inviteFailed) {
      return "Something went wrong. Try again later.";
    }
  };

  return (
    <DropdownMenu.Root open={open ? true : false}>
      <DropdownMenu.Trigger asChild onClick={() => setOpen(true)}>
        {type === "button" ? (
          <button className={SHARE_BUTTON_TEXT}>
            <Link />
            <span className="ml-[0.83rem]">Share</span>
          </button>
        ) : (
          <button className={SHARE_BUTTON_TEXT}>Share</button>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={SHARE_MODAL_CONTAINER}
          onInteractOutside={() => {
            setOpen(false);
          }}
        >
          <h2 className={SHARE_HEADER}>
            Share "{title ? title : "Untitled Document"}"
          </h2>
          {shareAttempted ? (
            <div className="flex flex-col">
              <span className={INSTRUCTIONS}>{inviteResponseText()}</span>
              <button
                className={SMALL_GREEN_BUTTON}
                onClick={() => {
                  resetInviteStates();
                }}
              >
                OK
              </button>
            </div>
          ) : (
            <div>
              <span className={INSTRUCTIONS}>
                Enter your friend/colleague's username
              </span>
              <form onSubmit={handleSubmit(handleInvite)} autoComplete="off">
                <div>
                  <input
                    className={SHARE_INPUT_FIELD}
                    id="titleInput"
                    type="text"
                    {...register("recipientName")}
                    autoComplete="off"
                    value={shareInput}
                    onChange={(e) => handleChange(e.target.value)}
                  />
                  {doesNotExist && <p>User doesn't exist!</p>}
                </div>
                <div className="flex flex-row justify-between">
                  <button className={SMALL_GREEN_BUTTON} type="submit">
                    Share
                  </button>
                  <button
                    className={SMALL_GREEN_BUTTON}
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
