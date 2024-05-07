import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { clipTitleForInvite } from "../utils/functions";
import { useBreakpoints } from "../hooks/useBreakpoints";
import AccountCircle from "./AccountCircle";
import { ShareFormData, ShareModalProps } from "../utils/customTypes";
import {
  SHARE_ATTEMPTED_CONTAINER,
  SHARE_BUTTON_GREEN,
  SHARE_HEADER,
  SHARE_INPUT_FIELD,
  SHARE_MODAL_CONTAINER,
} from "../styles/InvitesStyles";
import {
  BOLD_TEXT_BLACK,
  GENERIC_PARAGRAPH,
  INPUT_FIELD_LABEL,
} from "../styles/GeneralStyles";

const AuthorizedUsersList = ({ authorizedUsers }: any) => {
  if (authorizedUsers) {
    return authorizedUsers.map((user: string) => {
      const key = authorizedUsers.indexOf(user);
      return (
        <div key={key} className="flex flex-row gap-[15px]">
          <AccountCircle />
          <span className={GENERIC_PARAGRAPH}>{user}</span>
        </div>
      );
    });
  }
};

export default function ShareModal({
  docId,
  title,
  authorizedUsers,
  open,
  setOpen,
}: ShareModalProps) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      recipientName: "",
    },
  });
  const { isMobile } = useBreakpoints();
  const [shareAttempted, setShareAttempted] = useState(false);
  const [sent, setSent] = useState(false);
  const [doesNotExist, setDoesNotExist] = useState(false);
  const [alreadyShared, setAlreadyShared] = useState(false);
  const [inviteFailed, setInviteFailed] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

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

  const resetInviteStates = () => {
    setOpen(false);
    setShareAttempted(false);
    setSent(false);
    setDoesNotExist(false);
    setAlreadyShared(false);
    setInviteFailed(false);
  };

  const handleInvite = async (data: ShareFormData) => {
    if (!data.recipientName) {
      return null;
    }
    await fetchInvite(docId, data.recipientName);
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

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [setOpen]);

  if (!open) {
    return null;
  }

  return (
    <dialog
      ref={modalRef}
      className={
        !shareAttempted ? SHARE_MODAL_CONTAINER : SHARE_ATTEMPTED_CONTAINER
      }
    >
      <div className="flex flex-col items-left w-[296px] md:w-[404px] h-[362px] md:h-[301px] gap-[29px]">
        <h1 className={SHARE_HEADER}>
          Share "
          {title ? clipTitleForInvite(title, isMobile) : "Untitled Document"}"
        </h1>
        {!shareAttempted ? (
          <form
            className="flex flex-col gap-[29px]"
            onSubmit={handleSubmit(handleInvite)}
            autoComplete="off"
          >
            <div className="h-[69px]">
              <label htmlFor="shareInput" className={INPUT_FIELD_LABEL}>
                Enter username {/*TODO: "add email address or username"*/}
              </label>
              <input
                className={SHARE_INPUT_FIELD}
                id="shareInput"
                type="text"
                placeholder="Share your file"
                {...register("recipientName")}
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col items-left gap-[10px]">
              <span className={BOLD_TEXT_BLACK}>Accounts with access</span>
              <AuthorizedUsersList authorizedUsers={authorizedUsers} />
            </div>
            <div className="flex flex-col md:flex-row gap-[16px] md:justify-between">
              <button className={SHARE_BUTTON_GREEN} type="submit">
                Share
              </button>
              <button
                className={SHARE_BUTTON_GREEN}
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <span className={GENERIC_PARAGRAPH}>{inviteResponseText()}</span>
            <button
              className={SHARE_BUTTON_GREEN}
              onClick={() => {
                resetInviteStates();
              }}
            >
              OK
            </button>
          </>
        )}
      </div>
    </dialog>
  );
}
