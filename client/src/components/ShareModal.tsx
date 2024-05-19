import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { clipTitleForInvite } from "../utils/functions";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { ShareFormData, ShareModalProps } from "../utils/customTypes";
import RevokeX from "./RevokeX";
import { useVerificationCheck } from "../hooks/useVerificationCheck";
import { useEmailTokenManagement } from "../hooks/useEmailTokenManagement";
import CheckMark from "./CheckMark";
import { AccountCircleRounded } from "@mui/icons-material";
import {
  SHARE_ATTEMPTED_CONTAINER,
  SHARE_BUTTON_GREEN,
  SHARE_HEADER,
  SHARE_INPUT_FIELD,
  SHARE_MODAL_CONTAINER,
} from "../styles/InvitesStyles";
import {
  BOLD_GRAY_TEXT,
  BOLD_TEXT_BLACK,
  GENERIC_PARAGRAPH,
  INPUT_FIELD_LABEL,
  SUCCESS_CONTAINER,
  SUCCESS_CONTAINER_SMALL,
} from "../styles/GeneralStyles";

interface ListProps {
  authorizedUsers: string[];
  onDeleteUser: (userName: string) => void;
}
const AuthorizedUsersList = ({ authorizedUsers, onDeleteUser }: ListProps) => {
  return authorizedUsers.map((user: string) => {
    const key = authorizedUsers.indexOf(user);
    return (
      <div key={key} className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-[15px]">
          <AccountCircleRounded sx={{ fontSize: 30 }} />
          <span className={GENERIC_PARAGRAPH}>{user}</span>
        </div>
        <div key={key} className="flex flex-row items-center gap-[15px]">
          <span className="text-[18px] text-dustyGray font-IBM">Remove</span>
          <i className="mt-1" onClick={() => onDeleteUser(user)}>
            <RevokeX />
          </i>
        </div>
      </div>
    );
  });
};

export default function ShareModal({
  docId,
  title,
  authorizedUsers,
  onDeleteUser,
  open,
  setOpen,
}: ShareModalProps) {
  const { sendNewEmailToken, sent } = useEmailTokenManagement();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      recipientName: "",
    },
  });
  const { isMobile } = useBreakpoints();
  const [shareAttempted, setShareAttempted] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [doesNotExist, setDoesNotExist] = useState(false);
  const [alreadyShared, setAlreadyShared] = useState(false);
  const [inviteFailed, setInviteFailed] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);
  const { verified } = useVerificationCheck();

  const fetchInvite = async (docId: number | undefined, recipient: string) => {
    try {
      const response = await fetch("/api/invites/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ docId: docId, recipient: recipient }),
      });
      const { message } = await response.json();
      setShareAttempted(true);
      switch (message) {
        case "Invite sent":
          return setInviteSent(true);
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
    setInviteSent(false);
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
    if (inviteSent) {
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
        {!shareAttempted && verified ? (
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
            {authorizedUsers && authorizedUsers.length > 0 && onDeleteUser && (
              <div className="flex flex-col items-left gap-[10px]">
                <span className={BOLD_TEXT_BLACK}>Accounts with access</span>
                <AuthorizedUsersList
                  authorizedUsers={authorizedUsers}
                  onDeleteUser={onDeleteUser}
                />
              </div>
            )}

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
            <span className={GENERIC_PARAGRAPH}>
              {!verified && "You must verify your account to use this feature"}
              {inviteResponseText()}
            </span>
            <div className="flex flex-col md:flex-row gap-[16px] md:justify-between">
              {!verified && (
                <button
                  className={SHARE_BUTTON_GREEN}
                  onClick={() => {
                    sendNewEmailToken();
                  }}
                >
                  Send email
                </button>
              )}
              <button
                className={SHARE_BUTTON_GREEN}
                onClick={() => {
                  resetInviteStates();
                }}
              >
                {!verified ? "Cancel" : "OK"}
              </button>
            </div>
            {sent && (
              <div
                className={
                  isMobile ? SUCCESS_CONTAINER_SMALL : SUCCESS_CONTAINER
                }
              >
                <CheckMark />
                <span className={BOLD_GRAY_TEXT}>Email sent</span>
              </div>
            )}
          </>
        )}
      </div>
    </dialog>
  );
}
