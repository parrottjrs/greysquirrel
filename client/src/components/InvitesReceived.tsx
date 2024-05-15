import { useEffect, useState } from "react";
import { clipText, formatDate } from "../utils/functions";
import { BOLD_TEXT_BLACK } from "../styles/GeneralStyles";
import { Invite } from "../utils/customTypes";
import {
  GREEN_BUTTON,
  PENDING_INVITE,
  RED_BUTTON,
  SHARE_DATE_TEXT,
} from "../styles/InvitesStyles";

export default function InvitesRecieved() {
  const [invites, setInvites] = useState<Invite[]>([]);

  const filterInvites = (id: number) => {
    setInvites((prevInvites) =>
      prevInvites.filter((invite) => invite.invite_id !== id)
    );
  };

  const fetchInvites = async () => {
    try {
      const response = await fetch("/api/invites-received");
      const json = await response.json();
      if (json.success) {
        setInvites(json.invites);
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const deleteInvite = async (id: number) => {
    try {
      const response = await fetch("/api/invite", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ inviteId: id }),
      });
      if (response.ok) {
        filterInvites(id);
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const acceptInvite = async (
    inviteId: number,
    docId: number,
    senderId: number,
    recipientId: number
  ) => {
    try {
      await fetch("/api/accept-invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          inviteId: inviteId,
          docId: docId,
          senderId: senderId,
          recipientId: recipientId,
        }),
      });
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleAccept = async (
    inviteId: any,
    docId: any,
    senderId: any,
    recipientId: any
  ) => {
    await acceptInvite(inviteId, docId, senderId, recipientId);
    await deleteInvite(inviteId);
  };

  const handleDelete = async (inviteId: any) => {
    await deleteInvite(inviteId);
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  return invites.map((invite: Invite) => {
    const {
      invite_id,
      doc_id,
      sender_name,
      sender_id,
      recipient_id,
      title,
      share_date,
    } = invite;

    const formattedShareDate = formatDate(share_date);

    const newTitle = title ? clipText(title, "title") : "Untitled";
    return (
      <div className={PENDING_INVITE} key={invite_id}>
        <p className={`${BOLD_TEXT_BLACK} m-0`}>
          <span className="underline">{sender_name}</span> shared "{newTitle}"
          with you.
        </p>

        <div className="flex flex-row gap-[15px]">
          <button
            aria-label="accept-invitation"
            className={GREEN_BUTTON}
            onClick={() =>
              handleAccept(invite_id, doc_id, sender_id, recipient_id)
            }
          >
            accept
          </button>
          <button
            aria-label="decline-invitation"
            className={RED_BUTTON}
            onClick={() => handleDelete(invite_id)}
          >
            decline
          </button>
        </div>
        <p className={`${SHARE_DATE_TEXT} m-0`}>
          Date shared: {formattedShareDate}
        </p>
      </div>
    );
  });
}
