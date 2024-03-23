import { useEffect, useState } from "react";
import { set, useForm } from "react-hook-form";
import { STYLES } from "../utils/styles";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "./Link";

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
          <button className="bg-transparent py-[0.56rem] px-[1.19rem] gap-[0.83rem] border border-solid border-nero rounded-[0.88rem] font-IBM text-xl font-medium">
            <Link />
            <span className="ml-[0.83rem]">Share</span>
          </button>
        ) : (
          <button className={STYLES.OPTIONS_TEXT}>Share</button>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="fixed flex flex-col items-left -top-24 right-36 max-h-60 w-96 p-4 pr-10 drop-shadow-2xl rounded-lg bg-white"
          onInteractOutside={() => {
            setOpen(false);
          }}
        >
          <h2 className={`${STYLES.DOC_HEADER} pb-4`}>
            Share "{title ? title : "Untitled Document"}"
          </h2>
          {shareAttempted ? (
            <div className="flex flex-col">
              <span className={STYLES.INSTRUCTIONS}>
                {inviteResponseText()}
              </span>
              <button
                className={STYLES.CREATE_BUTTON}
                onClick={() => {
                  resetInviteStates();
                }}
              >
                OK
              </button>
            </div>
          ) : (
            <div>
              <span className={STYLES.INSTRUCTIONS}>
                Enter your friend/colleague's username
              </span>
              <form onSubmit={handleSubmit(handleInvite)} autoComplete="off">
                <div>
                  <input
                    className={STYLES.FORM_INPUT}
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
                  <button className={STYLES.CREATE_BUTTON} type="submit">
                    Share
                  </button>
                  <button
                    className={STYLES.CREATE_BUTTON}
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
